import { ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDropdownProps } from "../types";

export function FieldDropdown({
  id,
  label,
  value,
  placeholder,
  options,
  locked,
  required = true,
  openDropdown,
  onToggle,
  onSelect,
}: FieldDropdownProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-body uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-danger normal-case">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggle(id)}
          disabled={locked}
          className={cn(
            "w-full px-3 py-2 text-left border rounded-lg flex items-center justify-between text-sm transition-colors",
            locked
              ? "bg-default-soft border-invert-default cursor-not-allowed"
              : "bg-surface border-disabled hover:border-default focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          )}
        >
          <span className={value ? "text-default font-medium" : "text-disabled"}>
            {value || placeholder}
          </span>
          {locked ? (
            <Lock size={14} className="text-disabled flex-shrink-0" />
          ) : (
            <ChevronDown
              size={14}
              className={cn(
                "text-disabled flex-shrink-0 transition-transform",
                openDropdown === id && "rotate-180"
              )}
            />
          )}
        </button>
        {openDropdown === id && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-invert-default rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(id, opt)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-default-hovered first:rounded-t-lg last:rounded-b-lg flex items-center justify-between",
                  value === opt && "bg-danger-invert-soft text-primary font-medium"
                )}
              >
                {opt}
                {value === opt && <CheckCircle2 size={14} className="text-danger" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
