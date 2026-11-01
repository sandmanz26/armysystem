// Booking 2.0 — Onboarding shared types. Local to booking-2.
//
// Resolves the PRD Sec. 8.3 Status Matrix into concrete fields:
// - `registration`: was this Service ID already in the booking-time Nominal Roll
//   ("Registered") or not ("Non-Registered" — a walk-in first seen here)?
// - `attendance`: did they actually show up during Onboarding ("Present")
//   or not ("Absent")? A row can be Registered+Absent (no-show) or
//   Non-Registered+Present (walk-in) — Non-Registered+Absent never occurs
//   (nothing to show a row for).
import type { Trainee } from "@/pages-tsx/booking-2/create/nominalRollTypes";

export type Registration = "Registered" | "Non-Registered";
export type Attendance = "Present" | "Absent";

export interface OnboardingTrainee extends Trainee {
  registration: Registration;
  attendance: Attendance;
  /** Figma (5348:90900) shows a plain "D Month YYYY" date, no time — this
   *  prototype has no real edit-timestamp backend, so it's stamped once at
   *  creation (registration or walk-in scan), not updated live on edit. */
  lastUpdatedOn: string;
  baseStation: string;
  lane: string;
  // Which Nominal Roll list ("flat" vs "cshaped") a walk-in belongs to.
  // Only meaningful for Non-Registered trainees at bookings with both
  // station types — set via the Edit Trainee drawer's "Base Station Type"
  // field, since scanning both rolls together can't otherwise tell which
  // list a brand-new walk-in should be filed into.
  stationType?: "flat" | "cshaped";
}

/** "17 January 2025"-style date, matching Figma's Last Updated On sample. */
export function formattedToday(): string {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function fromBookingTrainee(t: Trainee, stationType: "flat" | "cshaped"): OnboardingTrainee {
  return { ...t, registration: "Registered", attendance: "Absent", lastUpdatedOn: formattedToday(), baseStation: "", lane: "", stationType };
}

// Names used for simulated walk-in (non-registered) scans, matching the
// reference screenshots exactly.
export const WALKIN_NAMES = ["Charity Case", "Crystal Snow", "Will Power"];

export function isComplete(t: OnboardingTrainee, hasCShaped: boolean): boolean {
  // A Non-Registered trainee needs their profile (Rank/Platoon/Role/Weapon,
  // plus which station type if the booking has both) filled in via the Edit
  // Trainee drawer before Onboarding can finish scanning — their specific
  // Base Station/Lane are auto-assigned by the scan simulation regardless.
  // Registered trainees always came in complete (profile already known from
  // the booking-time Nominal Roll).
  if (t.registration === "Registered") return true;
  return !!t.rank && !!t.platoon && !!t.role && t.weapon.length > 0 && (!hasCShaped || !!t.stationType);
}
