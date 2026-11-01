import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * DateRangePicker — design-system component.
 *
 * Figma `Date Picker Range` (WPT MST TCT 3.0, Dashboard page `5004:113424` →
 * section "Dashboard - Range" → frame `Dropdown - Date Picker Filled`).
 * 512×356, radius 8, `color/background/surface`. TWO months side by side
 * (`Date` 256×300 each), then an `Action` row 512×56 holding the resolved
 * range label and the two buttons.
 *
 * Day cell states, read off the frame's own cells rather than assumed:
 *   outside month   —                                        `color/text/disabled`
 *   in month        —                                        `color/text/default`
 *   range endpoint  `color/background/primary/default`        `color/text/base`
 *   inside range    `color/background/primary/invert/default` `color/text/primary`
 *
 * The weekday row (Sun…Sat) is `color/text/disabled`, not body grey.
 *
 * Buttons are **Cancel** and **Confirm** — Figma has no Clear here, and the
 * primary does not read "Apply".
 *
 * Not verified, chosen: the corner radius of the highlighted cells. The scan
 * resolved their fills but not their radii, so the endpoints are drawn as
 * rounded caps with the in-between days square, which is what makes a
 * continuous band. If the frame says otherwise this is the one thing to correct.
 */

export interface DateRangePickerProps {
  /** Applied start/end, or nulls. Seeds which months open. */
  start: Date | null;
  end: Date | null;
  onConfirm: (start: Date, end: Date) => void;
  onCancel: () => void;
  /** Earliest / latest selectable day. Days outside stay visible but disabled. */
  minDate?: Date;
  maxDate?: Date;
  /** Tooltip for a disabled day; receives whether it is before min or after max. */
  disabledHint?: (side: "before" | "after") => string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
/** 6 rows × 7 days, including the leading/trailing days of neighbouring months. */
function buildGrid(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}
function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
/** Figma's label format: "27 Nov - 8 Dec 2025". */
export function formatRange(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = `${start.getDate()} ${MONTH_SHORT[start.getMonth()]}${sameYear ? "" : ` ${start.getFullYear()}`}`;
  const right = `${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  return `${left} - ${right}`;
}

export function DateRangePicker({ start, end, onConfirm, onCancel, minDate, maxDate, disabledHint }: DateRangePickerProps) {
  const outside = (d: Date): "before" | "after" | null => {
    const t = startOfDay(d).getTime();
    if (minDate && t < startOfDay(minDate).getTime()) return "before";
    if (maxDate && t > startOfDay(maxDate).getTime()) return "after";
    return null;
  };
  const seed = start ?? new Date();
  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());

  // Picking is two clicks: the first sets the start and clears the end, the
  // second closes the range. A second click before the start restarts instead
  // of producing a backwards range.
  const [pendingStart, setPendingStart] = useState<Date | null>(start);
  const [pendingEnd, setPendingEnd] = useState<Date | null>(end);
  const [hovered, setHovered] = useState<Date | null>(null);

  const right = addMonths(viewYear, viewMonth, 1);

  const pick = (d: Date) => {
    const day = startOfDay(d);
    if (!pendingStart || pendingEnd) {
      setPendingStart(day);
      setPendingEnd(null);
      return;
    }
    if (day.getTime() < pendingStart.getTime()) {
      setPendingStart(day);
      return;
    }
    setPendingEnd(day);
  };

  // While only the start is set, the hovered day previews the closing edge.
  const previewEnd = pendingEnd ?? (pendingStart && hovered && hovered.getTime() > pendingStart.getTime() ? hovered : null);

  const isEndpoint = (d: Date) => sameDay(pendingStart, d) || sameDay(pendingEnd, d) || (!pendingEnd && sameDay(previewEnd, d));
  const isInside = (d: Date) => {
    if (!pendingStart || !previewEnd) return false;
    const t = startOfDay(d).getTime();
    return t > startOfDay(pendingStart).getTime() && t < startOfDay(previewEnd).getTime();
  };

  const complete = !!pendingStart && !!pendingEnd;

  const renderMonth = (year: number, month: number, side: "left" | "right") => (
    <div className="w-64 px-4 py-2">
      {/* header 224×40 — prev sits on the left month, next on the right one */}
      <div className="flex h-10 items-center justify-between">
        {side === "left" ? (
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => {
              const prev = addMonths(viewYear, viewMonth, -1);
              setViewYear(prev.year);
              setViewMonth(prev.month);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-default transition-colors"
          >
            <Icon name="chevron-left" size={18} />
          </button>
        ) : (
          <span className="h-10 w-10" />
        )}

        <span className="text-sm font-semibold text-default whitespace-nowrap">
          {MONTH_NAMES[month]} {year}
        </span>

        {side === "right" ? (
          <button
            type="button"
            aria-label="Next month"
            onClick={() => {
              const next = addMonths(viewYear, viewMonth, 1);
              setViewYear(next.year);
              setViewMonth(next.month);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-default transition-colors"
          >
            <Icon name="chevron-right" size={18} />
          </button>
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>

      {/* weekday row — `color/text/disabled` */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <span key={d} className="flex h-7 w-8 items-center justify-center text-xs text-disabled">
            {d}
          </span>
        ))}
      </div>

      {/* 6 × 7 grid of 32px cells */}
      <div className="grid grid-cols-7" onMouseLeave={() => setHovered(null)}>
        {buildGrid(year, month).map(({ date, inMonth }, i) => {
          const off = outside(date);
          const endpoint = !off && isEndpoint(date);
          const inside = !off && isInside(date);
          return (
            <button
              key={i}
              type="button"
              disabled={!!off}
              title={off && disabledHint ? disabledHint(off) : undefined}
              onClick={() => pick(date)}
              onMouseEnter={() => setHovered(date)}
              className={cn(
                "flex h-8 w-8 items-center justify-center text-xs transition-colors",
                off && "text-disabled cursor-not-allowed",
                endpoint && "bg-primary-default text-invert-default rounded-lg font-semibold",
                inside && "bg-primary-invert-default text-primary",
                !off && !endpoint && !inside && (inMonth ? "text-default hover:bg-default-default rounded-lg" : "text-disabled"),
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-[512px] rounded-lg bg-surface border border-invert-default shadow-lg">
      <div className="flex">
        {renderMonth(viewYear, viewMonth, "left")}
        {renderMonth(right.year, right.month, "right")}
      </div>

      {/* Action 512×56 */}
      <div className="flex h-14 items-center justify-between gap-3 border-t border-invert-default px-4">
        <span className="text-sm text-default">
          {complete ? formatRange(pendingStart, pendingEnd) : " "}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-5 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!complete}
            onClick={() => complete && onConfirm(pendingStart!, pendingEnd!)}
            className="h-10 px-5 rounded-lg bg-primary-default hover:bg-primary-hovered text-sm font-semibold text-invert-default transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-default"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
