import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Calendar, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TrainingPerformanceTab2 } from "./components/TrainingPerformanceTab2";
import { NominalRollTab2 } from "./components/NominalRollTab2";
import { DetailListTab2 } from "./components/DetailListTab2";
import { LeaderboardTab2 } from "./components/LeaderboardTab2";
import { DETAIL, TABS, CW_OPTIONS } from "./constants";
import type { Tab } from "./types";

export function TrainingDetail2({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("Training Performance");
  const [dlOpen, setDlOpen] = useState(false);
  const [cwOpen, setCwOpen] = useState(false);
  const [courseware, setCourseware] = useState(DETAIL.courseware);
  const dlRef = useRef<HTMLDivElement>(null);
  const cwRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setDlOpen(false);
      if (cwRef.current && !cwRef.current.contains(e.target as Node)) setCwOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header card */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-brand-primary">{DETAIL.program}</h1>
                {/* View Booking Details — now an icon-only button next to the title,
                    instead of a separate outlined text button lower in the header
                    (that spot is now used for the courseware selector, below). */}
                <button
                  type="button"
                  onClick={() => onNavigate("/bookings/detail")}
                  title="View Booking Details"
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <Eye size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-400 font-mono">{DETAIL.bookingId}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-400">Created {DETAIL.createdOn}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Calendar size={12} className="text-gray-400" />
                {DETAIL.session}
              </div>
            </div>

            {/* Download dropdown */}
            <div className="relative" ref={dlRef}>
              <Button
                onClick={() => setDlOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover shadow-sm transition-colors w-auto"
              >
                <Download size={14} />
                Download
                <ChevronDown size={13} className={cn("transition-transform", dlOpen && "rotate-180")} />
              </Button>
              {dlOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden py-1">
                  <button type="button" onClick={() => setDlOpen(false)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    Training Results
                  </button>
                  <button type="button" onClick={() => setDlOpen(false)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    Take Home Package
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Courseware selector — pulled out of every tab into one shared
              control here. Switching it re-renders whichever tab is active. */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500">Courseware</span>
            <div className="relative" ref={cwRef}>
              <button
                type="button"
                onClick={() => setCwOpen(v => !v)}
                className="flex items-center gap-2 pl-3 pr-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white hover:border-gray-300 shadow-sm transition-colors min-w-[280px] justify-between"
              >
                <span className="font-semibold">{courseware}</span>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", cwOpen && "rotate-180")} />
              </button>
              {cwOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {CW_OPTIONS.map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => { setCourseware(opt); setCwOpen(false); }}
                      className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                        opt === courseware ? "text-brand-primary font-semibold" : "text-gray-700"
                      )}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap",
                  activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700"
                )}>
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content — each tab just renders for the shared `courseware` above,
          none of them own a duplicate selector anymore */}
      {activeTab === "Training Performance" && <TrainingPerformanceTab2 courseware={courseware} />}
      {activeTab === "Nominal Roll"          && <NominalRollTab2       courseware={courseware} />}
      {activeTab === "Detail List"           && <DetailListTab2        courseware={courseware} />}
      {activeTab === "Leaderboard"           && <LeaderboardTab2       courseware={courseware} />}
    </div>
  );
}
