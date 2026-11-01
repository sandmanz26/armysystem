import { useMemo } from "react";
import { Eye, ArrowUpDown } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PER_PAGE } from "../constants";
import { parseBookingTime } from "../utils";
import { BookingRowMenu } from "./BookingRowMenu";
import { CoursewareCell } from "./CoursewareCell";

const columnHelper = createColumnHelper();

export function BookingTable({
  paginated,
  currentPage,
  sortDir: _sortDir,
  onToggleSort,
  onNavigate,
  onAssignBriefingRoom,
}) {
  const columns = useMemo(() => [
    {
      id: "rowNum",
      width: "50px",
      minWidth: "50px",
      maxWidth: "50px",
      header: () => "No",
      cell: (info) => (
        <div
          className="text-sm text-gray-500 font-medium cursor-pointer"
          onClick={() => onNavigate?.(`/bookings/detail?id=${info.row.original.id}`)}
        >
          {(currentPage - 1) * PER_PAGE + info.row.index + 1}
        </div>
      ),
    },

    columnHelper.display({
      id: "booking",
      size: 200,
      header: () => "Booking ID",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer max-w-[200px]"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            <div className="font-semibold text-sm text-gray-800 hover:text-brand-primary transition-colors leading-snug line-clamp-2">
              {booking.program}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 font-mono truncate">
              Booking ID - {booking.bookingId}
            </div>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "trainingType",
      header: () => "Training Type",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.trainingType}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "bookingTime",
      header: () => (
        <button
          onClick={onToggleSort}
          className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors"
        >
          Booking Time
          <ArrowUpDown size={11} className="text-gray-400" />
        </button>
      ),
      cell: (info) => {
        const booking = info.row.original;
        const { date, timeRange, label } = parseBookingTime(booking.bookingTime);
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            <div className="text-sm font-semibold text-gray-700">{date}</div>
            {timeRange && (
              <div className="text-xs text-gray-500 mt-0.5">{timeRange}</div>
            )}
            {label && (
              <div className="text-[10px] text-gray-400 mt-0.5 italic">{label}</div>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "status",
      header: () => "Status",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            <StatusBadge status={booking.status} />
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "trainingMode",
      header: () => "Training Mode",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.trainingMode}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "courseware",
      header: () => "Courseware",
      cell: (info) => <CoursewareCell text={info.row.original.courseware} />,
    }),

    columnHelper.display({
      id: "assignmentId",
      header: () => "Assignment ID",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.assignmentId || "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "unitName",
      header: () => "Unit Name",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.unitName}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "weaponTypes",
      header: () => "Weapon Type(s)",
      cell: (info) => {
        const booking = info.row.original;
        const types = booking.weaponTypes?.join(", ") ?? booking.weapon ?? "-";
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {types}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "weaponCount",
      header: () => "Weapon(s)",
      cell: (info) => {
        const booking = info.row.original;
        const count = booking.weaponCount;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {count != null ? `${count} Weapon(s)` : "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "briefingRoom",
      header: () => "Briefing Room",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.briefingRoom ?? "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "baseStationQty",
      header: () => "Base Station Quantity",
      cell: (info) => {
        const booking = info.row.original;
        const qty = booking.baseStationQty;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {qty != null ? `${qty} Station(s)` : "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "traineesCount",
      header: () => "Trainee(s)",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.traineesCount ?? "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "instructorName",
      header: () => "Instructor Name",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.instructorName ?? "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "ftmsFileId",
      header: () => "FTMS File ID",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="text-sm text-gray-600 cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
          >
            {booking.ftmsFileId ?? "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "action",
      width: "90px",
      minWidth: "90px",
      maxWidth: "90px",
      header: () => "Actions",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-brand-primary transition-colors"
              title="View Details"
            >
              <Eye size={14} />
            </button>
            <BookingRowMenu
              status={booking.status}
              assetIssued={booking.assetIssued}
              onView={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
              onAssignBriefingRoom={() => onAssignBriefingRoom?.(booking)}
            />
          </div>
        );
      },
    }),
  ], [currentPage, onNavigate, onToggleSort]);

  return (
    <TableCustom
      columns={columns}
      data={paginated}
      autoScrollTable={true}
      classThead="bg-red-50/70"
      classTheadTh="text-brand-primary text-xs font-semibold"
    />
  );
}
