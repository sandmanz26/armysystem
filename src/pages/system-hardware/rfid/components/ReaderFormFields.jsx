import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "../constants";
export function ReaderFormFields({ formik }) {
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef(null);
    useEffect(() => {
        function handleClick(e) {
            if (statusRef.current && !statusRef.current.contains(e.target))
                setStatusOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    const inputClass = (hasError) => cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary", hasError ? "border-red-500" : "border-gray-200");
    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
    return (<div className="space-y-4">
      {/* MAC Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFID Reader Mac Address <span className="text-brand-primary">*</span>
        </label>
        <InputCustom name="macAddress" type="text" value={values.macAddress} onChange={handleChange} onBlur={handleBlur} placeholder="Enter RFID Reader MAC Address (e.g, 84248DF03FC8, etc)" className={inputClass(!!(touched.macAddress && errors.macAddress))}/>
        {touched.macAddress && errors.macAddress && (<p className="mt-1 text-xs text-red-500">{errors.macAddress}</p>)}
      </div>

      {/* IP Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFID Reader IP Address <span className="text-brand-primary">*</span>
        </label>
        <InputCustom name="ipAddress" type="text" value={values.ipAddress} onChange={handleChange} onBlur={handleBlur} placeholder="Enter RFID Reader IP Address (e.g, 000.999.999, etc)" className={inputClass(!!(touched.ipAddress && errors.ipAddress))}/>
        {touched.ipAddress && errors.ipAddress && (<p className="mt-1 text-xs text-red-500">{errors.ipAddress}</p>)}
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFID Reader Display Name <span className="text-brand-primary">*</span>
        </label>
        <InputCustom name="displayName" type="text" value={values.displayName} onChange={handleChange} onBlur={handleBlur} placeholder="Enter RFID Reader Display Name (e.g, Reader A, etc)" className={inputClass(!!(touched.displayName && errors.displayName))}/>
        {touched.displayName && errors.displayName && (<p className="mt-1 text-xs text-red-500">{errors.displayName}</p>)}
      </div>

      {/* MQTT Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MQTT Topic <span className="text-brand-primary">*</span>
        </label>
        <InputCustom name="mqttTopic" type="text" value={values.mqttTopic} onChange={handleChange} onBlur={handleBlur} placeholder="Enter MQTT Topic" className={inputClass(!!(touched.mqttTopic && errors.mqttTopic))}/>
        {touched.mqttTopic && errors.mqttTopic && (<p className="mt-1 text-xs text-red-500">{errors.mqttTopic}</p>)}
      </div>

      {/* Serial Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFID Reader Serial Number <span className="text-brand-primary">*</span>
        </label>
        <InputCustom name="serialNumber" type="text" value={values.serialNumber} onChange={handleChange} onBlur={handleBlur} placeholder="Enter RFID reader serial number (e.g, JX3621390195, etc)" className={inputClass(!!(touched.serialNumber && errors.serialNumber))}/>
        {touched.serialNumber && errors.serialNumber && (<p className="mt-1 text-xs text-red-500">{errors.serialNumber}</p>)}
      </div>

      {/* Firmware Version */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          RFID Reader Firmware Version
        </label>
        <InputCustom name="firmwareVersion" type="text" value={values.firmwareVersion} onChange={handleChange} onBlur={handleBlur} placeholder="Enter RFID Reader Firmware Version (e.g, 1.0.0, etc)" className={inputClass(false)}/>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-brand-primary">*</span>
        </label>
        <div className="relative" ref={statusRef}>
          <button type="button" onClick={() => setStatusOpen((o) => !o)} className={cn("w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white", touched.status && errors.status ? "border-red-500" : "border-gray-200")}>
            <span className={values.status ? "text-gray-800" : "text-gray-400"}>
              {values.status || "Select status"}
            </span>
            <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")}/>
          </button>
          {statusOpen && (<div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {STATUS_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => {
                    setFieldValue("status", opt);
                    setStatusOpen(false);
                }} className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors", values.status === opt ? "text-brand-primary font-medium" : "text-gray-700")}>
                  {opt}
                </button>))}
            </div>)}
        </div>
        {touched.status && errors.status && (<p className="mt-1 text-xs text-red-500">{errors.status}</p>)}
      </div>
    </div>);
}
