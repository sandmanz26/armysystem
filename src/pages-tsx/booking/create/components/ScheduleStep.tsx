import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomSelect } from "./CustomSelect";
import { TIME_OPTIONS } from "../constants";
import type { ScheduleType, ScheduleSection, ScheduleSnapshot } from "../types";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const HOURLY_SLOTS = [
  "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM",
];

// Northvale public holidays 2026
const PUBLIC_HOLIDAYS: { year: number; month: number; day: number; name: string }[] = [
  { year: 2026, month: 0, day: 1,  name: "New Year's Day" },
  { year: 2026, month: 0, day: 29, name: "Chinese New Year" },
  { year: 2026, month: 0, day: 30, name: "Chinese New Year" },
  { year: 2026, month: 3, day: 3,  name: "Good Friday" },
  { year: 2026, month: 4, day: 1,  name: "Labour Day" },
  { year: 2026, month: 4, day: 23, name: "Vesak Day" },
  { year: 2026, month: 5, day: 26, name: "Hari Raya Haji" },
  { year: 2026, month: 7, day: 9,  name: "Founders' Day" },
  { year: 2026, month: 9, day: 23, name: "Deepavali" },
  { year: 2026, month: 11, day: 25, name: "Christmas Day" },
];

// Simulated fully booked dates
const FULLY_BOOKED: { year: number; month: number; day: number }[] = [
  { year: 2026, month: 5, day: 10 },
  { year: 2026, month: 5, day: 11 },
  { year: 2026, month: 5, day: 17 },
  { year: 2026, month: 5, day: 24 },
  { year: 2026, month: 6, day: 3  },
  { year: 2026, month: 6, day: 8  },
  { year: 2026, month: 6, day: 14 },
  { year: 2026, month: 6, day: 21 },
  { year: 2026, month: 6, day: 28 },
  { year: 2026, month: 7, day: 5  },
  { year: 2026, month: 7, day: 12 },
  { year: 2026, month: 7, day: 19 },
  { year: 2026, month: 7, day: 25 },
  { year: 2026, month: 8, day: 2  },
  { year: 2026, month: 8, day: 9  },
  { year: 2026, month: 8, day: 16 },
  { year: 2026, month: 8, day: 23 },
];

type CalendarCell = { day: number; cur: boolean; holiday: string | null; fullyBooked: boolean };

function buildCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false, holiday: null, fullyBooked: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const holiday = PUBLIC_HOLIDAYS.find(h => h.year === year && h.month === month && h.day === d);
    const fullyBooked = FULLY_BOOKED.some(fb => fb.year === year && fb.month === month && fb.day === d);
    cells.push({ day: d, cur: true, holiday: holiday?.name ?? null, fullyBooked });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false, holiday: null, fullyBooked: false });
  }
  return cells;
}

function CalendarLegend({ showAvailableDot = false, showOtherCwDot = false }: { showAvailableDot?: boolean; showOtherCwDot?: boolean }) {
  return (
    <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center" />
        <span className="text-xs text-gray-500">Selected</span>
      </div>
      {showAvailableDot && (
        <div className="flex items-center gap-1.5">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full border border-gray-200" />
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-500">Available</span>
        </div>
      )}
      {showOtherCwDot && (
        <div className="flex items-center gap-1.5">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full border border-blue-200 bg-blue-50" />
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
          </div>
          <span className="text-xs text-gray-500">Other Courseware</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center" />
        <span className="text-xs text-gray-500 line-through">Fully Booked</span>
      </div>
    </div>
  );
}

function MultiDateCalendar({
  selectedDates, onToggleDate,
}: {
  selectedDates: Date[];
  onToggleDate: (d: Date) => void;
}) {
  const [baseYear, setBaseYear] = useState(2026);
  const [baseMonth, setBaseMonth] = useState(5);

  const prev = () => { if (baseMonth === 0) { setBaseMonth(11); setBaseYear(y => y - 1); } else setBaseMonth(m => m - 1); };
  const next = () => { if (baseMonth === 11) { setBaseMonth(0); setBaseYear(y => y + 1); } else setBaseMonth(m => m + 1); };
  const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };

  const isSelected = (year: number, month: number, day: number) =>
    selectedDates.some(d => d.getFullYear() === year && d.getMonth() === month && d.getDate() === day);

  const renderMonth = (year: number, month: number) => (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {buildCells(year, month).map((cell, i) => {
          const sel = cell.cur && isSelected(year, month, cell.day);
          const isDisabled = !cell.cur || cell.fullyBooked;
          return (
            <div key={i} className="relative">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onToggleDate(new Date(year, month, cell.day))}
                className={cn(
                  "text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors",
                  !cell.cur
                    ? "text-gray-300 cursor-default"
                    : cell.fullyBooked
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                    : sel
                    ? "bg-brand-primary text-white font-semibold"
                    : "text-gray-700 hover:bg-red-50 font-medium"
                )}
              >
                {cell.day}
              </button>
              {cell.cur && !sel && !cell.fullyBooked && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
        <div className="flex flex-1 gap-8">
          {renderMonth(baseYear, baseMonth)}
          <div className="w-px bg-gray-200 self-stretch" />
          {renderMonth(second.year, second.month)}
        </div>
        <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
      </div>
      <CalendarLegend showAvailableDot={true} />
    </div>
  );
}

function DateRangeCalendar({
  startDate, endDate, onSelectStart, onSelectEnd,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onSelectStart: (d: Date) => void;
  onSelectEnd: (d: Date) => void;
}) {
  const [baseYear, setBaseYear] = useState(2025);
  const [baseMonth, setBaseMonth] = useState(0);

  const prev = () => { if (baseMonth === 0) { setBaseMonth(11); setBaseYear(baseYear - 1); } else setBaseMonth(baseMonth - 1); };
  const next = () => { if (baseMonth === 11) { setBaseMonth(0); setBaseYear(baseYear + 1); } else setBaseMonth(baseMonth + 1); };
  const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };

  const isInRange = (year: number, month: number, day: number) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d >= startDate && d <= endDate;
  };

  const renderMonth = (year: number, month: number) => (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d) => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {buildCells(year, month).map((cell, i) => {
          const isStart = !!(startDate && cell.cur && startDate.getFullYear() === year && startDate.getMonth() === month && startDate.getDate() === cell.day);
          const isEnd = !!(endDate && cell.cur && endDate.getFullYear() === year && endDate.getMonth() === month && endDate.getDate() === cell.day);
          const inRange = cell.cur && isInRange(year, month, cell.day);
          const isDisabled = !cell.cur || cell.fullyBooked;
          return (
            <button key={i} type="button"
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                const newDate = new Date(year, month, cell.day);
                if (startDate && endDate) { onSelectStart(newDate); onSelectEnd(null as any); }
                else if (startDate && !endDate) { if (newDate < startDate) { onSelectEnd(startDate); onSelectStart(newDate); } else { onSelectEnd(newDate); } }
                else { onSelectStart(newDate); }
              }}
              className={cn(
                "text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors",
                !cell.cur
                  ? "text-gray-300 cursor-default"
                  : cell.fullyBooked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  : isStart || isEnd
                  ? "bg-brand-primary text-white font-semibold"
                  : inRange
                  ? "bg-brand-primary/20 text-gray-700"
                  : "text-gray-700 hover:bg-red-50"
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
        <div className="flex flex-1 gap-8">
          {renderMonth(baseYear, baseMonth)}
          <div className="w-px bg-gray-200 self-stretch" />
          {renderMonth(second.year, second.month)}
        </div>
        <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
      </div>
      <CalendarLegend />
    </div>
  );
}

function DualCalendar({ selected, onSelect, bookedByOthers = [] }: { selected: Date | null; onSelect: (d: Date) => void; bookedByOthers?: Date[] }) {
  const [baseYear, setBaseYear] = useState(2026);
  const [baseMonth, setBaseMonth] = useState(5);

  const prev = () => { if (baseMonth === 0) { setBaseMonth(11); setBaseYear(baseYear - 1); } else setBaseMonth(baseMonth - 1); };
  const next = () => { if (baseMonth === 11) { setBaseMonth(0); setBaseYear(baseYear + 1); } else setBaseMonth(baseMonth + 1); };
  const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };

  const isBookedByOther = (year: number, month: number, day: number) =>
    bookedByOthers.some(d => d.getFullYear() === year && d.getMonth() === month && d.getDate() === day);

  const showOtherCwDot = bookedByOthers.length > 0;

  const renderMonth = (year: number, month: number) => (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d) => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {buildCells(year, month).map((cell, i) => {
          const isSelectedDay = !!(selected && cell.cur && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === cell.day);
          const otherCw = cell.cur && isBookedByOther(year, month, cell.day);
          const isDisabled = !cell.cur || cell.fullyBooked;
          return (
            <div key={i} className="relative">
              <button type="button"
                disabled={isDisabled}
                title={otherCw ? "Booked by another courseware" : undefined}
                onClick={() => !isDisabled && onSelect(new Date(year, month, cell.day))}
                className={cn(
                  "text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors",
                  !cell.cur
                    ? "text-gray-300 cursor-default"
                    : cell.fullyBooked
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                    : isSelectedDay
                    ? "bg-brand-primary text-white font-semibold"
                    : otherCw
                    ? "bg-blue-50 text-blue-600 border border-blue-200 font-medium"
                    : "text-gray-700 hover:bg-red-50"
                )}
              >
                {cell.day}
              </button>
              {cell.cur && !isSelectedDay && !cell.fullyBooked && otherCw && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
        <div className="flex flex-1 gap-8">
          {renderMonth(baseYear, baseMonth)}
          <div className="w-px bg-gray-200 self-stretch" />
          {renderMonth(second.year, second.month)}
        </div>
        <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
      </div>
      <CalendarLegend showOtherCwDot={showOtherCwDot} />
    </div>
  );
}

type ScheduleEntry = {
  scheduleType: ScheduleType;
  section: ScheduleSection;
  briefing: boolean;
  selectedDate: Date | null;
  startTime: string;
  endTime: string;
  adHocStartDate: Date | null;
  adHocEndDate: Date | null;
};

const makeDefaultEntry = (): ScheduleEntry => ({
  scheduleType: null, section: null, briefing: false, selectedDate: null,
  startTime: "", endTime: "", adHocStartDate: null, adHocEndDate: null,
});

export function ScheduleStep({ onUpdate, isIndividual = false, bookingCourseware }: {
  onUpdate?: (s: ScheduleSnapshot) => void;
  isIndividual?: boolean;
  bookingCourseware?: string;
}) {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const toggleSlot = (slot: string) => setSelectedSlots(prev =>
    prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
  );
  const toggleDate = (date: Date) => {
    setSelectedDates(prev => {
      const exists = prev.some(d => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate());
      return exists ? prev.filter(d => !(d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate())) : [...prev, date];
    });
  };

  const coursewareList = bookingCourseware
    ? bookingCourseware.split(", ").map((c) => c.trim()).filter(Boolean)
    : [];
  const isMultiCourseware = !isIndividual && coursewareList.length > 1;
  const [activeCourseware, setActiveCourseware] = useState(() => coursewareList[0] ?? "");

  const initSchedulesMap = (): Record<string, ScheduleEntry> => {
    const keys = isMultiCourseware ? coursewareList : ["default"];
    const map: Record<string, ScheduleEntry> = {};
    keys.forEach((k) => { map[k] = makeDefaultEntry(); });
    return map;
  };
  const [schedulesMap, setSchedulesMap] = useState<Record<string, ScheduleEntry>>(initSchedulesMap);

  const schedKey = isMultiCourseware ? activeCourseware : "default";
  const cur = schedulesMap[schedKey] ?? makeDefaultEntry();

  const setField = <K extends keyof ScheduleEntry>(field: K, value: ScheduleEntry[K]) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [schedKey]: { ...(prev[schedKey] ?? makeDefaultEntry()), [field]: value },
    }));
  };

  const { scheduleType, section, briefing, selectedDate, startTime, endTime, adHocStartDate, adHocEndDate } = cur;

  useEffect(() => {
    if (isIndividual) {
      onUpdate?.({ scheduleType: "Hourly" as ScheduleType, section: null, briefing: false, selectedDate: null });
      return;
    }
    const snapshot: ScheduleSnapshot = { scheduleType, section, briefing, selectedDate, startTime, endTime };
    if (scheduleType === "Ad-hoc") { snapshot.dateRangeStart = adHocStartDate; snapshot.dateRangeEnd = adHocEndDate; }
    onUpdate?.(snapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleType, section, briefing, selectedDate, adHocStartDate, adHocEndDate, startTime, endTime, selectedSlots, selectedDates, schedKey]);

  const sectionOptions: Record<string, string[]> = {
    "FullDay": ["Single Day", "Multiple Days"],
  };

  const scheduleOpts: { id: ScheduleType; label: string }[] = [
    { id: "AM Session", label: "AM Session" },
    { id: "PM Session", label: "PM Session" },
    { id: "FullDay",    label: "Full Day Schedule" },
    { id: "Ad-hoc",    label: "Ad-hoc Schedule" },
  ];

  if (isIndividual) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6">
          <div className="w-[35%] flex-shrink-0 bg-white border border-gray-200 rounded-lg p-5 space-y-5">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">Schedule Selection <span className="text-red-500">*</span></div>
              <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-brand-primary border-brand-primary text-white text-sm font-medium">
                <span className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
                Hourly
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Schedule Section <span className="text-red-500">*</span></div>
                {selectedSlots.length > 0 && (
                  <span className="text-[10px] font-medium text-brand-primary">{selectedSlots.length} selected</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HOURLY_SLOTS.map(slot => {
                  const isActive = selectedSlots.includes(slot);
                  return (
                    <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left",
                        isActive ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                      <span className={cn("w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center",
                        isActive ? "border-white bg-white/20" : "border-gray-300")}>
                        {isActive && <Check size={8} className="text-white" strokeWidth={3} />}
                      </span>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-700">
                Select Date Slot <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-400">(Select one or more dates)</span>
              </div>
              {selectedDates.length > 0 && (
                <span className="text-xs text-brand-primary font-medium">{selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected</span>
              )}
            </div>
            {selectedDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[...selectedDates].sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                    {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    <button type="button" onClick={() => toggleDate(d)} className="hover:text-brand-primary-hover">×</button>
                  </span>
                ))}
              </div>
            )}
            <MultiDateCalendar selectedDates={selectedDates} onToggleDate={toggleDate} />
          </div>
        </div>
      </div>
    );
  }

  const otherCwDates: Date[] = isMultiCourseware
    ? coursewareList
        .filter((cw) => cw !== schedKey)
        .map((cw) => schedulesMap[cw]?.selectedDate)
        .filter((d): d is Date => d instanceof Date)
    : [];

  return (
    <div className="flex-1 overflow-auto p-6">
      {isMultiCourseware && (
        <div className="mb-5">
          <div className="text-xs text-gray-400 font-medium mb-1">Configuring schedule for courseware:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {coursewareList.map((cw) => {
              const hasSchedule = !!(schedulesMap[cw]?.scheduleType);
              return (
                <button key={cw} type="button" onClick={() => setActiveCourseware(cw)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5",
                    activeCourseware === cw
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary")}>
                  {hasSchedule && (
                    <span className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0",
                      activeCourseware === cw ? "bg-white/20" : "bg-green-100")}>
                      <Check size={8} className={activeCourseware === cw ? "text-white" : "text-green-600"} strokeWidth={3} />
                    </span>
                  )}
                  {cw}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Each courseware requires its own schedule. Switch tabs to configure each one.
          </p>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Schedule Selection <span className="text-red-500">*</span></div>
            <div className="space-y-2">
              {scheduleOpts.map(({ id, label }) => (
                <button key={id!} type="button"
                  onClick={() => { setField("scheduleType", id); setField("section", null); }}
                  className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    scheduleType === id ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                  <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    scheduleType === id ? "border-white" : "border-gray-300")}>
                    {scheduleType === id && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {scheduleType === "FullDay" && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">Schedule Section <span className="text-red-500">*</span></div>
              <div className="space-y-2">
                {sectionOptions[scheduleType].map((opt) => (
                  <button key={opt} type="button" onClick={() => setField("section", opt)}
                    className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      section === opt ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                    <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      section === opt ? "border-white" : "border-gray-300")}>
                      {section === opt && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Additional Facilities</div>
            <button type="button" onClick={() => setField("briefing", !briefing)}
              className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                briefing ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
              <span className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                briefing ? "bg-white border-white" : "border-gray-300")}>
                {briefing && <Check size={10} className="text-brand-primary" strokeWidth={3} />}
              </span>
              Include Briefing Room
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm font-medium text-gray-700 mb-4">Select Date Slot <span className="text-red-500">*</span></div>
          {scheduleType === "Ad-hoc" ? (
            <>
              <DateRangeCalendar
                startDate={adHocStartDate} endDate={adHocEndDate}
                onSelectStart={(d) => setField("adHocStartDate", d)}
                onSelectEnd={(d) => setField("adHocEndDate", d)}
              />
              <div className="flex gap-4 mt-5">
                <CustomSelect value={startTime} onChange={(v) => setField("startTime", v)} options={TIME_OPTIONS} placeholder="Select start time" className="flex-1" />
                <CustomSelect value={endTime} onChange={(v) => setField("endTime", v)} options={TIME_OPTIONS} placeholder="Select end time" className="flex-1" />
              </div>
            </>
          ) : (
            <DualCalendar selected={selectedDate} onSelect={(d) => setField("selectedDate", d)} bookedByOthers={otherCwDates} />
          )}
        </div>
      </div>
    </div>
  );
}
