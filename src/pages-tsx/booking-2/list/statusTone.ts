import type { BookingStatus } from "@/data/mock";
import type { BadgeTone } from "@/components/status-badge";

/*
 * Booking status → design-system Badge tone. Read off Figma's calendar event
 * cards (`Booking List - Calendar Card - Month Item`, page `↪ Booking List`
 * `5029:28299`, section `5029:30128`): each card's own tint and the status
 * chip inside it both carry the SAME hue — `background/<hue>/invert/soft` on
 * the card, `text/<hue>` on the badge. Confirmed for six of the seven
 * BookingStatus values:
 *
 *   Upcoming   → info      Ongoing        → orange   Completed → success
 *   Cancelled  → neutral   Return Assets  → purple    Overdue   → danger
 *
 * "Completed with Missing Assets" never appears in Figma's sample data, so
 * `warning` here is a reasoned choice — an incomplete/needs-attention state —
 * not a verified one.
 *
 * One map, two consumers: the Booking List table's Status column and the
 * calendar's event cards, so both read the same colour for the same status
 * rather than drifting the way `components/ui/StatusBadge` had (raw Tailwind
 * shades for five of seven statuses, until this same pass corrected it).
 */
export const BOOKING_STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  Upcoming: "info",
  Ongoing: "orange",
  Completed: "success",
  Cancelled: "neutral",
  Overdue: "danger",
  "Return Assets": "purple",
  "Completed with Missing Assets": "warning",
};
