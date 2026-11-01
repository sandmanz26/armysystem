import type { ViewMode, SessionType, WeekCell, DayBooking } from "./types";

export const STATIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05", "WPT-06"];

export const weekData: Record<string, Record<string, WeekCell[]>> = {
  "WPT-01": {
    Mon: [{ type: "Full", status: "Completed", title: "Marksmanship Training for 3 SIR", unit: "3 SIR", bookedBy: "MAJ Hafiz", instructor: "CPT Azri", time: "8:00–5:00", bookingId: "WB001" }],
    Tue: [
      { type: "AM", status: "Upcoming", title: "Judgemental Training for 1 Vanguard", unit: "1 Vanguard", bookedBy: "LTA Chen Kai", instructor: "SSG Tan", time: "8:00–12:00", bookingId: "WB002" },
      { type: "PM", status: "Upcoming", title: "Collective Training for 1 Vanguard", unit: "1 Vanguard", bookedBy: "LTA Chen Kai", instructor: "SSG Tan", time: "1:00–5:00",  bookingId: "WB003" },
    ],
    Wed: [
      { type: "AM", status: "Ongoing", title: "Marksmanship Training for 2 CDO", unit: "2 CDO", bookedBy: "CPT Reza", instructor: "WO1 Fauzi", time: "8:00–12:00", bookingId: "WB004" },
      { type: "PM", status: "Ongoing", title: "Judgemental Training for 1 Vanguard", unit: "1 Vanguard", bookedBy: "LTA Chen Kai", instructor: "SSG Tan", time: "1:00–5:00", bookingId: "WB005" },
    ],
    Thu: [{ type: "Full", status: "Upcoming", title: "Collective Training for 4 SIR", unit: "4 SIR", bookedBy: "MAJ Yusof", instructor: "CPT Nizam", time: "8:00–5:00", bookingId: "WB006" }],
    Fri: [{ type: "AM", status: "Upcoming", title: "Marksmanship Training for 5 SIR", unit: "5 SIR", bookedBy: "LTA Bala", instructor: "SSG Muthu", time: "8:00–12:00", bookingId: "WB007" }],
    Sat: [],
    Sun: [],
  },
  "WPT-02": {
    Mon: [{ type: "AM", status: "Upcoming", title: "Judgemental Training for 2 PDF", unit: "2 PDF", bookedBy: "CPT Lim", instructor: "SSG Koh", time: "8:00–12:00", bookingId: "WB008" }],
    Tue: [{ type: "Full", status: "Completed", title: "Collective Training for Vanguard HQ", unit: "Vanguard HQ", bookedBy: "LTC Tan", instructor: "WO2 Siva", time: "8:00–5:00", bookingId: "WB009" }],
    Wed: [{ type: "Full", status: "Ongoing", title: "Marksmanship Training for 2 CDO", unit: "2 CDO", bookedBy: "CPT Reza", instructor: "WO1 Fauzi", time: "8:00–5:00", bookingId: "WB010" }],
    Thu: [{ type: "PM", status: "Upcoming", title: "Judgemental Training for 3 SIR", unit: "3 SIR", bookedBy: "MAJ Hafiz", instructor: "CPT Azri", time: "1:00–5:00", bookingId: "WB011" }],
    Fri: [{ type: "Full", status: "Completed", title: "Collective Training for 1 GDS", unit: "1 GDS", bookedBy: "LTA Wong", instructor: "SSG Ali", time: "8:00–5:00", bookingId: "WB012" }],
    Sat: [{ type: "AM", status: "Upcoming", title: "Marksmanship Training for 5 SIR", unit: "5 SIR", bookedBy: "LTA Bala", instructor: "SSG Muthu", time: "8:00–12:00", bookingId: "WB013" }],
    Sun: [],
  },
  "WPT-03": {
    Mon: [],
    Tue: [{ type: "Hr", status: "Upcoming", title: "Individual Training for 4 SIR", unit: "4 SIR", bookedBy: "MAJ Yusof", instructor: "CPT Nizam", time: "9:00–11:30", bookingId: "WB014" }],
    Wed: [
      { type: "Hr", status: "Ongoing",  title: "Individual Training for 4 SIR", unit: "4 SIR", bookedBy: "MAJ Yusof", instructor: "CPT Nizam", time: "8:00–10:30", bookingId: "WB015" },
      { type: "Hr", status: "Upcoming", title: "Individual Training for 2 PDF", unit: "2 PDF", bookedBy: "CPT Lim",   instructor: "SSG Koh",   time: "2:00–4:30",  bookingId: "WB016" },
    ],
    Thu: [
      { type: "AM", status: "Upcoming", title: "Judgemental Training for 1 Vanguard", unit: "1 Vanguard", bookedBy: "LTA Chen Kai", instructor: "SSG Tan",  time: "8:00–12:00", bookingId: "WB017" },
      { type: "PM", status: "Upcoming", title: "Collective Training for 3 SIR", unit: "3 SIR",    bookedBy: "MAJ Hafiz",    instructor: "CPT Azri", time: "1:00–5:00",  bookingId: "WB018" },
    ],
    Fri: [],
    Sat: [],
    Sun: [],
  },
  "WPT-04": {
    Mon: [{ type: "Ad", status: "Upcoming", title: "Marksmanship Training for 5 SIR", unit: "5 SIR", bookedBy: "LTA Bala", instructor: "SSG Muthu", time: "Ad-Hoc", bookingId: "WB019" }],
    Tue: [{ type: "Ad", status: "Upcoming", title: "Marksmanship Training for 5 SIR", unit: "5 SIR", bookedBy: "LTA Bala", instructor: "SSG Muthu", time: "Ad-Hoc", bookingId: "WB019" }],
    Wed: [{ type: "Ad", status: "Upcoming", title: "Marksmanship Training for 5 SIR", unit: "5 SIR", bookedBy: "LTA Bala", instructor: "SSG Muthu", time: "Ad-Hoc", bookingId: "WB019" }],
    Thu: [],
    Fri: [{ type: "PM", status: "Upcoming", title: "Judgemental Training for 2 CDO", unit: "2 CDO", bookedBy: "CPT Reza", instructor: "WO1 Fauzi", time: "1:00–5:00", bookingId: "WB020" }],
    Sat: [],
    Sun: [],
  },
  "WPT-05": {
    Mon: [],
    Tue: [{ type: "AM", status: "Upcoming", title: "Collective Training for Vanguard HQ", unit: "Vanguard HQ", bookedBy: "LTC Tan", instructor: "WO2 Siva", time: "8:00–12:00", bookingId: "WB021" }],
    Wed: [{ type: "AM", status: "Ongoing",  title: "Marksmanship Training for Vanguard HQ", unit: "Vanguard HQ", bookedBy: "LTC Tan", instructor: "WO2 Siva", time: "8:00–12:00", bookingId: "WB022" }],
    Thu: [],
    Fri: [{ type: "Full", status: "Completed", title: "Judgemental Training for Vanguard HQ", unit: "Vanguard HQ", bookedBy: "LTC Tan", instructor: "WO2 Siva", time: "8:00–5:00", bookingId: "WB023" }],
    Sat: [],
    Sun: [],
  },
  "WPT-06": {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [{ type: "AM", status: "Upcoming", title: "Collective Training for 1 GDS", unit: "1 GDS", bookedBy: "LTA Wong", instructor: "SSG Ali", time: "8:00–12:00", bookingId: "WB024" }],
    Fri: [],
    Sat: [],
    Sun: [],
  },
};

export const weekDailyCounts = [3, 6, 7, 5, 4, 1, 0];

export const dayBookings: DayBooking[] = [
  { station: "WPT-01", title: "Marksmanship Training for 3 SIR", unitName: "3 SIR", sessionType: "AM", startHour: 1, durationHours: 4, status: "Completed", timeLabel: "AM · 8:00–12:00 · completed" },
  { station: "WPT-01", title: "Judgemental Training for 1 Vanguard", unitName: "1 Vanguard", sessionType: "PM", startHour: 6, durationHours: 4, status: "Ongoing", timeLabel: "PM · 1:00–5:00 · ongoing" },
  { station: "WPT-02", title: "Collective Training for 2 CDO", unitName: "2 CDO", sessionType: "Full", startHour: 1, durationHours: 9, status: "Ongoing", timeLabel: "Full · 8:00–5:00 · ongoing" },
  { station: "WPT-03", title: "Individual Training for 4 SIR", unitName: "4 SIR", sessionType: "Hr", startHour: 2, durationHours: 2.5, status: "Completed", timeLabel: "Hr · Per hour · completed" },
  { station: "WPT-03", title: "Individual Training for 2 PDF", unitName: "2 PDF", sessionType: "Hr", startHour: 5, durationHours: 2.5, status: "Upcoming", timeLabel: "Hr · Per hour · upcoming" },
  { station: "WPT-04", title: "Collective Training for 5 SIR", unitName: "5 SIR", sessionType: "Ad", startHour: 0, durationHours: 5.5, status: "Ongoing", timeLabel: "Ad · 7 Apr PM → 9 Apr AM · ongoing" },
  { station: "WPT-05", title: "Marksmanship Training for Vanguard HQ", unitName: "Vanguard HQ", sessionType: "AM", startHour: 1, durationHours: 4, status: "Completed", timeLabel: "AM · 8:00–12:00 · completed" },
];

// Month calendar data — bookings per day for April 2026
export const aprilBookings: Record<number, number> = {
  1: 3, 2: 5, 3: 4, 4: 2, 5: 6,
  8: 1, 9: 7, 10: 3, 11: 5, 12: 2,
  13: 1, 15: 3, 16: 4, 17: 2, 18: 1, 19: 5,
  22: 2, 23: 3, 24: 4, 25: 1, 26: 3,
  27: 1, 29: 2, 30: 3,
};

// ── Schedule-type palette ─────────────────────────────────────────────────────
// Sourced from Figma "Dashboard - Day / Filled" (node 5654:75643). The block
// colour encodes the SCHEDULE TYPE (AM / PM / Full Day / Ad-hoc / Hourly),
// not the booking status — status is written into the block's meta line.
//   bg          → color/background/<hue>/invert/soft
//   blockBorder → color/border/invert/<hue>   (soft outline on the timeline block)
//   chipBorder  → color/border/<hue>          (full-strength outline on the filter chip)
//   text        → color/text/<hue>
//   badge       → color/background/<hue>/default (filter-chip count bubble)
export const sessionColors: Record<
  SessionType,
  { label: string; short: string; bg: string; blockBorder: string; chipBorder: string; text: string; badge: string }
> = {
  AM:   { label: "AM Session", short: "AM", bg: "bg-primary-invert-soft", blockBorder: "border-invert-primary", chipBorder: "border-primary", text: "text-primary", badge: "bg-primary-default" },
  PM:   { label: "PM Session", short: "PM", bg: "bg-info-invert-soft",         blockBorder: "border-invert-info",        chipBorder: "border-info",      text: "text-info",      badge: "bg-info-default"      },
  Full: { label: "Full Day", short: "Full Day",   bg: "bg-success-invert-soft",        blockBorder: "border-invert-success",       chipBorder: "border-success",     text: "text-success",     badge: "bg-success-default"     },
  Ad:   { label: "Ad-hoc", short: "Ad-hoc",     bg: "bg-warning-invert-soft",       blockBorder: "border-invert-warning",      chipBorder: "border-warning",    text: "text-warning",    badge: "bg-warning-default"    },
  Hr:   { label: "Hourly", short: "Hourly",     bg: "bg-purple-invert-soft",       blockBorder: "border-invert-purple",      chipBorder: "border-purple",    text: "text-purple",    badge: "bg-purple-default"    },
};

/** Figma writes "0 Booking" and "1 Booking", plural only from 2. */
export const bookingLabel = (n: number) => (n <= 1 ? "Booking" : "Bookings");

// Chip / legend order as laid out in Figma.
export const SESSION_ORDER: SessionType[] = ["AM", "PM", "Full", "Ad", "Hr"];

// Month heat-map steps — Figma color/background/primary/invert/{soft,default,hovered}.
// Thresholds from the designer's Notes `6203:312238`: 1–3 low · 4–7 medium · >7 high.
export function monthIntensity(count: number): string {
  if (!count) return "bg-surface";
  if (count <= 3) return "bg-primary-invert-soft";
  if (count <= 7) return "bg-primary-invert-default";
  return "bg-primary-invert-hovered";
}

export const TOP_CARDS_DATA: Record<ViewMode, {
  bookingLabel: string;
  booking: { total: number; done: number; ongoing: number; awaiting: number };
  asset: { issued: number; returned: number; pending: number; awaiting: number };
}> = {
  Day: {
    bookingLabel: "Today's Bookings",
    booking: { total: 24, done: 20, ongoing: 3, awaiting: 1 },
    asset:   { issued: 24, returned: 20, pending: 2, awaiting: 2 },
  },
  Week: {
    bookingLabel: "This Week's Bookings",
    booking: { total: 86, done: 62, ongoing: 14, awaiting: 10 },
    asset:   { issued: 86, returned: 60, pending: 20, awaiting: 6 },
  },
  Month: {
    bookingLabel: "This Month's Bookings",
    booking: { total: 312, done: 248, ongoing: 0, awaiting: 64 },
    asset:   { issued: 312, returned: 280, pending: 24, awaiting: 8 },
  },
  // "Range" reuses the Week figures until a real range aggregation exists —
  // the Range view itself renders WeekView, same as it did in the old v2 page.
  Range: {
    bookingLabel: "Selected Range Bookings",
    booking: { total: 86, done: 62, ongoing: 14, awaiting: 10 },
    asset:   { issued: 86, returned: 60, pending: 20, awaiting: 6 },
  },
};

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEK_DATES = [7, 8, 9, 10, 11, 12, 13] as const;
export const TODAY_IDX = 2; // Wed 9

// Figma "Dashboard - Day" renders 13 hour columns, 7 AM through 7 PM.
export const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const HOUR_COL_WIDTH = 80;   // Figma hour column
export const STATION_COL_WIDTH = 112; // Figma fixed left column

// Period labels shown between the ‹ › buttons in the overview card header.
export const DAY_LABEL   = "Wednesday, 9 Apr 2026";
export const WEEK_LABEL  = "7–13 Apr 2026";
export const MONTH_LABEL = "April 2026";
export const CURRENT_HOUR = 16.5; // 4:30 PM → offset from 7AM = 9.5

/**
 * Login Successful (Figma 5029:123620): "Login successfully by {user_name}. Welcome to
 * {platform_name}!" — Login.tsx stores the message here, the Dashboard shows it once after
 * the post-login page load. {user_name} = the sidebar user card (Olivia Carter), {platform_name} = TOMS.
 */
export const LOGIN_TOAST_KEY = "toms_login_toast";
