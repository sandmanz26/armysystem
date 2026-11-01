import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Check, Plus, Trash2, AlertCircle } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import {
  ONBOARDING_STATIONS,
  makeOnboardingLanes,
  makeDefaultCShapedOnboardingLanes,
  WEAPON_OPTIONS,
  type OnboardingLaneState,
} from "../constants";

const columnHelper = createColumnHelper<OnboardingLaneState>();

function LaneToggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onChange} disabled={disabled}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0",
        disabled ? "bg-gray-200 cursor-not-allowed" : on ? "bg-green-500" : "bg-red-400")}>
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
        on ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  );
}

export function OnboardingLaneConfig({
  onBack, onConfirm, cShapedStationLabels,
}: {
  onBack: () => void;
  onConfirm: () => void;
  cShapedStationLabels?: string[];
}) {
  const [lanes, setLanes] = useState<OnboardingLaneState[][]>(() =>
    ONBOARDING_STATIONS.map(() => makeOnboardingLanes())
  );

  const cShapedStations = (cShapedStationLabels ?? []).map((label, i) => ({ id: `cshaped-${i}`, label }));

  const [cshapedLanes, setCshapedLanes] = useState<OnboardingLaneState[][]>(() =>
    cShapedStations.map(() => makeDefaultCShapedOnboardingLanes())
  );

  const [courseware, setCourseware] = useState("ATP (SP)");
  const [openWeaponDD, setOpenWeaponDD] = useState<{ kind: "flat" | "cshaped"; stIdx: number; lIdx: number } | null>(null);
  const coursewareOptions = ["ATP (SP)", "BTP (SAR21)", "CS(M) (SAR21/LMG)", "Zeroing (SAR21/LMG)"];
  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");

  useEffect(() => {
    const h = () => setOpenWeaponDD(null);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const setStationLane = (stIdx: number, lIdx: number, patch: Partial<OnboardingLaneState>) => {
    setLanes((prev) => {
      const next = prev.map((s) => [...s]);
      next[stIdx][lIdx] = { ...next[stIdx][lIdx], ...patch };
      return next;
    });
  };

  const setCshapedLane = (stIdx: number, lIdx: number, patch: Partial<OnboardingLaneState>) => {
    setCshapedLanes((prev) => {
      const next = prev.map((s) => [...s]);
      next[stIdx][lIdx] = { ...next[stIdx][lIdx], ...patch };
      return next;
    });
  };

  const addCshapedLane = (stIdx: number) => {
    setCshapedLanes((prev) => prev.map((s, i) => (i === stIdx ? [...s, { on: true, weaponType: "", closed: false }] : s)));
  };

  const removeCshapedLane = (stIdx: number, lIdx: number) => {
    setCshapedLanes((prev) => prev.map((s, i) => (i === stIdx ? s.filter((_, li) => li !== lIdx) : s)));
  };

  const makeStationColumns = (stIdx: number) => [
    columnHelper.display({
      id: "lane",
      header: () => "Lane",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          Lane {row.index + 1}
          {row.original.closed && <span className="ml-2 text-xs font-medium text-brand-primary">Closed</span>}
        </span>
      ),
    }),
    columnHelper.display({
      id: "weaponType",
      header: () => "Controlled Item/Weapon",
      cell: ({ row }) => {
        const lane = row.original;
        const lIdx = row.index;
        const isWOpen = openWeaponDD?.kind === "flat" && openWeaponDD?.stIdx === stIdx && openWeaponDD?.lIdx === lIdx;
        if (!lane.on) return <span className="text-sm text-gray-400">—</span>;
        return (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenWeaponDD(isWOpen ? null : { kind: "flat", stIdx, lIdx })}
              className="flex items-center gap-1 text-sm hover:opacity-80"
            >
              <span className={lane.weaponType ? "text-gray-800" : "text-brand-primary font-medium"}>
                {lane.weaponType || "Assign weapon/item"}
              </span>
              <ChevronDown size={12} className={lane.weaponType ? "text-gray-400" : "text-brand-primary"} />
            </button>
            {isWOpen && (
              <div className="absolute z-20 mt-1 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                {WEAPON_OPTIONS.map((w) => (
                  <button key={w} type="button"
                    onClick={() => { setStationLane(stIdx, lIdx, { weaponType: w }); setOpenWeaponDD(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {w}
                    {lane.weaponType === w && <Check size={12} className="text-brand-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: () => "Status",
      cell: ({ row }) => {
        const lane = row.original;
        const lIdx = row.index;
        return (
          <div className="flex items-center gap-2">
            <LaneToggle
              on={lane.on}
              disabled={lane.closed}
              onChange={() => setStationLane(stIdx, lIdx, { on: !lane.on })}
            />
            <span className={cn("text-xs font-medium",
              lane.closed ? "text-gray-400" : lane.on ? "text-green-600" : "text-red-500")}>
              {lane.closed ? "Off" : lane.on ? "On" : "Off"}
            </span>
          </div>
        );
      },
    }),
  ];

  const makeCshapedColumns = (stIdx: number) => [
    columnHelper.display({
      id: "lane",
      header: () => "Lane",
      cell: ({ row }) => <span className="text-sm text-gray-700">Lane {row.index + 1}</span>,
    }),
    columnHelper.display({
      id: "weaponType",
      header: () => "Controlled Item/Weapon",
      cell: ({ row }) => {
        const lane = row.original;
        const lIdx = row.index;
        const isWOpen = openWeaponDD?.kind === "cshaped" && openWeaponDD?.stIdx === stIdx && openWeaponDD?.lIdx === lIdx;
        if (!lane.on) return <span className="text-sm text-gray-400">—</span>;
        return (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenWeaponDD(isWOpen ? null : { kind: "cshaped", stIdx, lIdx })}
              className="flex items-center gap-1 text-sm hover:opacity-80"
            >
              <span className={lane.weaponType ? "text-gray-800" : "text-brand-primary font-medium"}>
                {lane.weaponType || "Assign weapon/item"}
              </span>
              <ChevronDown size={12} className={lane.weaponType ? "text-gray-400" : "text-brand-primary"} />
            </button>
            {isWOpen && (
              <div className="absolute z-20 mt-1 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-44 overflow-y-auto">
                {WEAPON_OPTIONS.map((w) => (
                  <button key={w} type="button"
                    onClick={() => { setCshapedLane(stIdx, lIdx, { weaponType: w }); setOpenWeaponDD(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {w}
                    {lane.weaponType === w && <Check size={12} className="text-brand-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: () => "Status",
      cell: ({ row }) => {
        const lane = row.original;
        const lIdx = row.index;
        return (
          <div className="flex items-center gap-2">
            <LaneToggle on={lane.on} onChange={() => setCshapedLane(stIdx, lIdx, { on: !lane.on })} />
            <span className={cn("text-xs font-medium", lane.on ? "text-green-600" : "text-red-500")}>
              {lane.on ? "On" : "Off"}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "delete",
      header: () => null,
      cell: ({ row }) => (
        <button
          type="button"
          disabled={cshapedLanes[stIdx].length <= 1}
          onClick={() => removeCshapedLane(stIdx, row.index)}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded transition-colors",
            cshapedLanes[stIdx].length <= 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          )}
        >
          <Trash2 size={13} />
        </button>
      ),
    }),
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Lane Configuration</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the lane before start of the training.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Confirm lane configuration <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Lane Configuration <span className="text-gray-400 font-normal">({ONBOARDING_STATIONS.length + cShapedStations.length} Base Stations)</span>
            </h3>
            <Button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              + Mass Assign
            </Button>
          </div>

          <div className="px-5 pt-4 flex flex-wrap items-center gap-2">
            {coursewareOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCourseware(opt)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold border transition-colors",
                  courseware === opt
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          {coursewareOptions.length > 1 && (
            <div className="mx-5 mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              Each courseware requires its own lane configuration. Switch tabs to configure each one.
            </div>
          )}

          {cShapedStations.length > 0 && (
            <div className="px-5 pt-4 flex items-center gap-2">
              {([
                { key: "flat" as const, label: "Flat Screen" },
                { key: "cshaped" as const, label: "C-Shaped Station" },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStationType(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                    stationType === key
                      ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {(cShapedStations.length === 0 || stationType === "flat") && ONBOARDING_STATIONS.map((station, stIdx) => {
              const stationLanes = lanes[stIdx];
              const active = stationLanes.filter((l) => l.on && !l.closed).length;
              const weaponsAssigned = stationLanes.filter((l) => l.on && !l.closed && l.weaponType).length;
              return (
                <div key={station.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-800">{station.label}</span>
                    <span className="text-xs text-gray-400">
                      {active}/{stationLanes.length} lanes <span className="mx-1">|</span> {weaponsAssigned}/{stationLanes.length} weapons
                    </span>
                  </div>
                  <TableCustom
                    columns={makeStationColumns(stIdx)}
                    data={stationLanes}
                    autoScrollTable={false}
                  />
                </div>
              );
            })}
            {cShapedStations.length > 0 && stationType === "cshaped" && cShapedStations.map((station, stIdx) => {
              const stationLanes = cshapedLanes[stIdx] ?? [];
              const active = stationLanes.filter((l) => l.on).length;
              const weaponsAssigned = stationLanes.filter((l) => l.on && l.weaponType).length;
              return (
                <div key={station.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-800">{station.label}</span>
                    <span className="text-xs text-gray-400">
                      {active}/{stationLanes.length} lanes <span className="mx-1">|</span> {weaponsAssigned}/{stationLanes.length} weapons
                    </span>
                  </div>
                  <TableCustom
                    columns={makeCshapedColumns(stIdx)}
                    data={stationLanes}
                    autoScrollTable={false}
                  />
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => addCshapedLane(stIdx)}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      <Plus size={13} /> Add Lane
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
