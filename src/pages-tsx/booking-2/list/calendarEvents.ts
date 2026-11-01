// Booking List 2.0 calendar — turns a booking's free-text date/time into
// placeable events. Figma `Booking List - Calendar - Daniel` (7602:81034).
import type { Booking } from "@/data/mock";
import { bookingDateKeys, dateKey } from "@/pages-tsx/booking/list/utils";

/** Figma's schedule word on the card ("Completed · AM"). Individual bookings
 *  are always Hourly (PRD §5.2.3); Group Ad-hoc is a custom start/end. */
export type ScheduleKind = "AM" | "PM" | "Full Day" | "Hourly" | "Ad-hoc";

export interface CalEvent {
  booking: Booking;
  schedule: ScheduleKind;
  /** All-day strip (Full Day, multi-day Ad-hoc) vs the hour grid. */
  allDay: boolean;
  /** Inclusive day range, as `YYYY-MM-DD` keys. */
  startKey: string;
  endKey: string;
  /** Minutes from midnight, timed events only. */
  startMin: number;
  endMin: number;
  /** "08:00 AM - 09:00 AM" or "24 Nov 08:00 AM - 26 Nov 2025 05:00 PM". */
  timeText: string;
  stations: string[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toMinutes(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export function formatClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ap = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

function shortDay(key: string, withYear: boolean): string {
  const [y, mo, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[mo - 1]}${withYear ? ` ${y}` : ""}`;
}

/** One booking can yield several events (a PM session on 22 and 23 Apr is two
 *  separate sessions); a multi-day Ad-hoc yields ONE spanning event. */
export function eventsFor(b: Booking): CalEvent[] {
  const keys = bookingDateKeys(b.bookingDate).sort();
  if (keys.length === 0) return [];
  const raw = b.bookingTime ?? "";
  const stations = b.assignedStations ?? [];

  const times = [...raw.matchAll(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/gi)].map((m) => toMinutes(m[1])).filter((n): n is number => n != null);
  const [t0, t1] = [times[0], times[1]];

  const isFull = /full\s*day/i.test(raw);
  const isAdhoc = /ad-?hoc/i.test(raw);
  const isAM = /AM Session/i.test(raw);
  const isPM = /PM Session/i.test(raw);

  const base = { booking: b, stations };

  if (isAdhoc && keys.length > 1) {
    const start = t0 ?? 8 * 60;
    const end = t1 ?? 17 * 60;
    return [{
      ...base, schedule: "Ad-hoc", allDay: true, startKey: keys[0], endKey: keys[keys.length - 1],
      startMin: start, endMin: end,
      timeText: `${shortDay(keys[0], false)} ${formatClock(start)} - ${shortDay(keys[keys.length - 1], true)} ${formatClock(end)}`,
    }];
  }

  if (isFull) {
    return keys.map((k) => ({ ...base, schedule: "Full Day" as const, allDay: true, startKey: k, endKey: k, startMin: 8 * 60, endMin: 17 * 60, timeText: "" }));
  }

  const schedule: ScheduleKind = isAM ? "AM" : isPM ? "PM" : b.trainingType === "Individual" ? "Hourly" : isAdhoc ? "Ad-hoc" : "AM";
  const start = t0 ?? (schedule === "PM" ? 13 * 60 : 8 * 60);
  const end = t1 ?? (schedule === "PM" ? 17 * 60 : 12 * 60);
  const showTime = schedule === "Hourly" || schedule === "Ad-hoc";
  return keys.map((k) => ({
    ...base, schedule, allDay: false, startKey: k, endKey: k, startMin: start, endMin: Math.max(end, start + 30),
    timeText: showTime ? `${formatClock(start)} - ${formatClock(end)}` : "",
  }));
}

export function allEvents(bookings: Booking[]): CalEvent[] {
  return bookings.flatMap(eventsFor);
}

export function eventsOnDay(events: CalEvent[], key: string): CalEvent[] {
  return events.filter((e) => e.startKey <= key && key <= e.endKey);
}

export { dateKey };

/** Lane layout for overlapping timed events: each overlapping cluster gets as
 *  many lanes as it needs; events past `maxLanes` are counted, not drawn. */
export interface LaidOut {
  event: CalEvent;
  lane: number;
  lanes: number;
}

export interface Overflow {
  count: number;
  /** Where the "+N more" box sits — the end of the cluster it belongs to. */
  atMin: number;
}

export function layoutDay(events: CalEvent[], maxLanes: number): { placed: LaidOut[]; overflow: Overflow[] } {
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const placed: LaidOut[] = [];
  const overflow: Overflow[] = [];
  let cluster: { e: CalEvent; lane: number }[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const lanes = Math.min(maxLanes, Math.max(...cluster.map((c) => c.lane)) + 1);
    let hidden = 0;
    for (const c of cluster) {
      if (c.lane < maxLanes) placed.push({ event: c.e, lane: c.lane, lanes });
      else hidden++;
    }
    if (hidden > 0) overflow.push({ count: hidden, atMin: clusterEnd });
    cluster = [];
  };

  for (const e of sorted) {
    if (e.startMin >= clusterEnd) {
      flush();
      clusterEnd = e.endMin;
    }
    const used = new Set(cluster.filter((c) => c.e.endMin > e.startMin).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ e, lane });
    clusterEnd = Math.max(clusterEnd, e.endMin);
  }
  flush();
  return { placed, overflow };
}
