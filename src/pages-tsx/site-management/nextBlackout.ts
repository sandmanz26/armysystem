import type { BlackoutDate } from "./types";
import { formatDay, formatDayWithWeekday, minutesToTime, toISO } from "./blackoutRules";

/*
 * "Next Blackout Date" cell of Base Station Details → Blackout Dates tab.
 *
 * Figma `Blackout Dates - Filled` (`5115:214445`) draws, per row:
 *   line 1  the date of the next occurrence            "9 Oct 2026"           14 Regular default
 *   line 2  when, relative to now                       "Today, 06:00 PM"      12 Regular body
 *   link    "View upcoming (7)" — only when more dates follow; hovering it opens the dark
 *           tooltip `Tooltip - Blackout Dates - Upcoming` (`7980:81954`): a bold
 *           "Upcoming blackouts" and one date per line ("Sat, 10 Oct 2026").
 *   none    "—" once every date has passed.
 *
 * Relative wording, read off the frame (now = 9 Oct 2026): 0 days "Today, <start time>",
 * 1 "Tomorrow", 5/6/11/12 "in N days", 24 "in 3 weeks", 25 "in 4 weeks", 33 "in 5 weeks",
 * 53 and 68 "in 2 months", 84 "in 3 months" — i.e. days under 14, then weeks / months ROUNDED
 * (floor would give "in 3 weeks" for 25 days and "in 2 months" for 84).
 *
 * "View upcoming (n)" counts the dates AFTER the one already written on line 1 (Daily
 * 5–16 Oct, next 9 Oct → 7: the 10th…16th), and is left out when none follow.
 *
 * Not drawn in Figma, chosen here: a window that is running right now reads
 * "Now, until 11:00 PM" / "Now, All day" (the wording Figma uses for lanes, `5115:207624`),
 * and an all-day window that starts today reads plain "Today".
 */

interface Window {
  start: Date;
  end: Date;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const clock = (d: Date) => minutesToTime(d.getHours() * 60 + d.getMinutes());

const windowsAhead = (rec: BlackoutDate, now: Date): Window[] =>
  (rec.occurrences ?? [])
    .map((o) => ({ start: new Date(o.start), end: new Date(o.end) }))
    .filter((w) => w.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

/** "Tomorrow" · "in 5 days" · "in 3 weeks" · "in 2 months" (rounded, see the header note). */
export function relativeAhead(target: Date, now: Date): string {
  const days = Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `in ${days} days`;
  if (days < 45) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}

export interface NextOfRecord {
  /** Line 1 — the date of the next occurrence. */
  date: string;
  /** Line 2 — relative wording. */
  relative: string;
  /** Tooltip rows for "View upcoming (n)" — the dates after `date`. Empty = no link. */
  upcoming: string[];
}

/**
 * The Next Blackout Date cell of one record, or null for "—".
 * Records saved before occurrences existed (old mock rows) fall back to their stored
 * `nextDate` text with no relative line and no link.
 */
export function nextOfRecord(rec: BlackoutDate, now: Date): NextOfRecord | null {
  if (!rec.occurrences?.length) {
    return rec.nextDate && rec.status !== "Passed" ? { date: rec.nextDate, relative: "", upcoming: [] } : null;
  }
  const ahead = windowsAhead(rec, now);
  if (ahead.length === 0) return null;

  const [next, ...rest] = ahead;
  const running = next.start <= now;
  let relative: string;
  if (running) {
    const endsAtMidnight = next.end.getHours() === 0 && next.end.getMinutes() === 0;
    const lastDay = endsAtMidnight ? new Date(next.end.getFullYear(), next.end.getMonth(), next.end.getDate() - 1) : next.end;
    if (toISO(lastDay) !== toISO(now)) relative = `Now, until ${formatDay(lastDay)}`;
    else relative = endsAtMidnight ? "Now, All day" : `Now, until ${clock(next.end)}`;
  } else if (toISO(next.start) === toISO(now)) {
    relative = rec.allDay ? "Today" : `Today, ${clock(next.start)}`;
  } else {
    relative = relativeAhead(next.start, now);
  }

  return {
    date: formatDay(next.start),
    relative,
    upcoming: rest.map((w) => formatDayWithWeekday(w.start)),
  };
}
