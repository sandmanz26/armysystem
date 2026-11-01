import { FileText } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import type { TCTBookingDetailsValues } from "../components/TCTBookingDetailsStep";

// Review step of a standalone TCT booking. Reads TCT's own booking-details shape — the MST+TCT
// review modal expects a different one (mstWeaponVariants, tctVehicleTypes…) and crashed on it.

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right ml-4 max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

export function TCTReviewModal({
  totalTrainees,
  bookingDetails,
  onCancel,
  onConfirm,
}: {
  totalTrainees:  number;
  bookingDetails: TCTBookingDetailsValues | null | undefined;
  onCancel:       () => void;
  onConfirm:      () => void;
}) {
  const d = bookingDetails;
  const platforms = (d?.platformVariants ?? []).filter(v => v.selected).map(v => `${v.label} (${v.qty})`).join(", ");
  const date = d?.selectedDate ? new Date(d.selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <Modal open={true} onClose={onCancel} width={560} isUseX={false}>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Review Your Booking Details</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please verify the information below before confirming your booking.</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-2.5 border-b border-gray-200 mb-1">
        <span className="text-sm text-gray-600">Total Trainee</span>
        <span className="text-sm font-bold text-gray-800">{totalTrainees} Trainees</span>
      </div>

      <div className="py-1">
        <DetailRow label="Training Type"  value={d?.trainingType ?? "—"} />
        <DetailRow label="Clusters"       value={d ? `${d.clusterAmount} Clusters` : "—"} />
        <DetailRow label="Vehicle Type"   value={(d?.vehicleTypes ?? []).join(", ")} />
        <DetailRow label="Platform Type"  value={platforms} />
      </div>

      <div className="py-1 border-t border-gray-100">
        <DetailRow label="Instructor"           value={d?.instructor ?? ""} />
        <DetailRow label="Unit Contact Details" value={d?.unitContactDetails ?? ""} />
      </div>

      <div className="py-1 border-t border-gray-100">
        <DetailRow label="Training Schedule" value={d?.scheduleType ?? ""} />
        <DetailRow label="Briefing Room"     value={(d?.briefingRooms ?? []).join(", ")} />
        <DetailRow label="Training Date"     value={date} />
      </div>

      <p className="text-xs text-gray-400 mt-2 mb-5 leading-relaxed">
        Ensure you arrive 15 minutes before the scheduled time. You must bring your identity card and any required equipment.
      </p>

      <div className="-mx-6 -mb-6 px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
        <Button type="outline" onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 justify-center">Cancel</Button>
        <Button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">Confirm</Button>
      </div>
    </Modal>
  );
}
