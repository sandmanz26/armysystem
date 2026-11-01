import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { DETAIL, LEADERBOARD_PER_PAGE } from "../constants";
import type { Trainee } from "../types";

// Courseware selection lives in the shared top bar (detail2/index.tsx) — no
// per-tab dropdown here.
interface LeaderboardTab2Props {
  courseware: string;
}

interface RankedTrainee extends Trainee {
  leaderboardRank: number;
}

function rankStyle(r: number) {
  if (r === 1) return { bg: "bg-amber-400",   text: "text-white", label: "1st" };
  if (r === 2) return { bg: "bg-gray-400",    text: "text-white", label: "2nd" };
  if (r === 3) return { bg: "bg-orange-600",  text: "text-white", label: "3rd" };
  return { bg: "bg-gray-100", text: "text-gray-600", label: String(r) };
}

export function LeaderboardTab2({ courseware }: LeaderboardTab2Props) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = DETAIL.trainees.filter(
    (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery)
  );
  const sorted = [...filtered].sort((a, b) => {
    const aScore = parseInt(a.performance.split(" / ")[0]);
    const bScore = parseInt(b.performance.split(" / ")[0]);
    return bScore - aScore;
  });
  const paginated: RankedTrainee[] = sorted
    .slice((page - 1) * LEADERBOARD_PER_PAGE, page * LEADERBOARD_PER_PAGE)
    .map((t, idx) => ({ ...t, leaderboardRank: (page - 1) * LEADERBOARD_PER_PAGE + idx + 1 }));

  const columns = useMemo<ColumnDef<RankedTrainee, any>[]>(() => [
    {
      header: "Rank",
      accessorKey: "leaderboardRank",
      cell: (info) => {
        const rank: number = info.getValue();
        const rs = rankStyle(rank);
        return (
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black", rs.bg, rs.text)}>
            {rs.label}
          </div>
        );
      },
    },
    {
      header: "Military Rank",
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
      header: "Score",
      accessorKey: "courseResults",
      cell: (info) => <span className="text-sm font-bold text-gray-800">{info.getValue()}</span>,
    },
    {
      header: "MPI (mm)",
      accessorKey: "mpi",
      cell: (info) => <span className="text-sm text-gray-600">{(info.getValue() as number).toFixed(2)}</span>,
    },
  ], []);

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            Leaderboard
            <span className="ml-2 text-xs font-normal text-gray-400">({courseware})</span>
          </div>
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
        </div>
        <TableCustom
          data={paginated}
          columns={columns}
          autoScrollTable={true}
          classThead="bg-red-50/70"
          classTheadTh="text-brand-primary text-xs font-bold py-3 px-4 whitespace-nowrap"
          classTBodyTd="px-4 py-3 h-auto"
        />
        <Pagination currentPage={page} itemsPerPage={LEADERBOARD_PER_PAGE} totalItems={sorted.length} setCurrentPage={setPage} />
      </div>
    </div>
  );
}
