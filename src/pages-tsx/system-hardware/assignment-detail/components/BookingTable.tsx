import { useMemo, useState } from "react";
import { TableCustom } from "@/components/table";
import { Icon } from "@/components/icon";
import { Tooltip } from "@/components/tooltip";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import type { AssignmentBookingRow } from "../types";

/** Figma `Badge - Booking Status` — Upcoming is info (#1d4ed8). */
const BOOKING_TONE: Record<string, BadgeTone> = {
  Upcoming: "info",
  Ongoing: "orange",
  Completed: "success",
  "Pending Return": "warning",
  "Not Returned": "danger",
  Overdue: "danger",
};

/** First value + Figma's "+N more" link (Link > Base > Label, 12 Medium,
 *  text/primary); the rest show in the shared Tooltip on hover. */
function FirstPlusMore({ values }: { values: string[] }) {
  const [hover, setHover] = useState(false);
  if (!values.length) return <span className="text-sm text-default">—</span>;
  const rest = values.slice(1);
  return (
    <span className="flex flex-col items-start">
      <span className="text-sm text-default">{values[0]}</span>
      {rest.length > 0 && (
        <span
          className="relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <span className="text-xs font-medium text-primary cursor-default">+{rest.length} more</span>
          <span className="absolute left-0 top-full z-20 pt-1 pointer-events-none">
            <Tooltip visible={hover} lines={rest} width={160} />
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Figma `Assignment Details - Bookings` table (6991:172117 / full 6991:174116):
 *   No. 64 · Booking ID 320 · Courseware 240 · Booking Time 280 · Status 200
 *   · Weapon Type(s) 160 · Base Station 160 · Actions (fixed)
 * Every booking of the assignment is listed — this replaces the expand row the
 * Assignment List used to have (removed in F-005).
 */
export function BookingTable({
  rows,
  onNavigate,
}: {
  rows: AssignmentBookingRow[];
  onNavigate?: (path: string) => void;
}) {
  const columns = useMemo(
    () =>
      [
        {
          id: "no",
          header: () => "No.",
          cell: (info: any) => <span className="text-sm text-body">{info.row.original.no}</span>,
          minWidth: "64px",
        },
        {
          id: "bookingId",
          header: () => "Booking ID",
          cell: (info: any) => {
            const r = info.row.original as AssignmentBookingRow;
            return (
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-default truncate max-w-[280px]">{r.program}</span>
                <span className="text-xs text-body">{r.bookingId}</span>
              </span>
            );
          },
          minWidth: "320px",
        },
        {
          id: "courseware",
          header: () => "Courseware",
          cell: (info: any) => (
            <span className="text-sm text-default">{info.row.original.courseware}</span>
          ),
          minWidth: "240px",
        },
        {
          id: "bookingTime",
          header: () => "Booking Time",
          cell: (info: any) => {
            const r = info.row.original as AssignmentBookingRow;
            return (
              <span className="flex flex-col">
                <span className="text-sm text-default">{r.date}</span>
                <span className="text-xs text-body">{r.slotLabel}</span>
              </span>
            );
          },
          minWidth: "280px",
        },
        {
          id: "status",
          header: () => "Status",
          cell: (info: any) => {
            const s = info.row.original.status as string;
            return <StatusBadge tone={BOOKING_TONE[s] ?? "neutral"}>{s}</StatusBadge>;
          },
          minWidth: "200px",
        },
        {
          id: "weaponTypes",
          header: () => "Weapon Type(s)",
          cell: (info: any) => <FirstPlusMore values={info.row.original.weaponTypes} />,
          minWidth: "160px",
        },
        {
          id: "baseStation",
          header: () => "Base Station",
          cell: (info: any) => <FirstPlusMore values={info.row.original.baseStations} />,
          minWidth: "160px",
        },
        {
          // Figma also draws an ⋮ (ellipsis-vertical) here; its menu has no
          // frame, so only the eye (→ booking detail) is rendered.
          id: "action",
          header: () => "Actions",
          cell: (info: any) => (
            <button
              type="button"
              title="View booking"
              onClick={() => onNavigate?.(`/bookings-2/detail?id=${info.row.original.bookingKey}`)}
              className="w-7 h-7 inline-flex items-center justify-center rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
            >
              <Icon name="eye" size={16} />
            </button>
          ),
          minWidth: "96px",
        },
      ] as any,
    [onNavigate],
  );

  return (
    <TableCustom
      columns={columns}
      data={rows}
      autoScrollTable={true}
      classThead="bg-danger-invert-soft"
      classTheadTh="text-primary text-xs font-semibold"
    />
  );
}
