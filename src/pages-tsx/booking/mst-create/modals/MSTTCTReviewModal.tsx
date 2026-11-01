import { FileText } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import type { MSTTCTBookingDetailsValues } from "../components/MSTTCTBookingDetailsStep";

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right ml-4 max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

function SectionLabel({ label, color = "red" }: { label: string; color?: "red" | "blue" }) {
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${
      color === "red"
        ? "bg-red-50 text-brand-primary"
        : "bg-blue-50 text-blue-600"
    }`}>
      {label}
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 my-1" />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MSTTCTReviewModalProps {
  totalTrainees:   number;
  bookingDetails?: MSTTCTBookingDetailsValues | null;
  onCancel:        () => void;
  onConfirm:       () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MSTTCTReviewModal({
  totalTrainees,
  bookingDetails,
  onCancel,
  onConfirm,
}: MSTTCTReviewModalProps) {
  // ── Derive display strings from booking details ───────────────────────────

  const mstWeapons = bookingDetails?.mstWeaponVariants
    .filter(v => v.selected)
    .map(v => `${v.label} (${v.qty})`)
    .join(", ") || "—";

  const tctVehicleType = bookingDetails?.tctVehicleTypes.length
    ? bookingDetails.tctVehicleTypes[0]
    : "—";

  const tctVehicleVariants = bookingDetails?.tctVehicleVariants
    .filter(v => v.selected)
    .map(v => v.label)
    .join(", ") || "—";

  const scheduleDisplay = bookingDetails?.scheduleType || "—";

  const briefingRooms = bookingDetails?.briefingRooms?.length
    ? bookingDetails.briefingRooms.join(", ")
    : "—";

  const trainingDate = bookingDetails?.selectedDate
    ? bookingDetails.selectedDate.toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <Modal open={true} onClose={onCancel} width={560} isUseX={false}>

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Review Your Booking Details</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Please verify the information below before confirming your booking.
          </p>
        </div>
      </div>

      {/* Total Trainees */}
      <div className="flex items-center justify-between py-2.5 border-b border-gray-200 mb-1">
        <span className="text-sm text-gray-600">Total Trainee</span>
        <span className="text-sm font-bold text-gray-800">{totalTrainees} Trainees</span>
      </div>

      <SectionDivider />

      {/* ── MST Section ──────────────────────────────────────────── */}
      <div className="py-1">
        <SectionLabel label="MST" color="red" />
        <DetailRow label="Booking Type"    value={bookingDetails?.mstBookingType || "—"} />
        <DetailRow label="Cabin"           value={`${bookingDetails?.mstCabinAmount ?? "—"} Cabins`} />
        <DetailRow label="Vehicle Type"    value={bookingDetails?.mstVehicleType || "—"} />
        <DetailRow label="Vehicle Variant" value={mstWeapons} />
        <DetailRow label="Role"            value="All Roles" />
      </div>

      <SectionDivider />

      {/* ── TCT Section ──────────────────────────────────────────── */}
      <div className="py-1">
        <SectionLabel label="TCT" color="blue" />
        <DetailRow label="Clusters"        value={`${bookingDetails?.tctClusterAmount ?? "—"} Clusters`} />
        <DetailRow label="Vehicle Type"    value={tctVehicleType} />
        <DetailRow label="Vehicle Variant" value={tctVehicleVariants} />
        <DetailRow label="Role"            value="All Roles" />
      </div>

      <SectionDivider />

      {/* ── Shared / Unit Section ─────────────────────────────────── */}
      <div className="py-1">
        <DetailRow label="Instructor" value={bookingDetails?.instructor || "—"} />
        <div className="flex items-start justify-between py-2.5 border-b border-gray-100">
          <span className="text-sm text-gray-500 flex-shrink-0">Unit Contact Details</span>
          <span className="text-sm font-semibold text-gray-800 text-right ml-4 max-w-[60%] whitespace-pre-line">
            {bookingDetails?.unitContactDetails || "—"}
          </span>
        </div>
      </div>

      <SectionDivider />

      {/* ── Schedule Section ─────────────────────────────────────── */}
      <div className="py-1">
        <DetailRow label="Training Schedule" value={scheduleDisplay} />
        <DetailRow label="Briefing Room"     value={briefingRooms} />
        <DetailRow label="Training Date"     value={trainingDate} />
      </div>

      <SectionDivider />

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-2 mb-5 leading-relaxed">
        Ensure you arrive 15 minutes before the scheduled time. You must bring your
        identity card and any required equipment.
      </p>

      {/* Actions */}
      <div className="-mx-6 -mb-6 px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
        <Button
          type="outline"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 justify-center"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
        >
          Confirm
        </Button>
      </div>

    </Modal>
  );
}
