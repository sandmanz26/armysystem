// Booking Details 2.0 — header / ⋮ actions of a booking with MULTIPLE courseware. Each action first
// asks which courseware (or assignment) it applies to, then hands off to the existing flow.
//
//   Reschedule       Select Courseware (6495:75080, radio, info alert) → RescheduleView for that
//                    courseware (`Reschedule` link frame 6495:75082) → its own confirm + toast.
//   Cancel Booking   Select Courseware (6495:75085, checkboxes + Select all) → confirmation
//                    1 CW 6495:75087 · several 6501:286020 · all 6501:286603 → toast
//                    "1 courseware cancelled" 6495:75089 · "2 courseware cancelled" 6501:286022 ·
//                    "Booking cancelled" 6501:286605.
//   Start Onboarding Select Courseware (6829:39115) when 2+ courseware are ready; exactly one ready
//                    skips it (sticker 7908:12688) → existing /bookings-2/onboarding route with
//                    `courseware=`.
//   Top Up Assets    Select Assignment (6829:38601) → Scan Assets in Top Up mode (F-009, mode=topup).
// Reschedule / Cancel list only courseware that are still Upcoming and not asset-issued — the info
// alert's own rule ("Asset-issued, ongoing, completed, or overdue courseware aren't included.").
import type { Booking } from "@/data/mock";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RescheduleView } from "./RescheduleView";
import { SelectCoursewareModal, type ChoiceOption } from "./SelectCoursewareModal";
import { oneLine, sessionLine, type MultiCw, type MultiCwState } from "./multiCw";
import { useState } from "react";
import { scanUrl } from "@/pages-tsx/booking-2/issue-assets/scanMode";

export type MultiCwAction = "reschedule" | "cancel" | "onboarding" | "topup";

interface Props {
  action: MultiCwAction | null;
  booking: Booking;
  multi: MultiCwState;
  onClose: () => void;
  onToast: (message: string) => void;
  /** Every courseware cancelled → the whole booking is cancelled. */
  onCancelBooking: () => void;
  onNavigate?: (path: string) => void;
}

const cwOption = (c: MultiCw): ChoiceOption => ({ value: String(c.index), title: c.name, description: [oneLine(c.schedule)] });

/** Courseware a Start Onboarding can begin with: assets issued, not cancelled. */
export const onboardingReady = (multi: MultiCwState) => multi.list.filter((c) => c.assignmentId && !c.cancelled);

export function MultiCwActions({ action, booking, multi, onClose, onToast, onCancelBooking, onNavigate }: Props) {
  const [rescheduleCw, setRescheduleCw] = useState<MultiCw | null>(null);
  const [cancelCws, setCancelCws] = useState<MultiCw[] | null>(null);

  const active = multi.list.filter((c) => !c.cancelled);
  const changeable = active.filter((c) => !c.assignmentId);
  const byIndex = (v: string) => multi.list[Number(v)];

  if (rescheduleCw) {
    return (
      <RescheduleView
        bookingId={booking.bookingId}
        program={booking.program}
        courseware={rescheduleCw.name}
        currentDate={rescheduleCw.schedule.date}
        currentTime={sessionLine(rescheduleCw.schedule)}
        flatStations={rescheduleCw.baseStation ? 1 : 0}
        cShapedStations={0}
        onClose={() => setRescheduleCw(null)}
        onConfirm={(r) => {
          multi.reschedule(rescheduleCw.index, r.bookingTime);
          setRescheduleCw(null);
          onToast(r.toast);
        }}
      />
    );
  }

  if (cancelCws) {
    const n = cancelCws.length;
    const total = active.length;
    const all = n === total;
    return (
      <ConfirmDialog
        open
        tone="warning"
        className="w-[768px]"
        title={n === 1 ? "Cancel this training session?" : "Cancel these training sessions?"}
        subtitle={
          <>
            This will cancel <strong className="font-bold">{n} of {total}</strong> courseware for {booking.unitName}:
          </>
        }
        confirmLabel={all ? "Cancel Booking" : n === 1 ? "Cancel Session" : "Cancel Sessions"}
        onCancel={() => setCancelCws(null)}
        onConfirm={() => {
          setCancelCws(null);
          if (all) {
            onCancelBooking();
            onToast("Booking cancelled");
          } else {
            multi.cancel(cancelCws.map((c) => c.index));
            onToast(`${n} courseware cancelled`);
          }
        }}
      >
        <ul className="my-3 list-disc pl-5">
          {cancelCws.map((c) => (
            <li key={c.index}>{c.name}: {oneLine(c.schedule)}</li>
          ))}
        </ul>
        <p>
          Assigned stations and briefing rooms for {n === 1 ? "this session" : "these sessions"} will be released.
          {!all && " The remaining courseware won't be affected."} <strong className="font-bold">This can't be undone.</strong>
        </p>
      </ConfirmDialog>
    );
  }

  if (action === "reschedule") {
    return (
      <SelectCoursewareModal
        title="Reschedule"
        info="Showing courseware available to reschedule. Asset-issued, ongoing, completed, or overdue courseware aren't included."
        label="Select a courseware to reschedule"
        options={changeable.map(cwOption)}
        errorText="Select 1 courseware to continue"
        onCancel={onClose}
        onContinue={([v]) => {
          onClose();
          setRescheduleCw(byIndex(v));
        }}
      />
    );
  }

  if (action === "cancel") {
    return (
      <SelectCoursewareModal
        title="Cancel Booking"
        info="Showing courseware available to cancel. Asset-issued, ongoing, completed, or overdue courseware aren't included."
        label="Select courseware to cancel"
        multiple
        options={changeable.map(cwOption)}
        errorText="Select at least 1 courseware to continue"
        onCancel={onClose}
        onContinue={(vs) => {
          onClose();
          setCancelCws(vs.map(byIndex).sort((a, b) => a.index - b.index));
        }}
      />
    );
  }

  if (action === "onboarding") {
    return (
      <SelectCoursewareModal
        title="Start Onboarding"
        label="Select a courseware to start onboarding"
        options={onboardingReady(multi).map(cwOption)}
        errorText="Select 1 courseware to continue"
        onCancel={onClose}
        onContinue={([v]) => {
          onClose();
          onNavigate?.(`/bookings-2/onboarding?id=${booking.id}&courseware=${encodeURIComponent(byIndex(v).name)}`);
        }}
      />
    );
  }

  if (action === "topup") {
    const assignments = [...new Set(active.map((c) => c.assignmentId).filter((a): a is string => Boolean(a)))];
    const cwsOf = (a: string) => active.filter((c) => c.assignmentId === a);
    return (
      <SelectCoursewareModal
        title="Top Up Asset"
        label="Select an assignment to top up asset"
        options={assignments.map((a) => ({
          value: a,
          title: a,
          description: cwsOf(a).map((c) => `Booking ID ${booking.bookingId}: ${c.name}`),
        }))}
        onCancel={onClose}
        onContinue={([a]) => {
          onClose();
          const cws = cwsOf(a);
          // F-009 BD-14: the scan page in Top Up mode for that assignment; back here afterwards.
          onNavigate?.(
            scanUrl(
              "/bookings-2/issue-assets",
              "topup",
              { baseStation: cws[0]?.baseStation, bookingIds: booking.id, assignmentId: a, courseware: cws.map((c) => c.name).join(", ") },
              `/bookings-2/detail?id=${booking.id}`,
            ),
          );
        }}
      />
    );
  }

  return null;
}
