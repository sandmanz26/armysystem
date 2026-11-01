import { useState, useMemo } from "react";
import { Clock, Target, CheckCircle, XCircle, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { DonutChart } from "./DonutChart";
import { TraineeFilterPanel, EMPTY_TRAINEE_FILTERS } from "./TraineeFilterPanel";
import type { TraineeFilters } from "./TraineeFilterPanel";
import { DETAIL, TRAINEE_RESULT_PER_PAGE } from "../constants";
import type { Trainee } from "../types";

// Courseware is picked once in the shared bar at the top of the page (see
// detail2/index.tsx) — this tab just renders for whichever courseware is
// currently selected, instead of owning its own duplicate selector.
interface TrainingPerformanceTab2Props {
  courseware: string;
}

function ResultBadge({ label }: { label: string }) {
  if (label === "MARKSMAN") return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">MARKSMAN</span>;
  if (label === "PASSED")   return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">PASSED</span>;
  return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">FAILED</span>;
}

export function TrainingPerformanceTab2({ courseware }: TrainingPerformanceTab2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TraineeFilters>(EMPTY_TRAINEE_FILTERS);
  const [page, setPage] = useState(1);

  const segmentIcons = [Target, CheckCircle, XCircle];

  const uniqueRanks = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.rank))].sort(), []);
  const uniqueWeapons = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.weapon))].sort(), []);
  const uniqueLanes = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.lane))].sort(), []);
  const uniqueDetails = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.detail))].sort(), []);
  const activeFilterCount = filters.results.length + filters.ranks.length + filters.weapons.length + filters.lanes.length + filters.details.length;

  const filteredTrainees = DETAIL.trainees.filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery);
    const matchesResult = filters.results.length === 0 || filters.results.includes(t.resultLabel);
    const matchesRank = filters.ranks.length === 0 || filters.ranks.includes(t.rank);
    const matchesWeapon = filters.weapons.length === 0 || filters.weapons.includes(t.weapon);
    const matchesLane = filters.lanes.length === 0 || filters.lanes.includes(t.lane);
    const matchesDetail = filters.details.length === 0 || filters.details.includes(t.detail);
    return matchesSearch && matchesResult && matchesRank && matchesWeapon && matchesLane && matchesDetail;
  });
  const paginatedTrainees = filteredTrainees.slice((page - 1) * TRAINEE_RESULT_PER_PAGE, page * TRAINEE_RESULT_PER_PAGE);

  const columns = useMemo<ColumnDef<Trainee, any>[]>(() => [
    {
      header: "#",
      accessorKey: "no",
      cell: (info) => <span className="text-xs text-gray-400 font-medium">{info.getValue()}</span>,
    },
    {
      header: "Rank",
      accessorKey: "rank",
      cell: (info) => <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold">{info.getValue()}</span>,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => <span className="text-sm font-semibold text-gray-800">{info.getValue()}</span>,
    },
    {
      header: "Service ID",
      accessorKey: "svcId",
      cell: (info) => <span className="text-xs text-gray-500 font-mono">{info.getValue()}</span>,
    },
    {
      header: "Score",
      accessorKey: "courseResults",
      cell: (info) => {
        const val: string = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{val}</span>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full"
                style={{ width: `${(parseInt(val) / 20) * 100}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      header: "Result",
      accessorKey: "resultLabel",
      cell: (info) => <ResultBadge label={info.getValue()} />,
    },
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Time info chip — courseware selector now lives in the shared top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
          <Clock size={12} className="text-gray-400" />
          <span>{DETAIL.startTime}</span>
          <span className="text-gray-300">→</span>
          <span>{DETAIL.endTime}</span>
          <span className="ml-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold text-gray-600">{DETAIL.duration}</span>
        </div>
        <span className="text-xs text-gray-400">
          Results shown for <span className="font-semibold text-gray-600">{courseware}</span>
        </span>
      </div>

      {/* Performance overview: chart + stat cards */}
      <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
        {/* Donut + legend */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center min-w-[260px]">
          <div className="text-sm font-semibold text-gray-700 mb-5 self-start">Performance Chart</div>
          <DonutChart size={180} />
          <div className="mt-5 w-full space-y-2.5">
            {DETAIL.segments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs text-gray-600">{seg.count} trainees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{(seg.pct * 100).toFixed(0)}%</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", seg.bg, seg.text)}>{seg.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4">
          {DETAIL.segments.map((seg, i) => {
            const Icon = segmentIcons[i];
            return (
              <div key={seg.label} className={cn("flex items-center gap-4 p-4 rounded-xl border shadow-sm", seg.bg, seg.border)}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Icon size={22} style={{ color: seg.color }} />
                </div>
                <div className="flex-1">
                  <div className={cn("text-xs font-bold tracking-wide", seg.text)}>{seg.label}</div>
                  <div className="text-3xl font-bold text-gray-800 mt-0.5">{seg.count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{(seg.pct * 100).toFixed(0)}% of {DETAIL.totalTrainees} trainees</div>
                </div>
                {/* Mini bar */}
                <div className="w-24 h-2 bg-white/70 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trainee Result table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            Trainee Results
            <span className="ml-2 text-xs font-normal text-gray-400">({filteredTrainees.length} trainees)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <InputCustom
                type="text"
                placeholder="Search trainee…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors",
                activeFilterCount > 0
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary"
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <TableCustom
          data={paginatedTrainees}
          columns={columns}
          autoScrollTable={true}
          classThead="bg-red-50/70"
          classTheadTh="text-brand-primary text-xs font-bold py-3 px-4"
          classTBodyTd="px-4 py-3 h-auto"
        />
        <Pagination currentPage={page} itemsPerPage={TRAINEE_RESULT_PER_PAGE} totalItems={filteredTrainees.length} setCurrentPage={setPage} />
      </div>

      <TraineeFilterPanel
        open={filterOpen}
        filters={filters}
        uniqueRanks={uniqueRanks}
        uniqueWeapons={uniqueWeapons}
        uniqueLanes={uniqueLanes}
        uniqueDetails={uniqueDetails}
        onApply={(f) => { setFilters(f); setPage(1); }}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
