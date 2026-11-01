import { cn } from "@/lib/utils";
import { aprilBookings } from "../constants";
function getMonthIntensity(count) {
    if (!count)
        return "bg-white";
    if (count <= 2)
        return "bg-blue-100";
    if (count <= 4)
        return "bg-blue-200";
    return "bg-blue-300";
}
export function MonthView() {
    const totalBookings = Object.values(aprilBookings).reduce((a, b) => a + b, 0);
    const weekendDays = [5, 6, 12, 13, 19, 20, 26]; // Sat/Sun
    const weekendBookings = weekendDays.reduce((sum, d) => sum + (aprilBookings[d] ?? 0), 0);
    const weekdayBookings = totalBookings - weekendBookings;
    const busiest = Object.entries(aprilBookings).reduce((a, b) => (b[1] > a[1] ? b : a), ["0", 0]);
    const avg = (totalBookings / 30).toFixed(1);
    // April 2026 starts on Wednesday (day index 2)
    const startDayOfWeek = 2;
    const daysInMonth = 30;
    const today = 30; // Apr 30 2026
    const calendarDays = [
        ...Array(startDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (calendarDays.length % 7 !== 0)
        calendarDays.push(null);
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7)
        weeks.push(calendarDays.slice(i, i + 7));
    return (<div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">April 2026</span>
          <span className="text-xs text-gray-400">
            {totalBookings} bookings · avg {avg}/day
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {[
            { label: "Low", color: "bg-blue-100" },
            { label: "Medium", color: "bg-blue-200" },
            { label: "High", color: "bg-blue-300" },
        ].map(({ label, color }) => (<div key={label} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-sm border border-gray-200", color)}/>
              <span>{label}</span>
            </div>))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-0 border-b border-gray-100">
        {[
            { label: "TOTAL BOOKINGS", value: totalBookings.toString(), color: "text-gray-800" },
            { label: "WEEKDAY", value: weekdayBookings.toString(), color: "text-blue-600" },
            { label: "WEEKEND", value: weekendBookings.toString(), color: "text-purple-600" },
            { label: "BUSIEST DAY", value: `${busiest[0]} Apr (${busiest[1]})`, color: "text-yellow-600" },
            { label: "AVG/DAY", value: avg, color: "text-green-600" },
        ].map(({ label, value, color }) => (<div key={label} className="px-5 py-4 border-r border-gray-100 last:border-r-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
            <div className={cn("text-2xl font-bold", color)}>{value}</div>
          </div>))}
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (<div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (<div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, di) => {
                if (!day)
                    return <div key={di} className="h-20"/>;
                const count = aprilBookings[day] ?? 0;
                const isToday = day === today;
                return (<div key={di} className={cn("h-20 rounded-lg p-2 border transition-colors cursor-pointer hover:opacity-80", getMonthIntensity(count), isToday ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-100")}>
                  <div className="flex items-start justify-between">
                    <span className={cn("text-xs font-semibold", isToday ? "text-blue-600" : "text-gray-600")}>
                      {day}
                      {isToday && <span className="ml-1 text-[9px] text-blue-400">TODAY</span>}
                    </span>
                  </div>
                  {count > 0 && (<div className="mt-auto pt-2">
                      <span className="text-[10px] text-gray-500">{count} bookings</span>
                    </div>)}
                </div>);
            })}
          </div>))}
      </div>

      {/* Insight bar */}
      <div className="mx-4 mb-4 px-4 py-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
        <span className="text-yellow-500 mr-2">⚡</span>
        <span className="text-xs text-gray-600">
          April peak: 9 Apr with 7 bookings. Weekend utilization at 32% — consider opening more weekend slots if demand
          exists.
        </span>
      </div>
    </div>);
}
