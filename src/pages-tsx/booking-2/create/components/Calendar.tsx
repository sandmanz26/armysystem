// Booking 2.0 — shared calendar popover, used by ScheduleStep for BOTH the
// single-date "Date Slot" field and the Ad-hoc/Full-Day-Multiple date-RANGE
// field, so there's exactly one calendar implementation/UI, not two (per
// instruction: "pastikan component calendar sama"). Dual-month view with a
// Cancel/Confirm footer, matching the screenshot. New file, local to
// booking-2 — not shared with or copied from the old ScheduleStep.
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { getCalendarWeeks } from "@/pages-tsx/booking/list/utils";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Simulated fully-booked dates, for the same "Fully-Booked" legend concept
// already used elsewhere in this app's booking calendars.
const FULLY_BOOKED: { year: number; month: number; day: number }[] = [
  { year: 2025, month: 10, day: 6 },
  { year: 2025, month: 10, day: 13 },
  { year: 2025, month: 10, day: 20 },
  { year: 2025, month: 10, day: 27 },
];

function isSameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isFullyBooked(d: Date) {
  return FULLY_BOOKED.some((f) => f.year === d.getFullYear() && f.month === d.getMonth() && f.day === d.getDate());
}

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export type CalendarValue = Date | { start: Date | null; end: Date | null } | null;

function MonthGrid({ year, month, onPick, isSelected, isInRange, rangeEdge }: {
  year: number; month: number;
  onPick: (d: Date) => void;
  isSelected: (d: Date) => boolean;
  isInRange: (d: Date) => boolean;
  /** Which end of a COMPLETE range this day is — draws the half-band behind the circle. */
  rangeEdge: (d: Date) => "start" | "end" | null;
}) {
  const weeks = getCalendarWeeks(year, month);
  return (
    <div className="flex-1 min-w-[240px]">
      <div className="text-sm font-bold text-figma-default text-center mb-2">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 text-xs text-figma-disabled mb-1">
        {DOW.map((d) => <div key={d} className="text-center py-1">{d}</div>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((d, di) => {
            const inMonth = d.getMonth() === month;
            const booked = inMonth && isFullyBooked(d);
            const selected = inMonth && isSelected(d);
            const inRange = inMonth && isInRange(d);
            const edge = inMonth ? rangeEdge(d) : null;
            return (
              // Full-width cell carries the range band; the day itself is always a w-8 x h-8 CIRCLE
              // (Figma: selected dates are round, also the two ends of a range).
              <div
                key={di}
                className={cn(
                  "flex h-8 items-center justify-center",
                  inRange && "bg-figma-dangersoft",
                  edge === "start" && "bg-gradient-to-r from-transparent from-50% to-figma-dangersoft to-50%",
                  edge === "end" && "bg-gradient-to-l from-transparent from-50% to-figma-dangersoft to-50%"
                )}
              >
                <button
                  type="button"
                  disabled={!inMonth || booked}
                  onClick={() => onPick(d)}
                  className={cn(
                    "h-8 w-8 text-xs rounded-full flex items-center justify-center transition-colors",
                    !inMonth && "text-transparent cursor-default",
                    inMonth && !booked && !selected && "text-figma-default hover:bg-figma-muted",
                    booked && "text-figma-disabled bg-figma-soft cursor-not-allowed",
                    inRange && !selected && "text-figma-primary hover:bg-figma-dangersoft",
                    selected && "bg-figma-primary text-invert-default font-bold"
                  )}
                >
                  {inMonth ? d.getDate() : "0"}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface CalendarPickerProps {
  mode: "single" | "range";
  value: CalendarValue;
  onConfirm: (v: CalendarValue) => void;
  placeholder: string;
  invalid?: boolean;
  disabled?: boolean;
}

export function CalendarPicker({ mode, value, onConfirm, placeholder, invalid, disabled }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [draft, setDraft] = useState<CalendarValue>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const displayText = (() => {
    if (mode === "single") {
      return value instanceof Date ? formatDate(value) : "";
    }
    const range = value as { start: Date | null; end: Date | null } | null;
    if (range?.start && range?.end) return `${formatDate(range.start)} - ${formatDate(range.end)}`;
    if (range?.start) return formatDate(range.start);
    return "";
  })();

  const draftDisplayText = (() => {
    if (mode === "single") {
      return draft instanceof Date ? formatDate(draft) : "";
    }
    const range = draft as { start: Date | null; end: Date | null } | null;
    if (range?.start && range?.end) return `${formatDate(range.start)} - ${formatDate(range.end)}`;
    if (range?.start) return formatDate(range.start);
    return "";
  })();

  const handlePick = (d: Date) => {
    if (mode === "single") {
      setDraft(d);
      return;
    }
    const range = (draft as { start: Date | null; end: Date | null } | null) ?? { start: null, end: null };
    if (!range.start || (range.start && range.end)) {
      setDraft({ start: d, end: null });
    } else if (d < range.start) {
      setDraft({ start: d, end: range.start });
    } else {
      setDraft({ start: range.start, end: d });
    }
  };

  const isSelected = (d: Date) => {
    if (mode === "single") return isSameDay(draft as Date, d);
    const range = draft as { start: Date | null; end: Date | null } | null;
    return isSameDay(range?.start ?? null, d) || isSameDay(range?.end ?? null, d);
  };

  const isInRange = (d: Date) => {
    if (mode !== "range") return false;
    const range = draft as { start: Date | null; end: Date | null } | null;
    if (!range?.start || !range?.end) return false;
    return d > range.start && d < range.end;
  };

  const rangeEdge = (d: Date): "start" | "end" | null => {
    if (mode !== "range") return null;
    const range = draft as { start: Date | null; end: Date | null } | null;
    if (!range?.start || !range?.end || isSameDay(range.start, range.end)) return null;
    return isSameDay(range.start, d) ? "start" : isSameDay(range.end, d) ? "end" : null;
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  };
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  };

  if (disabled) {
    return (
      <div className="w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-figma-fielddisabled border-figma-strong text-figma-disabled cursor-not-allowed">
        <span>{placeholder}</span>
        <Icon name="calendar" size={16} className="text-figma-disabled flex-shrink-0" />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-surface transition-colors text-left",
          invalid ? "border-figma-danger" : open ? "border-figma-primary" : "border-figma-subtle hover:border-figma-strong",
          displayText ? "text-figma-default" : "text-figma-disabled"
        )}
      >
        <span>{displayText || placeholder}</span>
        <Icon name="calendar" size={16} className="text-figma-disabled flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 right-0 bg-surface border border-figma-subtle rounded-xl shadow-xl p-4 w-[560px]">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-figma-muted text-figma-body"><Icon name="chevron-left" size={16} /></button>
            <div className="flex-1" />
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-figma-muted text-figma-body"><Icon name="chevron-right" size={16} /></button>
          </div>
          <div className="flex gap-6">
            <MonthGrid year={viewYear} month={viewMonth} onPick={handlePick} isSelected={isSelected} isInRange={isInRange} rangeEdge={rangeEdge} />
            <MonthGrid
              year={viewMonth === 11 ? viewYear + 1 : viewYear}
              month={viewMonth === 11 ? 0 : viewMonth + 1}
              onPick={handlePick}
              isSelected={isSelected}
              isInRange={isInRange}
              rangeEdge={rangeEdge}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 mb-1 text-[11px] text-figma-body">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-figma-primary" />Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-200" />Fully-Booked</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-figma-subtle">
            <span className="text-xs text-figma-body">{draftDisplayText || "No date selected"}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 text-sm font-medium text-figma-caption border border-figma-subtle rounded-lg hover:bg-figma-soft bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { onConfirm(draft); setOpen(false); }}
                className="px-4 py-1.5 text-sm font-semibold text-invert-default bg-figma-primary rounded-lg hover:bg-figma-primaryhover"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
