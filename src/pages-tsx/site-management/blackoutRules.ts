import type { Booking } from "@/data/mock";
import type { BlackoutDate, BlackoutOccurrence, Lane } from "./types";

/*
 * Add Blackout Date — the rules behind the drawer.
 *
 * Figma: Site Management Details (`5112:111649`) → `Action - Add Blackout Date`
 * (`5116:216631`). Everything here is derived from that section's frames; where a frame is
 * silent the choice is written next to the code and logged in the collaboration session.
 *
 * Pure functions only (no React), so Station Detail and Lane Detail share one source of truth
 * for the form values, the generated Summary, the overlapping-bookings alert and the record
 * that lands in the Blackout Dates table.
 *
 * Decisions taken with the product owner (session mielru-add-blackout-date-flow-20261012):
 *   · One-time = Repeat "Does not repeat". "No end date" no longer exists — Ends is
 *     "After N times" or "On date".
 *   · An end date (a multi-day blackout) is ONE continuous block: first day's start time
 *     through last day's end time. Figma only offers it while Repeat is "Does not repeat".
 *   · Recurring blackouts have no 3-year limit: "After N times" makes exactly N dates.
 *   · Dates are day-first, dd/mm/yyyy.
 *
 * Not defined in Figma, chosen here:
 *   · Monthly/semester/quarter "on day 31" skips months that have no day 31 (and Feb 29 yearly
 *     skips non-leap years) instead of moving the date. Skipped months are not counted.
 *   · A date that is the 4th/5th weekday AND the last one of its month reads "the last
 *     <Weekday>"; otherwise "the first … fourth".
 *   · An overlapping booking is one that is Upcoming or Ongoing and assigned to the station.
 *   · At most MAX_OCCURRENCES dates are generated — a technical guard, not a product limit.
 */

export type RepeatKind =
  | "none"
  | "annual"
  | "semester"
  | "quarter"
  | "monthlyDay"
  | "monthlyNth"
  | "custom";
export type CustomUnit = "day" | "week" | "month" | "year";
export type MonthMode = "day" | "nth";
export type EndsKind = "after" | "onDate";

export interface BlackoutFormValues {
  /** ISO yyyy-mm-dd, or "" while empty / half-typed. The field SHOWS dd/mm/yyyy. */
  startDate: string;
  /** Only meaningful while `hasEndDate`. */
  endDate: string;
  hasEndDate: boolean;
  allDay: boolean;
  /** One of TIME_OPTIONS, e.g. "09:00 AM", or "". */
  startTime: string;
  endTime: string;
  repeat: RepeatKind;
  /** Repeat → Custom: "Repeats every [n] [unit]". */
  every: number | "";
  unit: CustomUnit;
  /** Custom week: 0 = Sunday … 6 = Saturday. */
  weekdays: number[];
  /** Custom month: "On day 3" vs "On the first Monday". */
  monthMode: MonthMode;
  endsKind: EndsKind;
  /** Ends → After: number of dates. */
  endsAfter: number | "";
  /** Ends → On date, ISO. */
  endsOnDate: string;
}

export const INITIAL_BLACKOUT_VALUES: BlackoutFormValues = {
  startDate: "",
  endDate: "",
  hasEndDate: false,
  allDay: false,
  startTime: "",
  endTime: "",
  repeat: "none",
  every: 1,
  unit: "day",
  weekdays: [],
  monthMode: "day",
  endsKind: "after",
  // Every Figma frame shows 5 here, so 5 is the opening value.
  endsAfter: 5,
  endsOnDate: "",
};

export const REPEAT_KINDS: RepeatKind[] = [
  "none",
  "annual",
  "semester",
  "quarter",
  "monthlyDay",
  "monthlyNth",
  "custom",
];
export const CUSTOM_UNITS: CustomUnit[] = ["day", "week", "month", "year"];
/** Figma's weekday chips, Sunday first. */
export const WEEKDAY_CHIPS = ["S", "M", "T", "W", "T", "F", "S"];
export const MAX_OCCURRENCES = 1000;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINALS = ["first", "second", "third", "fourth"];

const pad = (n: number) => String(n).padStart(2, "0");
const DAY_MS = 86_400_000;

/* ── dates ─────────────────────────────────────────────────────────────── */

export function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const date = new Date(y, mo, d);
  return date.getFullYear() === y && date.getMonth() === mo && date.getDate() === d ? date : null;
}

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "03/11/2025" → "2025-11-03"; anything incomplete or impossible → "". */
export function parseDisplayDate(text: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return "";
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return parseISO(iso) ? iso : "";
}

/** "2025-11-03" → "03/11/2025". */
export function formatDisplayDate(iso: string): string {
  const d = parseISO(iso);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "";
}

/** "3 Nov 2025" — Figma's chips, summary and table all write dates this way. */
export const formatDay = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
/** "Mon, 3 Nov 2025" */
export const formatDayWithWeekday = (d: Date) => `${WEEKDAYS_SHORT[d.getDay()]}, ${formatDay(d)}`;

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** The date `day` of month `m` in year `y`, or null when that month has no such day. */
function dayInMonth(y: number, m: number, day: number): Date | null {
  const d = new Date(y, m, day);
  return d.getMonth() === m && d.getDate() === day ? d : null;
}

/* ── times ─────────────────────────────────────────────────────────────── */

export function timeToMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  return (Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + Number(m[2]);
}

export function minutesToTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  return `${pad(h24 % 12 || 12)}:${pad(min % 60)} ${h24 >= 12 ? "PM" : "AM"}`;
}

/* ── repeat wording (Figma's `Dropdown - Repeat` list) ─────────────────── */

/** For a date: which occurrence of its weekday is it — and is it the month's last? */
function nthInfo(d: Date): { nth: number; last: boolean } {
  const day = d.getDate();
  return {
    nth: Math.floor((day - 1) / 7) + 1,
    last: day + 7 > daysInMonth(d.getFullYear(), d.getMonth()),
  };
}

function nthLabel(d: Date): string {
  const { nth, last } = nthInfo(d);
  return last ? "last" : ORDINALS[nth - 1];
}

function nthWeekdayOfMonth(y: number, m: number, weekday: number, nth: number, last: boolean): Date | null {
  if (last) {
    const lastDay = new Date(y, m + 1, 0);
    return new Date(y, m, lastDay.getDate() - ((lastDay.getDay() - weekday + 7) % 7));
  }
  const first = new Date(y, m, 1);
  const day = 1 + ((weekday - first.getDay() + 7) % 7) + (nth - 1) * 7;
  return day <= daysInMonth(y, m) ? new Date(y, m, day) : null;
}

/** The label of one Repeat option. Without a date it can only be the bare pattern. */
export function repeatOptionLabel(kind: RepeatKind, start: Date | null): string {
  if (kind === "none") return "Does not repeat";
  if (kind === "custom") return "Custom";
  if (!start) {
    return {
      annual: "Annually",
      semester: "Every semester (6 months)",
      quarter: "Every quarter (3 months)",
      monthlyDay: "Monthly",
      monthlyNth: "Monthly",
    }[kind];
  }
  const day = start.getDate();
  switch (kind) {
    case "annual":
      return `Annually on ${day} ${MONTHS[start.getMonth()]}`;
    case "semester":
      return `Every semester (6 months) on day ${day}`;
    case "quarter":
      return `Every quarter (3 months) on day ${day}`;
    case "monthlyDay":
      return `Monthly on day ${day}`;
    case "monthlyNth":
      return `Monthly on the ${nthLabel(start)} ${WEEKDAYS_LONG[start.getDay()]}`;
  }
}

/** Custom → month: "On day 3" / "On the first Monday". */
export function monthModeLabel(mode: MonthMode, start: Date | null): string {
  if (!start) return mode === "day" ? "On day" : "On the same weekday";
  return mode === "day"
    ? `On day ${start.getDate()}`
    : `On the ${nthLabel(start)} ${WEEKDAYS_LONG[start.getDay()]}`;
}

/** Lower-case recurrence, as the Summary sentence says it: "every week on Mon". */
export function repeatPhrase(v: BlackoutFormValues, start: Date): string {
  const day = start.getDate();
  const monthName = MONTHS[start.getMonth()];
  const nthPhrase = `the ${nthLabel(start)} ${WEEKDAYS_LONG[start.getDay()]}`;
  const every = Math.max(1, Math.floor(Number(v.every)) || 1);
  const plural = (unit: string) => (every === 1 ? `every ${unit}` : `every ${every} ${unit}s`);

  switch (v.repeat) {
    case "annual":
      return `every year on ${day} ${monthName}`;
    case "semester":
      return `every 6 months on day ${day}`;
    case "quarter":
      return `every 3 months on day ${day}`;
    case "monthlyDay":
      return `every month on day ${day}`;
    case "monthlyNth":
      return `every month on ${nthPhrase}`;
    case "custom":
      switch (v.unit) {
        case "day":
          return plural("day");
        case "week": {
          const days = [...v.weekdays].sort((a, b) => a - b).map((i) => WEEKDAYS_SHORT[i]).join(", ");
          return `${plural("week")} on ${days}`;
        }
        case "month":
          return `${plural("month")} on ${v.monthMode === "day" ? `day ${day}` : nthPhrase}`;
        case "year":
          return `${plural("year")} on ${day} ${monthName}`;
      }
  }
  return "";
}

/* ── the dates a blackout covers ───────────────────────────────────────── */

function repeatPlan(v: BlackoutFormValues): { unit: CustomUnit; every: number; mode: MonthMode } {
  const every = Math.max(1, Math.floor(Number(v.every)) || 1);
  switch (v.repeat) {
    case "annual":
      return { unit: "year", every: 1, mode: "day" };
    case "semester":
      return { unit: "month", every: 6, mode: "day" };
    case "quarter":
      return { unit: "month", every: 3, mode: "day" };
    case "monthlyDay":
      return { unit: "month", every: 1, mode: "day" };
    case "monthlyNth":
      return { unit: "month", every: 1, mode: "nth" };
    default:
      return { unit: v.unit, every, mode: v.monthMode };
  }
}

/** The first day of every occurrence, oldest first. */
export function generateOccurrences(v: BlackoutFormValues): Date[] {
  const start = parseISO(v.startDate);
  if (!start) return [];
  if (v.repeat === "none") return [start];

  const endOn = v.endsKind === "onDate" ? parseISO(v.endsOnDate) : null;
  const wanted = v.endsKind === "after" ? Math.floor(Number(v.endsAfter)) : MAX_OCCURRENCES;
  if (v.endsKind === "after" && !(wanted >= 1)) return [];
  if (v.endsKind === "onDate" && (!endOn || endOn < start)) return [];
  const limit = Math.min(wanted, MAX_OCCURRENCES);

  const out: Date[] = [];
  /** Takes one candidate; false = stop generating. Days before the start are skipped, not counted. */
  const accept = (d: Date): boolean => {
    if (d < start) return true;
    if (endOn && d > endOn) return false;
    out.push(d);
    return out.length < limit;
  };

  const plan = repeatPlan(v);
  if (plan.unit === "day") {
    for (let k = 0; k < 100_000; k++) if (!accept(addDays(start, k * plan.every))) break;
  } else if (plan.unit === "week") {
    const days = [...v.weekdays].filter((i) => i >= 0 && i <= 6).sort((a, b) => a - b);
    if (days.length === 0) return [];
    const base = addDays(start, -start.getDay());
    outer: for (let w = 0; w < 20_000; w++) {
      const weekStart = addDays(base, 7 * plan.every * w);
      if (endOn && weekStart > endOn) break;
      for (const wd of days) if (!accept(addDays(weekStart, wd))) break outer;
    }
  } else if (plan.unit === "month") {
    const { nth, last } = nthInfo(start);
    for (let k = 0; k < 12_000; k++) {
      const idx = start.getMonth() + k * plan.every;
      const y = start.getFullYear() + Math.floor(idx / 12);
      const m = idx % 12;
      if (endOn && new Date(y, m, 1) > endOn) break;
      const d =
        plan.mode === "day"
          ? dayInMonth(y, m, start.getDate())
          : nthWeekdayOfMonth(y, m, start.getDay(), nth, last);
      if (d && !accept(d)) break;
    }
  } else {
    for (let k = 0; k < 2_000; k++) {
      const y = start.getFullYear() + k * plan.every;
      if (endOn && new Date(y, 0, 1) > endOn) break;
      const d = dayInMonth(y, start.getMonth(), start.getDate());
      if (d && !accept(d)) break;
    }
  }
  return out;
}

/* ── readiness, summary ────────────────────────────────────────────────── */

/** The end date only counts for a one-time blackout — Figma hides "Add End Date" otherwise. */
function endDateOf(v: BlackoutFormValues): Date | null {
  return v.repeat === "none" && v.hasEndDate ? parseISO(v.endDate) : null;
}

/** Enough is filled in, and consistent, to describe the blackout and look for clashes. */
export function isReady(v: BlackoutFormValues): boolean {
  const start = parseISO(v.startDate);
  if (!start) return false;

  if (v.repeat === "none" && v.hasEndDate) {
    const end = parseISO(v.endDate);
    if (!end || end < start) return false;
  }
  if (!v.allDay) {
    const s = timeToMinutes(v.startTime);
    const e = timeToMinutes(v.endTime);
    if (s === null || e === null) return false;
    const end = endDateOf(v);
    const sameDay = !end || toISO(end) === toISO(start);
    if (sameDay && e <= s) return false;
  }
  if (v.repeat !== "none") {
    if (v.repeat === "custom") {
      if (!(Number(v.every) >= 1)) return false;
      if (v.unit === "week" && v.weekdays.length === 0) return false;
    }
    if (v.endsKind === "after") {
      if (!(Math.floor(Number(v.endsAfter)) >= 1)) return false;
    } else {
      const endsOn = parseISO(v.endsOnDate);
      if (!endsOn || endsOn < start) return false;
    }
  }
  return true;
}

export interface BlackoutSummaryData {
  sentence: string;
  dates: Date[];
  first: Date;
  last: Date;
}

/** Figma's Summary: one sentence, then "N blackouts in total. Dates:" with a chip per date. */
export function describeBlackout(v: BlackoutFormValues): BlackoutSummaryData | null {
  if (!isReady(v)) return null;
  const start = parseISO(v.startDate)!;
  const dates = generateOccurrences(v);
  if (dates.length === 0) return null;
  const first = dates[0];
  const last = dates[dates.length - 1];
  const when = v.allDay ? "all day" : `from ${v.startTime} to ${v.endTime}`;

  let sentence: string;
  if (v.repeat === "none") {
    const end = endDateOf(v);
    sentence =
      end && toISO(end) !== toISO(start)
        ? `Blocks ${formatDayWithWeekday(start)} to ${formatDay(end)}, ${when}.`
        : `Blocks ${formatDayWithWeekday(start)}, ${when}.`;
  } else {
    sentence = `Blocks ${repeatPhrase(v, start)}, ${when}, from ${formatDay(first)} to ${formatDay(last)}.`;
  }
  return { sentence, dates, first, last };
}

/* ── overlapping bookings (Figma's "N existing bookings overlap this blackout") ── */

interface Window {
  start: number;
  end: number;
}

/** One continuous block per occurrence: its first day's start through the last day's end. */
function occurrenceWindows(v: BlackoutFormValues, dates: Date[]): Window[] {
  const startMin = v.allDay ? 0 : (timeToMinutes(v.startTime) ?? 0);
  const endMin = v.allDay ? 24 * 60 : (timeToMinutes(v.endTime) ?? 24 * 60);
  const end = endDateOf(v);
  const span = end && dates[0] ? daysBetween(dates[0], end) : 0;
  return dates.map((d) => ({
    start: d.getTime() + startMin * 60_000,
    end: addDays(d, span).getTime() + endMin * 60_000,
  }));
}

interface BookingDay extends Window {
  day: Date;
  session: string;
  timeLabel: string;
}

/**
 * A booking's day(s) and time window, read from the mock's display strings:
 *   bookingDate "22 Apr 2026" / "22, 23 Apr 2026"
 *   bookingTime "22 Apr 2026\n08:00 AM - 12:00 PM (AM Session)" (or 24h "13:00 - 17:00")
 */
function bookingDays(b: Booking): BookingDay[] {
  const dm = /^([\d,\s]+?)\s+([A-Za-z]{3})\s+(\d{4})$/.exec(b.bookingDate.trim());
  if (!dm) return [];
  const month = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === dm[2].toLowerCase());
  if (month < 0) return [];

  const line = b.bookingTime.split("\n")[1] ?? b.bookingTime;
  const times = [...line.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi)];
  if (times.length < 2) return [];
  const toMin = (m: RegExpMatchArray) => {
    const mer = m[3]?.toUpperCase();
    const h = mer ? (Number(m[1]) % 12) + (mer === "PM" ? 12 : 0) : Number(m[1]);
    return h * 60 + Number(m[2]);
  };
  const s = toMin(times[0]);
  const e = toMin(times[times.length - 1]);
  const session = /\(([^()]+)\)\s*$/.exec(line.trim())?.[1] ?? "Session";

  return dm[1]
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => n >= 1 && n <= 31)
    .map((n) => {
      const day = new Date(Number(dm[3]), month, n);
      return {
        day,
        start: day.getTime() + s * 60_000,
        end: day.getTime() + e * 60_000,
        session,
        timeLabel: `${minutesToTime(s)} - ${minutesToTime(e)}`,
      };
    });
}

export interface ConflictRow {
  id: string;
  /** "#251101-WPT015" — shown bold. */
  bookingId: string;
  /** "Collective Training for Unit Beta" */
  name: string;
  /** "3 Nov 2025 · AM Session (08:00 AM - 12:00 PM)" */
  when: string;
}

const OCCUPYING: Booking["status"][] = ["Upcoming", "Ongoing"];

/** Bookings on `stationName` that this blackout would cut across — one row per booking. */
export function findConflicts(
  v: BlackoutFormValues,
  stationName: string,
  allBookings: Booking[],
): ConflictRow[] {
  if (!isReady(v)) return [];
  const windows = occurrenceWindows(v, generateOccurrences(v));
  const rows: ConflictRow[] = [];

  for (const b of allBookings) {
    if (!OCCUPYING.includes(b.status) || !(b.assignedStations ?? []).includes(stationName)) continue;
    const hit = bookingDays(b).find((bd) =>
      windows.some((w) => w.start < bd.end && bd.start < w.end),
    );
    if (!hit) continue;
    rows.push({
      id: b.id,
      bookingId: b.bookingId,
      name: `${b.trainingMode} Training for Unit ${b.unitName}`,
      when: `${formatDay(hit.day)} · ${hit.session} (${hit.timeLabel})`,
    });
  }
  return rows;
}

/* ── the record that lands in the Blackout Dates table ─────────────────── */

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Builds one Blackout Dates row in the table's shape (`BlackoutDateCell` draws repeat / clock /
 * calendar lines). `status` is derived — Passed once the last date has ended — and `nextDate`
 * is the first date still ahead, for recurring blackouts only.
 */
export function buildBlackoutRecord(v: BlackoutFormValues): BlackoutDate {
  const start = parseISO(v.startDate);
  const dates = generateOccurrences(v);
  const recurring = v.repeat !== "none";
  const first = dates[0] ?? start;
  const last = dates[dates.length - 1] ?? start;

  const recurrence = recurring && start ? capitalise(repeatPhrase(v, start)) : undefined;
  const timeRange = v.allDay ? "All day" : `${v.startTime} - ${v.endTime}`;

  let dateRange = "";
  if (recurring) {
    dateRange = first && last ? `${formatDay(first)} - ${formatDay(last)}` : "";
  } else if (start) {
    const end = endDateOf(v);
    dateRange =
      end && toISO(end) !== toISO(start) ? `${formatDay(start)} - ${formatDay(end)}` : formatDay(start);
  }

  const endOfLast =
    last && dates.length
      ? occurrenceWindows(v, [last])[0].end
      : start
        ? start.getTime()
        : 0;
  const status: BlackoutDate["status"] = endOfLast < Date.now() ? "Passed" : "Active";

  let nextDate: string | undefined;
  if (recurring && status === "Active") {
    const today = new Date();
    const ahead = dates.find((d) => addDays(d, 1) > new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    if (ahead) nextDate = formatDay(ahead);
  }

  return {
    label: [dateRange, recurrence, timeRange].filter(Boolean).join("\n"),
    recurring,
    status,
    recurrence,
    timeRange,
    dateRange,
    nextDate,
    allDay: v.allDay,
    occurrences: occurrenceWindows(v, dates).map((w) => ({
      start: toLocalDateTime(new Date(w.start)),
      end: toLocalDateTime(new Date(w.end)),
    })),
  };
}

/* ── lane status + "Next Blackout Date" (Base Station Details → Lanes) ─────
 *
 * Figma: `Lane - Filled` (`5115:207624`) and its Notes (`6921:238015`):
 *   "Active & inactive station & lane comes from lane blackout date."
 * So a lane's pill is DERIVED — Unavailable while one of its blackouts is running, Available
 * otherwise — and there is no manual switch.
 *
 * Next Blackout Date cell, as drawn in that frame:
 *   running now   → "Now, until 11:00 PM"                         (one line)
 *   upcoming      → "10 Oct 2026, All day"  /  "Tomorrow"  /  "View all (12)"
 *   none left     → "—"
 * Line 1 writes the time the way the Site Management list does ("9 Oct 2026, 10:00 PM-11:00 PM").
 * Line 2 uses the relative words of the Blackout Dates tab (`5115:214445`): Today · Tomorrow ·
 * in 5 days · in 3 weeks. "View all (n)" counts every window not yet over and only shows when
 * there is more than the one already written (Figma Notes `7980:4483`: it opens the details).
 *
 * Not drawn in Figma, chosen here: an all-day blackout running now reads "Now, All day"; one
 * that ends on a later day reads "Now, until 18 Oct 2026, 11:00 PM"; 60+ days ahead reads
 * "in N months".
 */

const toLocalDateTime = (d: Date) => `${toISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const clock = (d: Date) => minutesToTime(d.getHours() * 60 + d.getMinutes());

interface LaneWindow {
  start: Date;
  end: Date;
  allDay: boolean;
}

const asRecord = (d: string | BlackoutDate): BlackoutDate => (typeof d === "string" ? { label: d } : d);

function recordWindows(rec: BlackoutDate): LaneWindow[] {
  return (rec.occurrences ?? []).map((o: BlackoutOccurrence) => ({
    start: new Date(o.start),
    end: new Date(o.end),
    allDay: !!rec.allDay,
  }));
}

/** A blackout record still counts while any of its windows has not ended (or, without windows, until it is Passed). */
export function isBlackoutActive(rec: string | BlackoutDate, now: Date = new Date()): boolean {
  const r = asRecord(rec);
  if (r.occurrences?.length) return recordWindows(r).some((w) => w.end > now);
  return r.status !== "Passed";
}

/** Windows of all the lane's blackouts that have not ended yet, soonest first. */
function laneWindowsAhead(lane: Lane, now: Date): LaneWindow[] {
  return (lane.blackoutDates ?? [])
    .flatMap((d) => recordWindows(asRecord(d)))
    .filter((w) => w.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Unavailable while one of the lane's blackouts is running right now. */
export function isLaneBlackedOut(lane: Lane, now: Date = new Date()): boolean {
  return laneWindowsAhead(lane, now).some((w) => w.start <= now);
}

/** "Today" · "Tomorrow" · "in 5 days" · "in 3 weeks" · "in 2 months". */
export function relativeDay(target: Date, now: Date = new Date()): string {
  const days = daysBetween(startOfDay(now), startOfDay(target));
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.floor(days / 7)} weeks`;
  return `in ${Math.floor(days / 30)} months`;
}

export interface NextBlackoutText {
  /** Line 1, 14 Regular default. */
  primary: string;
  /** Line 2, 12 Regular body — upcoming only. */
  relative?: string;
  /** "View all (n)" — only when more than one window is left. */
  total?: number;
}

/** The lane's Next Blackout Date cell, or null for "—". */
export function nextLaneBlackout(lane: Lane, now: Date = new Date()): NextBlackoutText | null {
  const ahead = laneWindowsAhead(lane, now);
  if (ahead.length === 0) return null;
  const total = ahead.length > 1 ? ahead.length : undefined;
  const running = ahead.find((w) => w.start <= now);

  if (running) {
    const sameDay = toISO(running.end) === toISO(now);
    const endsAtMidnight = running.end.getHours() === 0 && running.end.getMinutes() === 0;
    let primary: string;
    if (running.allDay && toISO(addDays(startOfDay(now), 1)) === toISO(running.end) && endsAtMidnight) {
      primary = "Now, All day";
    } else if (sameDay) {
      primary = `Now, until ${clock(running.end)}`;
    } else {
      const lastDay = endsAtMidnight ? addDays(running.end, -1) : running.end;
      primary = running.allDay
        ? `Now, until ${formatDay(lastDay)}`
        : `Now, until ${formatDay(running.end)}, ${clock(running.end)}`;
    }
    return { primary, total };
  }

  const next = ahead[0];
  const when = next.allDay ? "All day" : `${clock(next.start)}-${clock(next.end)}`;
  return { primary: `${formatDay(next.start)}, ${when}`, relative: relativeDay(next.start, now), total };
}
