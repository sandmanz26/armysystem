import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icon";
import { bookings } from "@/data/mock";
import { cn } from "@/lib/utils";
import { SegmentedPicker } from "@/components/segmented-picker";
import { Tooltip } from "@/components/tooltip";
import { BOOKING_STATUS_TONE } from "../statusTone";
import { allEvents, dateKey, eventsOnDay, layoutDay, type CalEvent } from "../calendarEvents";
import { calendarMockBookings } from "../calendarMock";

/*
 * Booking List 2.0 — Calendar. Figma `Booking List - Calendar - Daniel`
 * (7602:81034): Month / Week / Day × Empty / Filled / Hover, plus
 * `Day - Filled No Full Day`. Rebuilt 1 Oct 2026 — Week and Day used to be a
 * day-cell grid and a plain agenda list because no frame existed for them;
 * this section draws both as hour grids.
 *
 * Shared pieces, read off the frames:
 *   card     `Booking List - Calendar Card - Month Item` — outer padding 2/4,
 *            wrapper 4/6 radius 4 on `background/<hue>/invert/soft` +
 *            `border/invert/<hue>`; title 12 Semi Bold; the status is plain
 *            12 Medium text in its hue (not a pill), then "· AM" / "· Hourly ·
 *            08:00 AM - 09:00 AM" / "· Ad-hoc · 24 Nov 08:00 AM - 26 Nov 2025
 *            05:00 PM" 12 Regular; Week/Day add the station(s) on a third line
 *            in `text/caption`
 *   more     "+N more" — 12 Medium `text/primary`; in Week/Day it sits in its
 *            own `background/default/soft` + `border/invert/default` box
 *   hover    the shared `Tooltip`: booking name bold, then "status · schedule",
 *            then the stations. Below the card, flipped above when there is
 *            no room (Month's hovered card is on the bottom row)
 *   Month    cells 157×148, two cards per day then "+N more"; a multi-day
 *            Ad-hoc is ONE bar across the days it covers
 *   Week     112px time gutter, 7 day columns; header 32 ("Mon 24" 12
 *            Regular `text/body`, today "Tue" in `text/primary` + a 24px
 *            `background/primary/default` date badge); an all-day strip for
 *            Full Day and multi-day Ad-hoc; hour rows 102 tall; at most two
 *            overlapping bookings side by side, the rest folded into "+N more"
 *   Day      same, one column, hour rows 86 tall, up to five side by side
 *   now      a `border/primary` line with a dot across today's column
 *
 * Deliberate deviations, recorded in docs/FIGMA-MAP.md: Figma's timed blocks
 * are drawn schematically (an AM 08:00–12:00 session drawn ~3 hours tall), so
 * blocks here are placed by their real start/end; Figma's "12:00 AM" hour
 * label after 11:00 AM is a typo and reads 12:00 PM here.
 */

type CalMode = "Month" | "Week" | "Day";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FIRST_HOUR = 7;
const LAST_HOUR = 19;
const MONTH_SLOTS = 2;

const CARD_TONE: Record<string, string> = {
  info: "bg-info-invert-soft border-invert-info",
  orange: "bg-orange-invert-soft border-invert-orange",
  success: "bg-success-invert-soft border-invert-success",
  neutral: "bg-default-soft border-invert-default",
  danger: "bg-danger-invert-soft border-invert-danger",
  purple: "bg-purple-invert-soft border-invert-purple",
  warning: "bg-warning-invert-soft border-invert-warning",
};
const STATUS_TEXT: Record<string, string> = {
  info: "text-info", orange: "text-orange", success: "text-success", neutral: "text-default",
  danger: "text-danger", purple: "text-purple", warning: "text-warning",
};

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mondayOf(d: Date): Date {
  return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7));
}

function monthWeeks(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const start = mondayOf(first);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const weeks = Math.ceil((offset + days) / 7);
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

function hourLabel(h: number): string {
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${ap}`;
}

// ── Hover tooltip, portalled so no scroll container clips it ────────────────

interface HoverState {
  event: CalEvent;
  /** Pointer position — Figma's Week/Day hover sits right under the cursor,
   *  which on a tall hour block is nowhere near the card's edge. */
  x: number;
  y: number;
}

function HoverTooltip({ hover }: { hover: HoverState | null }) {
  if (!hover) return null;
  const { event, x, y } = hover;
  const above = window.innerHeight - y < 140;
  const line2 = [event.booking.status, event.schedule, event.schedule === "Hourly" || event.schedule === "Ad-hoc" ? event.timeText : ""].filter(Boolean).join(" · ");
  return createPortal(
    <div
      className="pointer-events-none fixed z-[3000]"
      style={{ left: x, top: above ? y - 12 : y + 16, width: 0, height: 0 }}
    >
      <Tooltip
        visible
        width={320}
        placement={above ? "top" : "bottom"}
        title={event.booking.program}
        lines={[line2, event.stations.join(" · ")].filter(Boolean)}
        className="whitespace-normal"
      />
    </div>,
    document.body,
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

function EventCard({
  event,
  showStation,
  onOpen,
  onHover,
  className,
  style,
  wrap = false,
  height,
}: {
  event: CalEvent;
  showStation: boolean;
  /** Timed cards sit in narrow hour-grid lanes: every line truncates (never wraps
   *  into a second row of status/time), the title may take two lines when the
   *  card is tall enough, and lines that do not fit the card's height are
   *  dropped — the full text is in the hover tooltip. */
  wrap?: boolean;
  /** Card height in px (timed cards only) — decides how many lines fit. */
  height?: number;
  onOpen: () => void;
  onHover: (h: HoverState | null) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tone = BOOKING_STATUS_TONE[event.booking.status];
  const timed = wrap && !!event.timeText;
  // 16px per 12px/16px line + 2px gaps, minus 8px wrapper padding and 8px card padding.
  const lines = wrap && height != null ? Math.max(1, Math.floor((height - 16 + 2) / 18)) : 99;
  const titleLines = lines >= 5 ? 2 : 1;
  const showTime = !wrap || !timed || lines >= 3;
  const showStationLine = showStation && event.stations.length > 0 && (!wrap || lines >= (timed ? 4 : 3));
  return (
    <div className={cn("px-1 py-0.5", className)} style={style}>
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={(e) => onHover({ event, x: e.clientX, y: e.clientY })}
        onMouseLeave={() => onHover(null)}
        className={cn("flex h-full w-full min-w-0 flex-col gap-0.5 overflow-hidden rounded border px-1.5 py-1 text-left text-xs hover:brightness-[0.97]", CARD_TONE[tone])}
      >
        <span className={cn("w-full min-w-0 font-semibold leading-4 text-default", wrap && titleLines === 2 ? "line-clamp-2 break-words" : "truncate")}>{event.booking.program}</span>
        {wrap ? (
          <>
            <span className="w-full min-w-0 truncate leading-4 text-default">
              <span className={cn("font-medium", STATUS_TEXT[tone])}>{event.booking.status}</span>
              {" · "}
              {event.schedule}
            </span>
            {timed && showTime && <span className="w-full min-w-0 truncate leading-4 text-default">{event.timeText}</span>}
          </>
        ) : (
          <span className="w-full truncate leading-4 text-default">
            <span className={cn("font-medium", STATUS_TEXT[tone])}>{event.booking.status}</span>
            {" · "}
            {event.schedule}
            {event.timeText && ` · ${event.timeText}`}
          </span>
        )}
        {showStationLine && (
          <span className="w-full min-w-0 truncate leading-4 text-caption">{event.stations.join(" · ")}</span>
        )}
      </button>
    </div>
  );
}

function MoreBox({ count, onClick, boxed }: { count: number; onClick: () => void; boxed: boolean }) {
  return (
    <div className={cn(boxed && "px-1 py-0.5")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full text-left text-xs font-medium text-primary hover:underline",
          boxed ? "rounded border border-invert-default bg-default-soft px-1.5 py-1" : "px-1",
        )}
      >
        +{count} more
      </button>
    </div>
  );
}

// ── Spanning rows (Month weeks, Week/Day all-day strip) ─────────────────────

interface Span {
  event: CalEvent;
  col: number;
  len: number;
  slot: number;
}

/** Packs events into slot rows across a run of days; long spans go first. */
function packSpans(days: Date[], events: CalEvent[]): Span[] {
  const keys = days.map(dateKey);
  const first = keys[0];
  const last = keys[keys.length - 1];
  const inRange = events.filter((e) => e.startKey <= last && e.endKey >= first);
  const sorted = [...inRange].sort((a, b) => {
    const la = (a.endKey > a.startKey ? 1 : 0), lb = (b.endKey > b.startKey ? 1 : 0);
    return lb - la || a.startKey.localeCompare(b.startKey) || a.startMin - b.startMin;
  });
  const taken: boolean[][] = [];
  const spans: Span[] = [];
  for (const e of sorted) {
    const col = Math.max(0, keys.findIndex((k) => k >= e.startKey));
    let end = keys.length - 1;
    for (let i = col; i < keys.length; i++) if (keys[i] <= e.endKey) end = i;
    let slot = 0;
    while (Array.from({ length: end - col + 1 }, (_, i) => taken[slot]?.[col + i]).some(Boolean)) slot++;
    for (let i = col; i <= end; i++) ((taken[slot] ??= [])[i] = true);
    spans.push({ event: e, col, len: end - col + 1, slot });
  }
  return spans;
}

// ── Views ──────────────────────────────────────────────────────────────────

export interface CalendarViewProps {
  onNavigate?: (path: string) => void;
}

export function CalendarView({ onNavigate }: CalendarViewProps) {
  const [mode, setMode] = useState<CalMode>("Month");
  const [cursor, setCursor] = useState(() => new Date());
  const [hover, setHover] = useState<HoverState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const events = useMemo(() => allEvents([...bookings, ...calendarMockBookings]), []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const open = (e: CalEvent) => onNavigate?.(`/bookings-2/detail?id=${e.booking.id}`);
  const goDay = (d: Date) => { setMode("Day"); setCursor(d); };
  const todayKey = dateKey(now);
  const weekStart = mondayOf(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const step = (dir: 1 | -1) => {
    setHover(null);
    if (mode === "Month") setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
    else setCursor((c) => addDays(c, dir * (mode === "Week" ? 7 : 1)));
  };

  const navLabel = (() => {
    if (mode === "Month") return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    if (mode === "Day") return `${FULL_WEEKDAYS[cursor.getDay()]}, ${cursor.getDate()} ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    const a = weekDays[0], b = weekDays[6];
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}-${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
      : `${a.getDate()} ${MONTHS[a.getMonth()]} - ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
  })();

  return (
    <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1" onMouseLeave={() => setHover(null)}>
      {/* Figma `Section Header`: 76 tall, padding 20; Today 74×36, Navigator
          (36px chevrons, 16px gap, 14 Regular label), `Segmented Picker sm`. */}
      <div className="flex flex-wrap items-center justify-between gap-5 p-5">
        <h2 className="text-base font-semibold text-default">{mode} Overview</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setHover(null); setCursor(new Date()); }}
            className="h-9 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Previous" onClick={() => step(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors">
              <Icon name="chevron-left" size={16} />
            </button>
            <span className="whitespace-nowrap text-sm text-default">{navLabel}</span>
            <button type="button" aria-label="Next" onClick={() => step(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors">
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          <SegmentedPicker
            size="sm"
            value={mode}
            onChange={(m) => { setHover(null); setMode(m); }}
            options={[{ value: "Month", label: "Month" }, { value: "Week", label: "Week" }, { value: "Day", label: "Day" }]}
          />
        </div>
      </div>

      {mode === "Month" && (
        <MonthGrid cursor={cursor} events={events} todayKey={todayKey} onOpen={open} onHover={setHover} onMore={goDay} />
      )}
      {mode === "Week" && (
        <TimeGrid days={weekDays} events={events} now={now} rowH={102} maxLanes={2} showHeader onOpen={open} onHover={setHover} onMore={goDay} />
      )}
      {mode === "Day" && (
        <TimeGrid days={[cursor]} events={events} now={now} rowH={86} maxLanes={5} showHeader={false} onOpen={open} onHover={setHover} onMore={goDay} />
      )}

      <HoverTooltip hover={hover} />
    </div>
  );
}

function MonthGrid({
  cursor, events, todayKey, onOpen, onHover, onMore,
}: {
  cursor: Date; events: CalEvent[]; todayKey: string;
  onOpen: (e: CalEvent) => void; onHover: (h: HoverState | null) => void; onMore: (d: Date) => void;
}) {
  const weeks = monthWeeks(cursor.getFullYear(), cursor.getMonth());
  return (
    <div>
      <div className="grid grid-cols-7 border-t border-invert-default">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={cn("py-2 text-center text-xs text-body", i > 0 && "border-l border-invert-default")}>{d}</div>
        ))}
      </div>
      {weeks.map((week) => {
        const spans = packSpans(week, events);
        const keys = week.map(dateKey);
        return (
          <div key={keys[0]} className="relative grid grid-cols-7 grid-rows-[30px_48px_48px_22px] border-t border-invert-default">
            {week.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              return (
                <div
                  key={keys[i]}
                  className={cn("row-span-4 row-start-1", i > 0 && "border-l border-invert-default", !inMonth && "bg-default-default")}
                  style={{ gridColumn: i + 1 }}
                />
              );
            })}
            {week.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = keys[i] === todayKey;
              return (
                <div key={`n${keys[i]}`} className="relative row-start-1 px-2 pt-1.5" style={{ gridColumn: i + 1 }}>
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday ? "bg-primary-default text-invert-default" : inMonth ? "text-default" : "text-disabled",
                  )}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
            {spans.filter((s) => s.slot < MONTH_SLOTS).map((s) => (
              <EventCard
                key={`${s.event.booking.id}-${s.event.startKey}`}
                event={s.event}
                showStation={false}
                onOpen={() => onOpen(s.event)}
                onHover={onHover}
                className="relative"
                style={{ gridColumn: `${s.col + 1} / span ${s.len}`, gridRow: s.slot + 2 }}
              />
            ))}
            {week.map((d, i) => {
              const hidden = spans.filter((s) => s.slot >= MONTH_SLOTS && s.col <= i && i < s.col + s.len).length;
              return hidden > 0 ? (
                <div key={`m${keys[i]}`} className="relative row-start-4" style={{ gridColumn: i + 1 }}>
                  <MoreBox count={hidden} boxed={false} onClick={() => onMore(d)} />
                </div>
              ) : null;
            })}
          </div>
        );
      })}
    </div>
  );
}

function TimeGrid({
  days, events, now, rowH, maxLanes, showHeader, onOpen, onHover, onMore,
}: {
  days: Date[]; events: CalEvent[]; now: Date; rowH: number; maxLanes: number; showHeader: boolean;
  onOpen: (e: CalEvent) => void; onHover: (h: HoverState | null) => void; onMore: (d: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const keys = days.map(dateKey);
  const todayKey = dateKey(now);
  const allDay = events.filter((e) => e.allDay);
  const spans = packSpans(days, allDay);
  const slots = spans.reduce((m, s) => Math.max(m, s.slot + 1), 0);
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const cols = `112px repeat(${days.length}, minmax(0, 1fr))`;

  // Figma opens with 8:00 AM just below the top edge.
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = rowH - 16;
  }, [rowH, keys[0]]);

  return (
    <div className="border-t border-invert-default">
      {showHeader && (
        <div className="grid h-8 border-b border-invert-default" style={{ gridTemplateColumns: cols }}>
          <div />
          {days.map((d, i) => {
            const today = keys[i] === todayKey;
            const name = WEEKDAYS[(d.getDay() + 6) % 7];
            return (
              <div key={keys[i]} className="flex items-center justify-center gap-1 border-l border-invert-default text-xs">
                {today ? (
                  <>
                    <span className="text-primary">{name}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-default font-semibold text-invert-default">{d.getDate()}</span>
                  </>
                ) : (
                  <span className="text-body">{name} {d.getDate()}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {slots > 0 && (
        <div className="grid border-b-4 border-invert-default py-1" style={{ gridTemplateColumns: cols, gridTemplateRows: `repeat(${slots}, 70px)` }}>
          {days.map((_, i) => (
            <div key={`b${keys[i]}`} className={cn(showHeader && "border-l border-invert-default")} style={{ gridColumn: i + 2, gridRow: `1 / span ${slots}` }} />
          ))}
          {spans.map((s) => (
            <EventCard
              key={`${s.event.booking.id}-${s.event.startKey}`}
              event={s.event}
              showStation
              onOpen={() => onOpen(s.event)}
              onHover={onHover}
              style={{ gridColumn: `${s.col + 2} / span ${s.len}`, gridRow: s.slot + 1 }}
            />
          ))}
        </div>
      )}

      <div ref={scrollRef} className="relative max-h-[560px] overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: cols }}>
          <div>
            {hours.map((h) => (
              <div key={h} className="border-b border-invert-default px-3 py-2 text-xs text-body" style={{ height: rowH }}>
                {hourLabel(h)}
              </div>
            ))}
          </div>
          {days.map((d, i) => {
            const k = keys[i];
            const timed = eventsOnDay(events, k).filter((e) => !e.allDay);
            const { placed, overflow } = layoutDay(timed, maxLanes);
            const y = (min: number) => ((min - FIRST_HOUR * 60) / 60) * rowH;
            return (
              <div key={k} className={cn("relative", showHeader && "border-l border-invert-default")}>
                {hours.map((h) => (
                  <div key={h} className="border-b border-invert-default" style={{ height: rowH }} />
                ))}
                {placed.map((p) => (
                  <EventCard
                    key={`${p.event.booking.id}-${k}`}
                    event={p.event}
                    showStation
                    onOpen={() => onOpen(p.event)}
                    onHover={onHover}
                    wrap
                    height={Math.max(34, y(p.event.endMin) - y(p.event.startMin))}
                    className="absolute"
                    style={{
                      top: y(p.event.startMin),
                      height: Math.max(34, y(p.event.endMin) - y(p.event.startMin)),
                      // Week stretches a cluster across the day column; Day keeps
                      // every lane one fifth wide and leaves the rest empty
                      // (Figma `Calendar - Day - Filled`, 7602:81108).
                      left: `${(p.lane / (showHeader ? p.lanes : maxLanes)) * 100}%`,
                      width: `${100 / (showHeader ? p.lanes : maxLanes)}%`,
                    }}
                  />
                ))}
                {overflow.map((o, j) => (
                  <div key={j} className="absolute inset-x-0" style={{ top: y(o.atMin) }}>
                    <MoreBox count={o.count} boxed onClick={() => onMore(d)} />
                  </div>
                ))}
                {k === todayKey && nowMin >= FIRST_HOUR * 60 && nowMin <= (LAST_HOUR + 1) * 60 && (
                  <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: y(nowMin) }}>
                    <div className="relative h-px bg-primary-default">
                      <span className="absolute -left-[3px] -top-[2.5px] h-1.5 w-1.5 rounded-full bg-primary-default" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
