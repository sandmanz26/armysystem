import { useState } from "react";
import { cn } from "@/lib/utils";
import { TopCards } from "./components/TopCards";
import { TeamBar } from "./components/TeamBar";
import { WeekView } from "./components/WeekView";
import { DayView } from "./components/DayView";
import { MonthView } from "./components/MonthView";
export function Dashboard() {
    const [view, setView] = useState("Week");
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-6">
        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {["Day", "Week", "Month"].map((v) => (<button key={v} onClick={() => setView(v)} className={cn("px-5 py-2 text-sm font-semibold transition-colors", view === v ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700")}>
                {v}
              </button>))}
          </div>
        </div>

        <TopCards view={view}/>
        <TeamBar />

        {view === "Week" && <WeekView />}
        {view === "Day" && <DayView />}
        {view === "Month" && <MonthView />}
      </div>
    </div>);
}
