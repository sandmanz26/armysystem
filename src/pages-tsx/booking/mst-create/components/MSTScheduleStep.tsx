// MST Create Booking — Step 2: Schedule (CM-2, Figma `↪ Step 2 - Schedule` 6183:416844).
//
// Frames: Empty 6183:416849 · Empty Error 6183:416851 · Selected AM/PM 6183:416853 / …855 (completed) / …857
// (error) · Dropdown - Date Slot 6183:416859 / …865 / …867 · Full Day 6183:416861 · Ad-hoc 6183:416863 / …869 ·
// Dropdown - Time 6183:416871.
//
// One 640px card titled with the Training Type (MST has one training type per booking, so no courseware
// sidebar): Schedule Type radios (AM / PM / Full Day single date / Ad-hoc single date with flexible time),
// Date Slot (the same `CalendarPicker` Booking 2.0 uses), Start/End Time for Ad-hoc, and the grey
// summary with "Required Cabin(s)" and "Availability on Select Date Slot" (Sufficient / Insufficient).
// The date used to live in Step 1 as a two-month calendar with a free-text "Schedule Selection".
import { Alert } from "@/components/alert";
import { Icon } from "@/components/icon";
import { RadioGroup } from "@/components/radio";
import { Select } from "@/components/select";
import { StatusBadge } from "@/components/status-badge";
import { CalendarPicker } from "@/pages-tsx/booking-2/create/components/Calendar";
import { freeCabinCount } from "../cabinAvailability";
import { FieldCaption, FieldLabel, SectionCard } from "./MSTFields";

export type MSTScheduleTypeId = "AM" | "PM" | "FullDay" | "AdHoc";

export interface MSTSchedule {
  type: MSTScheduleTypeId | null;
  date: Date | null;
  startTime: string;
  endTime: string;
}

export const EMPTY_MST_SCHEDULE: MSTSchedule = { type: null, date: null, startTime: "", endTime: "" };

export const MST_SCHEDULE_OPTIONS: { value: MSTScheduleTypeId; label: string; session: string }[] = [
  { value: "AM",      label: "AM Session (08:00 AM - 12:00 PM)",                        session: "AM Session" },
  { value: "PM",      label: "PM Session (01:00 PM - 05:00 PM)",                        session: "PM Session" },
  { value: "FullDay", label: "Full Day (Single date, 08:00 AM - 05:00 PM)",             session: "Full Day" },
  { value: "AdHoc",   label: "Ad-hoc Schedule (Single date with flexible time)",         session: "Ad-hoc" },
];

/** Value saved on the booking (`scheduleType`) — the same strings the Booking List/Detail already read. */
export const mstScheduleSession = (t: MSTScheduleTypeId | null) => MST_SCHEDULE_OPTIONS.find((o) => o.value === t)?.session ?? null;

export function isMSTScheduleComplete(s: MSTSchedule) {
  if (!s.type || !s.date) return false;
  return s.type !== "AdHoc" || (!!s.startTime && !!s.endTime);
}

/** "08:00 AM"-style half-hour list (Figma Dropdown - Time 6183:416871 starts at 00:00 AM). */
const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const suffix = h < 12 ? "AM" : "PM";
  const hh = String(h > 12 ? h - 12 : h).padStart(2, "0"); // 00:00 AM, 01:00 AM … 12:00 PM, 01:00 PM …
  return [`${hh}:00 ${suffix}`, `${hh}:30 ${suffix}`];
}).flat();

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const formatMSTDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function MSTScheduleStep({ trainingType, requiredCabins, value, onChange, showErrors, onEditQuantity }: {
  trainingType: string;
  requiredCabins: number;
  value: MSTSchedule;
  onChange: (next: MSTSchedule) => void;
  /** Set after Next was pressed with an incomplete schedule — shows the "… is required" captions. */
  showErrors: boolean;
  /** "edit quantity" link in the Insufficient alert — back to Booking Details. */
  onEditQuantity: () => void;
}) {
  const free = value.date ? freeCabinCount(value.date) : null;
  const sufficient = free !== null && free >= requiredCabins;
  const typeError = showErrors && !value.type;
  const dateError = showErrors && !!value.type && !value.date;

  return (
    <div className="flex-1 overflow-auto bg-main-background px-6 py-6">
      <div className="mx-auto w-[640px] max-w-full">
        <SectionCard title={trainingType} subtitle="Configure this courseware's training schedule">
          <RadioGroup
            name="mst-schedule-type" label="Schedule Type" required
            options={MST_SCHEDULE_OPTIONS.map(({ value: v, label }) => ({ value: v, label }))}
            value={value.type ?? undefined}
            onChange={(v) => onChange({ type: v as MSTScheduleTypeId, date: null, startTime: "", endTime: "" })}
            status={typeError ? "danger" : "default"} caption={typeError ? "Schedule Type is required" : undefined}
          />

          <div className="flex flex-col gap-1">
            <FieldLabel required>Date Slot</FieldLabel>
            <CalendarPicker
              mode="single" value={value.date} invalid={dateError} disabled={!value.type}
              placeholder="Select Date Slot"
              onConfirm={(v) => onChange({ ...value, date: v as Date | null })}
            />
            {!value.type && <FieldCaption>Select a schedule type to continue</FieldCaption>}
            {dateError && <FieldCaption danger>Date Slot is required</FieldCaption>}
          </div>

          {value.type === "AdHoc" && (
            <div className="grid grid-cols-2 gap-5">
              <Select
                label="Start Time" required placeholder="Select Start Time" options={TIME_OPTIONS} listMaxHeight={264}
                value={value.startTime} onChange={(v) => onChange({ ...value, startTime: v })}
                status={showErrors && !value.startTime ? "danger" : "default"}
              />
              <Select
                label="End Time" required placeholder="Select End Time" options={TIME_OPTIONS} listMaxHeight={264}
                value={value.endTime} onChange={(v) => onChange({ ...value, endTime: v })}
                status={showErrors && !value.endTime ? "danger" : "default"}
              />
            </div>
          )}

          {/* Figma `Input-Summary (Read Only)` — grey box, two Key Value rows. */}
          <div className="flex flex-col gap-4 rounded-lg bg-default-default p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-body">Required Cabin(s)</span>
              <span className="font-semibold text-default">{requiredCabins}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-body">Availability on Select Date Slot</span>
              {free === null ? (
                <span className="font-semibold text-default">Select a date to check availability</span>
              ) : (
                <span className={sufficient ? "flex items-center gap-2 font-semibold text-default" : "flex items-center gap-2 font-semibold text-danger"}>
                  {free}
                  {sufficient ? (
                    <StatusBadge tone="success" className="gap-1 pl-1 pr-2"><Icon name="check" size={14} />Sufficient</StatusBadge>
                  ) : (
                    <StatusBadge tone="danger" className="gap-1 pl-1 pr-2"><Icon name="circle-alert" size={14} />Insufficient</StatusBadge>
                  )}
                </span>
              )}
            </div>
            {free !== null && !sufficient && (
              <Alert
                status="danger"
                message={<>Insufficient cabins. You can choose another date or <button type="button" onClick={onEditQuantity} className="text-link">edit quantity</button> in Booking Details.</>}
              />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
