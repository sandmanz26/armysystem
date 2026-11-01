import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { Radio } from "@/components/radio";
import { Select } from "@/components/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DateField } from "@/pages-tsx/site-management/modals/DateField";
import { cn } from "@/lib/utils";

/*
 * Booking 2.0 — Reschedule (Upcoming bookings only). Figma section `Action - Reschedule` on the
 * Booking Details page (5029:40418):
 *   entry      ⋮ menu → "Reschedule"                                   5499:19921
 *   page       full-screen: ✕ · "Reschedule" + "#id · programme · courseware" · Confirm
 *              left card "Current Booking Time" (Schedule Type / Date Slot)
 *              right card "New Booking Time": Schedule Type radios, Date Slot, (Ad-hoc) Start/End
 *              Time, then the grey "Required Base Station(s) / Availability" panel
 *                                                                        5512:177513, 5513:253206
 *   confirm    "Reschedule {courseware}?" — From / To bullets · Cancel / Reschedule  5513:254637
 *   toast      "{courseware} rescheduled to {date}, {session}"           5513:182264
 * Availability is mock data in this prototype: the booking's own stations are reported as free.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type ScheduleId = "AM" | "PM" | "FullDay" | "AdHoc";

const SCHEDULE_OPTIONS: { id: ScheduleId; label: string; short: string; time: string }[] = [
  { id: "AM", label: "AM Session (08:00 AM - 12:00 PM)", short: "AM Session", time: "08:00 AM - 12:00 PM" },
  { id: "PM", label: "PM Session (01:00 PM - 05:00 PM)", short: "PM Session", time: "01:00 PM - 05:00 PM" },
  { id: "FullDay", label: "Full Day (Single date, 08:00 AM - 05:00 PM)", short: "Full Day", time: "08:00 AM - 05:00 PM" },
  { id: "AdHoc", label: "Ad-hoc Schedule (Single date with flexible time)", short: "Ad-hoc", time: "" },
];

/** 08:00 AM … 05:00 PM in 30-minute steps — the training-day window used by the other slots. */
const TIME_OPTIONS = Array.from({ length: 19 }, (_, i) => {
  const mins = 8 * 60 + i * 30;
  const h24 = Math.floor(mins / 60);
  const h12 = h24 > 12 ? h24 - 12 : h24;
  return `${String(h12).padStart(2, "0")}:${mins % 60 === 0 ? "00" : "30"} ${h24 < 12 ? "AM" : "PM"}`;
});
const minutesOf = (t: string) => {
  const m = t.match(/^(\d{2}):(\d{2}) (AM|PM)$/);
  if (!m) return 0;
  const h = (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
};

const isoToLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : "";
};

interface Values {
  scheduleType: ScheduleId | "";
  date: string;
  startTime: string;
  endTime: string;
}

const schema = Yup.object({
  scheduleType: Yup.string().required("Schedule Type is required"),
  date: Yup.string().required("Date Slot is required"),
  startTime: Yup.string().when("scheduleType", { is: "AdHoc", then: (s) => s.required("Start Time is required") }),
  endTime: Yup.string().when("scheduleType", {
    is: "AdHoc",
    then: (s) =>
      s.required("End Time is required").test("after", "End Time must be after Start Time", function (v) {
        return !v || !this.parent.startTime || minutesOf(v) > minutesOf(this.parent.startTime);
      }),
  }),
});

/** The new schedule as the detail page stores it: the `bookingTime` two-line shape of the mock. */
export interface RescheduleResult {
  bookingTime: string;
  toast: string;
}

interface Props {
  bookingId: string;
  program: string;
  courseware: string;
  /** Current schedule, already formatted: "02 Jun 2026" and "AM Session (08:00 AM - 12:00 PM)". */
  currentDate: string;
  currentTime: string;
  flatStations: number;
  cShapedStations: number;
  onClose: () => void;
  onConfirm: (r: RescheduleResult) => void;
}

function describe(v: Values) {
  const opt = SCHEDULE_OPTIONS.find((o) => o.id === v.scheduleType)!;
  const time = opt.id === "AdHoc" ? `${v.startTime} - ${v.endTime}` : opt.time;
  return { date: isoToLabel(v.date), short: opt.short, time };
}

export function RescheduleView({
  bookingId, program, courseware, currentDate, currentTime, flatStations, cShapedStations, onClose, onConfirm,
}: Props) {
  const [pending, setPending] = useState<Values | null>(null);
  const required = `${flatStations} Flat Screen · ${cShapedStations} C-Shaped`;
  const available = `${flatStations} Flat Screen, ${cShapedStations} C-Shaped`;
  const [currentType, currentRange] = currentTime.match(/^(.+?) \((.+)\)$/)?.slice(1) ?? [currentTime, ""];

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-default-soft">
      <Formik<Values>
        initialValues={{ scheduleType: "", date: "", startTime: "", endTime: "" }}
        validationSchema={schema}
        onSubmit={(values) => setPending(values)}
      >
        {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit }) => {
          const err = (k: keyof Values) => (touched[k] && errors[k] ? errors[k] : undefined);
          return (
            <>
              {/* Header — ✕ (40px, round), centred title + context line, Confirm on the right. */}
              <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-soft"
                >
                  <Icon name="x" size={18} />
                </button>
                <div className="text-center">
                  <p className="text-base font-semibold leading-6 text-default">Reschedule</p>
                  <p className="text-xs leading-4 text-body">
                    <span className="text-default">#{bookingId.replace(/^#/, "")}</span> · <span className="text-default">{program}</span> · {courseware}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered"
                >
                  Confirm
                </button>
              </header>

              <div className="flex flex-1 items-start gap-6 overflow-auto p-6">
                <section className="w-[288px] shrink-0 rounded-xl border border-invert-default bg-surface p-5">
                  <h2 className="text-base font-semibold leading-6 text-default">Current Booking Time</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs leading-4 text-body">Schedule Type</p>
                      <p className="text-sm font-semibold leading-5 text-default">
                        {currentType}{currentRange && ` (${currentRange})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs leading-4 text-body">Date Slot</p>
                      <p className="text-sm font-semibold leading-5 text-default">{currentDate}</p>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 flex-1 rounded-xl border border-invert-default bg-surface p-5">
                  <h2 className="text-base font-semibold leading-6 text-default">New Booking Time</h2>

                  <div className="mt-4">
                    <p className="text-sm font-medium leading-5 text-default">
                      Schedule Type <span className="text-danger">*</span>
                    </p>
                    <div className="mt-1">
                      {SCHEDULE_OPTIONS.map((o) => (
                        <Radio
                          key={o.id}
                          name="scheduleType"
                          value={o.id}
                          label={o.label}
                          checked={values.scheduleType === o.id}
                          onChange={(v) => setFieldValue("scheduleType", v)}
                        />
                      ))}
                    </div>
                    {err("scheduleType") && <p className="mt-1 text-xs text-danger">{err("scheduleType")}</p>}
                  </div>

                  <div className="mt-4">
                    <DateField
                      name="date"
                      label="Date Slot"
                      required
                      value={values.date}
                      onChange={(iso) => setFieldValue("date", iso)}
                      onBlur={() => setFieldTouched("date", true)}
                      status={err("date") ? "danger" : "default"}
                      caption={err("date")}
                    />
                  </div>

                  {values.scheduleType === "AdHoc" && (
                    <div className="mt-4 grid grid-cols-2 gap-5">
                      <Select
                        label="Start Time"
                        required
                        placeholder="Select Start Time"
                        options={TIME_OPTIONS}
                        value={values.startTime}
                        onChange={(v) => setFieldValue("startTime", v)}
                        status={err("startTime") ? "danger" : "default"}
                        caption={err("startTime")}
                      />
                      <Select
                        label="End Time"
                        required
                        placeholder="Select End Time"
                        options={TIME_OPTIONS}
                        value={values.endTime}
                        onChange={(v) => setFieldValue("endTime", v)}
                        status={err("endTime") ? "danger" : "default"}
                        caption={err("endTime")}
                      />
                    </div>
                  )}

                  <div className="mt-6 space-y-2 rounded-lg bg-default-default px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-body">Required Base Station(s)</span>
                      <span className="font-semibold text-default">{required}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body">Availability on Select Date Slot</span>
                      <span className="flex items-center gap-2 font-semibold text-default">
                        {available}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
                            "bg-success-invert-default border-invert-success text-success",
                          )}
                        >
                          <Icon name="check" size={12} />
                          Sufficient
                        </span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          );
        }}
      </Formik>

      {pending && (() => {
        const to = describe(pending);
        return (
          <ConfirmDialog
            open
            tone="warning"
            title={`Reschedule ${courseware}?`}
            subtitle={
              <>
                This will move the session:
                <ul className="mt-1 list-disc pl-5">
                  <li>
                    From: <span className="font-semibold text-default">{currentDate}, {currentType}</span>
                    {currentRange && <> ({currentRange})</>}
                  </li>
                  <li>
                    To: <span className="font-semibold text-default">{to.date}, {to.short}</span> ({to.time})
                  </li>
                </ul>
              </>
            }
            confirmLabel="Reschedule"
            onCancel={() => setPending(null)}
            onConfirm={() => {
              const timeLine = to.short === "Ad-hoc" ? `Ad-hoc (${to.time})` : `${to.short} (${to.time})`;
              onConfirm({
                bookingTime: `${to.date}\n${timeLine}`,
                toast: `${courseware} rescheduled to ${to.date}, ${to.short}`,
              });
            }}
          />
        );
      })()}
    </div>
  );
}
