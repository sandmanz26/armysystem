import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectFieldProps } from "../types";

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div>
      <label className="block text-xs font-semibold text-caption mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-surface transition-colors",
            open
              ? "border-primary ring-1 ring-primary/20"
              : "border-invert-default hover:border-disabled",
            value ? "text-default" : "text-disabled"
          )}
        >
          <span>{value || placeholder}</span>
          <ChevronDown
            size={14}
            className={cn("text-disabled transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-default hover:bg-default-soft"
              >
                <span>{opt}</span>
                {value === opt && <Check size={13} className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
