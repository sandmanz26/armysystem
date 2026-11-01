import { useRef, useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import {
  STATUS_OPTIONS,
  RFID_LOCATION_OPTIONS,
  BASE_STATION_OPTIONS,
  GROUP_KEY_OPTIONS,
  GROUP_GPO_OPTIONS,
} from "../constants";

const validationSchema = Yup.object().shape({
  portNumber: Yup.string().trim().required("Antenna Port Number is required"),
  antenna: Yup.string().trim().required("Antenna is required"),
  rfidLocation: Yup.string(),
  baseStation: Yup.string(),
  groupKey: Yup.string(),
  groupGpo: Yup.string(),
  status: Yup.string(),
});

const EMPTY_VALUES = {
  portNumber: "",
  antenna: "",
  rfidLocation: "",
  baseStation: "",
  groupKey: "",
  groupGpo: "",
  status: "",
};

// ── Reusable custom dropdown for antenna form ─────────────────────────────────
function AntennaDropdown({ label, required, fieldName, placeholder, options, values, setFieldValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-brand-primary">*</span>}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
        >
          <span className={values[fieldName] ? "text-gray-800" : "text-gray-400"}>
            {values[fieldName] || placeholder}
          </span>
          <ChevronDown size={14} className={cn("text-gray-400 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button key={opt} type="button"
                onClick={() => { setFieldValue(fieldName, opt); setOpen(false); }}
                className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                  values[fieldName] === opt ? "text-brand-primary font-medium" : "text-gray-700"
                )}
              >{opt}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Form body (shared between Add and Edit) ───────────────────────────────────
export function AntennaFormBody({ values, errors, touched, setFieldValue }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Antenna Port Number <span className="text-brand-primary">*</span>
        </label>
        <Field name="portNumber" type="text" placeholder="Enter antenna port number (e.g, JX3621390195)"
          className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
            touched.portNumber && errors.portNumber ? "border-red-500" : "border-gray-200"
          )}
        />
        {touched.portNumber && errors.portNumber && <p className="mt-1 text-xs text-red-500">{errors.portNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Antenna <span className="text-brand-primary">*</span>
        </label>
        <Field name="antenna" type="text" placeholder="Enter antenna (e.g, Antenna 1)"
          className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
            touched.antenna && errors.antenna ? "border-red-500" : "border-gray-200"
          )}
        />
        {touched.antenna && errors.antenna && <p className="mt-1 text-xs text-red-500">{errors.antenna}</p>}
      </div>

      <AntennaDropdown label="RFID Reader Location" required fieldName="rfidLocation" placeholder="Select RFID reader location" options={RFID_LOCATION_OPTIONS} values={values} setFieldValue={setFieldValue} />
      <AntennaDropdown label="Base Station" fieldName="baseStation" placeholder="Select station" options={BASE_STATION_OPTIONS} values={values} setFieldValue={setFieldValue} />
      <AntennaDropdown label="Group Key" fieldName="groupKey" placeholder="Select group key" options={GROUP_KEY_OPTIONS} values={values} setFieldValue={setFieldValue} />
      <AntennaDropdown label="Group GPO" fieldName="groupGpo" placeholder="Select group GPO" options={GROUP_GPO_OPTIONS} values={values} setFieldValue={setFieldValue} />
      <AntennaDropdown label="Status" required fieldName="status" placeholder="Select status" options={STATUS_OPTIONS} values={values} setFieldValue={setFieldValue} />
    </div>
  );
}

// ── Add Antenna Sidebar ───────────────────────────────────────────────────────
export function AddAntennaModal({ open, onClose, onAdd }) {
  return (
    <>
      <div className={cn("fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <div className={cn("fixed inset-y-0 right-0 z-[1110] w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New Antenna</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the antenna information below.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        <Formik initialValues={EMPTY_VALUES} validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            onAdd?.({ id: `ant-${Date.now()}`, ...values });
            setSubmitting(false);
            onClose();
          }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AntennaFormBody values={values} errors={errors} touched={touched} setFieldValue={setFieldValue} />
              </div>
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <Button type="submit" className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent">Add Antenna</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
