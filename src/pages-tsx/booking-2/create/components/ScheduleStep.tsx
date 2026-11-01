// Booking 2.0 — Step 2: Schedule.
//
// New design per the screenshots: a per-courseware sidebar (checkmark once
// that courseware's schedule is configured, one-line summary underneath),
// a flat 5-option Schedule Type radio list with inline time ranges, a
// "Date Slot" field backed by the ONE shared CalendarPicker (single-date
// mode for AM/PM/Full Day Single Date, range mode for Full Day Multiple
// Dates and Ad-hoc — same component either way, per instruction), and
// Start/End Time dropdowns for Ad-hoc. Error state uses the same
// `border-figma-error` convention used across this codebase's Formik forms
// (e.g. TraineeFormModal.tsx, AddBriefingRoomModal.tsx) — a field turns red
// once it's been interacted with (its picker opened and closed) and is
// still empty, matching the screenshots' red-outlined empty Start Time field.
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ScheduleSnapshot } from "@/pages-tsx/booking/create/types";
import { CalendarPicker, type CalendarValue } from "./Calendar";
import { Icon } from "@/components/icon";
import { Alert } from "@/components/alert";
import { StatusBadge } from "@/components/status-badge";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { availabilityFor, type StationCount } from "../stationAvailability";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export type ScheduleTypeId = "AM" | "PM" | "FullDaySingle" | "FullDayMultiple" | "AdHoc";

export const SCHEDULE_TYPE_OPTIONS: { id: ScheduleTypeId; label: string; range: string }[] = [
  { id: "AM",              label: "AM Session",             range: "08:00 AM – 12:00 PM" },
  { id: "PM",               label: "PM Session",             range: "01:00 PM – 05:00 PM" },
  { id: "FullDaySingle",    label: "Full Day (Single Date)", range: "08:00 AM – 05:00 PM" },
  { id: "FullDayMultiple",  label: "Full Day (Multiple Dates)", range: "08:00 AM – 05:00 PM per date" },
  { id: "AdHoc",            label: "Ad-hoc Schedule",        range: "Custom date range, flexible time" },
];

/** Radio rows actually shown. Figma (5029:69716) lists 4: AM, PM, Full Day (single date), Ad-hoc
 *  (single date, flexible time). "Full Day (Multiple Dates)" and the Ad-hoc custom RANGE are kept
 *  behind HIDDEN_FEATURES.scheduleFullDayMultipleDates. */
function visibleScheduleOptions() {
  if (HIDDEN_FEATURES.scheduleFullDayMultipleDates) return SCHEDULE_TYPE_OPTIONS;
  return SCHEDULE_TYPE_OPTIONS.filter((o) => o.id !== "FullDayMultiple").map((o) =>
    o.id === "FullDaySingle" ? { ...o, label: "Full Day", range: "Single date, 08:00 AM - 05:00 PM" }
    : o.id === "AdHoc" ? { ...o, range: "Single date with flexible time" }
    : o.id === "AM" ? { ...o, range: "08:00 AM - 12:00 PM" }
    : o.id === "PM" ? { ...o, range: "01:00 PM - 05:00 PM" }
    : o
  );
}

/** The calendar picks a RANGE only for Full Day (Multiple Dates) and — with the flag on — Ad-hoc. */
function calendarIsRange(type: ScheduleTypeId | null) {
  return type === "FullDayMultiple" || (type === "AdHoc" && HIDDEN_FEATURES.scheduleFullDayMultipleDates);
}

const TIME_OPTIONS_AMPM = Array.from({ length: 24 }, (_, h) => {
  const suffix = h < 12 ? "AM" : "PM";
  return [`${String(h).padStart(2, "0")}:00 ${suffix}`, `${String(h).padStart(2, "0")}:30 ${suffix}`];
}).flat();

export function formatScheduleDate(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
const formatDate = formatScheduleDate;

export interface CoursewareSchedule {
  scheduleType: ScheduleTypeId | null;
  singleDate: Date | null;
  range: { start: Date | null; end: Date | null } | null;
  startTime: string;
  endTime: string;
}

const EMPTY_SCHEDULE: CoursewareSchedule = {
  scheduleType: null, singleDate: null, range: null, startTime: "", endTime: "",
};

export function isRangeType(type: ScheduleTypeId | null) {
  return type === "FullDayMultiple" || type === "AdHoc";
}

function summaryFor(sch: CoursewareSchedule): string | null {
  if (!sch.scheduleType) return null;
  const opt = SCHEDULE_TYPE_OPTIONS.find((o) => o.id === sch.scheduleType)!;
  const label = sch.scheduleType === "FullDaySingle" || sch.scheduleType === "FullDayMultiple" ? "Full Day" : sch.scheduleType === "AdHoc" ? "Ad-hoc" : opt.label;
  if (isRangeType(sch.scheduleType)) {
    if (!sch.range?.start) return null;
    // Ad-hoc includes the start/end time per courseware in its summary
    // (confirmed against Figma's "Schedule - Adhoc - Filled" frame — e.g.
    // "Ad-hoc · 24 Nov 2025 08:00 AM - 26 Nov 2025 05:00 PM").
    const startPart = sch.scheduleType === "AdHoc" && sch.startTime ? `${formatDate(sch.range.start)} ${sch.startTime}` : formatDate(sch.range.start);
    if (!sch.range.end) return `${label} · ${startPart}`;
    const endPart = sch.scheduleType === "AdHoc" && sch.endTime ? `${formatDate(sch.range.end)} ${sch.endTime}` : formatDate(sch.range.end);
    return `${label} · ${startPart} - ${endPart}`;
  }
  if (!sch.singleDate) return null;
  return `${label} · ${formatDate(sch.singleDate)}`;
}

function isComplete(sch: CoursewareSchedule): boolean {
  if (!sch.scheduleType) return false;
  if (isRangeType(sch.scheduleType)) {
    if (!sch.range?.start || !sch.range?.end) return false;
    if (sch.scheduleType === "AdHoc") return !!sch.startTime && !!sch.endTime;
    return true;
  }
  return !!sch.singleDate;
}

// Plain time-select dropdown, local to this file (not the shared CustomSelect,
// which has no invalid/error styling hook — this one does).
function TimeSelect({ value, onChange, onTouched, placeholder, invalid }: {
  value: string;
  onChange: (v: string) => void;
  onTouched: () => void;
  placeholder: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open) onTouched();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white transition-colors",
          invalid ? "border-figma-danger" : open ? "border-figma-primary" : "border-figma-subtle hover:border-figma-strong",
          value ? "text-figma-default" : "text-figma-disabled"
        )}
      >
        <span>{value || placeholder}</span>
        <Icon name="chevron-down" size={14} className="text-figma-disabled" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-figma-subtle rounded-lg shadow-lg overflow-y-auto max-h-56">
          {TIME_OPTIONS_AMPM.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false); onTouched(); }}
              className="w-full text-left px-4 py-2 text-sm text-figma-default hover:bg-figma-soft"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Figma `Input-Summary (Read Only)` under Date Slot (5029:69716 / 5314:52268 / 8032:153911):
// grey `background/default/default` box, 16px padding, two Key Value rows (14 Regular
// `text/body` title, 14 SemiBold value), and on Insufficient a danger `Alert` below them.
function StationAvailabilityPanel({ required, schedule, onEditQuantity }: {
  required: StationCount;
  schedule: CoursewareSchedule;
  onEditQuantity?: () => void;
}) {
  const free = availabilityFor(schedule);
  const sufficient = !!free && free.flat >= required.flat && free.cshaped >= required.cshaped;
  return (
    <div className="space-y-4 rounded-lg bg-default-default p-4 text-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body">Required Base Station(s)</span>
          <span className="font-semibold text-default">{required.flat} Flat Screen · {required.cshaped} C-Shaped</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-body">Availability on Select Date Slot</span>
          {!free ? (
            <span className="font-semibold text-default">Select a date to check availability</span>
          ) : sufficient ? (
            <span className="flex items-center gap-2 font-semibold text-default">
              {free.flat} Flat Screen, {free.cshaped} C-Shaped
              <StatusBadge tone="success" className="gap-1 pl-1 pr-2">
                <Icon name="check" size={14} />
                Sufficient
              </StatusBadge>
            </span>
          ) : (
            <span className="flex items-center gap-2 font-semibold text-danger">
              {free.flat} Flat Screen · {free.cshaped} C-Shaped
              <StatusBadge tone="danger" className="gap-1 pl-1 pr-2">
                <Icon name="circle-alert" size={14} />
                Insufficient
              </StatusBadge>
            </span>
          )}
        </div>
      </div>
      {free && !sufficient && (
        <Alert
          status="danger"
          message={
            <>
              Insufficient base stations. You can choose another date or{" "}
              <button type="button" onClick={onEditQuantity} className="text-link">edit quantity</button>
              {" "}in Booking Details.
            </>
          }
        />
      )}
    </div>
  );
}

export function ScheduleStep({ onUpdate, onAllSchedulesChange, onAllCompleteChange, bookingCourseware, isIndividual = false, showErrors = false, requiredStations, onEditQuantity }: {
  /** Per-courseware Flat Screen / C-Shaped counts from Step 1 — shows the availability panel (Group only). */
  requiredStations?: Record<string, StationCount>;
  /** "edit quantity" link in the Insufficient alert — back to Booking Details. */
  onEditQuantity?: () => void;
  onUpdate: (s: ScheduleSnapshot) => void;
  onAllSchedulesChange?: (schedules: Record<string, CoursewareSchedule>) => void;
  onAllCompleteChange?: (allComplete: boolean) => void;
  bookingCourseware?: string;
  isIndividual?: boolean;
  showErrors?: boolean;
}) {
  const coursewareList = isIndividual
    ? ["Booking"]
    : (bookingCourseware ? bookingCourseware.split(",").map((c) => c.trim()).filter(Boolean) : []);

  const [schedules, setSchedules] = useState<Record<string, CoursewareSchedule>>(
    () => Object.fromEntries(coursewareList.map((cw) => [cw, { ...EMPTY_SCHEDULE }]))
  );
  const [active, setActive] = useState(coursewareList[0] ?? "");
  const [touched, setTouched] = useState<Record<string, { dateSlot?: boolean; startTime?: boolean; endTime?: boolean }>>({});

  const current = schedules[active] ?? EMPTY_SCHEDULE;
  const currentTouched = touched[active] ?? {};

  useEffect(() => {
    onAllSchedulesChange?.(schedules);
    onAllCompleteChange?.(coursewareList.every((cw) => isComplete(schedules[cw] ?? EMPTY_SCHEDULE)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const incompleteCount = coursewareList.filter((cw) => !isComplete(schedules[cw] ?? EMPTY_SCHEDULE)).length;

  const updateCurrent = (patch: Partial<CoursewareSchedule>) => {
    setSchedules((prev) => {
      const next = { ...prev, [active]: { ...(prev[active] ?? EMPTY_SCHEDULE), ...patch } };
      // Bubble a representative snapshot up — Booking 2.0 still uses the same
      // single ScheduleSnapshot shape as the current WPT flow's Review modal,
      // which is reused unmodified and isn't courseware-aware.
      const sch = next[active];
      onUpdate({
        scheduleType: sch.scheduleType === "AM" ? "AM Session" : sch.scheduleType === "PM" ? "PM Session" : sch.scheduleType === "AdHoc" ? "Ad-hoc" : sch.scheduleType ? "FullDay" : null,
        section: sch.scheduleType === "FullDayMultiple" ? "Multiple Days" : sch.scheduleType === "FullDaySingle" ? "Single Day" : null,
        briefing: false,
        selectedDate: sch.singleDate,
        dateRangeStart: sch.range?.start ?? null,
        dateRangeEnd: sch.range?.end ?? null,
        startTime: sch.startTime,
        endTime: sch.endTime,
      });
      return next;
    });
  };

  const markTouched = (field: "dateSlot" | "startTime" | "endTime") => {
    setTouched((prev) => ({ ...prev, [active]: { ...(prev[active] ?? {}), [field]: true } }));
  };

  const rangeMode = calendarIsRange(current.scheduleType);
  const calendarValue: CalendarValue = rangeMode ? current.range : current.singleDate;

  const dateSlotInvalid = !!currentTouched.dateSlot && (rangeMode ? !current.range?.start : !current.singleDate);
  const startTimeInvalid = !!currentTouched.startTime && !current.startTime;
  const endTimeInvalid = !!currentTouched.endTime && !current.endTime;

  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {showErrors && incompleteCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-figma-dangerbg border border-figma-danger text-sm text-figma-danger">
            <Icon name="circle-alert" size={16} className="flex-shrink-0" />
            <span>
              {incompleteCount} courseware{incompleteCount === 1 ? "" : "s"} isn&rsquo;t ready to submit.{" "}
              <button type="button" onClick={() => setActive(coursewareList.find((cw) => !isComplete(schedules[cw] ?? EMPTY_SCHEDULE)) ?? active)} className="text-figma-link underline font-medium">
                Review issue
              </button>
            </span>
          </div>
        )}
        <div className="flex gap-6 items-start">
        <div className="w-72 flex-shrink-0 bg-white border border-figma-subtle rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-figma-subtle">
            <h3 className="text-base font-bold text-figma-default">Courseware ({coursewareList.length})</h3>
          </div>
          {coursewareList.map((cw) => {
            const sch = schedules[cw] ?? EMPTY_SCHEDULE;
            const summary = summaryFor(sch);
            const complete = isComplete(sch);
            const isActive = cw === active;
            const invalid = showErrors && !complete;
            return (
              <button
                key={cw}
                type="button"
                onClick={() => setActive(cw)}
                className={cn(
                  "w-full text-left px-4 py-3 border-l-4 transition-colors flex items-start justify-between gap-2",
                  isActive ? "border-figma-primary bg-figma-primarysoft" : "border-transparent hover:bg-figma-soft"
                )}
              >
                <div className="min-w-0">
                  <p className={cn("text-sm truncate", isActive ? "font-bold text-figma-default" : "font-medium text-figma-default")}>{cw}</p>
                  <p className={cn("text-xs mt-0.5", invalid ? "text-figma-danger" : complete ? "text-green-600" : "text-figma-body")}>
                    {invalid ? "Schedule is required" : (summary ?? "Not scheduled yet")}
                  </p>
                </div>
                {complete ? (
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="check" size={12} className="text-white" />
                  </span>
                ) : invalid ? (
                  <Icon name="circle-alert" size={18} className="text-figma-danger flex-shrink-0 mt-0.5" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 bg-white border border-figma-subtle rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-figma-default">{active}</h2>
            <p className="text-xs text-figma-body mt-0.5">Configure this courseware's training schedule</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-figma-default mb-2">Schedule Type <span className="text-figma-danger">*</span></label>
            <div className="space-y-2.5">
              {visibleScheduleOptions().map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                  <span
                    onClick={() => updateCurrent({ scheduleType: opt.id, singleDate: null, range: null, startTime: "", endTime: "" })}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                      current.scheduleType === opt.id ? "border-figma-primary" : showErrors && !current.scheduleType ? "border-figma-danger" : "border-figma-strong"
                    )}
                  >
                    {current.scheduleType === opt.id && <span className="w-2 h-2 rounded-full bg-figma-primary" />}
                  </span>
                  <span className="text-sm text-figma-default" onClick={() => updateCurrent({ scheduleType: opt.id, singleDate: null, range: null, startTime: "", endTime: "" })}>
                    {opt.label} <span className="text-figma-disabled">({opt.range})</span>
                  </span>
                </label>
              ))}
            </div>
            {showErrors && !current.scheduleType && (
              <p className="text-xs text-figma-danger mt-2">Schedule Type is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-figma-default mb-1.5">Date Slot <span className="text-figma-danger">*</span></label>
            <CalendarPicker
              mode={rangeMode ? "range" : "single"}
              value={calendarValue}
              invalid={dateSlotInvalid}
              disabled={!current.scheduleType}
              placeholder="Select Date Slot"
              onConfirm={(v) => {
                markTouched("dateSlot");
                if (rangeMode) updateCurrent({ range: v as { start: Date | null; end: Date | null } });
                else if (current.scheduleType === "AdHoc") {
                  // Single-date Ad-hoc is stored as a one-day range so summary / Review / the saved
                  // booking keep reading start & end the way they do for the range version.
                  const d = v as Date | null;
                  updateCurrent({ singleDate: d, range: d ? { start: d, end: d } : null });
                } else updateCurrent({ singleDate: v as Date | null });
              }}
            />
            {!current.scheduleType && (
              <p className="text-xs text-figma-caption mt-1.5">Select a schedule type to continue</p>
            )}
          </div>

          {current.scheduleType === "AdHoc" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-figma-default mb-1.5">Start Time <span className="text-figma-danger">*</span></label>
                <TimeSelect
                  value={current.startTime}
                  onChange={(v) => updateCurrent({ startTime: v })}
                  onTouched={() => markTouched("startTime")}
                  placeholder="Select Start Time"
                  invalid={startTimeInvalid}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figma-default mb-1.5">End Time <span className="text-figma-danger">*</span></label>
                <TimeSelect
                  value={current.endTime}
                  onChange={(v) => updateCurrent({ endTime: v })}
                  onTouched={() => markTouched("endTime")}
                  placeholder="Select End Time"
                  invalid={endTimeInvalid}
                />
              </div>
            </div>
          )}

          {requiredStations?.[active] && (
            <StationAvailabilityPanel required={requiredStations[active]} schedule={current} onEditQuantity={onEditQuantity} />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
