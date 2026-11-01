import { useState, useRef, useEffect } from "react";
import { type FormikProps } from "formik";
import { ChevronDown } from "lucide-react";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "../constants";
import type { ReaderFormValues } from "../types";

interface ReaderFormFieldsProps {
  formik: FormikProps<ReaderFormValues>;
}

export function ReaderFormFields({ formik }: ReaderFormFieldsProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setStatusOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
      hasError ? "border-danger" : "border-invert-default",
    );

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  return (
    <div className="space-y-4">
      {/* MAC Address */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          RFID Reader Mac Address <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="macAddress"
          type="text"
          value={values.macAddress}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter RFID Reader MAC Address (e.g, 84248DF03FC8, etc)"
          className={inputClass(!!(touched.macAddress && errors.macAddress))}
        />
        {touched.macAddress && errors.macAddress && (
          <p className="mt-1 text-xs text-danger">{errors.macAddress}</p>
        )}
      </div>

      {/* IP Address */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          RFID Reader IP Address <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="ipAddress"
          type="text"
          value={values.ipAddress}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter RFID Reader IP Address (e.g, 000.999.999, etc)"
          className={inputClass(!!(touched.ipAddress && errors.ipAddress))}
        />
        {touched.ipAddress && errors.ipAddress && (
          <p className="mt-1 text-xs text-danger">{errors.ipAddress}</p>
        )}
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          RFID Reader Display Name <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="displayName"
          type="text"
          value={values.displayName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter RFID Reader Display Name (e.g, Reader A, etc)"
          className={inputClass(!!(touched.displayName && errors.displayName))}
        />
        {touched.displayName && errors.displayName && (
          <p className="mt-1 text-xs text-danger">{errors.displayName}</p>
        )}
      </div>

      {/* MQTT Topic */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          MQTT Topic <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="mqttTopic"
          type="text"
          value={values.mqttTopic}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter MQTT Topic"
          className={inputClass(!!(touched.mqttTopic && errors.mqttTopic))}
        />
        {touched.mqttTopic && errors.mqttTopic && (
          <p className="mt-1 text-xs text-danger">{errors.mqttTopic}</p>
        )}
      </div>

      {/* Serial Number */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          RFID Reader Serial Number <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="serialNumber"
          type="text"
          value={values.serialNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter RFID reader serial number (e.g, JX3621390195, etc)"
          className={inputClass(!!(touched.serialNumber && errors.serialNumber))}
        />
        {touched.serialNumber && errors.serialNumber && (
          <p className="mt-1 text-xs text-danger">{errors.serialNumber}</p>
        )}
      </div>

      {/* Firmware Version */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          RFID Reader Firmware Version <span className="text-primary">*</span>
        </label>
        <InputCustom
          name="firmwareVersion"
          type="text"
          value={values.firmwareVersion}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter RFID Reader Firmware Version (e.g, 1.0.0, etc)"
          className={inputClass(!!(touched.firmwareVersion && errors.firmwareVersion))}
        />
        {touched.firmwareVersion && errors.firmwareVersion && (
          <p className="mt-1 text-xs text-danger">{errors.firmwareVersion}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-default mb-1">
          Status <span className="text-primary">*</span>
        </label>
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen((o) => !o)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface",
              touched.status && errors.status ? "border-danger" : "border-invert-default",
            )}
          >
            <span className={values.status ? "text-default" : "text-disabled"}>
              {values.status || "Select status"}
            </span>
            <ChevronDown
              size={14}
              className={cn("text-disabled transition-transform", statusOpen && "rotate-180")}
            />
          </button>
          {statusOpen && (
            <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setFieldValue("status", opt);
                    setStatusOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm hover:bg-default-soft transition-colors",
                    values.status === opt ? "text-primary font-medium" : "text-default",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
        {touched.status && errors.status && (
          <p className="mt-1 text-xs text-danger">{errors.status}</p>
        )}
      </div>
    </div>
  );
}
