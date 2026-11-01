import { useState } from "react";
import { ArrowLeft, ArrowRight, User, Users, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BookingDetailsStep } from "./components/BookingDetailsStep";
import { LaneConfigStep } from "./components/LaneConfigStep";
import { NominalRollStep } from "./components/NominalRollStep";
import { IndividualTraineeStep } from "./components/IndividualTraineeStep";
import { ScheduleStep } from "./components/ScheduleStep";
import { ReviewModal } from "./modals/ReviewModal";
import { PROGRAMS, NOMINAL_ROLL_DATA } from "./constants";
import type { SessionType, ProgramType, BookingDetailsSnapshot, ScheduleSnapshot } from "./types";

const GROUP_STEPS = ["Booking Details", "Lane Configuration", "Nominal Roll", "Schedule"];
const INDIVIDUAL_STEPS = ["Booking Details", "Trainee Information", "Schedule"];

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center">
      {steps.map((step, idx) => {
        const isActive = idx === current;
        const isDone = idx < current;
        return (
          <div key={step} className="flex items-center">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium",
              isActive || isDone ? "border-brand-primary border-dashed text-brand-primary" : "border-dashed border-gray-300 text-gray-400")}>
              <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                isActive ? "border-brand-primary" : isDone ? "border-brand-primary bg-brand-primary" : "border-gray-300")}>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
                {isDone && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              {step}
            </div>
            {idx < steps.length - 1 && (
              <div className="flex items-center gap-0.5 mx-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
                <div className="w-10 border-t-2 border-dashed border-brand-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onBack, programLabel, sessionType }: {
  onBack: () => void;
  programLabel?: string;
  sessionType?: SessionType;
}) {
  return (
    <div className="h-14 border-b border-gray-200 relative flex items-center px-6 bg-white flex-shrink-0">
      <Button
        type="outline"
        onClick={onBack}
        className="absolute left-6 top-1/2 -translate-y-1/2 h-8 aspect-square p-0 flex items-center justify-center rounded-md border-0 text-gray-600 hover:bg-gray-100 w-auto z-10"
      >
        <ArrowLeft size={18} />
      </Button>
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-36">
        {programLabel ? (
          <>
            <span className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-full">
              {programLabel} Training Program
            </span>
            {sessionType && (
              <span className="text-[10px] text-gray-400 mt-0.5 leading-none">{sessionType} Session</span>
            )}
          </>
        ) : (
          <span className="text-sm font-semibold text-gray-800">Create New Booking</span>
        )}
      </div>
      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
      </span>
    </div>
  );
}

// ── Program Selection ─────────────────────────────────────────────────────────
function ProgramSelection({ sessionType, setSessionType, onSelect }: {
  sessionType: SessionType;
  setSessionType: (t: SessionType) => void;
  onSelect: (p: ProgramType) => void;
}) {
  const [hovered, setHovered] = useState<ProgramType>(null);
  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex flex-col items-center py-10 px-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Select Training Program</h1>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-xl">
        Click on a card below to explore its details and continue the setup process.
      </p>
      <div className="flex rounded-full overflow-hidden border border-gray-200 bg-white mb-10 shadow-sm">
        {(["Standalone", "Integrated"] as SessionType[]).map((type) => (
          <button key={type} type="button" onClick={() => setSessionType(type)}
            className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-colors",
              sessionType === type ? "bg-brand-primary text-white" : "text-gray-600 hover:bg-gray-50")}>
            {type === "Standalone" ? <User size={15} /> : <Users size={15} />}{type}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {PROGRAMS.map((prog) => {
          const isHovered = hovered === prog.id;
          return (
            <div key={prog.id}
              className={cn("relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 h-[480px]",
                isHovered ? "ring-4 ring-brand-primary shadow-xl" : "shadow-md")}
              onMouseEnter={() => setHovered(prog.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(prog.id)}>
              <div className={cn("absolute inset-0 bg-gradient-to-b", prog.bg, isHovered && "opacity-70")} />
              {isHovered && <div className="absolute inset-0 bg-brand-primary/30" />}
              <div className={cn("absolute left-0 right-0 px-6 transition-all duration-200", isHovered ? "bottom-20" : "bottom-6")}>
                <h3 className="text-white font-semibold text-lg leading-snug mb-1">{prog.title}</h3>
                <p className="text-white/70 text-sm">{prog.desc}</p>
              </div>
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center shadow-lg">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Booking Form (step orchestrator) ──────────────────────────────────────────
function BookingForm({ sessionType, onConfirm }: { sessionType: SessionType; onConfirm: () => void }) {
  const [step, setStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [trainingMode, setTrainingMode] = useState("");
  const [detailsSnapshot, setDetailsSnapshot] = useState<BookingDetailsSnapshot>({
    weapons: [], weaponSummary: "", baseQty: "1", cShapedQty: "0", courseware: "", trainingType: "", roles: [], unitContact: "", instructor: "", ftmsId: "", unitName: "", stationCountsByCourseware: {},
  });
  const [scheduleSnapshot, setScheduleSnapshot] = useState<ScheduleSnapshot>({
    scheduleType: null, section: null, briefing: false, selectedDate: null,
  });

  const isIndividual = detailsSnapshot.trainingType === "Individual";
  const steps = isIndividual ? INDIVIDUAL_STEPS : GROUP_STEPS;
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps - 1;
  const canSkip = !isIndividual && step === 2;

  const handleNext = () => {
    if (!isIndividual && step === 2) {
      const btn = document.getElementById("nominal-next-trigger");
      if (btn) btn.click();
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const renderStep = () => {
    if (step === 0) return (
      <BookingDetailsStep trainingMode={trainingMode} onModeChange={setTrainingMode} onUpdate={setDetailsSnapshot} />
    );
    if (isIndividual) {
      if (step === 1) return <IndividualTraineeStep />;
      if (step === 2) return <ScheduleStep onUpdate={setScheduleSnapshot} isIndividual={true} />;
    } else {
      if (step === 1) return (
        <LaneConfigStep
          trainingMode={trainingMode}
          bookingWeapons={detailsSnapshot.weapons}
          bookingRoles={detailsSnapshot.roles}
          numBase={parseInt(detailsSnapshot.baseQty) || 1}
          numCShaped={parseInt(detailsSnapshot.cShapedQty) || 0}
          bookingCourseware={detailsSnapshot.courseware}
          stationCountsByCourseware={detailsSnapshot.stationCountsByCourseware}
        />
      );
      if (step === 2) return <NominalRollStep onNext={() => setStep(3)} bookingCourseware={detailsSnapshot.courseware} stationCountsByCourseware={detailsSnapshot.stationCountsByCourseware} trainingMode={trainingMode} />;
      if (step === 3) return <ScheduleStep onUpdate={setScheduleSnapshot} bookingCourseware={detailsSnapshot.courseware} />;
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        {step > 0 ? (
          <Button
            type="outline"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 w-auto border border-gray-300"
          >
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div className="w-[90px]" />
        )}
        <Stepper current={step} steps={steps} />
        <div className="flex items-center gap-2">
          {canSkip && (
            <Button
              type="outline"
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-300"
            >
              Skip Step
            </Button>
          )}
          {isLastStep ? (
            <Button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Confirm Booking
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Next <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>

      {renderStep()}

      {showReviewModal && (
        <ReviewModal
          sessionType={sessionType}
          trainingMode={trainingMode}
          detailsSnapshot={detailsSnapshot}
          scheduleSnapshot={scheduleSnapshot}
          totalTrainees={isIndividual ? 1 : NOMINAL_ROLL_DATA.length}
          onCancel={() => setShowReviewModal(false)}
          onConfirm={() => { setShowReviewModal(false); onConfirm(); }}
        />
      )}
    </div>
  );
}

// ── LeaveConfirmDialog ────────────────────────────────────────────────────────
function LeaveConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[420px] pointer-events-auto overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={18} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Leave this page?</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  You have unsaved booking data. If you go back now, all the information you've entered will be lost.
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-white transition-colors bg-white"
            >
              Continue Editing
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#115e59] rounded-lg hover:bg-[#0f4f4b] transition-colors"
            >
              Yes, Leave
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CreateBooking({ onClose }: { onClose: () => void }) {
  // Demo-only special case: when Navbar Structure = Super, Session Type and
  // Programme already live as separate entries in the main rail (Integrated,
  // WPT, MST, MST/TCT, etc.) — so asking for them again here would be
  // redundant. Skip straight to the booking wizard. Purely visual; nothing
  // downstream (steps, validation, submit) changes.
  const isSuperNav = typeof window !== "undefined" && localStorage.getItem("toms_structure") === "super";

  const [sessionType, setSessionType] = useState<SessionType>(isSuperNav ? "Integrated" : "Standalone");
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>(isSuperNav ? "WPT" : null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleBack = () => {
    if (selectedProgram) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  const handleLeaveConfirm = () => {
    setShowLeaveConfirm(false);
    setSelectedProgram(null);
  };

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <TopBar
        onBack={handleBack}
        programLabel={selectedProgram ?? undefined}
        sessionType={selectedProgram ? sessionType : undefined}
      />
      {!selectedProgram ? (
        <ProgramSelection sessionType={sessionType} setSessionType={setSessionType} onSelect={setSelectedProgram} />
      ) : (
        <BookingForm sessionType={sessionType} onConfirm={onClose} />
      )}
      {showLeaveConfirm && (
        <LeaveConfirmDialog
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
}
