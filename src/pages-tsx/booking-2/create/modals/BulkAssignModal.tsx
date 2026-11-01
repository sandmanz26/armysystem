// Booking 2.0 Lane Configuration — "Bulk Assign" modal, per the screenshots.
// Validation: at least one of Role/Weapon must be filled, AND at least one
// station must be selected — either can be missing independently, each with
// its own error message (matches the 3 reference error states). Confirming
// only touches the field(s) actually filled, leaving the other alone.
import { useState } from "react";
import { X, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/checkbox";
import type { StationRef } from "../laneConfigTypes";

interface BulkAssignModalProps {
  isCollective: boolean;
  roleOptions: string[];
  weaponOptions: string[];
  coursewareList: string[];
  flatStationsByCourseware: (cw: string) => StationRef[];
  cshapedStationsByCourseware: (cw: string) => StationRef[];
  activeLaneCountFor: (s: StationRef) => number;
  onClose: () => void;
  onConfirm: (role: string, weapon: string, targets: StationRef[]) => void;
}

function SimpleSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn("w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm bg-white", open ? "border-figma-primary" : "border-figma-subtle", value ? "text-figma-default" : "text-figma-disabled")}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={14} className="text-figma-disabled" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-figma-subtle rounded-lg shadow-lg overflow-y-auto max-h-52">
          {options.map((o) => (
            <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-figma-default hover:bg-figma-soft">
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BulkAssignModal({ isCollective, roleOptions, weaponOptions, coursewareList, flatStationsByCourseware, cshapedStationsByCourseware, activeLaneCountFor, onClose, onConfirm }: BulkAssignModalProps) {
  const [role, setRole] = useState("");
  const [weapon, setWeapon] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const stationKey = (s: StationRef) => `${s.courseware}::${s.type}::${s.index}`;

  const groups = coursewareList.map((cw) => ({
    courseware: cw,
    flat: flatStationsByCourseware(cw),
    cshaped: cshapedStationsByCourseware(cw),
  }));

  const allStations = groups.flatMap((g) => [...g.flat, ...g.cshaped]);
  const allSelectedGlobal = allStations.length > 0 && allStations.every((s) => selected.has(stationKey(s)));

  const toggleAll = () => setSelected(allSelectedGlobal ? new Set() : new Set(allStations.map(stationKey)));

  const toggleColumn = (stations: StationRef[]) => {
    const keys = stations.map(stationKey);
    const allOn = keys.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const toggleGroup = (g: { flat: StationRef[]; cshaped: StationRef[] }) => toggleColumn([...g.flat, ...g.cshaped]);

  const toggleOne = (s: StationRef) => {
    const key = stationKey(s);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const hasFieldValue = !!role || !!weapon;
  const hasStations = selected.size > 0;
  const isFormValid = hasFieldValue && hasStations;

  const errorMessage = !hasFieldValue && !hasStations
    ? "Select a Role or Controlled Item/Weapon, and at least 1 base station, to continue"
    : !hasStations
      ? "Select at least 1 base station to continue"
      : !hasFieldValue
        ? "Select a Role or Controlled Item/Weapon to continue"
        : null;

  const selectedStations = allStations.filter((s) => selected.has(stationKey(s)));
  const totalActiveLanes = selectedStations.reduce((sum, s) => sum + activeLaneCountFor(s), 0);

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[820px] max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-figma-subtle flex-shrink-0">
            <h3 className="text-lg font-bold text-figma-default">Bulk Assign</h3>
            <button type="button" onClick={onClose} className="text-figma-disabled hover:text-figma-caption"><X size={18} /></button>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-figma-dangersoft border border-red-200 text-sm text-figma-danger">
                <AlertCircle size={15} className="flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <p className="text-sm text-figma-body mb-4">Assign a role and/or items to every active lane within the courseware and stations you select below.</p>

            <div className={cn("grid gap-4 mb-5", isCollective ? "grid-cols-2" : "grid-cols-1")}>
              {isCollective && (
                <div>
                  <label className="block text-sm font-semibold text-figma-default mb-1.5">Role</label>
                  <SimpleSelect value={role} onChange={setRole} options={roleOptions} placeholder="Select Role" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-figma-default mb-1.5">Controlled Item/Weapon</label>
                <SimpleSelect value={weapon} onChange={setWeapon} options={weaponOptions} placeholder="Select Controlled Item/Weapon" />
              </div>
            </div>

            <p className="text-sm font-semibold text-figma-default mb-0.5">Apply to <span className="text-figma-primary">*</span></p>
            <p className="text-xs text-figma-body mb-2">Select the courseware or base stations to apply the assignment to. Every active lane in a selected station is included.</p>

            <div className="border border-figma-subtle rounded-lg overflow-hidden">
              <div className="flex items-center bg-figma-dangersoft/70 text-xs font-bold text-figma-primary">
                <div className="flex items-center gap-2 px-4 py-2.5 w-2/5"><Checkbox size={16} checked={allSelectedGlobal} onChange={toggleAll} />Select All</div>
                <div className="px-4 py-2.5 w-3/10">Flat Screens</div>
                <div className="px-4 py-2.5 w-3/10">C-Shaped</div>
              </div>
              {groups.map((g) => (
                <div key={g.courseware} className="flex border-t border-figma-subtle">
                  <div className="flex items-start gap-2 px-4 py-3 w-2/5">
                    <Checkbox
                      size={16}
                      checked={[...g.flat, ...g.cshaped].every((s) => selected.has(stationKey(s))) && (g.flat.length + g.cshaped.length) > 0}
                      onChange={() => toggleGroup(g)}
                    />
                    <div>
                      <p className="text-sm font-medium text-figma-default">{g.courseware}</p>
                      <p className="text-xs text-figma-disabled">
                        {[...g.flat, ...g.cshaped].filter((s) => selected.has(stationKey(s))).length} of {g.flat.length + g.cshaped.length} selected
                      </p>
                    </div>
                  </div>
                  <div className="w-3/10 py-3 space-y-2">
                    {g.flat.length > 0 && (
                      <label className="flex items-center gap-2 px-2 text-sm font-medium text-figma-default cursor-pointer">
                        <Checkbox size={14} checked={g.flat.every((s) => selected.has(stationKey(s)))} onChange={() => toggleColumn(g.flat)} />
                        All Flat Screens
                      </label>
                    )}
                    {g.flat.map((s) => (
                      <label key={stationKey(s)} className="flex items-center gap-2 px-2 text-sm text-figma-default cursor-pointer">
                        <Checkbox size={14} checked={selected.has(stationKey(s))} onChange={() => toggleOne(s)} />
                        {s.label}
                      </label>
                    ))}
                  </div>
                  <div className="w-3/10 py-3 space-y-2">
                    {g.cshaped.length > 0 && (
                      <label className="flex items-center gap-2 px-2 text-sm font-medium text-figma-default cursor-pointer">
                        <Checkbox size={14} checked={g.cshaped.every((s) => selected.has(stationKey(s)))} onChange={() => toggleColumn(g.cshaped)} />
                        All C-Shaped
                      </label>
                    )}
                    {g.cshaped.map((s) => (
                      <label key={stationKey(s)} className="flex items-center gap-2 px-2 text-sm text-figma-default cursor-pointer">
                        <Checkbox size={14} checked={selected.has(stationKey(s))} onChange={() => toggleOne(s)} />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-figma-subtle flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Cancel
            </button>
            <button
              type="button"
              disabled={!isFormValid}
              onClick={() => onConfirm(role, weapon, selectedStations)}
              className={cn("px-4 py-2 text-sm font-semibold text-white rounded-lg", isFormValid ? "bg-figma-primary hover:bg-figma-primaryhover" : "bg-gray-300 cursor-not-allowed")}
            >
              {isFormValid ? `Assign to ${totalActiveLanes} Active Lane${totalActiveLanes === 1 ? "" : "s"}` : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
