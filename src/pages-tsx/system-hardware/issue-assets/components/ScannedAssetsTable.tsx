import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { BASE_STATION_OPTIONS, getLaneOptions } from "../constants";
import type { ScannedAsset } from "../types";

interface ScannedAssetsTableProps {
  data: ScannedAsset[];
  selectedIds: Set<string>;
  allChecked: boolean;
  someChecked: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onDeleteOne: (id: string) => void;
  onStationChange: (id: string, station: string) => void;
  onLaneChange: (id: string, lane: string) => void;
}

export function ScannedAssetsTable({
  data,
  selectedIds,
  allChecked,
  someChecked,
  onToggleAll,
  onToggleOne,
  onDeleteOne,
  onStationChange,
  onLaneChange,
}: ScannedAssetsTableProps) {
  const columns = useMemo<ColumnDef<ScannedAsset, any>[]>(
    () => [
      {
        id: "select",
        width: "48px" as any,
        minWidth: "48px" as any,
        maxWidth: "48px" as any,
        header: () => (
          <div>
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={() => onToggleAll()}
              size={16}
            />
          </div>
        ),
        cell: (info) => {
          const asset = info.row.original;
          const isChecked = selectedIds.has(asset.id);
          return (
            <div onClick={() => onToggleOne(asset.id)}>
              <Checkbox
                checked={isChecked}
                onChange={() => onToggleOne(asset.id)}
                size={16}
              />
            </div>
          );
        },
      },
      {
        id: "no",
        header: () => "No",
        width: "56px" as any,
        minWidth: "56px" as any,
        maxWidth: "56px" as any,
        cell: (info) => (
          <div className="text-sm text-body">{info.row.original.no}</div>
        ),
      },
      {
        id: "name",
        header: () => "Asset Name",
        cell: (info) => (
          <div className="text-sm font-medium text-default">{info.row.original.name}</div>
        ),
      },
      {
        id: "assetTagId",
        header: () => "Asset Tag ID",
        cell: (info) => (
          <div className="text-sm text-caption font-mono">{info.row.original.assetTagId}</div>
        ),
      },
      {
        id: "assetType",
        header: () => "Asset Type",
        cell: (info) => (
          <div className="text-sm text-caption">{info.row.original.assetType}</div>
        ),
      },
      {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: (info) => (
          <div className="text-sm text-caption">{info.row.original.assetCategory}</div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: (info) => (
          <div>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                info.row.original.status === "Available"
                  ? "bg-success-invert-default text-success"
                  : "bg-purple-invert-default text-purple"
              )}
            >
              {info.row.original.status}
            </span>
          </div>
        ),
      },
      {
        id: "targetBaseStation",
        header: () => "Target Base Station",
        cell: (info) => {
          const asset = info.row.original;
          return (
            <div className="relative inline-block">
              <select
                value={asset.targetBaseStation}
                onChange={(e) => onStationChange(asset.id, e.target.value)}
                className="appearance-none text-sm text-default border border-invert-default rounded-lg px-3 py-1.5 pr-8 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {BASE_STATION_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-disabled pointer-events-none"
              />
            </div>
          );
        },
      },
      {
        id: "targetLane",
        header: () => "Target Lane",
        cell: (info) => {
          const asset = info.row.original;
          const laneOptions = getLaneOptions(asset.targetBaseStation);
          return (
            <div className="relative inline-block">
              <select
                value={asset.targetLane}
                onChange={(e) => onLaneChange(asset.id, e.target.value)}
                className="appearance-none text-sm text-default border border-invert-default rounded-lg px-3 py-1.5 pr-8 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {laneOptions.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-disabled pointer-events-none"
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: (info) => {
          const asset = info.row.original;
          return (
            <div onClick={() => onDeleteOne(asset.id)}>
              <button
                type="button"
                className="p-1.5 text-disabled hover:text-danger hover:bg-danger-invert-soft rounded-lg transition-colors"
                title="Remove asset"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, allChecked, someChecked, onToggleAll, onToggleOne, onDeleteOne, onStationChange, onLaneChange]
  );

  return <TableCustom columns={columns} data={data} autoScrollTable={true} />;
}
