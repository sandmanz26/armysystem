import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Icon } from "@/components/icon";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import type { AssetRowStatus, AssignmentAssetRow, AssignmentVariant } from "../types";

/** Figma `Badge - Asset Status` colours: Issued purple, Pending Return
 *  warning (#a16207), Returned success (#15803d), Not Returned danger (#b91c1c). */
const ROW_TONE: Record<AssetRowStatus, BadgeTone> = {
  Issued: "purple",
  "Pending Return": "warning",
  Returned: "success",
  "Not Returned": "danger",
};

const columnHelper = createColumnHelper<AssignmentAssetRow>();

/**
 * Figma `Table - Assignment Details - Asset List`. The Booking variant carries
 * nine columns; Administration and Maintenance drop `Target Base Station`,
 * which only means something when the assignment is tied to a booking.
 *
 *   No 64 · Asset 200 · Asset Tag ID 200 · Asset Type 160 · Asset Category 160
 *   · Status 160 · Issued Date 160 · [Target Base Station 160] · Actions 96
 */
export function AssetTable({
  rows,
  variant,
  onNavigate,
}: {
  rows: AssignmentAssetRow[];
  variant: AssignmentVariant;
  onNavigate?: (path: string) => void;
}) {
  const columns = useMemo(() => {
    const base = [
      {
        id: "no",
        header: () => "No.",
        cell: (info: any) => (
          <span className="text-sm text-body">{info.row.original.no}</span>
        ),
        minWidth: "64px",
      },
      columnHelper.accessor("name", {
        id: "asset",
        header: () => "Asset",
        cell: (info: any) => (
          <span className="text-sm font-semibold text-default">{info.getValue()}</span>
        ),
        minWidth: "200px",
      } as any),
      columnHelper.accessor("assetTagId", {
        id: "assetTagId",
        header: () => "Asset Tag ID",
        cell: (info: any) => (
          <span className="text-sm text-body font-mono">{info.getValue() || "—"}</span>
        ),
        minWidth: "200px",
      } as any),
      columnHelper.accessor("assetType", {
        id: "assetType",
        header: () => "Asset Type",
        cell: (info: any) => <span className="text-sm text-body">{info.getValue()}</span>,
        minWidth: "160px",
      } as any),
      columnHelper.accessor("assetCategory", {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: (info: any) => <span className="text-sm text-body">{info.getValue()}</span>,
        minWidth: "160px",
      } as any),
      {
        id: "status",
        header: () => "Status",
        cell: (info: any) => {
          const st = info.row.original.rowStatus as AssetRowStatus;
          return <StatusBadge tone={ROW_TONE[st]}>{st}</StatusBadge>;
        },
        minWidth: "160px",
      },
      {
        id: "issuedDate",
        header: () => "Issued Date",
        cell: (info: any) => (
          <span className="text-sm text-body whitespace-pre-line leading-snug">
            {info.row.original.issuedOn}
          </span>
        ),
        minWidth: "160px",
      },
    ];

    if (variant === "Booking") {
      base.push({
        id: "targetBaseStation",
        header: () => "Target Base Station",
        cell: (info: any) => (
          <span className="text-sm text-body">{info.row.original.targetBaseStation}</span>
        ),
        minWidth: "160px",
      });
    }

    // Figma's Actions cell holds an eye button plus a `More Icons` slot whose
    // default content is pencil + archive. Only the eye is rendered: editing or
    // archiving an asset from inside an assignment has no stated behaviour, and
    // the slot's contents read as library boilerplate. Raised with the PO.
    base.push({
      id: "action",
      header: () => "Actions",
      cell: (info: any) => (
        <button
          type="button"
          title="View asset"
          onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
        >
          <Icon name="eye" size={16} />
        </button>
      ),
      minWidth: "96px",
    });

    return base as any;
  }, [variant, onNavigate]);

  return (
    <TableCustom
      columns={columns}
      data={rows}
      autoScrollTable={true}
      // Figma `Table Header`: color/background/danger/invert/soft fill,
      // labels in color/text/primary.
      classThead="bg-danger-invert-soft"
      classTheadTh="text-primary text-xs font-semibold"
      // Figma wraps Actions in `Table - Fixed Column`; TableCustom already pins
      // any column whose id is "action", so no extra prop is needed.
    />
  );
}
