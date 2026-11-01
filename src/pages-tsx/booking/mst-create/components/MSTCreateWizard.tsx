// MST Create Booking wizard (CM-5): Booking Details → Schedule → Cabin Configuration → Nominal Roll, then the
// "Review Your Booking" modal from "Confirm Booking" — Figma pages 6068:92689 · 6183:416844 · 6183:422450 ·
// 6183:481240 · 5313:57921. It was ONE page "Book Your MST Training Program" with a 3-step stepper
// (Booking Details with the schedule inside · Cabin Configuration · Nominal Roll).
//
// Flow rules kept from the old build: Next on Step 1 validates the form; Step 3 needs the booked cabins and the
// master IOS; the booking is saved with `saveMSTLocalBooking` and the user lands on the MST Booking List.
// New: Next on Schedule needs a schedule type + date (+ start/end time for Ad-hoc); Back / ✕ on Booking Details ask
// "Leave this page?" (Figma 6068:92715) — Back on the first step has no destination in Figma (C-6), so it opens the
// same dialog as ✕ (assumption).
import { useCallback, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { saveMSTLocalBooking } from "@/data/localBookings";
import { cabinsForDate } from "../cabinAvailability";
import { MST_ROLES_BY_KIND, mstTrainingKind } from "../mstTrainingTypes";
import { MST_STEPS } from "../constants";
import { flagMSTBookingCreated } from "../createdToast";
import { MSTReviewModal } from "../modals/MSTReviewModal";
import { MSTBookingDetailsStep, type MSTBookingDetailsValues } from "./MSTBookingDetailsStep";
import { MSTCabinSetupStep, newIos, requiredCabinCount } from "./MSTCabinSetupStep";
import type { CabinRow, IosEntry } from "./MSTCabinConfigStep";
import { MSTNominalRollStep } from "./MSTNominalRollStep";
import { MSTScheduleStep, EMPTY_MST_SCHEDULE, mstScheduleSession, isMSTScheduleComplete, type MSTSchedule } from "./MSTScheduleStep";
import { MSTWizardHeader } from "./MSTWizardHeader";

const EMPTY_DETAILS: MSTBookingDetailsValues = {
  bookingType: "Compartment Selection", cabinAmount: 1, compartments: [], vehicleType: "ICV (TERREX)", platformVariants: [],
  unitName: "", instructor: "", unitContactDetails: "", scheduleType: null, briefingRooms: [], selectedDate: null,
};

export function MSTCreateWizard({ onExit, onComplete }: { onExit: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<MSTBookingDetailsValues>(EMPTY_DETAILS);
  const [schedule, setSchedule] = useState<MSTSchedule>(EMPTY_MST_SCHEDULE);
  const [scheduleErrors, setScheduleErrors] = useState(false);
  const [cabins, setCabins] = useState<CabinRow[]>([]);
  const [iosList, setIosList] = useState<IosEntry[]>(() => [newIos(true)]);
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  const detailsValidateRef = useRef<(() => Promise<MSTBookingDetailsValues | null>) | null>(null);
  const cabinValidateRef = useRef<(() => boolean) | null>(null);
  const onDetailsChange = useCallback((v: MSTBookingDetailsValues) => setDetails(v), []);

  const trainingType = details.compartments[0] ?? "";
  const platformOptions = useMemo(() => details.platformVariants.filter((v) => v.selected).map((v) => v.label), [details.platformVariants]);

  /** Cabins for the chosen date, keeping what is still valid for the current Training Type / Platform Types / amount. */
  const refreshCabins = () => {
    const roles = MST_ROLES_BY_KIND[mstTrainingKind(trainingType) ?? "Standalone"];
    const cap = requiredCabinCount(details.cabinAmount, schedule.date);
    let kept = 0;
    setCabins(cabinsForDate(schedule.date, cabins.length ? cabins : undefined).map((c) => {
      const selected = c.selected && kept < cap && (kept += 1) > 0;
      return {
        ...c,
        selected,
        weaponVariant: platformOptions.includes(c.weaponVariant) ? c.weaponVariant : "",
        role: c.role.split(",").filter((r) => roles.includes(r)).join(","),
      };
    }));
  };

  const handleNext = async () => {
    if (step === 0) {
      const v = await detailsValidateRef.current?.();
      if (!v) return;
      setDetails(v);
      setStep(1);
    } else if (step === 1) {
      if (!isMSTScheduleComplete(schedule)) { setScheduleErrors(true); return; }
      refreshCabins();
      setStep(2);
    } else if (step === 2) {
      if (cabinValidateRef.current?.() !== true) return;
      setStep(3);
    } else {
      setShowReview(true);
    }
  };

  const confirm = () => {
    const saved: MSTBookingDetailsValues = {
      ...details,
      scheduleType: mstScheduleSession(schedule.type),
      selectedDate: schedule.date,
      startTime: schedule.type === "AdHoc" ? schedule.startTime : undefined,
      endTime: schedule.type === "AdHoc" ? schedule.endTime : undefined,
    };
    saveMSTLocalBooking(saved, cabins, iosList);
    flagMSTBookingCreated();
    setShowReview(false);
    onComplete();
  };

  const isLast = step === MST_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-surface">
      <MSTWizardHeader
        steps={MST_STEPS}
        current={step}
        onClose={() => setShowLeave(true)}
        onBack={() => (step === 0 ? setShowLeave(true) : setStep(step - 1))}
        primaryLabel={isLast ? "Confirm Booking" : "Next"}
        onPrimary={handleNext}
      />

      <div className="flex min-h-0 flex-1 flex-col bg-main-background">
        {step === 0 && <MSTBookingDetailsStep initial={details.compartments.length ? details : null} onChange={onDetailsChange} validateRef={detailsValidateRef} />}
        {step === 1 && (
          <MSTScheduleStep
            trainingType={trainingType}
            requiredCabins={details.cabinAmount}
            value={schedule}
            onChange={(s) => { setSchedule(s); setScheduleErrors(false); }}
            showErrors={scheduleErrors}
            onEditQuantity={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <MSTCabinSetupStep
            trainingType={trainingType}
            cabinAmount={details.cabinAmount}
            date={schedule.date}
            platformOptions={platformOptions}
            cabins={cabins}
            onCabinsChange={setCabins}
            iosList={iosList}
            onIosChange={setIosList}
            validateRef={cabinValidateRef}
          />
        )}
        {step === 3 && <MSTNominalRollStep iosList={iosList} onTotalChange={setTotalTrainees} />}
      </div>

      {showReview && (
        <MSTReviewModal details={details} schedule={schedule} cabins={cabins} iosList={iosList} totalTrainees={totalTrainees} onCancel={() => setShowReview(false)} onConfirm={confirm} />
      )}

      <ConfirmDialog
        open={showLeave}
        title="Leave this page?"
        subtitle="You have unsaved booking data. If you go back now, all the information you’ve entered will be lost."
        cancelLabel="Continue Editing"
        confirmLabel="Yes, Leave"
        onCancel={() => setShowLeave(false)}
        onConfirm={() => { setShowLeave(false); onExit(); }}
      />
    </div>
  );
}
