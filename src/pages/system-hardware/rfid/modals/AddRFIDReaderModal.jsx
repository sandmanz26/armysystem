import { Formik, Form } from "formik";
import * as Yup from "yup";
import { X } from "lucide-react";
import { Button } from "@/components/button";
import { ReaderFormFields } from "../components/ReaderFormFields";
import { cn } from "@/lib/utils";

const validationSchema = Yup.object().shape({
  macAddress: Yup.string().required("RFID Reader Mac Address is required"),
  ipAddress: Yup.string().required("RFID Reader IP Address is required"),
  displayName: Yup.string().required("RFID Reader Display Name is required"),
  mqttTopic: Yup.string().required("MQTT Topic is required"),
  serialNumber: Yup.string().required("RFID Reader Serial Number is required"),
  firmwareVersion: Yup.string(),
  status: Yup.string().required("Status is required"),
});

const initialValues = {
  macAddress: "",
  ipAddress: "",
  displayName: "",
  mqttTopic: "",
  serialNumber: "",
  firmwareVersion: "",
  status: "",
};

export function AddRFIDReaderModal({ open, onClose, onAdd }) {
  const handleSubmit = (values) => {
    onAdd({
      id: `r${Date.now()}`,
      no: 0,
      displayName: values.displayName,
      macAddress: values.macAddress,
      ipAddress: values.ipAddress,
      serialNumber: values.serialNumber,
      firmwareVersion: values.firmwareVersion,
      status: values.status,
      armStatus: "Disarm",
    });
    onClose();
  };

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

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1110] w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New RFID Reader</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the RFID reader information below.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
          {(formik) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <ReaderFormFields formik={formik} />
              </div>
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <Button type="submit" className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent">
                  Add Reader
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
