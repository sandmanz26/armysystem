import { useRef, useState, useEffect } from "react";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { CheckCircle2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import type { BriefingRoom } from "../types";
import { STATUS_OPTIONS, LEVEL_OPTIONS } from "../constants";

interface AddBriefingRoomModalProps {
  onClose: () => void;
  onAdd: (r: BriefingRoom) => void;
}

interface FormValues {
  name: string;
  additionalInfo: string;
  status: string;
  level: string;
  capacity: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  capacity: Yup.number().typeError("Capacity must be a number").positive("Capacity must be greater than 0").required("Capacity is required"),
  status: Yup.string().required("Status is required"),
  level: Yup.string().required("Level is required"),
  additionalInfo: Yup.string(),
});

const initialValues: FormValues = {
  name: "",
  additionalInfo: "",
  status: "",
  level: "",
  capacity: "",
};

function nowStamp() {
  const d = new Date();
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}\n${time}`;
}

export function AddBriefingRoomModal({ onClose, onAdd }: AddBriefingRoomModalProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) setLevelOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    const stamp = nowStamp();
    onAdd({
      id: `br-${Date.now()}`,
      no: 0,
      name: values.name,
      additionalInfo: values.additionalInfo,
      status: values.status as BriefingRoom["status"],
      level: Number(values.level) as BriefingRoom["level"],
      capacity: Number(values.capacity),
      createdBy: "Admin",
      createdByRole: "System Admin",
      createdAt: stamp,
      lastUpdatedAt: stamp,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[2000] bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side drawer */}
      <div className="fixed inset-y-0 right-0 z-[2100] w-[480px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-default">Add New Briefing Room</h2>
              <p className="text-xs text-body mt-0.5">Please fill all the information.</p>
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

        {/* Form */}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">
                    Name <span className="text-brand-primary">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter briefing room name (e.g, Briefing Room A)"
                    className={cn(
                      "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all",
                      touched.name && errors.name ? "border-red-500" : "border-invert-default"
                    )}
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">
                    Additional Info
                  </label>
                  <Field
                    as="textarea"
                    name="additionalInfo"
                    rows={3}
                    placeholder="Optional notes about this room"
                    className="w-full px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all resize-none"
                  />
                </div>

                {/* Level + Capacity — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Level */}
                  <div>
                    <label className="block text-sm font-semibold text-default mb-1.5">
                      Level <span className="text-brand-primary">*</span>
                    </label>
                    <div className="relative" ref={levelRef}>
                      <button
                        type="button"
                        onClick={() => setLevelOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-surface"
                      >
                        <span className={values.level ? "text-default" : "text-gray-400"}>
                          {values.level ? `Level ${values.level}` : "Select level"}
                        </span>
                        <ChevronDown size={14} className={cn("text-gray-400 transition-transform", levelOpen && "rotate-180")} />
                      </button>
                      {levelOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden">
                          {LEVEL_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => { setFieldValue("level", String(opt)); setLevelOpen(false); }}
                              className={cn(
                                "w-full text-left px-3 py-2.5 text-sm hover:bg-default-soft transition-colors",
                                values.level === String(opt) ? "text-brand-primary font-medium" : "text-default"
                              )}
                            >
                              Level {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {touched.level && errors.level && (
                      <p className="mt-1 text-xs text-red-500">{errors.level}</p>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-semibold text-default mb-1.5">
                      Capacity <span className="text-brand-primary">*</span>
                    </label>
                    <Field
                      name="capacity"
                      type="number"
                      min={1}
                      placeholder="e.g, 30"
                      className={cn(
                        "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all",
                        touched.capacity && errors.capacity ? "border-red-500" : "border-invert-default"
                      )}
                    />
                    {touched.capacity && errors.capacity && (
                      <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">
                    Status <span className="text-brand-primary">*</span>
                  </label>
                  <div className="relative" ref={statusRef}>
                    <button
                      type="button"
                      onClick={() => setStatusOpen((o) => !o)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-surface"
                    >
                      <span className={values.status ? "text-default" : "text-gray-400"}>
                        {values.status || "Select status"}
                      </span>
                      <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")} />
                    </button>
                    {statusOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setFieldValue("status", opt); setStatusOpen(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2.5 text-sm hover:bg-default-soft transition-colors",
                              values.status === opt ? "text-brand-primary font-medium" : "text-default"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {touched.status && errors.status && (
                    <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-gray-200 flex gap-3 flex-shrink-0">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-semibold border border-invert-default text-default hover:bg-default-soft transition-colors bg-surface justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold bg-brand-primary text-invert-default hover:bg-brand-primary-hover transition-colors justify-center"
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
