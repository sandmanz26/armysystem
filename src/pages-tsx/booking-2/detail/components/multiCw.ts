// Booking Details 2.0 — booking with MULTIPLE courseware (Figma page `Booking Details: Upcoming`,
// 5834:183279 › frame `Details` 5834:183285). Shared state + schedule helpers for
// `MultiCwDetails` (the page body) and `MultiCwActions` (the "Select a courseware to …" flows).
import { useMemo, useState } from "react";
import type { Booking } from "@/data/mock";
import { formatBookingTime } from "@/pages-tsx/booking-2/components/formatBookingTime";

export type SessionKind = "AM Session" | "PM Session" | "Full Day" | "Ad-hoc" | "Hourly";

export interface CwSchedule {
  /** "28 Apr 2026" */
  date: string;
  kind: SessionKind | null;
  /** "08:00 AM" / "12:00 PM" — empty when the source line can't be parsed. */
  start: string;
  end: string;
}

export interface MultiCw {
  index: number;
  name: string;
  baseStation?: string;
  schedule: CwSchedule;
  assignmentId?: string;
  cancelled: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "AM Session (08:00 AM - 12:00 PM)" / "Ad-hoc (09:00 AM - 11:00 AM)" → kind + clock range. */
function parseTimeLine(date: string, line: string): CwSchedule {
  const m = line.match(/^(AM Session|PM Session|Full Day|Ad-hoc|Hourly)\s*\((\d{2}:\d{2} [AP]M)\s*-\s*(\d{2}:\d{2} [AP]M)\)$/);
  return m
    ? { date, kind: m[1] as SessionKind, start: m[2], end: m[3] }
    : { date, kind: null, start: "", end: "" };
}

/** Mock `coursewareDetails[i].schedule` — "28 Apr 2026 · AM Session (08:00 AM - 12:00 PM)". */
function parseDetailSchedule(s: string): CwSchedule {
  const [date, rest = ""] = s.split(" · ");
  return parseTimeLine(date.trim(), rest.trim());
}

/** The booking's own two-line `bookingTime` ("date\ntime (Session)"), for courseware without details. */
export function parseBookingTime(bookingTime: string): CwSchedule {
  const [date = "", raw = ""] = (bookingTime ?? "").split("\n");
  return parseTimeLine(date.trim(), formatBookingTime(raw));
}

/** Session line as the single-CW page prints it: "AM Session (08:00 AM - 12:00 PM)". */
export const sessionLine = (s: CwSchedule) => (s.kind ? `${s.kind} (${s.start} - ${s.end})` : "");

/**
 * Courseware list rows (5834:183285 `Courseware Vertical - Selection` › Schedule): two 12px lines —
 * date over session; an Ad-hoc slot puts the clock on the date line and "Ad-hoc" below it.
 */
export const listLines = (s: CwSchedule): [string, string] =>
  s.kind === "Ad-hoc" ? [`${s.date} ${s.start} - ${s.end}`, "Ad-hoc"] : [s.date, sessionLine(s)];

/**
 * One-line schedule used by the Select Courseware tiles (6495:75080) and the cancel confirmation
 * bullets (6501:286603): "24 Nov 2025 · AM Session (08:00 AM - 12:00 PM)"; Ad-hoc as
 * "13 Nov 2025 09:00 AM - 03:00 PM · Ad-hoc".
 */
export const oneLine = (s: CwSchedule) =>
  s.kind === "Ad-hoc" ? `${s.date} ${s.start} - ${s.end} · Ad-hoc` : s.kind ? `${s.date} · ${sessionLine(s)}` : s.date;

export const toMinutes = (t: string) => {
  const m = t.match(/^(\d{2}):(\d{2}) (AM|PM)$/);
  return m ? ((Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + Number(m[2]) : 0;
};
const dayIndex = (d: string) => {
  const m = d.match(/^(\d{1,2}) (\w{3}) (\d{4})$/);
  return m ? Number(m[3]) * 372 + MONTHS.indexOf(m[2]) * 31 + Number(m[1]) : 0;
};
const stamp = (s: CwSchedule, t: string) => dayIndex(s.date) * 1440 + toMinutes(t);

/** Overview "Total Booking Time": "24 Nov 2025, 08:00 AM to 25 Nov 2025, 05:00 PM". */
export function bookingRange(list: MultiCw[]): string {
  const timed = list.filter((c) => c.schedule.start && c.schedule.end);
  if (!timed.length) return list[0]?.schedule.date ?? "-";
  const first = timed.reduce((a, b) => (stamp(b.schedule, b.schedule.start) < stamp(a.schedule, a.schedule.start) ? b : a));
  const last = timed.reduce((a, b) => (stamp(b.schedule, b.schedule.end) > stamp(a.schedule, a.schedule.end) ? b : a));
  return `${first.schedule.date}, ${first.schedule.start} to ${last.schedule.date}, ${last.schedule.end}`;
}

/** Courseware names of a booking — the mock keeps them comma-joined in `courseware`. */
export const coursewareNames = (b: Booking) => b.courseware.split(",").map((c) => c.trim()).filter(Boolean);

/**
 * Multi-courseware state owned by the detail page: per-courseware reschedules and cancellations,
 * plus which courseware is selected in the left list.
 */
export function useMultiCw(booking: Booking | undefined) {
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<number, CwSchedule>>({});
  const [cancelledIdx, setCancelledIdx] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);

  const list = useMemo<MultiCw[]>(() => {
    if (!booking) return [];
    return coursewareNames(booking).map((name, i) => {
      const detail = booking.coursewareDetails?.[i];
      return {
        index: i,
        name,
        baseStation: detail?.baseStation ?? booking.assignedStations?.[0],
        schedule: scheduleOverrides[i] ?? (detail ? parseDetailSchedule(detail.schedule) : parseBookingTime(booking.bookingTime)),
        // Without per-courseware details the booking's single Assignment ID covers every courseware.
        assignmentId: booking.coursewareDetails ? detail?.assignmentId : booking.assetIssued ? booking.assignmentId : undefined,
        cancelled: cancelledIdx.includes(i),
      };
    });
  }, [booking, scheduleOverrides, cancelledIdx]);

  return {
    list,
    selected: Math.min(selected, Math.max(list.length - 1, 0)),
    setSelected,
    reschedule: (index: number, bookingTime: string) =>
      setScheduleOverrides((prev) => ({ ...prev, [index]: parseBookingTime(bookingTime) })),
    cancel: (indexes: number[]) => setCancelledIdx((prev) => [...new Set([...prev, ...indexes])]),
  };
}

export type MultiCwState = ReturnType<typeof useMultiCw>;
