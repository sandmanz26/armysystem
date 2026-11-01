// Booking 2.0 — Step 3 lane table (one station card's body).
//
// Figma `Table - Lane Configuration Edit` (WPT, page 5313:13114):
//   Flat Screen 5029:69433 — Lane 96 · Role 178 · Controlled Item/Weapon 178 · Status 80 (532 total)
//   C-Shaped    5029:69544 — Lane 96 · Role 146 · Controlled Item/Weapon 146 · Status 72 · Action 72
// `Table - Header/Body Cell Sm`: 36px rows, 16/8 padding, 12px text (header 600 primary on
// danger/invert/soft, body 400 default; "Assign" 500 body + 16px chevron-down).
//
// Status = Figma `Toggle` Size=sm, Success=true — the lane's real active state:
//   on  (green)          → active lane, Role/Weapon assignable
//   off (red, enabled)   → lane switched off by the user: Role/Weapon show "—", lane leaves the
//                          "x/15 lanes active" count (5322:161092 Lane 5, 5029:69544 Lane 4)
//   off (grey, disabled) → Flat Screen lanes 4/11/15, permanently occupied
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { TableCustom } from "@/components/table";
import { Toggle } from "@/components/toggle";
import { Icon } from "@/components/icon";
import { InlineSingleAssign, InlineMultiAssign } from "./InlineAssign";
import { isLaneActive, isOccupiedLane, type LaneRow, type StationData } from "../laneConfigTypes";

interface LaneTableRow {
  lane: LaneRow;
  index: number;
  occupied: boolean;
  active: boolean;
}

interface LaneTableProps {
  station: StationData;
  isFlat: boolean;
  isCollective: boolean;
  roleOptions: string[];
  weaponOptions: string[];
  onLaneChange: (laneIdx: number, patch: Partial<LaneRow>) => void;
  onRemoveLane?: (laneIdx: number) => void;
}

export function LaneTable({ station, isFlat, isCollective, roleOptions, weaponOptions, onLaneChange, onRemoveLane }: LaneTableProps) {
  const rows: LaneTableRow[] = station.lanes.map((lane, index) => ({
    lane,
    index,
    occupied: isOccupiedLane(isFlat, index),
    active: isLaneActive(station, isFlat, index),
  }));

  const assignWidth = isFlat ? "178px" : "146px";

  const columns: ColumnDef<LaneTableRow, unknown>[] = [
    {
      id: "lane",
      header: () => "Lane",
      width: "96px",
      cell: ({ row }) => (
        <span className={row.original.active ? "text-figma-default" : "text-figma-body"}>Lane {row.original.index + 1}</span>
      ),
    } as ColumnDef<LaneTableRow, unknown>,
    ...(isCollective
      ? [{
          id: "role",
          header: () => "Role",
          width: assignWidth,
          normalWhitespace: "true",
          cell: ({ row }: { row: { original: LaneTableRow } }) => (
            <InlineSingleAssign
              size="sm"
              value={row.original.lane.role}
              onChange={(v) => onLaneChange(row.original.index, { role: v })}
              options={roleOptions}
              disabled={!row.original.active}
            />
          ),
        } as ColumnDef<LaneTableRow, unknown>]
      : []),
    {
      id: "weapon",
      header: () => "Weapon",
      width: isCollective ? assignWidth : undefined,
      normalWhitespace: "true",
      cell: ({ row }) => (
        <InlineMultiAssign
          size="sm"
          value={row.original.lane.weapon}
          onChange={(v) => onLaneChange(row.original.index, { weapon: v })}
          options={weaponOptions}
          disabled={!row.original.active}
        />
      ),
    } as ColumnDef<LaneTableRow, unknown>,
    {
      id: "status",
      header: () => "Status",
      width: isFlat ? "80px" : "72px",
      cell: ({ row }) => (
        <Toggle
          size="sm"
          tone="success"
          offTone="danger"
          hideStateLabel
          checked={row.original.active}
          disabled={row.original.occupied}
          onChange={(next) =>
            // Switching a lane off clears what was assigned to it — Figma shows "—" for an
            // inactive lane; switching it back on starts from "Assign" again.
            onLaneChange(row.original.index, next ? { active: true } : { active: false, role: "", weapon: [] })
          }
        />
      ),
    } as ColumnDef<LaneTableRow, unknown>,
    ...(!isFlat
      ? [{
          id: "laneAction",
          header: () => "Action",
          width: "72px",
          cell: ({ row }: { row: { original: LaneTableRow } }) => (
            station.lanes.length > 1 && onRemoveLane ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  aria-label={`Remove Lane ${row.original.index + 1}`}
                  onClick={() => onRemoveLane(row.original.index)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-figma-body hover:bg-figma-soft hover:text-figma-danger"
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
            ) : null
          ),
        } as ColumnDef<LaneTableRow, unknown>]
      : []),
  ];

  return (
    <TableCustom
      data={rows}
      columns={columns}
      autoScrollTable={false}
      actionSticky={false}
      tableFixed
      outerClass="overflow-visible"
      classTheadTh="px-4 py-2.5 text-xs leading-4"
      classTBodyTd={cn("h-9 px-4 py-2 text-xs leading-4 align-middle")}
    />
  );
}
