import { useState, useRef, useEffect } from "react";
import { CalendarX } from "lucide-react";
export function BlackoutTooltip({ dates }) {
    const [show, setShow] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target))
            setShow(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const visible = dates.slice(0, 2);
    const extra = dates.slice(2);
    return (<div className="flex flex-col gap-0.5">
      {visible.map((d, i) => <div key={i} className="text-sm text-gray-700">{d}</div>)}
      {extra.length > 0 && (<div ref={ref} className="relative inline-block">
          <button onClick={() => setShow(v => !v)} className="text-xs text-brand-primary font-medium hover:underline">
            +{extra.length} more
          </button>
          {show && (<div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-[240px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">All Blackout Dates</p>
              {dates.map((d, i) => (<div key={i} className="flex items-start gap-2 mb-1.5">
                  <CalendarX size={12} className="text-orange-400 mt-0.5 flex-shrink-0"/>
                  <span className="text-xs text-gray-700">{d}</span>
                </div>))}
            </div>)}
        </div>)}
    </div>);
}
