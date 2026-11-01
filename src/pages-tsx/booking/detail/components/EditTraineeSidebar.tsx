import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X } from "lucide-react";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export interface EditTraineeValues {
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
  weaponType: string;
  unitName?: string;
}

interface EditTraineeSidebarProps {
  open: boolean;
  trainee: EditTraineeValues | null;
  onClose: () => void;
  onSubmit: (values: EditTraineeValues) => void;
}

const EditTraineeSchema = Yup.object().shape({
  rank: Yup.string().required("Rank is required"),
  name: Yup.string().required("Name is required"),
  svcId: Yup.string().required("Service ID is required"),
  platoon: Yup.string().required("Platoon is required"),
  weaponType: Yup.string().required("Weapon Type is required"),
});

const RANK_OPTIONS = [
  { value: "REC", label: "REC" },
  { value: "PTE", label: "PTE" },
  { value: "PFC", label: "PFC" },
  { value: "LCP", label: "LCP" },
  { value: "CPL", label: "CPL" },
  { value: "CFC", label: "CFC" },
  { value: "3SG", label: "3SG" },
  { value: "2SG", label: "2SG" },
  { value: "1SG", label: "1SG" },
  { value: "SSG", label: "SSG" },
  { value: "MSG", label: "MSG" },
];

const WEAPON_OPTIONS = [
  { value: "SAR21", label: "SAR21" },
  { value: "LMG", label: "LMG" },
  { value: "GPMG", label: "GPMG" },
  { value: "M16", label: "M16" },
  { value: "SPIKE SR", label: "SPIKE SR" },
  { value: "SPIKE LR", label: "SPIKE LR" },
  { value: "MATADOR", label: "MATADOR" },
  { value: "M203", label: "M203" },
];

export function EditTraineeSidebar({ open, trainee, onClose, onSubmit }: EditTraineeSidebarProps) {
  if (!trainee) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Trainee</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update the trainee information below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Formik
            enableReinitialize
            initialValues={{
              rank: trainee.rank ?? "",
              name: trainee.name ?? "",
              svcId: trainee.svcId ?? "",
              platoon: trainee.platoon ?? "",
              weaponType: trainee.weaponType ?? "",
              unitName: trainee.unitName ?? "",
            }}
            validationSchema={EditTraineeSchema}
            onSubmit={(values) => {
              onSubmit(values);
              onClose();
            }}
          >
            {({ setFieldValue, values, errors, touched }) => (
              <Form className="space-y-4">
                <Field
                  name="rank"
                  as={SelectOption}
                  options={RANK_OPTIONS}
                  label="Rank"
                  required
                  placeholder="Select Rank"
                  value={RANK_OPTIONS.find((o) => o.value === values.rank) ?? null}
                  onChange={(opt: any) => setFieldValue("rank", opt?.value ?? "")}
                  error={touched.rank ? errors.rank : undefined}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Trainee Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="name"
                    placeholder="Enter name"
                    className="w-full"
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-xs mt-1">{String(errors.name)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Service ID <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="svcId"
                    placeholder="Enter Service ID (e.g. A1234567)"
                    className="w-full"
                  />
                  {touched.svcId && errors.svcId && (
                    <p className="text-red-500 text-xs mt-1">{String(errors.svcId)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Platoon Number <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="platoon"
                    placeholder="Enter platoon"
                    className="w-full"
                  />
                  {touched.platoon && errors.platoon && (
                    <p className="text-red-500 text-xs mt-1">{String(errors.platoon)}</p>
                  )}
                </div>

                <Field
                  name="weaponType"
                  as={SelectOption}
                  options={WEAPON_OPTIONS}
                  label="Weapon Type"
                  required
                  placeholder="Select Weapon Type"
                  value={WEAPON_OPTIONS.find((o) => o.value === values.weaponType) ?? null}
                  onChange={(opt: any) => setFieldValue("weaponType", opt?.value ?? "")}
                  error={touched.weaponType ? errors.weaponType : undefined}
                />

                {values.unitName !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Unit Name
                    </label>
                    <InputCustom
                      name="unitName"
                      value={values.unitName}
                      disabled
                      className="w-full bg-gray-50 text-gray-500"
                    />
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent"
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
}
