import { useMemo, useState } from "react";
import { ChevronRight, Home, Search } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { MessagePayloadModal } from "../modals/MessagePayloadModal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

interface IcdLogEntry {
  no: number;
  date: string;
  name: string;
  topic: string;
  publisher: string;
  subscriber: string;
  payload: string;
}

const ICD_GROUPS = ["All ICD Groups", "Heartbeat", "Booking Sync", "Trainee Sync", "System Alert"];

// Two alternating heartbeat templates, repeated to fill each page — mirrors the
// real ICD log's dominant traffic pattern (TRX<->TOMS heartbeat pings).
function buildIcdLogEntries(date: string, count: number): IcdLogEntry[] {
  const stations = ["TRX1-WEBSVR-01", "TRX2-WEBSVR-01", "TRX3-WEBSVR-01"];
  const baseTimestamp = 1785806983;
  return Array.from({ length: count }, (_, i) => {
    const isInveris = i % 9 !== 8;
    const name = isInveris ? "PublishHeartbeatInveris" : "PublishHeartbeatTOMS";
    const topic = isInveris ? "inveris/toms/heartbeat" : "toms/inveris/heartbeat";
    const publisher = isInveris ? "TRX" : "TOMS";
    const subscriber = isInveris ? "TOMS" : "TRX";
    const timestamp = baseTimestamp - i * 5;
    const station = stations[i % stations.length];
    return {
      no: i + 1,
      date: `${date}, 8:29 AM`,
      name,
      topic,
      publisher,
      subscriber,
      payload: JSON.stringify(
        { command: "query", timestamp: String(timestamp), basestationID: station, status: "1" },
        null,
        2,
      ),
    };
  });
}

const columnHelper = createColumnHelper<IcdLogEntry>();
const PER_PAGE = 10;

export function IcdLogDetail({
  date, totalLogs, onBack,
}: { date: string; totalLogs: number; onBack: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [group, setGroup] = useState(ICD_GROUPS[0]);
  const [search, setSearch] = useState("");
  const [payloadModal, setPayloadModal] = useState<string | null>(null);
  const [logCount, setLogCount] = useState(totalLogs);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const entries = useMemo(
    () => buildIcdLogEntries(date, Math.min(logCount, PER_PAGE * 20)),
    [date, logCount],
  );

  const filtered = useMemo(
    () => entries.filter((e) => !search || e.payload.toLowerCase().includes(search.toLowerCase()) || e.topic.toLowerCase().includes(search.toLowerCase()) || e.name.toLowerCase().includes(search.toLowerCase())),
    [entries, search],
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleClearLogs = () => {
    setLogCount(0);
    setCurrentPage(1);
    setShowClearConfirm(false);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => <input type="checkbox" className="rounded border-gray-300" />,
        cell: () => <input type="checkbox" className="rounded border-gray-300" />,
        width: 44,
        minWidth: 44,
        maxWidth: 44,
      } as any),
      columnHelper.accessor("no", {
        header: () => "No",
        cell: (info: any) => <span className="text-sm text-gray-700">{info.getValue()}</span>,
        width: 60,
        minWidth: 60,
      } as any),
      columnHelper.accessor("date", {
        header: () => "Date",
        cell: (info: any) => <span className="text-sm text-gray-700 whitespace-nowrap">{info.getValue()}</span>,
        width: 160,
        minWidth: 160,
      } as any),
      columnHelper.accessor("name", {
        header: () => "Name",
        cell: (info: any) => <span className="text-sm text-gray-700">{info.getValue()}</span>,
      }),
      columnHelper.accessor("topic", {
        header: () => "Topic",
        cell: (info: any) => <span className="text-sm text-gray-700 font-mono">{info.getValue()}</span>,
      }),
      columnHelper.accessor("publisher", {
        header: () => "Publisher",
        cell: (info: any) => <span className="text-sm text-gray-700">{info.getValue()}</span>,
        width: 110,
        minWidth: 110,
      } as any),
      columnHelper.accessor("subscriber", {
        header: () => "Subscriber",
        cell: (info: any) => <span className="text-sm text-gray-700">{info.getValue()}</span>,
        width: 110,
        minWidth: 110,
      } as any),
      columnHelper.display({
        id: "payload",
        header: () => "Payload",
        cell: ({ row }: any) => (
          <Button
            onClick={() => setPayloadModal(row.original.payload)}
            className="px-3 py-1.5 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover transition-colors w-auto"
          >
            View Payload
          </Button>
        ),
        width: 140,
        minWidth: 140,
      } as any),
    ],
    [],
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="flex items-center gap-1.5 px-6 py-3 text-sm text-gray-500 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="hover:text-brand-primary transition-colors"><Home size={14} /></button>
        <ChevronRight size={13} className="text-gray-300" />
        <button onClick={onBack} className="hover:text-brand-primary transition-colors">System Maintenance</button>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-800 font-medium">ICD Logs: {date}</span>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              ICD Logs ({date}) <span className="text-gray-400 font-normal">({logCount.toLocaleString()})</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={group}
                onChange={(e) => { setGroup(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 text-sm text-gray-700 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                {ICD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputCustom
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search in payload, topic, name"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <Button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors w-auto"
              >
                Clear Logs
              </Button>
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <p className="text-sm font-semibold text-gray-600 mb-1">No logs to show</p>
              <p className="text-xs">Logs for this date have been cleared, or none match your search.</p>
            </div>
          ) : (
            <>
              <TableCustom
                actionSticky={false}
                columns={columns}
                data={paginated}
                autoScrollTable={true}
                classThead="bg-red-50/70"
                classTheadTh="text-brand-primary text-xs font-semibold"
              />
              <Pagination
                currentPage={currentPage}
                itemsPerPage={PER_PAGE}
                totalItems={filtered.length}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {payloadModal && (
        <MessagePayloadModal open={!!payloadModal} payload={payloadModal} onClose={() => setPayloadModal(null)} />
      )}

      {showClearConfirm && (
        <DeleteConfirmDialog
          title="Confirm Clear Logs"
          confirmLabel="Clear Logs"
          message={`Clear all ${logCount.toLocaleString()} ICD log${logCount === 1 ? "" : "s"} for ${date}? This cannot be undone.`}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearLogs}
        />
      )}
    </div>
  );
}
