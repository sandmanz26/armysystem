import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  open: boolean;
  filterStatus: string;
  filterRanks: Set<string>;
  filterUnits: Set<string>;
  uniqueRanks: string[];
  uniqueUnits: string[];
  hasActiveFilters: boolean;
  onSetFilterStatus: (s: string) => void;
  onToggleRank: (r: string) => void;
  onToggleUnit: (u: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs rounded-full border transition-colors",
        active
          ? "border-primary bg-primary-default/10 text-primary font-semibold"
          : "border-invert-default text-caption hover:border-primary hover:text-primary"
      )}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-invert-default last:border-0 px-5 py-4">
      <p className="text-sm font-semibold text-default mb-3">{title}</p>
      {children}
    </div>
  );
}

export function FilterPanel({
  open,
  filterStatus,
  filterRanks,
  filterUnits,
  uniqueRanks,
  uniqueUnits,
  hasActiveFilters,
  onSetFilterStatus,
  onToggleRank,
  onToggleUnit,
  onClearAll,
  onClose,
}: FilterPanelProps) {
  const activeCount =
    (filterStatus ? 1 : 0) + filterRanks.size + filterUnits.size;

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
          "fixed inset-y-0 right-0 z-[2100] w-[340px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-invert-default flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-default">Filters</span>
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-default text-invert-default text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-disabled hover:text-default hover:bg-default-default transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Section title="Status">
            <div className="flex flex-wrap gap-2">
              {["Active", "Inactive"].map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={filterStatus === s}
                  onClick={() => onSetFilterStatus(filterStatus === s ? "" : s)}
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
                  active={filterRanks.has(r)}
                  onClick={() => onToggleRank(r)}
                />
              ))}
            </div>
          </Section>

          <Section title="Unit Name">
            <div className="flex flex-wrap gap-2">
              {uniqueUnits.map((u) => (
                <Chip
                  key={u}
                  label={u}
                  active={filterUnits.has(u)}
                  onClick={() => onToggleUnit(u)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-invert-default flex gap-3 flex-shrink-0">
          <button
            onClick={() => { onClearAll(); onClose(); }}
            disabled={!hasActiveFilters}
            className="flex-1 py-2.5 rounded-xl border border-invert-default text-sm font-semibold text-caption hover:bg-default-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
