import { useState } from "react";
import { Upload } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { SortIcon, nextSort } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
const PER_PAGE = 10;
const columnHelper = createColumnHelper();
export function DataImport() {
    const [activeTab, setActiveTab] = useState("Booking Details");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
    };
    const columns = [
        columnHelper.accessor("fileName", {
            header: () => "File Name",
            cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
            minWidth: "300px",
        }),
        columnHelper.accessor("uploadBy", {
            header: () => "Upload By",
            cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
            minWidth: "200px",
        }),
        columnHelper.accessor("uploadDate", {
            header: () => (<button onClick={() => handleSort("uploadDate")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
          Upload Date <SortIcon active={sortField === "uploadDate"} dir={sortDir}/>
        </button>),
            cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
            minWidth: "180px",
        }),
    ];
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">Data Import</h1>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs — raw buttons per TRX rule (tab buttons stay raw) */}
          <div className="flex border-b border-gray-200">
            {["Booking Details", "Leaderboard"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab
                ? "text-brand-primary border-brand-primary"
                : "text-gray-500 border-transparent hover:text-gray-700")}>
                {tab}
              </button>))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">{activeTab}</h2>
            <div className="flex items-center gap-3">
              <InputCustom type="text" placeholder="Search file name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-3 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
                <Upload size={15}/>
              </button>
            </div>
          </div>

          {/* Table */}
          <TableCustom columns={columns} data={[]} autoScrollTable={true}/>

          <Pagination currentPage={1} itemsPerPage={PER_PAGE} totalItems={0} setCurrentPage={() => { }}/>
        </div>
      </div>
    </div>);
}
