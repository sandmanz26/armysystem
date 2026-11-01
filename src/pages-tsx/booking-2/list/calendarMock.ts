// Booking List 2.0 — calendar-only mock bookings.
//
// The shared mock bookings all sit in Apr–Jun 2026, so the calendar (which
// opens on today) was empty. This set is generated around TODAY — last month,
// this month, next month — with the density and mix Figma's `Calendar - Month
// - Filled` (7602:81080) shows: busy weekdays, empty weekends, AM / PM / Full
// Day / Hourly, every status, and one multi-day Ad-hoc running through today.
//
// Calendar-only on purpose: adding ~200 rows to the shared `bookings` array
// would flood Booking List, Today's Booking and the old booking module. The
// Booking 2.0 detail page looks these ids up too, so a click still lands on
// the booking that was clicked. Deterministic (seeded by date), so reloads
// show the same calendar.
import { bookings, type Booking, type BookingStatus, type TrainingMode } from "@/data/mock";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Template {
  program: string;
  trainingType: "Group" | "Individual";
  trainingMode: TrainingMode;
  courseware: string;
  slot: "AM" | "PM" | "Full Day" | "Hourly";
  stations: string[];
}

const TEMPLATES: Template[] = [
  { program: "Collective Training for Unit Beta", trainingType: "Group", trainingMode: "Collective", courseware: "Component Type Training A", slot: "AM", stations: ["WPT-01", "WPT-02", "WPT-03"] },
  { program: "Collective Training for Unit Beta", trainingType: "Group", trainingMode: "Collective", courseware: "Component Type Training A", slot: "PM", stations: ["WPT-01", "WPT-02", "WPT-03"] },
  { program: "Judgemental Training for Unit Omega", trainingType: "Group", trainingMode: "Judgemental", courseware: "Judgemental Shooting A", slot: "AM", stations: ["WPT-01", "WPT-02", "WPT-03"] },
  { program: "Judgemental Training for Unit Omega", trainingType: "Group", trainingMode: "Judgemental", courseware: "Judgemental Shooting A", slot: "PM", stations: ["WPT-02", "WPT-03"] },
  { program: "Marksmanship Training for Unit SR1", trainingType: "Group", trainingMode: "Marksmanship", courseware: "APS (SAR21/LMG)", slot: "AM", stations: ["WPT-04"] },
  { program: "Collective Training for Unit 42SAR", trainingType: "Group", trainingMode: "Collective", courseware: "Blockforce Training", slot: "Full Day", stations: ["WPT-05"] },
  { program: "Individual Training for Jasmine Rice", trainingType: "Individual", trainingMode: "Marksmanship", courseware: "APS (SAR21/LMG)", slot: "Hourly", stations: ["WPT-01"] },
  { program: "Individual Training for Jessica Cho", trainingType: "Individual", trainingMode: "Marksmanship", courseware: "APS (SAR21/LMG)", slot: "Hourly", stations: ["WPT-02"] },
];

/** Small, stable PRNG seeded per day — same calendar on every reload. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function dayLabel(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function clock(h: number) {
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${ap}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Status that makes sense for the day: done in the past, live today, ahead later. */
function statusFor(day: Date, today: Date, r: number): BookingStatus {
  if (sameDay(day, today)) return r < 0.6 ? "Ongoing" : r < 0.9 ? "Upcoming" : "Return Assets";
  if (day < today) {
    const daysAgo = (today.getTime() - day.getTime()) / 86_400_000;
    if (daysAgo <= 3 && r < 0.3) return "Return Assets";
    if (r < 0.75) return "Completed";
    if (r < 0.87) return "Cancelled";
    if (r < 0.95) return "Overdue";
    return "Completed with Missing Assets";
  }
  return r < 0.9 ? "Upcoming" : "Cancelled";
}

function timeText(day: Date, t: Template, hour: number) {
  const label = dayLabel(day);
  const short = `${day.getDate()} ${MONTHS[day.getMonth()]}`;
  if (t.slot === "AM") return `${label}\n08:00 AM - 12:00 PM (AM Session)`;
  if (t.slot === "PM") return `${label}\n01:00 PM - 05:00 PM (PM Session)`;
  if (t.slot === "Full Day") return `${label}\n08:00 AM - 05:00 PM (Full Day)`;
  return `${label}\n(${short}) ${clock(hour)} - (${short}) ${clock(hour + 1)} (Ad-Hoc Schedule)`;
}

function build(): Booking[] {
  const template = bookings.find((b) => b.id === "18") ?? bookings[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const to = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const out: Booking[] = [];
  let seq = 0;

  const make = (day: Date, t: Template, status: BookingStatus, hour: number, override?: Partial<Booking>): Booking => {
    seq++;
    const yymmdd = `${String(day.getFullYear()).slice(2)}${String(day.getMonth() + 1).padStart(2, "0")}${String(day.getDate()).padStart(2, "0")}`;
    return {
      ...template,
      id: `cal-${yymmdd}-${seq}`,
      bookingId: `#${yymmdd}-WPT${String(seq % 1000).padStart(3, "0")}`,
      program: t.program,
      trainingType: t.trainingType,
      trainingMode: t.trainingMode,
      courseware: t.courseware,
      bookingDate: dayLabel(day),
      bookingTime: timeText(day, t, hour),
      status,
      assignedStations: t.stations,
      assignedCShapedStations: undefined,
      baseStationQty: t.stations.length,
      cShapedStationQty: 0,
      assetIssued: status !== "Upcoming" && status !== "Cancelled",
      assignmentId: status === "Upcoming" || status === "Cancelled" ? "-" : `#${yymmdd}-AT${String(seq % 1000).padStart(3, "0")}`,
      unitName: t.program.replace(/^.* Unit /, "").replace(/^Individual Training for /, ""),
      traineesCount: t.trainingType === "Individual" ? 1 : 30,
      ...override,
    };
  };

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const day = new Date(d);
    const r = rng(day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate());
    const count = 2 + Math.floor(r() * 6); // 2–7 a weekday, like Figma's "+N more" days
    let hour = 8;
    for (let i = 0; i < count; i++) {
      const t = TEMPLATES[Math.floor(r() * TEMPLATES.length)];
      const h = t.slot === "Hourly" ? hour++ : 8;
      if (hour > 16) hour = 8;
      out.push(make(day, t, statusFor(day, today, r()), h));
    }
  }

  // One Group Ad-hoc running across three days, today included — Figma's
  // "Ongoing · Ad-hoc · 24 Nov 08:00 AM - 26 Nov 2025 05:00 PM" bar.
  const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = Math.min(Math.max(today.getDate() - 1, 1), dim - 2);
  const s = new Date(today.getFullYear(), today.getMonth(), startDay);
  const e = new Date(today.getFullYear(), today.getMonth(), startDay + 2);
  const m = MONTHS[s.getMonth()];
  out.push(make(s, TEMPLATES[2], "Ongoing", 8, {
    bookingDate: `${s.getDate()}, ${s.getDate() + 1}, ${e.getDate()} ${m} ${s.getFullYear()}`,
    bookingTime: `${s.getDate()} - ${e.getDate()} ${m} ${s.getFullYear()}\n(${s.getDate()} ${m}) 08:00 AM - (${e.getDate()} ${m}) 05:00 PM (Ad-Hoc Schedule)`,
    assignedStations: ["WPT-04"],
    baseStationQty: 1,
  }));

  return out;
}

export const calendarMockBookings: Booking[] = build();
