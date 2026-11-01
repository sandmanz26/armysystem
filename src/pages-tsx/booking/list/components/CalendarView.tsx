import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking } from "@/data/mock";
import { bookings } from "@/data/mock";
import { cn } from "@/lib/utils";
import { MONTH_NAMES, DAY_ABBREVS, TODAY } from "../constants";
import type { CalendarMode } from "../types";
import { dateKey, bookingDateKeys, getCalendarWeeks } from "../utils";
import { CalendarEventCard } from "./CalendarEventCard";
import { DailyView } from "./DailyView";
import { ViewToggle } from "./ViewToggle";

interface CalendarViewProps {
  onSetViewMode: (mode: "list" | "calendar") => void;
}

export function CalendarView({ onSetViewMode }: CalendarViewProps) {
  const [calMode, setCalMode] = useState<CalendarMode>("Month");
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(3);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calWeeks = useMemo(() => getCalendarWeeks(calYear, calMonth), [calYear, calMonth]);

  const bookingByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      for (const k of bookingDateKeys(b.bookingDate)) {
        if (!map[k]) map[k] = [];
        map[k].push(b);
      }
    }
    return map;
  }, []);

  const navPrev = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const navNext = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };
  const goToday = () => { setCalYear(2026); setCalMonth(3); };
  const todayKey = dateKey(TODAY);

  if (calMode === "Daily" && selectedDate) {
    return (
      <DailyView
        date={selectedDate}
        bookingByDate={bookingByDate}
        onBack={() => { setSelectedDate(null); setCalMode("Month"); }}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 gap-3">
        {/* Mode selector */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["Month", "Weekly", "Daily"] as CalendarMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setCalMode(m)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  calMode === m
                    ? "bg-white text-brand-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1">
          <button onClick={navPrev} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button onClick={navNext} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>

        <ViewToggle viewMode="calendar" onSetViewMode={onSetViewMode} />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {DAY_ABBREVS.map((d) => (
          <div key={d} className="py-2.5 text-center text-xs font-bold text-gray-400 tracking-wide uppercase border-r border-gray-100 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {calWeeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0" style={{ minHeight: "110px" }}>
          {week.map((day, di) => {
            const key = dateKey(day);
            const isCurrentMonth = day.getMonth() === calMonth;
            const isToday = key === todayKey;
            const dayBookings = bookingByDate[key] || [];

            return (
              <div
                key={di}
                onClick={() => { setSelectedDate(day); setCalMode("Daily"); }}
                className={cn(
                  "border-r border-gray-100 last:border-r-0 p-2 cursor-pointer transition-colors",
                  !isCurrentMonth ? "bg-gray-50/70" : "hover:bg-gray-50",
                  isToday && "bg-blue-50/40"
                )}
              >
                <div className="flex justify-end mb-1.5">
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full",
                    isToday ? "bg-brand-primary text-white" : isCurrentMonth ? "text-gray-700" : "text-gray-300"
                  )}>
                    {day.getDate()}
                  </span>
                </div>
                {dayBookings.slice(0, 2).map((b) => (
                  <CalendarEventCard key={b.id} booking={b} />
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[10px] text-brand-primary font-semibold px-1 mt-0.5">
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
