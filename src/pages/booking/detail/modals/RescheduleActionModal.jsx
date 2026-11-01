import { CalendarClock } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";

export function RescheduleActionModal({ open, onClose, booking, onConfirm }) {
  const bookingStatus = booking?.status || "Upcoming";
  const bookingTitle = booking?.title || "TRX Group Training for Unit n";
  const bookingId = booking?.id || "#260604-PTC005";
  const bookingDate = booking?.date || "29 Jun 2026";
  const bookingTime = booking?.time || "(29 Jun) 6:00 PM - (30 Jun) 3:00 AM (Ad-Hoc Schedule)";

  return (
    <Modal open={open} onClose={onClose} width={620} isUseX={false}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <CalendarClock size={20} className="text-brand-primary" />
        </div>
        <h3 className="text-2xl leading-8 font-bold text-gray-800">
          Please confirm that you would like to reschedule this below training session?
        </h3>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-2sm font-bold text-gray-800">{bookingTitle}</p>
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1">
            {bookingStatus}
          </span>
        </div>
        <p className="text-2sm font-semibold text-gray-700">Booking ID - {bookingId}</p>
        <p className="text-2sm font-semibold text-gray-700 mt-1">{bookingDate}</p>
        <p className="text-sm leading-6 text-gray-500 mt-1">{bookingTime}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" onClick={onClose} className="w-full justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm} className="w-full justify-center bg-brand-primary text-white hover:bg-brand-primary-hover">
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
