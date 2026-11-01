import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/button";
import { MSTOnboardingCabinConfig } from "./MSTOnboardingCabinConfig";
import { MSTAttendanceStep } from "./MSTAttendanceStep";
import { MSTDetailListStep } from "./MSTDetailListStep";
import { MSTTCTLiveTrainingDashboard } from "./MSTTCTLiveTrainingDashboard";
import { useBookingStore } from "../store/useBookingStore";

// ── IOS Top Bar ───────────────────────────────────────────────────────────────
// Kept minimal — Back + centered title + time — to match the create-booking
// TopBar pattern instead of carrying its own IOS badge/location/bell/user chrome.

function MSTIOSTopBar({ onClose }: { onClose: () => void }) {
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
        {booking?.title ?? "MST Training for Unit 10"}
      </div>

      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
        Thursday, 05 December 2024&nbsp;&nbsp;01:03:33 PM
      </span>
    </div>
  );
}

// ── MST Onboarding Flow ───────────────────────────────────────────────────────
//
//  Step 0 → Confirm Attendance (empty state → upload → Final Nominal Roll)
//  Step 1 → Cabin Configuration
//  Step 2 → Confirm Detail List → Review Modal → session starts
//  Step 3 → Live Training Dashboard (the running session — same idea as WPT's Ongoing Session;
//           ← in the top bar calls onClose)
//
//  Order matches WPT's onboarding flow (Nominal Roll before Lane/Cabin Config).
//

export function MSTOnboardingFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <MSTIOSTopBar onClose={onClose} />

      {/* Step 0: Confirm Attendance → Final Nominal Roll */}
      {step === 0 && (
        <MSTAttendanceStep
          onConfirm={() => setStep(1)}
        />
      )}

      {/* Step 1: Cabin Configuration */}
      {step === 1 && (
        <MSTOnboardingCabinConfig
          onBack={() => setStep(0)}
          onConfirm={() => setStep(2)}
        />
      )}

      {/* Step 2: Confirm Detail List → Review Modal → done */}
      {step === 2 && (
        <MSTDetailListStep
          onBack={() => setStep(1)}
          onConfirm={() => setStep(3)}
        />
      )}

      {/* Step 3: the session itself — Cabin half only */}
      {step === 3 && <MSTTCTLiveTrainingDashboard only="MST" />}
    </div>
  );
}
