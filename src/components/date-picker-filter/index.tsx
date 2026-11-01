import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * DatePickerFilter — design-system component.
 *
 * Figma `Date Picker - Filter` (WPT MST TCT 3.0, node `5119:297909`, measured
 * off Operational Availability → Select Date). 384px, radius 8, `bg-surface`.
 * A SINGLE day calendar, not a month range — prev/next chevrons either side
 * of a "<Month> <Year>" label, a weekday row, a 6-week date grid, then
 * Today / Clear / Apply.
 *
 * Selected day: pill `background/primary/default` + `text/base` (white).
 * Days outside the shown month: `text/disabled`. In-month, unselected:
 * `text/default`.
 *
 * The "<Month> <Year> ⌄" button carries a chevron-down suffix in the frame
 * but no expanded state is shown anywhere in the file — nothing here says
 * what it opens, so it is left visual-only rather than inventing a picker
 * inside a picker. Prev/next already cover full navigation.
 */

export interface DatePickerFilterProps {
  /** Currently applied date, or `null` if none. Seeds the initial month shown. */
  value: Date | null;
  onApply: (date: Date) => void;
  onClear: () => void;
  onClose: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

export function DatePickerFilter({ value, onApply, onClear, onClose }: DatePickerFilterProps) {
  const seed = value ?? new Date();
  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());
  const [pending, setPending] = useState<Date | null>(value);

  const grid = buildGrid(viewYear, viewMonth);
  const today = startOfDay(new Date());

  const goMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    // z-[2000]: TableCustom's sticky header climbs to z-[1112] when a table
    // has `getNestedComponent` (Operational Availability's expand rows do),
    // so anything opened above the table needs to clear that — see
    // CHANGES.md for the same class of bug in Data Import's ConfirmDialog.
    <div className="absolute right-0 top-full z-[2000] mt-2 w-96 rounded-lg border border-invert-default bg-surface shadow-xl">
      {/* header */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-default hover:bg-main-background transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-medium text-default">
          {MONTH_NAMES[viewMonth]} {viewYear}
          <ChevronDown size={18} />
        </div>
        <button
          type="button"
          onClick={() => goMonth(1)}
          aria-label="Next month"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-default hover:bg-main-background transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* weekday row + date grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <div key={d} className="flex h-7 items-center justify-center text-xs text-disabled">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map(({ date, inMonth }) => {
            const isSelected = sameDay(pending, date);
            const isToday = sameDay(today, date);
            return (
              <div key={date.toISOString()} className="flex h-8 items-center justify-center">
                <button
                  type="button"
                  onClick={() => setPending(startOfDay(date))}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    isSelected
                      ? "bg-primary-default text-invert-default"
                      : inMonth
                        ? cn("text-default hover:bg-main-background", isToday && "font-semibold")
                        : "text-disabled hover:bg-main-background",
                  )}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* footer actions */}
      <div className="flex justify-end gap-3 p-4 pt-0">
        <button
          type="button"
          onClick={() => {
            const t = startOfDay(new Date());
            setViewYear(t.getFullYear());
            setViewMonth(t.getMonth());
            setPending(t);
          }}
          className="h-10 rounded-lg bg-transparent px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            setPending(null);
            onClear();
            onClose();
          }}
          className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={!pending}
          onClick={() => {
            if (!pending) return;
            onApply(pending);
            onClose();
          }}
          className={cn(
            "h-10 rounded-lg px-4 text-sm font-semibold transition-colors",
            pending
              ? "bg-primary-default text-invert-default hover:bg-primary-hovered"
              : "cursor-not-allowed bg-disabled text-disabled",
          )}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
