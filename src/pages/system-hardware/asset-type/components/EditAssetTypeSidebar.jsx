import { useRef, useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { assetCategories } from "@/data/systemHardware";
import { STATUS_OPTIONS } from "../constants";

const validationSchema = Yup.object().shape({
  assetType: Yup.string().trim().required("Asset Type is required"),
  code: Yup.string().trim().required("Asset Type Code is required"),
  assetCategory: Yup.string(),
  status: Yup.string(),
});

function EditForm({ asset, onClose, onSave }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const categoryRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categoryOptions = assetCategories.map((c) => c.assetCategory);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        assetType: asset?.assetType ?? "",
        assetCategory: asset?.assetCategory ?? "",
        code: asset?.code ?? "",
        status: asset?.status ?? "Active",
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSave({ ...asset, ...values });
        setSubmitting(false);
        onClose();
      }}
    >
      {({ errors, touched, values, setFieldValue }) => (
        <Form className="flex flex-col h-full">
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type <span className="text-brand-primary">*</span>
              </label>
              <Field
                name="assetType"
                type="text"
                placeholder="e.g. SAR21"
                className={cn(
                  "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                  touched.assetType && errors.assetType ? "border-red-500" : "border-gray-200"
                )}
              />
              {touched.assetType && errors.assetType && (
                <p className="mt-1 text-xs text-red-500">{errors.assetType}</p>
              )}
            </div>

            {/* Asset Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Category <span className="text-brand-primary">*</span>
              </label>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                >
                  <span className={values.assetCategory ? "text-gray-800" : "text-gray-400"}>
                    {values.assetCategory || "Select asset category"}
                  </span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", categoryOpen && "rotate-180")} />
                </button>
                {categoryOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setFieldValue("assetCategory", opt); setCategoryOpen(false); }}
                        className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                          values.assetCategory === opt ? "text-brand-primary font-medium" : "text-gray-700"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Asset Type Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type Code <span className="text-brand-primary">*</span>
              </label>
              <Field
                name="code"
                type="text"
                placeholder="e.g. WPN"
                className={cn(
                  "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                  touched.code && errors.code ? "border-red-500" : "border-gray-200"
                )}
              />
              {touched.code && errors.code && (
                <p className="mt-1 text-xs text-red-500">{errors.code}</p>
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
                  <span className={values.status ? "text-gray-800" : "text-gray-400"}>
                    {values.status || "Select status"}
                  </span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")} />
                </button>
                {statusOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setFieldValue("status", opt); setStatusOpen(false); }}
                        className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
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

          {/* Sticky footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
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
  );
}

export function EditAssetTypeSidebar({ open, asset, onClose, onSave }) {
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
            <h2 className="text-base font-bold text-gray-900">Edit Asset Type</h2>
            <p className="text-xs text-gray-500 mt-0.5">{asset?.assetType}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {asset && <EditForm asset={asset} onClose={onClose} onSave={onSave} />}
      </div>
    </>
  );
}
