import React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaDescribedBy?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  size?: number;
  /** Figma `Label` + `Label Text` — renders the text beside the box and makes
      the whole thing clickable. Without it the box stands alone (table cells). */
  label?: React.ReactNode;
  /** Figma `Required` — red asterisk after the label. */
  required?: boolean;
  /** Class for the outer <label> wrapper when `label` is given. */
  wrapperClassName?: string;
}

export const Checkbox = ({
  id: idProp,
  name = "checkbox",
  checked,
  indeterminate = false,
  disabled = false,
  ariaDescribedBy,
  onChange,
  className = "",
  size = 20,
  label,
  required,
  wrapperClassName,
}: CheckboxProps) => {
  // A fixed default id made every id-less checkbox share id="checkbox", so clicking any label
  // toggled the first box on the page. Generate a unique one instead.
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const box = (
    <div
      className="group grid grid-cols-1"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        onChange={handleChange}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        className={cn(
          // Figma `Checkbox`: 18px square, radius 4, unchecked
          // `background/surface` on a `border/default` outline, checked filled
          // with `background/primary/default` (no separate checked border).
          "col-start-1 row-start-1 appearance-none rounded border border-default bg-surface cursor-pointer",
          "checked:border-transparent checked:bg-primary-default",
          "indeterminate:border-transparent indeterminate:bg-primary-default",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-default",
          "disabled:border-disabled disabled:bg-disabled disabled:checked:bg-disabled disabled:cursor-not-allowed",
          "transition-colors",
          className
        )}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <svg
        fill="none"
        viewBox="0 0 14 14"
        style={{ width: `${size}px`, height: `${size}px` }}
        className="pointer-events-none col-start-1 row-start-1 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-disabled"
      >
        {/* Checkmark for checked state */}
        <path
          d="M3 8L6 11L11 3.5"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-0 group-has-[:checked]:opacity-100 transition-opacity"
        />
        {/* Horizontal line for indeterminate state */}
        <path
          d="M3 7H11"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-0 group-has-[:indeterminate]:opacity-100 transition-opacity"
        />
      </svg>
    </div>
  );

  if (!label) return box;

  /* Figma `Checkbox` with Label: 36px row, box + 14 Medium `text/default`. */
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex h-9 items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        wrapperClassName,
      )}
    >
      {box}
      <span
        className={cn(
          "flex items-center gap-0.5 text-sm font-medium",
          disabled ? "text-body" : "text-default",
        )}
      >
        {label}
        {required && <span className="text-danger">*</span>}
      </span>
    </label>
  );
};
