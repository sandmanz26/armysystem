import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { oaMonths } from "@/data/operationalAvailability";
import { MONTH_ABBR } from "../constants";
import { parseMonthLabel, monthToKey } from "../utils";
export function MonthRangePicker({ value, onChange, onClose }) {
    const [step, setStep] = useState(1);
    const [year, setYear] = useState(() => {
        if (value)
            return value.fromYear;
        const maxYear = Math.max(...oaMonths.map((m) => parseMonthLabel(m.month).year));
        return maxYear;
    });
    const [pending, setPending] = useState(() => value
        ? { fromYear: value.fromYear, fromMonth: value.fromMonth, toYear: value.toYear, toMonth: value.toMonth }
        : { fromYear: year, fromMonth: 0 });
    const hasFrom = pending.fromYear !== undefined;
    const hasTo = pending.toYear !== undefined && pending.toMonth !== undefined;
    const fromKey = hasFrom ? monthToKey(pending.fromYear, pending.fromMonth) : -1;
    const toKey = hasTo ? monthToKey(pending.toYear, pending.toMonth) : -1;
    const handleMonthClick = (m) => {
        if (step === 1) {
            setPending({ fromYear: year, fromMonth: m });
            setStep(2);
        }
        else {
            const clickedKey = monthToKey(year, m);
            const fromK = monthToKey(pending.fromYear, pending.fromMonth);
            if (clickedKey < fromK) {
                setPending({ fromYear: year, fromMonth: m, toYear: pending.fromYear, toMonth: pending.fromMonth });
            }
            else {
                setPending({ ...pending, toYear: year, toMonth: m });
            }
            setStep(1);
        }
    };
    return (<div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl w-72 p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          {step === 1 ? "Select start month" : "Select end month"}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={14}/>
        </button>
      </div>

      {(hasFrom || hasTo) && (<div className="text-xs text-brand-primary font-medium bg-red-50 rounded-lg px-3 py-1.5 mb-3">
          {hasFrom && !hasTo && `From: ${MONTH_ABBR[pending.fromMonth]} ${pending.fromYear}`}
          {hasFrom && hasTo && `${MONTH_ABBR[pending.fromMonth]} ${pending.fromYear} — ${MONTH_ABBR[pending.toMonth]} ${pending.toYear}`}
        </div>)}

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setYear((y) => y - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ChevronLeft size={14}/>
        </button>
        <span className="text-sm font-bold text-gray-800">{year}</span>
        <button onClick={() => setYear((y) => y + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ChevronRight size={14}/>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {MONTH_ABBR.map((name, m) => {
            const key = monthToKey(year, m);
            const isFrom = key === fromKey;
            const isTo = hasTo && key === toKey;
            const inRange = hasTo && key > fromKey && key < toKey;
            const isSelected = isFrom || isTo;
            return (<button key={name} onClick={() => handleMonthClick(m)} className={cn("py-2 rounded-lg text-xs font-medium transition-all", isSelected ? "bg-brand-primary text-white shadow-sm"
                    : inRange ? "bg-red-50 text-brand-primary"
                        : "text-gray-600 hover:bg-gray-100")}>
              {name}
            </button>);
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={() => { onChange(null); onClose(); }} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Clear
        </button>
        <button onClick={() => {
            if (hasFrom && hasTo) {
                onChange({ fromYear: pending.fromYear, fromMonth: pending.fromMonth, toYear: pending.toYear, toMonth: pending.toMonth });
                onClose();
            }
        }} disabled={!hasFrom || !hasTo} className={cn("flex-1 py-2 rounded-lg text-xs font-semibold transition-colors", hasFrom && hasTo
            ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
            : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
          Apply
        </button>
      </div>
    </div>);
}
