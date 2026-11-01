import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { UserPlus, X } from "lucide-react";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { COLLECTIVE_ROLES } from "../constants";

export interface TraineeFormValues {
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
  role: string;
}

export interface TraineeFormModalProps {
  mode: "add" | "edit";
  initialValues?: TraineeFormValues;
  showRole: boolean;
  onClose: () => void;
  onSubmit: (values: TraineeFormValues) => void;
}

const RANK_OPTIONS = [
  { value: "PTE", label: "PTE" }, { value: "LCP", label: "LCP" }, { value: "CPL", label: "CPL" },
  { value: "CFC", label: "CFC" }, { value: "3SG", label: "3SG" }, { value: "2SG", label: "2SG" },
  { value: "1SG", label: "1SG" }, { value: "CPT", label: "CPT" }, { value: "MAJ", label: "MAJ" },
  { value: "LTA", label: "LTA" }, { value: "LTC", label: "LTC" }, { value: "COL", label: "COL" },
];

const ROLE_OPTIONS = COLLECTIVE_ROLES.map((r) => ({ value: r, label: r }));

const BASE_SCHEMA_FIELDS = {
  rank: Yup.string().required("Rank is required"),
  name: Yup.string().required("Name is required"),
  svcId: Yup.string().required("Service ID is required"),
  platoon: Yup.string().required("Platoon is required"),
};

const EMPTY_VALUES: TraineeFormValues = { rank: "", name: "", svcId: "", platoon: "", role: "" };

export function TraineeFormModal({ mode, initialValues, showRole, onClose, onSubmit }: TraineeFormModalProps) {
  const TraineeSchema = Yup.object().shape(
    showRole
      ? { ...BASE_SCHEMA_FIELDS, role: Yup.string().required("Role is required") }
      : BASE_SCHEMA_FIELDS
  );

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[2100] w-[480px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <UserPlus size={16} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{mode === "add" ? "Add Trainee" : "Edit Trainee"}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fill in the trainee's information below.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <Formik<TraineeFormValues>
          initialValues={initialValues ?? EMPTY_VALUES}
          validationSchema={TraineeSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
            onClose();
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rank <span className="text-brand-primary">*</span></label>
                  <Field
                    name="rank" as={SelectOption} options={RANK_OPTIONS} placeholder="Select Rank"
                    value={RANK_OPTIONS.find((o) => o.value === values.rank)}
                    onChange={(opt: any) => setFieldValue("rank", opt?.value)}
                    error={touched.rank ? errors.rank : undefined}
                  />
                  {touched.rank && errors.rank && <p className="mt-1 text-xs text-red-500">{errors.rank}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name <span className="text-brand-primary">*</span></label>
                  <Field as={InputCustom} name="name" placeholder="Enter name" className={cn("w-full", touched.name && errors.name && "border-red-500")} />
                  {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service ID <span className="text-brand-primary">*</span></label>
                  <Field as={InputCustom} name="svcId" placeholder="Enter Service ID (e.g. A1234567)" className={cn("w-full", touched.svcId && errors.svcId && "border-red-500")} />
                  {touched.svcId && errors.svcId && <p className="mt-1 text-xs text-red-500">{errors.svcId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platoon Number <span className="text-brand-primary">*</span></label>
                  <Field as={InputCustom} name="platoon" placeholder="Enter platoon" className={cn("w-full", touched.platoon && errors.platoon && "border-red-500")} />
                  {touched.platoon && errors.platoon && <p className="mt-1 text-xs text-red-500">{errors.platoon}</p>}
                </div>

                {showRole && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role <span className="text-brand-primary">*</span></label>
                    <Field
                      name="role" as={SelectOption} options={ROLE_OPTIONS} placeholder="Select Role"
                      value={ROLE_OPTIONS.find((o) => o.value === values.role)}
                      onChange={(opt: any) => setFieldValue("role", opt?.value)}
                      error={touched.role ? (errors as any).role : undefined}
                    />
                    {touched.role && (errors as any).role && <p className="mt-1 text-xs text-red-500">{(errors as any).role}</p>}
                  </div>
                )}
              </div>

              <div className="px-6 py-5 border-t border-gray-200 flex gap-3 flex-shrink-0">
                <Button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white justify-center">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors justify-center">
                  {mode === "add" ? "Add" : "Save"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
