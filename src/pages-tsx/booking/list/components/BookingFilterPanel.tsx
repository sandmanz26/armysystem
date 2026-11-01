import { useState } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";

export interface BookingFilters {
  dateFrom: string;
  dateTo: string;
  trainingTypes: string[];
  trainingSlots: string[];
  briefingRooms: string[];
  coursewares: string[];
}

const TRAINING_TYPES = ["Group", "Individual"];
const TRAINING_SLOTS = ["AM Session", "PM Session", "Full Day", "Hourly", "Ad-Hoc"];
const BRIEFING_ROOMS = ["Briefing Room 1", "Briefing Room 2"];
const COURSEWARES = [
  "Day Test For SAR21/M16 BTP",
  "Night Test For SAR21/M16 BTP",
  "SAR21/M16 ATP (M)",
  "SAR21 Target Exposure Timing ATP (M)",
  "Zeroing 100m",
  "BTP Day Test",
  "BTP Night Test",
  "APS Practice 1A - 1B",
  "Advanced SAR21 Training Module",
];

export const EMPTY_FILTERS: BookingFilters = {
  dateFrom: "",
  dateTo: "",
  trainingTypes: [],
  trainingSlots: [],
  briefingRooms: [],
  coursewares: [],
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

interface CheckItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckItem({ label, checked, onChange }: CheckItemProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 accent-brand-primary cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <p className="text-sm font-semibold text-gray-800 mb-3">{title}</p>
      {children}
    </div>
  );
}

interface BookingFilterPanelProps {
  open: boolean;
  filters: BookingFilters;
  onApply: (f: BookingFilters) => void;
  onClose: () => void;
}

export function BookingFilterPanel({ open, filters, onApply, onClose }: BookingFilterPanelProps) {
  const [draft, setDraft] = useState<BookingFilters>({ ...filters });
  const [cwSearch, setCwSearch] = useState("");

  const visibleCoursewares = cwSearch.trim()
    ? COURSEWARES.filter((c) => c.toLowerCase().includes(cwSearch.toLowerCase()))
    : COURSEWARES;

  const handleClear = () => {
    setDraft({ ...EMPTY_FILTERS });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[2000] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[2100] w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800">Filters</h2>
              {(draft.trainingTypes.length + draft.trainingSlots.length + draft.briefingRooms.length + draft.coursewares.length + (draft.dateFrom ? 1 : 0) + (draft.dateTo ? 1 : 0)) > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                  {draft.trainingTypes.length + draft.trainingSlots.length + draft.briefingRooms.length + draft.coursewares.length + (draft.dateFrom ? 1 : 0) + (draft.dateTo ? 1 : 0)}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Booking Date */}
            <Section title="Booking Date">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <InputCustom
                    type="date"
                    value={draft.dateFrom}
                    onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
                    className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <InputCustom
                    type="date"
                    value={draft.dateTo}
                    onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
                    className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                  />
                </div>
              </div>
            </Section>

            {/* Training Type */}
            <Section title="Training Type(s)">
              <div className="space-y-2.5">
                {TRAINING_TYPES.map((t) => (
                  <CheckItem
                    key={t}
                    label={t}
                    checked={draft.trainingTypes.includes(t)}
                    onChange={() => setDraft((d) => ({ ...d, trainingTypes: toggle(d.trainingTypes, t) }))}
                  />
                ))}
              </div>
            </Section>

            {/* Training Slot */}
            <Section title="Training Slot">
              <div className="grid grid-cols-2 gap-2.5">
                {TRAINING_SLOTS.map((s) => (
                  <CheckItem
                    key={s}
                    label={s}
                    checked={draft.trainingSlots.includes(s)}
                    onChange={() => setDraft((d) => ({ ...d, trainingSlots: toggle(d.trainingSlots, s) }))}
                  />
                ))}
              </div>
            </Section>

            {/* Briefing Room */}
            <Section title="Briefing Room">
              <div className="space-y-2.5">
                {BRIEFING_ROOMS.map((r) => (
                  <CheckItem
                    key={r}
                    label={r}
                    checked={draft.briefingRooms.includes(r)}
                    onChange={() => setDraft((d) => ({ ...d, briefingRooms: toggle(d.briefingRooms, r) }))}
                  />
                ))}
              </div>
            </Section>

            {/* Courseware */}
            <Section title="Courseware">
              <div className="relative mb-3">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courseware..."
                  value={cwSearch}
                  onChange={(e) => setCwSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all bg-gray-50"
                />
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {visibleCoursewares.map((c) => (
                  <CheckItem
                    key={c}
                    label={c}
                    checked={draft.coursewares.includes(c)}
                    onChange={() => setDraft((d) => ({ ...d, coursewares: toggle(d.coursewares, c) }))}
                  />
                ))}
                {visibleCoursewares.length === 0 && (
                  <p className="text-xs text-gray-400 py-2">No courseware found.</p>
                )}
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <Button
              onClick={handleClear}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white"
            >
              Clear all
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              Apply Filters
            </Button>
          </div>
      </div>
    </>
  );
}
