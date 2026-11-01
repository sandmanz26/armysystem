import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * MonthRangePicker — design-system component.
 *
 * Figma `Date Picker - Month Filter` (WPT MST TCT 3.0, Operational Availability →
 * `Select Date` section: 5119:297891 default, 5119:297910 selected,
 * 5119:297929 applied). 384 wide, radius 8, `bg-surface`, shadow-lg, no border.
 *
 *   header   40×40 chevron buttons either side of the year (14 SemiBold),
 *            padding 16, gap 12. A chevron with nowhere to go is
 *            `text/disabled` (Figma greys the "next year" chevron).
 *   grid     3 columns × 4 rows of `Date Picker/date-item`, 117×40, columns
 *            touching (so a range reads as one band), 12 px between rows.
 *              Default   rounded-full, text/default
 *              Inactive  text/disabled, not clickable (months outside min/max)
 *              Lead      primary fill, white text, rounded on the left
 *              Middle    background/primary/invert/default, text/primary, square
 *              Trail     primary fill, white text, rounded on the right
 *            A one-month selection is Lead + Trail at once → fully rounded.
 *   footer   the pending range ("Jan - Apr 2026", 14 Regular) then Clear
 *            (outlined) · Apply (primary), gap 12, padding 0 16 16.
 *
 * Interaction: first click picks the start month, second click the end month
 * (an earlier second click swaps them), a third click starts again. Apply with
 * only a start month applies that single month. Apply with nothing picked
 * behaves as Clear.
 *
 * The component only renders the popover; the caller positions it (it is
 * `absolute right-0 top-full`, so wrap the trigger in a `relative` box) and
 * owns the trigger button + outside-click handling.
 */

export interface YearMonth {
  year: number;
  /** 0-based (0 = January). */
  month: number;
}

export interface MonthRange {
  from: YearMonth;
  to: YearMonth;
}

export interface MonthRangePickerProps {
  value: MonthRange | null;
  onApply: (range: MonthRange) => void;
  onClear: () => void;
  onClose: () => void;
  /** Earliest selectable month; earlier months render Inactive. */
  min?: YearMonth;
  /** Latest selectable month; later months render Inactive. */
  max?: YearMonth;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = MONTH_NAMES.map((m) => m.slice(0, 3));

const key = (ym: YearMonth) => ym.year * 12 + ym.month;

/** "Jan - Apr 2026", "Nov 2025 - Apr 2026", or "Apr 2026" for a single month. */
export function formatMonthRange(range: MonthRange): string {
  const { from, to } = range;
  if (key(from) === key(to)) return `${MONTH_ABBR[from.month]} ${from.year}`;
  if (from.year === to.year) return `${MONTH_ABBR[from.month]} - ${MONTH_ABBR[to.month]} ${to.year}`;
  return `${MONTH_ABBR[from.month]} ${from.year} - ${MONTH_ABBR[to.month]} ${to.year}`;
}

/** True when `ym` falls inside `range` (inclusive). */
export function isInMonthRange(ym: YearMonth, range: MonthRange): boolean {
  const k = key(ym);
  return k >= key(range.from) && k <= key(range.to);
}

export function MonthRangePicker({ value, onApply, onClear, onClose, min, max, className }: MonthRangePickerProps) {
  const [year, setYear] = useState(() => value?.to.year ?? max?.year ?? new Date().getFullYear());
  const [from, setFrom] = useState<YearMonth | null>(value?.from ?? null);
  const [to, setTo] = useState<YearMonth | null>(value?.to ?? null);

  const canPrev = !min || year - 1 >= min.year;
  const canNext = !max || year + 1 <= max.year;

  const isDisabled = (ym: YearMonth) =>
    (min !== undefined && key(ym) < key(min)) || (max !== undefined && key(ym) > key(max));

  const pick = (ym: YearMonth) => {
    if (!from || to) {
      setFrom(ym);
      setTo(null);
    } else if (key(ym) < key(from)) {
      setTo(from);
      setFrom(ym);
    } else {
      setTo(ym);
    }
  };

  const pending: MonthRange | null = from ? { from, to: to ?? from } : null;

  const navButton = (dir: "prev" | "next") => {
    const enabled = dir === "prev" ? canPrev : canNext;
    return (
      <button
        type="button"
        aria-label={dir === "prev" ? "Previous year" : "Next year"}
        disabled={!enabled}
        onClick={() => setYear((y) => y + (dir === "prev" ? -1 : 1))}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          enabled ? "text-default hover:bg-main-background" : "cursor-not-allowed text-disabled",
        )}
      >
        <Icon name={dir === "prev" ? "chevron-left" : "chevron-right"} size={18} />
      </button>
    );
  };

  return (
    // z-[2000]: clears TableCustom's sticky header (z-[1112] with nested rows).
    <div
      className={cn(
        "absolute right-0 top-full z-[2000] mt-0.5 w-96 select-none rounded-lg bg-surface shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {navButton("prev")}
        <span className="flex-1 text-center text-sm font-semibold leading-5 text-default">{year}</span>
        {navButton("next")}
      </div>

      <div className="grid grid-cols-3 gap-y-3 px-4 pb-4">
        {MONTH_NAMES.map((name, month) => {
          const ym = { year, month };
          const disabled = isDisabled(ym);
          const k = key(ym);
          const isLead = !!pending && k === key(pending.from);
          const isTrail = !!pending && k === key(pending.to);
          const isMiddle = !!pending && k > key(pending.from) && k < key(pending.to);
          return (
            <button
              key={name}
              type="button"
              disabled={disabled}
              aria-pressed={isLead || isTrail || isMiddle}
              onClick={() => pick(ym)}
              className={cn(
                "flex h-10 items-center justify-center text-sm leading-5 transition-colors",
                isLead || isTrail
                  ? cn(
                      "bg-primary-default text-invert-default",
                      isLead && "rounded-l-full",
                      isTrail && "rounded-r-full",
                    )
                  : isMiddle
                    ? "bg-primary-invert-default text-primary"
                    : disabled
                      ? "cursor-not-allowed rounded-full text-disabled"
                      : "rounded-full text-default hover:bg-main-background",
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 px-4 pb-4">
        {pending && <span className="text-sm leading-5 text-default">{formatMonthRange(pending)}</span>}
        <button
          type="button"
          onClick={() => {
            setFrom(null);
            setTo(null);
            onClear();
            onClose();
          }}
          className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            if (pending) onApply(pending);
            else onClear();
            onClose();
          }}
          className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
