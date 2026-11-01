import { cn } from "@/lib/utils";
import { STATIONS, dayBookings, sessionColors, statusDot, HOURS, CURRENT_HOUR } from "../constants";
export function DayView() {
    const sessionPills = [
        { label: "AM Session", time: "8:00–12:00", count: 2, type: "AM" },
        { label: "PM Session", time: "1:00–5:00", count: 1, type: "PM" },
        { label: "Full Day", time: "8:00–5:00", count: 1, type: "Full" },
        { label: "Hourly", time: "Per hour", count: 2, type: "Hr" },
        { label: "Adhoc", time: "Cross-period", count: 1, type: "Ad" },
    ];
    const totalHours = HOURS.length; // 12 columns (7AM–6PM)
    return (<div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Day Schedule</span>
          <span className="text-xs text-gray-400">1 booking = entire station (15 lanes)</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {["Completed", "Ongoing", "Upcoming"].map((s) => (<div key={s} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-sm", s === "Completed" ? "bg-green-200" : s === "Ongoing" ? "bg-yellow-200" : "bg-blue-200")}/>
              <span>{s}</span>
            </div>))}
        </div>
      </div>

      {/* Session pills */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 flex-wrap">
        {sessionPills.map(({ label, time, count, type }) => {
            const c = sessionColors[type];
            return (<div key={type} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border", c.bg, c.text, "border-transparent")}>
              <div className={cn("w-2 h-2 rounded-full", c.dot)}/>
              <span>{label}</span>
              <span className="text-gray-400 font-normal">{time}</span>
              <span className={cn("ml-1 font-bold", c.text)}>{count}</span>
            </div>);
        })}
      </div>

      {/* Timeline grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] relative">
          {/* Hour labels */}
          <div className="flex border-b border-gray-100">
            <div className="w-28 flex-shrink-0"/>
            {HOURS.map((h) => (<div key={h} className="flex-1 text-center text-xs text-gray-400 py-2 border-l border-gray-50">
                {h <= 12 ? `${h}AM` : `${h - 12}PM`}
              </div>))}
          </div>

          {/* Current time overlay — full column height */}
          <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `calc(112px + ${((CURRENT_HOUR - 7) / totalHours) * 100}%)` }}>
            <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-tight text-center">
              4:30
              <br />
              PM
            </div>
            <div className="absolute top-6 bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-red-400"/>
          </div>

          {/* Station rows */}
          {STATIONS.map((station) => {
            const stationBookings = dayBookings.filter((b) => b.station === station);
            return (<div key={station} className="flex border-b border-gray-50" style={{ minHeight: 64 }}>
                {/* Station label */}
                <div className="w-28 flex-shrink-0 px-3 py-3">
                  <div className="text-xs font-bold text-gray-700">{station}</div>
                  <div className="text-[10px] text-gray-400">15 lanes</div>
                </div>

                {/* Timeline area */}
                <div className="flex-1 relative">
                  {/* Hour grid lines */}
                  {HOURS.map((_, i) => (<div key={i} className="absolute top-0 bottom-0 border-l border-gray-50" style={{ left: `${(i / totalHours) * 100}%` }}/>))}

                  {/* Bookings */}
                  {stationBookings.length === 0 ? (<div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
                      Available
                    </div>) : (stationBookings.map((b, bi) => {
                    const left = (b.startHour / totalHours) * 100;
                    const width = (b.durationHours / totalHours) * 100;
                    const c = sessionColors[b.sessionType];
                    const topOffset = bi * 28;
                    return (<div key={bi} className={cn("absolute rounded-md px-2 py-1.5 text-xs font-semibold flex items-center gap-1.5", c.bg, c.text)} style={{ left: `${left}%`, width: `${width}%`, top: topOffset + 8, minHeight: 24 }}>
                          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusDot[b.status])}/>
                          <div className="min-w-0">
                            <div className="font-bold truncate">{b.unitName}</div>
                            <div className="text-[10px] font-normal opacity-70 truncate">{b.timeLabel}</div>
                          </div>
                        </div>);
                }))}
                </div>
              </div>);
        })}
        </div>
      </div>
    </div>);
}
