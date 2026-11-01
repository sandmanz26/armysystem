import { useState } from "react";
import { ArrowLeft, ArrowRight, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BookingDetailsStep } from "../create/components/BookingDetailsStep";
import { LaneConfigStep } from "../create/components/LaneConfigStep";
import { NominalRollStep } from "../create/components/NominalRollStep";
import { ScheduleStep } from "../create/components/ScheduleStep";
import { MSTCreateWizard } from "./components/MSTCreateWizard";
import { MSTCabinConfigStep, MSTTCT_INITIAL_CABINS } from "./components/MSTCabinConfigStep";
import { saveTCTLocalBooking } from "@/data/localBookings";
import type { ClusterRow } from "./components/MSTTCTClusterConfigStep";
import { MSTTCTBookingDetailsStep } from "./components/MSTTCTBookingDetailsStep";
import { MSTTCTClusterConfigStep } from "./components/MSTTCTClusterConfigStep";
import { MSTTCTNominalRollStep } from "./components/MSTTCTNominalRollStep";
import { TCTBookingDetailsStep } from "./components/TCTBookingDetailsStep";
import { ReviewModal } from "../create/modals/ReviewModal";
import { PROGRAMS, PROGRAMS_BY_SESSION, STEPS, TCT_STEPS, MSTTCT_STEPS, NOMINAL_ROLL_DATA } from "./constants";
import type { SessionType, ProgramType, BookingDetailsSnapshot, ScheduleSnapshot } from "./types";
import type { MSTTCTBookingDetailsValues } from "./components/MSTTCTBookingDetailsStep";
import type { TCTBookingDetailsValues } from "./components/TCTBookingDetailsStep";

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ current, steps = STEPS }: { current: number; steps?: string[] }) {
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
              Book Your {programLabel} Training Program
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

// ── Session type tab config ───────────────────────────────────────────────────
const SESSION_TABS: { type: SessionType; label: string; desc: string }[] = [
  { type: "Standalone",    label: "Standalone",     desc: "Individual program booking" },
  { type: "SimIntegrated", label: "Sim Integrated", desc: "MST or TCT simulation integrated" },
  { type: "Integrated",    label: "Integrated",     desc: "Combined multi-program booking" },
];

// ── Program Selection ─────────────────────────────────────────────────────────
function ProgramSelection({ sessionType, setSessionType, onSelect }: {
  sessionType: SessionType;
  setSessionType: (t: SessionType) => void;
  onSelect: (p: ProgramType) => void;
}) {
  const [hovered, setHovered] = useState<ProgramType>(null);

  // Filter programs based on current session type
  const allowedIds = PROGRAMS_BY_SESSION[sessionType] ?? [];
  const visiblePrograms = PROGRAMS.filter(p => allowedIds.includes(p.id));

  // Grid columns: 2 cards → 2 cols, 3 → 3, 4 → 4
  const gridCols = visiblePrograms.length === 2
    ? "lg:grid-cols-2"
    : visiblePrograms.length === 3
    ? "lg:grid-cols-3"
    : "lg:grid-cols-4";

  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex flex-col items-center py-10 px-6">
      <h1 className="text-xl font-semibold text-brand-primary mb-2">Create New Booking</h1>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-xl">
        Choose your desired Training program to proceed. Click on a card below to explore its details and continue the setup process.
      </p>

      {/* ── Session type tabs ─────────────────────────────── */}
      <div className="flex rounded-full overflow-hidden border border-gray-200 bg-white mb-10 shadow-sm">
        {SESSION_TABS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => { setSessionType(type); setHovered(null); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-colors",
              sessionType === type ? "bg-brand-primary text-white" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Users size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Program cards ─────────────────────────────────── */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl", gridCols)}>
        {visiblePrograms.map((prog) => {
          const isHovered = hovered === prog.id;
          return (
            <div
              key={prog.id}
              className={cn(
                "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 h-[480px]",
                isHovered ? "ring-4 ring-brand-primary shadow-xl" : "shadow-md"
              )}
              onMouseEnter={() => setHovered(prog.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(prog.id)}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-b", prog.bg, isHovered && "opacity-70")} />
              {isHovered && <div className="absolute inset-0 bg-brand-primary/30" />}
              <div className={cn(
                "absolute left-0 right-0 px-6 transition-all duration-200",
                isHovered ? "bottom-20" : "bottom-6"
              )}>
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

// ── MST+TCT Booking Form (4-step: Booking Details → Cabin Config → Cluster Config → Nominal Roll) ──
function MSTTCTBookingForm({ sessionType: _sessionType, onBack, onComplete }: { sessionType: SessionType; onBack: () => void; onComplete?: () => void }) {
  const [step,           setStep]           = useState(0);
  const [bookingDetails, setBookingDetails] = useState<MSTTCTBookingDetailsValues | null>(null);

  const handleNext = () => {
    if (step === 0) {
      const btn = document.getElementById("msttct-details-next-trigger");
      if (btn) btn.click();
      return;
    }
    if (step < MSTTCT_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // step 3 (Nominal Roll) — open review modal via hidden trigger
    const btn = document.getElementById("msttct-nominal-next-trigger");
    if (btn) btn.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Stepper bar */}
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
          <div />
        )}

        <Stepper current={step} steps={MSTTCT_STEPS} />

        <Button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          Next <ArrowRight size={14} />
        </Button>
      </div>

      {/* Step content */}
      {step === 0 && (
        <MSTTCTBookingDetailsStep
          onNext={(vals) => { setBookingDetails(vals); setStep(1); }}
        />
      )}
      {step === 1 && (
        <MSTCabinConfigStep
          bookingDetails={null}
          initialCabins={MSTTCT_INITIAL_CABINS}
          showCallSign={false}
          weaponVariantOptions={
            bookingDetails
              ? bookingDetails.mstWeaponVariants
                  .filter(v => v.selected)
                  .map(v => `${v.label} (${v.qty})`)
              : undefined
          }
        />
      )}
      {step === 2 && <MSTTCTClusterConfigStep bookingDetails={bookingDetails} />}
      {step === 3 && <MSTTCTNominalRollStep bookingDetails={bookingDetails} onNext={onComplete ?? onBack} />}
    </div>
  );
}

// ── TCT Booking Form (3-step: Booking Details → Cluster Configuration → Nominal Roll) ──
function TCTBookingForm({ sessionType: _sessionType, onBack, onComplete }: { sessionType: SessionType; onBack: () => void; onComplete?: () => void }) {
  const [step,           setStep]           = useState(0);
  const [bookingDetails, setBookingDetails] = useState<TCTBookingDetailsValues | null>(null);
  const [clusters,       setClusters]       = useState<ClusterRow[]>([]);
  const [traineesCount,  setTraineesCount]  = useState(0);

  // The cluster step reads MST+TCT-shaped values; map the TCT form onto them.
  const clusterStepDetails = bookingDetails ? {
    tctClusterAmount:   bookingDetails.clusterAmount,
    tctVehicleVariants: bookingDetails.platformVariants.filter(v => v.selected).map(v => ({ id: v.id, label: v.label, qty: v.qty, selected: true })),
    tctWeaponVariants:  [],
  } : null;

  /** Save to localStorage then close the form — the TCT Booking List and Detail read it back */
  const handleComplete = () => {
    if (bookingDetails) saveTCTLocalBooking(bookingDetails, clusters, traineesCount);
    (onComplete ?? onBack)();
  };

  const handleNext = () => {
    if (step === 0) {
      const btn = document.getElementById("tct-details-next-trigger");
      if (btn) btn.click();
      return;
    }
    if (step < TCT_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // step 2 (Nominal Roll) — open review modal via hidden trigger
    const btn = document.getElementById("msttct-nominal-next-trigger");
    if (btn) btn.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Stepper bar */}
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
          <div />
        )}

        <Stepper current={step} steps={TCT_STEPS} />

        <Button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          Next <ArrowRight size={14} />
        </Button>
      </div>

      {/* Step content */}
      {step === 0 && (
        <TCTBookingDetailsStep
          onNext={(vals) => { setBookingDetails(vals); setStep(1); }}
        />
      )}
      {step === 1 && <MSTTCTClusterConfigStep bookingDetails={clusterStepDetails as any} onClustersChange={setClusters} />}
      {step === 2 && (
        <MSTTCTNominalRollStep
          bookingDetails={bookingDetails as any}
          onNext={handleComplete}
          onTraineeCountChange={setTraineesCount}
        />
      )}
    </div>
  );
}

// ── WPT / General Booking Form (4-step) ───────────────────────────────────────
function BookingForm({ sessionType, onBack }: { sessionType: SessionType; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [trainingMode, setTrainingMode] = useState("");
  const [detailsSnapshot, setDetailsSnapshot] = useState<BookingDetailsSnapshot>({
    weapons: [], weaponSummary: "", baseQty: "2", cShapedQty: "0", courseware: "", trainingType: "", roles: [],
  });
  const [scheduleSnapshot, setScheduleSnapshot] = useState<ScheduleSnapshot>({
    scheduleType: null, section: null, briefing: false, selectedDate: null,
  });

  const handleNext = () => {
    if (step === 2) {
      const btn = document.getElementById("nominal-next-trigger");
      if (btn) btn.click();
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Button
          type="outline"
          onClick={step === 0 ? onBack : () => setStep(step - 1)}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 w-auto border border-gray-300"
        >
          <ArrowLeft size={14} /> Back
        </Button>
        <Stepper current={step} />
        <div className="flex items-center gap-2">
          {(step === 1 || step === 2) && (
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

      {step === 0 && (
        <BookingDetailsStep
          trainingMode={trainingMode}
          onModeChange={setTrainingMode}
          onUpdate={setDetailsSnapshot}
        />
      )}
      {step === 1 && (
        <LaneConfigStep
          trainingMode={trainingMode}
          bookingWeapons={detailsSnapshot.weapons}
          bookingRoles={detailsSnapshot.roles}
          numBase={parseInt(detailsSnapshot.baseQty) || 1}
          numCShaped={parseInt(detailsSnapshot.cShapedQty) || 0}
          bookingCourseware={detailsSnapshot.courseware}
        />
      )}
      {step === 2 && <NominalRollStep onNext={() => setStep(3)} />}
      {step === 3 && <ScheduleStep onUpdate={(s) => setScheduleSnapshot(s as any)} />}

      {showReviewModal && (
        <ReviewModal
          sessionType={sessionType as any}
          trainingMode={trainingMode}
          detailsSnapshot={detailsSnapshot as any}
          scheduleSnapshot={scheduleSnapshot as any}
          totalTrainees={NOMINAL_ROLL_DATA.length}
          onCancel={() => setShowReviewModal(false)}
          onConfirm={() => { setShowReviewModal(false); onBack(); }}
        />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CreateBooking({ onClose, defaultProgram }: { onClose: () => void; defaultProgram?: ProgramType }) {
  const [sessionType, setSessionType] = useState<SessionType>("Standalone");
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>(defaultProgram ?? null);

  const handleBack = selectedProgram
    ? (defaultProgram ? onClose : () => setSelectedProgram(null))
    : onClose;

  // MST has its own Figma header + 4-step wizard (MSTCreateWizard) — no TopBar.
  if (selectedProgram === "MST") {
    return <MSTCreateWizard onExit={handleBack} onComplete={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <TopBar
        onBack={handleBack}
        programLabel={selectedProgram ?? undefined}
        sessionType={selectedProgram ? sessionType : undefined}
      />
      {!selectedProgram ? (
        <ProgramSelection
          sessionType={sessionType}
          setSessionType={setSessionType}
          onSelect={setSelectedProgram}
        />
      ) : selectedProgram === "TCT" ? (
        <TCTBookingForm
          sessionType={sessionType}
          onBack={() => setSelectedProgram(null)}
          onComplete={onClose}
        />
      ) : selectedProgram === "MST+TCT" ? (
        <MSTTCTBookingForm
          sessionType={sessionType}
          onBack={() => setSelectedProgram(null)}
          onComplete={onClose}
        />
      ) : (
        <BookingForm
          sessionType={sessionType}
          onBack={() => setSelectedProgram(null)}
        />
      )}
    </div>
  );
}
