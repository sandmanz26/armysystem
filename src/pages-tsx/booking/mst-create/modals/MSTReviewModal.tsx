// MST Create Booking — "Review Your Booking" modal, opened by "Confirm Booking" on the last step (CM-4 / Step 5).
//
// ASSUMPTION (flagged): Figma's MST "Step 5 - Review Booking" pages (5313:57921, 6183:504759) are WPT clones
// (Courseware list, Flat Screen / C-Shaped counts, "Lane Assigned"). What is taken from them: the title
// "Review Your Booking", the line "Verify the information before confirming.", a "Booking Summary" card of
// Key Values (12 Regular `text/body` title over a 14 SemiBold value) and the Cancel / Confirm footer.
// What stays MST's own (PRD §2.3): Total Trainee, Booking Type = Compartment Selection (shown only here), Vehicle
// Type, Cabin, "Weapon Variant" (= Step 1's Platform Type — MST14 is still open), Role, Instructor, Unit Contact
// Details, Training Schedule / Date, Briefing Room, one tile per IOS, and the "arrive 15 minutes before" note.
// Confirm saves the booking and lands on the MST Booking List (see MSTCreateWizard).
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/modal-1";
import { cabinLabel } from "../cabinAvailability";
import { MST_SCHEDULE_OPTIONS, type MSTSchedule } from "../components/MSTScheduleStep";
import type { CabinRow, IosEntry } from "../components/MSTCabinConfigStep";
import type { MSTBookingDetailsValues } from "../components/MSTBookingDetailsStep";

function KeyValue({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-body">{title}</p>
      <div className="text-sm font-semibold text-default">{children}</div>
    </div>
  );
}

export function MSTReviewModal({ details, schedule, cabins, iosList, totalTrainees, onCancel, onConfirm }: {
  details: MSTBookingDetailsValues;
  schedule: MSTSchedule;
  cabins: CabinRow[];
  iosList: IosEntry[];
  totalTrainees: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const chosen = cabins.filter((c) => c.selected);
  const roles = [...new Set(chosen.flatMap((c) => (c.role ? c.role.split(",").filter(Boolean) : [])))];
  const platform = details.platformVariants.filter((v) => v.selected).map((v) => v.label).join(", ");
  const scheduleOpt = MST_SCHEDULE_OPTIONS.find((o) => o.value === schedule.type);
  const trainingSchedule = !scheduleOpt ? "—" : schedule.type === "AdHoc" && schedule.startTime && schedule.endTime
    ? `Ad-hoc Schedule (${schedule.startTime} - ${schedule.endTime})`
    : scheduleOpt.label;

  return (
    <Modal open onClose={onCancel} width={720} isUseX={false}>
      <div className="-m-6 flex max-h-[calc(100vh-64px)] flex-col">
        <div className="flex items-center gap-6 p-8 pb-4">
          <h3 className="flex-1 text-xl font-semibold text-default">Review Your Booking</h3>
          <button type="button" aria-label="Close" onClick={onCancel} className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-default">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 pb-2">
          <p className="text-sm text-default">Verify the information before confirming.</p>

          <div className="rounded-xl border border-invert-default bg-main-background">
            <div className="p-4"><h4 className="text-sm font-semibold text-default">Booking Summary</h4></div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-4 pb-4">
              <KeyValue title="Training Type">{details.compartments[0] || "—"}</KeyValue>
              <KeyValue title="Total Trainee">{totalTrainees} {totalTrainees === 1 ? "Trainee" : "Trainees"}</KeyValue>
              <KeyValue title="Booking Type">{details.bookingType}</KeyValue>
              <KeyValue title="Vehicle Type">{details.vehicleType}</KeyValue>
              <KeyValue title="Unit Name">{details.unitName || "—"}</KeyValue>
              <KeyValue title="Cabin">{details.cabinAmount} {details.cabinAmount === 1 ? "Cabin" : "Cabins"}{chosen.length > 0 && <span className="font-normal text-body"> · {chosen.map((c) => cabinLabel(c.id)).join(", ")}</span>}</KeyValue>
              <KeyValue title="Weapon Variant">{platform || "—"}</KeyValue>
              <KeyValue title="Role">{roles.length ? roles.join(", ") : "—"}</KeyValue>
              <KeyValue title="Instructor">{details.instructor || "—"}</KeyValue>
              <KeyValue title="Unit Contact Details">{details.unitContactDetails || "—"}</KeyValue>
              <KeyValue title="Training Schedule">{trainingSchedule}</KeyValue>
              <KeyValue title="Training Date">{schedule.date ? schedule.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</KeyValue>
              <KeyValue title="Briefing Room">{details.briefingRooms.length ? details.briefingRooms.join(", ") : "—"}</KeyValue>
            </div>
          </div>

          {iosList.length > 0 && (
            <div className="rounded-xl border border-invert-default bg-main-background">
              <div className="p-4"><h4 className="text-sm font-semibold text-default">IOS Configuration</h4></div>
              <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                {iosList.map((ios, i) => (
                  <div key={ios.uid} className="rounded-lg border border-invert-default bg-surface px-3 py-2.5">
                    <p className="mb-1 text-xs font-semibold text-body">IOS {i + 1}</p>
                    <p className="text-sm font-semibold text-default">{ios.iosDevice || "—"}{ios.baseStation ? ` · ${ios.baseStation}` : ""}</p>
                    <p className="mt-0.5 text-xs text-body">Master: {ios.masterIOS || "—"} · {ios.forceType || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs leading-relaxed text-body">
            Ensure you arrive 15 minutes before the scheduled time. You must bring your identity card and any required equipment.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-8 pt-4">
          <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">Cancel</button>
          <button type="button" onClick={onConfirm} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered">Confirm</button>
        </div>
      </div>
    </Modal>
  );
}
