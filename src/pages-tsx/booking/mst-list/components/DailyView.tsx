import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Booking } from "@/data/mock";
import { DAY_ABBREVS, MONTH_NAMES } from "../constants";
import { extractTime } from "../utils";
import { parseTimeRange, layoutOverlappingBlocks } from "@/lib/dayViewLayout";

interface DailyViewProps {
  date: Date;
  bookingByDate: Record<string, Booking[]>;
  onBack: () => void;
}

const DAY_START_HOUR = 8;
const HOURS = Array.from({ length: 10 }, (_, i) => i + DAY_START_HOUR);
const HOUR_HEIGHT = 64; // px
const MAX_INLINE_COLUMNS = 5;
const SCROLL_COLUMN_WIDTH = 168; // px, used once a cluster exceeds MAX_INLINE_COLUMNS

export function DailyView({ date, bookingByDate, onBack }: DailyViewProps) {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayBookings = bookingByDate[key] || [];
  const dayName = DAY_ABBREVS[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];

  const laidOut = useMemo(() => {
    const blocks = dayBookings
      .map((b) => {
        const range = parseTimeRange(b.bookingTime, DAY_START_HOUR);
        return range ? { ...range, item: b } : null;
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
    return layoutOverlappingBlocks(blocks);
  }, [dayBookings]);

  const maxColsInDay = laidOut.reduce((m, b) => Math.max(m, b.cols), 0);
  const needsScroll = maxColsInDay > MAX_INLINE_COLUMNS;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-brand-primary">
            {dayName}, {monthName} {date.getDate()}, {date.getFullYear()}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""} scheduled</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[600px] relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Hour gridlines + labels */}
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex border-b border-gray-100"
              style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            >
              <div className="w-20 flex-shrink-0 h-full py-2 px-3 border-r border-gray-100 text-right">
                <span className="text-xs font-semibold text-gray-400">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
                </span>
              </div>
              <div className="flex-1" />
            </div>
          ))}

          {/* Booking blocks — each spans its full duration; overlapping bookings sit side by side */}
          <div className="absolute top-0 bottom-0 left-20 right-0 overflow-x-auto">
            <div
              className="relative h-full"
              style={needsScroll ? { minWidth: maxColsInDay * SCROLL_COLUMN_WIDTH } : undefined}
            >
              {laidOut.map(({ item: b, startMin, endMin, col, cols }) => (
                <div
                  key={b.id}
                  className="absolute bg-white border border-orange-200 border-l-4 border-l-brand-primary rounded-md px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  style={{
                    top: (startMin / 60) * HOUR_HEIGHT + 2,
                    height: Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 4, 44),
                    left: needsScroll ? col * SCROLL_COLUMN_WIDTH : `${(col / cols) * 100}%`,
                    width: needsScroll ? SCROLL_COLUMN_WIDTH - 8 : `calc(${100 / cols}% - 8px)`,
                  }}
                >
                  <div className="text-sm font-semibold text-gray-800 truncate">{b.program}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{extractTime(b.bookingTime)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 truncate">{b.bookingId}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
