import { useState, useMemo } from "react";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { type ColumnDef } from "@tanstack/react-table";
import { Pagination } from "@/components/ui/Pagination";
import { createLiveResults, RESULTS_PER_PAGE } from "../constants";
import { useBookingStore } from "../store/useBookingStore";
import { ReshootDetailModal } from "../modals/ReshootDetailModal";
import type { BookingTrainee } from "../types";

function Score({ score, total, pass }: { score: number; total: number; pass: boolean }) {
  return (
    <span className="text-sm">
      <span className="font-bold text-gray-800">{score}</span>
      <span className="text-gray-400">/{total}</span>{" "}
      <span className={cn("font-bold text-xs", pass ? "text-green-600" : "text-red-500")}>
        ({pass ? "P" : "F"})
      </span>
    </span>
  );
}

export function LiveResultsPage({
  onBack,
  onReshoot,
  detailCountByStation,
}: {
  onBack: () => void;
  onReshoot: (station: string, coursewares: string[], trainees: BookingTrainee[]) => void;
  detailCountByStation: Record<string, number>;
}) {
  const booking = useBookingStore((s) => s.booking);
  const [tab] = useState<"trainee" | "stage">("trainee");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showReshootModal, setShowReshootModal] = useState(false);

  const LIVE_RESULTS = useMemo(() => createLiveResults(booking?.trainees ?? []), [booking?.trainees]);
  const filtered = useMemo(
    () => LIVE_RESULTS.filter(
      (r: any) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.svcId.includes(search)
    ),
    [LIVE_RESULTS, search]
  );
  const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

  const selectedRows = useMemo(() => LIVE_RESULTS.filter((r: any) => selected.has(r.no)), [LIVE_RESULTS, selected]);
  const selectedStations = useMemo(() => new Set(selectedRows.map((r: any) => r.station)), [selectedRows]);
  const isReshooting = selected.size > 0;
  const stationMismatch = selectedStations.size > 1;
  const canCreate = isReshooting && !stationMismatch;
  const reshootStation = selectedStations.size === 1 ? [...selectedStations][0] as string : "";

  const coursewareOptions = useMemo(
    () => (booking?.courseware ? booking.courseware.split(",").map((c) => c.trim()).filter(Boolean) : []),
    [booking?.courseware]
  );

  const toggleRow = (no: number) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(no)) next.delete(no); else next.add(no);
    return next;
  });

  const cancelReshoot = () => setSelected(new Set());

  const traineeColumns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "select",
      header: () => "",
      width: "48px" as any,
      minWidth: "48px" as any,
      maxWidth: "48px" as any,
      cell: ({ row }: any) => (
        <Checkbox size={16} checked={selected.has(row.original.no)} onChange={() => toggleRow(row.original.no)} />
      ),
    },
    {
      id: "no",
      header: () => "No",
      width: "56px" as any,
      minWidth: "56px" as any,
      maxWidth: "56px" as any,
      cell: ({ row }: any) => <span className="text-sm text-gray-700">{(page - 1) * RESULTS_PER_PAGE + row.index + 1}</span>,
    },
    { accessorKey: "rank", header: () => "Rank", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "name", header: () => "Name", cell: ({ getValue }: any) => <span className="text-sm font-medium text-gray-800">{getValue()}</span> },
    { accessorKey: "svcId", header: () => "Service ID", cell: ({ getValue }: any) => <span className="text-sm text-gray-600">{getValue()}</span> },
    { accessorKey: "weapon", header: () => "Weapon Type(s)", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "station", header: () => "Station", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "detail", header: () => "Detail", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "lane", header: () => "Lane", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    {
      accessorKey: "action",
      header: () => "Course Results",
      cell: ({ row }: any) => <Score score={row.original.courseScore} total={row.original.courseTotalScore} pass={row.original.pass} />,
    },
  ], [page, selected]);

  const stageColumns = useMemo<ColumnDef<any, any>[]>(() => [
    { id: "select", header: () => "", cell: () => <Checkbox size={16} /> },
    { accessorKey: "station", header: () => "Station", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "detail", header: () => "Detail", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { accessorKey: "lane", header: () => "Lane", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span> },
    { id: "stageA", header: () => "Stage A", cell: ({ row }: any) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageA.score} total={row.original.stageA.total} pass={row.original.stageA.pass} /></span> },
    { id: "stageB", header: () => "Stage B", cell: ({ row }: any) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageB.score} total={row.original.stageB.total} pass={row.original.stageB.pass} /></span> },
    { id: "stageC", header: () => "Stage C", cell: ({ row }: any) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageC.score} total={row.original.stageC.total} pass={row.original.stageC.pass} /></span> },
    {
      accessorKey: "action",
      header: () => "Course Results",
      cell: ({ row }: any) => <Score score={row.original.courseScore} total={row.original.courseTotalScore} pass={row.original.pass} />,
    },
  ], []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-800">Live Results</h2>
        <div className="flex items-center gap-3">
          {isReshooting && (
            <Button
              type="outline"
              onClick={cancelReshoot}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-brand-primary w-auto border border-brand-primary/40 hover:bg-red-50"
            >
              Cancel Reshoot
            </Button>
          )}
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isReshooting && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Select the trainees to reshoot. Trainees must be from the same station; a new detail is created on that station.
              Trainees with no matching lane (weapon, role, or station type) will be skipped.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Nominal Roll List</span>
              <span className="text-sm text-gray-400">({filtered.length} Trainees)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputCustom
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              {isReshooting ? (
                <div className="flex items-center gap-2">
                  {stationMismatch && (
                    <span className="text-xs text-red-500 font-medium">Select trainees from the same station only.</span>
                  )}
                  <Button
                    onClick={() => setShowReshootModal(true)}
                    disabled={!canCreate}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto",
                      canCreate ? "bg-brand-primary text-white hover:bg-brand-primary-hover" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Create New Detail ({selected.size})
                  </Button>
                </div>
              ) : (
                <Button
                  type="outline"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 w-auto border border-gray-200"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </Button>
              )}
            </div>
          </div>

          <TableCustom
            columns={tab === "trainee" ? traineeColumns : stageColumns}
            data={paginated}
            autoScrollTable={true}
          />
          <Pagination currentPage={page} itemsPerPage={RESULTS_PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
        </div>
      </div>

      {showReshootModal && (
        <ReshootDetailModal
          detailNumber={(detailCountByStation[reshootStation] ?? 0) + 1}
          station={reshootStation}
          coursewareOptions={coursewareOptions}
          onCancel={() => setShowReshootModal(false)}
          onConfirm={(coursewares) => {
            onReshoot(reshootStation, coursewares, selectedRows as BookingTrainee[]);
            setShowReshootModal(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}
