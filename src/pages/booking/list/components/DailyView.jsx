import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { DAY_ABBREVS, MONTH_NAMES } from "../constants";
import { extractTime } from "../utils";
export function DailyView({ date, bookingByDate, onBack }) {
    const hours = Array.from({ length: 10 }, (_, i) => i + 8);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const dayBookings = bookingByDate[key] || [];
    const dayName = DAY_ABBREVS[date.getDay()];
    const monthName = MONTH_NAMES[date.getMonth()];
    return (<div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600"/>
        </button>
        <div>
          <h2 className="text-base font-semibold text-brand-primary">
            {dayName}, {monthName} {date.getDate()}, {date.getFullYear()}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""} scheduled</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px]">
          {hours.map((hour) => {
            const hourBookings = dayBookings.filter((b) => {
                const timeMatch = b.bookingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
                if (!timeMatch)
                    return false;
                let h = parseInt(timeMatch[1]);
                const period = timeMatch[3];
                if (period === "PM" && h !== 12)
                    h += 12;
                if (period === "AM" && h === 12)
                    h = 0;
                return h === hour;
            });
            return (<div key={hour} className={cn("flex border-b border-gray-100", hourBookings.length > 0 && "bg-orange-50/30")}>
                <div className="w-20 flex-shrink-0 py-4 px-3 border-r border-gray-100 text-right">
                  <span className="text-xs font-semibold text-gray-400">
                    {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
                  </span>
                </div>
                <div className="flex-1 py-2 px-3 min-h-[80px]">
                  {hourBookings.map((b) => (<div key={b.id} className="bg-white border border-orange-200 border-l-4 border-l-brand-primary rounded-md px-3 py-2.5 mb-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <div className="text-sm font-semibold text-gray-800">{b.program}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{extractTime(b.bookingTime)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{b.bookingId}</span>
                        <StatusBadge status={b.status} size="sm"/>
                      </div>
                    </div>))}
                </div>
              </div>);
        })}
        </div>
      </div>
    </div>);
}
