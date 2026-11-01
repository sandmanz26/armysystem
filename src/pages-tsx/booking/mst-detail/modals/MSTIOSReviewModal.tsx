import { X } from "lucide-react";
import { Button } from "@/components/button";

interface MSTIOSReviewModalProps {
  onCancel:  () => void;
  onConfirm: () => void;
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 flex-shrink-0 w-44">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function MSTIOSReviewModal({ onCancel, onConfirm }: MSTIOSReviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f4f4b"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-800">Review Your Booking Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Please verify the information below before confirming your booking.
            </p>
          </div>
          <Button
            onClick={onCancel}
            className="p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent flex-shrink-0"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Total Trainee */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Total Trainee</span>
            <span className="text-sm font-bold text-gray-800">25 Trainees</span>
          </div>

          {/* Booking info card */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <Row label="Booking Type"    value="Entire Cabin" />
            <Row label="Cabin"           value="5 Cabins" />
            <Row label="Vehicle Type"    value="ICV (TERREX)" />
            <Row label="Weapon Variant"  value="40AGL (2), 50HMG (2)" />
            <Row label="Role"            value="All Roles" />
          </div>

          {/* Unit info */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <Row label="Instructor"           value="Allen Ritchson" />
            <Row
              label="Unit Contact Details"
              value={
                <span>
                  +1 232 232 2323<br />
                  <span className="font-normal text-gray-600">contact@example.com</span>
                </span>
              }
            />
          </div>

          {/* Schedule info */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <Row label="Training Schedule" value="PM Session" />
            <Row label="Training Date"     value="6-10 January 2025" />
            <Row label="Training Time"     value="12:00 PM - 05:00 PM" />
            <Row label="Briefing Room"     value="Briefing Room A" />
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 leading-relaxed">
            Ensure you arrive 15 minutes before the scheduled time. You must bring your
            identity card and any required equipment.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <Button
            type="outline"
            onClick={onCancel}
            className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="py-3 text-sm font-semibold w-full bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
