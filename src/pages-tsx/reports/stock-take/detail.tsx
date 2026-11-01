import { ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

interface BaseStationRow {
  name: string;
  totalAssignments: number;
  issued: number;
  returned: number;
  missing: number;
  status: "All Returned" | "Missing";
}

const REPORT_DATE = "2026-05-29";
const SUMMARY = {
  issued: 4,
  returned: 4,
  missing: 0,
};

const BASE_STATIONS: BaseStationRow[] = [
  { name: "WPT-01", totalAssignments: 1, issued: 4, returned: 4, missing: 0, status: "All Returned" },
  { name: "WPT-02", totalAssignments: 1, issued: 4, returned: 4, missing: 0, status: "All Returned" },
  { name: "WPT-03", totalAssignments: 1, issued: 4, returned: 4, missing: 0, status: "All Returned" },
  { name: "WPT-04", totalAssignments: 1, issued: 4, returned: 4, missing: 0, status: "All Returned" },
];

function StatusBadge({ status }: { status: BaseStationRow["status"] }) {
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold",
        status === "Missing" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700",
      )}
    >
      {status}
    </span>
  );
}

interface StockTakeScanPageProps {
  reportId: string;
  onNavigate?: (path: string) => void;
}

export function StockTakeScanPage({ reportId, onNavigate }: StockTakeScanPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Scan Assets for Report</h1>
              <p className="text-3 text-gray-600 mt-0.5">Total Scans (4 Assets)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Scan Assets
              </button>
              <Button
                type="button"
                onClick={() => onNavigate?.(`/reports/stock-take/${reportId}/report`)}
                className="w-auto whitespace-nowrap flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                View Report
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 px-6 py-5 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
              Stock Take Variance Report ({REPORT_DATE})
            </h2>

            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-6 bg-red-50 rounded-lg px-6 py-4 min-w-[480px] shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Issued Asset(s)</p>
                  <p className="text-2xl font-bold text-gray-900">{SUMMARY.issued}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Returned Asset(s)</p>
                  <p className="text-2xl font-bold text-gray-900">{SUMMARY.returned}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Missing Asset(s)</p>
                  <p className="text-2xl font-bold text-gray-900">{SUMMARY.missing}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-red-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Base Station Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Total Assignments</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Issued Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Returned Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Missing Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {BASE_STATIONS.map((row) => (
                  <tr key={row.name} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.totalAssignments}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.issued} asset(s)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.returned} asset(s)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.missing} asset(s)</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StockTakeReportDetailPageProps {
  reportId: string;
}

export function StockTakeReportDetailPage({ reportId }: StockTakeReportDetailPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Stock Variance Report Details ({REPORT_DATE})
          </h1>

          <div className="grid grid-cols-3 gap-0 border-b border-gray-200 pb-4">
            <div className="pr-4">
              <p className="text-xs text-gray-500 mb-1">Created On</p>
              <p className="text-sm text-gray-900 font-medium mb-3">{REPORT_DATE}</p>
              <p className="text-xs text-gray-500 mb-1">Scan Start Time</p>
              <p className="text-sm text-gray-900 font-medium mb-3">09:59:25 AM</p>
              <p className="text-xs text-gray-500 mb-1">Scan End Time</p>
              <p className="text-sm text-gray-900 font-medium">10:13:44 AM</p>
            </div>

            <div className="px-4 border-x border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Issued Asset(s)</p>
              <p className="text-sm text-gray-900 font-semibold mb-3">{SUMMARY.issued}</p>
              <p className="text-xs text-gray-500 mb-1">Return Asset(s)</p>
              <p className="text-sm text-gray-900 font-semibold mb-3">{SUMMARY.returned}</p>
              <p className="text-xs text-gray-500 mb-1">Missing Asset(s)</p>
              <p className="text-sm text-gray-900 font-semibold">{SUMMARY.missing}</p>
            </div>

            <div className="pl-4">
              <p className="text-xs text-gray-500 mb-1">Scanned By</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                  L
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Liam Johansson</p>
                  <p className="text-xs text-gray-500">Operator</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Base Stations ({BASE_STATIONS.length} Base Stations)
            </h2>

            <table className="w-full">
              <thead>
                <tr className="bg-red-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Base Station Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Total Assignments</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Issued Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Returned Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Missing Asset(s)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {BASE_STATIONS.map((row) => (
                  <tr key={`${reportId}-${row.name}`} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.totalAssignments}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.issued} asset(s)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.returned} asset(s)</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.missing} asset(s)</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="text-gray-500 hover:text-brand-primary transition-colors">
                        <ChevronDown size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
