import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Check } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { ONBOARDING_STATIONS, makeOnboardingLanes, WEAPON_OPTIONS } from "../constants";
const columnHelper = createColumnHelper();
function LaneToggle({ on, onChange, disabled }) {
    return (<button type="button" onClick={onChange} disabled={disabled} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0", disabled ? "bg-gray-200 cursor-not-allowed" : on ? "bg-green-500" : "bg-red-400")}>
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", on ? "translate-x-4" : "translate-x-0.5")}/>
    </button>);
}
export function OnboardingLaneConfig({ onBack, onConfirm }) {
    const [lanes, setLanes] = useState(() => ONBOARDING_STATIONS.map(() => makeOnboardingLanes()));
    const [courseware, setCourseware] = useState("ATP (SP)");
    const [cwOpen, setCwOpen] = useState(false);
    const [openWeaponDD, setOpenWeaponDD] = useState(null);
    const cwRef = useRef(null);
    const coursewareOptions = ["ATP (SP)", "BTP (SAR21)", "CS(M) (SAR21/LMG)", "Zeroing (SAR21/LMG)"];
    useEffect(() => {
        const h = (e) => {
            if (cwRef.current && !cwRef.current.contains(e.target))
                setCwOpen(false);
            setOpenWeaponDD(null);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const setStationLane = (stIdx, lIdx, patch) => {
        setLanes((prev) => {
            const next = prev.map((s) => [...s]);
            next[stIdx][lIdx] = { ...next[stIdx][lIdx], ...patch };
            return next;
        });
    };
    const makeStationColumns = (stIdx) => [
        columnHelper.display({
            id: "lane",
            header: () => "Lane",
            cell: ({ row }) => (<span className="text-sm text-gray-700">
          Lane {row.index + 1}
          {row.original.closed && <span className="ml-2 text-xs font-medium text-brand-primary">Closed</span>}
        </span>),
        }),
        columnHelper.display({
            id: "weaponType",
            header: () => "Weapon Type",
            cell: ({ row }) => {
                const lane = row.original;
                const lIdx = row.index;
                const isWOpen = openWeaponDD?.stIdx === stIdx && openWeaponDD?.lIdx === lIdx;
                if (lane.closed)
                    return <span className="text-xs text-gray-400">—</span>;
                return (<div className="relative">
            <button type="button" onClick={() => setOpenWeaponDD(isWOpen ? null : { stIdx, lIdx })} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
              <span className={lane.weaponType ? "text-gray-800" : "text-gray-400"}>
                {lane.weaponType || "Weapon Type"}
              </span>
              <ChevronDown size={12} className="text-gray-400"/>
            </button>
            {isWOpen && (<div className="absolute z-20 mt-1 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                {WEAPON_OPTIONS.map((w) => (<button key={w} type="button" onClick={() => { setStationLane(stIdx, lIdx, { weaponType: w }); setOpenWeaponDD(null); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {w}
                    {lane.weaponType === w && <Check size={12} className="text-brand-primary"/>}
                  </button>))}
              </div>)}
          </div>);
            },
        }),
        columnHelper.display({
            id: "status",
            header: () => "Status",
            cell: ({ row }) => {
                const lane = row.original;
                const lIdx = row.index;
                return (<div className="flex items-center gap-2">
            <LaneToggle on={lane.on} disabled={lane.closed} onChange={() => setStationLane(stIdx, lIdx, { on: !lane.on })}/>
            <span className={cn("text-xs font-medium", lane.closed ? "text-gray-400" : lane.on ? "text-green-600" : "text-red-500")}>
              {lane.closed ? "Off" : lane.on ? "On" : "Off"}
            </span>
          </div>);
            },
        }),
    ];
    return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Lane Configuration</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the lane before start of the training.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="outline" onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200">
            <ArrowLeft size={14}/> Back
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
            Confirm lane configuration <ArrowRight size={14}/>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Lane Configuration <span className="text-gray-400 font-normal">({ONBOARDING_STATIONS.length} Base Stations)</span>
            </h3>
            <Button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
              + Mass Assign
            </Button>
          </div>

          <div className="px-5 py-3 border-b border-gray-100">
            <div ref={cwRef} className="relative w-44">
              <Button type="outline" onClick={() => setCwOpen(!cwOpen)} className={cn("w-full flex items-center justify-between px-3 py-2 text-sm bg-white border", cwOpen ? "border-brand-primary" : "border-gray-200 hover:border-gray-300")}>
                <span className="text-gray-800">{courseware}</span>
                <ChevronDown size={14} className="text-gray-400"/>
              </Button>
              {cwOpen && (<div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {coursewareOptions.map((opt) => (<button key={opt} type="button" onClick={() => { setCourseware(opt); setCwOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span>{opt}</span>
                      {courseware === opt && <Check size={13} className="text-brand-primary"/>}
                    </button>))}
                </div>)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {ONBOARDING_STATIONS.map((station, stIdx) => {
            const stationLanes = lanes[stIdx];
            const active = stationLanes.filter((l) => l.on && !l.closed).length;
            return (<div key={station.id} className="p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-4">
                    {station.label} <span className="text-gray-400 font-normal">({active}/{stationLanes.length} Lanes)</span>
                  </div>
                  <TableCustom columns={makeStationColumns(stIdx)} data={stationLanes} autoScrollTable={false}/>
                </div>);
        })}
          </div>
        </div>
      </div>
    </div>);
}
