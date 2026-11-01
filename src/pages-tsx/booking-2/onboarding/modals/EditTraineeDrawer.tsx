// Booking 2.0 Onboarding — "Edit Trainee" / "Add Trainee" drawer, per the
// reference screenshots. Local to booking-2/onboarding: same field set as
// booking-2/create's AddTraineeDrawer, PLUS a "Base Station Type" toggle
// (Flat Screen/C-Shaped) shown only when the booking has both station types
// — needed here (and not at booking-time) because a walk-in scanned during
// Onboarding has to be filed into the correct Nominal Roll (flat vs cshaped)
// list. A new file rather than modifying the shared AddTraineeDrawer, per
// the Booking 2.0 rule of never touching a shared component for an
// onboarding-only need.
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { RANK_OPTIONS } from "@/pages-tsx/booking-2/create/nominalRollTypes";
import type { OnboardingTrainee } from "../types";

function FieldSelect({ label, value, onChange, options, placeholder, required = true }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label} {required && <span className="text-figma-primary">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn("w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white", open ? "border-figma-primary" : "border-gray-200", value ? "text-gray-800" : "text-gray-400")}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-52">
            {options.map((o) => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {o}
                {value === o && <Check size={13} className="text-figma-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FormValues {
  name: string;
  rank: string;
  svcId: string;
  platoon: string;
  stationType: "flat" | "cshaped" | "";
  role: string;
  weapon: string;
}

function schemaFor(hasCShaped: boolean) {
  return Yup.object().shape({
    name: Yup.string().required("Trainee Name is required"),
    rank: Yup.string().required("Rank is required"),
    svcId: Yup.string().required("Service ID is required"),
    platoon: Yup.string().required("Platoon Number is required"),
    stationType: hasCShaped ? Yup.string().required("Base Station Type is required") : Yup.string(),
    role: Yup.string().required("Role is required"),
    weapon: Yup.string().required("Weapon Type is required"),
  });
}

interface EditTraineeDrawerProps {
  mode: "add" | "edit";
  initial?: OnboardingTrainee;
  unitName: string;
  roleOptions: string[];
  weaponOptions: string[];
  hasCShaped: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; rank: string; svcId: string; platoon: string; role: string; weapon: string[]; stationType?: "flat" | "cshaped" }) => void;
}

export function EditTraineeDrawer({ mode, initial, unitName, roleOptions, weaponOptions, hasCShaped, onClose, onSubmit }: EditTraineeDrawerProps) {
  return (
    <>
      <div className="fixed inset-0 z-[2300] bg-black/30" onClick={onClose} />
      <Formik<FormValues>
        initialValues={{
          name: initial?.name ?? "",
          rank: initial?.rank ?? "",
          svcId: initial?.svcId ?? "",
          platoon: initial?.platoon ?? "",
          stationType: initial?.stationType ?? "",
          role: initial?.role ?? "",
          weapon: initial?.weapon[0] ?? "",
        }}
        validationSchema={schemaFor(hasCShaped)}
        onSubmit={(values) => onSubmit({ ...values, weapon: [values.weapon], stationType: values.stationType || undefined })}
      >
        {({ values, setFieldValue, submitForm }) => (
          <div className="fixed inset-y-0 right-0 z-[2400] w-[440px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{mode === "add" ? "Add Trainee" : "Edit Trainee"}</h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <Form className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Trainee Name <span className="text-figma-primary">*</span></label>
                <InputCustom
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                  placeholder="Enter Trainee Name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-figma-primary focus:border-figma-primary"
                />
              </div>

              <FieldSelect label="Rank" value={values.rank} onChange={(v) => setFieldValue("rank", v)} options={RANK_OPTIONS} placeholder="Select Rank" />

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Service ID <span className="text-figma-primary">*</span></label>
                <InputCustom
                  value={values.svcId}
                  onChange={(e) => setFieldValue("svcId", e.target.value)}
                  placeholder="e.g. A1234567"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-figma-primary focus:border-figma-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Platoon Number <span className="text-figma-primary">*</span></label>
                <InputCustom
                  value={values.platoon}
                  onChange={(e) => setFieldValue("platoon", e.target.value)}
                  placeholder="Enter Platoon Number (e.g. 1)"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-figma-primary focus:border-figma-primary"
                />
              </div>

              {hasCShaped && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Base Station Type <span className="text-figma-primary">*</span></label>
                  <div className="flex gap-2">
                    {(["flat", "cshaped"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFieldValue("stationType", t)}
                        className={cn(
                          "flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg border",
                          values.stationType === t ? "border-figma-primary text-figma-primary bg-red-50/60" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {t === "flat" ? "Flat Screen" : "C-Shaped"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <FieldSelect label="Role" value={values.role} onChange={(v) => setFieldValue("role", v)} options={roleOptions} placeholder="Select Role" />
              <FieldSelect label="Weapon Type" value={values.weapon} onChange={(v) => setFieldValue("weapon", v)} options={weaponOptions} placeholder="Select Weapon Type" />

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Unit Name</label>
                <div className="w-full px-3 py-2.5 text-sm bg-gray-100 text-gray-600 rounded-lg">{unitName}</div>
              </div>
            </Form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <Button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white w-auto">
                Cancel
              </Button>
              <Button type="button" onClick={submitForm} className="px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg w-auto">
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
}
