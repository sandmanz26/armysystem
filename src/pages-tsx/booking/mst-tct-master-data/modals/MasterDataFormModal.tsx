import { useState } from "react";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "../constants";
import type { MasterDataItem } from "../types";

interface MasterDataFormModalProps {
  mode: "add" | "edit";
  singularLabel: string;
  item?: MasterDataItem | null;
  onClose: () => void;
  onSubmit: (values: { name: string; status: "Active" | "Inactive" }) => void;
}

interface FormValues {
  name: string;
  status: "Active" | "Inactive";
}

export function MasterDataFormModal({ mode, singularLabel, item, onClose, onSubmit }: MasterDataFormModalProps) {
  const [statusOpen, setStatusOpen] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(`${singularLabel} name is required`),
    status: Yup.string().required("Status is required"),
  });

  const initialValues: FormValues = {
    name: item?.name ?? "",
    status: item?.status ?? "Active",
  };

  const handleSubmit = (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    onSubmit(values);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} width="480px">
      <div className="flex items-center gap-4 mb-6 -mt-2">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={24} className="text-green-500" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">
            {mode === "add" ? `Add ${singularLabel}` : `Edit ${singularLabel}`}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
        {({ errors, touched, values, setFieldValue }) => (
          <Form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  {singularLabel} Name <span className="text-brand-primary">*</span>
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder={`Enter ${singularLabel.toLowerCase()} name`}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all",
                    touched.name && errors.name ? "border-red-500" : "border-gray-200"
                  )}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Status <span className="text-brand-primary">*</span>
                </label>
                <div className="relative">
                  <Button
                    type="outline"
                    onClick={() => setStatusOpen((o) => !o)}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 border-2 rounded-lg text-sm",
                      statusOpen ? "border-gray-800" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-gray-800">{values.status}</span>
                    <ChevronDown size={16} className={cn("text-gray-500 transition-transform", statusOpen && "rotate-180")} />
                  </Button>
                  {statusOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setFieldValue("status", opt); setStatusOpen(false); }}
                          className={cn(
                            "w-full text-left px-3.5 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-b-0",
                            values.status === opt ? "text-brand-primary font-medium" : "text-gray-700"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent"
              >
                {mode === "add" ? "Add" : "Save Changes"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
