import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon, nextSort, sortBy } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
const DAY_MOVEMENTS = [
    { no: 1, assignmentId: "260505-AT003", assetName: "SAR21 (4)", assetTagId: "250101-SAR21004", assetType: "SAR21", assetCategory: "Weapon", timePeriod: "12:50:17 AM", date: "06 May 2026", status: "Issued", fromLocation: "Armskote", toLocation: "TRX-01" },
    { no: 2, assignmentId: "260505-AT003", assetName: "SAR21 (5)", assetTagId: "250101-SAR21005", assetType: "SAR21", assetCategory: "Weapon", timePeriod: "12:50:17 AM", date: "06 May 2026", status: "Issued", fromLocation: "Armskote", toLocation: "TRX-01" },
    { no: 3, assignmentId: "260505-AT004", assetName: "LMG (3)", assetTagId: "250101-LMG003", assetType: "LMG", assetCategory: "Weapon", timePeriod: "01:10:42 AM", date: "06 May 2026", status: "Issued", fromLocation: "Armskote", toLocation: "TRX-02" },
    { no: 4, assignmentId: "260505-AT004", assetName: "LMG (4)", assetTagId: "250101-LMG004", assetType: "LMG", assetCategory: "Weapon", timePeriod: "01:10:42 AM", date: "06 May 2026", status: "Issued", fromLocation: "Armskote", toLocation: "TRX-02" },
    { no: 5, assignmentId: "260505-AT005", assetName: "Lenovo Legion 5 (1)", assetTagId: "250101-LEL001", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", timePeriod: "02:30:05 AM", date: "06 May 2026", status: "Issued", fromLocation: "Store", toLocation: "TRX-03" },
    { no: 6, assignmentId: "260505-AT005", assetName: "Lenovo Legion 5 (2)", assetTagId: "250101-LEL002", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", timePeriod: "02:30:05 AM", date: "06 May 2026", status: "Issued", fromLocation: "Store", toLocation: "TRX-03" },
    { no: 7, assignmentId: "260505-AT006", assetName: "SAR21 (4)", assetTagId: "250101-SAR21004", assetType: "SAR21", assetCategory: "Weapon", timePeriod: "04:15:00 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-01", toLocation: "Armskote" },
    { no: 8, assignmentId: "260505-AT006", assetName: "SAR21 (5)", assetTagId: "250101-SAR21005", assetType: "SAR21", assetCategory: "Weapon", timePeriod: "04:15:00 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-01", toLocation: "Armskote" },
    { no: 9, assignmentId: "260505-AT007", assetName: "LMG (3)", assetTagId: "250101-LMG003", assetType: "LMG", assetCategory: "Weapon", timePeriod: "04:20:10 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-02", toLocation: "Armskote" },
    { no: 10, assignmentId: "260505-AT007", assetName: "LMG (4)", assetTagId: "250101-LMG004", assetType: "LMG", assetCategory: "Weapon", timePeriod: "04:20:10 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-02", toLocation: "Armskote" },
    { no: 11, assignmentId: "260505-AT008", assetName: "Lenovo Legion 5 (1)", assetTagId: "250101-LEL001", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", timePeriod: "04:45:00 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-03", toLocation: "Store" },
    { no: 12, assignmentId: "260505-AT008", assetName: "Lenovo Legion 5 (2)", assetTagId: "250101-LEL002", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", timePeriod: "04:45:00 PM", date: "06 May 2026", status: "Returned", fromLocation: "TRX-03", toLocation: "Store" },
];
const MONTH_MOVEMENTS = [
    { no: 1, assetName: "SAR21 (4)", assetTagId: "250101-SAR21004", assetType: "SAR21", assetCategory: "Weapon", movementCount: 1 },
    { no: 2, assetName: "LMG (3)", assetTagId: "250101-LMG003", assetType: "LMG", assetCategory: "Weapon", movementCount: 1 },
    { no: 3, assetName: "LMG (4)", assetTagId: "250101-LMG004", assetType: "LMG", assetCategory: "Weapon", movementCount: 2 },
    { no: 4, assetName: "Lenovo Legion 5 (1)", assetTagId: "250101-LEL001", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", movementCount: 3 },
    { no: 5, assetName: "Lenovo Legion 5 (2)", assetTagId: "250101-LEL002", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", movementCount: 3 },
    { no: 6, assetName: "SAR21 (5)", assetTagId: "250101-SAR21005", assetType: "SAR21", assetCategory: "Weapon", movementCount: 1 },
];
const PER_PAGE = 10;
function formatDate(d) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function StatusBadge({ status }) {
    const isIssued = status === "Issued";
    return (<span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", isIssued
            ? "bg-purple-50 text-purple-700 border border-purple-200"
            : "bg-blue-50 text-blue-700 border border-blue-200")}>
      {status}
    </span>);
}
export function AssetMovementReport() {
    const [viewMode, setViewMode] = useState("Day");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeDate, setActiveDate] = useState(new Date(2026, 4, 6)); // 06 May 2026
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const shiftDate = (delta) => {
        setActiveDate((prev) => {
            const d = new Date(prev);
            if (viewMode === "Day")
                d.setDate(d.getDate() + delta);
            else
                d.setMonth(d.getMonth() + delta);
            return d;
        });
        setCurrentPage(1);
    };
    const displayLabel = viewMode === "Day"
        ? formatDate(activeDate)
        : activeDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const rawData = viewMode === "Day" ? DAY_MOVEMENTS : MONTH_MOVEMENTS;
    const totalPages = Math.max(1, Math.ceil(rawData.length / PER_PAGE));
    const sorted = sortField ? sortBy(rawData, sortField, sortDir) : rawData;
    const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const dayColumns = useMemo(() => [
        {
            id: "no",
            header: () => "No",
            cell: (info) => <div className="text-sm text-gray-500">{info.row.original.no}</div>,
        },
        {
            id: "assignmentId",
            header: () => "Assignment ID",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assignmentId}</div>,
        },
        {
            id: "assetName",
            header: () => "Asset Name",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetName}</div>,
        },
        {
            id: "assetTagId",
            header: () => "Asset Tag ID",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetTagId}</div>,
        },
        {
            id: "assetType",
            header: () => "Asset Type",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetType}</div>,
        },
        {
            id: "assetCategory",
            header: () => "Asset Category",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetCategory}</div>,
        },
        {
            id: "timePeriod",
            header: () => (<button onClick={() => handleSort("timePeriod")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Time Period <SortIcon active={sortField === "timePeriod"} dir={sortDir}/>
          </button>),
            cell: (info) => (<div>
            <div className="text-sm text-gray-700">{info.row.original.timePeriod}</div>
            <div className="text-xs text-gray-400">{info.row.original.date}</div>
          </div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => <StatusBadge status={info.row.original.status}/>,
        },
        {
            id: "fromLocation",
            header: () => "From Location",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.fromLocation}</div>,
        },
        {
            id: "toLocation",
            header: () => "To Location",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.toLocation}</div>,
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortDir]);
    const monthColumns = useMemo(() => [
        {
            id: "no",
            header: () => "No",
            cell: (info) => <div className="text-sm text-gray-500">{info.row.original.no}</div>,
        },
        {
            id: "assetName",
            header: () => "Asset Name",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetName}</div>,
        },
        {
            id: "assetTagId",
            header: () => "Asset Tag ID",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetTagId}</div>,
        },
        {
            id: "assetType",
            header: () => "Asset Type",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetType}</div>,
        },
        {
            id: "assetCategory",
            header: () => "Asset Category",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetCategory}</div>,
        },
        {
            id: "movementCount",
            header: () => (<button onClick={() => handleSort("movementCount")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Asset Movement Counts <SortIcon active={sortField === "movementCount"} dir={sortDir}/>
          </button>),
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.movementCount} times</div>),
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortDir]);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Asset Movement Report</h1>
          <Button className="flex items-center w-fit gap-2 px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover font-semibold">
            <Download size={15}/>
            Export
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Month/Day tabs + date navigator */}
          <div className="flex items-center px-5 py-3 border-b border-gray-100">
            <div className="flex items-end gap-1 w-40">
              {["Month", "Day"].map((mode) => (<button key={mode} onClick={() => {
                setViewMode(mode);
                setCurrentPage(1);
                setSortField("");
            }} className={cn("px-3 py-1.5 text-sm font-medium transition-colors relative", viewMode === mode ? "text-brand-primary" : "text-gray-400 hover:text-gray-600")}>
                  {mode}
                  {viewMode === mode && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"/>)}
                </button>))}
            </div>

            <div className="flex-1 flex items-center justify-center gap-4">
              <button onClick={() => shiftDate(-1)} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronLeft size={16}/>
              </button>
              <span className="text-sm font-semibold text-gray-800 min-w-[130px] text-center">
                {displayLabel}
              </span>
              <button onClick={() => shiftDate(1)} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronRight size={16}/>
              </button>
            </div>

            <div className="w-40"/>
          </div>

          {/* Table */}
          {viewMode === "Day" ? (<TableCustom columns={dayColumns} data={paginated} autoScrollTable={true} classThead="bg-red-50"/>) : (<TableCustom columns={monthColumns} data={paginated} autoScrollTable={true} classThead="bg-red-50"/>)}

          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={rawData.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>
    </div>);
}
