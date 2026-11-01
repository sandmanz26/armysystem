// Booking 2.0 — Booking Details: readiness banners + booking status badge (F-006, BD-21 / BD-3).
import type { BookingStatus } from "@/data/mock";
import { Alert } from "@/components/alert";
import { StatusBadge } from "@/components/status-badge";
import { BOOKING_STATUS_TONE } from "@/pages-tsx/booking-2/list/statusTone";
import { detailListMessage, readinessMessage, type Readiness } from "./bookingReadiness";

/**
 * Page-level `Alert`, first child of the page Body, 24px above the Page Header (5512:75076,
 * 5513:405960). Yellow before the booking day, red on the day.
 */
export function ReadinessBanner({ readiness }: { readiness: Readiness }) {
  const message = readinessMessage(readiness);
  if (!message) return null;
  return <Alert status={readiness.isToday ? "danger" : "warning"} message={message} className="mb-6" />;
}

/** Detail List tab's own `Alert`, 16px under the tabs (5513:254787 / 254795 / 287154). */
export function DetailListBanner({ readiness }: { readiness: Readiness }) {
  const message = detailListMessage(readiness);
  if (!message) return null;
  return <Alert message={message} />;
}

/** Figma `Badge - Booking Status`; the long status reads "Completed | Missing Assets" (5831:64203). */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <StatusBadge tone={BOOKING_STATUS_TONE[status]} className="leading-4">
      {status === "Completed with Missing Assets" ? "Completed | Missing Assets" : status}
    </StatusBadge>
  );
}
