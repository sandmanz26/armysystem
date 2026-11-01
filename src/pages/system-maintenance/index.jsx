import { useState } from "react";
import { Database } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
const TOTAL_GB = 76.45;
const hddUsed = 27.29;
const hddPct = (hddUsed / TOTAL_GB) * 100;
const databases = [
    { name: "Aims", usedMB: 0.34, pct: "0.00043%" },
    { name: "User Detail (Encrypted)", usedMB: 0.16, pct: "0.00020%" },
    { name: "User", usedMB: 0.11, pct: "0.00014%" },
    { name: "Booking", usedMB: 0.24, pct: "0.00031%" },
    { name: "Operation", usedMB: 1.47, pct: "0.00188%" },
    { name: "Trainee", usedMB: 0.14, pct: "0.00018%" },
    { name: "System", usedMB: 0.32, pct: "0.00041%" },
];
const CRON_JOBS = [
    {
        id: 1,
        name: "Booking Data (Bookings, Sessions, Lane Configurations)",
        date: "29 Apr 2026",
    },
    { id: 2, name: "Trainee Personal Data (Trainees)", date: "29 Apr 2026" },
    {
        id: 3,
        name: "Training Performance Data (Trainee Performances)",
        date: "29 Apr 2026",
    },
    {
        id: 4,
        name: "Asset Assignments Data (Assignments, Asset_assignments)",
        date: "29 Apr 2026",
    },
    { id: 5, name: "Detailing List Data (Lane Assignment)", date: "29 Apr 2026" },
    { id: 6, name: "User Session Data (Login Sessions)", date: "29 Apr 2026" },
    { id: 7, name: "RFID Event Log (Antenna Events)", date: "29 Apr 2026" },
    { id: 8, name: "System Health Snapshots (BIT Records)", date: "29 Apr 2026" },
    {
        id: 9,
        name: "Operational Availability Metrics (Monthly Reports)",
        date: "29 Apr 2026",
    },
    { id: 10, name: "Audit Trail Data (Activity Logs)", date: "29 Apr 2026" },
];
const PER_PAGE = 10;
const cronColHelper = createColumnHelper();
const cronColumns = [
    cronColHelper.accessor("name", {
        header: () => "Data Name",
        cell: (info) => (<div className="text-sm text-gray-700">{info.getValue()}</div>),
    }),
    cronColHelper.accessor("date", {
        header: () => "Date",
        cell: (info) => (<div className="text-sm text-gray-600">{info.getValue()}</div>),
        width: 160,
        minWidth: 160,
    }),
    {
        accessorKey: "action",
        header: () => "Actions",
        cell: () => (<div onClick={() => { }}>
        <Button className="px-3 py-1.5 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors">
          Run Cronjob
        </Button>
      </div>),
        width: 100,
        minWidth: 144,
    },
];
function StorageBar({ used, total, pct, }) {
    return (<div className="w-full">
      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}/>
      </div>
      <p className="text-xs text-gray-500 mt-1.5">
        {used} GB of {total} GB
      </p>
    </div>);
}
function DBStorageBar({ used, total, label, }) {
    const pct = (used / (total * 1024)) * 100;
    return (<div className="w-full">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-300 rounded-full" style={{ width: `${Math.max(pct * 200, 2)}%` }}/>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {used} MB of {total} GB ({label})
      </p>
    </div>);
}
export function SystemMaintenance() {
    const [activeTab, setActiveTab] = useState("TOMS");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(CRON_JOBS.length / PER_PAGE));
    const paginated = CRON_JOBS.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">
          System Maintenance
        </h1>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs — raw buttons per TRX rule (tab buttons stay raw) */}
          <div className="flex border-b border-gray-200">
            {["TOMS", "Data Archiving And Logs", "Cron Jobs"].map((tab) => (<button key={tab} onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
            }} className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab
                ? "text-brand-primary border-brand-primary"
                : "text-gray-500 border-transparent hover:text-gray-700")}>
                  {tab}
                </button>))}
          </div>

          {/* ── TOMS tab ─────────────────────────────────────────────────────── */}
          {activeTab === "TOMS" && (<div className="p-6 space-y-8">
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  HDD
                </h2>
                <div className="flex items-start gap-4">
                  <Database size={36} className="text-gray-400 flex-shrink-0 mt-1"/>
                  <div className="flex-1">
                    <StorageBar used={hddUsed} total={TOTAL_GB} pct={hddPct}/>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100"/>

              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Database
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                  {databases.map((db) => (<div key={db.name}>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {db.name}
                      </p>
                      <div className="flex items-start gap-4">
                        <Database size={28} className="text-gray-400 flex-shrink-0 mt-1"/>
                        <div className="flex-1">
                          <DBStorageBar used={db.usedMB} total={TOTAL_GB} label={db.pct}/>
                        </div>
                      </div>
                    </div>))}
                </div>
              </div>
            </div>)}

          {/* ── Data Archiving And Logs tab ───────────────────────────────────── */}
          {activeTab === "Data Archiving And Logs" && (<div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Database size={36} className="mb-3 text-gray-300"/>
              <p className="text-sm font-semibold text-gray-500">
                No data to show right now!
              </p>
              <p className="text-xs text-center mt-1 max-w-xs">
                Archiving logs will appear here once archiving jobs have been
                configured.
              </p>
            </div>)}

          {/* ── Cron Jobs tab ─────────────────────────────────────────────────── */}
          {activeTab === "Cron Jobs" && (<>
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">
                  Cron Jobs{" "}
                  <span className="text-gray-400 font-normal">
                    ({CRON_JOBS.length})
                  </span>
                </h2>
              </div>

              <TableCustom actionSticky={false} columns={cronColumns} data={paginated} autoScrollTable={true}/>

              <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={CRON_JOBS.length} setCurrentPage={setCurrentPage}/>
            </>)}
        </div>
      </div>
    </div>);
}
