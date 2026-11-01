import { useState, useMemo } from "react";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
/* ─── Mock data — empty by default ──────────────────────────────────── */
const MOCK_AUDITS = [];
const PER_PAGE = 10;
const SCAN_SUMMARY = {
    date: "2026-04-24",
    issued: 1,
    returned: 0,
    missing: 1,
    totalScans: 1,
    stations: [
        { name: "TRX-01", totalAssignments: 1, issued: 1, returned: 0, missing: 1, status: "Missing" },
        { name: "TRX-02", totalAssignments: 1, issued: 1, returned: 0, missing: 1, status: "Missing" },
    ],
};
function ScanAssetsPage({ onBack }) {
    const [scanned, setScanned] = useState(SCAN_SUMMARY.totalScans);
    const handleScanAssets = () => {
        setScanned((s) => s + 1);
    };
    const stationColumns = useMemo(() => [
        {
            id: "name",
            header: () => "Base Station Name",
            cell: (info) => (<div className="text-sm font-medium text-gray-800">{info.row.original.name}</div>),
        },
        {
            id: "totalAssignments",
            header: () => "Total Assignments",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.totalAssignments}</div>),
        },
        {
            id: "issued",
            header: () => "Issued Asset(s)",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.issued} asset(s)</div>),
        },
        {
            id: "returned",
            header: () => "Returned Asset(s)",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.returned} asset(s)</div>),
        },
        {
            id: "missing",
            header: () => "Missing Asset(s)",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.missing} asset(s)</div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => (<span className={cn("px-3 py-1 rounded-full text-xs font-semibold", info.row.original.status === "Missing"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600")}>
            {info.row.original.status}
          </span>),
        },
    ], []);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">Scan Assets for Report</h1>
            <p className="text-sm text-gray-500 mt-0.5">Total Scans ({scanned} Assets)</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleScanAssets} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Scan Assets
            </button>
            <Button onClick={onBack} className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              View Report
            </Button>
          </div>
        </div>

        {/* Summary card */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-gray-800 text-center mb-5">
            Stock Take Variance Report ({SCAN_SUMMARY.date})
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-red-50 rounded-lg px-10 py-5 min-w-[480px]">
              <div>
                <p className="text-xs text-gray-500 mb-1">Issued Asset(s)</p>
                <p className="text-lg font-bold text-gray-800">{SCAN_SUMMARY.issued}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Returned Asset(s)</p>
                <p className="text-lg font-bold text-gray-800">{SCAN_SUMMARY.returned}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Missing Asset(s)</p>
                <p className="text-lg font-bold text-red-600">{SCAN_SUMMARY.missing}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Base station table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <TableCustom columns={stationColumns} data={SCAN_SUMMARY.stations} autoScrollTable={true} classThead="bg-red-50"/>
        </div>
      </div>
    </div>);
}
/* ─── Assets Audit Report (main list page) ───────────────────────────── */
export function AssetsAuditReport() {
    const [subPage, setSubPage] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(MOCK_AUDITS.length / PER_PAGE));
    const paginated = MOCK_AUDITS.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const auditColumns = useMemo(() => [
        {
            id: "no",
            header: () => "No",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original._idx}</div>,
        },
        {
            id: "scanDateTime",
            header: () => (<span className="flex items-center gap-1">
            Scan Date &amp; Time
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </span>),
            cell: (info) => (<div>
            <div className="text-sm text-gray-700">{info.row.original.scanDate}</div>
            <div className="text-xs text-gray-400">{info.row.original.scanTime}</div>
          </div>),
        },
        {
            id: "createdBy",
            header: () => "Created By",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.createdBy}</div>,
        },
        {
            id: "totalAssets",
            header: () => "Total Assets",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.totalAssets}</div>,
        },
        {
            id: "assetsFound",
            header: () => "Assets Found",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetsFound}</div>,
        },
        {
            id: "assetsNotFound",
            header: () => "Assets Not Found",
            cell: (info) => <div className="text-sm text-gray-700">{info.row.original.assetsNotFound}</div>,
        },
        {
            id: "action",
            header: () => "Action",
            cell: () => (<button className="text-gray-400 hover:text-brand-primary transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>),
        },
    ], []);
    const indexedPaginated = paginated.map((row, idx) => ({
        ...row,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    }));
    if (subPage === "scan") {
        return <ScanAssetsPage onBack={() => setSubPage("list")}/>;
    }
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Assets Audit Report</h1>
          <Button onClick={() => setSubPage("scan")} className="flex items-center w-fit gap-2 px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover font-semibold">
            Generate Report
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <TableCustom columns={auditColumns} data={indexedPaginated} autoScrollTable={true} classThead="bg-red-50"/>
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={MOCK_AUDITS.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>
    </div>);
}
