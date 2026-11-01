import { useState, useMemo } from "react";
import { ChevronDown, Clock, Target, CheckCircle, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { DonutChart } from "./DonutChart";
import { DETAIL, CW_OPTIONS, TRAINEE_RESULT_PER_PAGE } from "../constants";
function ResultBadge({ label }) {
    if (label === "MARKSMAN")
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">MARKSMAN</span>;
    if (label === "PASSED")
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">PASSED</span>;
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">FAILED</span>;
}
export function TrainingPerformanceTab({ courseware, setCourseware }) {
    const [cwOpen, setCwOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const segmentIcons = [Target, CheckCircle, XCircle];
    const filteredTrainees = DETAIL.trainees.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery));
    const totalPages = Math.max(1, Math.ceil(filteredTrainees.length / TRAINEE_RESULT_PER_PAGE));
    const paginatedTrainees = filteredTrainees.slice((page - 1) * TRAINEE_RESULT_PER_PAGE, page * TRAINEE_RESULT_PER_PAGE);
    const columns = useMemo(() => [
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
                const val = info.getValue();
                return (<div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{val}</span>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(parseInt(val) / 20) * 100}%` }}/>
            </div>
          </div>);
            },
        },
        {
            header: "Result",
            accessorKey: "resultLabel",
            cell: (info) => <ResultBadge label={info.getValue()}/>,
        },
    ], []);
    return (<div className="p-6 space-y-6">
      {/* Top info bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Courseware selector */}
        <div className="relative">
          <button type="button" onClick={() => setCwOpen(!cwOpen)} className="flex items-center gap-2 pl-3 pr-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-300 shadow-sm transition-colors min-w-[260px] justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Courseware</span>
              <span className="font-semibold text-gray-800">{courseware}</span>
            </div>
            <ChevronDown size={14} className={cn("text-gray-400 transition-transform", cwOpen && "rotate-180")}/>
          </button>
          {cwOpen && (<div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {CW_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => { setCourseware(opt); setCwOpen(false); }} className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors", opt === courseware ? "text-brand-primary font-semibold" : "text-gray-700")}>
                  {opt}
                </button>))}
            </div>)}
        </div>

        {/* Time info chips */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
          <Clock size={12} className="text-gray-400"/>
          <span>{DETAIL.startTime}</span>
          <span className="text-gray-300">→</span>
          <span>{DETAIL.endTime}</span>
          <span className="ml-1 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold text-gray-600">{DETAIL.duration}</span>
        </div>
      </div>

      {/* Performance overview: chart + stat cards */}
      <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
        {/* Donut + legend */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center min-w-[260px]">
          <div className="text-sm font-semibold text-gray-700 mb-5 self-start">Performance Chart</div>
          <DonutChart size={180}/>
          <div className="mt-5 w-full space-y-2.5">
            {DETAIL.segments.map((seg) => (<div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}/>
                  <span className="text-xs text-gray-600">{seg.count} trainees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{(seg.pct * 100).toFixed(0)}%</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", seg.bg, seg.text)}>{seg.label}</span>
                </div>
              </div>))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4">
          {DETAIL.segments.map((seg, i) => {
            const Icon = segmentIcons[i];
            return (<div key={seg.label} className={cn("flex items-center gap-4 p-4 rounded-xl border shadow-sm", seg.bg, seg.border)}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                  <Icon size={22} style={{ color: seg.color }}/>
                </div>
                <div className="flex-1">
                  <div className={cn("text-xs font-bold tracking-wide", seg.text)}>{seg.label}</div>
                  <div className="text-3xl font-bold text-gray-800 mt-0.5">{seg.count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{(seg.pct * 100).toFixed(0)}% of {DETAIL.totalTrainees} trainees</div>
                </div>
                {/* Mini bar */}
                <div className="w-24 h-2 bg-white/70 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }}/>
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* Trainee Result table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            Trainee Results
            <span className="ml-2 text-xs font-normal text-gray-400">({DETAIL.trainees.length} trainees)</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10"/>
            <InputCustom type="text" placeholder="Search trainee…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"/>
          </div>
        </div>
        <TableCustom data={paginatedTrainees} columns={columns} autoScrollTable={true} classThead="bg-red-50/70" classTheadTh="text-brand-primary text-xs font-bold py-3 px-4" classTBodyTd="px-4 py-3 h-auto"/>
        <Pagination currentPage={page} itemsPerPage={TRAINEE_RESULT_PER_PAGE} totalItems={filteredTrainees.length} setCurrentPage={setPage}/>
      </div>
    </div>);
}
