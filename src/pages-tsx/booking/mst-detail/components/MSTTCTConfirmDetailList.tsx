import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import { MSTTCTReviewModal } from "../../mst-create/modals/MSTTCTReviewModal";
import type { MSTTCTBookingDetailsValues } from "../../mst-create/components/MSTTCTBookingDetailsStep";
import { cn } from "@/lib/utils";

// ── Mock booking details for review modal ─────────────────────────────────────

const MOCK_BOOKING_DETAILS: MSTTCTBookingDetailsValues = {
  mstBookingType:    "Regular Booking",
  mstCabinAmount:    5,
  mstVehicleType:    "ICV (TERREX)",
  mstWeaponVariants: [
    { id: "40AGL", label: "40AGL", selected: true,  qty: 5 },
    { id: "50HMG", label: "50HMG", selected: false, qty: 1 },
  ],
  mstUseForMainIOS: false,
  tctClusterAmount:   16,
  tctVehicleTypes:    ["ICV (TERREX)"],
  tctVehicleVariants: [
    { id: "TERREX_CMD", label: "TERREX (COMMANDER)", selected: true, qty: 16 },
  ],
  tctWeaponVariants: [
    { id: "40AGL", label: "40AGL", selected: true, qty: 16 },
  ],
  tctUseForMainIOS:   false,
  unitName:           "Unit 19",
  instructor:         "CPT John Doe",
  unitContactDetails: "+1 9123 4567\nunit19@naf.mil.example",
  scheduleType:       "AM/PM",
  scheduleSection:    "PM",
  briefingRooms:      ["Briefing Room A"],
  selectedDate:       new Date(2025, 0, 6),
};

// ── Mock detail card data ─────────────────────────────────────────────────────

interface MstDetailCard {
  detailNumber:  number;
  cabin:         string;
  trainees:      number;
  weaponVariant: string;
  roles:         number;
}

interface TctDetailCard {
  detailNumber:   number;
  cluster:        string;
  trainees:       number;
  vehicleVariant: string;
  roles:          number;
}

const MST_DETAILS: MstDetailCard[] = Array.from({ length: 5 }, (_, i) => ({
  detailNumber:  i + 1,
  cabin:         `MST_CABIN_0${i + 1}`,
  trainees:      5,
  weaponVariant: "40AGL",
  roles:         5,
}));

const TCT_DETAILS: TctDetailCard[] = Array.from({ length: 16 }, (_, i) => ({
  detailNumber:   i + 1,
  cluster:        `TCT_CLUSTER_${String(i + 1).padStart(2, "0")}`,
  trainees:       5,
  vehicleVariant: "40AGL",
  roles:          5,
}));

// ── Sub-components ────────────────────────────────────────────────────────────

function MstCard({ card }: { card: MstDetailCard }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Detail {card.detailNumber}</span>
        <span className="text-xs text-gray-400">Pending</span>
      </div>
      {/* Body: 2-column grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Cabin</div>
          <div className="text-xs font-bold text-gray-800">{card.cabin}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Trainees</div>
          <div className="text-xs font-bold text-gray-800">{card.trainees} Trainees</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Weapon Variant</div>
          <div className="text-xs font-bold text-gray-800">{card.weaponVariant}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Roles</div>
          <div className="text-xs font-bold text-gray-800">{card.roles} Roles</div>
        </div>
      </div>
      {/* View Detail List button */}
      <button
        type="button"
        className="w-full py-2.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors mt-auto"
      >
        View Detail List
      </button>
    </div>
  );
}

function TctCard({ card }: { card: TctDetailCard }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Detail {card.detailNumber}</span>
        <span className="text-xs text-gray-400">Pending</span>
      </div>
      {/* Body: 2-column grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Cluster</div>
          <div className="text-xs font-bold text-gray-800">{card.cluster}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Trainees</div>
          <div className="text-xs font-bold text-gray-800">{card.trainees} Trainees</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Vehicle Variant</div>
          <div className="text-xs font-bold text-gray-800">{card.vehicleVariant}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Roles</div>
          <div className="text-xs font-bold text-gray-800">{card.roles} Roles</div>
        </div>
      </div>
      {/* View Detail List button */}
      <button
        type="button"
        className="w-full py-2.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors mt-auto"
      >
        View Detail List
      </button>
    </div>
  );
}

// ── Start Session overlay ─────────────────────────────────────────────────────

function StartSessionOverlay({ onStart }: { onStart: () => void }) {
  return (
    <Modal open={true} onClose={() => {}} width={360} isUseX={false}>
      <div className="flex flex-col items-center text-center py-4">
        <CheckCircle2 size={60} className="text-green-500 mb-5" />
        <p className="text-sm font-semibold text-gray-800 mb-6 leading-relaxed px-2">
          All cabin are operational and the session is about to begin!
        </p>
        <Button
          onClick={onStart}
          className="w-full py-3 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
        >
          Start session
        </Button>
      </div>
    </Modal>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MSTTCTConfirmDetailList({
  onBack,
  onConfirm,
  only,
}: {
  onBack:    () => void;
  onConfirm: () => void;
  /** Show just one programme's half and hide the MST/TCT switch (standalone TCT booking). */
  only?:     "MST" | "TCT";
}) {
  const [activeTab,        setActiveTab]        = useState<"MST" | "TCT">(only ?? "MST");
  const [showReview,       setShowReview]       = useState(false);
  const [showStartSession, setShowStartSession] = useState(false);

  const totalDetails = activeTab === "MST" ? MST_DETAILS.length : TCT_DETAILS.length;
  const sectionLabel = activeTab === "MST" ? "MST_MIOS_01" : "TCT_MIOS_01";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Confirm Detail List</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the detail list for training.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={() => setShowReview(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Confirm detail list <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">

        {/* MST/TCT tabs */}
        <div className="flex gap-2 mb-5">
          {(only ? ([] as ("MST" | "TCT")[]) : (["MST", "TCT"] as ("MST" | "TCT")[])).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-semibold border transition-colors",
                activeTab === tab
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          {/* Details header + Edit button */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Details{" "}
              <span className="font-normal text-gray-400">({totalDetails} Details)</span>
            </h3>
            <Button
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover w-auto"
            >
              Edit detail list
            </Button>
          </div>

          {/* MIOS section label */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-600">
              {sectionLabel}{" "}
              <span className="font-normal text-gray-400">({totalDetails} Details)</span>
            </span>
          </div>

          {/* MST detail cards */}
          {activeTab === "MST" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MST_DETAILS.map(card => (
                <MstCard key={card.detailNumber} card={card} />
              ))}
            </div>
          )}

          {/* TCT detail cards */}
          {activeTab === "TCT" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TCT_DETAILS.map(card => (
                <TctCard key={card.detailNumber} card={card} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <MSTTCTReviewModal
          totalTrainees={30}
          bookingDetails={MOCK_BOOKING_DETAILS}
          onCancel={() => setShowReview(false)}
          onConfirm={() => {
            setShowReview(false);
            setShowStartSession(true);
          }}
        />
      )}

      {/* Start session overlay */}
      {showStartSession && (
        <StartSessionOverlay onStart={onConfirm} />
      )}

    </div>
  );
}
