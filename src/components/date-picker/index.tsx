import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * DatePicker — design-system component.
 *
 * Figma `Date Picker` (State = Selected), the calendar under the Date field in Site
 * Management → Add Blackout Date (`Dropdown - Start Date` 5117:267056, picker 5117:267408).
 * 384×364, radius 8, `background/surface`, drop shadow.
 *
 *   header   16px padding, 12px gap: a 40px chevron-left button, a 40-tall outlined
 *            "<Month> <Year> ⌄" button, a 40px chevron-right button
 *   weekdays Sun … Sat, one 28px row
 *   grid     6 weeks × 7 days, 32px rows; the picked day is a `background/primary/default`
 *            pill with `text/base`; days of the neighbouring months are `text/disabled`
 *   action   a single outlined **Clear** button, right-aligned, 16px from the edges
 *
 * A day is applied the moment it is clicked — there is no Apply. That is what separates it
 * from `DatePickerFilter` (Today / Clear / Apply, from `Date Picker - Filter`), which stays as
 * it is. Like that one, the "<Month> <Year> ⌄" button is visual only: no frame shows what it
 * opens, so prev/next carry the navigation.
 *
 * The weekday row copies `DatePickerFilter`'s measured style (12px `text/disabled`); this
 * frame's own weekday style could not be re-read when this was written.
 */

export interface DatePickerProps {
  /** The picked day, or `null`. Seeds which month opens. */
  value: Date | null;
  /** Called with the clicked day (local midnight). The caller closes the picker. */
  onSelect: (date: Date) => void;
  onClear: () => void;
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** 6 rows × 7 days, including the leading/trailing days of the neighbouring months. */
function buildGrid(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

export function DatePicker({ value, onSelect, onClear, className }: DatePickerProps) {
  const seed = value ?? new Date();
  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());
  const grid = buildGrid(viewYear, viewMonth);

  // A date typed into the field while the picker is open should bring its month into view.
  const valueTime = value?.getTime();
  useEffect(() => {
    if (valueTime === undefined) return;
    const d = new Date(valueTime);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [valueTime]);

  const goMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const navButton =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-default transition-colors hover:bg-main-background";

  return (
    <div className={cn("w-96 rounded-lg bg-surface shadow-xl", className)}>
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className={navButton}>
          <Icon name="chevron-left" size={18} />
        </button>
        <div className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-medium text-default">
          {MONTH_NAMES[viewMonth]} {viewYear}
          <Icon name="chevron-down" size={18} />
        </div>
        <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className={navButton}>
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

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
            const selected = sameDay(value, date);
            return (
              <div key={date.toISOString()} className="flex h-8 items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelect(startOfDay(date))}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    selected
                      ? "bg-primary-default text-invert-default"
                      : inMonth
                        ? "text-default hover:bg-main-background"
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

      <div className="flex justify-end px-4 pb-4">
        <button
          type="button"
          onClick={onClear}
          className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default transition-colors hover:bg-main-background"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
