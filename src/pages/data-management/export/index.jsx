import { useState } from "react";
import { Download } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { cn } from "@/lib/utils";
const DATE_RANGES = [
    { value: "Last month", label: "Last month" },
    { value: "Last 3 months", label: "Last 3 months" },
    { value: "Last 6 months", label: "Last 6 months" },
    { value: "Custom date range", label: "Custom date range" },
];
const DATA_TYPES = [
    "User data",
    "Training result",
    "Trainee data",
    "Leaderboard data",
    "SHM data",
    "Operation data",
    "HUMS data",
    "Booking data",
];
const EXPORT_FORMATS = ["CSV", "Excel", "JSON"];
function RadioOption({ value, checked, onChange, label, }) {
    return (<label className="flex items-center gap-3 cursor-pointer select-none group">
      <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors", checked
            ? "border-brand-primary"
            : "border-gray-300 group-hover:border-gray-400")}>
        {checked && <span className="w-2 h-2 rounded-full bg-brand-primary"/>}
      </span>
      <input type="radio" value={value} checked={checked} onChange={onChange} className="sr-only"/>
      <span className="text-sm text-gray-700">{label}</span>
    </label>);
}
export function DataExport() {
    const [dateRange, setDateRange] = useState("Last month");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [selectedTypes, setSelectedTypes] = useState(new Set());
    const [format, setFormat] = useState("");
    const [filename, setFilename] = useState("2026-04-22-csv-data-export");
    const isAllSelected = selectedTypes.size === DATA_TYPES.length;
    const toggleType = (type) => {
        setSelectedTypes((prev) => {
            const next = new Set(prev);
            next.has(type) ? next.delete(type) : next.add(type);
            return next;
        });
    };
    const toggleAll = () => {
        setSelectedTypes(isAllSelected ? new Set() : new Set(DATA_TYPES));
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">
          Data Export
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {/* ── Section 1: Date Range ───────────────────────────────────────── */}
          <div className="px-6 py-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Select Date Range <span className="text-brand-primary">*</span>
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {DATE_RANGES.map(({ value, label }) => (<RadioOption key={value} value={value} label={label} checked={dateRange === value} onChange={() => setDateRange(value)}/>))}
            </div>

            {/* Custom date pickers */}
            {dateRange === "Custom date range" && (<div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Start date
                  </label>
                  <InputCustom type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                <span className="text-gray-400 text-sm mt-4">—</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    End date
                  </label>
                  <InputCustom type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
              </div>)}
          </div>

          {/* ── Section 2: Data Type ────────────────────────────────────────── */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">
                Select Data Type
              </p>
              <button onClick={toggleAll} className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors">
                {isAllSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
              {DATA_TYPES.map((type) => (<label key={type} className="flex items-center gap-3 cursor-pointer select-none">
                  <Checkbox checked={selectedTypes.has(type)} onChange={() => toggleType(type)}/>
                  <span className="text-sm text-gray-700">{type}</span>
                </label>))}
            </div>

            {selectedTypes.size > 0 && (<div className="mt-4 flex flex-wrap gap-2">
                {[...selectedTypes].map((t) => (<span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-brand-primary text-xs font-medium border border-red-100">
                    {t}
                    <button onClick={() => toggleType(t)} className="hover:text-red-600 transition-colors">
                      ×
                    </button>
                  </span>))}
              </div>)}
          </div>

          {/* ── Section 3: Export Format ────────────────────────────────────── */}
          <div className="px-6 py-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Select Export Format
            </p>
            <div className="flex gap-3">
              {EXPORT_FORMATS.map((f) => (<button key={f} onClick={() => setFormat(f)} className={cn("px-5 py-2 rounded-md text-sm font-medium border transition-colors", format === f
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                  {f}
                </button>))}
            </div>
          </div>

          {/* ── Section 4: Export As ────────────────────────────────────────── */}
          <div className="px-6 py-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">
              Export As
            </p>
            <InputCustom type="text" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="e.g. 2026-04-22-csv-data-export" className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
            <p className="text-xs text-gray-400 mt-1.5">
              File will be exported as <strong>{filename || "…"}</strong>.
              {format ? format.toLowerCase() : "csv"}
            </p>
          </div>

          {/* ── Footer: Export button ───────────────────────────────────────── */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {selectedTypes.size > 0
            ? `${selectedTypes.size} data type${selectedTypes.size > 1 ? "s" : ""} selected`
            : "No data types selected"}
              {format ? ` · ${format} format` : ""}
            </p>
            <Button className={cn("flex items-center w-fit gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-colors", selectedTypes.size > 0 && format
            ? "bg-brand-primary hover:bg-brand-primary-hover text-white"
            : "bg-slate-50 text-slate-700 cursor-not-allowed")} disabled={selectedTypes.size === 0 || !format}>
              <Download size={15}/>
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>);
}
