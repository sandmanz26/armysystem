import { useRef, useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS, ALERT_MODE_OPTIONS } from "../types";

const validationSchema = Yup.object().shape({
  assetCategory: Yup.string().trim().required("Asset Category is required"),
  status: Yup.string().required("Status is required"),
  alertMode: Yup.string().required("Alert Mode is required"),
});

function EditForm({ category, onClose, onSave }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const statusRef = useRef(null);
  const alertRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
      if (alertRef.current && !alertRef.current.contains(e.target)) setAlertOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        assetCategory: category?.assetCategory ?? "",
        status: category?.status ?? "Active",
        alertMode: category?.alert ?? "Non-Critical Component",
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSave({ ...category, assetCategory: values.assetCategory, status: values.status, alert: values.alertMode });
        setSubmitting(false);
        onClose();
      }}
    >
      {({ errors, touched, values, setFieldValue }) => (
        <Form className="flex flex-col h-full">
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Asset Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Category <span className="text-brand-primary">*</span>
              </label>
              <Field
                name="assetCategory"
                type="text"
                placeholder="Enter asset category name"
                className={cn(
                  "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                  touched.assetCategory && errors.assetCategory ? "border-red-500" : "border-gray-200"
                )}
              />
              {touched.assetCategory && errors.assetCategory && (
                <p className="mt-1 text-xs text-red-500">{errors.assetCategory}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-brand-primary">*</span>
              </label>
              <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  onClick={() => setStatusOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                >
                  <span className="text-gray-800">{values.status || "Select status"}</span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")} />
                </button>
                {statusOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {STATUS_OPTIONS.map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => { setFieldValue("status", opt); setStatusOpen(false); }}
                        className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                          values.status === opt ? "text-brand-primary font-medium" : "text-gray-700"
                        )}
                      >{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Mode <span className="text-brand-primary">*</span>
              </label>
              <div className="relative" ref={alertRef}>
                <button
                  type="button"
                  onClick={() => setAlertOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                >
                  <span className="text-gray-800">{values.alertMode || "Select alert mode"}</span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", alertOpen && "rotate-180")} />
                </button>
                {alertOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {ALERT_MODE_OPTIONS.map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => { setFieldValue("alertMode", opt); setAlertOpen(false); }}
                        className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                          values.alertMode === opt ? "text-brand-primary font-medium" : "text-gray-700"
                        )}
                      >{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent">
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export function EditAssetCategorySidebar({ open, category, onClose, onSave }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1110] w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Asset Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">{category?.assetCategory}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {category && <EditForm category={category} onClose={onClose} onSave={onSave} />}
      </div>
    </>
  );
}
