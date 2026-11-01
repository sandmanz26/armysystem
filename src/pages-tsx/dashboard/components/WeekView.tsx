import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { SessionType, WeekCell } from "../types";
import {
  STATIONS,
  weekData,
  bookingLabel,
  sessionColors,
  SESSION_ORDER,
  WEEK_DAYS,
  WEEK_DATES,
  TODAY_IDX,
  WEEK_LABEL,
} from "../constants";
import { Tooltip } from "@/components/tooltip";
import { SessionChips, selectSession, blockMeta } from "./SessionChips";


/**
 * Booking blocks inside one day cell — Figma "Dashboard - Calendar Card - Day"
 * (`Wrapper`): radius 4, padding 4/6, 2px gap, title Semi Bold 12/16 and meta
 * Regular 12/16, both `color/text/default`. Hovering one opens the shared
 * `Tooltip`; Figma leaves the card itself unchanged while hovered.
 */
export function DayCells({ cells, station }: { cells: WeekCell[]; station: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  if (cells.length === 0) return <div className="h-9" />;
  return (
    <div className="flex flex-col gap-1 py-1">
      {cells.map((cell, ci) => {
        const c = sessionColors[cell.type];
        // Figma 5654:84522: line 1 = booking name, line 2 = "Status · AM".
        const title = cell.title ?? cell.unit ?? c.label;
        const meta = blockMeta(cell.status, cell.type, cell.time);
        return (
          <div key={ci} className="relative" onMouseEnter={() => setHovered(ci)} onMouseLeave={() => setHovered(null)}>
            <div
              onClick={() => cell.bookingId && navigate(`/bookings/detail?id=${cell.bookingId}`)}
              className={cn(
                "rounded border px-1.5 py-1 flex flex-col gap-0.5",
                cell.bookingId && "cursor-pointer",
                c.bg,
                c.blockBorder,
              )}
            >
              <div className="text-xs font-semibold leading-4 text-default truncate">{title}</div>
              <div className="text-xs font-normal leading-4 text-default truncate">{meta}</div>
            </div>
            <Tooltip visible={hovered === ci} title={title} lines={[meta, station]} />
          </div>
        );
      })}
    </div>
  );
}

/** One booking that runs over several consecutive days of the week, drawn as a single bar (Figma 5654:84522). */
interface WeekSpan {
  cell: WeekCell;
  start: number;
  length: number;
}

/** Merge consecutive days that carry the same bookingId into one span; everything else stays a 1-day span. */
function spansFor(row: Record<string, WeekCell[]>, active: SessionType[]): WeekSpan[] {
  const out: WeekSpan[] = [];
  WEEK_DAYS.forEach((day, i) => {
    for (const cell of (row[day] ?? []).filter((c) => active.includes(c.type))) {
      const prev = i > 0 ? (row[WEEK_DAYS[i - 1]] ?? []).some((c) => cell.bookingId && c.bookingId === cell.bookingId) : false;
      if (prev) continue; // already covered by the span that started earlier
      let length = 1;
      while (i + length < WEEK_DAYS.length && cell.bookingId && (row[WEEK_DAYS[i + length]] ?? []).some((c) => c.bookingId === cell.bookingId)) length++;
      out.push({ cell, start: i, length });
    }
  });
  return out;
}

function spanMeta(span: WeekSpan) {
  const { cell, start, length } = span;
  if (length === 1) return blockMeta(cell.status, cell.type, cell.time);
  const month = WEEK_LABEL.split(" ").slice(-2, -1)[0];
  return [cell.status, sessionColors[cell.type].short, `${WEEK_DATES[start]} ${month} → ${WEEK_DATES[start + length - 1]} ${month}`].join(" · ");
}

/**
 * Week grid — Figma "Calendar Dashboard - Week" (5654:84522): a fixed 112px lane column and seven equal day
 * columns that always fit the card (no horizontal scroll), header "Mon 7" centred in text/body, today's
 * day name in primary with the date in a 24px primary circle. Bookings are "Dashboard - Calendar Card - Day"
 * blocks (padding 4/2 around a 6/4 wrapper); a booking on consecutive days is one bar across them.
 */
function WeekGrid({ activeFilters }: { activeFilters: SessionType[] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const cols = "112px repeat(7, minmax(0, 1fr))";

  return (
    <div className="text-xs">
      <div className="grid border-b border-invert-default" style={{ gridTemplateColumns: cols }}>
        <div />
        {WEEK_DAYS.map((day, i) => (
          <div key={day} className="flex h-[30px] items-center justify-center gap-1 border-l border-invert-default">
            {i === TODAY_IDX ? (
              <>
                <span className="text-primary">{day}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-default font-semibold text-invert-default">{WEEK_DATES[i]}</span>
              </>
            ) : (
              <span className="text-body">{day} {WEEK_DATES[i]}</span>
            )}
          </div>
        ))}
      </div>

      {STATIONS.map((station) => {
        const spans = spansFor(weekData[station] ?? {}, activeFilters);
        return (
          <div key={station} className="relative grid border-b border-invert-default py-0.5" style={{ gridTemplateColumns: cols, gridAutoFlow: "row dense" }}>
            {/* column dividers */}
            {WEEK_DAYS.map((d, i) => (
              <div key={d} className="pointer-events-none absolute inset-y-0 border-l border-invert-default" style={{ left: `calc(112px + (100% - 112px) * ${i} / 7)` }} />
            ))}
            <div className="flex min-h-[52px] flex-col gap-0.5 px-3 py-1.5" style={{ gridColumn: 1, gridRow: "1 / span 20" }}>
              <span className="font-bold text-default">{station}</span>
              <span className="text-body">{spans.length} {bookingLabel(spans.length)}</span>
            </div>
            {spans.length === 0 && <div style={{ gridColumn: "2 / span 7" }} className="h-[52px]" />}
            {spans.map((span) => {
              const c = sessionColors[span.cell.type];
              const key = `${station}-${span.start}-${span.cell.bookingId ?? span.cell.title}`;
              const title = span.cell.title ?? span.cell.unit ?? c.label;
              const meta = spanMeta(span);
              return (
                <div
                  key={key}
                  className="relative px-1 py-0.5"
                  style={{ gridColumn: `${span.start + 2} / span ${span.length}` }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    onClick={() => span.cell.bookingId && navigate(`/bookings/detail?id=${span.cell.bookingId}`)}
                    className={cn("flex flex-col gap-0.5 rounded border px-1.5 py-1", span.cell.bookingId && "cursor-pointer", c.bg, c.blockBorder)}
                  >
                    <div className="truncate font-semibold leading-4 text-default">{title}</div>
                    <div className="truncate leading-4 text-default">{meta}</div>
                  </div>
                  <Tooltip visible={hovered === key} title={title} lines={[meta, station]} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** "Total per Day" footer — Figma renders today's total in the brand accent. */
function DailyTotalsRow({ activeFilters }: { activeFilters: SessionType[] }) {
  const filteredCounts = WEEK_DAYS.map((day) =>
    STATIONS.reduce(
      (sum, station) =>
        sum + (weekData[station]?.[day] ?? []).filter((c) => activeFilters.includes(c.type)).length,
      0,
    ),
  );

  return (
    <div className="grid border-t border-invert-default" style={{ gridTemplateColumns: "112px repeat(7, minmax(0, 1fr))" }}>
      <div className="px-3 py-2.5 text-xs text-body whitespace-nowrap">Total per Day</div>
      {filteredCounts.map((count, i) => (
        <div key={i} className={cn("py-2.5 text-center text-xs font-semibold", i === TODAY_IDX ? "text-primary" : "text-default")}>
          {count}
        </div>
      ))}
    </div>
  );
}

export function WeekView() {
  const [activeFilters, setActiveFilters] = useState<SessionType[]>([...SESSION_ORDER]);
  const toggleFilter = (t: SessionType) => setActiveFilters((prev) => selectSession(prev, t));

  // A multi-day booking counts once.
  const counts = useMemo(
    () =>
      SESSION_ORDER.reduce(
        (acc, t) => ({
          ...acc,
          [t]: STATIONS.reduce((sum, station) => sum + spansFor(weekData[station] ?? {}, [t]).length, 0),
        }),
        {} as Record<SessionType, number>,
      ),
    [],
  );

  return (
    <>
      <SessionChips counts={counts} active={activeFilters} onToggle={toggleFilter} />
      <div className="border-t border-invert-default">
        <WeekGrid activeFilters={activeFilters} />
      </div>
      <DailyTotalsRow activeFilters={activeFilters} />
    </>
  );
}
