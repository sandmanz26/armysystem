// Booking 2.0 Lane Configuration — "Copy to" modal, per the screenshots.
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/checkbox";
import type { StationRef, StationProgress } from "../laneConfigTypes";

interface CopyToModalProps {
  source: StationRef;
  sourceProgress: StationProgress;
  stationType: "flat" | "cshaped";
  coursewareList: string[];
  stationsByCourseware: (cw: string) => StationRef[];
  onClose: () => void;
  onConfirm: (targets: StationRef[]) => void;
}

export function CopyToModal({ source, sourceProgress, stationType, coursewareList, stationsByCourseware, onClose, onConfirm }: CopyToModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const stationKey = (s: StationRef) => `${s.courseware}::${s.type}::${s.index}`;

  const groups = coursewareList.map((cw) => ({
    courseware: cw,
    stations: stationsByCourseware(cw).filter((s) => !(s.courseware === source.courseware && s.type === source.type && s.index === source.index)),
  }));

  const toggleGroup = (cw: string) => {
    const group = groups.find((g) => g.courseware === cw);
    if (!group) return;
    const keys = group.stations.map(stationKey);
    const allSelected = keys.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const toggleOne = (s: StationRef) => {
    const key = stationKey(s);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const label = stationType === "flat" ? "Flat Screens" : "C-Shaped";
  const allStations = groups.flatMap((g) => g.stations);
  const allSelectedGlobal = allStations.length > 0 && allStations.every((s) => selected.has(stationKey(s)));

  const toggleAll = () => {
    setSelected(allSelectedGlobal ? new Set() : new Set(allStations.map(stationKey)));
  };

  const handleConfirm = () => {
    const targets = allStations.filter((s) => selected.has(stationKey(s)));
    onConfirm(targets);
  };

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[720px] max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-figma-subtle flex-shrink-0">
            <h3 className="text-lg font-bold text-figma-default">Copy to</h3>
            <button type="button" onClick={onClose} className="text-figma-disabled hover:text-figma-caption"><X size={18} /></button>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1">
            <p className="text-sm text-figma-body mb-4">
              This feature will copy everything, including role, controlled item/weapon, and lane status, to each station you select, exactly as configured in the source base station below.
            </p>

            <p className="text-xs font-semibold text-figma-body mb-1.5">Copying from</p>
            <div className="px-4 py-3 border border-figma-subtle rounded-lg mb-5">
              <p className="text-sm font-bold text-figma-default">{source.courseware} · {source.label}</p>
              <p className="text-xs text-figma-body mt-1">
                {sourceProgress.activeCount}/{sourceProgress.activeCount} lanes active ·{" "}
                <span className="text-green-600 font-semibold">{sourceProgress.roleAssigned}/{sourceProgress.activeCount} role-assigned</span> ·{" "}
                <span className="text-green-600 font-semibold">{sourceProgress.weaponAssigned}/{sourceProgress.activeCount} weapon-assigned</span>
              </p>
            </div>

            <p className="text-sm font-semibold text-figma-default mb-0.5">Copy to <span className="text-figma-primary">*</span></p>
            <p className="text-xs text-figma-body mb-2">Select the courseware or stations to copy this lane configuration to.</p>

            <div className="border border-figma-subtle rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-figma-dangersoft/70">
                <Checkbox size={16} checked={allSelectedGlobal} onChange={toggleAll} />
                <span className="text-xs font-bold text-figma-primary">Select All</span>
                <span className="text-xs font-bold text-figma-primary ml-auto">{label}</span>
              </div>
              {groups.map((g) => {
                const keys = g.stations.map(stationKey);
                const selectedCount = keys.filter((k) => selected.has(k)).length;
                return (
                  <div key={g.courseware} className="flex border-t border-figma-subtle">
                    <div className="flex items-start gap-3 px-4 py-3 w-1/2">
                      <Checkbox size={16} checked={selectedCount > 0 && selectedCount === keys.length} onChange={() => toggleGroup(g.courseware)} />
                      <div>
                        <p className="text-sm font-medium text-figma-default">{g.courseware}</p>
                        <p className="text-xs text-figma-disabled">{selectedCount} of {keys.length} selected</p>
                      </div>
                    </div>
                    <div className="w-1/2 py-3 space-y-2">
                      {g.stations.map((s) => (
                        <label key={stationKey(s)} className="flex items-center gap-2 px-2 text-sm text-figma-default cursor-pointer">
                          <Checkbox size={14} checked={selected.has(stationKey(s))} onChange={() => toggleOne(s)} />
                          {s.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-figma-subtle flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 text-sm font-semibold text-white rounded-lg",
                selected.size === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-figma-primary hover:bg-figma-primaryhover"
              )}
            >
              {selected.size > 0 ? `Copy to ${selected.size} ${label}` : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
