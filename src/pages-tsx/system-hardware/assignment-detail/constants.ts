import { assets, assignments } from "@/data/systemHardware";
import type { Assignment, AssignmentStatus } from "@/data/systemHardware";
import { BOOKING_DETAILS } from "@/pages-tsx/system-hardware/assignment-list/constants";
import type {
  AssetRowStatus,
  AssignmentAssetRow,
  AssignmentBookingRow,
  AssignmentVariant,
  BookingFilters,
  TrainingSlot,
} from "./types";

export const PER_PAGE = 10;

/**
 * Figma ships three Assignment Details screens and the difference is driven by
 * the assignment's type, not by its status:
 *
 *   Booking         5839:148780 — adds Booking ID + Base Stations to the details
 *                                 card and Target Base Station to the table;
 *                                 the only action is Top Up Asset.
 *   Administration  5892:300734 — adds Issued Reason to the issuance card,
 *   Maintenance     5892:302729   drops the two booking fields and the Target
 *                                 Base Station column, and adds a primary
 *                                 "Ready For Return Assets" action.
 *
 * `Base Station` exists in the code's assignmentTypes but has no Figma screen.
 * It is booking-shaped (it carries base stations), so it renders the Booking
 * variant; the Booking ID row simply has nothing to show. Flagged to the PO.
 */
export function variantOf(assignment: Assignment): AssignmentVariant {
  if (assignment.assignmentType === "Administration") return "Administration";
  if (assignment.assignmentType === "Maintenance") return "Maintenance";
  return "Booking";
}

export function findAssignment(assignmentId: string | null): Assignment | undefined {
  if (!assignmentId) return assignments[0];
  return (
    assignments.find((a) => a.assignmentId === assignmentId) ??
    assignments.find((a) => a.id === assignmentId) ??
    assignments[0]
  );
}

/**
 * The asset rows shown under an assignment. The mock has no assignment→asset
 * join table, so the rows are taken from the asset pool in order, `assetQty` of
 * them, and each is pinned to one of the assignment's base stations. Deliberate
 * and stated, rather than a join pretending to be real.
 */
export function assetRowsFor(assignment: Assignment): AssignmentAssetRow[] {
  const stations = assignment.baseStations.length ? assignment.baseStations : ["—"];
  const returned = RETURNED_ASSETS[assignment.id];
  return assets.slice(0, assignment.assetQty).map((a, i) => ({
    ...a,
    no: i + 1,
    rowStatus: returned?.has(a.id) ? "Returned" : rowStatusFor(assignment.status),
    issuedOn: assignment.issuedDate ?? "—",
    targetBaseStation: stations[i % stations.length],
  }));
}

/** Asset badge for every row, from the assignment's status (Figma 5839:148778
 *  Issued · 5890:296242 Pending Return · 6998:255012 Missing → Not Returned). */
export function rowStatusFor(status: AssignmentStatus): AssetRowStatus {
  if (status === "Returned" || status === "Ownership Transferred") return "Returned";
  if (status === "Pending Return" || status === "Return Assets") return "Pending Return";
  if (status === "Missing" || status === "Not Returned") return "Not Returned";
  return "Issued";
}

/**
 * F-009 Scan & Return: assets scanned back on a partial return (5895:412469 — "118 assets
 * returned", the assignment stays Pending Return with those rows Returned). Keyed by assignment id.
 */
const RETURNED_ASSETS: Record<string, Set<string>> = {};

export function markAssetsReturned(id: string, assetIds: string[]) {
  const set = (RETURNED_ASSETS[id] ??= new Set());
  assetIds.forEach((a) => set.add(a));
}

/**
 * Status changes made on Assignment Details (Ready For Return, Mark as
 * Missing) are written back onto the shared mock record, so the Assignment
 * List shows them after "back" — the list seeds its state from this array.
 */
export function setAssignmentStatus(id: string, status: AssignmentStatus) {
  const rec = assignments.find((a) => a.id === id);
  if (rec) rec.status = status;
}

/* ── Bookings tab (Figma 6991:172117) ─────────────────────────────────────── */

/**
 * BOOKING_DETAILS has no courseware or weapon list, so each booking's
 * courseware (and the weapon types it draws) is mocked here. Rows are booking ×
 * courseware, as Figma's "Collective Training…" rows are.
 */
const BOOKING_COURSEWARE: Record<string, { courseware: string; weaponTypes: string[] }[]> = {
  // One courseware each, matching BOOKING_DETAILS.coursewareCount (the list's
  // "· 1 CW"); a booking with more would simply give more rows.
  "BK-2026-001": [
    { courseware: "Blockforce Training", weaponTypes: ["Claymore", "SAR21", "M110", "LMG"] },
  ],
  "BK-2026-002": [{ courseware: "APS (SAR21/LMG)", weaponTypes: ["SAR21", "LMG"] }],
  "BK-2026-003": [{ courseware: "Judgemental Shooting A", weaponTypes: ["SAR21"] }],
  "BK-2026-004": [{ courseware: "BTP (SAR21)", weaponTypes: ["SAR21"] }],
  "BK-2026-005": [{ courseware: "ATP (M) (SAR21/LMG)", weaponTypes: ["SAR21", "LMG"] }],
  "BK-2026-006": [{ courseware: "ATP (SP) (SAR21/LMG)", weaponTypes: ["SAR21", "LMG"] }],
  "BK-2026-007": [{ courseware: "Judgemental Shooting B", weaponTypes: ["SAR21"] }],
  "BK-2026-008": [{ courseware: "Judgemental Shooting C", weaponTypes: ["SAR21", "M110"] }],
  "BK-2026-009": [{ courseware: "Blockforce Training", weaponTypes: ["Claymore", "SAR21"] }],
};

/** Courseware options of Figma's `Drawer - Filter` (6994:180846), in order. */
export const COURSEWARE_OPTIONS = [
  "Blockforce Training",
  "Component Type Training (A-E)",
  "Judgemental Shooting A",
  "Judgemental Shooting B",
  "Judgemental Shooting C",
  "APS (SAR21/LMG)",
  "ATP (M) (SAR21/LMG)",
  "ATP (SP) (SAR21/LMG)",
  "BTP (SAR21)",
];

export const TRAINING_SLOT_OPTIONS: TrainingSlot[] = [
  "AM Session",
  "PM Session",
  "Full Day",
  "Hourly",
  "Ad-hoc",
];

export const EMPTY_BOOKING_FILTERS: BookingFilters = {
  dateFrom: "",
  dateTo: "",
  slots: [],
  courseware: [],
};

export function countBookingFilters(f: BookingFilters): number {
  return (f.dateFrom ? 1 : 0) + (f.dateTo ? 1 : 0) + f.slots.length + f.courseware.length;
}

const pad = (t: string) => t.replace(/^(\d):/, "0$1:");

/** "22 Apr 2026\n(22 Apr) 8:00 AM – (22 Apr) 12:00 PM (AM Session)" →
 *  date "22 Apr 2026", slot "AM Session", label "AM Session (08:00 AM - 12:00 PM)". */
function parseBookingTime(raw: string): Pick<AssignmentBookingRow, "date" | "isoDate" | "slot" | "slotLabel"> {
  const [date = "—", rest = ""] = raw.split("\n");
  const times = rest.match(/\d{1,2}:\d{2} [AP]M/g) ?? [];
  const tag = rest.match(/\(([^()]*)\)\s*$/)?.[1] ?? "";
  const slot: TrainingSlot = /AM Session/i.test(tag)
    ? "AM Session"
    : /PM Session/i.test(tag)
      ? "PM Session"
      : /Full Day/i.test(tag)
        ? "Full Day"
        : /Hourly/i.test(tag)
          ? "Hourly"
          : "Ad-hoc";
  const [t0, t1] = times;
  const range = t0 && t1 ? ` (${pad(t0)} - ${pad(t1)})` : "";
  const d = new Date(date);
  const isoDate = Number.isNaN(d.getTime())
    ? ""
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { date, isoDate, slot, slotLabel: `${slot}${range}` };
}

/** Every booking of the assignment — what the old Assignment List expand row
 *  showed — one row per booking × courseware. */
export function bookingRowsFor(assignment: Assignment): AssignmentBookingRow[] {
  const rows: AssignmentBookingRow[] = [];
  for (const key of assignment.bookings) {
    const b = BOOKING_DETAILS[key];
    if (!b) continue;
    const time = parseBookingTime(b.bookingTime);
    const cws = BOOKING_COURSEWARE[key] ?? [{ courseware: b.trainingMode, weaponTypes: [] }];
    for (const cw of cws) {
      rows.push({
        no: rows.length + 1,
        bookingKey: key,
        program: b.program,
        bookingId: b.bookingId,
        courseware: cw.courseware,
        ...time,
        status: b.status,
        weaponTypes: cw.weaponTypes,
        baseStations: assignment.baseStations,
      });
    }
  }
  return rows;
}

export function matchesBookingFilters(r: AssignmentBookingRow, f: BookingFilters): boolean {
  if (f.dateFrom && (!r.isoDate || r.isoDate < f.dateFrom)) return false;
  if (f.dateTo && (!r.isoDate || r.isoDate > f.dateTo)) return false;
  if (f.slots.length && !f.slots.includes(r.slot)) return false;
  if (f.courseware.length && !f.courseware.includes(r.courseware)) return false;
  return true;
}
