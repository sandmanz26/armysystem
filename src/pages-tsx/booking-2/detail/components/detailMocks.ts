// Booking 2.0 — Booking Details: detail-page-only mock bookings (F-006, BD-21 / BD-3).
//
// The shared `bookings` mock sits in Apr–Jun 2026 and has no booking dated today, no Overdue
// booking whose assets were issued, and no Return Assets booking part-way through its return —
// so three Figma states were unreachable:
//   - `Upcoming (The Day)` red banner (5513:405960 / 405977 / 405994) needs an Upcoming booking
//     dated TODAY. Its date is built from `new Date()` (never a hard-coded string) so it is
//     today under the real clock and under the frozen screenshot clock alike.
//   - `Overdue (Asset Issued)` (6591:303321 → 6591:304050).
//   - `Return Assets (Partial Return Assets)` (6501:244728).
// Kept here — looked up only by the Booking Details page — rather than added to the shared
// `bookings` array, so Booking List / Today's Booking / the old booking module are unaffected.
import { bookings, type Booking } from "@/data/mock";
import type { PostSessionPhase } from "./postSession";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayLabel(d = new Date()) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function todayCode(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

const base = bookings.find((b) => b.id === "11") ?? bookings[0];

function todayBooking(id: string, seq: string, unit: string, traineesCount: number): Booking {
  const day = todayLabel();
  return {
    ...base,
    id,
    bookingId: `#${todayCode()}-PTC${seq}`,
    program: `WPT Group Training for Unit ${unit}`,
    unitName: unit,
    bookingTime: `${day}\n08:00 AM - 12:00 PM (AM Session)`,
    bookingDate: day,
    status: "Upcoming",
    assetIssued: false,
    assignmentId: "-",
    assignedStations: ["WPT-01", "WPT-02"],
    baseStationQty: 2,
    traineesCount,
  };
}

/**
 * Detail-only bookings. Ids:
 *   bd-today        Upcoming, TODAY, Nominal Roll empty, lanes configured  → 5513:405960
 *   bd-today-lanes  Upcoming, TODAY, trainees added, lanes not configured  → 5513:405977
 *   bd-today-both   Upcoming, TODAY, Nominal Roll empty + lanes empty      → 5513:405994
 *   bd-overdue-issued   Overdue, assets issued                              → 6591:303321
 *   bd-return           Return Assets, Pending Return (single courseware)   → 5029:54570 → 5831:62299
 *   bd-return-partial   Return Assets, partial return                       → 6501:244728 → 5831:64203
 *   bd-cancelled        Cancelled (single courseware)                       → 5029:56038
 *   bd-ownership-station  Return Assets, two courseware, same slot, different base station → 6848:96288 (F-012, BD-19)
 *   bd-ownership-slot     Return Assets, two courseware, AM then PM, same base station      → 6851:136263 (F-012, BD-19)
 */
export const detailMockBookings: Booking[] = [
  todayBooking("bd-today", "031", "Echo", 0),
  todayBooking("bd-today-lanes", "032", "Foxtrot", 30),
  todayBooking("bd-today-both", "033", "Golf", 0),
  {
    ...(bookings.find((b) => b.id === "1") ?? base),
    id: "bd-overdue-issued",
    bookingId: "#260422-PTC034",
    program: "WPT Group Training for Unit Hotel",
    unitName: "Hotel",
    bookingTime: "22 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    status: "Overdue",
    courseware: "Day Test For SAR21/M16 BTP",
    assetIssued: true,
    assignmentId: "#260422-AT034",
  },
  {
    ...(bookings.find((b) => b.id === "14") ?? base),
    id: "bd-return",
    bookingId: "#260422-PTC036",
    program: "WPT Group Training for Unit Juliet",
    unitName: "Juliet",
    courseware: "Night Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT036",
  },
  {
    ...base,
    id: "bd-cancelled",
    bookingId: "#260423-PTC037",
    program: "WPT Group Training for Unit Kilo",
    unitName: "Kilo",
    status: "Cancelled",
    assignedStations: ["WPT-05"],
    baseStationQty: 1,
  },
  {
    ...(bookings.find((b) => b.id === "14") ?? base),
    id: "bd-return-partial",
    bookingId: "#260422-PTC035",
    program: "WPT Group Training for Unit India",
    unitName: "India",
    courseware: "Night Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT035",
  },
  // F-012 (BD-19): Asset Ownership Transferred. Ids, names, dates and sessions are Figma's sample
  // (6848:96288 / 6851:136263); pressing Ready For Return Assets on the first courseware hands its assets to the second.
  {
    ...(bookings.find((b) => b.id === "14") ?? base),
    id: "bd-ownership-station",
    bookingId: "#251104-WPT015",
    program: "Marksmanship Training for Unit Beta",
    unitName: "Beta",
    courseware: "APS (SAR21/LMG), ATP (M) (SAR21/LMG)",
    bookingTime: "24 Nov 2025\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "24 Nov 2025",
    assignmentId: "#ASGN-2026-001",
    assignedStations: ["WPT-01", "WPT-02"],
    baseStationQty: 2,
    coursewareDetails: [
      { baseStation: "WPT-01", schedule: "24 Nov 2025 · AM Session (08:00 AM - 12:00 PM)", assignmentId: "#ASGN-2026-001" },
      { baseStation: "WPT-02", schedule: "24 Nov 2025 · AM Session (08:00 AM - 12:00 PM)", assignmentId: "#ASGN-2026-003" },
    ],
  },
  {
    ...(bookings.find((b) => b.id === "14") ?? base),
    id: "bd-ownership-slot",
    bookingId: "#251104-WPT015",
    program: "Marksmanship Training for Unit Beta",
    unitName: "Beta",
    courseware: "ATP (M) (SAR21/LMG), ATP (SP) (SAR21/LMG)",
    bookingTime: "24 Nov 2025\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "24 Nov 2025",
    assignmentId: "#ASGN-2026-002",
    assignedStations: ["WPT-01"],
    baseStationQty: 1,
    coursewareDetails: [
      { baseStation: "WPT-01", schedule: "24 Nov 2025 · AM Session (08:00 AM - 12:00 PM)", assignmentId: "#ASGN-2026-002" },
      { baseStation: "WPT-01", schedule: "24 Nov 2025 · PM Session (01:00 PM - 05:00 PM)", assignmentId: "#ASGN-2026-003" },
    ],
  },
];

/** Lane Configuration has no data for these mocks; the store wins once lanes are saved. */
export const MOCK_LANES_CONFIGURED: Record<string, boolean> = {
  "bd-today": true,
};

/** Starting post-session phase for bookings whose phase can't be read off the shared mock. */
export const MOCK_POST_SESSION_PHASE: Record<string, PostSessionPhase> = {
  "bd-overdue-issued": "issued",
  "bd-return-partial": "partial-return",
  "bd-ownership-station": "pending-return",
  "bd-ownership-slot": "pending-return",
};

/** Number of assets on the booking's assignment — fills Figma's `{n}` in the Ready For Return
 *  confirmation (5889:294479). Mock only; the shared data has no per-assignment asset count. */
export const MOCK_ASSET_COUNT: Record<string, number> = {
  "14": 12,
  "bd-return": 12,
  "bd-overdue-issued": 8,
  "bd-ownership-station": 10,
  "bd-ownership-slot": 10,
};
