import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { UserPlus, X } from "lucide-react";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export interface AddTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  unitName?: string;
}

const AddTraineeSchema = Yup.object().shape({
  rank: Yup.string().required("Rank is required"),
  name: Yup.string().required("Name is required"),
  svcId: Yup.string().required("Service ID is required"),
  platoon: Yup.string().required("Platoon is required"),
  weaponType: Yup.string().required("Weapon Type is required"),
});

const RANK_OPTIONS = [
  { value: "PTE", label: "PTE" },
  { value: "LCP", label: "LCP" },
  { value: "CPL", label: "CPL" },
  { value: "CFC", label: "CFC" },
  { value: "3SG", label: "3SG" },
  { value: "2SG", label: "2SG" },
  { value: "1SG", label: "1SG" },
  { value: "SSG", label: "SSG" },
  { value: "MSG", label: "MSG" },
  { value: "3WO", label: "3WO" },
  { value: "2WO", label: "2WO" },
  { value: "1WO", label: "1WO" },
  { value: "MWO", label: "MWO" },
  { value: "SWO", label: "SWO" },
  { value: "CWO", label: "CWO" },
];

const WEAPON_OPTIONS = [
  { value: "SAR21", label: "SAR21" },
  { value: "SPIKE SR", label: "SPIKE SR" },
  { value: "GPMG", label: "GPMG" },
  { value: "MATADOR", label: "MATADOR" },
  { value: "SPIKE LR", label: "SPIKE LR" },
  { value: "M16", label: "M16" },
  { value: "M203", label: "M203" },
];

export function AddTraineeModal({ isOpen: _isOpen, onClose, onSubmit, unitName = "" }: AddTraineeModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[2000] bg-black/30"
        onClick={onClose}
      />

      {/* Side drawer */}
      <div className="fixed inset-y-0 right-0 z-[2100] w-[480px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <UserPlus size={16} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Trainee</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fill in the trainee's information below.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formik wraps body + footer */}
        <Formik
          initialValues={{ rank: "", name: "", svcId: "", platoon: "", weaponType: "" }}
          validationSchema={AddTraineeSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
            onClose();
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Rank */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Rank <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    name="rank"
                    as={SelectOption}
                    options={RANK_OPTIONS}
                    placeholder="Select Rank"
                    value={RANK_OPTIONS.find((o) => o.value === values.rank)}
                    onChange={(opt: any) => setFieldValue("rank", opt?.value)}
                    error={touched.rank ? errors.rank : undefined}
                  />
                  {touched.rank && errors.rank && (
                    <p className="mt-1 text-xs text-red-500">{errors.rank}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="name"
                    placeholder="Enter name"
                    className={cn(
                      "w-full",
                      touched.name && errors.name && "border-red-500"
                    )}
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Service ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Service ID <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="svcId"
                    placeholder="Enter Service ID (e.g. A1234567)"
                    className={cn(
                      "w-full",
                      touched.svcId && errors.svcId && "border-red-500"
                    )}
                  />
                  {touched.svcId && errors.svcId && (
                    <p className="mt-1 text-xs text-red-500">{errors.svcId}</p>
                  )}
                </div>

                {/* Platoon Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Platoon Number <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    as={InputCustom}
                    name="platoon"
                    placeholder="Enter platoon"
                    className={cn(
                      "w-full",
                      touched.platoon && errors.platoon && "border-red-500"
                    )}
                  />
                  {touched.platoon && errors.platoon && (
                    <p className="mt-1 text-xs text-red-500">{errors.platoon}</p>
                  )}
                </div>

                {/* Weapon Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Weapon Type <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    name="weaponType"
                    as={SelectOption}
                    options={WEAPON_OPTIONS}
                    placeholder="Select Weapon Type"
                    value={WEAPON_OPTIONS.find((o) => o.value === values.weaponType)}
                    onChange={(opt: any) => setFieldValue("weaponType", opt?.value)}
                    error={touched.weaponType ? errors.weaponType : undefined}
                  />
                  {touched.weaponType && errors.weaponType && (
                    <p className="mt-1 text-xs text-red-500">{errors.weaponType}</p>
                  )}
                </div>

                {/* Unit Name — read-only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Unit Name
                  </label>
                  <InputCustom
                    name="unitName"
                    value={unitName}
                    disabled
                    className="w-full bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Sticky footer */}
              <div className="px-6 py-5 border-t border-gray-200 flex gap-3 flex-shrink-0">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors justify-center"
                >
                  Confirm
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
