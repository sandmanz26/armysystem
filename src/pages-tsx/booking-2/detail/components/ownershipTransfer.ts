// Booking 2.0 — Asset Ownership Transferred (F-012, BD-19). Figma `Booking Details: Ongoing` (6818:671556),
// sections 6848:96288 (scenario 1) and 6851:136263 (scenario 2), each with a `Notes` frame (6851:140518 / 6851:140526):
//
//   Trigger   Automatic. Runs once Assignment A reaches Ready To Return Asset. Ownership passes to the sibling
//             courseware (A → B) on the same day. The user makes no decision; the info modal is acknowledge-only.
//   Scenario 1  same date, SAME time slot, DIFFERENT base station (concurrent)
//               → "Armskote personnel will move the assets from {from_base_station} to {to_base_station} by {time}."
//   Scenario 2  same date, DIFFERENT (later) time slot, SAME base station (sequential)
//               → "Assets stay at {base_station}. Complete onboarding before training begins."
//   Result    Assignment A → Ownership Transferred, Assignment B auto-created → Ownership Received; modal; then a toast
//             "Asset ownership #… transferred" on Booking Details (6846:95185 / 6851:138477).
//
// In the app the trigger is the "Ready For Return Assets" confirmation of Booking Details (PostSessionActions).
// A booking with no such sibling courseware keeps the existing Ready For Return behaviour.
import type { Booking } from "@/data/mock";
import type { OwnershipAssignmentCard } from "@/components/ownership-transferred-modal";
import { BOOKING_STATUS_TONE } from "@/pages-tsx/booking-2/list/statusTone";
import { sessionLine, toMinutes, type MultiCw } from "./multiCw";

export type TransferScenario = "same-slot-different-station" | "different-slot-same-station";

export interface OwnershipTransfer {
  scenario: TransferScenario;
  /** `MultiCw.index` of the courseware that hands over (A) and the one that receives (B). */
  fromIndex: number;
  toIndex: number;
  from: OwnershipAssignmentCard;
  to: OwnershipAssignmentCard;
  nextSteps: string;
}

const card = (
  booking: Booking,
  cw: MultiCw,
  bookingStatus: "Completed" | "Ongoing" | "Upcoming",
  assignmentStatus: OwnershipAssignmentCard["assignmentStatus"],
): OwnershipAssignmentCard => ({
  bookingId: booking.bookingId,
  courseware: cw.name,
  bookingDate: cw.schedule.date,
  bookingSession: sessionLine(cw.schedule),
  bookingStatus: { label: bookingStatus, tone: BOOKING_STATUS_TONE[bookingStatus] },
  assignmentId: cw.assignmentId ?? "—",
  assignmentStatus,
});

/** The sibling courseware that takes over courseware `selected`'s assets, or null when there is none. */
export function findOwnershipTransfer(booking: Booking, list: MultiCw[], selected: number): OwnershipTransfer | null {
  const a = list[selected];
  if (!a || a.cancelled || list.length < 2) return null;
  const sameDay = list.filter((c) => c.index !== a.index && !c.cancelled && c.schedule.date === a.schedule.date);

  const concurrent = sameDay.find(
    (c) =>
      c.schedule.start === a.schedule.start &&
      c.schedule.end === a.schedule.end &&
      !!c.baseStation &&
      c.baseStation !== a.baseStation,
  );
  if (concurrent) {
    return {
      scenario: "same-slot-different-station",
      fromIndex: a.index,
      toIndex: concurrent.index,
      from: card(booking, a, "Completed", { label: "Ownership Transferred", tone: "success" }),
      to: card(booking, concurrent, "Ongoing", { label: "Ownership Received", tone: "purple" }),
      // `{time}` has no source in Figma — the new courseware's session start is used (open question).
      nextSteps: `Armskote personnel will move the assets from ${a.baseStation} to ${concurrent.baseStation} by ${concurrent.schedule.start}.`,
    };
  }

  const sequential = sameDay
    .filter((c) => c.baseStation === a.baseStation && c.schedule.start && toMinutes(c.schedule.start) >= toMinutes(a.schedule.end))
    .sort((x, y) => toMinutes(x.schedule.start) - toMinutes(y.schedule.start))[0];
  if (sequential) {
    return {
      scenario: "different-slot-same-station",
      fromIndex: a.index,
      toIndex: sequential.index,
      from: card(booking, a, "Completed", { label: "Ownership Transferred", tone: "success" }),
      to: card(booking, sequential, "Upcoming", { label: "Ownership Received", tone: "purple" }),
      nextSteps: `Assets stay at ${a.baseStation}. Complete onboarding before training begins.`,
    };
  }
  return null;
}
