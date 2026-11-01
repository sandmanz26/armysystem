import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionType } from "../types";
import {
  STATIONS,
  dayBookings,
  bookingLabel,
  sessionColors,
  SESSION_ORDER,
  HOURS,
  HOUR_COL_WIDTH,
  STATION_COL_WIDTH,
  CURRENT_HOUR,
} from "../constants";
import { SessionChips, selectSession, blockMeta } from "./SessionChips";
import { Tooltip } from "@/components/tooltip";

const BLOCK_HEIGHT = 44;
const BLOCK_GAP = 4;
const ROW_PADDING = 6;

/**
 * Pack a station's bookings into as few stacked lines as possible — Figma only
 * stacks blocks that actually overlap in time. WPT-01's AM (8–12) and PM (1–5)
 * bookings share one 56px line; WPT-03's overlapping hourly bookings are the
 * ones that stack. Greedy first-fit over the lines.
 */
function packLanes<T extends { startHour: number; durationHours: number }>(items: T[]) {
  const lanes: { start: number; end: number }[][] = [];
  const placed = items.map((item) => {
    const start = item.startHour;
    const end = item.startHour + item.durationHours;
    let lane = lanes.findIndex((l) => l.every((s) => end <= s.start || start >= s.end));
    if (lane === -1) {
      lanes.push([]);
      lane = lanes.length - 1;
    }
    lanes[lane].push({ start, end });
    return { item, lane };
  });
  return { placed, laneCount: Math.max(lanes.length, 1) };
}

export function DayView() {
  const [active, setActive] = useState<SessionType[]>([...SESSION_ORDER]);
  const [hovered, setHovered] = useState<string | null>(null);

  const toggle = (t: SessionType) => setActive((prev) => selectSession(prev, t));

  const counts = useMemo(
    () =>
      SESSION_ORDER.reduce(
        (acc, t) => ({ ...acc, [t]: dayBookings.filter((b) => b.sessionType === t).length }),
        {} as Record<SessionType, number>,
      ),
    [],
  );

  const visible = dayBookings.filter((b) => active.includes(b.sessionType));
  const gridWidth = STATION_COL_WIDTH + HOURS.length * HOUR_COL_WIDTH;
  const nowOffset = ((CURRENT_HOUR - HOURS[0]) / HOURS.length) * 100;

  return (
    <>
      <SessionChips counts={counts} active={active} onToggle={toggle} />

      <div className="overflow-x-auto border-t border-invert-default">
        <div className="relative" style={{ minWidth: gridWidth }}>
          {/* Hour header */}
          <div className="flex border-b border-invert-default">
            <div
              className="flex-shrink-0 border-r border-invert-default"
              style={{ width: STATION_COL_WIDTH }}
            />
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-shrink-0 text-center text-xs text-body py-2 border-r border-invert-default last:border-r-0"
                style={{ width: HOUR_COL_WIDTH }}
              >
                {h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
              </div>
            ))}
          </div>

          {/* Now indicator — Figma draws it in the brand accent, not a generic red */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              top: 32,
              bottom: 0,
              left: `calc(${STATION_COL_WIDTH}px + (100% - ${STATION_COL_WIDTH}px) * ${nowOffset / 100})`,
            }}
          >
            <div className="absolute -top-1 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-default" />
            <div className="absolute top-0 bottom-0 left-0 w-px bg-primary-default" />
          </div>

          {/* Station rows */}
          {STATIONS.map((station) => {
            const rows = visible.filter((b) => b.station === station);
            const { placed, laneCount } = packLanes(rows);
            const height = Math.max(
              56,
              ROW_PADDING * 2 + laneCount * BLOCK_HEIGHT + (laneCount - 1) * BLOCK_GAP,
            );
            const total = rows.length;

            return (
              <div
                key={station}
                className={cn(
                  "flex border-b border-invert-default last:border-b-0 relative",
                  // the hovered row must paint above the rows below it, or the
                  // tooltip that hangs below the block gets covered by them
                  hovered && hovered.startsWith(station) ? "z-30" : "z-0",
                )}
                style={{ height }}
              >
                <div
                  className="flex-shrink-0 px-3 py-2 border-r border-invert-default"
                  style={{ width: STATION_COL_WIDTH }}
                >
                  <div className="text-xs font-bold text-default">{station}</div>
                  <div className="text-xs text-body">
                    {total} {bookingLabel(total)}
                  </div>
                </div>

                <div className="flex-1 relative">
                  {/* Hour grid lines */}
                  {HOURS.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-invert-default"
                      style={{ left: `${(i / HOURS.length) * 100}%`, width: `${(1 / HOURS.length) * 100}%` }}
                    />
                  ))}

                  {placed.map(({ item: b, lane }, bi) => {
                    const c = sessionColors[b.sessionType];
                    // Figma 5654:75643: line 1 = booking name, line 2 = "Status · AM".
                    const meta = blockMeta(b.status, b.sessionType, b.timeLabel.split(" · ")[1]);
                    const key = `${b.station}-${bi}`;
                    const timeRange = b.timeLabel.split(" \u00b7 ")[1];
                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "absolute rounded px-1.5 py-1 border cursor-pointer",
                          c.bg,
                          c.blockBorder,
                        )}
                        style={{
                          left: `${(b.startHour / HOURS.length) * 100}%`,
                          width: `${(b.durationHours / HOURS.length) * 100}%`,
                          top: ROW_PADDING + lane * (BLOCK_HEIGHT + BLOCK_GAP),
                          height: BLOCK_HEIGHT,
                        }}
                      >
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-default truncate">{b.title}</div>
                          <div className="text-xs text-default truncate">{meta}</div>
                        </div>
                        <Tooltip
                          visible={hovered === key}
                          title={b.title}
                          lines={[
                            [b.status, c.short, timeRange].filter(Boolean).join(" \u00b7 "),
                            b.station,
                          ]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
