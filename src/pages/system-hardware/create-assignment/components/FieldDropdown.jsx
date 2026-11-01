import { ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
export function FieldDropdown({ id, label, value, placeholder, options, locked, required = true, openDropdown, onToggle, onSelect, }) {
    return (<div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-500 normal-case">*</span>}
        {locked && (<span className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded normal-case tracking-normal">
            <Lock size={10}/> Auto-filled
          </span>)}
      </label>
      <div className="relative">
        <button type="button" onClick={() => onToggle(id)} disabled={locked} className={cn("w-full px-3 py-2 text-left border rounded-lg flex items-center justify-between text-sm transition-colors", locked
            ? "bg-gray-50 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800")}>
          <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
            {value || placeholder}
          </span>
          {locked ? (<Lock size={14} className="text-gray-300 flex-shrink-0"/>) : (<ChevronDown size={14} className={cn("text-gray-400 flex-shrink-0 transition-transform", openDropdown === id && "rotate-180")}/>)}
        </button>
        {openDropdown === id && (<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
            {options.map((opt) => (<button key={opt} type="button" onClick={() => onSelect(id, opt)} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between", value === opt && "bg-red-50 text-red-800 font-medium")}>
                {opt}
                {value === opt && <CheckCircle2 size={14} className="text-red-700"/>}
              </button>))}
          </div>)}
      </div>
    </div>);
}
