import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";

function LaneStatusPill({ status }) {
    if (status === "Closed")
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Closed</span>;
    if (status === "On")
        return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">On</span>;
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">Off</span>;
}

function LaneStatusToggle({ status, onToggle }) {
    const isOn = status === "On";
    return (<button type="button" onClick={onToggle} className="inline-flex items-center gap-2 group">
      <span className={cn("relative inline-flex h-5 w-10 items-center rounded-full transition-colors", isOn ? "bg-green-600" : "bg-gray-300")}>
        <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", isOn ? "translate-x-5" : "translate-x-1")}/>
      </span>
      <span className="text-sm text-gray-700">{isOn ? "On" : "Off"}</span>
    </button>);
}

export function LaneConfigTable({ laneConfig, editable = false, weaponOptions = [], onUpdateRow }) {
    const weaponSelectOptions = useMemo(() => {
        const fromRows = laneConfig.map((row) => row.weapon).filter(Boolean);
        return Array.from(new Set(["-", ...weaponOptions, ...fromRows]));
    }, [laneConfig, weaponOptions]);

    const columns = useMemo(() => [
        {
            header: "Lane",
            accessorKey: "lane",
        },
        {
            header: "Weapon Type",
            accessorKey: "weapon",
            cell: (info) => {
                if (!editable)
                    return info.getValue();
                const rowIndex = info.row.index;
                const value = info.getValue() ?? "-";
                return (<div className="relative max-w-[220px]">
            <select value={value} onChange={(e) => onUpdateRow?.(rowIndex, { weapon: e.target.value })} className="appearance-none w-full bg-transparent border border-transparent rounded-md pl-1 pr-6 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-gray-300">
              {weaponSelectOptions.map((option) => (<option key={option} value={option}>
                  {option}
                </option>))}
            </select>
            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400">⌄</span>
          </div>);
            },
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info) => {
                if (!editable)
                    return <LaneStatusPill status={info.getValue()}/>;
                const rowIndex = info.row.index;
                const currentStatus = info.getValue();
                return (<LaneStatusToggle status={currentStatus === "Closed" ? "Off" : currentStatus} onToggle={() => {
                        const next = currentStatus === "On" ? "Off" : "On";
                        onUpdateRow?.(rowIndex, { status: next });
                    }}/>);
            },
        },
    ], [editable, onUpdateRow, weaponSelectOptions]);
    return (<TableCustom
        data={laneConfig}
        columns={columns}
        autoScrollTable={false}
        classTheadTh="py-3 px-4 text-sm"
        classTBodyTd="h-[52px] px-4 text-sm"
    />);
}
