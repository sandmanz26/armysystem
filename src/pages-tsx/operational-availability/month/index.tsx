import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ChevronRight,
  ArrowLeft,
  Clock,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { oaMonths } from "@/data/operationalAvailability";
import type { OABooking } from "@/pages-tsx/operational-availability/types";

const PER_PAGE = 10;

interface Props {
  monthId: string;
  onNavigate?: (path: string) => void;
}

type BookingRow = OABooking & { _idx: number };

export function OperationalAvailabilityMonth({ monthId, onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const record = oaMonths.find((m) => m.id === monthId);

  const filtered = useMemo(() => {
    if (!record) return [];
    return record.bookings.filter(
      (b) =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingRef.toLowerCase().includes(search.toLowerCase()),
    );
  }, [record, search]);


  const indexedPaginated: BookingRow[] = useMemo(() => {
    const paginated = filtered.slice(
      (currentPage - 1) * PER_PAGE,
      currentPage * PER_PAGE,
    );
    return paginated.map((b, idx) => ({
      ...b,
      _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    }));
  }, [filtered, currentPage]);

  const columns = useMemo<ColumnDef<BookingRow, any>[]>(
    () => [
      {
        id: "no",
        header: () => "No",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="text-sm text-gray-500 cursor-pointer"
          >
            {info.row.original._idx}
          </div>
        ),
      },
      {
        id: "bookingRef",
        header: () => "Booking Ref",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="cursor-pointer"
          >
            <span className="text-xs font-medium text-brand-primary bg-red-50 px-2 py-0.5 rounded-full">
              {info.row.original.bookingRef}
            </span>
          </div>
        ),
      },
      {
        id: "name",
        header: () => "Booking Name",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="text-sm font-medium text-gray-800 hover:text-brand-primary transition-colors cursor-pointer"
          >
            {info.row.original.name}
          </div>
        ),
      },
      {
        id: "courseware",
        header: () => "Courseware",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="text-sm text-gray-500 cursor-pointer"
          >
            {info.row.original.courseware}
          </div>
        ),
      },
      {
        id: "ot",
        header: () => "Operation Time (OT)",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="text-sm text-gray-700 font-mono cursor-pointer"
          >
            {info.row.original.ot}
          </div>
        ),
      },
      {
        id: "dt",
        header: () => "Down Time (DT)",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className={cn(
              "text-sm font-mono cursor-pointer",
              info.row.original.dt !== "0m 0s"
                ? "text-red-500 font-semibold"
                : "text-gray-400",
            )}
          >
            {info.row.original.dt}
          </div>
        ),
      },
      {
        id: "devices",
        header: () => "Devices",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="cursor-pointer"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {info.row.original.devices.length}
            </span>
          </div>
        ),
      },
      {
        id: "chevron",
        header: () => "",
        cell: (info) => (
          <div
            onClick={() =>
              onNavigate?.(
                `/operational-availability/${monthId}/${info.row.original.id}`,
              )
            }
            className="cursor-pointer"
          >
            <ChevronRight
              size={15}
              className="text-gray-300 hover:text-brand-primary transition-colors"
            />
          </div>
        ),
      },
    ],
    [monthId, onNavigate],
  );

  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Month not found.
      </div>
    );
  }

  const good = record.availability >= 80;
  const devicesUsed = record.bookings.reduce((s, b) => s + b.devices.length, 0);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
          <button
            onClick={() => onNavigate?.("/operational-availability")}
            className="hover:text-brand-primary transition-colors"
          >
            Operational Availability
          </button>
          <ChevronRight size={13} />
          <span className="text-gray-700 font-medium">{record.month}</span>
        </div>

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onNavigate?.("/operational-availability")}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">
              {record.month}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Operational availability breakdown by booking
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: <Clock size={18} className="text-blue-500" />,
              bg: "bg-blue-50",
              label: "Total Operation Time",
              value: record.totalOT,
              mono: true,
              sub: undefined as string | undefined,
            },
            {
              icon: <AlertCircle size={18} className="text-red-500" />,
              bg: "bg-red-50",
              label: "Total Down Time",
              value: record.totalDT,
              mono: true,
              sub: undefined as string | undefined,
            },
            {
              icon: (
                <BarChart2
                  size={18}
                  className={good ? "text-green-500" : "text-red-500"}
                />
              ),
              bg: good ? "bg-green-50" : "bg-red-50",
              label: "Operational Availability",
              value: `${record.availability.toFixed(2)}%`,
              mono: false,
              sub: undefined as string | undefined,
            },
            {
              icon: <ChevronRight size={18} className="text-purple-500" />,
              bg: "bg-purple-50",
              label: "Total Bookings",
              value: record.bookings.length.toString(),
              sub: `${devicesUsed} device sessions` as string | undefined,
              mono: false,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  card.bg,
                )}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-snug">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold mt-0.5 leading-none",
                    card.mono
                      ? "font-mono text-gray-800"
                      : good && card.label === "Operational Availability"
                        ? "text-green-600"
                        : card.label === "Operational Availability"
                          ? "text-red-500"
                          : "text-gray-800",
                  )}
                >
                  {card.value}
                </p>
                {card.sub && (
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Booking table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">
              Bookings{" "}
              <span className="text-gray-400 font-normal">
                ({record.bookings.length})
              </span>
            </p>
            <InputCustom
              type="text"
              placeholder="Search booking..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <TableCustom
            columns={columns}
            data={indexedPaginated}
            autoScrollTable={true}
            classThead="bg-red-50"
          />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
