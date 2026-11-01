import { useState, useMemo } from "react";
import { Download, Eye, Calendar } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
const MOCK_DATA = [
    {
        id: 1,
        createdDate: "24 Apr 2026",
        createdTime: "02:10:12 PM",
        scannedBy: "Liam Johansson",
        scannedByRole: "Operator",
        status: "Missing",
        scanStartTime: "02:10:12 PM",
        scanStartDate: "24 Apr 2026",
        scanEndTime: "-",
        scanEndDate: "-",
        issues: 1,
    },
];
const PER_PAGE = 10;
const STATUS_STYLE = {
    Missing: "bg-red-100 text-red-600",
    Complete: "bg-green-100 text-green-600",
    "In Progress": "bg-yellow-100 text-yellow-700",
};
export function StockTakeVarianceReport({ onNavigate }) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const filtered = MOCK_DATA.filter((r) => r.scannedBy.toLowerCase().includes(search.toLowerCase()) ||
        r.createdDate.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const indexedPaginated = paginated.map((row, idx) => ({
        ...row,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    }));
    const columns = useMemo(() => [
        {
            id: "no",
            header: () => "No",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original._idx}</div>,
        },
        {
            id: "createdOn",
            header: () => (<span className="flex items-center gap-1">
            Created On
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </span>),
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="cursor-pointer">
            <div className="font-medium text-gray-800 hover:text-brand-primary transition-colors">
              {info.row.original.createdDate}
            </div>
            <div className="text-xs text-gray-400">{info.row.original.createdTime}</div>
          </div>),
        },
        {
            id: "scannedBy",
            header: () => "Scanned By",
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="cursor-pointer">
            <div className="font-medium text-gray-800">{info.row.original.scannedBy}</div>
            <div className="text-xs text-gray-400">{info.row.original.scannedByRole}</div>
          </div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="cursor-pointer">
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", STATUS_STYLE[info.row.original.status])}>
              {info.row.original.status}
            </span>
          </div>),
        },
        {
            id: "scanStartTime",
            header: () => "Scan Start Time",
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="cursor-pointer">
            <div className="text-sm text-gray-700">{info.row.original.scanStartTime}</div>
            <div className="text-xs text-gray-400">{info.row.original.scanStartDate}</div>
          </div>),
        },
        {
            id: "scanEndTime",
            header: () => "Scan End Time",
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="cursor-pointer">
            <div className="text-sm text-gray-700">{info.row.original.scanEndTime}</div>
            <div className="text-xs text-gray-400">
              {info.row.original.scanEndDate !== "-" ? info.row.original.scanEndDate : ""}
            </div>
          </div>),
        },
        {
            id: "issues",
            header: () => "Issues",
            cell: (info) => (<div onClick={() => onNavigate?.(`/reports/stock-take/${info.row.original.id}`)} className="text-sm text-gray-700 cursor-pointer">
            {info.row.original.issues}
          </div>),
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: (info) => (<button onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.(`/reports/stock-take/${info.row.original.id}`);
                }} className="text-gray-400 hover:text-brand-primary transition-colors" title="View detail">
            <Eye size={16}/>
          </button>),
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onNavigate]);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Stock Take Variance Report</h1>
          <Button className="flex items-center w-fit gap-2 px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover font-semibold">
            <Download size={15}/>
            Export
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Filters */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <InputCustom type="text" placeholder="Search" value={search} onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
        }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 whitespace-nowrap">
              <Calendar size={14} className="text-gray-400"/>
              Select Date
            </button>
          </div>

          <TableCustom columns={columns} data={indexedPaginated} autoScrollTable={true} classThead="bg-red-50"/>

          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>
    </div>);
}
