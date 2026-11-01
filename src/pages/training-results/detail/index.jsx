import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TrainingPerformanceTab } from "./components/TrainingPerformanceTab";
import { NominalRollTab } from "./components/NominalRollTab";
import { DetailListTab } from "./components/DetailListTab";
import { LeaderboardTab } from "./components/LeaderboardTab";
import { DetailView } from "./components/DetailView";
import { DETAIL, TABS } from "./constants";
export function TrainingDetail({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("Training Performance");
    const [dlOpen, setDlOpen] = useState(false);
    const [courseware, setCourseware] = useState(DETAIL.courseware);
    const [viewingDetailIdx, setViewingDetailIdx] = useState(null);
    const dlRef = useRef(null);
    useEffect(() => {
        const h = (e) => {
            if (dlRef.current && !dlRef.current.contains(e.target))
                setDlOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    if (viewingDetailIdx !== null) {
        return (<DetailView detailIndex={viewingDetailIdx} courseware={courseware} onBack={() => setViewingDetailIdx(null)}/>);
    }
    return (<div className="flex-1 overflow-auto bg-gray-50">
      {/* Header card */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-brand-primary">{DETAIL.program}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-400 font-mono">{DETAIL.bookingId}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"/>
                <span className="text-xs text-gray-400">Created {DETAIL.createdOn}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Calendar size={12} className="text-gray-400"/>
                {DETAIL.session}
              </div>
            </div>

            {/* Download dropdown */}
            <div className="relative" ref={dlRef}>
              <Button onClick={() => setDlOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover shadow-sm transition-colors w-auto">
                <Download size={14}/>
                Download
                <ChevronDown size={13} className={cn("transition-transform", dlOpen && "rotate-180")}/>
              </Button>
              {dlOpen && (<div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden py-1">
                  <button type="button" onClick={() => setDlOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <Download size={13} className="text-gray-400"/> Training Results
                  </button>
                  <button type="button" onClick={() => setDlOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <Download size={13} className="text-gray-400"/> Take Home Package
                  </button>
                </div>)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-4">
            <Button type="outline" onClick={() => onNavigate("/bookings/detail")} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-auto">
              View Booking Details
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium relative transition-colors whitespace-nowrap", activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700")}>
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"/>}
              </button>))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "Training Performance" && (<TrainingPerformanceTab courseware={courseware} setCourseware={setCourseware}/>)}
      {activeTab === "Nominal Roll" && (<NominalRollTab courseware={courseware} setCourseware={setCourseware}/>)}
      {activeTab === "Detail List" && (<DetailListTab courseware={courseware} setCourseware={setCourseware} onViewDetail={setViewingDetailIdx}/>)}
      {activeTab === "Leaderboard" && (<LeaderboardTab courseware={courseware} setCourseware={setCourseware}/>)}
    </div>);
}
