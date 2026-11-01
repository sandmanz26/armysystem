import type { Booking } from "@/data/mock";
import { extractTime } from "../utils";

interface CalendarEventCardProps {
  booking: Booking;
}

export function CalendarEventCard({ booking }: CalendarEventCardProps) {
  const time = extractTime(booking.bookingTime);
  return (
    <div className="border-l-2 border-brand-primary bg-red-50 rounded px-1.5 py-1 mb-1 cursor-pointer hover:bg-red-100 transition-colors">
      {time && (
        <div className="text-[10px] text-gray-400 leading-tight font-medium">{time}</div>
      )}
      <div className="text-[11px] text-gray-700 font-semibold leading-tight truncate mt-0.5">
        {booking.unitName}
      </div>
      <div className="text-[10px] text-gray-400 truncate">{booking.bookingId}</div>
    </div>
  );
}
