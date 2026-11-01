import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
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
          <div className="text-sm text-body font-mono">{info.row.original.assetTagId}</div>
        ),
      },
      {
        id: "assetType",
        header: () => "Asset Type",
        cell: (info) => (
          <div className="text-sm text-body">{info.row.original.assetType}</div>
        ),
      },
      {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: (info) => (
          <div className="text-sm text-body">{info.row.original.assetCategory}</div>
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
                  ? "bg-success-invert-default text-success border border-invert-success"
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

  return (
    <TableCustom
      columns={columns}
      data={data}
      autoScrollTable={true}
      classThead="bg-danger-invert-soft"
      classTheadTh="text-primary text-xs font-semibold"
    />
  );
}

/* ── F-009: Top Up / Scan & Return table ─────────────────────────────────────────────
 * Figma `Table - Return Asset (Booking) - Scanned` (5895:412370) and the Top Up table
 * (5895:360312): ☐ 56 · No. 64 · Asset 200 · Asset Type 120 · Status 160 ·
 * Target / Source Base Station 160 · Actions 96. Administration & Maintenance
 * (5895:368095, 5895:423102) drop the base-station column. Empty: the RFID prompt.
 */
export interface ScanFlowTableProps {
  data: ScannedAsset[];
  mode: "issue" | "topup" | "return";
  showStation: boolean;
  stationOptions: string[];
  selectedIds: Set<string>;
  allChecked: boolean;
  someChecked: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onRemove: (asset: ScannedAsset) => void;
  onStationChange: (id: string, station: string) => void;
  /** Only used with HIDDEN_FEATURES.targetLanePerAsset (Issue mode). */
  onLaneChange?: (id: string, lane: string) => void;
}

const minW = (px: number): any => ({ width: `${px}px`, minWidth: `${px}px` });
const fixed = (px: number) => ({ width: `${px}px` as any, minWidth: `${px}px` as any, maxWidth: `${px}px` as any });

export function ScanFlowTable({
  data, mode, showStation, stationOptions, selectedIds, allChecked, someChecked,
  onToggleAll, onToggleOne, onRemove, onStationChange, onLaneChange,
}: ScanFlowTableProps) {
  const columns = useMemo<ColumnDef<ScannedAsset, any>[]>(() => {
    const cols: ColumnDef<ScannedAsset, any>[] = [
      {
        id: "select",
        ...fixed(44),
        header: () => (
          <Checkbox checked={allChecked} indeterminate={someChecked} onChange={() => onToggleAll()} size={18} />
        ),
        cell: (info) => (
          <Checkbox
            checked={selectedIds.has(info.row.original.id)}
            onChange={() => onToggleOne(info.row.original.id)}
            size={18}
          />
        ),
      },
      {
        id: "no",
        ...fixed(48),
        header: () => "No.",
        cell: (info) => <span className="text-sm text-body">{info.row.original.no}</span>,
      },
      {
        id: "name",
        ...minW(120),
        header: () => "Asset",
        cell: (info) => <span className="text-sm text-default">{info.row.original.name}</span>,
      },
      {
        id: "assetType",
        ...minW(104),
        header: () => "Asset Type",
        cell: (info) => <span className="text-sm text-default">{info.row.original.assetType}</span>,
      },
      {
        id: "status",
        ...minW(122),
        header: () => "Status",
        cell: (info) => (
          <StatusBadge tone={info.row.original.status === "Pending Return" ? "warning" : "success"}>
            {info.row.original.status}
          </StatusBadge>
        ),
      },
    ];
    if (showStation) {
      cols.push({
        id: "station",
        ...minW(161),
        header: () => (mode === "return" ? "Source Base Station" : "Target Base Station"),
        cell: (info) => {
          const a = info.row.original;
          if (mode === "return") return <span className="text-sm text-default">{a.targetBaseStation}</span>;
          // Figma `Dropdown - Target Base Station` (5869:43286): a borderless inline picker.
          return (
            <span className="relative inline-flex items-center">
              <select
                aria-label={`Target base station for ${a.name}`}
                value={a.targetBaseStation}
                onChange={(e) => onStationChange(a.id, e.target.value)}
                className="appearance-none bg-transparent pr-6 text-sm text-default focus:outline-none cursor-pointer"
              >
                {stationOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-0 text-body" />
            </span>
          );
        },
      });
      // Hidden (HIDDEN_FEATURES.targetLanePerAsset): per-asset Target Lane, Issue mode only.
      if (HIDDEN_FEATURES.targetLanePerAsset && mode === "issue" && onLaneChange) {
        cols.push({
          id: "targetLane",
          ...minW(120),
          header: () => "Target Lane",
          cell: (info) => {
            const a = info.row.original;
            return (
              <span className="relative inline-flex items-center">
                <select
                  aria-label={`Target lane for ${a.name}`}
                  value={a.targetLane}
                  onChange={(e) => onLaneChange(a.id, e.target.value)}
                  className="appearance-none bg-transparent pr-6 text-sm text-default focus:outline-none cursor-pointer"
                >
                  {getLaneOptions(a.targetBaseStation).map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-0 text-body" />
              </span>
            );
          },
        });
      }
    }
    cols.push({
      id: "actions",
      ...fixed(76),
      header: () => "Actions",
      cell: (info) => (
        <button
          type="button"
          title="Remove"
          aria-label={`Remove ${info.row.original.name}`}
          onClick={() => onRemove(info.row.original)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-default-default transition-colors"
        >
          <Icon name="trash-2" size={16} />
        </button>
      ),
    });
    return cols;
  }, [mode, showStation, stationOptions, selectedIds, allChecked, someChecked, onToggleAll, onToggleOne, onRemove, onStationChange, onLaneChange]);

  return (
    <TableCustom
      columns={columns}
      data={data}
      autoScrollTable={true}
      // Figma's cells are 20px each side on a 1440 frame WITHOUT the app sidebar; with the
      // sidebar the seven columns only fit at 12px (F-009 report: deliberate difference).
      classTheadTh="px-3"
      classTBodyTd="px-3"
      // RFID prompt of `Scan Assets - Empty` (5895:412248). The library has no RFID glyph —
      // `scan-line` (Figma's own Return Assets icon) stands in; flagged in the F-009 report.
      emptyIcon={<Icon name="scan-line" size={24} className="text-primary" />}
      emptyTitle={<span className="text-default">Place your asset on the RFID reader</span>}
      emptySubtitle={
        <span className="text-body">
          Please make sure to place one asset on the RFID Reader at a time, wait for it to be scanned, and then place the next one.
        </span>
      }
    />
  );
}
