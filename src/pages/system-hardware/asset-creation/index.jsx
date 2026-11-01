import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Package, ChevronDown, Wifi } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/button";
import { FormField } from "./components/FormField";
import { ASSET_CATEGORIES, ASSET_TYPES, INITIAL_FORM_VALUES } from "./constants";

const AssetCreationSchema = Yup.object().shape({
  assetName: Yup.string().trim().required("Asset name is required"),
  assetCategory: Yup.string().required("Please select a category"),
  serialNumber: Yup.string().trim().required("Serial number is required"),
  assetType: Yup.string().required("Please select an asset type"),
});

const fieldCls = (error) =>
  cn(
    "w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors",
    error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white hover:border-gray-300"
  );

// ── Custom dropdown ────────────────────────────────────────────────────────────
function CustomDropdown({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors bg-white",
          error ? "border-red-300" : "border-gray-200 hover:border-gray-300"
        )}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown size={14} className={cn("text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                value === opt ? "text-brand-primary font-medium bg-red-50/30" : "text-gray-700"
              )}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RFID Connect confirm modal ────────────────────────────────────────────────
function RFIDConfirmModal({ open, onNo, onConnect }) {
  return (
    <>
      <div className={cn("fixed inset-0 z-50 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")} />
      <div className={cn("fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Wifi size={22} className="text-green-600" />
          </div>
        </div>
        <h3 className="text-base font-bold text-gray-800 text-center mb-1">
          Would you like to connect a RFID tag to your asset?
        </h3>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onNo}
            className="flex-1 py-2.5 border-2 border-brand-primary text-brand-primary rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConnect}
            className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors flex items-center justify-center gap-1.5"
          >
            Connect <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── RFID Setup page ───────────────────────────────────────────────────────────
function RFIDSetupPage({ onBack, onNext }) {
  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200">
        <p className="text-sm text-gray-600 font-medium">Place your asset on the RFID reader.</p>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={onBack} className="px-6 py-2 text-sm border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 bg-white">
            Back
          </Button>
          <Button type="button" onClick={onNext} className="flex items-center gap-1.5 px-6 py-2 text-sm bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 whitespace-nowrap">
            Next <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        {/* RFID icon illustration */}
        <div className="w-32 h-32 rounded-full border-2 border-brand-primary flex items-center justify-center">
          <div className="text-center">
            <div className="text-brand-primary mb-1">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="16" y="24" width="20" height="24" rx="2" />
                <rect x="28" y="30" width="16" height="12" rx="1.5" />
                <circle cx="36" cy="36" r="2" fill="currentColor" />
                <path d="M40 20 Q48 24 48 36 Q48 48 40 52" strokeLinecap="round" />
                <path d="M44 16 Q56 22 56 36 Q56 50 44 56" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brand-primary">RFID</span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-700 mb-1">Place your asset on the RFID reader.</h2>
          <p className="text-sm text-gray-400">Please make sure to put only one asset when putting on the RFID Reader.</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function AssetCreation({ onNavigate }) {
  const [step, setStep] = useState("form"); // "form" | "rfidConfirm" | "rfidSetup" | "done"
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = (values) => {
    setSubmittedName(values.assetName);
    setStep("rfidConfirm");
  };

  if (step === "rfidSetup") {
    return (
      <RFIDSetupPage
        onBack={() => setStep("rfidConfirm")}
        onNext={() => onNavigate?.("/system-hardware/assets-list")}
      />
    );
  }

  if (step === "done") {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <Header onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Asset Created!</h2>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-700">{submittedName}</span> has been successfully added to the system.
            </p>
            <div className="flex gap-3">
              <Button type="button" onClick={() => setStep("form")} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white">
                Add Another
              </Button>
              <Button type="button" onClick={() => onNavigate?.("/system-hardware/assets-list")} className="flex-1 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary/90">
                Back to List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Formik initialValues={INITIAL_FORM_VALUES} validationSchema={AssetCreationSchema} onSubmit={handleSubmit}>
      {({ errors, touched, values, setFieldValue }) => (
        <Form className="flex h-screen flex-col bg-gray-50 overflow-hidden">
          {/* RFID confirm modal */}
          <RFIDConfirmModal
            open={step === "rfidConfirm"}
            onNo={() => setStep("done")}
            onConnect={() => setStep("rfidSetup")}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 flex-shrink-0">
            <button type="button" onClick={() => onNavigate?.("/system-hardware/assets-list")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors">
              <ArrowLeft size={16} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Asset Creation</h1>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => onNavigate?.("/system-hardware/assets-list")} className="px-4 py-2 text-sm border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 bg-white whitespace-nowrap">
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 shadow-sm whitespace-nowrap">
                <ArrowRight size={14} />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-brand-primary">Create an asset</h2>
                <p className="text-sm text-gray-400 mt-0.5">Provide asset details to register a new asset in the system.</p>
              </div>

              {/* Asset Details */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Package size={14} className="text-brand-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">Asset Details</h3>
                </div>

                <div className="p-5 grid grid-cols-2 gap-4">
                  {/* Asset Name */}
                  <FormField label="Asset" required error={touched.assetName ? errors.assetName : undefined}>
                    <Field name="assetName" type="text" placeholder="e.g. SAR21, LMG, etc." className={fieldCls(touched.assetName ? errors.assetName : undefined)} />
                  </FormField>

                  {/* Asset Category — custom dropdown */}
                  <FormField label="Asset Category" required error={touched.assetCategory ? errors.assetCategory : undefined}>
                    <CustomDropdown
                      value={values.assetCategory}
                      onChange={(v) => setFieldValue("assetCategory", v)}
                      options={ASSET_CATEGORIES}
                      placeholder="Select asset category"
                      error={touched.assetCategory ? errors.assetCategory : undefined}
                    />
                    {touched.assetCategory && errors.assetCategory && (
                      <p className="mt-1 text-xs text-red-500">{errors.assetCategory}</p>
                    )}
                  </FormField>

                  {/* Serial Number */}
                  <FormField label="Asset Serial Number" required error={touched.serialNumber ? errors.serialNumber : undefined}>
                    <Field name="serialNumber" type="text" placeholder="Enter asset serial number" className={fieldCls(touched.serialNumber ? errors.serialNumber : undefined)} />
                  </FormField>

                  {/* Asset Type — custom dropdown */}
                  <FormField label="Asset Type" required error={touched.assetType ? errors.assetType : undefined}>
                    <CustomDropdown
                      value={values.assetType}
                      onChange={(v) => setFieldValue("assetType", v)}
                      options={ASSET_TYPES}
                      placeholder="Select asset type"
                      error={touched.assetType ? errors.assetType : undefined}
                    />
                    {touched.assetType && errors.assetType && (
                      <p className="mt-1 text-xs text-red-500">{errors.assetType}</p>
                    )}
                  </FormField>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-right pb-2">
                Fields marked with <span className="text-brand-primary font-semibold">*</span> are required
              </p>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
