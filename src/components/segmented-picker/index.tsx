import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * SegmentedPicker — design-system component.
 *
 * Figma `Segmented Picker` (Booking List, 5331:428546 md · 7602:81094 sm):
 *   wrapper   `background/default/default`, radius 8, padding 2
 *   item      radius 4; active = `background/surface` + two 1px drop shadows
 *             (Tailwind `shadow`) + `text/primary`; inactive = no fill,
 *             `text/placeholder`
 *   sm        36 tall — item 32 tall, padding 8, label 14 Medium
 *   md        40 tall — item 36 tall, padding 8/12, gap 10, 20px prefix icon,
 *             label 16 Medium
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedPickerProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedPicker<T extends string>({ options, value, onChange, size = "sm", className }: SegmentedPickerProps<T>) {
  return (
    <div role="tablist" className={cn("inline-flex flex-shrink-0 items-center rounded-lg bg-default-default p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center rounded font-medium transition-colors",
              size === "md" ? "h-9 gap-2.5 px-3 text-base" : "h-8 gap-2 px-2 text-sm",
              active ? "bg-surface text-primary shadow" : "text-placeholder hover:text-default",
            )}
          >
            {o.icon && <span className="flex h-5 w-5 items-center justify-center">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
