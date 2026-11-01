import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/button";
import { AttendanceStep } from "./AttendanceStep";
import { OnboardingLaneConfig } from "./OnboardingLaneConfig";
import { DetailListStep } from "./DetailListStep";
import { DataUploadStep } from "./DataUploadStep";
import { LiveTrainingDashboard } from "./LiveTrainingDashboard";
import { SessionReadyModal } from "../modals/ReviewSummaryModal";
import { useBookingStore } from "../store/useBookingStore";

function OnboardingTopBar({ onBack }: { onBack: () => void }) {
  const booking = useBookingStore((s) => s.booking);

  return (
    <div className="h-14 border-b border-gray-200 relative flex items-center px-4 md:px-6 bg-white flex-shrink-0">
      <Button
        onClick={onBack}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 p-0 flex items-center justify-center bg-transparent text-gray-600 hover:bg-gray-100 w-auto z-10"
      >
        <ArrowLeft size={18} />
      </Button>

      <div className="flex-1 min-w-0 truncate text-center px-64 text-sm font-semibold text-gray-800">
        {booking?.title}
      </div>

      <span className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
        Thursday, 05 December 2024&nbsp;&nbsp;01:03:33 PM
      </span>
    </div>
  );
}

export function OnboardingFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [showSessionReady, setShowSessionReady] = useState(false);
  const booking = useBookingStore((s) => s.booking);

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <OnboardingTopBar onBack={step === 0 ? onClose : () => setStep((s) => s - 1)} />

      {step === 0 && <AttendanceStep onNext={() => setStep(1)} />}
      {step === 1 && (
        booking?.isIntegrated ? (
          <DataUploadStep onBack={() => setStep(0)} onConfirm={() => setStep(2)} />
        ) : (
          <OnboardingLaneConfig
            onBack={() => setStep(0)}
            onConfirm={() => setStep(2)}
            cShapedStationLabels={booking?.cShapedStations.map((s) => s.label)}
          />
        )
      )}
      {step === 2 && (
        <DetailListStep onBack={() => setStep(1)} onConfirm={() => setShowSessionReady(true)} />
      )}
      {step === 3 && <LiveTrainingDashboard />}

      {showSessionReady && (
        <SessionReadyModal onStart={() => { setShowSessionReady(false); setStep(3); }} />
      )}
    </div>
  );
}
