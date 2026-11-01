import { Eye } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { StatusBadge } from "@/components/ui/StatusBadge";
export function BookingDetailModal({ booking, onClose, onNavigate }) {
    return (<Modal open={true} onClose={onClose} width={672} isUseX={false}>
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{booking.program}</h2>
          <p className="text-sm text-gray-500 mt-1">{booking.bookingId}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-1">Booking Time</p>
          <p className="text-sm font-semibold text-gray-800">{booking.time}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <StatusBadge status={booking.status} size="sm"/>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          Close
        </button>
        <button type="button" onClick={() => {
            onNavigate("/bookings/detail");
            onClose();
        }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary-hover">
          <Eye size={16}/> View Details
        </button>
      </div>
    </Modal>);
}
