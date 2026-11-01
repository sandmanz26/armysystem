import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
export function SelectField({ label, value, onChange, options, placeholder, required, }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (<div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen(!open)} className={cn("w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white transition-colors", open
            ? "border-brand-primary ring-1 ring-brand-primary/20"
            : "border-gray-200 hover:border-gray-300", value ? "text-gray-800" : "text-gray-400")}>
          <span>{value || placeholder}</span>
          <ChevronDown size={14} className={cn("text-gray-400 transition-transform", open && "rotate-180")}/>
        </button>
        {open && (<div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {options.map((opt) => (<button key={opt} type="button" onClick={() => {
                    onChange(opt);
                    setOpen(false);
                }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <span>{opt}</span>
                {value === opt && <Check size={13} className="text-brand-primary"/>}
              </button>))}
          </div>)}
      </div>
    </div>);
}
