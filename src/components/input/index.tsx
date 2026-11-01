import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 0. Design-system Input — the SHIELD Base Component port. Prefer this for any
//    NEW field; InputCustom below is the legacy unstyled wrapper still used by
//    ~100 call sites. Migration plan: ds_engineer.md.
export { Input } from "./Input";
export { NumberStepper } from "./NumberStepper";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
export type { InputProps as DSInputProps, InputSize, InputStatus } from "./Input";

// 1. Basic Input Component (from index.js) — LEGACY, see note above
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Custom props can go here
}

export const InputCustom = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn("focus:outline-none p-3 border-2 rounded-lg", className)}
        {...props}
      />
    );
  }
);
InputCustom.displayName = "InputCustom";

// 2. Formik-aware Input Component (from inputText.js)
// Use this inside <Formik> forms.
export interface InputTextComponentProps {
  formik?: any; // Formik props
  name: string;
  placeholder?: string;
  type?: string;
  isContactNo?: boolean;
  countryCode?: string;
  maxLength?: number;
  className?: string;
}

export const InputTextComponent = ({
  formik,
  name,
  placeholder = "",
  type = "text",
  isContactNo = false,
  countryCode = "+1",
  maxLength,
  className,
}: InputTextComponentProps) => {
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return value;
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isContactNo) {
      const formatted = formatPhoneNumber(e.target.value);
      formik?.setFieldValue(name, formatted);
    } else {
      formik?.handleChange(e);
    }
  };

  const hasError = formik?.touched[name] && formik?.errors[name];

  if (isContactNo) {
    return (
      <div className={className}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-[12px] pointer-events-none">
            <span className="text-[#525252] text-base font-medium">
              {countryCode}
            </span>
            <div className="h-6 w-px bg-[#D0D5DD] mx-3"></div>
          </div>
          <input
            id={name}
            name={name}
            onChange={handleContactChange}
            value={formik?.values[name] || ""}
            onBlur={formik?.handleBlur}
            type="text"
            placeholder={placeholder || "7664 1237 2348"}
            maxLength={maxLength}
            className={cn(
              "block font-medium w-full rounded-lg bg-transparent pl-[70px] pr-[12px] h-[44px] text-base text-[#101828] border",
              hasError ? "border-red-500" : "border-[#D0D5DD]",
              "placeholder:text-[#525252] placeholder:text-base placeholder:font-normal focus:border-[#101828] focus:ring-0 hover:border-[#101828]"
            )}
          />
        </div>
        {hasError && (
          <div className="text-red-500 text-xs pt-1 pl-1">
            {formik?.errors[name] as string}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        id={name}
        name={name}
        onChange={formik?.handleChange}
        value={formik?.values[name] || ""}
        onBlur={formik?.handleBlur}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "block font-medium w-full rounded-lg bg-transparent px-[12px] h-[44px] text-base text-[#101828] border",
          hasError ? "border-red-500" : "border-[#D0D5DD]",
          "placeholder:text-[#525252] placeholder:text-base placeholder:font-normal focus:border-[#101828] focus:ring-0 hover:border-[#101828]"
        )}
      />
      {hasError && (
        <div className="text-red-500 text-xs pt-1 pl-1">
          {formik?.errors[name] as string}
        </div>
      )}
    </div>
  );
};

// 3. Phone Input with Country Selector
const COUNTRY_CODES = [
  { code: "+1", flag: "🇸🇬", name: "Northvale" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1",  flag: "🇺🇸", name: "United States" },
];

export interface PhoneInputSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const PhoneInputSelector = ({
  value,
  onChange,
  className,
  placeholder = "e.g. 9123 4567",
}: PhoneInputSelectorProps) => {
  const [selected, setSelected] = useState(COUNTRY_CODES[0]);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = COUNTRY_CODES.length * 40 + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight;
      setDropdownStyle({
        position: "fixed",
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        left: rect.left,
        zIndex: 9999,
      });
    }
    setOpen(v => !v);
  };

  return (
    <div className={cn("relative flex items-stretch border border-invert-default rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-brand-primary focus-within:border-brand-primary transition-colors", className)} ref={ref}>
      {/* Country selector button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-invert-default text-sm text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 min-w-[90px]"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown size={12} className={cn("text-gray-400 transition-transform ml-auto", open && "rotate-180")} />
      </button>

      {/* Number input */}
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ""))}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-surface focus:outline-none placeholder:text-gray-400 min-w-0"
      />

      {/* Dropdown — fixed position to escape parent overflow:hidden */}
      {open && (
        <div style={dropdownStyle} className="bg-surface border border-invert-default rounded-lg shadow-lg py-1 min-w-[200px]">
          {COUNTRY_CODES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { setSelected(c); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-default-soft transition-colors",
                selected.code === c.code && "bg-brand-primary/5 text-brand-primary font-medium"
              )}
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              <span className="text-gray-400 text-xs font-mono">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
