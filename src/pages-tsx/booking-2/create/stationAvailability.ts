// Booking 2.0 Create Booking — Step 2 "Availability on Select Date Slot" (Figma 5314:52268 Sufficient,
// 8032:153911 Insufficient, 5029:69716 "Select a date to check availability").
//
// Prototype rule (mock data only, no backend):
//   * Site pool = every distinct station name the existing mock bookings use — Flat Screen from
//     `assignedStations` (WPT-01 … WPT-05) and C-Shaped from `assignedCShapedStations`
//     (C-Shaped 01 … 04), across `@/data/mock` bookings + the Booking List 2.0 calendar mock.
//   * A station is taken on a date when a non-Cancelled booking on that date uses it in an
//     overlapping slot: AM overlaps AM, PM overlaps PM; Full Day / Ad-hoc bookings take both halves,
//     and a Full Day / Ad-hoc request needs both halves free.
//   * Free = pool − taken. A range schedule (Full Day multiple dates / Ad-hoc) uses the worst day.
//   * Sufficient when free ≥ required for both Flat Screen and C-Shaped.
import { bookings, type Booking } from "@/data/mock";
import { calendarMockBookings } from "../list/calendarMock";
import type { CoursewareSchedule } from "./components/ScheduleStep";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface StationCount { flat: number; cshaped: number }

type Half = "AM" | "PM";

const ALL: Booking[] = [...bookings, ...calendarMockBookings];

const FLAT_POOL = new Set(ALL.flatMap((b) => b.assignedStations ?? []));
const CSHAPED_POOL = new Set(ALL.flatMap((b) => b.assignedCShapedStations ?? []));

/** "20 Oct 2026" or "15, 16, 17 Oct 2026" → day keys "2026-9-20" … */
function bookingDayKeys(b: Booking): string[] {
  const m = /^([\d,\s]+)\s+([A-Za-z]{3})\s+(\d{4})$/.exec(b.bookingDate.trim());
  if (!m) return [];
  const month = MONTHS.indexOf(m[2]);
  if (month < 0) return [];
  return m[1].split(",").map((d) => d.trim()).filter(Boolean).map((d) => `${m[3]}-${month}-${Number(d)}`);
}

function bookingHalves(b: Booking): Half[] {
  if (/\(AM Session\)/.test(b.bookingTime)) return ["AM"];
  if (/\(PM Session\)/.test(b.bookingTime)) return ["PM"];
  return ["AM", "PM"];
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function freeOn(day: Date, halves: Half[]): StationCount {
  const key = dayKey(day);
  const takenFlat = new Set<string>();
  const takenC = new Set<string>();
  for (const b of ALL) {
    if (b.status === "Cancelled") continue;
    if (!bookingDayKeys(b).includes(key)) continue;
    if (!bookingHalves(b).some((h) => halves.includes(h))) continue;
    (b.assignedStations ?? []).forEach((s) => takenFlat.add(s));
    (b.assignedCShapedStations ?? []).forEach((s) => takenC.add(s));
  }
  return {
    flat: [...FLAT_POOL].filter((s) => !takenFlat.has(s)).length,
    cshaped: [...CSHAPED_POOL].filter((s) => !takenC.has(s)).length,
  };
}

/** Free stations for a courseware's schedule, or null while no date is picked yet. */
export function availabilityFor(sch: CoursewareSchedule): StationCount | null {
  if (!sch.scheduleType) return null;
  const halves: Half[] = sch.scheduleType === "AM" ? ["AM"] : sch.scheduleType === "PM" ? ["PM"] : ["AM", "PM"];
  let days: Date[] = [];
  if (sch.scheduleType === "FullDayMultiple" || sch.scheduleType === "AdHoc") {
    const start = sch.range?.start;
    if (!start) return null;
    const end = sch.range?.end ?? start;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  } else if (sch.singleDate) {
    days = [sch.singleDate];
  }
  if (!days.length) return null;
  return days.map((d) => freeOn(d, halves)).reduce((a, b) => ({ flat: Math.min(a.flat, b.flat), cshaped: Math.min(a.cshaped, b.cshaped) }));
}
