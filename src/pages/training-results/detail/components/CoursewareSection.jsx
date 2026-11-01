import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CW_OPTIONS, DETAIL } from "../constants";
export function CoursewareSection({ courseware, setCourseware }) {
    const [open, setOpen] = useState(false);
    return (<div className="flex items-end justify-between gap-6 mb-6">
      <div className="shrink-0">
        <div className="text-sm font-bold text-gray-800 mb-2">Start Time - End Time</div>
        <div className="text-sm text-gray-500">{DETAIL.startTime} – {DETAIL.endTime}</div>
      </div>
      <div className="w-80">
        <div className="text-sm font-bold text-gray-800 mb-2">Courseware</div>
        <div className="relative">
          <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white hover:border-gray-300 shadow-sm transition-colors">
            <span>{courseware}</span>
            <ChevronDown size={16} className={cn("text-gray-400 transition-transform", open && "rotate-180")}/>
          </button>
          {open && (<div className="absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {CW_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => { setCourseware(opt); setOpen(false); }} className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors", opt === courseware ? "text-brand-primary font-semibold" : "text-gray-700")}>
                  {opt}
                </button>))}
            </div>)}
        </div>
      </div>
    </div>);
}
