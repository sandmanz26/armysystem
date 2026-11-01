import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";
import { Toggle } from "@/components/toggle";
import { Link } from "@/components/link";
import { bookings } from "@/data/mock";
import { TIME_OPTIONS } from "../constants";
import {
  INITIAL_BLACKOUT_VALUES,
  describeBlackout,
  findConflicts,
  timeToMinutes,
  type BlackoutFormValues,
} from "../blackoutRules";
import { DateField } from "./DateField";
import { RepeatFields } from "./RepeatFields";
import { BlackoutSummary } from "./BlackoutSummary";
import { BlackoutConflicts } from "./BlackoutConflicts";

export type { BlackoutFormValues } from "../blackoutRules";

/*
 * Add New Blackout Date — Figma `Action - Add Blackout Date` on Site Management Details
 * (`5112:111649`, section `5116:216631`). Redesigned since the One-time / Recurring chip
 * version: the form now works like a calendar event.
 *
 *   Drawer 512 · title "Add New Blackout Date" · footer Cancel (80) + "Add Blackout Date" (158)
 *   Content, 20px padding, blocks 32px apart:
 *     Date *  [+ Add End Date]   or   Date * – End Date  [Remove End Date]   — 12px under:
 *       Start Time – End Time (selects, no labels)                           — hidden by All day
 *       ◯ All day
 *     Repeat * (+ Custom card, + Ends * once it repeats)      → RepeatFields
 *     Summary                                                 → BlackoutSummary
 *     "N existing bookings overlap this blackout" alert       → BlackoutConflicts
 *
 * Frames: Add - Filled 5116:216639 · … - Expand 7973:31583 · Add End Date 7973:28867 ·
 * All Day 7973:29156 · Annual 7973:29431 · Custom - Day/Week/Month/Year · dropdown frames
 * (Start Date 5117:267056, Time 5117:267185, Repeat 7973:20592, Ends 7973:30302,
 * Repeat Every 7974:33065, Month Settings 7974:35397) · Toast - Success 5116:216634.
 *
 * Figma now draws no empty or error frames for this screen. The captions below are therefore
 * ours, except the ones that carry over word for word from the earlier error frames
 * ("Start Time is required", "End Time is required", "Select at least one recurring day").
 */

interface AddBlackoutDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BlackoutFormValues) => void;
  /** The base station the blackout belongs to — bookings assigned to it can overlap. */
  stationName: string;
}

const isOneTimeWithEnd = (has: boolean, repeat: string) => has && repeat === "none";

const schema = Yup.object().shape({
  startDate: Yup.string().required("Date is required"),
  endDate: Yup.string().when(["hasEndDate", "repeat"], {
    is: isOneTimeWithEnd,
    then: (s) =>
      s.required("End Date is required").test(
        "not-before-start",
        "End Date must be on or after Date",
        function (value) {
          const start = this.parent.startDate as string;
          return !value || !start || value >= start;
        },
      ),
    otherwise: (s) => s,
  }),
  startTime: Yup.string().when("allDay", {
    is: false,
    then: (s) => s.required("Start Time is required"),
    otherwise: (s) => s,
  }),
  endTime: Yup.string().when("allDay", {
    is: false,
    then: (s) =>
      s.required("End Time is required").test(
        "after-start-time",
        "End Time must be after Start Time",
        function (value) {
          const { startTime, startDate, endDate, hasEndDate, repeat } = this.parent;
          const sameDay = !isOneTimeWithEnd(hasEndDate, repeat) || !endDate || endDate === startDate;
          const a = timeToMinutes(startTime ?? "");
          const b = timeToMinutes(value ?? "");
          return !sameDay || a === null || b === null || b > a;
        },
      ),
    otherwise: (s) => s,
  }),
  weekdays: Yup.array().when(["repeat", "unit"], {
    is: (repeat: string, unit: string) => repeat === "custom" && unit === "week",
    then: (s) => s.min(1, "Select at least one recurring day"),
    otherwise: (s) => s,
  }),
  endsAfter: Yup.mixed().when(["repeat", "endsKind"], {
    is: (repeat: string, kind: string) => repeat !== "none" && kind === "after",
    then: (s) =>
      s.test(
        "at-least-one",
        "Enter at least 1",
        (v) => Number.isFinite(Number(v)) && String(v ?? "") !== "" && Math.floor(Number(v)) >= 1,
      ),
    otherwise: (s) => s,
  }),
  endsOnDate: Yup.string().when(["repeat", "endsKind"], {
    is: (repeat: string, kind: string) => repeat !== "none" && kind === "onDate",
    then: (s) =>
      s.required("End date is required").test(
        "not-before-start",
        "End date must be on or after Date",
        function (value) {
          const start = this.parent.startDate as string;
          return !value || !start || value >= start;
        },
      ),
    otherwise: (s) => s,
  }),
});

export function AddBlackoutDrawer({ open, onClose, onSubmit, stationName }: AddBlackoutDrawerProps) {
  // Unmounted while closed, so Cancel → reopen starts from a clean form.
  if (!open) return null;

  return (
    <Formik<BlackoutFormValues>
      initialValues={INITIAL_BLACKOUT_VALUES}
      validationSchema={schema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ values, errors, touched, setFieldValue, setFieldTouched, submitForm }) => {
        const err = (k: keyof BlackoutFormValues) =>
          touched[k] && errors[k] ? (errors[k] as string) : undefined;
        const status = (k: keyof BlackoutFormValues) => (err(k) ? "danger" : "default");

        const summary = describeBlackout(values);
        const conflicts = findConflicts(values, stationName, bookings);
        const oneTime = values.repeat === "none";
        const showEnd = oneTime && values.hasEndDate;

        const toggleEndDate = () => {
          setFieldValue("hasEndDate", !values.hasEndDate);
          setFieldValue("endDate", "");
        };

        return (
          <Drawer
            open={open}
            onClose={onClose}
            title="Add New Blackout Date"
            width={512}
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  Add Blackout Date
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-8">
              {/* Start Date block — Date row, time row, All day */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="flex items-end gap-3">
                    <DateField
                      name="startDate"
                      label="Date"
                      required
                      wrapperClassName="min-w-0 flex-1"
                      value={values.startDate}
                      onChange={(iso) => setFieldValue("startDate", iso)}
                      onBlur={() => setFieldTouched("startDate", true)}
                      status={status("startDate")}
                      caption={err("startDate")}
                    />
                    {showEnd && (
                      <>
                        <span className="flex h-10 items-center text-sm text-default">–</span>
                        <DateField
                          name="endDate"
                          wrapperClassName="min-w-0 flex-1"
                          value={values.endDate}
                          onChange={(iso) => setFieldValue("endDate", iso)}
                          onBlur={() => setFieldTouched("endDate", true)}
                          status={status("endDate")}
                          caption={err("endDate")}
                        />
                      </>
                    )}
                  </div>
                  {oneTime && (
                    <Link
                      className="absolute right-0 top-0"
                      prefixIcon={values.hasEndDate ? "trash-2" : "plus"}
                      onClick={toggleEndDate}
                    >
                      {values.hasEndDate ? "Remove End Date" : "Add End Date"}
                    </Link>
                  )}
                </div>

                {!values.allDay && (
                  <div className="flex items-start gap-3">
                    <Select
                      wrapperClassName="min-w-0 flex-1"
                      options={TIME_OPTIONS}
                      value={values.startTime}
                      onChange={(v) => setFieldValue("startTime", v)}
                      placeholder="Select Start Time"
                      listMaxHeight={264}
                      status={status("startTime")}
                      caption={err("startTime")}
                    />
                    <span className="flex h-10 items-center text-sm text-default">–</span>
                    <Select
                      wrapperClassName="min-w-0 flex-1"
                      options={TIME_OPTIONS}
                      value={values.endTime}
                      onChange={(v) => setFieldValue("endTime", v)}
                      placeholder="Select End Time"
                      listMaxHeight={264}
                      status={status("endTime")}
                      caption={err("endTime")}
                    />
                  </div>
                )}

                <Toggle
                  checked={values.allDay}
                  onChange={(next) => setFieldValue("allDay", next)}
                  inlineLabel="All day"
                />
              </div>

              <RepeatFields
                values={values}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                err={err}
              />

              {summary && <BlackoutSummary summary={summary} />}
              <BlackoutConflicts rows={conflicts} />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}
