import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/button";
import { AttendanceStep } from "./AttendanceStep";
import { OnboardingLaneConfig } from "./OnboardingLaneConfig";
import { DetailListStep } from "./DetailListStep";
import { DataUploadStep } from "./DataUploadStep";
import { LiveTrainingDashboard } from "./LiveTrainingDashboard";
import { SessionReadyModal } from "../modals/ReviewSummaryModal";
import { useBookingStore } from "../store/useBookingStore";
function OnboardingTopBar({ onBack }) {
    const booking = useBookingStore((s) => s.booking);
    return (<div className="h-14 border-b border-gray-200 flex items-center px-4 md:px-6 bg-white flex-shrink-0 relative">
      <Button onClick={onBack} className="w-8 h-8 p-0 flex items-center justify-center bg-transparent text-gray-600 hover:bg-gray-100 w-auto z-10">
        <ArrowLeft size={18}/>
      </Button>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-semibold text-gray-800">{booking?.title}</span>
      </div>

      <div className="ml-auto flex items-center gap-4 text-sm text-gray-500 z-10">
        <span className="hidden md:block">Thursday, 05 December 2024&nbsp;&nbsp;01:03:33 PM</span>
        <Button className="relative w-8 h-8 p-0 flex items-center justify-center bg-transparent hover:bg-gray-100 w-auto rounded-full">
          <Bell size={16} className="text-gray-500"/>
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"/>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold">DH</div>
          </div>
          <div className="leading-tight hidden md:block">
            <div className="text-xs font-medium text-gray-800">Daniel Huston</div>
            <div className="text-[10px] text-gray-400">olivia@untitledui.com</div>
          </div>
        </div>
      </div>
    </div>);
}
export function OnboardingFlow({ onClose }) {
    const [step, setStep] = useState(0);
    const [showSessionReady, setShowSessionReady] = useState(false);
    const booking = useBookingStore((s) => s.booking);
    return (<div className="fixed inset-0 bg-white z-40 flex flex-col">
      <OnboardingTopBar onBack={step === 0 ? onClose : () => setStep((s) => s - 1)}/>

      {step === 0 && <AttendanceStep onNext={() => setStep(1)}/>}
      {step === 1 && (booking?.isIntegrated ? (<DataUploadStep onBack={() => setStep(0)} onConfirm={() => setStep(2)}/>) : (<OnboardingLaneConfig onBack={() => setStep(0)} onConfirm={() => setStep(2)}/>))}
      {step === 2 && (<DetailListStep onBack={() => setStep(1)} onConfirm={() => setShowSessionReady(true)}/>)}
      {step === 3 && <LiveTrainingDashboard />}

      {showSessionReady && (<SessionReadyModal onStart={() => { setShowSessionReady(false); setStep(3); }}/>)}
    </div>);
}
