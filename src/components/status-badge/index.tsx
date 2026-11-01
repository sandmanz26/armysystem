import { cn } from "@/lib/utils";

/*
 * StatusBadge — design-system component.
 *
 * Figma `Badge`: radius full, 2/8 padding, 12px Medium, a
 * `background/<hue>/invert/default` fill with a `border/invert/<hue>` outline
 * and `text/<hue>` label. Extracted because four tables had hand-rolled the
 * same pill with slightly different greens, greys and paddings.
 *
 * Pick the TONE, not the colour — the mapping from a domain status
 * ("Available", "Pending Return", "Archived") to a tone belongs at the call
 * site, so one status can mean different things on different screens.
 */

export type BadgeTone = "success" | "danger" | "warning" | "info" | "purple" | "orange" | "neutral";

const TONE: Record<BadgeTone, string> = {
  success: "bg-success-invert-default border-invert-success text-success",
  danger:  "bg-danger-invert-default  border-invert-danger  text-danger",
  warning: "bg-warning-invert-default border-invert-warning text-warning",
  info:    "bg-info-invert-default    border-invert-info    text-info",
  purple:  "bg-purple-invert-default  border-invert-purple  text-purple",
  orange:  "bg-orange-invert-soft     border-invert-orange  text-orange",
  neutral: "bg-default-default        border-invert-default text-default",
};

export interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ children, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
