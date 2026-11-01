import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionType, WeekCell } from "../types";
import { STATIONS, weekData, SESSION_ORDER, bookingLabel } from "../constants";
import { SessionChips, selectSession } from "./SessionChips";
import { DayCells } from "./WeekView";

const LANE_COL = 180;
const MIN_DAY_COL = 120;
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysBetween(start: Date, end: Date) {
  const out: Date[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (d.getTime() <= end.getTime()) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Mock: a date shows the bookings of its weekday in `weekData`.
const cellsFor = (station: string, date: Date): WeekCell[] =>
  weekData[station]?.[WEEKDAY[date.getDay()]] ?? [];

/**
 * Figma `Dashboard - Range` ▸ Filled (6692:22856). Column-width rule from the
 * designer's Notes 6737:22346: 7 days or fewer stretch to fill the width with
 * no scrollbar; 8 or more are (container − lane column) ÷ 6.5 wide so the
 * seventh column is cut off as a scroll cue, with a minimum width. The lane
 * column stays sticky on the left while scrolling.
 */
export function RangeView({ start, end }: { start: Date; end: Date }) {
  const [active, setActive] = useState<SessionType[]>([...SESSION_ORDER]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const days = useMemo(() => daysBetween(start, end), [start, end]);
  const stretch = days.length <= 7;
  const dayCol = stretch ? undefined : Math.max(MIN_DAY_COL, (width - LANE_COL) / 6.5);
  const today = new Date().toDateString();

  const counts = useMemo(
    () =>
      SESSION_ORDER.reduce(
        (acc, t) => ({
          ...acc,
          [t]: STATIONS.reduce(
            (sum, s) => sum + days.reduce((n, d) => n + cellsFor(s, d).filter((c) => c.type === t).length, 0),
            0,
          ),
        }),
        {} as Record<SessionType, number>,
      ),
    [days],
  );

  const visible = (s: string, d: Date) => cellsFor(s, d).filter((c) => active.includes(c.type));
  const colStyle = stretch ? { flex: "1 1 0", minWidth: 0 } : { width: dayCol, flex: "0 0 auto" };
  const laneCls = "sticky left-0 z-10 bg-surface border-r border-invert-default flex-shrink-0";

  return (
    <>
      <SessionChips counts={counts} active={active} onToggle={(t) => setActive((p) => selectSession(p, t))} />

      <div ref={wrapRef} className="overflow-x-auto border-t border-invert-default">
        <div className={cn(stretch ? "w-full" : "w-max")}>
          {/* Header — white, stroke only (same as Week) */}
          <div className="flex border-b border-invert-default">
            <div className={laneCls} style={{ width: LANE_COL }} />
            {days.map((d) => {
              const isToday = d.toDateString() === today;
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "py-2 px-2 text-center text-xs whitespace-nowrap border-r border-invert-default last:border-r-0",
                    isToday ? "text-primary font-semibold" : "text-body",
                  )}
                  style={colStyle}
                >
                  {WEEKDAY[d.getDay()]} {d.getDate()} {MONTH[d.getMonth()]}
                </div>
              );
            })}
          </div>

          {STATIONS.map((s) => {
            const total = days.reduce((n, d) => n + visible(s, d).length, 0);
            return (
              <div key={s} className="flex border-b border-invert-default">
                <div className={cn(laneCls, "px-4 py-2")} style={{ width: LANE_COL }}>
                  <div className="text-xs font-bold text-default">{s}</div>
                  <div className="text-xs text-body">
                    {total} {bookingLabel(total)}
                  </div>
                </div>
                {days.map((d) => (
                  <div key={d.toISOString()} className="px-1.5 border-r border-invert-default last:border-r-0" style={colStyle}>
                    <DayCells cells={visible(s, d)} station={s} />
                  </div>
                ))}
              </div>
            );
          })}

          {/* Total per Day — inside the same scroller so it stays aligned */}
          <div className="flex">
            <div className={cn(laneCls, "px-4 py-2.5 text-xs text-body whitespace-nowrap")} style={{ width: LANE_COL }}>
              Total per Day
            </div>
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className={cn(
                  "py-2.5 text-center text-xs font-semibold",
                  d.toDateString() === today ? "text-primary" : "text-default",
                )}
                style={colStyle}
              >
                {STATIONS.reduce((n, s) => n + visible(s, d).length, 0)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
