import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/button";
import { MSTTCTOnboardingCabinConfig } from "./MSTTCTOnboardingCabinConfig";
import { MSTAttendanceStep } from "./MSTAttendanceStep";
import { MSTTCTConfirmDetailList } from "./MSTTCTConfirmDetailList";
import { MSTTCTLiveTrainingDashboard } from "./MSTTCTLiveTrainingDashboard";
import { useBookingStore } from "../store/useBookingStore";

// ── IOS Top Bar ───────────────────────────────────────────────────────────────
// Kept minimal — Back + centered title + time — to match the create-booking
// TopBar pattern instead of carrying its own IOS badge/location/bell/user chrome.

function MSTTCTIOSTopBar({ onClose }: { onClose: () => void }) {
  const booking = useBookingStore((s) => s.booking);

  return (
    <div className="h-14 border-b border-gray-200 relative flex items-center px-6 bg-white flex-shrink-0">
      <Button
        onClick={onClose}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center bg-transparent text-gray-600 hover:bg-gray-100 w-auto z-10"
      >
        <ArrowLeft size={18} />
      </Button>

      <div className="flex-1 min-w-0 truncate text-center px-44 text-sm font-semibold text-gray-800">
        {booking?.title ?? "MST TCT Training for Unit 19"}
      </div>

      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
        Thursday, 05 December 2024&nbsp;&nbsp;01:03:33 PM
      </span>
    </div>
  );
}

// ── MST+TCT Onboarding Flow ───────────────────────────────────────────────────
//
//  Step 0 → Confirm Attendance       (MSTAttendanceStep)
//  Step 1 → Cabin / Cluster Config   (MSTTCTOnboardingCabinConfig)
//  Step 2 → Confirm Detail List      (MSTTCTConfirmDetailList)
//             → Review Modal → Start Session overlay → step 3
//  Step 3 → Live Training Dashboard  (MSTTCTLiveTrainingDashboard)
//             → ← in IOS top bar calls onClose
//

/** `only="TCT"` = a standalone TCT booking: the same flow, cluster half only, no MST/TCT switch. */
export function MSTTCTOnboardingFlow({ onClose, only }: { onClose: () => void; only?: "MST" | "TCT" }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <MSTTCTIOSTopBar onClose={onClose} />

      {/* Step 0: Confirm Attendance */}
      {step === 0 && (
        <MSTAttendanceStep
          onConfirm={() => setStep(1)}
        />
      )}

      {/* Step 1: Cabin / Cluster Configuration */}
      {step === 1 && (
        <MSTTCTOnboardingCabinConfig
          onBack={() => setStep(0)}
          onConfirm={() => setStep(2)}
          only={only}
        />
      )}

      {/* Step 2: Confirm Detail List → Review → Start Session */}
      {step === 2 && (
        <MSTTCTConfirmDetailList
          onBack={() => setStep(1)}
          onConfirm={() => setStep(3)}
          only={only}
        />
      )}

      {/* Step 3: Live Training Dashboard */}
      {step === 3 && (
        <MSTTCTLiveTrainingDashboard only={only} />
      )}
    </div>
  );
}
