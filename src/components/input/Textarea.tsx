import React, { useId } from "react";
import { cn } from "@/lib/utils";
import type { InputSize, InputStatus } from "./Input";

/*
 * Textarea — design-system component.
 *
 * Figma `Text Area` (measured on `Add Location` 5029:6593). Same label/caption
 * anatomy as `Input`, different box:
 *
 *   label      14 Medium `text/default` (+ red asterisk when required), gap 4
 *   box        radius 8, padding 8 top/right/bottom and 12 left,
 *              `background/surface` on a 1px `border/invert/default`,
 *              132px tall at `md` — Figma's default
 *   text       14 Regular; placeholder `text/placeholder`
 *   handle     Figma draws an `Expand Icon` bottom-right, which is the native
 *              resize grip — so the field resizes vertically only
 *
 * Shares InputSize / InputStatus with `Input` so the two cannot drift.
 * Six screens had hand-rolled a <textarea> with their own greys before this.
 */

/** Figma Size variant → box height, text size, label size, stack gap. */
const SIZE: Record<InputSize, { box: string; text: string; label: string; stack: string }> = {
  sm: { box: "min-h-[100px] px-3 py-2",  text: "text-sm",   label: "text-xs",   stack: "gap-0.5" },
  md: { box: "min-h-[132px] pl-3 pr-2 py-2", text: "text-sm",   label: "text-sm",   stack: "gap-1"   },
  lg: { box: "min-h-[164px] px-4 py-3",  text: "text-base", label: "text-base", stack: "gap-1.5" },
};

/** Figma Status variant → border colour. The box fill stays `background/surface`. */
const STATUS_BORDER: Record<InputStatus, string> = {
  default: "border-invert-default",
  info:    "border-info",
  success: "border-success",
  warning: "border-warning",
  danger:  "border-danger",
};

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: InputSize;
  status?: InputStatus;
  label?: React.ReactNode;
  required?: boolean;
  caption?: React.ReactNode;
  /** Class for the outer wrapper (width, margins). `className` styles the <textarea>. */
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = "md",
    status = "default",
    label,
    required,
    caption,
    disabled,
    readOnly,
    className,
    wrapperClassName,
    id,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const s = SIZE[size];
  const inert = disabled || readOnly;

  return (
    <div className={cn("flex flex-col", s.stack, wrapperClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        id={textareaId}
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={status === "danger" || undefined}
        className={cn(
          "w-full resize-y rounded-lg border transition-colors",
          s.box,
          s.text,
          STATUS_BORDER[status],
          "placeholder:text-placeholder",
          inert
            ? "bg-disabled text-body cursor-not-allowed"
            : cn(
                "bg-surface text-default hover:border-primary",
                "focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-invert-focused",
              ),
          className,
        )}
        {...props}
      />

      {caption && (
        <p className={cn("text-xs", status === "danger" ? "text-danger" : "text-caption")}>
          {caption}
        </p>
      )}
    </div>
  );
});
