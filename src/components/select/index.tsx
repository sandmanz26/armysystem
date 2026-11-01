import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { InputSize, InputStatus } from "@/components/input/Input";

/*
 * Select — design-system component.
 *
 * Figma `Input - Single Select` + `Listbox New` (Asset Type page, 5157:85718).
 * The closed control is the same shell as `Input`: label + required asterisk,
 * 40px box, radius 8, 12px padding, `text/placeholder` placeholder, 22px
 * chevron. Open it and a `Listbox New` panel drops below — white, radius 8,
 * 4px vertical padding, shadow; each `Listbox Item` is 36px with 8/12 padding
 * and a 14px Medium `text/default` label. The chosen row is `background/primary/invert/soft`
 * with its label still `text/default` and a 20px `check` in `text/primary` at the end
 * (Figma `Listbox Item/Single Item New`, State = Selected — seen on Add Blackout Date's
 * Repeat / Time / Ends dropdowns, 5117:267314 and 7973:20594).
 *
 * Shares InputSize / InputStatus with Input so the two stay in step.
 */

const SIZE: Record<InputSize, { box: string; text: string; label: string; stack: string }> = {
  sm: { box: "h-9  px-3", text: "text-sm",   label: "text-xs",   stack: "gap-0.5" },
  md: { box: "h-10 px-3", text: "text-sm",   label: "text-sm",   stack: "gap-1"   },
  lg: { box: "h-11 px-4", text: "text-base", label: "text-base", stack: "gap-1.5" },
};

const STATUS_BORDER: Record<InputStatus, string> = {
  default: "border-invert-default",
  info:    "border-info",
  success: "border-success",
  warning: "border-warning",
  danger:  "border-danger",
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[] | readonly string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: InputSize;
  status?: InputStatus;
  label?: React.ReactNode;
  required?: boolean;
  caption?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  wrapperClassName?: string;
  /** Optional glyph before the value (e.g. Accel's layout picker). Pass an <Icon />. */
  prefixIcon?: React.ReactNode;
  /** Tallest the open list grows before it scrolls, in px. Default 203 (5½ rows).
   *  Add Blackout Date's time lists use 264 — Figma's `Listbox New` there is 265 tall. */
  listMaxHeight?: number;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select",
  size = "md",
  status = "default",
  label,
  required,
  caption,
  disabled,
  id,
  wrapperClassName,
  prefixIcon,
  listMaxHeight = 203,
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = SIZE[size];

  const items: SelectOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const selected = items.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className={cn("flex flex-col", s.stack, wrapperClassName)} ref={ref}>
      {label && (
        <label
          htmlFor={selectId}
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

      <div className="relative rounded-lg">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={status === "danger" || undefined}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between gap-2.5 rounded-lg border transition-colors text-left",
            s.box,
            s.text,
            STATUS_BORDER[status],
            disabled
              ? "bg-disabled cursor-not-allowed text-body"
              : cn(
                  "bg-surface hover:border-primary",
                  "focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-invert-focused",
                  open && "border-primary",
                ),
          )}
        >
          {prefixIcon && <span className="flex flex-shrink-0 items-center text-body">{prefixIcon}</span>}
          <span className={cn("flex-1 truncate", selected ? "text-default" : "text-placeholder")}>
            {selected ? selected.label : placeholder}
          </span>
          {open ? (
            <ChevronUp size={18} className="flex-shrink-0 text-body" />
          ) : (
            <ChevronDown size={18} className="flex-shrink-0 text-body" />
          )}
        </button>

        {open && !disabled && (
          <ul
            role="listbox"
            style={{ maxHeight: listMaxHeight }}
            className="absolute z-50 left-0 right-0 top-full mt-1 overflow-y-auto rounded-lg bg-surface py-1 shadow-lg"
          >
            {items.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full h-9 px-3 flex items-center gap-2.5 text-left text-sm font-medium text-default transition-colors",
                    o.value === value ? "bg-primary-invert-soft" : "hover:bg-default-default",
                  )}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.value === value && (
                    <Icon name="check" size={20} className="flex-shrink-0 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {caption && (
        <p className={cn("text-xs", status === "danger" ? "text-danger" : "text-caption")}>{caption}</p>
      )}
    </div>
  );
}
