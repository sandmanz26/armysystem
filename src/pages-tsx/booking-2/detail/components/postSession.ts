// Booking 2.0 — Booking Details after the session (F-006, BD-3 / BD-23).
//
// Figma keys the header action off the booking status AND the Assignment status
// (PRD-WPT §11.1, rewritten v0.55 from these frames):
//
//   Return Assets  · Pending Return  5029:54570  Ready For Return Assets      ⋮ View Training Result
//   Return Assets  · Return Assets   5831:62299  Return Assets                ⋮ View Training Result
//   Return Assets  · partial return  6501:244728 Complete With Missing Assets + Return Assets  ⋮ View Training Result
//   Completed      · Returned        5029:55565  View Training Result         (no ⋮)
//   Completed | Missing · Missing    5831:64203  View Training Result         (no ⋮)
//   Cancelled      · Not Issued      5029:56038  —
//   Overdue        · Not Issued      5029:56504  —
//   Overdue        · Issued          6591:303321 Ready For Return Assets      (no ⋮)
//   Overdue        · Pending Return  6591:304050 Return Assets                (no ⋮)
//   Overdue        · Returned        6591:307402 —
//
// None of these frames has a Reassign button on Base Station / Briefing Room rows.
import type { Booking, BookingStatus } from "@/data/mock";
import type { BadgeTone } from "@/components/status-badge";
import { MOCK_POST_SESSION_PHASE } from "./detailMocks";

export type PostSessionPhase =
  | "not-issued"
  | "issued"
  | "pending-return"
  | "return-assets"
  | "partial-return"
  | "returned"
  | "missing"
  /** F-012 (BD-19): Ready For Return on a courseware whose assets move to its sibling courseware's assignment. */
  | "ownership-transferred";

const POST_SESSION: BookingStatus[] = ["Return Assets", "Completed", "Completed with Missing Assets", "Cancelled", "Overdue"];

export const isPostSessionStatus = (s: BookingStatus) => POST_SESSION.includes(s);

/**
 * F-009: post-session changes (Ready For Return, Return Assets scan, Complete With Missing) are
 * kept per booking in sessionStorage, so they survive the round trip to the Scan & Return page
 * and back. `returnedIds` = assets already scanned back (a second Return pass expects the rest).
 */
export interface PostSessionStored {
  phase?: PostSessionPhase;
  status?: BookingStatus;
  returnedIds?: string[];
  /** F-012 (BD-19): `MultiCw.index` of the courseware whose assets were handed to its sibling. */
  transferFrom?: number;
}

const storeKey = (bookingId: string) => `toms.postSession.${bookingId}`;

export function readPostSession(bookingId: string): PostSessionStored {
  try {
    return JSON.parse(sessionStorage.getItem(storeKey(bookingId)) ?? "{}") as PostSessionStored;
  } catch {
    return {};
  }
}

export function writePostSession(bookingId: string, patch: PostSessionStored) {
  try {
    sessionStorage.setItem(storeKey(bookingId), JSON.stringify({ ...readPostSession(bookingId), ...patch }));
  } catch {
    /* storage unavailable — the change lives only on this page */
  }
}

export function initialPhase(booking: Booking, status: BookingStatus): PostSessionPhase {
  const stored = readPostSession(booking.id).phase;
  if (stored) return stored;
  const seeded = MOCK_POST_SESSION_PHASE[booking.id];
  if (seeded) return seeded;
  switch (status) {
    case "Return Assets": return "pending-return";
    case "Completed": return "returned";
    case "Completed with Missing Assets": return "missing";
    case "Overdue": return booking.assetIssued ? "issued" : "not-issued";
    default: return "not-issued";
  }
}

/** Figma `Badge - Assignment Status` caption + tone per phase. */
export const ASSIGNMENT_BADGE: Record<PostSessionPhase, { label: string; tone: BadgeTone }> = {
  "not-issued": { label: "Not Issued", tone: "warning" },
  issued: { label: "Issued", tone: "purple" },
  "pending-return": { label: "Pending Return", tone: "warning" },
  "return-assets": { label: "Return Assets", tone: "warning" },
  "partial-return": { label: "Return Assets", tone: "warning" },
  returned: { label: "Returned", tone: "success" },
  missing: { label: "Missing", tone: "danger" },
  "ownership-transferred": { label: "Ownership Transferred", tone: "success" },
};

export interface SessionTimes {
  start: { primary: string; secondary?: string };
  end: { primary: string; secondary?: string };
  /** Undefined = the frame has no Total Duration field. */
  duration?: string;
}

const MIN = 60_000;

function parseClock(s: string): { h: number; m: number } | null {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { h, m: Number(m[2]) };
}

function clockLabel(d: Date) {
  const h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
}

/**
 * Session Start / End / Total Duration of the Courseware Details card. The mock has no recorded
 * session times, so a session that ran is shown as Figma's sample does: started one minute
 * after the slot opened, ran 3h 30m. The FORMAT follows each frame:
 *   - Cancelled / Overdue (not issued): "Not recorded yet" ×2, no Total Duration (5029:56038)
 *   - Overdue (issued): "Not started" ×2, Total Duration "—" (6591:303321)
 *   - Pending Return: start and end as date-over-time, no Total Duration (5029:54570, 6591:304050)
 *   - otherwise: start date-over-time, end "date, time", Total Duration (5029:55565)
 */
export function sessionTimes(booking: Booking, status: BookingStatus, phase: PostSessionPhase): SessionTimes {
  if (phase === "not-issued") {
    return { start: { primary: "Not recorded yet" }, end: { primary: "Not recorded yet" } };
  }
  if (phase === "issued") {
    return { start: { primary: "Not started" }, end: { primary: "Not started" }, duration: "—" };
  }
  const [dateLine = "", timeLine = ""] = (booking.bookingTime ?? "").split("\n");
  // A time line like "(22 Apr) 8:00 AM - …" — skip the bracketed date before reading the clock.
  const slot = parseClock(timeLine.replace(/\([^)]*\)/g, "")) ?? { h: 8, m: 0 };
  const start = new Date(2000, 0, 1, slot.h, slot.m + 1);
  const end = new Date(start.getTime() + 210 * MIN);
  const date = dateLine.trim();
  if (phase === "pending-return" && status !== "Completed") {
    return {
      start: { primary: date, secondary: clockLabel(start) },
      end: { primary: date, secondary: clockLabel(end) },
    };
  }
  return {
    start: { primary: date, secondary: clockLabel(start) },
    end: { primary: `${date}, ${clockLabel(end)}` },
    duration: "3h 30m",
  };
}
