// Booking 2.0 — Today's Booking quick preview.
//
// Figma `Drawer - Booking Details` (Today's Booking section 5029:22855,
// node 6761:61157): clicking the Eye icon on a Today's Booking row opens a
// 512px drawer (wider than the shared Drawer's 384px default) with the same
// Booking Details / Courseware Details card pair the full Booking Detail
// page shows, stacked, plus a "View Booking Details" button that navigates
// to the full page. Booking List's own Eye button is unaffected — it still
// navigates straight there (see `onViewBooking` on BookingTable).
import { Drawer } from "@/components/drawer";
import { BookingSummaryCards } from "@/pages-tsx/booking-2/components/BookingSummaryCards";
import type { Booking } from "@/data/mock";

interface BookingPreviewDrawerProps {
  booking: Booking;
  onClose: () => void;
  onViewFull: () => void;
}

export function BookingPreviewDrawer({ booking, onClose, onViewFull }: BookingPreviewDrawerProps) {
  return (
    <Drawer
      open
      onClose={onClose}
      title={booking.program}
      width={512}
      footer={
        <button
          type="button"
          onClick={onViewFull}
          className="h-10 px-4 text-sm font-semibold text-invert-default bg-primary-default rounded-lg hover:bg-primary-hovered transition-colors"
        >
          View Booking Details
        </button>
      }
    >
      <BookingSummaryCards booking={booking} variant="drawer" />
    </Drawer>
  );
}
