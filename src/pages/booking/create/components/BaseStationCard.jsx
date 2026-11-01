import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { LaneToggle } from "./LaneToggle";
import { OCCUPIED_LANES } from "../constants";
export function BaseStationCard({ label, lanes, setLanes, isCollective, trainingMode, weaponOptions, teamOptions, activeCount, totalCount, }) {
    const [openWeaponDD, setOpenWeaponDD] = useState(null);
    const [openTeamDD, setOpenTeamDD] = useState(null);
    const active = activeCount(lanes);
    const columns = useMemo(() => {
        const cols = [
            {
                id: "select",
                compact: true,
                width: "40px",
                minWidth: "40px",
                maxWidth: "40px",
                header: () => <Checkbox size={14} disabled/>,
                cell: ({ row }) => {
                    const isOccupied = OCCUPIED_LANES.includes(row.index + 1);
                    return <Checkbox size={14} disabled={isOccupied}/>;
                },
            },
            {
                id: "lane",
                header: () => "Lane",
                cell: ({ row }) => <span className="text-sm text-gray-700">Lane {row.index + 1}</span>,
            },
        ];
        if (isCollective) {
            cols.push({
                id: "team",
                header: () => "Team",
                cell: ({ row }) => {
                    const lane = row.original;
                    const idx = row.index;
                    const isOccupied = OCCUPIED_LANES.includes(idx + 1);
                    const isTeamOpen = openTeamDD === idx;
                    if (isOccupied || !lane.on)
                        return <span className="text-xs text-gray-400">—</span>;
                    return (<div className="relative">
              <button type="button" onClick={() => { setOpenTeamDD(isTeamOpen ? null : idx); setOpenWeaponDD(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <span className="max-w-[90px] truncate">{lane.team || "Team"}</span>
                <ChevronDown size={11}/>
              </button>
              {isTeamOpen && (<div className="absolute z-30 mt-1 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {teamOptions.map((t) => (<button key={t} type="button" onClick={() => { setLanes((prev) => prev.map((l, i) => i === idx ? { ...l, team: t } : l)); setOpenTeamDD(null); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="truncate">{t}</span>
                      {lane.team === t && <Check size={12} className="text-brand-primary flex-shrink-0"/>}
                    </button>))}
                </div>)}
            </div>);
                },
            });
        }
        cols.push({
            id: "weapon",
            header: () => isCollective ? "Controlled Item" : "Weapon/Controlled Item",
            cell: ({ row }) => {
                const lane = row.original;
                const idx = row.index;
                const isOccupied = OCCUPIED_LANES.includes(idx + 1);
                const isWeaponOpen = openWeaponDD === idx;
                if (isOccupied || !lane.on) {
                    return (<span className="text-xs font-medium text-brand-primary">
                {!lane.on ? "—" : isCollective || trainingMode === "Judgemental" ? "Closed by System" : "Occupied"}
              </span>);
                }
                return (<div className="relative">
              <button type="button" onClick={() => { setOpenWeaponDD(isWeaponOpen ? null : idx); setOpenTeamDD(null); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <span>{lane.weaponType || "Weapon/Controlled Item"}</span>
                {isWeaponOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              </button>
              {isWeaponOpen && (<div className="absolute z-20 mt-1 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {weaponOptions.map((w) => (<button key={w} type="button" onClick={() => { setLanes((prev) => prev.map((l, i) => i === idx ? { ...l, weaponType: w } : l)); setOpenWeaponDD(null); }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {w}
                      {lane.weaponType === w && <Check size={12} className="text-brand-primary"/>}
                    </button>))}
                </div>)}
            </div>);
            },
        }, {
            id: "status",
            header: () => "Status",
            cell: ({ row }) => {
                const lane = row.original;
                const idx = row.index;
                const isOccupied = OCCUPIED_LANES.includes(idx + 1);
                return (<div className="flex items-center gap-1.5">
              <LaneToggle on={lane.on} onChange={() => !isOccupied && setLanes((prev) => prev.map((l, i) => i === idx ? { ...l, on: !l.on } : l))} disabled={isOccupied}/>
              <span className={cn("text-xs font-medium", isOccupied ? "text-gray-400" : lane.on ? "text-green-600" : "text-red-500")}>
                {lane.on && !isOccupied ? "On" : "Off"}
              </span>
            </div>);
            },
        });
        return cols;
    }, [isCollective, trainingMode, weaponOptions, teamOptions, openWeaponDD, openTeamDD, setLanes]);
    return (<div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <span className="text-sm font-semibold text-gray-800">{label} ({active}/{totalCount} Lanes)</span>
      </div>
      <TableCustom columns={columns} data={lanes} autoScrollTable={true} tableFixed={true}/>
    </div>);
}
