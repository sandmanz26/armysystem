import { useState } from "react";
import { MoreVertical } from "lucide-react";

interface BookingRowMenuProps {
  onView: () => void;
}

export function BookingRowMenu({ onView }: BookingRowMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="More actions"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button
              onClick={() => { setOpen(false); onView(); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Booking
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}
