import { useState, type ReactNode } from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/input";
import { Radio } from "@/components/radio";
import { Toast } from "@/components/toast";
import type { GeneralSettingsValues } from "../types";
import { SaveChangesButton } from "./SettingsPanel";

/**
 * Figma `General` page (`7033:691121`): `General` (5029:6257, clean — Save
 * Changes disabled), `Change Setting` (5029:6216, edited — Save Changes
 * enabled) and `Toast - Saved` (5029:6237, "Changes updated" top-right).
 *
 * One form replaces the seven panels that used to be separate menu items
 * (Individual Booking, Mask Service ID, Auto-Archive Setting, HUMS Interval and the
 * RFID / Armskote / Missing Transition Rules). Same defaults, same validation
 * ("Required", "Must be at least 1") as those panels had.
 *
 * Layout (1096 body, gap 24):
 *   Row 1  Booking · Privacy               536 + 536, each 164 tall
 *   Row 2  Data Retention · Timers         536 + 536, each 148 tall, input 242
 *   Card   Staging Only                    RFID · Armskote / Missing, inputs 522
 *
 * Saved values are owned by the Settings page so they survive switching menus.
 */

const positiveNumber = Yup.number()
  .typeError("Required")
  .required("Required")
  .min(1, "Must be at least 1");

const schema = Yup.object().shape({
  archiveDays: positiveNumber,
  humsInterval: positiveNumber,
  rfidTransition: positiveNumber,
  armskoteTransition: positiveNumber,
  missingTransition: positiveNumber,
});

/** Figma `Section Layout` — header 64 (padding 20), content padding 0 20 20. */
function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex-1 min-w-0 rounded-xl border border-invert-default bg-surface-lv1">
      <h2 className="p-5 text-base font-semibold text-default">{title}</h2>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

/** Figma `Radio Group`: label 14 Medium, Enabled/Disabled row (gap 20), 12px caption. */
function EnabledRadioGroup({
  name,
  label,
  caption,
}: {
  name: "individualBooking" | "maskSvcId";
  label: string;
  caption: string;
}) {
  const [field, , helpers] = useField<boolean>(name);
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-1">
      <span className="text-sm font-medium text-default">{label}</span>
      <div className="flex items-center gap-5">
        <Radio
          name={name}
          value="enabled"
          checked={field.value === true}
          onChange={() => helpers.setValue(true)}
          label="Enabled"
        />
        <Radio
          name={name}
          value="disabled"
          checked={field.value === false}
          onChange={() => helpers.setValue(false)}
          label="Disabled"
        />
      </div>
      <p className="text-xs text-caption">{caption}</p>
    </div>
  );
}

type NumberField = Exclude<keyof GeneralSettingsValues, "individualBooking" | "maskSvcId">;

/** Figma `Input` md: label 14 Medium, 40-tall box; Yup error as danger caption. */
function NumberInput({ name, label, className }: { name: NumberField; label: string; className?: string }) {
  const [field, meta] = useField<string>(name);
  const error = meta.touched && meta.error ? meta.error : undefined;
  return (
    <Input
      {...field}
      type="number"
      min={1}
      label={label}
      status={error ? "danger" : "default"}
      caption={error}
      wrapperClassName={className}
    />
  );
}

export function GeneralSettings({
  saved,
  onSave,
}: {
  saved: GeneralSettingsValues;
  onSave: (values: GeneralSettingsValues) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <Formik<GeneralSettingsValues>
        initialValues={saved}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          onSave(values);
          resetForm({ values });
          setToast("Changes updated");
        }}
      >
        {({ dirty }) => (
          <Form className="space-y-6">
            {/* Page Header — 1096×40, Save Changes in the Right Content slot */}
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-xl font-semibold text-default">General Settings</h1>
              <SaveChangesButton type="submit" disabled={!dirty} />
            </div>

            <div className="flex gap-6">
              <SectionCard title="Booking">
                <EnabledRadioGroup
                  name="individualBooking"
                  label="Individual Booking"
                  caption="Configure whether individual training bookings can be created in the system."
                />
              </SectionCard>
              <SectionCard title="Privacy">
                <EnabledRadioGroup
                  name="maskSvcId"
                  label="Mask Service ID"
                  caption="Configure whether Service ID numbers are masked in the system."
                />
              </SectionCard>
            </div>

            <div className="flex gap-6">
              <SectionCard title="Data Retention">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput name="archiveDays" label="Archive after (days)" />
                </div>
              </SectionCard>
              <SectionCard title="Timers">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput name="humsInterval" label="HUMS Interval (seconds)" />
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Staging Only">
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                <NumberInput name="rfidTransition" label="RFID Transition Time (seconds)" />
                <NumberInput name="armskoteTransition" label="Armskote Transition Time (seconds)" />
                <NumberInput name="missingTransition" label="Missing Transition Time (seconds)" />
              </div>
            </SectionCard>
          </Form>
        )}
      </Formik>
      <Toast
        message={toast ?? ""}
        open={!!toast}
        onDismiss={() => setToast(null)}
        placement="top-right"
      />
    </>
  );
}
