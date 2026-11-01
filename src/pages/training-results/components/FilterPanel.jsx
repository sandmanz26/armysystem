import { useState } from "react";
import { X, ChevronDown, ChevronUp, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILTER_SECTIONS } from "../constants";

// ── Reusable checkbox item ────────────────────────────────────────────────────
function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          checked
            ? "bg-brand-primary border-brand-primary"
            : "border-gray-300 group-hover:border-brand-primary"
        )}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className={cn("text-sm transition-colors leading-tight", checked ? "text-gray-800 font-medium" : "text-gray-600")}>
        {label}
      </span>
    </label>
  );
}

// ── Section renderer ──────────────────────────────────────────────────────────
function FilterSection({ section, selected, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const visibleOptions = section.searchable && search
    ? section.options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : section.options;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{section.label}</span>
          {selected.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
              {selected.length}
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown size={14} className="text-gray-400" />
          : <ChevronUp size={14} className="text-gray-400" />
        }
      </button>

      {/* Section body */}
      {!collapsed && (
        <div className="px-5 pb-4">
          {/* Search bar (only for searchable sections) */}
          {section.searchable && (
            <div className="relative mb-3">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${section.label.toLowerCase()}…`}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-gray-50"
              />
            </div>
          )}

          {/* Options — 2 col or single col */}
          <div className={cn("gap-x-3", section.twoCol ? "grid grid-cols-2" : "flex flex-col space-y-0")}>
            {visibleOptions.length > 0
              ? visibleOptions.map((opt) => (
                  <FilterCheckbox
                    key={opt}
                    label={opt}
                    checked={selected.includes(opt)}
                    onChange={() => onChange(section.key, opt)}
                  />
                ))
              : (
                <p className="text-xs text-gray-400 py-2">No results found</p>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main FilterPanel ──────────────────────────────────────────────────────────
export function FilterPanel({ open, onClose, filters, onChange, onApply, onClear }) {
  const totalSelected = Object.values(filters).flat().length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-[1110] w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header (fixed) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-gray-800">Filters</span>
            {totalSelected > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                {totalSelected}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable sections */}
        <div className="flex-1 overflow-y-auto py-1">
          {FILTER_SECTIONS.map((section) => (
            <FilterSection
              key={section.key}
              section={section}
              selected={filters[section.key] ?? []}
              onChange={onChange}
            />
          ))}
        </div>

        {/* ── Footer sticky (always visible) */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
