import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Eye, ArrowRight, ArrowLeft, Loader2, Search, X } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface AuditRecord {
  id: number;
  scanDate: string;
  scanTime: string;
  createdBy: string;
  createdByRole: string;
  totalAssets: number;
  assetsFound: number;
  assetsNotFound: number;
  details: AuditAssetRow[];
}

interface AuditAssetRow {
  id: number;
  assetName: string;
  serialNumber: string;
  assetType: string;
  assetCategory: string;
  status: "Not Found" | "Found";
}

interface RfidAsset {
  id: number;
  assetName: string;
  serialNumber: string;
  assetType: string;
  assetCategory: string;
  scanResult?: "Waiting for Scan" | "Found" | "Not Found";
}

interface NonRfidAsset {
  id: number;
  assetName: string;
  serialNumber: string;
  assetType: string;
  assetCategory: string;
}

/* ─── Mock data ──────────────────────────────────────────────────────── */
const MOCK_AUDITS: AuditRecord[] = [
  {
    id: 1,
    scanDate: "21 May 2026",
    scanTime: "10:36:42 AM",
    createdBy: "Olivia Carter",
    createdByRole: "System Admin",
    totalAssets: 72,
    assetsFound: 2,
    assetsNotFound: 70,
    details: [
      { id: 1, assetName: "Lenovo Legion 5 (1)", serialNumber: "98175819102", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device", status: "Not Found" },
      { id: 2, assetName: "M16 (17)", serialNumber: "123456317", assetType: "M16", assetCategory: "Weapon", status: "Not Found" },
      { id: 3, assetName: "M16 (16)", serialNumber: "123456316", assetType: "M16", assetCategory: "Weapon", status: "Not Found" },
      { id: 4, assetName: "LMG (1)", serialNumber: "987654321", assetType: "LMG", assetCategory: "Weapon", status: "Not Found" },
      { id: 5, assetName: "LMG (2)", serialNumber: "823748398", assetType: "LMG", assetCategory: "Weapon", status: "Not Found" },
      { id: 6, assetName: "LMG (3)", serialNumber: "564738291", assetType: "LMG", assetCategory: "Weapon", status: "Not Found" },
    ],
  },
];

const RFID_ASSETS: RfidAsset[] = [
  { id: 1,  assetName: "Lenovo Legion 5 (1)", serialNumber: "98175819102", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device" },
  { id: 2,  assetName: "M16 (5)",             serialNumber: "0912873465",  assetType: "M16",           assetCategory: "Weapon" },
  { id: 3,  assetName: "M16 (4)",             serialNumber: "2190437865",  assetType: "M16",           assetCategory: "Weapon" },
  { id: 4,  assetName: "M16 (3)",             serialNumber: "1209348756",  assetType: "M16",           assetCategory: "Weapon" },
  { id: 5,  assetName: "M16 (2)",             serialNumber: "564738291",   assetType: "M16",           assetCategory: "Weapon" },
  { id: 6,  assetName: "M16 (1)",             serialNumber: "192837465",   assetType: "M16",           assetCategory: "Weapon" },
  { id: 7,  assetName: "LMG (5)",             serialNumber: "872633123",   assetType: "LMG",           assetCategory: "Weapon" },
  { id: 8,  assetName: "LMG (4)",             serialNumber: "129834765",   assetType: "LMG",           assetCategory: "Weapon" },
  { id: 9,  assetName: "LMG (3)",             serialNumber: "564738291",   assetType: "LMG",           assetCategory: "Weapon" },
  { id: 10, assetName: "LMG (2)",             serialNumber: "823748398",   assetType: "LMG",           assetCategory: "Weapon" },
  { id: 11, assetName: "LMG (1)",             serialNumber: "987654321",   assetType: "LMG",           assetCategory: "Weapon" },
  { id: 12, assetName: "SAR21 (3)",           serialNumber: "112233445",   assetType: "SAR21",         assetCategory: "Weapon" },
  { id: 13, assetName: "SAR21 (2)",           serialNumber: "998877665",   assetType: "SAR21",         assetCategory: "Weapon" },
  { id: 14, assetName: "SAR21 (1)",           serialNumber: "554433221",   assetType: "SAR21",         assetCategory: "Weapon" },
  { id: 15, assetName: "Lenovo Legion 5 (2)", serialNumber: "98175819103", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device" },
  { id: 16, assetName: "Lenovo Legion 5 (3)", serialNumber: "98175819104", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device" },
  { id: 17, assetName: "Lenovo Legion 5 (4)", serialNumber: "98175819105", assetType: "Lenovo Laptop", assetCategory: "Laptop Computer Device" },
];

const NON_RFID_ASSETS: NonRfidAsset[] = Array.from({ length: 53 }, (_, i) => ({
  id: i + 1,
  assetName: `M16 (${17 - i > 0 ? 17 - i : i - 16})`,
  serialNumber: `12345${(6317 - i).toString().padStart(4, "0")}`,
  assetType: i < 17 ? "M16" : i < 30 ? "LMG" : "SAR21",
  assetCategory: "Weapon",
}));

const PER_PAGE = 10;

/* ─── Step 1: RFID Scan ──────────────────────────────────────────────── */
function Step1RfidScan({ onNext }: { onNext: (assets: RfidAsset[]) => void }) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [assets, setAssets] = useState<RfidAsset[]>(RFID_ASSETS);
  const [page, setPage] = useState(1);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setAssets(RFID_ASSETS.map((a) => ({ ...a, scanResult: "Waiting for Scan" as const })));
      setScanning(false);
      setScanned(true);
    }, 1800);
  };

  const paginated = assets.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const columns = useMemo<ColumnDef<RfidAsset, any>[]>(() => [
    {
      id: "no", compact: true, width: 60, minWidth: 60, maxWidth: 60,
      header: () => "No",
      cell: (info: any) => <div className="text-sm text-default">{(page - 1) * PER_PAGE + info.row.index + 1}</div>,
    } as ColumnDef<RfidAsset, any>,
    { id: "assetName", header: () => "Asset Name", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetName}</div> },
    { id: "serialNumber", header: () => "Asset Serial Number", cell: (info: any) => <div className="text-sm text-default">{info.row.original.serialNumber}</div> },
    { id: "assetType", header: () => "Asset Type", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetType}</div> },
    { id: "assetCategory", header: () => "Asset Category", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetCategory}</div> },
    ...(scanned ? [{
      id: "scanResult",
      header: () => <span className="text-primary font-semibold text-sm">Scan Result</span>,
      cell: (info: any) => (
        <span className="text-sm text-placeholder italic">{info.row.original.scanResult || "Waiting for Scan"}</span>
      ),
    }] as ColumnDef<RfidAsset, any>[] : []),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [scanned, page]);

  return (
    <div className="flex-1 overflow-auto bg-default-default">
      <div className="p-6">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-default whitespace-nowrap">Asset Overview</h1>
            <p className="text-sm text-body mt-0.5 whitespace-nowrap">Scan the asset to audit</p>
          </div>
          <Button
            onClick={() => onNext(assets)}
            disabled={!scanned}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors w-auto flex-shrink-0",
              scanned
                ? "bg-primary-default text-invert-default hover:bg-primary-hovered"
                : "bg-disabled text-disabled cursor-not-allowed"
            )}
          >
            Next <ArrowRight size={15} />
          </Button>
        </div>

        <div className="bg-surface-lv1 rounded-lg border border-invert-default">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-invert-default">
            <span className="text-sm font-semibold text-default">
              Asset with RFID <span className="text-body font-normal">({RFID_ASSETS.length} Assets)</span>
            </span>
            <button
              onClick={handleScan}
              disabled={scanning || scanned}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                scanning
                  ? "bg-primary-default text-invert-default cursor-not-allowed"
                  : scanned
                  ? "bg-disabled text-disabled cursor-not-allowed"
                  : "bg-primary-default text-invert-default hover:bg-primary-hovered"
              )}
            >
              {scanning ? (
                <><Loader2 size={14} className="animate-spin" /> Scanning...</>
              ) : scanned ? "Scanned" : "Scan"}
            </button>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={assets.length} setCurrentPage={setPage} />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Non-RFID Manual Audit ─────────────────────────────────── */
function Step2NonRfid({
  rfidAssets,
  onBack,
  onConfirm,
}: {
  rfidAssets: RfidAsset[];
  onBack: () => void;
  onConfirm: (selected: Set<number>) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [page, setPage] = useState(1);

  const paginated = NON_RFID_ASSETS.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allOnPage = paginated.every((a) => selected.has(a.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) paginated.forEach((a) => next.delete(a.id));
      else paginated.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const columns = useMemo<ColumnDef<NonRfidAsset, any>[]>(() => [
    {
      id: "no", compact: true, width: 60, minWidth: 60, maxWidth: 60,
      header: () => "No",
      cell: (info: any) => <div className="text-sm text-default">{(page - 1) * PER_PAGE + info.row.index + 1}</div>,
    } as ColumnDef<NonRfidAsset, any>,
    { id: "assetName", header: () => "Asset Name", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetName}</div> },
    { id: "serialNumber", header: () => "Asset Serial Number", cell: (info: any) => <div className="text-sm text-default">{info.row.original.serialNumber}</div> },
    { id: "assetType", header: () => "Asset Type", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetType}</div> },
    { id: "assetCategory", header: () => "Asset Category", cell: (info: any) => <div className="text-sm text-default">{info.row.original.assetCategory}</div> },
    {
      id: "audit",
      header: () => (
        <button
          onClick={toggleAll}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {allOnPage ? "Deselect All" : "Select All"}
        </button>
      ),
      cell: (info: any) => (
        <Checkbox
          size={16}
          checked={selected.has(info.row.original.id)}
          onChange={() => toggle(info.row.original.id)}
          label={<span className="text-sm text-body">Audit</span>}
          wrapperClassName="flex items-center gap-2"
        />
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [selected, allOnPage, page]);

  // Build combined results for confirm modal
  const allResults: AuditAssetRow[] = [
    ...rfidAssets.map((a) => ({ id: a.id, assetName: a.assetName, serialNumber: a.serialNumber, assetType: a.assetType, assetCategory: a.assetCategory, status: "Not Found" as const })),
    ...NON_RFID_ASSETS.map((a) => ({ id: a.id + 1000, assetName: a.assetName, serialNumber: a.serialNumber, assetType: a.assetType, assetCategory: a.assetCategory, status: "Not Found" as const })),
  ];
  const totalAssets = allResults.length;
  const assetsFound = 0;
  const assetsNotFound = totalAssets;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const timeLabel = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex-1 overflow-auto bg-default-default">
      <div className="p-6">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-default whitespace-nowrap">Asset Overview</h1>
            <p className="text-sm text-body mt-0.5 whitespace-nowrap">Scan the asset to audit</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-invert-default text-default hover:bg-default-hovered transition-colors bg-surface"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <Button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary-default text-invert-default hover:bg-primary-hovered transition-colors w-auto flex-shrink-0"
            >
              Confirm <ArrowRight size={15} />
            </Button>
          </div>
        </div>

        <div className="bg-surface-lv1 rounded-lg border border-invert-default">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-invert-default">
            <div className="text-sm font-semibold text-default">
              Asset without RFID <span className="text-body font-normal">({NON_RFID_ASSETS.length} Assets)</span>
            </div>
            <div className="text-xs text-body mt-0.5">
              Total Audit Selected - ({selected.size})
            </div>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={NON_RFID_ASSETS.length} setCurrentPage={setPage} />
        </div>
      </div>

      {/*
        Confirm modal — same shell as Figma's `Report Details`, but this is the
        pre-generate step, so its footer keeps Cancel / Generate rather than
        Close / Download. Colours and structure brought in line with the frame:
        `background/modal`, the Key Value date row, `surface lv1` stat cards,
        and TableCustom instead of the raw <table> that stood here (which also
        broke the project's own "never render raw HTML tables" rule).
      */}
      {showConfirm && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-6">
          <div className="w-full max-w-[1024px] bg-modal rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6">
              <h2 className="text-xl font-semibold text-default">Asset Audit Results</h2>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                aria-label="Close"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-default hover:bg-default-default transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
              <ReportKeyValue label="Scan Date & Time" value={`${dateLabel}, ${timeLabel}`} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ReportStatCard label="Total Assets" value={totalAssets} />
                <ReportStatCard label="Assets Found" value={assetsFound} />
                <ReportStatCard label="Assets Not Found" value={assetsNotFound} />
              </div>

              <div className="rounded-lg border border-invert-default bg-surface-lv1 overflow-hidden">
                <TableCustom
                  columns={AUDIT_DETAIL_COLUMNS}
                  data={allResults}
                  autoScrollTable={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-invert-default px-8 py-6">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="h-10 px-5 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={() => onConfirm(selected)}
                className="w-auto h-10 px-5 rounded-lg bg-primary-default hover:bg-primary-hovered text-sm font-semibold text-invert-default"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Report Details modal, from Figma ──────────────────────────────────
 * Figma page `↪ Assets Audit Report` (`5119:302600`) → section
 * `Report Details - Modal` (`5119:302988`) → frame `Report Details`
 * (`5119:303000`) → `Modal` 1024×1029, radius 16, `color/background/modal`.
 *
 *   Header 104   "Asset Audit Results" 20 Semi Bold `text/default`, plus a
 *                40×40 close icon button — the code had no close control in
 *                the header at all.
 *   Content      a `Key Value` row ("Scan Date & Time" 14 Regular `text/body`
 *                : value 14 SEMI BOLD `text/default`) — not a grey subtitle
 *                under the title, which is what stood here;
 *                three 309×96 stat cards, radius 12, `background/surface lv1`
 *                + `border/invert/default`, label 12 Regular `text/body` and
 *                figure 30 Bold `text/default`;
 *                then a `Section` 960×663, radius 8, same surface + border,
 *                wrapping the table.
 *   Footer 104   **Close** (71×40, `background/surface` +
 *                `border/invert/default`) and **Download** (126×40,
 *                `background/primary/default`). Download was missing entirely.
 *
 * Status is Figma's standard `Badge` — radius full,
 * `background/danger/invert/default` + `border/invert/danger` + `text/danger`
 * for Not Found, the success trio for Found — i.e. `components/status-badge`,
 * not the hand-rolled `bg-red-100 text-red-600` pill that was here.
 */
function ReportStatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-invert-default bg-surface-lv1 px-5 py-4">
      <p className="text-xs text-body">{label}</p>
      <p className="mt-1 text-3xl font-bold text-default">{value}</p>
    </div>
  );
}

function ReportKeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-body">{label}</span>
      <span className="text-sm font-semibold text-default">{value}</span>
    </div>
  );
}

const AUDIT_DETAIL_COLUMNS: ColumnDef<AuditAssetRow, any>[] = [
  {
    id: "no",
    header: () => "No",
    cell: (info) => <span className="text-sm text-body">{info.row.index + 1}</span>,
  },
  {
    id: "assetName",
    header: () => "Asset Name",
    cell: (info) => <span className="text-sm text-default">{info.row.original.assetName}</span>,
  },
  {
    id: "serialNumber",
    header: () => "Asset Serial Number",
    cell: (info) => <span className="text-sm text-default">{info.row.original.serialNumber}</span>,
  },
  {
    id: "assetType",
    header: () => "Asset Type",
    cell: (info) => <span className="text-sm text-default">{info.row.original.assetType}</span>,
  },
  {
    id: "assetCategory",
    header: () => "Asset Category",
    cell: (info) => <span className="text-sm text-default">{info.row.original.assetCategory}</span>,
  },
  {
    id: "status",
    header: () => "Status",
    cell: (info) => (
      <StatusBadge tone={info.row.original.status === "Not Found" ? "danger" : "success"}>
        {info.row.original.status}
      </StatusBadge>
    ),
  },
];

/* ─── Assets Audit Report (listing + flow controller) ────────────────── */
type FlowStep = null | "step1" | "step2";

export function AssetsAuditReport(_props: { onNavigate?: (path: string) => void }) {
  const [audits, setAudits] = useState<AuditRecord[]>(MOCK_AUDITS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState<FlowStep>(null);
  const [rfidAssets, setRfidAssets] = useState<RfidAsset[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<AuditRecord | null>(null);

  const filteredAudits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return audits;
    return audits.filter((a) =>
      a.createdBy.toLowerCase().includes(q) ||
      a.scanDate.toLowerCase().includes(q) ||
      a.scanTime.toLowerCase().includes(q)
    );
  }, [audits, searchQuery]);

  const paginated = filteredAudits.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const indexedPaginated = paginated.map((row, idx) => ({
    ...row,
    _idx: (currentPage - 1) * PER_PAGE + idx + 1,
  }));

  const handleGenerate = (_selected: Set<number>) => {
    const now = new Date();
    const newRecord: AuditRecord = {
      id: audits.length + 1,
      scanDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      scanTime: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      createdBy: "Olivia Carter",
      createdByRole: "System Admin",
      totalAssets: rfidAssets.length + NON_RFID_ASSETS.length,
      assetsFound: 0,
      assetsNotFound: rfidAssets.length + NON_RFID_ASSETS.length,
      details: rfidAssets.map((a) => ({
        id: a.id,
        assetName: a.assetName,
        serialNumber: a.serialNumber,
        assetType: a.assetType,
        assetCategory: a.assetCategory,
        status: "Not Found" as const,
      })),
    };
    setAudits((prev) => [newRecord, ...prev]);
    setStep(null);
  };

  const auditColumns = useMemo<ColumnDef<AuditRecord & { _idx: number }, any>[]>(
    () => [
      {
        id: "no", compact: true, width: 60, minWidth: 60, maxWidth: 60,
        header: () => "No",
        cell: (info) => <div className="text-sm text-default">{info.row.original._idx}</div>,
      } as ColumnDef<AuditRecord & { _idx: number }, any>,
      {
        id: "scanDateTime",
        header: () => (
          <span className="flex items-center gap-1">
            Scan Date &amp; Time
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </span>
        ),
        cell: (info) => (
          <div>
            <div className="text-sm text-default">{info.row.original.scanDate}</div>
            <div className="text-xs text-body">{info.row.original.scanTime}</div>
          </div>
        ),
      },
      {
        id: "createdBy",
        header: () => "Created By",
        cell: (info) => (
          <div>
            <div className="text-sm text-default">{info.row.original.createdBy}</div>
            <div className="text-xs text-body">{info.row.original.createdByRole}</div>
          </div>
        ),
      },
      { id: "totalAssets", header: () => "Total Assets", cell: (info) => <div className="text-sm text-default">{info.row.original.totalAssets}</div> },
      { id: "assetsFound", header: () => "Assets Found", cell: (info) => <div className="text-sm text-default">{info.row.original.assetsFound}</div> },
      { id: "assetsNotFound", header: () => "Assets Not Found", cell: (info) => <div className="text-sm text-default">{info.row.original.assetsNotFound}</div> },
      {
        id: "action",
        header: () => "Action",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedDetail(info.row.original)}
              className="text-caption hover:text-primary transition-colors"
              title="View"
            >
              <Eye size={15} />
            </button>
            <button
              type="button"
              className="text-caption hover:text-primary transition-colors"
              title="Download"
            >
              <Download size={15} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  /* Flow: step1 or step2 replaces listing */
  if (step === "step1") {
    return (
      <Step1RfidScan
        onNext={(assets) => {
          setRfidAssets(assets);
          setStep("step2");
        }}
      />
    );
  }

  if (step === "step2") {
    return (
      <Step2NonRfid
        rfidAssets={rfidAssets}
        onBack={() => setStep("step1")}
        onConfirm={handleGenerate}
      />
    );
  }

  /* Listing page */
  return (
    <>
      <div className="flex-1 overflow-auto bg-default-default">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-semibold text-primary">Assets Audit Report</h1>
            <Button
              onClick={() => setStep("step1")}
              className="flex items-center w-fit gap-2 px-4 py-2 text-sm bg-primary-default text-invert-default rounded-md hover:bg-primary-hovered font-semibold"
            >
              Generate Report
            </Button>
          </div>

          <div className="bg-surface-lv1 rounded-lg border border-invert-default">
            {/* Filters */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-invert-default">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption z-10" />
                <InputCustom
                  type="text"
                  placeholder="Search by created by or date"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <TableCustom
              columns={auditColumns}
              data={indexedPaginated}
              autoScrollTable={true}
             
            />
            <Pagination
              currentPage={currentPage}
              itemsPerPage={PER_PAGE}
              totalItems={filteredAudits.length}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Detail modal — Figma `Report Details` (5119:303000) */}
      {selectedDetail && (
        <div
          className="fixed inset-0 z-[2000] bg-black/45 p-4 sm:p-8 flex items-start justify-center overflow-y-auto"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="w-full max-w-[1024px] bg-modal rounded-2xl shadow-2xl my-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header 104 — title + close icon button */}
            <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6">
              <h2 className="text-xl font-semibold text-default">Asset Audit Results</h2>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                aria-label="Close"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-default hover:bg-default-default transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-8 pb-8 space-y-5">
              <ReportKeyValue
                label="Scan Date & Time"
                value={`${selectedDetail.scanDate}, ${selectedDetail.scanTime}`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ReportStatCard label="Total Assets" value={selectedDetail.totalAssets} />
                <ReportStatCard label="Assets Found" value={selectedDetail.assetsFound} />
                <ReportStatCard label="Assets Not Found" value={selectedDetail.assetsNotFound} />
              </div>

              {/* Section 960×663 — the table's own card */}
              <div className="rounded-lg border border-invert-default bg-surface-lv1 overflow-hidden">
                <TableCustom
                  columns={AUDIT_DETAIL_COLUMNS}
                  data={selectedDetail.details}
                  autoScrollTable={true}
                />
              </div>
            </div>

            {/* Footer 104 — Close + Download. Download was missing before. */}
            <div className="flex justify-end gap-3 border-t border-invert-default px-8 py-6">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="h-10 px-5 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
              >
                Close
              </button>
              {/*
                Figma's footer has this button, so it is drawn. It is NOT wired:
                nothing in this repo implements a download — the row-level
                Download action in the listing above is a no-op too, and there
                is no CSV/export helper anywhere in src/. Rather than invent an
                export format nobody specified, this matches the prototype's
                existing behaviour and is flagged here instead of silently
                looking functional.
              */}
              <button
                type="button"
                disabled
                title="Download is not implemented in this prototype"
                className="inline-flex h-10 items-center gap-2 px-5 rounded-lg bg-primary-default text-sm font-semibold text-invert-default transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
