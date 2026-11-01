import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { TraineeFilterPanel, EMPTY_TRAINEE_FILTERS } from "./TraineeFilterPanel";
import type { TraineeFilters } from "./TraineeFilterPanel";
import { DETAIL, NOMINAL_ROLL_PER_PAGE } from "../constants";
import type { Trainee } from "../types";

// Courseware selection lives in the shared top bar (detail2/index.tsx) — no
// per-tab dropdown here.
interface NominalRollTab2Props {
  courseware: string;
}

export function NominalRollTab2({ courseware }: NominalRollTab2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TraineeFilters>(EMPTY_TRAINEE_FILTERS);
  const [page, setPage] = useState(1);

  const uniqueRanks = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.rank))].sort(), []);
  const uniqueWeapons = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.weapon))].sort(), []);
  const uniqueLanes = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.lane))].sort(), []);
  const uniqueDetails = useMemo(() => [...new Set(DETAIL.trainees.map((t) => t.detail))].sort(), []);
  const activeFilterCount = filters.results.length + filters.ranks.length + filters.weapons.length + filters.lanes.length + filters.details.length;

  const filtered = DETAIL.trainees.filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery);
    const matchesResult = filters.results.length === 0 || filters.results.includes(t.resultLabel);
    const matchesRank = filters.ranks.length === 0 || filters.ranks.includes(t.rank);
    const matchesWeapon = filters.weapons.length === 0 || filters.weapons.includes(t.weapon);
    const matchesLane = filters.lanes.length === 0 || filters.lanes.includes(t.lane);
    const matchesDetail = filters.details.length === 0 || filters.details.includes(t.detail);
    return matchesSearch && matchesResult && matchesRank && matchesWeapon && matchesLane && matchesDetail;
  });
  const paginated = filtered.slice((page - 1) * NOMINAL_ROLL_PER_PAGE, page * NOMINAL_ROLL_PER_PAGE);

  const columns = useMemo<ColumnDef<Trainee, any>[]>(() => [
    {
      header: "#",
      accessorKey: "no",
      cell: (info) => <span className="text-xs text-gray-400">{info.getValue()}</span>,
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
      header: "Weapon",
      accessorKey: "weapon",
      cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
    },
    {
      header: "Detail",
      accessorKey: "detail",
      cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
    },
    {
      header: "Lane",
      accessorKey: "lane",
      cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
    },
    {
      header: "Best Attempt",
      accessorKey: "performance",
      cell: (info) => (
        <span className="text-sm font-semibold text-gray-800">
          {info.getValue()} <span className="text-xs text-gray-400 font-normal">(P)</span>
        </span>
      ),
    },
    {
      header: "Course Results",
      accessorKey: "courseResults",
      cell: (info) => (
        <span className="text-sm font-bold text-brand-primary">
          {info.getValue()} <span className="text-xs font-normal text-gray-400">(M)</span>
        </span>
      ),
    },
  ], []);

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            Nominal Roll
            <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} trainees · {courseware})</span>
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
          data={paginated}
          columns={columns}
          autoScrollTable={true}
          classThead="bg-red-50/70"
          classTheadTh="text-brand-primary text-xs font-bold py-3 px-4 whitespace-nowrap"
          classTBodyTd="px-4 py-3 h-auto"
        />
        <Pagination currentPage={page} itemsPerPage={NOMINAL_ROLL_PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
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
