import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { LaneToggle } from "./LaneToggle";
import type { LaneState } from "../types";
import { OCCUPIED_LANES } from "../constants";

export function BaseStationCard({
  label, lanes, setLanes, isCollective, trainingMode, weaponOptions, teamOptions, activeCount, totalCount, isCshaped,
}: {
  label: string;
  lanes: LaneState[];
  setLanes: React.Dispatch<React.SetStateAction<LaneState[]>>;
  isCollective: boolean;
  trainingMode: string;
  weaponOptions: string[];
  teamOptions: string[];
  activeCount: (lanes: LaneState[]) => number;
  totalCount: number;
  isCshaped?: boolean;
}) {
  const [openWeaponDD, setOpenWeaponDD] = useState<number | null>(null);
  const [openTeamDD, setOpenTeamDD] = useState<number | null>(null);
  const weaponDDRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (openWeaponDD === null) return;
    const handler = (e: MouseEvent) => {
      const el = weaponDDRefs.current[openWeaponDD];
      if (el && !el.contains(e.target as Node)) setOpenWeaponDD(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openWeaponDD]);
  const active = activeCount(lanes);
  const activeLanes = isCollective
    ? lanes.filter((l) => l.team !== "").length
    : lanes.filter((l, i) => !OCCUPIED_LANES.includes(i + 1) && l.on).length;
  const weaponsAssigned = isCollective
    ? lanes.filter((l) => l.team !== "" && l.weaponType.length > 0).length
    : lanes.filter((l, i) => !OCCUPIED_LANES.includes(i + 1) && l.on && l.weaponType.length > 0).length;

  const columns = useMemo<ColumnDef<LaneState, any>[]>(() => {
    const cols: ColumnDef<LaneState, any>[] = [
      {
        id: "lane",
        header: () => "Lane",
        cell: ({ row }: any) => <span className="text-sm text-gray-700">Lane {row.index + 1}</span>,
        width: "64px",
        minWidth: "64px",
        maxWidth: "64px",
        compact: true,
      } as any,
    ];

    if (isCollective) {
      cols.push({
        id: "team",
        header: () => "Roles",
        cell: ({ row }: any) => {
          const lane: LaneState = row.original;
          const idx: number = row.index;
          const isOccupied = OCCUPIED_LANES.includes(idx + 1);
          const isTeamOpen = openTeamDD === idx;
          if (isOccupied || !lane.on) return <span className="text-xs text-gray-400">—</span>;
          return (
            <div className="relative">
              <button type="button"
                onClick={() => { setOpenTeamDD(isTeamOpen ? null : idx); setOpenWeaponDD(null); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <span className="max-w-[90px] truncate">{lane.team || "Roles"}</span>
                <ChevronDown size={11} />
              </button>
              {isTeamOpen && (
                <div className="absolute z-30 mt-1 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {teamOptions.map((t) => (
                    <button key={t} type="button"
                      onClick={() => { setLanes((prev) => prev.map((l, i) => i === idx ? { ...l, team: t } : l)); setOpenTeamDD(null); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="truncate">{t}</span>
                      {lane.team === t && <Check size={12} className="text-brand-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        },
      });
    }

    cols.push(
      {
        id: "weapon",
        header: () => "Controlled Item/Weapon",
        width: "320px",
        minWidth: "320px",
        cell: ({ row }: any) => {
          const lane: LaneState = row.original;
          const idx: number = row.index;
          const isOccupied = OCCUPIED_LANES.includes(idx + 1);
          const isWeaponOpen = openWeaponDD === idx;
          if (isOccupied || !lane.on) {
            return (
              <span className="text-xs font-medium text-brand-primary">
                {!lane.on ? "—" : isCollective || trainingMode === "Judgemental" ? "Closed by System" : "Occupied"}
              </span>
            );
          }
          const toggleWeapon = (w: string) => {
            setLanes((prev) => prev.map((l, i) => i === idx
              ? { ...l, weaponType: l.weaponType.includes(w) ? l.weaponType.filter((x) => x !== w) : [...l.weaponType, w] }
              : l));
          };
          return (
            <div className="relative" ref={(el) => { weaponDDRefs.current[idx] = el; }}>
              <button type="button"
                onClick={() => { setOpenWeaponDD(isWeaponOpen ? null : idx); setOpenTeamDD(null); }}
                className={cn(
                  "flex items-center gap-1 flex-wrap text-sm transition-colors text-left",
                  lane.weaponType.length > 0 ? "text-gray-700 hover:text-gray-900" : "text-amber-500 hover:text-amber-600"
                )}>
                {lane.weaponType.length > 0 ? (
                  lane.weaponType.map((w) => (
                    <span key={w} className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-xs font-medium">
                      {w}
                    </span>
                  ))
                ) : (
                  <span>Assign weapon/item</span>
                )}
                {isWeaponOpen ? <ChevronUp size={12} className="flex-shrink-0" /> : <ChevronDown size={12} className="flex-shrink-0" />}
              </button>
              {isWeaponOpen && (
                <div className="absolute z-20 mt-1 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {weaponOptions.map((w) => {
                    const checked = lane.weaponType.includes(w);
                    return (
                      <button key={w} type="button"
                        onClick={() => toggleWeapon(w)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {w}
                        {checked && <Check size={12} className="text-brand-primary" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpenWeaponDD(null)}
                    className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 text-center border-t border-gray-100"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          );
        },
      } as any,
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => {
          const lane: LaneState = row.original;
          const idx: number = row.index;
          const isOccupied = OCCUPIED_LANES.includes(idx + 1);
          return (
            <div className="flex items-center justify-end gap-1.5">
              <LaneToggle
                on={lane.on}
                onChange={() => !isOccupied && setLanes((prev) => prev.map((l, i) => i === idx ? { ...l, on: !l.on } : l))}
                disabled={isOccupied}
              />
              <span className={cn("text-xs font-medium", isOccupied ? "text-gray-400" : lane.on ? "text-green-600" : "text-red-500")}>
                {lane.on && !isOccupied ? "On" : "Off"}
              </span>
            </div>
          );
        },
      }
    );

    if (isCshaped) {
      cols.push({
        id: "delete",
        header: () => null,
        cell: ({ row }: any) => (
          <button
            type="button"
            disabled={lanes.length <= 1}
            onClick={() => setLanes((prev) => prev.filter((_, i) => i !== row.index))}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              lanes.length <= 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            )}
          >
            <Trash2 size={13} />
          </button>
        ),
        width: "40px",
        minWidth: "40px",
      } as any);
    }

    return cols;
  }, [isCollective, isCshaped, trainingMode, weaponOptions, teamOptions, openWeaponDD, openTeamDD, setLanes, lanes.length]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-gray-400">{active}/{totalCount} {isCollective ? "roles" : "lanes"}</span>
          <div className="w-px h-3 bg-gray-200" />
          <span className={cn(
            "text-xs font-semibold",
            activeLanes === 0 ? "text-gray-400" :
            weaponsAssigned === 0 ? "text-amber-500" :
            weaponsAssigned < activeLanes ? "text-amber-500" :
            "text-green-600"
          )}>
            {weaponsAssigned}/{activeLanes} weapons
          </span>
        </div>
      </div>
      <TableCustom
        columns={columns}
        data={lanes}
        autoScrollTable={true}
        classTBodyTd="h-9 py-1.5"
        classTheadTh="py-2"
      />
      {isCshaped && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => setLanes((prev) => [...prev, { on: true, weaponType: [], team: "" }])}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            <Plus size={13} /> Add Lane
          </button>
        </div>
      )}
    </div>
  );
}
