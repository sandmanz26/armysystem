import { useState } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable checkbox option
function FilterOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div onClick={onChange} className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        checked ? "bg-brand-primary border-brand-primary" : "border-gray-300 group-hover:border-brand-primary"
      )}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className={cn("text-sm transition-colors", checked ? "text-gray-800 font-medium" : "text-gray-600")}>{label}</span>
    </label>
  );
}

// Single collapsible section
function FilterSection({ title, children, count }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button onClick={() => setCollapsed(v => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold">{count}</span>}
        </div>
        <span className="text-gray-400 text-xs">{collapsed ? "▾" : "▴"}</span>
      </button>
      {!collapsed && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────
export function UserFilterSidebar({ open, onClose, filters, onChange, onApply, onClear, sections }) {
  const totalSelected = Object.values(filters).flat().length;

  return (
    <>
      <div className={cn("fixed inset-0 z-[1100] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />

      <div className={cn("fixed top-0 right-0 h-full z-[1110] w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full")}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-gray-800">Filters</span>
            {totalSelected > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold">{totalSelected}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto py-1">
          {sections.map((section) => {
            const selected = filters[section.key] ?? [];
            return (
              <FilterSection key={section.key} title={section.label} count={selected.length}>
                <div className="space-y-0.5">
                  {section.options.map((opt) => (
                    <FilterOption
                      key={opt}
                      label={opt}
                      checked={selected.includes(opt)}
                      onChange={() => onChange(section.key, opt)}
                    />
                  ))}
                </div>
              </FilterSection>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
          <button onClick={onClear} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Clear all</button>
          <button onClick={onApply} className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-colors">Apply Filters</button>
        </div>
      </div>
    </>
  );
}
