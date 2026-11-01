// Booking 2.0 — Booking Details: is an Upcoming booking ready for Onboarding? (F-006, BD-21)
//
// Figma draws the warning per missing input (page `↪ Booking Details: Upcoming` 5029:40418 and
// `↪ Upcoming (The Day)` 5093:165858):
//   Nominal Roll empty            5512:75076  / today 5513:405960
//   Lane Configuration empty      5512:75687  / today 5513:405977
//   both                          5512:118846 / today 5513:405994
//   Detail List tab               5513:254787 (lanes) · 5513:254795 (Nominal Roll) · 5513:287154 (both)
// Before the booking day the banner is yellow (`Alert` warning, triangle-alert); on the booking
// day it turns red (circle-alert) and says Onboarding is blocked. In every one of these frames
// Issue Assets and Start Onboarding are disabled.
import type { Booking } from "@/data/mock";
import { hasLaneConfig } from "./laneConfigStore";
import { MOCK_LANES_CONFIGURED } from "./detailMocks";
import { traineeTotal } from "./nominalRollStore";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** True when one of the booking's day(s) — "16 Oct 2026", "22, 23 Apr 2026", "22 - 24 Apr 2026" — is today. */
export function isBookingToday(booking: Booking, now = new Date()): boolean {
  const line = (booking.bookingTime ?? "").split("\n")[0] ?? "";
  const m = line.match(/^([\d,\s-]+)\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return false;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  const year = Number(m[3]);
  if (month !== now.getMonth() || year !== now.getFullYear()) return false;
  const nums = m[1].match(/\d{1,2}/g)?.map(Number) ?? [];
  const isRange = m[1].includes("-") && nums.length === 2;
  const d = now.getDate();
  return isRange ? d >= nums[0] && d <= nums[1] : nums.includes(d);
}

export interface Readiness {
  nominalRollEmpty: boolean;
  lanesEmpty: boolean;
  /** Something is missing — show a banner and disable Issue Assets / Start Onboarding. */
  blocked: boolean;
  isToday: boolean;
}

export function bookingReadiness(booking: Booking, coursewares: string[]): Readiness {
  // F-008: the real Nominal Roll (nominalRollStore, seeded from `traineesCount` — an explicit 0
  // starts empty, a booking without a count starts filled) — adding a trainee clears the banner.
  const nominalRollEmpty = traineeTotal(booking, coursewares) === 0;
  // Issue Assets is itself disabled until lanes are configured (every banner frame), so a booking
  // whose assets are already issued has its lanes configured.
  const lanesConfigured =
    booking.assetIssued ||
    MOCK_LANES_CONFIGURED[booking.id] === true ||
    (coursewares.length > 0 && coursewares.every((cw) => hasLaneConfig(booking.id, cw)));
  const lanesEmpty = !lanesConfigured;
  return {
    nominalRollEmpty,
    lanesEmpty,
    blocked: nominalRollEmpty || lanesEmpty,
    isToday: isBookingToday(booking),
  };
}

/** Exact Figma copy of the page-level `Alert`. */
export function readinessMessage(r: Readiness): string | null {
  if (!r.blocked) return null;
  if (r.isToday) {
    const what = r.nominalRollEmpty && r.lanesEmpty
      ? "Add trainees and configure lanes."
      : r.nominalRollEmpty
        ? "Add trainees to the Nominal Roll."
        : "Configure lanes in Lane Configuration.";
    return `Session is scheduled for today. ${what} You can't proceed to Onboarding until this is done.`;
  }
  if (r.nominalRollEmpty && r.lanesEmpty) return "Add trainees and configure lanes before the booking time so onboarding can begin on time.";
  if (r.nominalRollEmpty) return "Add trainees to the Nominal Roll before the booking time so onboarding can begin on time.";
  return "Configure lanes in Lane Configuration before the booking time so onboarding can begin on time.";
}

/** Exact Figma copy of the Detail List tab's in-tab `Alert`. */
export function detailListMessage(r: Readiness): string | null {
  if (r.nominalRollEmpty && r.lanesEmpty) return "Detail List will populate once trainees are added and lanes are configured.";
  if (r.nominalRollEmpty) return "Detail List will populate once trainees are added to the Nominal Roll.";
  if (r.lanesEmpty) return "Detail List will populate once lanes are configured.";
  return null;
}
