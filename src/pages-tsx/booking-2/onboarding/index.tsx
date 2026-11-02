// Booking 2.0 — Onboarding 2.0 wizard. New, isolated from /bookings/*.
// Only reachable from a Booking 2.0 List row ("Start Onboarding"), per the
// user's instruction that Onboarding 2.0 only operates on Booking 2.0 data.
//
// 3-step flow per the reference screenshots: Nominal Roll (Confirm
// Attendance) → Lane Configuration → Detail List. Lane Configuration has its
// own Onboarding-specific design (OnboardingLaneConfigStep) — pre-seeded
// lanes with a per-lane Status toggle and a "Confirm Lane Configuration"
// changes-summary gate — distinct from booking-2/create's Lane Config step.
//
// Header/stepper matches Figma node 5348:24188 ("Nominal Roll - List
// Default") — the same numbered-circle-badge WizardHeader used by Create
// Booking 2.0, reused here instead of the old dashed-pill Stepper. Each
// step's own "Confirm ..." action is exposed via a ref (requestConfirm) so
// the header's single primary button can trigger whichever step is active,
// instead of each step rendering its own duplicate action inline.
import { useMemo, useRef, useState } from "react";
import { bookings } from "@/data/mock";
import { generateTrainees } from "@/pages-tsx/booking-2/create/nominalRollTypes";
import { WizardHeader } from "@/pages-tsx/booking-2/create/components/WizardHeader";
import { ConfirmAttendanceStep, type ConfirmAttendanceStepHandle } from "./components/ConfirmAttendanceStep";
import { OnboardingLaneConfigStep, type OnboardingLaneConfigStepHandle } from "./components/OnboardingLaneConfigStep";
import { DetailListStep, type DetailListSeed, type DetailListStepHandle } from "./components/DetailListStep";
import { saveSession, sessionFromOnboarding } from "@/pages-tsx/booking-2/ongoing-session/session";
import { ReviewBookingModal, type ReviewStationRow } from "./modals/ReviewBookingModal";
import type { OnbStationData } from "./laneConfigTypes";
import type { OnboardingTrainee } from "./types";

const STEPS = ["Nominal Roll", "Lane Configuration", "Detail List"];
const PRIMARY_LABELS = ["Confirm Attendance", "Confirm Lane Configuration", "Confirm Detail List"];

interface Onboarding2Props {
  onClose?: () => void;
}

export function Onboarding2({ onClose }: Onboarding2Props) {
  const bookingId = useMemo(() => new URLSearchParams(window.location.search).get("id"), []);
  const coursewareParam = useMemo(() => new URLSearchParams(window.location.search).get("courseware"), []);
  const booking = useMemo(() => bookings.find((b) => b.id === bookingId), [bookingId]);
  // Booking List 2.0 splits one row per courseware/session (Sec. 12.2) — a
  // booking with 2+ coursewares only shares its `id` across those rows so
  // they still all click through to one Booking Detail page. "Start
  // Onboarding" from one of those rows carries the ONE courseware it was
  // clicked from via this query param; without it, re-looking up the
  // booking by id alone returns the full, un-split comma-joined courseware
  // string. Falls back to that full string only when no param is given
  // (e.g. launched from Booking Detail, which isn't split by courseware).
  const courseware = coursewareParam || booking?.courseware || "";
  // F-009 prototype hooks — there is no scanner / VTS signal in this prototype, so the two
  // Figma states that depend on one are raised from the URL (same pattern as Ongoing
  // Session's `?laneDown=`): `?scanner=inactive` → Scan ID - Scanner Inactive (5474:158048);
  // `?vts=waiting` → Review Booking - If 3rd Party Not Ready (5639:256100).
  const scannerInactive = useMemo(() => new URLSearchParams(window.location.search).get("scanner") === "inactive", []);
  const vtsReady = useMemo(() => new URLSearchParams(window.location.search).get("vts") !== "waiting", []);

  const [step, setStep] = useState(0);
  const [attendanceRolls, setAttendanceRolls] = useState<{ flat: OnboardingTrainee[]; cshaped: OnboardingTrainee[] }>({ flat: [], cshaped: [] });
  const [laneConfigResult, setLaneConfigResult] = useState<{ flat: OnbStationData[]; cshaped: OnbStationData[] } | null>(null);
  const [reviewRows, setReviewRows] = useState<ReviewStationRow[]>([]);
  const [sessionSeed, setSessionSeed] = useState<DetailListSeed | null>(null);
  const [showReviewBooking, setShowReviewBooking] = useState(false);

  const attendanceRef = useRef<ConfirmAttendanceStepHandle>(null);
  const laneConfigRef = useRef<OnboardingLaneConfigStepHandle>(null);
  const detailListRef = useRef<DetailListStepHandle>(null);

  const numBase = booking?.baseStationQty ?? 4;
  const numCShaped = booking?.cShapedStationQty ?? 0;
  const weaponTypes = booking?.weaponTypes ?? (booking?.weapon ? [booking.weapon] : []);

  const initialRoll = useMemo(() => {
    const flat = generateTrainees(numBase * 2, 0);
    const cshaped = numCShaped > 0 ? generateTrainees(numCShaped * 2, 100) : [];
    return { [`${courseware}::flat`]: flat, [`${courseware}::cshaped`]: cshaped };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const goClose = () => (onClose ? onClose() : (window.location.href = "/bookings/list"));
  const goBack = () => (step > 0 ? setStep(step - 1) : goClose());

  const handlePrimary = () => {
    if (step === 0) attendanceRef.current?.requestConfirm();
    else if (step === 1) laneConfigRef.current?.requestConfirm();
    else if (step === 2) detailListRef.current?.requestConfirm();
  };

  // Figma `Toast - Success` (5483:95469): Begin Session lands on Ongoing
  // Session with "Session has begun" — confirmed by the user 30 Sep 2026.
  const goBegin = () => {
    if (!booking || !sessionSeed) return;
    saveSession(sessionFromOnboarding(booking, courseware, sessionSeed.stations, sessionSeed.details));
    window.location.href = `/bookings/session?id=${booking.id}&begun=1`;
  };

  if (!booking) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-figma-body mb-4">Booking not found in Booking 2.0.</p>
          <button type="button" onClick={() => (window.location.href = "/bookings/list")} className="text-figma-primary font-semibold text-sm">
            Back to Booking List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-figma-soft flex flex-col">
      <WizardHeader
        title="Onboarding"
        subtitle={`${booking.program} · ${courseware}`}
        steps={STEPS}
        current={step}
        onClose={goClose}
        onBack={step > 0 ? goBack : undefined}
        primaryLabel={PRIMARY_LABELS[step]}
        onPrimary={handlePrimary}
      />

      {step === 0 && (
        <ConfirmAttendanceStep
          ref={attendanceRef}
          trainingMode={booking.trainingMode}
          bookingWeapons={weaponTypes}
          bookingRoles={[]}
          courseware={courseware}
          unitName={booking.unitName}
          hasCShaped={numCShaped > 0}
          numBase={numBase}
          numCShaped={numCShaped}
          initialRoll={initialRoll}
          onRollsChange={setAttendanceRolls}
          scannerInactive={scannerInactive}
          onConfirmed={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <OnboardingLaneConfigStep
          ref={laneConfigRef}
          trainingMode={booking.trainingMode}
          bookingWeapons={weaponTypes}
          bookingRoles={[]}
          numBase={numBase}
          numCShaped={numCShaped}
          courseware={courseware}
          onConfirm={(data) => { setLaneConfigResult(data); setStep(2); }}
        />
      )}

      {step === 2 && (
        <DetailListStep
          ref={detailListRef}
          flatRoll={attendanceRolls.flat}
          cshapedRoll={attendanceRolls.cshaped}
          laneConfig={laneConfigResult}
          hasCShaped={numCShaped > 0}
          bookingId={booking.bookingId}
          bookingName={booking.program}
          courseware={courseware}
          onConfirm={(rows, seed) => { setReviewRows(rows); setSessionSeed(seed); setShowReviewBooking(true); }}
        />
      )}

      {showReviewBooking && (
        <ReviewBookingModal
          courseware={courseware}
          trainingType={booking.trainingType}
          trainingMode={booking.trainingMode}
          dryRunTraining={!!booking.dryRunTraining}
          instructorName={booking.instructorName}
          instructorPhone={booking.instructorPhone}
          weaponTypes={weaponTypes}
          roles={booking.roles ?? []}
          briefingRoom={booking.briefingRoom}
          bookingTimeRaw={booking.bookingTime}
          stationRows={reviewRows}
          vtsReady={vtsReady}
          onCancel={() => setShowReviewBooking(false)}
          onConfirm={goBegin}
        />
      )}
    </div>
  );
}
