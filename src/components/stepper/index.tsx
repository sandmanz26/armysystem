import { useId } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Stepper — design-system component.
 *
 * Figma `Input - Stepper`: minus | value | plus. Measured on "Repeats every" in Site
 * Management → Add Blackout Date (`Custom - Week` 7974:34057), 157×40.
 *
 *   box     40 tall, radius 8, 1px `border/invert/default`, fill `background/surface`
 *   buttons two 40×40 icon buttons (18px `minus` / `plus`) sharing the box's border; the minus
 *           icon drops to `text/disabled` at the minimum
 *   value   14 Regular `text/default`, centred
 *
 * This is NOT `NumberStepper`, which is modelled on a different Figma component
 * (`Input - Stepper Right`: value on the left, plus/minus stacked flush right).
 * Width is the caller's: Figma uses 157 in that row, so pass `className="w-[157px]"`.
 */

export interface StepperProps {
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled,
  invalid,
  id,
  className,
  ...rest
}: StepperProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const num = value === "" ? min : Number(value);
  const nudge = (by: number) => onChange(Math.min(max, Math.max(min, num + by)));

  const buttonClass =
    "flex w-10 shrink-0 items-center justify-center text-default transition-colors hover:bg-main-background " +
    "disabled:text-disabled disabled:hover:bg-transparent";

  return (
    <div
      className={cn(
        "flex h-10 items-stretch overflow-hidden rounded-lg border bg-surface transition-colors",
        invalid ? "border-danger" : "border-invert-default",
        disabled
          ? "bg-disabled"
          : "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary-invert-focused",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || num <= min}
        onClick={() => nudge(-step)}
        className={cn(buttonClass, "border-r border-invert-default")}
      >
        <Icon name="minus" size={18} />
      </button>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-2 text-center text-sm text-default focus:outline-none",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || num >= max}
        onClick={() => nudge(step)}
        className={cn(buttonClass, "border-l border-invert-default")}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
