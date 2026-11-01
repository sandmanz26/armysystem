import React, { useId } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Input — design-system component.
 *
 * 1:1 port of the SHIELD Base Component library's `Input` component set
 * (Figma file nFi2FCtohAQTQLv2ckEJal, node 7:61640 — 84 variants).
 * Figma property → prop mapping and the full measured spec live in
 * ds_engineer.md at the repo root. Do not restyle this file from a screenshot;
 * re-read the component set and update ds_engineer.md in the same change.
 *
 * Figma's `State` variant (default / hovered / pressed / filled / filled-hovered
 * / filled-pressed) is NOT a prop here: hover and focus are CSS states, and
 * "filled" is just "the value is non-empty". Only the variants a caller can
 * actually choose — Size, Status, Disabled, Read-only — are props.
 */

export type InputSize = "sm" | "md" | "lg";
export type InputStatus = "default" | "info" | "success" | "warning" | "danger";

/** Figma Size variant → box height, padding, gap, font size, label size, stack gap. */
const SIZE: Record<
  InputSize,
  { box: string; text: string; label: string; stack: string; padLeft: string; padRight: string }
> = {
  sm: { box: "h-9  px-3 gap-2",    text: "text-sm",   label: "text-xs",  stack: "gap-0.5", padLeft: "pl-10", padRight: "pr-10" },
  md: { box: "h-10 px-3 gap-2.5",  text: "text-sm",   label: "text-sm",  stack: "gap-1",   padLeft: "pl-10", padRight: "pr-10" },
  lg: { box: "h-11 px-4 gap-3",    text: "text-base", label: "text-base", stack: "gap-1.5", padLeft: "pl-11", padRight: "pr-11" },
};

/** Figma Status variant → border colour. The box fill stays `background/surface`. */
const STATUS_BORDER: Record<InputStatus, string> = {
  default: "border-invert-default",
  info:    "border-info",
  success: "border-success",
  warning: "border-warning",
  danger:  "border-danger",
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Figma `Size`. Default `md` — the library's own default (marked `md*`). */
  size?: InputSize;
  /** Figma `Status`. `danger` also turns the caption red. */
  status?: InputStatus;
  /** Figma `Label` + `Label Text`. */
  label?: React.ReactNode;
  /** Figma `Required` — renders the red asterisk after the label. */
  required?: boolean;
  /** Figma `Info Icon` — the info glyph after the label. */
  infoIcon?: boolean;
  /** Tooltip text for the info icon. */
  infoTitle?: string;
  /** Figma `Caption` + `Caption Text` — the helper line under the field. */
  caption?: React.ReactNode;
  /** Figma `Prefix Icon` slot. Pass a rendered icon, e.g. `<User size={18} />`. */
  prefixIcon?: React.ReactNode;
  /** Figma `Suffix Icon` slot. Rendered after the clear button. */
  suffixIcon?: React.ReactNode;
  /** Figma `Clearable Icon` — shows an X while the field has a value. */
  clearable?: boolean;
  onClear?: () => void;
  /** Figma `Read-only` variant — disabled fill, but the value stays selectable. */
  readOnly?: boolean;
  /** Class for the outer wrapper (width, margins). `className` styles the <input>. */
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    status = "default",
    label,
    required,
    infoIcon,
    infoTitle,
    caption,
    prefixIcon,
    suffixIcon,
    clearable,
    onClear,
    readOnly,
    disabled,
    className,
    wrapperClassName,
    id,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const s = SIZE[size];
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const showClear = !!clearable && hasValue && !disabled && !readOnly;
  const inert = disabled || readOnly;

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
          {infoIcon && (
            <span className="ml-1 inline-flex text-caption" title={infoTitle}>
              <Info size={14} aria-hidden />
            </span>
          )}
        </label>
      )}

      {/* Focus Area — Figma draws a 1px white gap plus a 3px outer ring on focus */}
      <div className="relative rounded-lg">
        {prefixIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-caption pointer-events-none",
              size === "lg" && "left-4",
            )}
          >
            {prefixIcon}
          </span>
        )}

        <input
          id={inputId}
          ref={ref}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={status === "danger" || undefined}
          className={cn(
            "w-full rounded-lg border transition-colors",
            "text-default placeholder:text-placeholder",
            "focus:outline-none",
            s.box,
            s.text,
            STATUS_BORDER[status],
            prefixIcon && s.padLeft,
            (showClear || suffixIcon) && s.padRight,
            inert
              ? "bg-disabled cursor-not-allowed"
              : cn(
                  "bg-surface hover:border-primary",
                  "focus:border-primary focus:ring-[3px] focus:ring-primary-invert-focused",
                ),
            disabled && "border-disabled placeholder:text-placeholder",
            className,
          )}
          {...props}
        />

        {showClear && (
          <button
            type="button"
            aria-label="Clear"
            onClick={onClear}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-caption hover:text-default transition-colors",
              size === "lg" && "right-4",
              suffixIcon && "right-9",
            )}
          >
            <X size={16} />
          </button>
        )}

        {suffixIcon && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-caption",
              size === "lg" && "right-4",
            )}
          >
            {suffixIcon}
          </span>
        )}
      </div>

      {caption && (
        <p className={cn("text-xs", status === "danger" ? "text-danger" : "text-caption")}>
          {caption}
        </p>
      )}
    </div>
  );
});
