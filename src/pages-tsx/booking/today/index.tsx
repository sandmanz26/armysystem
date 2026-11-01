import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { BASE_STATIONS, SUMMARY_CARDS } from "./constants";
import type { BaseStation, TodaysBookingProps } from "./types";

const columnHelper = createColumnHelper<BaseStation>();

function StatusBadges({ statuses }: { statuses: string[] }) {
  if (statuses.length === 0) return <span className="text-sm text-gray-400">-</span>;

  const colorMap: Record<string, string> = {
    Upcoming: "bg-blue-50 text-blue-600 border border-blue-200",
    Ongoing: "bg-green-50 text-green-600 border border-green-200",
    Completed: "bg-gray-100 text-gray-600 border border-gray-200",
    Overdue: "bg-red-50 text-red-600 border border-red-200",
    "Return Assets": "bg-orange-50 text-orange-600 border border-orange-200",
    Cancelled: "bg-gray-50 text-gray-500 border border-gray-200",
  };

  const unique = [...new Set(statuses)];
  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((s) => (
        <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMap[s] ?? "bg-gray-100 text-gray-600"}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

function ExpandedBookingDetail({ station }: { station: BaseStation }) {
  if (!station.details || station.details.length === 0) {
    return (
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-400">
        No bookings for this station today.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-t border-gray-100">
      <div className="px-6 py-3">
        <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-brand-primary pb-2 border-b border-gray-200">
          <div>Program</div>
          <div>Booking ID</div>
          <div>Training Type</div>
          <div>Date</div>
          <div>Time</div>
          <div>Status</div>
        </div>
        {station.details.map((d) => {
          const statusColor: Record<string, string> = {
            Upcoming: "bg-blue-50 text-blue-600 border border-blue-200",
            Ongoing: "bg-green-50 text-green-600 border border-green-200",
            Completed: "bg-gray-100 text-gray-600 border border-gray-200",
            Overdue: "bg-red-50 text-red-600 border border-red-200",
          };
          return (
            <div key={d.id} className="grid grid-cols-6 gap-4 py-2.5 border-b border-gray-100 text-sm items-center">
              <div className="font-medium text-gray-800 truncate">{d.program}</div>
              <div className="text-gray-500 font-mono text-xs">{d.bookingId}</div>
              <div className="text-gray-600">{d.trainingType}</div>
              <div className="text-gray-600">{d.bookingDate}</div>
              <div className="text-gray-600 text-xs">{d.bookingTime}</div>
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {d.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TodaysBooking({ onNavigate }: TodaysBookingProps) {
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: () => "Base Station(s)",
      cell: (info) => (
        <span className="text-sm font-medium text-gray-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("bookings", {
      header: () => "Booking(s)",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("statuses", {
      header: () => "Status",
      cell: (info) => <StatusBadges statuses={info.getValue()} />,
    }),
    columnHelper.accessor("activeLanes", {
      header: () => "Active Lane(s)",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("assignments", {
      header: () => "Assignment(s)",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue()}</span>
      ),
    }),
  ], []);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-brand-primary">Today's Booking</h1>
          <div className="flex gap-3">
            <Button
              type="outline"
              onClick={() => onNavigate("/bookings/list")}
              className="px-4 py-2 text-sm font-medium w-auto"
            >
              View All Bookings
            </Button>
            <Button
              type="default"
              className="px-4 py-2 text-sm font-semibold bg-brand-primary hover:bg-brand-primary-hover text-white w-auto"
            >
              Issue Assets
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}>
                <BookOpen size={20} className={card.iconColor} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{card.label}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {card.value}{" "}
                  <span className="text-sm font-normal text-gray-500">{card.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Base Station Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <TableCustom
            columns={columns}
            data={BASE_STATIONS}
            autoScrollTable={false}
            classThead="bg-red-50/70"
            classTheadTh="text-brand-primary text-xs font-semibold"
            nestedComponentButtonCondition={() => true}
            getNestedComponent={(row) => (
              <ExpandedBookingDetail station={row.original} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
