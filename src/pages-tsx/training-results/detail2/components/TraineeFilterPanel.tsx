import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TraineeFilters {
  results: string[];
  ranks: string[];
  weapons: string[];
  lanes: string[];
  details: string[];
}

export const EMPTY_TRAINEE_FILTERS: TraineeFilters = { results: [], ranks: [], weapons: [], lanes: [], details: [] };

const RESULT_OPTIONS = ["MARKSMAN", "PASSED", "FAILED"];

interface TraineeFilterPanelProps {
  open: boolean;
  filters: TraineeFilters;
  uniqueRanks: string[];
  uniqueWeapons: string[];
  uniqueLanes: string[];
  uniqueDetails: string[];
  onApply: (f: TraineeFilters) => void;
  onClose: () => void;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs rounded-full border transition-colors",
        active
          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
          : "border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary"
      )}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 last:border-0 px-5 py-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      {children}
    </div>
  );
}

export function TraineeFilterPanel({ open, filters, uniqueRanks, uniqueWeapons, uniqueLanes, uniqueDetails, onApply, onClose }: TraineeFilterPanelProps) {
  const activeCount = filters.results.length + filters.ranks.length + filters.weapons.length + filters.lanes.length + filters.details.length;
  const hasActive = activeCount > 0;

  const toggle = (field: "results" | "ranks" | "weapons" | "lanes" | "details", value: string) => {
    const prev = filters[field];
    const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
    onApply({ ...filters, [field]: next });
  };

  const clearAll = () => onApply(EMPTY_TRAINEE_FILTERS);

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

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[2100] w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-800">Filters</span>
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Section title="Result">
            <div className="flex flex-wrap gap-2">
              {RESULT_OPTIONS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  active={filters.results.includes(r)}
                  onClick={() => toggle("results", r)}
                />
              ))}
            </div>
          </Section>

          <Section title="Rank">
            <div className="flex flex-wrap gap-2">
              {uniqueRanks.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  active={filters.ranks.includes(r)}
                  onClick={() => toggle("ranks", r)}
                />
              ))}
            </div>
          </Section>

          <Section title="Weapon">
            <div className="flex flex-wrap gap-2">
              {uniqueWeapons.map((w) => (
                <Chip
                  key={w}
                  label={w}
                  active={filters.weapons.includes(w)}
                  onClick={() => toggle("weapons", w)}
                />
              ))}
            </div>
          </Section>

          <Section title="Detail">
            <div className="flex flex-wrap gap-2">
              {uniqueDetails.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={filters.details.includes(d)}
                  onClick={() => toggle("details", d)}
                />
              ))}
            </div>
          </Section>

          <Section title="Lane">
            <div className="flex flex-wrap gap-2">
              {uniqueLanes.map((l) => (
                <Chip
                  key={l}
                  label={l}
                  active={filters.lanes.includes(l)}
                  onClick={() => toggle("lanes", l)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={() => { clearAll(); onClose(); }}
            disabled={!hasActive}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
