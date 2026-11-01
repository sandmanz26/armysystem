import { useState } from "react";
import { AlertCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Modal } from "@/components/modal-1";
import { CustomSelect } from "../components/CustomSelect";
import { LaneToggle } from "../components/LaneToggle";

interface MassAssignModalProps {
  onClose: () => void;
  coursewareList: string[];
  baseStationLabels: string[];
  cShapedStationLabels: string[];
  cShapedLaneCounts: number[];
  weaponOptions: string[];
  hasExistingAssignments: boolean;
}

const FLAT_LANE_ON      = [true, true, true, false, true, false, true, true, true, false];
const FLAT_LANE_WEAPONS = ["SAR21", "LMG", "", "", "M203", "", "", "GPMG", "", ""];
const FLAT_LANE_COUNT   = FLAT_LANE_ON.length;

export function MassAssignModal({
  onClose,
  coursewareList,
  baseStationLabels,
  cShapedStationLabels,
  cShapedLaneCounts,
  weaponOptions,
  hasExistingAssignments,
}: MassAssignModalProps) {
  const isMultiCourseware = coursewareList.length > 1;
  const hasCourseware = coursewareList.length > 0;
  const [selectedCourseware, setSelectedCourseware] = useState(coursewareList[0] ?? "");
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [weaponType, setWeaponType] = useState(weaponOptions[0] ?? "");
  const [allLanesChecked, setAllLanesChecked] = useState(false);
  const [laneChecks, setLaneChecks] = useState<boolean[]>(Array(FLAT_LANE_COUNT).fill(false));

  const showReplaceAlert = hasExistingAssignments && selectedStations.length > 0;

  // Determine the selected station's type and lane count
  const singleSelected = selectedStations.length === 1 ? selectedStations[0] : null;
  const isSingleCShape = singleSelected !== null && cShapedStationLabels.includes(singleSelected);
  const cShapedIdx = isSingleCShape ? cShapedStationLabels.indexOf(singleSelected) : -1;
  const activeLaneCount = singleSelected
    ? (isSingleCShape ? (cShapedLaneCounts[cShapedIdx] ?? 1) : FLAT_LANE_COUNT)
    : 0;

  const getLaneData = (i: number) => {
    if (isSingleCShape) return { on: true, weapon: "", isClosed: false };
    return { on: FLAT_LANE_ON[i], weapon: FLAT_LANE_WEAPONS[i], isClosed: i + 1 === FLAT_LANE_COUNT };
  };

  const onCount = isSingleCShape
    ? activeLaneCount
    : FLAT_LANE_ON.filter((on, i) => on && i + 1 !== FLAT_LANE_COUNT).length;

  const toggleStation = (label: string) => {
    setSelectedStations((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
    setLaneChecks(Array(FLAT_LANE_COUNT).fill(false));
    setAllLanesChecked(false);
  };

  const toggleAll = () => {
    const next = !allLanesChecked;
    setAllLanesChecked(next);
    if (isSingleCShape) {
      setLaneChecks(Array(FLAT_LANE_COUNT).fill(false).map((_, i) => i < activeLaneCount && next));
    } else {
      setLaneChecks(FLAT_LANE_ON.map((on, i) => (i + 1 === FLAT_LANE_COUNT ? false : next && on)));
    }
  };

  const toggleLane = (i: number) => {
    const next = laneChecks.map((v, idx) => (idx === i ? !v : v));
    setLaneChecks(next);
    if (isSingleCShape) {
      setAllLanesChecked(next.slice(0, activeLaneCount).every(Boolean));
    } else {
      setAllLanesChecked(next.every((v, i) => i + 1 === FLAT_LANE_COUNT || !FLAT_LANE_ON[i] || v));
    }
  };

  const StationChip = ({ label }: { label: string }) => {
    const isSelected = selectedStations.includes(label);
    return (
      <button
        key={label}
        type="button"
        onClick={() => toggleStation(label)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
          isSelected
            ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
            : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
        )}
      >
        <span className={cn(
          "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected ? "bg-brand-primary border-brand-primary" : "border-gray-300"
        )}>
          {isSelected && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4l1.8 1.8L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        {label}
      </button>
    );
  };

  return (
    <Modal open={true} onClose={onClose} width={600} isUseX={false}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={16} className="text-brand-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Bulk Assign</h3>
          <p className="text-xs text-gray-400 mt-0.5">Assign a weapon type to multiple lanes across stations in one action.</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* Row 1: Courseware + Weapon Type */}
        <div className={cn("grid gap-3", hasCourseware ? "grid-cols-2" : "grid-cols-1")}>
          {hasCourseware && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Courseware <span className="text-brand-primary">*</span>
              </label>
              {isMultiCourseware ? (
                <CustomSelect
                  value={selectedCourseware}
                  onChange={setSelectedCourseware}
                  options={coursewareList}
                  placeholder="Select courseware"
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 truncate">{coursewareList[0]}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Weapon Type <span className="text-brand-primary">*</span>
            </label>
            <CustomSelect
              value={weaponType}
              onChange={setWeaponType}
              options={weaponOptions.length > 0 ? weaponOptions : ["SAR21", "LMG", "M203", "GPMG", "M110"]}
              placeholder="Select weapon type"
            />
          </div>
        </div>

        {/* Row 2: Base Station chips — grouped by type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Base Station <span className="text-brand-primary">*</span>
            <span className="ml-1 font-normal text-gray-400">(multiple)</span>
          </label>
          <div className="space-y-2">
            {baseStationLabels.length > 0 && (
              <div>
                {cShapedStationLabels.length > 0 && (
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Flat Screen</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {baseStationLabels.map((label) => <StationChip key={label} label={label} />)}
                </div>
              </div>
            )}
            {cShapedStationLabels.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">C-Shaped Station</div>
                <div className="flex flex-wrap gap-2">
                  {cShapedStationLabels.map((label) => <StationChip key={label} label={label} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replace alert */}
        {showReplaceAlert && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Selected station(s) have existing weapon assignments.{" "}
              <span className="font-semibold">Bulk assign will replace them.</span>
            </p>
          </div>
        )}

        {/* Lane list — single station selected */}
        {singleSelected && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-700">{singleSelected}</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{onCount}/{activeLaneCount} Lanes</span>
                <ChevronDown size={12} />
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center px-3 py-1.5 bg-red-50 border-b border-gray-100">
              <Checkbox size={14} checked={allLanesChecked} onChange={toggleAll} />
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">Lane</span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">Weapon / Controlled Item</span>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">Status</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {Array.from({ length: activeLaneCount }, (_, i) => {
                const { on, weapon, isClosed } = getLaneData(i);
                return (
                  <div
                    key={i}
                    className={cn(
                      "grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center px-3 py-2 border-b border-gray-50 last:border-b-0",
                      isClosed ? "opacity-40" : "hover:bg-gray-50"
                    )}
                  >
                    <Checkbox size={14} checked={laneChecks[i] ?? false} disabled={isClosed} onChange={() => toggleLane(i)} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700">Lane {i + 1}</span>
                      {isClosed && <span className="text-[10px] font-medium text-brand-primary">Closed</span>}
                    </div>
                    <div>
                      {weapon ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                          {weapon}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LaneToggle on={on} onChange={() => {}} disabled={isClosed} />
                      <span className={cn("text-[10px] font-medium w-5", isClosed ? "text-gray-400" : on ? "text-green-600" : "text-red-400")}>
                        {isClosed ? "Off" : on ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Multi-station selected: info note instead of lane list */}
        {selectedStations.length > 1 && (
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">{selectedStations.length} stations selected.</span>{" "}
              Bulk assign will apply the selected weapon to all active lanes across each station. Lane counts may vary per station type.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="outline"
          onClick={onClose}
          className="py-2.5 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center"
        >
          Cancel
        </Button>
        <Button
          onClick={onClose}
          className="py-2.5 text-sm font-semibold w-full bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
        >
          Assign Lane
        </Button>
      </div>
    </Modal>
  );
}
