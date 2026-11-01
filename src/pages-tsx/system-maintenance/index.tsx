import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Eye } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { useActiveProgramStore } from "@/store/useActiveProgramStore";
import { IcdLogDetail } from "./components/IcdLogDetail";

type ArchivingSubTab = "SHM Movement Information" | "ICD Logs";

// Maps the sidebar's "System Maintenance" sub-links to the sub-tab they deep-link into.
const SECTION_MAP: Record<string, ArchivingSubTab> = {
  "data-archiving":            "SHM Movement Information",
  "shm-movement-information":  "SHM Movement Information",
  "icd-logs":                  "ICD Logs",
  // The outer MENU rail's "System Maintenance" utility deep-links its own
  // "Logs" sub-item here — same destination as "icd-logs".
  "logs":                      "ICD Logs",
};

interface ShmMovementRow {
  date: string;
  entries: number;
}

const SHM_MOVEMENT_ROWS: ShmMovementRow[] = [{ date: "03 Aug 2026", entries: 12 }];

interface IcdLogRow {
  date: string;
  logs: number;
}

const ICD_LOG_ROWS: IcdLogRow[] = [
  { date: "04 Aug 2026", logs: 41825 },
  { date: "03 Aug 2026", logs: 60101 },
];

const shmColHelper = createColumnHelper<ShmMovementRow>();
const icdColHelper = createColumnHelper<IcdLogRow>();

const PER_PAGE = 10;

// A small "Select Date" popover shared by both tables — filters rows to the chosen date.
function DateFilterButton({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        type="outline"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium w-auto border",
          value ? "text-brand-primary border-brand-primary" : "text-gray-700 border-gray-200",
        )}
      >
        <Calendar size={14} /> {value ? `Date: ${value}` : "Select Date"}
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 z-[1200] bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col gap-2">
          <InputCustom
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="text-xs text-gray-500 hover:text-brand-primary transition-colors self-start"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}

export function SystemMaintenance() {
  const { section } = useParams<{ section?: string }>();
  const activeProgram = useActiveProgramStore((s) => s.activeProgram);
  // MST doesn't track SHM asset movements the way WPT/TCT do, so its Data
  // Archiving And Logs tab only ever shows ICD Logs.
  const showShmMovement = activeProgram !== "MST";

  const [archivingSubTab, setArchivingSubTab] = useState<ArchivingSubTab>(
    showShmMovement ? "SHM Movement Information" : "ICD Logs",
  );
  const [archivingPage, setArchivingPage] = useState(1);
  const [shmDateFilter, setShmDateFilter] = useState("");
  const [icdDateFilter, setIcdDateFilter] = useState("");
  const [icdDetail, setIcdDetail] = useState<IcdLogRow | null>(null);

  // Deep-link from the sidebar's "Data Archiving" / "SHM Movement Info" / "ICD Logs"
  // sub-links straight into the matching sub-tab.
  useEffect(() => {
    const target = section ? SECTION_MAP[section] : undefined;
    if (!target) return;
    if (target !== "SHM Movement Information" || showShmMovement) setArchivingSubTab(target);
    setArchivingPage(1);
  }, [section, showShmMovement]);

  const tableTheadProps = { classThead: "bg-red-50/70", classTheadTh: "text-brand-primary text-xs font-semibold" };

  // "Select Date" filters compare against the row's display date — parse both
  // to the same YYYY-MM-DD shape so the native <input type="date"> value matches.
  const toIsoDate = (display: string) => {
    const parsed = new Date(display);
    if (Number.isNaN(parsed.getTime())) return "";
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const filteredShmRows = useMemo(
    () => (shmDateFilter ? SHM_MOVEMENT_ROWS.filter((r) => toIsoDate(r.date) === shmDateFilter) : SHM_MOVEMENT_ROWS),
    [shmDateFilter],
  );
  const filteredIcdRows = useMemo(
    () => (icdDateFilter ? ICD_LOG_ROWS.filter((r) => toIsoDate(r.date) === icdDateFilter) : ICD_LOG_ROWS),
    [icdDateFilter],
  );

  const shmColumns = useMemo(
    () => [
      shmColHelper.accessor("date", {
        header: () => "Date",
        cell: (info: any) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
      }),
      shmColHelper.accessor("entries", {
        header: () => "No of Entries",
        cell: (info: any) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
      }),
      {
        id: "actions",
        header: () => "Actions",
        cell: () => (
          <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Eye size={16} />
          </button>
        ),
        width: 100,
        minWidth: 100,
      },
    ],
    [],
  );

  const icdColumns = useMemo(
    () => [
      icdColHelper.accessor("date", {
        header: () => "Date",
        cell: (info: any) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
      }),
      icdColHelper.accessor("logs", {
        header: () => "No of Logs",
        cell: (info: any) => <div className="text-sm text-gray-700">{info.getValue().toLocaleString()} logs</div>,
      }),
      {
        id: "actions",
        header: () => "Actions",
        cell: ({ row }: any) => (
          <button
            type="button"
            onClick={() => setIcdDetail(row.original)}
            className="text-gray-400 hover:text-brand-primary transition-colors"
          >
            <Eye size={16} />
          </button>
        ),
        width: 100,
        minWidth: 100,
      },
    ],
    [],
  );

  if (icdDetail) {
    const isoDate = toIsoDate(icdDetail.date) || icdDetail.date;
    return (
      <IcdLogDetail
        date={isoDate}
        totalLogs={icdDetail.logs}
        onBack={() => setIcdDetail(null)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">
          System Maintenance
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {showShmMovement && (
              <button
                type="button"
                onClick={() => { setArchivingSubTab("SHM Movement Information"); setArchivingPage(1); }}
                className={cn(
                  "px-4 py-2 text-sm font-semibold transition-colors",
                  archivingSubTab === "SHM Movement Information"
                    ? "bg-brand-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50",
                )}
              >
                SHM Movement Information
              </button>
            )}
            <button
              type="button"
              onClick={() => { setArchivingSubTab("ICD Logs"); setArchivingPage(1); }}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors",
                archivingSubTab === "ICD Logs"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              ICD Logs
            </button>
          </div>

          {archivingSubTab === "SHM Movement Information" && showShmMovement && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  SHM Movement Information{" "}
                  <span className="text-gray-400 font-normal">({filteredShmRows.length})</span>
                </h2>
                <DateFilterButton value={shmDateFilter} onChange={setShmDateFilter} />
              </div>
              <TableCustom
                actionSticky={false}
                columns={shmColumns}
                data={filteredShmRows.slice((archivingPage - 1) * PER_PAGE, archivingPage * PER_PAGE)}
                autoScrollTable={true}
                {...tableTheadProps}
              />
              <Pagination
                currentPage={archivingPage}
                itemsPerPage={PER_PAGE}
                totalItems={filteredShmRows.length}
                setCurrentPage={setArchivingPage}
              />
            </>
          )}

          {archivingSubTab === "ICD Logs" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  ICD Log <span className="text-gray-400 font-normal">({filteredIcdRows.length})</span>
                </h2>
                <DateFilterButton value={icdDateFilter} onChange={setIcdDateFilter} />
              </div>
              <TableCustom
                actionSticky={false}
                columns={icdColumns}
                data={filteredIcdRows.slice((archivingPage - 1) * PER_PAGE, archivingPage * PER_PAGE)}
                autoScrollTable={true}
                {...tableTheadProps}
              />
              <Pagination
                currentPage={archivingPage}
                itemsPerPage={PER_PAGE}
                totalItems={filteredIcdRows.length}
                setCurrentPage={setArchivingPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
