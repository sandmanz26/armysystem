// Scan Assets — Top Up and Scan & Return modes (F-009, SH-4 / SH-27 / SH-18 / BD-14 / BD-20).
//
// The Issue scan page (`/bookings/issue-assets`, `/system-hardware/issue-assets`) takes
// `mode=topup|return`; without it (or `mode=issue`) the page is the unchanged Issue flow.
//
//   Top Up (Booking)        5895:360297 Empty · 5895:360312 Filled · toast 5895:360327 "Top up asset issued"
//   Top Up (Admin & Maint)  5895:368080 / 5895:368095 Empty · 5895:368110 / 5895:368125 Filled Expand
//   Return (Booking)        5895:412248 … 5895:412415 · error 5895:412431 · wrong item 5895:412448 ·
//                           confirm 5895:412450 · toast 5895:412469 "{n} assets returned"
//   Return (Admin & Maint)  5895:423080 … 5895:423116 (confirm 5895:423109 drops "and complete the booking(s)")
//
// F-010 (SH-3 / SH-15 / SH-16): `issue` (no `mode`) is the same page — Scan Assets for Training /
// Administration / Maintenance (5869:43262 … 5869:43331, Multiple CW 8091:191587 …, Admin 5413:262520 …).
//
// URL params
//   mode          topup | return | (absent = issue)
//   cw            issue, Booking: the ticked courseware keys `<bookingId>::<index>,…` from Create Assignment
//   type          issue, Admin & Maintenance: `Administration` | `Maintenance`
//   reason        issue, Admin & Maintenance: the issuing reason (shown under the page title)
//   assignmentId  System Hardware assignment (ASG-…)  — Assignment Details / Assignment List entry points
//   bookingIds    Booking 2.0 booking id               — Booking Details entry points
//   courseware    courseware name(s) of a multi-courseware top up (Select Assignment, 6829:38601)
//   returnTo      the page to go back to (X, or after confirming) — the flow returns where it started
//
// There is no backend: the result is written to the shared mocks (System Hardware assignment)
// or to the Booking Details post-session store (sessionStorage), and the destination page
// shows the toast through `scanFlash`.
import { bookings, type Booking } from "@/data/mock";
import { assets as ASSET_POOL, assignments as ASSIGNMENTS, type Assignment } from "@/data/systemHardware";
import { calendarMockBookings } from "@/pages-tsx/booking-2/list/calendarMock";
import { getCreatedBookings } from "@/pages-tsx/booking-2/create/createdBookings";
import { detailMockBookings, MOCK_ASSET_COUNT } from "@/pages-tsx/booking-2/detail/components/detailMocks";
import { readPostSession, writePostSession } from "@/pages-tsx/booking-2/detail/components/postSession";
import {
  assetRowsFor,
  findAssignment,
  markAssetsReturned,
  setAssignmentStatus,
  variantOf,
} from "@/pages-tsx/system-hardware/assignment-detail/constants";
import { buildCoursewareGroups } from "@/components/issue-asset/CoursewareTable";
import { FLAT_STATION_OPTIONS } from "./constants";
import type { ScanMode, ScannedAsset } from "./types";

export function readScanMode(): ScanMode {
  const search = window.location.search || window.location.hash.replace(/^[^?]*/, "");
  const m = new URLSearchParams(search).get("mode");
  return m === "topup" || m === "return" ? m : "issue";
}

/** One row of the right-hand panel: Target Qty per asset type. `baseline` = already issued
 *  before this top up (counted into Qty Scanned, as Figma's 103/120 shows before any scan). */
export interface ScanTarget {
  type: string;
  target: number;
  baseline: number;
  /** Per-station targets for the By Station view. */
  byStation: Record<string, number>;
}

/** One courseware of a multi-courseware issue — the "Courseware" picker of the Assets to Withdraw panel. */
export interface ScanCourseware {
  key: string;
  label: string;
  /** "#251104-WPT013 · 24 Nov 2025 · AM Session (…)" — Figma "Showing: …". */
  sub: string;
  targets: ScanTarget[];
}

export interface ScanContext {
  mode: ScanMode;
  /** Booking-shaped screen (base station column, Overall / By Station panel) or the
   *  Administration & Maintenance one (no station column, "Summary" panel). */
  kind: "booking" | "admin";
  headerTitle: string;
  confirmLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  panelTitle: string;
  /** Assignment ID as shown in copy, with "#". */
  assignmentLabel: string;
  stationOptions: string[];
  targets: ScanTarget[];
  /** Assets the RFID reader "reads", in order (the prototype simulates the reader). */
  scanQueue: ScannedAsset[];
  /** An asset that is not part of this assignment, read once mid-scan (Return 5895:412448, Issue 5869:43295). */
  wrongItem?: string;
  returnTo: string;
  /** Where Confirm leads when that differs from `returnTo` (Issue: Booking Details / Assignment List). */
  doneTo?: string;
  /** Issue with 2+ courseware: the Courseware picker (Figma "All Courseware", 8091:191587). */
  coursewares?: ScanCourseware[];
  /** Applies the result to the mocks and returns the toast for the destination page. */
  complete: (scanned: ScannedAsset[]) => string;
}

const pad4 = (n: number) => String(n).padStart(4, "0");

function weaponAsset(type: string, i: number, seq: number, station: string, status: ScannedAsset["status"]): ScannedAsset {
  return {
    id: `scan-${type}-${seq}`,
    no: i + 1,
    name: `${type} #${pad4(seq)}`,
    assetTagId: "",
    assetType: type,
    assetCategory: "Weapon",
    status,
    targetBaseStation: station,
    targetLane: "",
  };
}

const findBooking = (id: string | null): Booking | undefined =>
  id ? [...getCreatedBookings(), ...bookings, ...calendarMockBookings, ...detailMockBookings].find((b) => b.id === id) : undefined;

function groupTargets(rows: { assetType: string; station: string }[], baselineToo: boolean): ScanTarget[] {
  const map = new Map<string, ScanTarget>();
  for (const r of rows) {
    const t = map.get(r.assetType) ?? { type: r.assetType, target: 0, baseline: 0, byStation: {} };
    t.target += 1;
    if (baselineToo) t.baseline += 1;
    t.byStation[r.station] = (t.byStation[r.station] ?? 0) + 1;
    map.set(r.assetType, t);
  }
  return [...map.values()];
}

function renumber(list: ScannedAsset[]): ScannedAsset[] {
  return list.map((a, i) => ({ ...a, no: i + 1 }));
}

/* ── System Hardware assignment (Assignment Details / Assignment List) ─────────────── */

function assignmentContext(mode: "topup" | "return", a: Assignment, returnTo: string): ScanContext {
  const kind = variantOf(a) === "Booking" ? "booking" : "admin";
  const label = `#${a.assignmentId}`;
  const rows = assetRowsFor(a);
  const stations = a.baseStations.length ? a.baseStations : FLAT_STATION_OPTIONS.slice(0, 1);
  const toScan = (r: (typeof rows)[number], i: number, status: ScannedAsset["status"]): ScannedAsset => ({
    id: r.id,
    no: i + 1,
    name: r.name,
    assetTagId: r.assetTagId ?? "",
    assetType: r.assetType,
    assetCategory: r.assetCategory,
    status,
    targetBaseStation: r.targetBaseStation,
    targetLane: "",
  });

  const adminTitle = `Scan Assets for ${variantOf(a)}`;

  if (mode === "topup") {
    // The next assets of the mock pool — Assignment Details lists the pool in order, so after
    // the top up the same assets appear there (assetQty grows by the number confirmed).
    const extra = ASSET_POOL.slice(a.assetQty, a.assetQty + 2).map((p, i) =>
      toScan({ ...p, no: 0, rowStatus: "Issued", issuedOn: "", targetBaseStation: stations[0] }, i, "Available"),
    );
    return {
      mode,
      kind,
      headerTitle: "Issued Assets",
      confirmLabel: "Confirm Issue Assets",
      pageTitle: kind === "booking" ? "Scan Assets for Training" : adminTitle,
      pageSubtitle: kind === "booking" ? label : a.issuedReason ?? label,
      panelTitle: kind === "booking" ? "Assets to Withdraw" : "Summary",
      assignmentLabel: label,
      stationOptions: stations,
      targets: groupTargets(rows.map((r) => ({ assetType: r.assetType, station: r.targetBaseStation })), true),
      scanQueue: extra,
      returnTo,
      complete: (scanned) => {
        a.assetQty += scanned.length;
        return "Top up asset issued";
      },
    };
  }

  const outstanding = rows.filter((r) => r.rowStatus !== "Returned");
  return {
    mode,
    kind,
    headerTitle: "Return Assets",
    confirmLabel: "Confirm Return Assets",
    pageTitle: "Scan & Return Assets",
    pageSubtitle: label,
    panelTitle: "Assets to Return",
    assignmentLabel: label,
    stationOptions: stations,
    targets: groupTargets(outstanding.map((r) => ({ assetType: r.assetType, station: r.targetBaseStation })), false),
    scanQueue: renumber(outstanding.map((r, i) => toScan(r, i, "Pending Return"))),
    wrongItem: "M4 #0231",
    returnTo,
    complete: (scanned) => {
      markAssetsReturned(a.id, scanned.map((s) => s.id));
      if (scanned.length >= outstanding.length) {
        setAssignmentStatus(a.id, "Returned");
        a.returnedDate = returnedNow();
      }
      return `${scanned.length} ${scanned.length === 1 ? "asset" : "assets"} returned`;
    },
  };
}

function returnedNow() {
  const d = new Date();
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = d.getHours() % 12 || 12;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()} ${p(h)}:${p(d.getMinutes())}:${p(d.getSeconds())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
}

/* ── Booking 2.0 booking (Booking Details entry points) ──────────────────────────────── */

function bookingContext(mode: "topup" | "return", b: Booking, courseware: string | null, assignmentParam: string | null, returnTo: string): ScanContext {
  const label = assignmentParam || (b.assignmentId && b.assignmentId !== "-" ? b.assignmentId : b.bookingId);
  const stations = b.assignedStations?.length ? b.assignedStations : FLAT_STATION_OPTIONS.slice(0, 1);
  const weapons = b.weaponList?.length
    ? b.weaponList
    : [{ type: "SAR21", quantity: MOCK_ASSET_COUNT[b.id] ?? 10 }];
  // Spread each weapon's quantity over the booking's stations (By Station view).
  const issuedRows: { assetType: string; station: string }[] = [];
  weapons.forEach((w) => {
    for (let i = 0; i < w.quantity; i++) issuedRows.push({ assetType: w.type, station: stations[i % stations.length] });
  });
  const subtitle = courseware ? `${label} · ${courseware}` : label;

  if (mode === "topup") {
    const first = weapons[0].type;
    const second = weapons[1]?.type ?? first;
    const queue = renumber([
      weaponAsset(first, 0, 801, stations[0], "Available"),
      weaponAsset(first, 1, 802, stations[0], "Available"),
      weaponAsset(second, 2, 803, stations[0], "Available"),
    ]);
    return {
      mode,
      kind: "booking",
      headerTitle: "Issued Assets",
      confirmLabel: "Confirm Issue Assets",
      pageTitle: "Scan Assets for Training",
      pageSubtitle: subtitle,
      panelTitle: "Assets to Withdraw",
      assignmentLabel: label,
      stationOptions: stations,
      targets: groupTargets(issuedRows, true),
      scanQueue: queue,
      returnTo,
      complete: () => "Top up asset issued",
    };
  }

  const stored = readPostSession(b.id);
  const already = new Set(stored.returnedIds ?? []);
  let seq = 100;
  const all = issuedRows.map((r, i) => weaponAsset(r.assetType, i, (seq += 37), r.station, "Pending Return"));
  const outstanding = renumber(all.filter((a) => !already.has(a.id)));
  return {
    mode,
    kind: "booking",
    headerTitle: "Return Assets",
    confirmLabel: "Confirm Return Assets",
    pageTitle: "Scan & Return Assets",
    pageSubtitle: label,
    panelTitle: "Assets to Return",
    assignmentLabel: label,
    stationOptions: stations,
    targets: groupTargets(
      outstanding.map((a) => ({ assetType: a.assetType, station: a.targetBaseStation })),
      false,
    ),
    scanQueue: outstanding,
    wrongItem: "M4 #0231",
    returnTo,
    complete: (scanned) => {
      const returnedIds = [...already, ...scanned.map((s) => s.id)];
      const full = scanned.length >= outstanding.length;
      const status = stored.status ?? b.status;
      if (full) {
        writePostSession(b.id, {
          phase: "returned",
          status: status === "Return Assets" ? "Completed" : status,
          returnedIds,
        });
      } else {
        writePostSession(b.id, {
          // Booking stays Return Assets with a partial return → Complete With Missing Assets (6501:244728).
          phase: status === "Return Assets" ? "partial-return" : stored.phase,
          returnedIds,
        });
      }
      return `${scanned.length} ${scanned.length === 1 ? "asset" : "assets"} returned`;
    },
  };
}

export function buildScanContext(mode: ScanMode): ScanContext {
  if (mode === "issue") return issueContext();
  const search = window.location.search || window.location.hash.replace(/^[^?]*/, "");
  const p = new URLSearchParams(search);
  const bookingId = p.get("bookingIds")?.split(",")[0] ?? null;
  const assignmentId = p.get("assignmentId");
  const booking = findBooking(bookingId);
  if (booking) {
    const returnTo = p.get("returnTo") || `/bookings/detail?id=${booking.id}`;
    return bookingContext(mode, booking, p.get("courseware"), assignmentId, returnTo);
  }
  const a = findAssignment(assignmentId);
  const returnTo = p.get("returnTo") || `/system-hardware/assignment-detail?assignmentId=${a?.assignmentId ?? ""}`;
  if (!a) {
    // No record at all: an empty top up / return against nothing — still exits cleanly.
    return {
      mode, kind: "booking", headerTitle: mode === "topup" ? "Issued Assets" : "Return Assets",
      confirmLabel: mode === "topup" ? "Confirm Issue Assets" : "Confirm Return Assets",
      pageTitle: mode === "topup" ? "Scan Assets for Training" : "Scan & Return Assets",
      pageSubtitle: "", panelTitle: mode === "topup" ? "Assets to Withdraw" : "Assets to Return",
      assignmentLabel: "", stationOptions: FLAT_STATION_OPTIONS, targets: [], scanQueue: [], returnTo,
      complete: () => "",
    };
  }
  return assignmentContext(mode, a, returnTo);
}


/* ── Issue (F-010): Create Assignment → Scan Assets ──────────────────────────────────── */

function nextAssignmentLabel(): string {
  const max = ASSIGNMENTS.reduce((n, a) => Math.max(n, Number(a.assignmentId.split("-").pop()) || 0), 0);
  return `#ASG-2026-${pad4(max + 1)}`;
}

function issueContext(): ScanContext {
  const search = window.location.search || window.location.hash.replace(/^[^?]*/, "");
  const p = new URLSearchParams(search);
  const type = p.get("type");
  const returnTo = p.get("returnTo") || "/system-hardware/assignment-list";
  const label = nextAssignmentLabel();

  // Administration & Maintenance (Figma 5413:262520 / 5499:88080): reason as subtitle, a Summary panel,
  // no base-station column. Any asset may be scanned — there is no target list.
  if (type === "Administration" || type === "Maintenance") {
    const queue = ASSET_POOL.slice(0, 5).map((a, i) => ({
      id: `issue-${a.id}`,
      no: i + 1,
      name: a.name,
      assetTagId: a.assetTagId ?? "",
      assetType: a.assetType,
      assetCategory: a.assetCategory,
      status: "Available" as const,
      targetBaseStation: "",
      targetLane: "",
    }));
    return {
      mode: "issue",
      kind: "admin",
      headerTitle: "Issued Assets",
      confirmLabel: "Confirm Issue Assets",
      pageTitle: `Scan Assets for ${type}`,
      pageSubtitle: p.get("reason") ?? "",
      panelTitle: "Summary",
      assignmentLabel: label,
      stationOptions: [],
      targets: [],
      scanQueue: queue,
      returnTo,
      doneTo: "/system-hardware/assignment-list",
      complete: () => "Assignment issued",
    };
  }

  const ids = (p.get("bookingIds") ?? "").split(",").filter(Boolean);
  const involved = ids.map((id) => findBooking(id)).filter((b): b is Booking => !!b);
  const keys = (p.get("cw") ?? "").split(",").filter(Boolean);
  const stations = [...new Set(involved.flatMap((b) => b.assignedStations ?? []))];
  const stationList = stations.length ? stations : [p.get("baseStation") || FLAT_STATION_OPTIONS[0]];

  const rowsOf = (b: Booking) => {
    const weapons = b.weaponList?.length ? b.weaponList : [{ type: "SAR21", quantity: MOCK_ASSET_COUNT[b.id] ?? 10 }];
    const own = b.assignedStations?.length ? b.assignedStations : stationList;
    const rows: { assetType: string; station: string }[] = [];
    weapons.forEach((w) => {
      for (let i = 0; i < w.quantity; i++) rows.push({ assetType: w.type, station: own[i % own.length] });
    });
    return rows;
  };
  const allRows = involved.flatMap(rowsOf);

  // One option per ticked courseware (all of a booking's courseware when `cw` is absent).
  const groups = buildCoursewareGroups(involved);
  const picked = groups.flatMap((g) => g.rows.map((r) => ({ g, r }))).filter(({ r }) => !keys.length || keys.includes(r.key));
  const coursewares: ScanCourseware[] = picked.map(({ g, r }) => ({
    key: r.key,
    label: r.name,
    sub: `${g.bookingLabel} · ${r.schedule}`,
    targets: groupTargets(rowsOf(involved.find((b) => b.id === g.bookingId)!), false),
  }));

  // The reader "reads" every required asset, plus one more of the first type — so Figma's
  // `Above Target Qty` banner (5869:43270) and the remove flow (5869:43305) can be reached.
  let seq = 100;
  const queue = allRows.map((r, i) => weaponAsset(r.assetType, i, (seq += 37), r.station, "Available"));
  if (queue.length) queue.push(weaponAsset(queue[0].assetType, queue.length, (seq += 37), queue[0].targetBaseStation, "Available"));

  return {
    mode: "issue",
    kind: "booking",
    headerTitle: "Issued Assets",
    confirmLabel: "Confirm Issue Assets",
    pageTitle: "Scan Assets for Training",
    pageSubtitle: label,
    panelTitle: "Assets to Withdraw",
    assignmentLabel: label,
    stationOptions: stationList,
    targets: groupTargets(allRows, false),
    scanQueue: renumber(queue),
    wrongItem: queue.length ? "M4 #0231" : undefined,
    returnTo,
    doneTo: involved[0] ? `/bookings/detail?id=${involved[0].id}` : "/bookings/list",
    coursewares: coursewares.length > 1 ? coursewares : undefined,
    complete: () => "Assignment issued",
  };
}

/* ── Toast hand-off to the page the flow returns to ───────────────────────────────── */

const FLASH_KEY = "toms.scanFlash";

export function setScanFlash(target: string, message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ path: target.split("?")[0], message }));
  } catch {
    /* storage unavailable — the toast is simply skipped */
  }
}

/** The pending toast for the current page, if any (removed once read). */
export function takeScanFlash(): string | null {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return null;
    const { path, message } = JSON.parse(raw) as { path: string; message: string };
    if (path !== window.location.pathname) return null;
    sessionStorage.removeItem(FLASH_KEY);
    return message || null;
  } catch {
    return null;
  }
}

/** Builds the scan page URL for an entry point. */
export function scanUrl(
  base: "/bookings/issue-assets" | "/system-hardware/issue-assets",
  mode: "topup" | "return",
  params: Record<string, string | undefined>,
  returnTo: string,
): string {
  const q = new URLSearchParams({ mode });
  Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
  q.set("returnTo", returnTo);
  return `${base}?${q.toString()}`;
}
