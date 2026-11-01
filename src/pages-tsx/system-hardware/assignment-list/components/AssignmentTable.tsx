import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import Dropdown from "@/components/dropdown";
import { Icon, type IconName } from "@/components/icon";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { AssignmentStatusBadge } from "./AssignmentStatusBadge";
import { PER_PAGE, BOOKING_DETAILS, formatAssignmentId } from "../constants";
import { variantOf } from "../../assignment-detail/constants";
import type { Assignment, AssignmentStatus } from "@/data/systemHardware";

interface AssignmentTableProps {
  data: Assignment[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onNavigate?: (path: string) => void;
  /** ⋮ → "Ready For Return Assets" (Pending Return rows) opens the Select
   *  Assignment drawer with this row pre-ticked. */
  onReadyForReturn?: (assignment: Assignment) => void;
  /** F-009: ⋮ → "Top Up Assets" / "Return Assets" open the scan page. Optional. */
  onScan?: (assignment: Assignment, mode: "topup" | "return") => void;
}

type RowAction = "topUp" | "readyForReturn" | "returnAssets";

const ROW_ACTION_META: Record<RowAction, { label: string; icon: IconName }> = {
  topUp: { label: "Top Up Assets", icon: "package-plus" },
  readyForReturn: { label: "Ready For Return Assets", icon: "package-check" },
  returnAssets: { label: "Return Assets", icon: "scan-line" },
};

/**
 * ⋮ menu per status — Figma's "Dropdown" section on the Assignment List page
 * (frames named after the status they apply to):
 *   Status Issued          5154:76271  → Top Up Assets          (package-plus)
 *   Status Pending Return  5867:130485 → Ready For Return Assets (package-check)
 *   Status Return Assets   5867:131711 → Return Assets          (scan-line)
 *   Status Missing         5867:131714 → Return Assets          (scan-line)
 * Returned rows have no ⋮ at all, only 👁 (5154:76248).
 * Not drawn in Figma — follows where the overlays sit in those frames / the
 * nearest status: Ownership Received → Top Up (overlay sits on that row in
 * 5154:76271), Ownership Transferred and Not Returned → Return Assets.
 */
const ROW_ACTIONS: Record<AssignmentStatus, RowAction[]> = {
  Issued: ["topUp"],
  "Ownership Received": ["topUp"],
  "Pending Return": ["readyForReturn"],
  "Return Assets": ["returnAssets"],
  Missing: ["returnAssets"],
  "Ownership Transferred": ["returnAssets"],
  "Not Returned": ["returnAssets"],
  Returned: [],
};

interface AssignmentRow extends Assignment {
  _idx: number;
}

/** Figma's `Table - Body Cell - Date` (5154:76248): date 14px `text/default` on
 *  top, time 12px `text/body` below — order-independent since the source data
 *  isn't consistently "time\ndate" (see `issuedDateOf` in index.tsx). */
export function DateTimeCell({ value }: { value?: string }) {
  if (!value) return <span className="text-disabled">—</span>;
  const lines = value.split("\n");
  const time = lines.find((l) => /\d{1,2}:\d{2}/.test(l));
  const date = lines.find((l) => l !== time) ?? lines[0];
  return (
    <div className="leading-snug">
      <div className="text-sm text-default">{date}</div>
      {time && <div className="mt-0.5 text-xs text-body">{time}</div>}
    </div>
  );
}

export function AssignmentTable({ data, currentPage, onPageChange, onNavigate, onReadyForReturn, onScan }: AssignmentTableProps) {

  const rows: AssignmentRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((asgn, idx) => ({
          ...asgn,
          _idx: (currentPage - 1) * PER_PAGE + idx + 1,
        })),
    [currentPage, data],
  );



  const columns = useMemo<ColumnDef<AssignmentRow, any>[]>(
    () => [
      {
        id: "no",
        // Figma 5154:76248 "Table - Header Cell" widths: No. 56 · 200 · 200 · Booking ID 320 · 200 ×5 · Actions 104
        width: "56px",
        minWidth: "56px",
        maxWidth: "56px",
        header: () => "No.",
        cell: (info: any) => (
          <div className="text-sm text-body">{info.row.original._idx}</div>
        ),
      },
      {
        id: "assignmentId",
        width: "200px",
        minWidth: "200px",
        accessorKey: "assignmentId",
        header: () => "Assignment ID",
        cell: (info: any) => (
          <div className="text-sm text-default font-semibold">
            {formatAssignmentId(info.row.original.assignmentId)}
          </div>
        ),
      },
      {
        id: "assignmentType",
        width: "200px",
        minWidth: "200px",
        header: () => "Assignment Type",
        // Figma's column shows the 3-way display group (Booking /
        // Administration / Maintenance), not the finer business type
        // ("Single Booking", "Base Station", …) the record actually carries.
        cell: (info: any) => (
          <div className="text-sm text-default">{variantOf(info.row.original)}</div>
        ),
      },
      {
        id: "bookings",
        width: "320px",
        minWidth: "320px",
        header: () => "Booking ID ",
        // Figma: first booking's program name, then "{bookingId} · N CW",
        // then — only when there's more than one booking — a third line
        // "+N bookings · M CW" in text/primary. Non-Booking assignments (no
        // bookings at all) just show "—".
        cell: (info: any) => {
          const assignment = info.row.original as Assignment;
          const [firstId, ...restIds] = assignment.bookings;
          const first = firstId ? BOOKING_DETAILS[firstId] : undefined;
          if (!first) return <span className="text-sm text-body">—</span>;
          const restCw = restIds.reduce((sum, id) => sum + (BOOKING_DETAILS[id]?.coursewareCount ?? 1), 0);
          return (
            <div>
              <p className="text-sm text-default leading-snug">{first.program}</p>
              <p className="text-xs text-body mt-0.5 leading-snug">
                {first.bookingId} &middot; {first.coursewareCount} CW
              </p>
              {restIds.length > 0 && (
                <p className="text-xs font-medium text-primary mt-0.5 leading-snug">
                  +{restIds.length} booking{restIds.length !== 1 ? "s" : ""} &middot; {restCw} CW
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        width: "200px",
        minWidth: "200px",
        header: () => "Assignment Status",
        cell: (info: any) => <AssignmentStatusBadge status={info.row.original.status} />,
      },
      {
        id: "baseStations",
        width: "200px",
        minWidth: "200px",
        header: () => "Base Station(s)",
        // Figma: first station, then "+N more" in text/primary underneath —
        // the same pattern as every other multi-value cell in this app, not
        // a comma-joined list.
        cell: (info: any) => {
          const stations: string[] = info.row.original.baseStations;
          const [first, ...rest] = stations;
          if (!first) return <span className="text-sm text-body">—</span>;
          return (
            <div>
              <p className="text-sm text-default leading-snug">{first}</p>
              {rest.length > 0 && (
                <p className="text-xs font-medium text-primary mt-0.5 leading-snug">
                  +{rest.length} more
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "assetQty",
        width: "200px",
        minWidth: "200px",
        header: () => "Asset Qty",
        cell: (info: any) => {
          const qty = info.row.original.assetQty;
          return (
            <div className="text-sm text-default">
              {qty} Asset{qty !== 1 ? "s" : ""}
            </div>
          );
        },
      },
      {
        id: "issuedDate",
        width: "200px",
        minWidth: "200px",
        accessorKey: "issuedDate",
        header: () => "Issued Date",
        // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
        normalWhitespace: "true",
        cell: (info: any) => <DateTimeCell value={info.row.original.issuedDate} />,
      },
      {
        id: "returnedDate",
        width: "200px",
        minWidth: "200px",
        header: () => "Returned Date",
        // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
        normalWhitespace: "true",
        cell: (info: any) => <DateTimeCell value={info.row.original.returnedDate} />,
      },
      {
        // Figma `Table - Fixed Column` (5154:76248): 104px, a right-aligned row
        // of 28px `Button Icon`s 2px apart — 👁 View, then ⋮ More. Returned
        // rows show 👁 only. No expand ⌄ / child booking table: Figma has none;
        // the bookings are on Assignment Details.
        accessorKey: "action",
        width: "104px",
        minWidth: "104px",
        header: () => "Actions",
        cell: (info: any) => {
          const row = info.row.original as AssignmentRow;
          const actions = ROW_ACTIONS[row.status] ?? [];
          return (
            <div className="flex items-center justify-end gap-0.5">
              <button
                type="button"
                title="View Details"
                aria-label="View Details"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(`/system-hardware/assignment-detail?assignmentId=${row.assignmentId}`);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-default-default transition-colors"
              >
                <Icon name="eye" size={16} />
              </button>
              {actions.length > 0 && (
                <Dropdown
                  Icon={<Icon name="ellipsis-vertical" size={16} className="text-caption" />}
                  positionType="bottom-right"
                  buttonClassName="h-7 w-7 rounded-lg"
                  className="w-56 rounded-lg py-1"
                >
                  {actions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        if (action === "readyForReturn") onReadyForReturn?.(row);
                        // F-009: Top Up / Return Assets open the scan page in that mode.
                        if (action === "topUp") onScan?.(row, "topup");
                        if (action === "returnAssets") onScan?.(row, "return");
                      }}
                      className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default hover:bg-default-hovered transition-colors"
                    >
                      <Icon name={ROW_ACTION_META[action].icon} size={20} className="text-caption" />
                      {ROW_ACTION_META[action].label}
                    </button>
                  ))}
                </Dropdown>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onNavigate, onReadyForReturn, onScan],
  );

  return (
    <div>
      <TableCustom
        columns={columns}
        data={rows}
        autoScrollTable={true}
      />
      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={data.length}
        setCurrentPage={onPageChange}
      />
    </div>
  );
}
