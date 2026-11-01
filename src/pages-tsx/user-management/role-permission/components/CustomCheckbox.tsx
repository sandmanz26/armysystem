import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Permission-matrix checkbox — Figma `Checkbox`, Size=md*, Shape=square, 18px,
 * radius 4. Resolved from `User Permission` (5029:2029 and 6027:907601); the
 * three states the matrix actually uses, by variable NAME:
 *
 *   Checked + Read-only   fill background/disabled (#e5e7eb)
 *                         stroke border/disabled  (#d1d5db)
 *                         tick  text/disabled     (#9ca3af)
 *   Checked, editable     fill background/primary/default (#115e59), no stroke
 *                         tick  text/base (#ffffff)
 *   Unchecked, editable   fill background/surface (#ffffff)
 *                         stroke border/default   (#9ca3af)
 *
 * System Admin's column is Read-only, NOT Disabled — a distinction that matters
 * (figma-color-sync Pitfall #8). An earlier fix got that part right but painted
 * read-only as the brand fill at 60% opacity; Figma greys the whole control and
 * keeps the tick, muted. Grey box + grey tick, not a faded maroon one.
 */

interface CustomCheckboxProps {
  checked: boolean;
  /** Cannot be changed, but still shows its true state. */
  readOnly?: boolean;
  /** Not applicable at all — greyed and empty. */
  disabled?: boolean;
  onChange: () => void;
}

export function CustomCheckbox({ checked, readOnly, disabled, onChange }: CustomCheckboxProps) {
  const inert = readOnly || disabled;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-readonly={readOnly || undefined}
      onClick={inert ? undefined : onChange}
      disabled={disabled}
      className={cn(
        "w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 border transition-colors",
        disabled
          ? "bg-disabled border-disabled text-disabled cursor-not-allowed"
          : readOnly
            ? // Figma: read-only keeps its tick, in text/disabled on a grey box.
              "bg-disabled border-disabled text-disabled cursor-not-allowed"
            : checked
              ? "bg-primary-default border-transparent text-invert-default hover:bg-primary-hovered"
              : "bg-surface border-default hover:border-primary",
      )}
    >
      {checked && !disabled && <Check size={12} strokeWidth={3} />}
    </button>
  );
}
