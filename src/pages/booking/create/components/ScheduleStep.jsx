import { useState, useEffect, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomSelect } from "./CustomSelect";
import { TIME_OPTIONS } from "../constants";
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Hourly time slots ─────────────────────────────────────────────────────────
const HOURLY_SLOTS = [
  "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM",
];

// ── Multi-date calendar for individual hourly ─────────────────────────────────
function MultiDateCalendar({ selectedDates, onToggleDate, availableDates }) {
    const [baseYear, setBaseYear] = useState(2026);
    const [baseMonth, setBaseMonth] = useState(5); // June 2026
    const prev = () => { if (baseMonth === 0) { setBaseMonth(11); setBaseYear(y => y - 1); } else setBaseMonth(m => m - 1); };
    const next = () => { if (baseMonth === 11) { setBaseMonth(0); setBaseYear(y => y + 1); } else setBaseMonth(m => m + 1); };
    const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };

    const isSelected = (year, month, day) =>
        selectedDates.some(d => d.getFullYear() === year && d.getMonth() === month && d.getDate() === day);

    const renderMonth = (year, month) => (
        <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
            <div className="grid grid-cols-7 mb-1">
                {DOW.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
                {buildCells(year, month).map((cell, i) => {
                    const avail = !availableDates || !cell.cur ? cell.cur : availableDates.has(dateKey(year, month, cell.day));
                    const sel = cell.cur && isSelected(year, month, cell.day);
                    return (
                        <div key={i} className="relative">
                            <button type="button" disabled={!avail}
                                onClick={() => avail && onToggleDate(new Date(year, month, cell.day))}
                                className={cn("text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors",
                                    !cell.cur ? "text-gray-300 cursor-default" :
                                    !avail ? "text-gray-300 cursor-not-allowed line-through" :
                                    sel ? "bg-brand-primary text-white font-semibold" :
                                    "text-gray-700 hover:bg-red-50 font-medium"
                                )}>
                                {cell.day}
                            </button>
                            {avail && cell.cur && !sel && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex items-center gap-4">
            <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16}/></button>
            <div className="flex flex-1 gap-8">
                {renderMonth(baseYear, baseMonth)}
                <div className="w-px bg-gray-200 self-stretch"/>
                {renderMonth(second.year, second.month)}
            </div>
            <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16}/></button>
        </div>
    );
}

// ── Mock availability: generate available dates per section key ───────────────
function generateAvailability(scheduleType, section) {
    const key = `${scheduleType}|${section}`;
    const available = new Set();
    // Base: Jan–Jun 2025
    const year = 2025;
    for (let m = 0; m < 6; m++) {
        const days = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
            const date = new Date(year, m, d);
            const dow = date.getDay(); // 0=Sun
            let ok = false;
            if (key === "AM/PM|AM Session")   ok = [1, 3].includes(dow); // Mon, Wed
            else if (key === "AM/PM|PM Session") ok = [2, 4].includes(dow); // Tue, Thu
            else if (key === "FullDay|Single Day") ok = [1, 2, 3, 4, 5].includes(dow) && d % 3 !== 0;
            else if (key === "FullDay|Multiple Days") ok = [1, 2, 3, 4, 5].includes(dow) && d % 4 !== 0;
            else ok = true; // Ad-hoc: all weekdays
            if (ok) available.add(`${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
        }
    }
    return available;
}

function dateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function buildCells(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--)
        cells.push({ day: prevDays - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0)
        cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false });
    return cells;
}
function DateRangeCalendar({ startDate, endDate, onSelectStart, onSelectEnd, availableDates }) {
    const [baseYear, setBaseYear] = useState(2025);
    const [baseMonth, setBaseMonth] = useState(0);
    const prev = () => { if (baseMonth === 0) {
        setBaseMonth(11);
        setBaseYear(baseYear - 1);
    }
    else
        setBaseMonth(baseMonth - 1); };
    const next = () => { if (baseMonth === 11) {
        setBaseMonth(0);
        setBaseYear(baseYear + 1);
    }
    else
        setBaseMonth(baseMonth + 1); };
    const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };
    const isInRange = (year, month, day) => {
        if (!startDate || !endDate)
            return false;
        const d = new Date(year, month, day);
        return d >= startDate && d <= endDate;
    };
    const renderMonth = (year, month) => (<div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d) => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {buildCells(year, month).map((cell, i) => {
            const isAvailable = !availableDates || !cell.cur ? cell.cur : availableDates.has(dateKey(year, month, cell.day));
            const isStart = startDate && cell.cur && startDate.getFullYear() === year && startDate.getMonth() === month && startDate.getDate() === cell.day;
            const isEnd = endDate && cell.cur && endDate.getFullYear() === year && endDate.getMonth() === month && endDate.getDate() === cell.day;
            const inRange = cell.cur && isInRange(year, month, cell.day);
            return (<button key={i} type="button" disabled={!cell.cur || !isAvailable} onClick={() => {
                    if (!cell.cur || !isAvailable) return;
                    const newDate = new Date(year, month, cell.day);
                    if (startDate && endDate) { onSelectStart(newDate); onSelectEnd(null); }
                    else if (startDate && !endDate) {
                        if (newDate < startDate) { onSelectEnd(startDate); onSelectStart(newDate); }
                        else { onSelectEnd(newDate); }
                    } else { onSelectStart(newDate); }
                }} className={cn("text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors relative",
                    !cell.cur ? "text-gray-300 cursor-default" :
                    !isAvailable ? "text-gray-300 cursor-not-allowed line-through" :
                    isStart || isEnd ? "bg-brand-primary text-white font-semibold" :
                    inRange ? "bg-brand-primary/20 text-gray-700" :
                    "text-gray-700 hover:bg-red-50 font-medium")}>
              {cell.day}
              {isAvailable && cell.cur && !(isStart || isEnd) && !inRange && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
              )}
            </button>);
        })}
      </div>
    </div>);
    return (<div className="flex items-center gap-4">
      <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16}/></button>
      <div className="flex flex-1 gap-8">
        {renderMonth(baseYear, baseMonth)}
        <div className="w-px bg-gray-200 self-stretch"/>
        {renderMonth(second.year, second.month)}
      </div>
      <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16}/></button>
    </div>);
}
function DualCalendar({ selected, onSelect, availableDates }) {
    const [baseYear, setBaseYear] = useState(2025);
    const [baseMonth, setBaseMonth] = useState(0);
    const prev = () => { if (baseMonth === 0) {
        setBaseMonth(11);
        setBaseYear(baseYear - 1);
    }
    else
        setBaseMonth(baseMonth - 1); };
    const next = () => { if (baseMonth === 11) {
        setBaseMonth(0);
        setBaseYear(baseYear + 1);
    }
    else
        setBaseMonth(baseMonth + 1); };
    const second = baseMonth === 11 ? { month: 0, year: baseYear + 1 } : { month: baseMonth + 1, year: baseYear };
    const renderMonth = (year, month) => (<div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-gray-700 text-center mb-3">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d) => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {buildCells(year, month).map((cell, i) => {
            const isAvailable = !availableDates ? cell.cur : (cell.cur && availableDates.has(dateKey(year, month, cell.day)));
            const isSelected = selected && cell.cur && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === cell.day;
            return (<button key={i} type="button" disabled={!isAvailable} onClick={() => isAvailable && onSelect(new Date(year, month, cell.day))}
              className={cn("text-center py-1.5 text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors relative",
                !cell.cur ? "text-gray-300 cursor-default" :
                !isAvailable ? "text-gray-300 cursor-not-allowed line-through" :
                isSelected ? "bg-brand-primary text-white font-semibold" :
                "text-gray-700 hover:bg-red-50 font-medium")}>
              {cell.day}
              {isAvailable && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
              )}
            </button>);
        })}
      </div>
    </div>);
    return (<div className="flex items-center gap-4">
      <button type="button" onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16}/></button>
      <div className="flex flex-1 gap-8">
        {renderMonth(baseYear, baseMonth)}
        <div className="w-px bg-gray-200 self-stretch"/>
        {renderMonth(second.year, second.month)}
      </div>
      <button type="button" onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16}/></button>
    </div>);
}
export function ScheduleStep({ onUpdate, isIndividual = false }) {
    const [scheduleType, setScheduleType] = useState(isIndividual ? "Hourly" : null);
    const [section, setSection] = useState(null);

    // Individual hourly state — multiple slots + multiple dates
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);

    const toggleSlot = (slot) => setSelectedSlots(prev =>
        prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );

    const toggleDate = (date) => {
        setSelectedDates(prev => {
            const exists = prev.some(d => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate());
            return exists ? prev.filter(d => !(d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate())) : [...prev, date];
        });
    };

    // Compute available dates whenever schedule type + section changes
    const availableDates = useMemo(() => {
        if (isIndividual) return null; // all dates clickable for individual
        if (!scheduleType) return null;
        if (scheduleType === "Ad-hoc") return generateAvailability("Ad-hoc", null);
        if (!section) return null;
        return generateAvailability(scheduleType, section);
    }, [scheduleType, section, isIndividual]);

    const [briefing, setBriefing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [adHocStartDate, setAdHocStartDate] = useState(null);
    const [adHocEndDate, setAdHocEndDate] = useState(null);

    useEffect(() => {
        if (isIndividual) {
            onUpdate?.({ scheduleType: "Hourly", slots: selectedSlots, dates: selectedDates });
            return;
        }
        const snapshot = { scheduleType, section, briefing, selectedDate, startTime, endTime };
        if (scheduleType === "Ad-hoc") { snapshot.dateRangeStart = adHocStartDate; snapshot.dateRangeEnd = adHocEndDate; }
        onUpdate?.(snapshot);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleType, section, briefing, selectedDate, adHocStartDate, adHocEndDate, startTime, endTime, selectedSlots, selectedDates]);

    const sectionOptions = {
        "AM/PM": ["AM Session", "PM Session"],
        "FullDay": ["Single Day", "Multiple Days"],
    };
    const scheduleOpts = [
        { id: "AM/PM", label: "AM/PM Schedule" },
        { id: "FullDay", label: "Full Day Schedule" },
        { id: "Ad-hoc", label: "Ad-hoc Schedule" },
    ];

    // ── Individual Hourly UI ───────────────────────────────────────────────────
    if (isIndividual) {
        return (
            <div className="flex-1 overflow-auto p-6">
                <h2 className="text-base font-semibold text-gray-800 text-center mb-6">Schedule</h2>
                <div className="flex gap-6">
                    {/* Left panel — 35% */}
                    <div className="w-[35%] flex-shrink-0 bg-white border border-gray-200 rounded-lg p-5 space-y-5">
                        {/* Schedule type — locked to Hourly */}
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-3">Schedule Selection <span className="text-red-500">*</span></div>
                            <button type="button" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-brand-primary border-brand-primary text-white text-sm font-medium">
                                <span className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-white"/>
                                </span>
                                Hourly
                            </button>
                        </div>

                        {/* Time slot grid — 2 columns, multiple select */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-gray-700">
                                    Schedule Section <span className="text-red-500">*</span>
                                </div>
                                {selectedSlots.length > 0 && (
                                    <span className="text-[10px] font-medium text-brand-primary">
                                        {selectedSlots.length} selected
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {HOURLY_SLOTS.map(slot => {
                                    const isActive = selectedSlots.includes(slot);
                                    return (
                                        <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                                            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left",
                                                isActive ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"
                                            )}>
                                            <span className={cn("w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center flex-shrink-0",
                                                isActive ? "border-white bg-white/20" : "border-gray-300")}>
                                                {isActive && <Check size={8} className="text-white" strokeWidth={3}/>}
                                            </span>
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: multi-date calendar */}
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
                                {selectedDates.sort((a, b) => a - b).map((d, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                                        {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                        <button type="button" onClick={() => toggleDate(d)} className="hover:text-brand-primary-hover">×</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <MultiDateCalendar
                            selectedDates={selectedDates}
                            onToggleDate={toggleDate}
                            availableDates={availableDates}
                        />
                    </div>
                </div>
            </div>
        );
    }
    return (<div className="flex-1 overflow-auto p-6">
      <h2 className="text-base font-semibold text-gray-800 text-center mb-6">Schedule</h2>
      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Schedule Selection <span className="text-red-500">*</span></div>
            <div className="space-y-2">
              {scheduleOpts.map(({ id, label }) => (<button key={id} type="button" onClick={() => { setScheduleType(id); setSection(null); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors", scheduleType === id ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                  <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", scheduleType === id ? "border-white" : "border-gray-300")}>
                    {scheduleType === id && <span className="w-2 h-2 rounded-full bg-white"/>}
                  </span>
                  {label}
                </button>))}
            </div>
          </div>

          {scheduleType && scheduleType !== "Ad-hoc" && (<div>
              <div className="text-sm font-medium text-gray-700 mb-3">Schedule Section <span className="text-red-500">*</span></div>
              <div className="space-y-2">
                {sectionOptions[scheduleType].map((opt) => (<button key={opt} type="button" onClick={() => setSection(opt)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors", section === opt ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
                    <span className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", section === opt ? "border-white" : "border-gray-300")}>
                      {section === opt && <span className="w-2 h-2 rounded-full bg-white"/>}
                    </span>
                    {opt}
                  </button>))}
              </div>
            </div>)}

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Briefing Room <span className="text-red-500">*</span></div>
            <button type="button" onClick={() => setBriefing(!briefing)} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors", briefing ? "bg-brand-primary border-brand-primary text-white" : "border-gray-200 text-gray-700 hover:border-gray-300")}>
              <span className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0", briefing ? "bg-white border-white" : "border-gray-300")}>
                {briefing && <Check size={10} className="text-brand-primary" strokeWidth={3}/>}
              </span>
              Briefing Room
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-700">Select Date Slot <span className="text-red-500">*</span></div>
            {/* Legend */}
            {availableDates && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-brand-primary inline-block"/>Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 inline-flex items-center justify-center text-gray-300 text-[10px] line-through">15</span>Unavailable
                </span>
              </div>
            )}
          </div>

          {!scheduleType ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Select a schedule type to see available dates
            </div>
          ) : !section && scheduleType !== "Ad-hoc" ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Select a schedule section to see available dates
            </div>
          ) : scheduleType === "Ad-hoc" ? (<>
              <DateRangeCalendar startDate={adHocStartDate} endDate={adHocEndDate} onSelectStart={setAdHocStartDate} onSelectEnd={setAdHocEndDate} availableDates={availableDates}/>
              <div className="flex gap-4 mt-5">
                <CustomSelect value={startTime} onChange={setStartTime} options={TIME_OPTIONS} placeholder="Select start time" className="flex-1"/>
                <CustomSelect value={endTime} onChange={setEndTime} options={TIME_OPTIONS} placeholder="Select end time" className="flex-1"/>
              </div>
            </>) : (<DualCalendar selected={selectedDate} onSelect={setSelectedDate} availableDates={availableDates}/>)}
        </div>
      </div>
    </div>);
}
