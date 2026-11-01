import type { Lane, BaseStation, BlackoutDate } from "@/pages-tsx/site-management/types";
export type {
  LaneStatus,
  StationStatus,
  Lane,
  BlackoutDate,
  BaseStation,
} from "@/pages-tsx/site-management/types";

function makeLanes(count: number, inactiveIdx: number[] = []): Lane[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Lane ${i + 1}`,
    status: inactiveIdx.includes(i + 1) ? "Inactive" : "Active",
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  }));
}

/*
 * WPT-01 — shaped like Figma `Lane - Filled` (`5115:207624`): 15 lanes, Lane 1 blacked out
 * right now ("Now, until 11:00 PM" → Unavailable), Lane 2 with a weekly all-day blackout
 * starting tomorrow ("Tomorrow" · "View all (12)"). Lane 12 (page 2) has a one-time blackout
 * in 5 days. Dates are built from TODAY so the demo never goes stale; the lane pill and the
 * Next Blackout Date text are derived from them (blackoutRules.ts → nextLaneBlackout).
 */
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const p2 = (n: number) => String(n).padStart(2, "0");
const dayFromToday = (offset: number) => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset);
};
const isoDate = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const at = (d: Date, hhmm: string) => `${isoDate(d)}T${hhmm}`;
const dayLabel = (d: Date) => `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

function oneTimeBlackout(offset: number, from: string, to: string, timeRange: string): BlackoutDate {
  const d = dayFromToday(offset);
  return {
    label: `${dayLabel(d)}\n${timeRange}`,
    recurring: false,
    status: "Active",
    timeRange,
    dateRange: dayLabel(d),
    allDay: false,
    occurrences: [{ start: at(d, from), end: at(d, to) }],
  };
}

function weeklyAllDayBlackout(offset: number, count: number): BlackoutDate {
  const days = Array.from({ length: count }, (_, i) => dayFromToday(offset + i * 7));
  const recurrence = `Every week on ${SHORT_DAYS[days[0].getDay()]}`;
  const dateRange = `${dayLabel(days[0])} - ${dayLabel(days[count - 1])}`;
  return {
    label: `${dateRange}\n${recurrence}\nAll day`,
    recurring: true,
    status: "Active",
    recurrence,
    timeRange: "All day",
    dateRange,
    nextDate: dayLabel(days[0]),
    allDay: true,
    occurrences: days.map((d) => ({
      start: at(d, "00:00"),
      end: at(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), "00:00"),
    })),
  };
}

const WPT01_UPDATED = [
  "6 Jun 2026\n11:09 PM", "25 May 2026\n03:45 PM", "20 May 2026\n11:30 AM", "15 May 2026\n07:15 PM",
  "1 May 2026\n09:00 AM", "29 Apr 2026\n01:20 PM", "28 Apr 2026\n05:55 AM", "21 Apr 2026\n10:10 PM",
  "15 Apr 2026\n02:45 AM", "13 Apr 2026\n08:30 PM", "10 Apr 2026\n09:15 AM", "8 Apr 2026\n04:40 PM",
  "6 Apr 2026\n10:05 AM", "3 Apr 2026\n02:20 PM", "1 Apr 2026\n08:00 AM",
];

const WPT01_BLACKOUTS: Record<number, BlackoutDate[]> = {
  1: [oneTimeBlackout(0, "06:00", "23:00", "06:00 AM - 11:00 PM")],
  2: [weeklyAllDayBlackout(1, 12)],
  12: [oneTimeBlackout(5, "08:00", "10:00", "08:00 AM - 10:00 AM")],
};

const wpt01Lanes: Lane[] = WPT01_UPDATED.map((lastUpdatedOn, i) => ({
  id: String(i + 1),
  name: `Lane ${i + 1}`,
  status: "Active",
  blackoutDates: WPT01_BLACKOUTS[i + 1] ?? [],
  lastUpdatedOn,
}));

/*
 * Base By Daniel — the station whose Blackout Dates tab is filled, shaped like Figma
 * `Blackout Dates - Filled` (`5115:214445`): every row carries its own recurrence / date /
 * time lines AND the concrete `occurrences`, so the tab can derive Active vs Passed, the
 * relative "Next Blackout Date" ("Today, 06:00 PM", "Tomorrow", "in 5 days") and the
 * "View upcoming (n)" tooltip from the clock. Dates are built from TODAY so the demo never
 * goes stale. Text uses Figma's en dash ("5 – 16 Oct 2026", "06:00 PM – 11:00 PM").
 */
const rangeLabel = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
    ? `${a.getDate()} – ${b.getDate()} ${SHORT_MONTHS[b.getMonth()]} ${b.getFullYear()}`
    : `${dayLabel(a)} – ${dayLabel(b)}`;

function datedBlackout(o: {
  days: Date[];
  recurrence?: string;
  timeRange: string;
  /** Local "HH:MM" window; omit for an all-day blackout. */
  window?: [string, string];
  passed?: boolean;
}): BlackoutDate {
  const first = o.days[0];
  const last = o.days[o.days.length - 1];
  const dateRange = o.days.length > 1 ? rangeLabel(first, last) : dayLabel(first);
  const allDay = !o.window;
  const occurrences = o.days.map((d) => ({
    start: at(d, o.window ? o.window[0] : "00:00"),
    end: o.window ? at(d, o.window[1]) : at(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), "00:00"),
  }));
  const next = o.passed ? undefined : o.days.find((d) => d.getTime() >= dayFromToday(0).getTime());
  return {
    label: [dateRange, o.recurrence, o.timeRange].filter(Boolean).join("\n"),
    recurring: !!o.recurrence,
    status: o.passed ? "Passed" : "Active",
    recurrence: o.recurrence,
    timeRange: o.timeRange,
    dateRange,
    nextDate: next ? dayLabel(next) : undefined,
    allDay,
    occurrences,
  };
}

const daysFrom = (offset: number, count: number, stepDays: number) =>
  Array.from({ length: count }, (_, i) => dayFromToday(offset + i * stepDays));
const weekendDays = (offset: number, weeks: number) =>
  Array.from({ length: weeks * 7 }, (_, i) => dayFromToday(offset + i)).filter(
    (d) => d.getDay() === 0 || d.getDay() === 6,
  );

const BASE_BY_DANIEL_BLACKOUTS: BlackoutDate[] = [
  datedBlackout({ days: daysFrom(-4, 12, 1), recurrence: "Daily", timeRange: "06:00 PM – 11:00 PM", window: ["18:00", "23:00"] }),
  datedBlackout({ days: weekendDays(-6, 20), recurrence: "Weekly on Sat, Sun", timeRange: "All day" }),
  datedBlackout({ days: [dayFromToday(5)], timeRange: "08:00 AM – 10:00 AM", window: ["08:00", "10:00"] }),
  datedBlackout({ days: daysFrom(12, 3, 1), timeRange: "All day" }),
  datedBlackout({
    days: [0, 2, 4].map((m) => new Date(dayFromToday(11).getFullYear(), dayFromToday(11).getMonth() + m, dayFromToday(11).getDate())),
    recurrence: `Every 2 months on day ${dayFromToday(11).getDate()}`,
    timeRange: "01:00 PM – 05:00 PM",
    window: ["13:00", "17:00"],
  }),
  datedBlackout({ days: daysFrom(-18, 1, 1), timeRange: "08:00 AM – 10:00 AM", window: ["08:00", "10:00"], passed: true }),
  datedBlackout({ days: [new Date(2023, 11, 25), new Date(2024, 11, 25), new Date(2025, 11, 25)], recurrence: "Annually on 25 Dec", timeRange: "All day", passed: true }),
];

export const baseStations: BaseStation[] = [
  {
    id: "1",
    name: "Base By Daniel",
    status: "Active",
    lanes: [],
    blackoutDates: BASE_BY_DANIEL_BLACKOUTS,
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "2",
    name: "Base By Daniel 2",
    status: "Active",
    lanes: [],
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "3",
    name: "WPT-01",
    status: "Active",
    lanes: wpt01Lanes,
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n02:58 PM",
  },
  {
    id: "4",
    name: "WPT-02",
    status: "Active",
    lanes: makeLanes(10, [10]),
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "5",
    name: "WPT-03",
    status: "Active",
    lanes: makeLanes(10, [10]),
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "6",
    name: "WPT-04",
    status: "Active",
    lanes: makeLanes(10),
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "7",
    name: "WPT-05",
    status: "Active",
    lanes: makeLanes(10),
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
  {
    id: "8",
    name: "WPT-06",
    status: "Active",
    lanes: makeLanes(10),
    blackoutDates: [],
    lastUpdatedOn: "21 Apr 2026\n01:17:41 PM",
  },
];
