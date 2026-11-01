import { useState } from "react";
import { Edit2, Save } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
// ── Data ─────────────────────────────────────────────────────────────────────
const WEAPONS = [
    "SAR21",
    "SAR21+M203",
    "MATADOR",
    "LMG",
    "M110",
    "GPMG",
    "SPIKE SR",
    "SPIKE LR",
    "Comd Bino",
    "Claymore",
    "PSLAM",
    "Drone",
];
const WPT_STATIONS = ["WPT1", "WPT2", "WPT3", "WPT4", "WPT5"];
// Default weapon-to-resource mapping from Excel table
const DEFAULT_WEAPON_MAPPING = {
    SAR21: { pax: 1, ports: 1 },
    "SAR21+M203": { pax: 1, ports: 1 },
    MATADOR: { pax: 1, ports: 1 },
    LMG: { pax: 1, ports: 1 },
    M110: { pax: 1, ports: 1 },
    GPMG: { pax: 1, ports: 1 },
    "SPIKE SR": { pax: 1, ports: 0 },
    "SPIKE LR": { pax: 1, ports: 0 },
    "Comd Bino": { pax: 0, ports: 0, igs: 1 },
    Claymore: { pax: 0, ports: 1 },
    PSLAM: { pax: 1, ports: 1 },
    Drone: { pax: 0, ports: 1, igs: 0, monitors: 1 },
};
// ── Main Component ────────────────────────────────────────────────────────────
export function ResourcePlanning() {
    const [activeStation, setActiveStation] = useState("WPT1");
    const [isEditing, setIsEditing] = useState(false);
    const [stationLimits, setStationLimits] = useState({
        WPT1: { pax: 15, ports: 20, igs: 7, monitors: 2 },
        WPT2: { pax: 15, ports: 20, igs: 7, monitors: 2 },
        WPT3: { pax: 15, ports: 20, igs: 7, monitors: 2 },
        WPT4: { pax: 15, ports: 20, igs: 7, monitors: 2 },
        WPT5: { pax: 15, ports: 20, igs: 7, monitors: 2 },
    });
    const [weaponMapping, setWeaponMapping] = useState(DEFAULT_WEAPON_MAPPING);
    const limits = stationLimits[activeStation];
    const handleLimitChange = (resource, value) => {
        setStationLimits((prev) => ({
            ...prev,
            [activeStation]: { ...prev[activeStation], [resource]: value },
        }));
    };
    const handleWeaponMappingChange = (weapon, resource, value) => {
        setWeaponMapping((prev) => ({
            ...prev,
            [weapon]: { ...prev[weapon], [resource]: value },
        }));
    };
    const handleSave = () => {
        setIsEditing(false);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary mb-1">
              Collective Resource Planning
            </h1>
            <p className="text-sm text-gray-500">
              Configure resource limits and weapon-to-resource mapping per
              station
            </p>
          </div>
          {isEditing ? (<Button type="button" onClick={handleSave} className="flex items-center w-fit gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors">
              <Save size={16}/> Save
            </Button>) : (<Button type="button" onClick={() => setIsEditing(true)} className="flex items-center w-fit gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Edit2 size={16}/> Edit
            </Button>)}
        </div>

        {/* ── Station Selector ── */}
        <div className="mb-6 flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
          <label className="text-sm font-semibold text-gray-700">
            Select Station:
          </label>
          <select value={activeStation} onChange={(e) => setActiveStation(e.target.value)} disabled={!isEditing} className={cn("flex-1 max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent", !isEditing && "bg-gray-50 text-gray-500 cursor-not-allowed")}>
            {WPT_STATIONS.map((station) => (<option key={station} value={station}>
                {station}
              </option>))}
          </select>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Left: System Limits Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">
              System Limits ({activeStation})
            </h2>
            <div className="space-y-4">
              {["pax", "ports", "igs", "monitors"].map((resource) => (<div key={resource}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 capitalize">
                      {resource === "monitors"
                ? "Monitors for Drones"
                : resource.toUpperCase()}
                    </label>
                    <InputCustom type="number" value={limits[resource]} onChange={(e) => handleLimitChange(resource, parseInt(e.target.value) || 0)} disabled={!isEditing} className={cn("w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary", !isEditing &&
                "bg-gray-50 text-gray-600 cursor-not-allowed")}/>
                  </div>))}
            </div>
          </div>

          {/* Right: Weapon × Resources Mapping */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 overflow-auto max-h-[600px]">
            <h2 className="text-sm font-bold text-gray-800 mb-4">
              Weapon × Resources
            </h2>
            <div className="space-y-4">
              {WEAPONS.map((weapon) => (<div key={weapon} className={cn("border border-gray-100 rounded-lg p-3", isEditing ? "bg-gray-50" : "bg-white")}>
                  <div className="font-semibold text-xs text-gray-800 mb-2">
                    {weapon}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {["pax", "ports", "igs", "monitors"].map((resource) => (<div key={resource} className="flex flex-col">
                          <label className="text-[10px] text-gray-500 mb-0.5 capitalize">
                            {resource === "monitors" ? "Mon" : resource}
                          </label>
                          <InputCustom type="number" min={0} value={weaponMapping[weapon]?.[resource] ?? 0} onChange={(e) => handleWeaponMappingChange(weapon, resource, parseInt(e.target.value) || 0)} disabled={!isEditing} className={cn("w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary", !isEditing &&
                    "bg-gray-50 text-gray-600 cursor-not-allowed")}/>
                        </div>))}
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
