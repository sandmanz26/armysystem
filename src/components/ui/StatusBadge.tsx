import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/data/mock";

interface StatusBadgeProps {
  status: BookingStatus;
  size?: "sm" | "md";
}

/*
 * Booking status pill — colours read off Figma's `Badge - Booking Status`
 * instances on the Booking List calendar (`5029:30128`, frame
 * `Booking List - Calendar Card - Month`, section 5680:63310). Each status's
 * hue is confirmed there: the card itself is tinted
 * `background/<hue>/invert/soft` + `border/invert/<hue>`, and the badge text
 * carries the matching `text/<hue>`.
 *
 * Was a mix of raw Tailwind shades (bg-blue-50, bg-orange-50, bg-gray-100,
 * bg-purple-50, bg-yellow-50, text-red-500 …) with only two of seven statuses
 * actually on tokens. All seven are tokens now, so a palette change in Figma
 * reaches every place this badge is used — including the Booking 2.0 calendar
 * event cards, which read the same map.
 *
 * "Completed with Missing Assets" is not in Figma's calendar sample data (no
 * booking there carries that status), so its tone is a reasoned choice, not a
 * verified one: `warning` (amber), matching how this app already colours an
 * incomplete/needs-attention state elsewhere.
 */
const statusConfig: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  Upcoming: { bg: "bg-info-invert-soft", text: "text-info", border: "border-invert-info" },
  Ongoing: { bg: "bg-orange-invert-soft", text: "text-orange", border: "border-invert-orange" },
  Completed: { bg: "bg-success-invert-soft", text: "text-success", border: "border-invert-success" },
  Cancelled: { bg: "bg-default-default", text: "text-default", border: "border-invert-default" },
  Overdue: { bg: "bg-danger-invert-soft", text: "text-danger", border: "border-invert-danger" },
  "Return Assets": { bg: "bg-purple-invert-soft", text: "text-purple", border: "border-invert-purple" },
  "Completed with Missing Assets": { bg: "bg-warning-invert-soft", text: "text-warning", border: "border-invert-warning" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        cfg.bg,
        cfg.text,
        cfg.border,
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5"
      )}
    >
      {status}
    </span>
  );
}
