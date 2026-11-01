import React, { useId } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputSize, InputStatus } from "./Input";

/*
 * NumberStepper — design-system component.
 *
 * Figma `Input - Stepper Right` (Rank page, 5029:3758). Same shell as `Input`:
 * label + required asterisk, 40px box, radius 8, `border/invert/default`.
 * The value sits left with 12px padding; a 79px stepper group is flush right,
 * two 40×40 icon buttons sharing a 1px border with the field.
 */

const SIZE: Record<InputSize, { box: string; text: string; label: string; stack: string }> = {
  sm: { box: "h-9",  text: "text-sm",   label: "text-xs",   stack: "gap-0.5" },
  md: { box: "h-10", text: "text-sm",   label: "text-sm",   stack: "gap-1"   },
  lg: { box: "h-11", text: "text-base", label: "text-base", stack: "gap-1.5" },
};

const STATUS_BORDER: Record<InputStatus, string> = {
  default: "border-invert-default",
  info:    "border-info",
  success: "border-success",
  warning: "border-warning",
  danger:  "border-danger",
};

export interface NumberStepperProps {
  value: number | "";
  onChange: (value: number | "") => void;
  label?: React.ReactNode;
  required?: boolean;
  caption?: React.ReactNode;
  status?: InputStatus;
  size?: InputSize;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  wrapperClassName?: string;
}

export function NumberStepper({
  value,
  onChange,
  label,
  required,
  caption,
  status = "default",
  size = "md",
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  placeholder = "0",
  disabled,
  id,
  wrapperClassName,
}: NumberStepperProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const s = SIZE[size];
  const num = value === "" ? min : Number(value);

  const nudge = (by: number) => {
    const next = Math.min(max, Math.max(min, num + by));
    onChange(next);
  };

  return (
    <div className={cn("flex flex-col", s.stack, wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "flex items-center gap-0.5 font-medium",
            s.label,
            disabled ? "text-body" : "text-default",
          )}
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-lg border bg-surface transition-colors",
          s.box,
          STATUS_BORDER[status],
          disabled
            ? "bg-disabled cursor-not-allowed"
            : "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary-invert-focused",
        )}
      >
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={status === "danger" || undefined}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 text-default placeholder:text-placeholder focus:outline-none",
            s.text,
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
        />
        <button
          type="button"
          aria-label="Decrease"
          disabled={disabled || num <= min}
          onClick={() => nudge(-step)}
          className="w-10 flex items-center justify-center border-l border-invert-default text-default hover:bg-main-background disabled:text-disabled disabled:hover:bg-transparent transition-colors"
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          aria-label="Increase"
          disabled={disabled || num >= max}
          onClick={() => nudge(step)}
          className="w-10 flex items-center justify-center border-l border-invert-default text-default hover:bg-main-background disabled:text-disabled disabled:hover:bg-transparent transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {caption && (
        <p className={cn("text-xs", status === "danger" ? "text-danger" : "text-caption")}>{caption}</p>
      )}
    </div>
  );
}
