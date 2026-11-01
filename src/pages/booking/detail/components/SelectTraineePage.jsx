import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { createLiveResults, RESULTS_PER_PAGE } from "../constants";
import { useBookingStore } from "../store/useBookingStore";
const ORDINALS = ["1st", "2nd", "3rd"];
function Score({ score, total, pass }) {
    return (<span className="text-sm">
      <span className="font-bold text-gray-800">{score}</span>
      <span className="text-gray-400">/{total}</span>{" "}
      <span className={cn("font-bold text-xs", pass ? "text-green-600" : "text-red-500")}>
        ({pass ? "P" : "F"})
      </span>
    </span>);
}
function StageBreakdown({ r }) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs px-6 py-3">
      {["A", "B", "C"].map((stage) => {
            const s = stage === "A" ? r.stageA : stage === "B" ? r.stageB : r.stageC;
            return (<div key={stage}>
            <div className="font-bold text-gray-600 mb-2">Stage {stage}</div>
            <div className="mb-1.5">Best Attempt: <Score score={s.score} total={s.total} pass={s.pass}/></div>
            <div className="text-gray-400 mb-1">Past Attempt:</div>
            {r.attempts.map((att, ai) => {
                    const sc = stage === "A" ? att.a : stage === "B" ? att.b : att.c;
                    return (<div key={ai} className="ml-2">
                  {ai + 1}. {ORDINALS[ai]} Attempt:{" "}
                  <Score score={sc} total={25} pass={sc >= 16}/>
                </div>);
                })}
          </div>);
        })}
    </div>);
}
export function SelectTraineePage({ laneNo, onBack, onSave, }) {
    const booking = useBookingStore((s) => s.booking);
    const [tab, setTab] = useState("trainee");
    const [search, setSearch] = useState("");
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [page, setPage] = useState(1);
    const LIVE_RESULTS = useMemo(() => createLiveResults(booking?.trainees ?? []), [booking?.trainees]);
    const filtered = useMemo(() => LIVE_RESULTS.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.svcId.includes(search)), [LIVE_RESULTS, search]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);
    const globalIdx = (rowIdx) => (page - 1) * RESULTS_PER_PAGE + rowIdx;
    const handleSave = () => {
        if (selectedIdx === null)
            return;
        const t = LIVE_RESULTS[selectedIdx];
        onSave({ rank: t.rank, name: t.name, svcId: t.svcId, weapon: t.weapon });
    };
    const traineeColumns = useMemo(() => [
        {
            id: "select",
            header: () => <Checkbox size={16} disabled/>,
            cell: ({ row }) => {
                const gi = globalIdx(row.index);
                return (<Checkbox size={16} checked={selectedIdx === gi} onChange={() => setSelectedIdx(selectedIdx === gi ? null : gi)}/>);
            },
        },
        { id: "no", header: () => "No", cell: ({ row }) => <span className="text-sm text-gray-700">{globalIdx(row.index) + 1}</span> },
        { accessorKey: "rank", header: () => "Rank", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "name", header: () => "Name", cell: ({ getValue }) => <span className="text-sm font-medium text-gray-800">{getValue()}</span> },
        { accessorKey: "svcId", header: () => "Service ID", cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue()}</span> },
        { accessorKey: "weapon", header: () => "Weapon Type(s)", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "station", header: () => "Station", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "detail", header: () => "Detail", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "lane", header: () => "Lane", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        {
            accessorKey: "action",
            header: () => "Course Results",
            cell: ({ row }) => <Score score={row.original.courseScore} total={row.original.courseTotalScore} pass={row.original.pass}/>,
        },
    ], [selectedIdx, page]);
    const stageColumns = useMemo(() => [
        {
            id: "select",
            header: () => <Checkbox size={16} disabled/>,
            cell: ({ row }) => {
                const gi = globalIdx(row.index);
                return (<Checkbox size={16} checked={selectedIdx === gi} onChange={() => setSelectedIdx(selectedIdx === gi ? null : gi)}/>);
            },
        },
        { accessorKey: "station", header: () => "Station", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "detail", header: () => "Detail", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "lane", header: () => "Lane", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { id: "stageA", header: () => "Stage A", cell: ({ row }) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageA.score} total={row.original.stageA.total} pass={row.original.stageA.pass}/></span> },
        { id: "stageB", header: () => "Stage B", cell: ({ row }) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageB.score} total={row.original.stageB.total} pass={row.original.stageB.pass}/></span> },
        { id: "stageC", header: () => "Stage C", cell: ({ row }) => <span className="text-xs text-gray-700">Best Attempt: <Score score={row.original.stageC.score} total={row.original.stageC.total} pass={row.original.stageC.pass}/></span> },
        {
            accessorKey: "action",
            header: () => "Course Results",
            cell: ({ row }) => <Score score={row.original.courseScore} total={row.original.courseTotalScore} pass={row.original.pass}/>,
        },
    ], [selectedIdx, page]);
    return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="px-6 py-5 flex items-start justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Select Trainees</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select trainees you would like to add into Lane {laneNo} for reshoot.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="outline" onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 w-auto border border-gray-200">
            <ArrowLeft size={14}/> Back
          </Button>
          <Button onClick={handleSave} disabled={selectedIdx === null} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed">
            Save Detail List <ArrowRight size={14}/>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Nominal Roll List</span>
              <span className="text-sm text-gray-400">({filtered.length} Trainees)</span>
              <div className="flex items-center ml-4 border border-gray-200 rounded-lg overflow-hidden">
                <button type="button" onClick={() => setTab("trainee")} className={cn("px-4 py-1.5 text-xs font-semibold transition-colors", tab === "trainee" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-50")}>
                  Trainee Info
                </button>
                <button type="button" onClick={() => setTab("stage")} className={cn("px-4 py-1.5 text-xs font-semibold transition-colors border-l border-gray-200", tab === "stage" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-50")}>
                  Stage Breakdown
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <InputCustom value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search" className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:ring-1 focus:ring-brand-primary"/>
              </div>
              <Button type="outline" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 w-auto border border-gray-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
              </Button>
            </div>
          </div>

          <TableCustom columns={tab === "trainee" ? traineeColumns : stageColumns} data={paginated} autoScrollTable={true} getNestedComponent={(row) => <StageBreakdown r={row.original}/>}/>
          <Pagination currentPage={page} itemsPerPage={RESULTS_PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage}/>
        </div>
      </div>
    </div>);
}
