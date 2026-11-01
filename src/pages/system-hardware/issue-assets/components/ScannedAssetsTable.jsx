import { useMemo } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { BASE_STATION_OPTIONS } from "../constants";
export function ScannedAssetsTable({ data, selectedIds, allChecked, someChecked, onToggleAll, onToggleOne, onDeleteOne, onStationChange, }) {
    const columns = useMemo(() => [
        {
            id: "select",
            header: () => (<div>
            <Checkbox checked={allChecked} indeterminate={someChecked} onChange={() => onToggleAll()} size={16}/>
          </div>),
            cell: (info) => {
                const asset = info.row.original;
                const isChecked = selectedIds.has(asset.id);
                return (<div onClick={() => onToggleOne(asset.id)}>
              <Checkbox checked={isChecked} onChange={() => onToggleOne(asset.id)} size={16}/>
            </div>);
            },
        },
        {
            id: "no",
            header: () => "No",
            cell: (info) => (<div className="text-sm text-gray-500">{info.row.original.no}</div>),
        },
        {
            id: "name",
            header: () => "Asset Name",
            cell: (info) => (<div className="text-sm font-medium text-gray-800">{info.row.original.name}</div>),
        },
        {
            id: "assetTagId",
            header: () => "Asset Tag ID",
            cell: (info) => (<div className="text-sm text-gray-600 font-mono">{info.row.original.assetTagId}</div>),
        },
        {
            id: "assetType",
            header: () => "Asset Type",
            cell: (info) => (<div className="text-sm text-gray-600">{info.row.original.assetType}</div>),
        },
        {
            id: "assetCategory",
            header: () => "Asset Category",
            cell: (info) => (<div className="text-sm text-gray-600">{info.row.original.assetCategory}</div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => (<div>
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", info.row.original.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-purple-100 text-purple-700")}>
              {info.row.original.status}
            </span>
          </div>),
        },
        {
            id: "targetBaseStation",
            header: () => "Target Base Station",
            cell: (info) => {
                const asset = info.row.original;
                return (<div className="relative inline-block">
              <select value={asset.targetBaseStation} onChange={(e) => onStationChange(asset.id, e.target.value)} className="appearance-none text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer">
                {BASE_STATION_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>);
            },
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: (info) => {
                const asset = info.row.original;
                return (<div onClick={() => onDeleteOne(asset.id)}>
              <button type="button" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove asset">
                <Trash2 size={15}/>
              </button>
            </div>);
            },
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, allChecked, someChecked, onToggleAll, onToggleOne, onDeleteOne, onStationChange]);
    return <TableCustom columns={columns} data={data} autoScrollTable={false}/>;
}
