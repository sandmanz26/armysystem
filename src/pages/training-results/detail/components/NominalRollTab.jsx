import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { CoursewareSection } from "./CoursewareSection";
import { DETAIL, NOMINAL_ROLL_PER_PAGE } from "../constants";
export function NominalRollTab({ courseware, setCourseware }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const filtered = DETAIL.trainees.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery));
    const totalPages = Math.max(1, Math.ceil(filtered.length / NOMINAL_ROLL_PER_PAGE));
    const paginated = filtered.slice((page - 1) * NOMINAL_ROLL_PER_PAGE, page * NOMINAL_ROLL_PER_PAGE);
    const columns = useMemo(() => [
        {
            id: "no",
            header: "#",
            accessorKey: "no",
            compact: true,
            width: "44px",
            minWidth: "44px",
            maxWidth: "44px",
            cell: (info) => <span className="text-xs text-gray-400 block text-center">{info.getValue()}</span>,
        },
        {
            header: "Rank",
            accessorKey: "rank",
            compact: true,
            width: "70px",
            minWidth: "70px",
            maxWidth: "70px",
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
            compact: true,
            width: "100px",
            minWidth: "100px",
            maxWidth: "100px",
            cell: (info) => <span className="text-xs text-gray-500 font-mono">{info.getValue()}</span>,
        },
        {
            header: "Weapon",
            accessorKey: "weapon",
            compact: true,
            width: "80px",
            minWidth: "80px",
            maxWidth: "80px",
            cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
        },
        {
            header: "Detail",
            accessorKey: "detail",
            compact: true,
            width: "70px",
            minWidth: "70px",
            maxWidth: "70px",
            cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
        },
        {
            header: "Lane",
            accessorKey: "lane",
            compact: true,
            width: "80px",
            minWidth: "80px",
            maxWidth: "80px",
            cell: (info) => <span className="text-xs text-gray-600">{info.getValue()}</span>,
        },
        {
            header: "Best Attempt",
            accessorKey: "performance",
            width: "120px",
            minWidth: "120px",
            maxWidth: "120px",
            cell: (info) => (<span className="text-sm font-semibold text-gray-800">
          {info.getValue()} <span className="text-xs text-gray-400 font-normal">(P)</span>
        </span>),
        },
        {
            header: "Course Results",
            accessorKey: "courseResults",
            width: "130px",
            minWidth: "130px",
            maxWidth: "130px",
            cell: (info) => (<span className="text-sm font-bold text-brand-primary">
          {info.getValue()} <span className="text-xs font-normal text-gray-400">(M)</span>
        </span>),
        },
    ], []);
    return (<div className="p-6">
      <CoursewareSection courseware={courseware} setCourseware={setCourseware}/>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            Nominal Roll
            <span className="ml-2 text-xs font-normal text-gray-400">({DETAIL.totalTrainees} trainees)</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10"/>
            <InputCustom type="text" placeholder="Search trainee…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"/>
          </div>
        </div>
        <TableCustom data={paginated} columns={columns} autoScrollTable={true} tableFixed={true} classThead="bg-red-50/70" classTheadTh="text-brand-primary text-xs font-bold py-3 px-4 whitespace-nowrap" classTBodyTd="px-4 py-3 h-auto"/>
        <Pagination currentPage={page} itemsPerPage={NOMINAL_ROLL_PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage}/>
      </div>
    </div>);
}
