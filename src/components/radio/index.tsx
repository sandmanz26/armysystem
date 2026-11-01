import { useId } from "react";
import { cn } from "@/lib/utils";

/*
 * Radio / RadioGroup — design-system components.
 *
 * Figma `Radio ` and `Radio Group` (measured on Data Export 5103:61590).
 *
 *   row        36px tall, 8px gap between the circle and its label
 *   circle     18px, radius full, `background/surface`
 *              unchecked → 1px `border/default`  (#9ca3af)
 *              checked   → 1px `border/primary`  (#115e59) + a 10px `Dot`
 *                          filled `background/primary/default`
 *   label      14 Regular `text/default`
 *   group      label 14 Medium `text/default` (+ red asterisk), 4px gap to the
 *              options, which stack with no gap between rows
 *
 * Three settings screens and two booking steps had hand-rolled
 * <input type="radio"> with their own greys before this.
 */

export interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Radio({
  name,
  value,
  checked,
  onChange,
  label,
  disabled,
  id,
  className,
}: RadioProps) {
  const autoId = useId();
  const radioId = id ?? `${name}-${autoId}`;

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "flex h-9 items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <span className="relative grid h-[18px] w-[18px] place-items-center">
        <input
          id={radioId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className={cn(
            "peer col-start-1 row-start-1 h-[18px] w-[18px] appearance-none rounded-full border bg-surface transition-colors",
            checked ? "border-primary" : "border-default",
            disabled
              ? "cursor-not-allowed border-disabled bg-disabled"
              : "cursor-pointer hover:border-primary",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500",
          )}
        />
        {checked && (
          <span
            aria-hidden
            className="pointer-events-none col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-primary-default"
          />
        )}
      </span>
      <span className={cn("text-sm", disabled ? "text-body" : "text-default")}>{label}</span>
    </label>
  );
}

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioGroupOption[] | readonly string[];
  value?: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  required?: boolean;
  caption?: React.ReactNode;
  status?: "default" | "danger";
  /** Figma `Orientation`. Default vertical, matching the library default. */
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  required,
  caption,
  status = "default",
  orientation = "vertical",
  className,
}: RadioGroupProps) {
  const items: RadioGroupOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  return (
    <div className={cn("flex flex-col gap-1", className)} role="radiogroup" aria-label={typeof label === "string" ? label : undefined}>
      {label && (
        <span className="flex items-center gap-0.5 text-sm font-medium text-default">
          {label}
          {required && <span className="text-danger">*</span>}
        </span>
      )}

      <div className={cn("flex", orientation === "vertical" ? "flex-col" : "flex-row gap-6")}>
        {items.map((o) => (
          <Radio
            key={o.value}
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={onChange}
            label={o.label}
            disabled={o.disabled}
          />
        ))}
      </div>

      {caption && (
        <p className={cn("text-xs", status === "danger" ? "text-danger" : "text-caption")}>
          {caption}
        </p>
      )}
    </div>
  );
}
