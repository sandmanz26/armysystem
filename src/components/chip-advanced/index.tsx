import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

/*
 * ChipAdvanced — design-system component.
 *
 * Figma `Chip Advanced` / `Chip Advanced Item`. A 40-tall pill used wherever a
 * set of options is picked inline rather than from a dropdown or a checkbox
 * column. Two places use it today and they read the same bindings:
 *
 *   Site Management → Add Blackout Date → Repeat → Custom → "On" weekdays (multi-select)
 *   Data Export     → "Data Type *"                                       (multi-select)
 *
 *   unselected  `color/background/surface`             + `color/border/default`
 *   selected    `color/background/primary/invert/soft` + `color/border/primary`
 *   label       `color/text/default` in BOTH states — the selected chip's frame
 *               (`Chip Advanced Item`, State = Active) keeps the neutral text; only its
 *               fill and border change. (It used to turn `text/primary`.)
 *
 * `multi` only changes the ARIA role — a single-select group is a radiogroup,
 * a multi-select group is a set of toggle buttons. The visual is identical,
 * because Figma draws one component for both.
 */

export interface ChipAdvancedProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** true → `aria-pressed` toggle; false (default) → `aria-checked` radio. */
  multi?: boolean;
  disabled?: boolean;
  /**
   * Prefix the selected chip with `Icon / check` (18px, 6px gap) — the variant Figma draws in
   * Booking List → `Drawer - Filter - Selected` (5029:30101). Off by default so the other
   * call sites (weekday repeat, data type) keep their current frames.
   */
  checkIcon?: boolean;
  /**
   * `md` (default) = the 40px pill above. `sm` = 36px, 12px side padding, 14 Regular label and a
   * 16px check — the `Chip Advanced Item` drawn in Resource Planning → Edit - Resource Types
   * (6900:44444). Optional, so existing call sites keep `md`.
   */
  size?: "md" | "sm";
  className?: string;
}

export function ChipAdvanced({
  label,
  selected,
  onSelect,
  multi = false,
  disabled = false,
  checkIcon = false,
  size = "md",
  className,
}: ChipAdvancedProps) {
  return (
    <button
      type="button"
      role={multi ? undefined : "radio"}
      aria-checked={multi ? undefined : selected}
      aria-pressed={multi ? selected : undefined}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "whitespace-nowrap rounded-lg border text-sm transition-colors",
        size === "sm" ? "h-9 px-3 font-normal" : "h-10 px-4 font-medium",
        checkIcon && "inline-flex items-center gap-1.5",
        selected
          ? "bg-primary-invert-soft border-primary text-default"
          : "bg-surface border-default text-default hover:bg-default-hovered",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {checkIcon && selected && <Icon name="check" size={size === "sm" ? 16 : 18} />}
      {label}
    </button>
  );
}

/** The wrapper Figma calls `Radio Group` inside `Chip Advanced` — chips wrap. */
export function ChipAdvancedGroup({
  multi = false,
  children,
  className,
}: {
  multi?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role={multi ? "group" : "radiogroup"} className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}
