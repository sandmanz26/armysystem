import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Toggle — design-system component.
 *
 * Figma `Toggle` (measured on `Add New Blackout Date` 5116:216632 / 5117:268113).
 *
 *   track   48x24, radius full
 *           off → `background/default/invert/default` (#374151)
 *           on  → `background/primary/default`        (#115e59)
 *   knob    16px `background/surface` ellipse, left when off, right when on
 *   glyph   white (`text/base`) x-mark when off, check when on — it sits on the
 *           track OPPOSITE the knob, not inside it
 *   label   the state word ("Off" / "On"), 16 Regular `text/default`,
 *           with the field label above at 14 Medium `text/default`
 *
 * Site Management's blackout-date drawer and the IP Whitelisting switch both
 * use this; neither styles it at the call site.
 *
 * `inlineLabel` is the form variant (Add Blackout Date's "All day"): the label sits
 * BESIDE the switch at 14 Regular `text/default`, there is no On/Off word, and the row hugs
 * the 24px switch instead of the default 40px row. Opt-in — every other use is unchanged.
 */

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Field label above the switch — Figma `Label Text`. */
  label?: React.ReactNode;
  required?: boolean;
  /** Words shown beside the switch. Figma's default pair is On / Off. */
  onLabel?: string;
  offLabel?: string;
  /** Hide the state word entirely (IP Whitelisting draws its own copy). */
  hideStateLabel?: boolean;
  /** Form variant: a label beside the switch (no On/Off word, 24px row). See header. */
  inlineLabel?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Figma `Toggle` Size=sm (40x20 track, 12px knob, no glyph) — e.g. the lane Status column in
   *  Edit Lane Configuration (5512:166256). Optional; default keeps the 48x24 md switch. */
  size?: "md" | "sm";
  /** Figma `Success=true`: the "on" track is `background/success/default` instead of primary. */
  tone?: "primary" | "success";
  /** Off-track colour when enabled. `danger` = `background/danger/default` (#b91c1c) — Create
   *  Booking 2.0 lane Status, a lane switched off by the user (5322:161092 Lane 5). */
  offTone?: "default" | "danger";
}

export function Toggle({
  checked,
  onChange,
  label,
  required,
  onLabel = "On",
  offLabel = "Off",
  hideStateLabel,
  inlineLabel,
  disabled,
  id,
  className,
  size = "md",
  tone = "primary",
  offTone = "default",
}: ToggleProps) {
  const sm = size === "sm";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span
          className={cn(
            "flex items-center gap-0.5 text-sm font-medium",
            disabled ? "text-body" : "text-default",
          )}
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </span>
      )}

      <div className={cn("flex items-center gap-2.5", inlineLabel ? "h-6" : sm ? "h-5" : "h-10")}>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={
            typeof label === "string" ? label : typeof inlineLabel === "string" ? inlineLabel : undefined
          }
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex shrink-0 items-center rounded-full transition-colors",
            sm ? "h-5 w-10" : "h-6 w-12",
            checked ? (tone === "success" ? "bg-success-default" : "bg-primary-default") : sm && disabled ? "bg-disabled" : offTone === "danger" && !disabled ? "bg-danger-default" : "bg-default-invert-default",
            disabled ? cn("cursor-not-allowed", !sm && "opacity-60") : "cursor-pointer",
          )}
        >
          {/* Glyph sits opposite the knob, per Figma. The form variant draws none: its frames
              (Add Blackout Date's "All day") have both Check Icon and Xmark Icon off. */}
          {!inlineLabel && !sm && (
            <span
              className={cn(
                "absolute flex items-center text-invert-default",
                checked ? "left-1.5" : "right-1.5",
              )}
              aria-hidden
            >
              {checked ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
            </span>
          )}
          <span
            className={cn(
              "relative rounded-full bg-surface shadow transition-transform",
              sm ? "h-3 w-3" : "h-4 w-4",
              checked ? (sm ? "translate-x-6" : "translate-x-[28px]") : "translate-x-1",
            )}
          />
        </button>

        {inlineLabel ? (
          <span
            className={cn("text-sm text-default", !disabled && "cursor-pointer")}
            onClick={() => !disabled && onChange(!checked)}
          >
            {inlineLabel}
          </span>
        ) : (
          !hideStateLabel && (
            <span className="text-base text-default">{checked ? onLabel : offLabel}</span>
          )
        )}
      </div>
    </div>
  );
}
