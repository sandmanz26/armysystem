// Booking 2.0 — Create Booking wizard.
//
// All 4 Group steps (BookingDetailsStep, ScheduleStep, LaneConfigStep,
// NominalRollStep) are new files local to booking-2, since their designs
// differ from the old ones (see those files). IndividualTraineeStep is still
// reused read-only from booking/create, unmodified — no screenshot has asked
// for a new Individual-flow design yet.
// The step ORDER for Group bookings is: Booking Details → Schedule → Lane
// Configuration → Nominal Roll (was Booking Details → Lane Configuration →
// Nominal Roll → Schedule). Individual's order is left as-is (no screenshot
// asked for a reorder there). This realizes the "WPT Create Booking Flow 2.0"
// draft already sketched in docs/PRD-WPT-Booking.md Sec. 14 — not yet synced
// back into that doc since this build is still discussion-stage per the user.
import { useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { NominalRollStep } from "./components/NominalRollStep";
import { IndividualTraineeStep } from "@/pages-tsx/booking/create/components/IndividualTraineeStep";
import { ReviewModal } from "@/pages-tsx/booking/create/modals/ReviewModal";
import type { ScheduleSnapshot } from "@/pages-tsx/booking/create/types";
import type { Booking2DetailsSnapshot } from "./types";
import { BookingDetailsStep } from "./components/BookingDetailsStep";
import { ScheduleStep, type CoursewareSchedule } from "./components/ScheduleStep";
import { LaneConfigStep } from "./components/LaneConfigStep";
import { WizardHeader } from "./components/WizardHeader";
import type { CoursewareLaneData } from "./laneConfigTypes";
import type { Trainee } from "./nominalRollTypes";
import { ReviewBookingModal } from "./modals/ReviewBookingModal";
import { saveCreatedBooking } from "./createdBookings";

const GROUP_STEPS = ["Booking Details", "Schedule", "Lane Configuration", "Nominal Roll"];
const INDIVIDUAL_STEPS = ["Booking Details", "Trainee Information", "Schedule"];

// Matches Figma's "Discard Booking" modal (Modal Confirmation, Status=Warning,
// Size=sm): a single white card (no divider/gray footer like the old app's
// version), 48px yellow icon badge, buttons right-aligned in the same card.
function LeaveConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-96 pointer-events-auto p-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-figma-default">Leave this page?</h3>
              <p className="text-sm text-figma-caption mt-1 leading-relaxed">
                You have unsaved booking data. If you go back now, all the information you've entered will be lost.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft transition-colors bg-white">
              Continue Editing
            </button>
            <button type="button" onClick={onConfirm}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-figma-primary rounded-lg hover:bg-figma-primaryhover transition-colors">
              Yes, Leave
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function CreateBooking2({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [trainingMode, setTrainingMode] = useState("");
  const [detailsSnapshot, setDetailsSnapshot] = useState<Booking2DetailsSnapshot>({
    weapons: [], weaponSummary: "", baseQty: "1", cShapedQty: "0", courseware: "", trainingType: "", roles: [], unitContact: "", instructor: "", ftmsId: "", unitName: "", stationCountsByCourseware: {}, dryRun: false,
  });
  const [scheduleSnapshot, setScheduleSnapshot] = useState<ScheduleSnapshot>({
    scheduleType: null, section: null, briefing: false, selectedDate: null,
  });
  // Per-courseware state lifted from each step (via onAllXChange callbacks) so
  // the new Review Booking modal can show a real per-session summary instead
  // of a single flattened snapshot.
  const [allSchedules, setAllSchedules] = useState<Record<string, CoursewareSchedule>>({});
  const [allLaneData, setAllLaneData] = useState<Record<string, CoursewareLaneData>>({});
  const [allRolls, setAllRolls] = useState<Record<string, Trainee[]>>({});
  // Gate advancing past the Schedule step until every courseware has a
  // complete schedule — matches Figma's "Schedule - Empty Error" frame
  // (banner + per-field "is required" messages, shown only after Next is
  // attempted while incomplete).
  const [scheduleAllComplete, setScheduleAllComplete] = useState(true);
  const [scheduleShowErrors, setScheduleShowErrors] = useState(false);
  // Same gate, for Lane Configuration (Group flow only — Individual has no
  // Lane Configuration step).
  const [laneConfigAllComplete, setLaneConfigAllComplete] = useState(true);
  const [laneConfigShowErrors, setLaneConfigShowErrors] = useState(false);

  const isIndividual = detailsSnapshot.trainingType === "Individual";
  const steps = isIndividual ? INDIVIDUAL_STEPS : GROUP_STEPS;
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps - 1;
  const scheduleStepIndex = isIndividual ? 2 : 1;
  const laneConfigStepIndex = 2;

  // Step 1 validation (C-4, Figma 5029:69269 / 5313:12370): BookingDetailsStep registers its
  // Formik submit here; Next stays on Step 1 while the Yup schema has errors.
  const detailsValidateRef = useRef<(() => Promise<boolean>) | null>(null);

  // Step 2 availability panel (C-13): each courseware's Flat Screen / C-Shaped count from Step 1's
  // Station Configuration — one row per courseware when several, else the single-row steppers.
  const requiredStations = useMemo(() => {
    const list = detailsSnapshot.courseware.split(",").map((c) => c.trim()).filter(Boolean);
    return Object.fromEntries(list.map((cw) => {
      const c = list.length > 1 ? detailsSnapshot.stationCountsByCourseware[cw] : undefined;
      return [cw, c
        ? { flat: c.base, cshaped: c.cshaped }
        : { flat: parseInt(detailsSnapshot.baseQty) || 0, cshaped: parseInt(detailsSnapshot.cShapedQty) || 0 }];
    }));
  }, [detailsSnapshot]);

  const handleNext = async () => {
    if (step === 0 && detailsValidateRef.current && !(await detailsValidateRef.current())) return;
    if (step === scheduleStepIndex && !scheduleAllComplete) {
      setScheduleShowErrors(true);
      return;
    }
    if (!isIndividual && step === laneConfigStepIndex && !laneConfigAllComplete) {
      setLaneConfigShowErrors(true);
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const renderStep = () => {
    if (step === 0) return (
      <BookingDetailsStep
        trainingMode={trainingMode}
        onModeChange={setTrainingMode}
        onUpdate={setDetailsSnapshot}
        initial={detailsSnapshot}
        validateRef={detailsValidateRef}
      />
    );
    if (isIndividual) {
      if (step === 1) return <IndividualTraineeStep />;
      if (step === 2) return (
        <ScheduleStep
          onUpdate={setScheduleSnapshot}
          isIndividual={true}
          onAllCompleteChange={setScheduleAllComplete}
          showErrors={scheduleShowErrors}
        />
      );
    } else {
      if (step === 1) return (
        <ScheduleStep
          onUpdate={setScheduleSnapshot}
          onAllSchedulesChange={setAllSchedules}
          onAllCompleteChange={setScheduleAllComplete}
          showErrors={scheduleShowErrors}
          bookingCourseware={detailsSnapshot.courseware}
          requiredStations={requiredStations}
          onEditQuantity={() => setStep(0)}
        />
      );
      if (step === 2) return (
        <LaneConfigStep
          trainingMode={trainingMode}
          bookingWeapons={detailsSnapshot.weapons}
          bookingRoles={detailsSnapshot.roles}
          numBase={parseInt(detailsSnapshot.baseQty) || 1}
          numCShaped={parseInt(detailsSnapshot.cShapedQty) || 0}
          bookingCourseware={detailsSnapshot.courseware}
          stationCountsByCourseware={detailsSnapshot.stationCountsByCourseware}
          onAllDataChange={setAllLaneData}
          onAllCompleteChange={setLaneConfigAllComplete}
          showErrors={laneConfigShowErrors}
        />
      );
      if (step === 3) return (
        <NominalRollStep
          bookingCourseware={detailsSnapshot.courseware}
          stationCountsByCourseware={detailsSnapshot.stationCountsByCourseware}
          trainingMode={trainingMode}
          bookingWeapons={detailsSnapshot.weapons}
          bookingRoles={detailsSnapshot.roles}
          unitName={detailsSnapshot.unitName}
          onAllRollsChange={setAllRolls}
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      <WizardHeader
        title="Create Booking"
        subtitle="WPT"
        steps={steps}
        current={step}
        onClose={() => setShowLeaveConfirm(true)}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        primaryLabel={isLastStep ? "Confirm Booking" : "Next"}
        onPrimary={isLastStep ? () => setShowReviewModal(true) : handleNext}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-figma-soft">
        {renderStep()}

        {showReviewModal && (
          isIndividual ? (
            <ReviewModal
              sessionType="Integrated"
              trainingMode={trainingMode}
              detailsSnapshot={detailsSnapshot}
              scheduleSnapshot={scheduleSnapshot}
              totalTrainees={1}
              onCancel={() => setShowReviewModal(false)}
              onConfirm={() => { setShowReviewModal(false); onClose(); }}
            />
          ) : (
            <ReviewBookingModal
              detailsSnapshot={detailsSnapshot}
              schedules={allSchedules}
              laneData={allLaneData}
              rolls={allRolls}
              trainingMode={trainingMode}
              onCancel={() => setShowReviewModal(false)}
              onConfirm={() => {
                // C-1 / C-28 (Figma 6183:504775): land on Booking List with the new booking + toast.
                saveCreatedBooking({ details: detailsSnapshot, trainingMode, schedules: allSchedules, rolls: allRolls });
                setShowReviewModal(false);
                onClose();
              }}
            />
          )
        )}
      </div>

      {showLeaveConfirm && (
        <LeaveConfirmDialog
          onConfirm={() => { setShowLeaveConfirm(false); onClose(); }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
}
