import { useState, useEffect, useRef } from "react";
import {
  Clock, UserCheck, UserX,
  Download, Upload, FileText, CheckCircle2, ChevronRight, Settings2,
  ChevronLeft, MoreVertical, FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import { cn } from "@/lib/utils";
import { MSTConfigureDetailList } from "./MSTConfigureDetailList";
import type { EditableCabin } from "./MSTConfigureDetailList";
import { BatchScenarioSwitcher, MST_BATCH_SCENARIOS, type BatchScenarioDef } from "./DemoSwitcher";

// ── Mock cabin / cluster groups ────────────────────────────────────────────────

const CABIN_GROUPS: Array<{
  cabin:        string;
  platformType: string;
  callsign:     string;
  trainees:     Array<{
    role: string; name: string; svcId: string; rank: string;
    callsign?: string; batch: string; course: string; unit: string;
  }>;
}> = [
  {
    cabin: "MST01", platformType: "Terrex 50 HMG", callsign: "11Z",
    trainees: [
      { role: "VC",    name: "Lu Ling Hui",              svcId: "T6535925H", rank: "CPL",                  batch: "06/26", course: "IOCC_2(TRX)", unit: "1SIR" },
      { role: "VO",    name: "Tong Yi Ling",              svcId: "T5289849D", rank: "PTE",                  batch: "06/26", course: "IOCC_2(TRX)", unit: "1SIR" },
      { role: "TC/PC", name: "Liu Shu Qi",                svcId: "T9309764A", rank: "MAJ", callsign: "11",  batch: "06/26", course: "IOCC_2(TRX)", unit: "1SIR" },
      { role: "SC",    name: "Choong Yi Min",             svcId: "T6263693E", rank: "WO",                   batch: "06/26", course: "IOCC_2(TRX)", unit: "1SIR" },
      { role: "SO",    name: "Ang Jun De",                svcId: "T8171256A", rank: "SGT", callsign: "11A", batch: "06/26", course: "IOCC_2(TRX)", unit: "1SIR" },
    ],
  },
  {
    cabin: "MST02", platformType: "Terrex 40 AGL", callsign: "11SZ",
    trainees: [
      { role: "VC",    name: "Kwa Xuan Ming",             svcId: "T8107085C", rank: "CPL",                  batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "VO",    name: "Tang Jia Hui",              svcId: "T0042574A", rank: "PTE",                  batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "TC/PC", name: "Law Yong Rui",              svcId: "T5348570C", rank: "MAJ", callsign: "11S", batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "SC",    name: "Guo Guo Qiang",             svcId: "T1161476G", rank: "WO",                   batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "SO",    name: "Muhamad Hj Zul bin Sharin", svcId: "F6537528K", rank: "SGT",                  batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
    ],
  },
  {
    cabin: "MST03", platformType: "L2SG", callsign: "22Z",
    trainees: [
      { role: "VO", name: "Ahmad Firdaus",   svcId: "S7521418A", rank: "PTE", batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "VC", name: "Ng Jian Wei",     svcId: "S9521418Z", rank: "MAJ", batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
    ],
  },
  {
    cabin: "MST04", platformType: "PCSV Mortar", callsign: "14SZ",
    trainees: [
      { role: "VO", name: "Hafiz Rahman",    svcId: "T0192258G", rank: "PTE",                   batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "VC", name: "Tan Wei Ming",    svcId: "T0255758A", rank: "MAJ",                   batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "TC", name: "Lim Jun Xian",    svcId: "T0377737Z", rank: "MAJ", callsign: "14S",  batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
      { role: "SO", name: "Syed Farhan",     svcId: "T0488228Z", rank: "PTE", callsign: "14B",  batch: "06/26", course: "IOCC_2(TRX)", unit: "2SIR" },
    ],
  },
];

type CabinGroup = typeof CABIN_GROUPS[0];

// CABIN_GROUPS + TOTAL_TRAINEES kept for reference; batch view uses generated data
const _TOTAL_TRAINEES = CABIN_GROUPS.reduce((s, g) => s + g.trainees.length, 0);
void _TOTAL_TRAINEES;

// ── Batch scenario data generation ────────────────────────────────────────────

const BATCH_NAME_POOL = [
  "Ahmad Firdaus",  "Ng Jian Wei",     "Hafiz Rahman",   "Tan Wei Ming",
  "Lim Jun Xian",   "Syed Farhan",     "Lu Ling Hui",    "Tong Yi Ling",
  "Liu Shu Qi",     "Choong Yi Min",   "Ang Jun De",     "Kwa Xuan Ming",
  "Tang Jia Hui",   "Law Yong Rui",    "Guo Guo Qiang",  "Muhamad Hj Zul",
  "Wei Ming Lee",   "Kai En Tan",      "Ismail Yusof",   "Farid Rahman",
  "Ravi Kumar",     "Jason Lim",       "Ahmad Rizal",    "David Tan",
  "Reuben Tan",     "Ethan Yap",       "Kai Xuan Teo",   "Shi Hao Sim",
  "Jun Wei Chua",   "Boon Kiat Lim",
  "Zul Hakimi",     "Faizal Azmi",     "Bryan Ong",      "Marcus Loh",
  "Kelvin Ng",      "Darren Chua",     "Ivan Tan",       "Patrick Lee",
  "Vincent Koh",    "Stanley Wong",    "Raymond Teo",    "Norman Sim",
  "Gerald Yap",     "Bernard Lim",     "Edmund Tan",     "Clarence Ng",
  "Franklin Ong",   "Henderson Lee",   "Irving Chua",    "Jasper Koh",
  "Kenneth Wong",   "Lawrence Teo",    "Maxwell Sim",    "Nathan Yap",
  "Oscar Lim",      "Phillip Tan",     "Quentin Ng",     "Ronald Ong",
  "Samuel Lee",     "Thomas Chua",     "Ulysses Koh",    "Victor Wong",
  "Warren Teo",     "Xavier Sim",      "Yusof Yap",      "Zachary Lim",
  "Alvin Tan",      "Benjamin Ng",     "Charles Ong",    "Daniel Lee",
];
const BATCH_ROLES   = ["VO", "VC", "TC", "SC", "SO"];
const BATCH_RANKS   = ["PTE", "CPL", "MAJ", "WO", "SGT"];
const BATCH_UNITS   = ["1SIR", "2SIR", "3SIR", "40SAR"];
const BATCH_CABINS  = [
  { cabin: "MST01", platformType: "Terrex 50 HMG", callsign: "11Z"  },
  { cabin: "MST02", platformType: "Terrex 40 AGL", callsign: "11SZ" },
  { cabin: "MST03", platformType: "L2SG",          callsign: "22Z"  },
  { cabin: "MST04", platformType: "PCSV Mortar",   callsign: "14SZ" },
  { cabin: "MST05", platformType: "Terrex 50 HMG", callsign: "21Z"  },
  { cabin: "MST06", platformType: "Terrex 40 AGL", callsign: "21SZ" },
  { cabin: "MST07", platformType: "L2SG",          callsign: "32Z"  },
  { cabin: "MST08", platformType: "PCSV Mortar",   callsign: "34SZ" },
  { cabin: "MST09", platformType: "Terrex 50 HMG", callsign: "41Z"  },
  { cabin: "MST10", platformType: "Terrex 40 AGL", callsign: "41SZ" },
  { cabin: "MST11", platformType: "L2SG",          callsign: "42Z"  },
  { cabin: "MST12", platformType: "PCSV Mortar",   callsign: "44SZ" },
];

function buildBatchGroups(scenario: BatchScenarioDef, batchIdx: number): CabinGroup[] {
  const capacity       = scenario.cabinCount * scenario.rolesPerCabin;
  const totalBatches   = Math.ceil(scenario.totalTrainees / capacity);
  const traineesInBatch = batchIdx < totalBatches - 1
    ? capacity
    : scenario.totalTrainees - (totalBatches - 1) * capacity;
  const globalOffset   = batchIdx * capacity;
  const groups: CabinGroup[] = [];
  let assigned = 0;

  for (let c = 0; c < scenario.cabinCount; c++) {
    const def = BATCH_CABINS[c];
    const trainees: CabinGroup["trainees"] = [];
    for (let r = 0; r < scenario.rolesPerCabin; r++) {
      if (assigned >= traineesInBatch) break;
      const absIdx = globalOffset + assigned;
      trainees.push({
        role:     BATCH_ROLES[r],
        name:     BATCH_NAME_POOL[absIdx % BATCH_NAME_POOL.length],
        svcId:     `T${String(absIdx + 1001).padStart(7, "0")}H`,
        rank:     BATCH_RANKS[r % BATCH_RANKS.length],
        batch:    `0${batchIdx + 1}/26`,
        course:   "IOCC_2(TRX)",
        unit:     BATCH_UNITS[absIdx % BATCH_UNITS.length],
      });
      assigned++;
    }
    groups.push({ ...def, trainees });
  }
  return groups;
}

// ── Role badge colours ─────────────────────────────────────────────────────────

const ROLE_COLOUR: Record<string, string> = {
  VC:      "bg-blue-100   text-blue-700",
  VO:      "bg-violet-100 text-violet-700",
  "TC/PC": "bg-orange-100 text-orange-700",
  TC:      "bg-orange-100 text-orange-700",
  SC:      "bg-emerald-100 text-emerald-700",
  SO:      "bg-gray-100   text-gray-600",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide",
      ROLE_COLOUR[role] ?? "bg-gray-100 text-gray-600",
    )}>
      {role}
    </span>
  );
}

// ── Countdown timer ────────────────────────────────────────────────────────────

function useCountdown(initial: number) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ── Cabin detail modal ─────────────────────────────────────────────────────────

const DETAIL_GRID = "68px 1fr 108px 52px 68px 56px 116px 52px";

function CabinDetailModal({
  group,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  group:   CabinGroup;
  index:   number;
  total:   number;
  onClose: () => void;
  onPrev:  () => void;
  onNext:  () => void;
}) {
  const isMST = group.cabin.startsWith("MST");

  return (
    <Modal open onClose={onClose} width="820px">
      {/* Modal header */}
      <div className="flex items-center gap-4 mb-6 -mt-1 pr-8">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
          isMST ? "bg-red-100 text-brand-primary" : "bg-blue-100 text-blue-700",
        )}>
          {isMST ? "MST" : "TCT"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800">{group.cabin}</h3>
          <p className="text-sm text-gray-500">
            {group.platformType} &bull; Callsign: <span className="font-semibold text-gray-700">{group.callsign}</span>
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {group.trainees.length} {group.trainees.length === 1 ? "Trainee" : "Trainees"}
        </span>
      </div>

      {/* Trainee table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="grid px-4 py-2.5 bg-gray-50 border-b border-gray-200"
          style={{ gridTemplateColumns: DETAIL_GRID }}
        >
          {["Role", "Name", "Service ID", "Rank", "Callsign", "Details", "Course", "Unit"].map((h) => (
            <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {group.trainees.map((t, i) => (
          <div
            key={i}
            className="grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
            style={{ gridTemplateColumns: DETAIL_GRID }}
          >
            <div><RoleBadge role={t.role} /></div>
            <span className="text-sm text-gray-800 pr-4">{t.name}</span>
            <span className="text-xs font-mono text-gray-600">{t.svcId}</span>
            <span className="text-xs text-gray-700">{t.rank}</span>
            <span className="text-xs text-gray-600">{t.callsign ?? "—"}</span>
            <span className="text-xs text-gray-700">{t.batch}</span>
            <span className="text-xs text-gray-700">{t.course}</span>
            <span className="text-xs text-gray-700">{t.unit}</span>
          </div>
        ))}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-medium text-gray-500 tabular-nums min-w-[48px] text-center">
          {index + 1} <span className="text-gray-300">/</span> {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={index === total - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </Modal>
  );
}

// ── Cabin card ─────────────────────────────────────────────────────────────────

function CabinCard({
  group,
  onViewDetail,
}: {
  group: CabinGroup;
  onViewDetail: () => void;
}) {
  const isMST = group.cabin.startsWith("MST");

  return (
    <button
      type="button"
      onClick={onViewDetail}
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-300 transition-all text-left w-full cursor-pointer"
    >
      {/* Card top: type badge + cabin name */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 leading-tight">{group.cabin}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{group.platformType}</p>
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-md shrink-0",
          isMST ? "bg-red-100 text-brand-primary" : "bg-blue-100 text-blue-700",
        )}>
          {isMST ? "MST" : "TCT"}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Callsign</p>
          <p className="text-sm font-bold text-gray-800">{group.callsign}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Trainees</p>
          <p className="text-sm font-bold text-gray-800">{group.trainees.length}</p>
        </div>
      </div>

      {/* Role badges */}
      <div className="flex flex-wrap gap-1.5">
        {group.trainees.map((t, i) => (
          <RoleBadge key={i} role={t.role} />
        ))}
      </div>

    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MSTDetailListTab({
  status = "Upcoming",
  isGenerated = false,
  onGenerated,
}: {
  status?:      string;
  isGenerated?: boolean;
  onGenerated?: () => void;
}) {
  const timer = useCountdown(20 * 60 + 18);

  const [confirmed,        setConfirmed]        = useState(false);
  const [uploadedFile,     setUploadedFile]     = useState<string | null>(null);
  const [selectedIdx,      setSelectedIdx]      = useState<number | null>(null);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState<number>(0);
  const [activeBatchTab,   setActiveBatchTab]   = useState<number>(0);
  const [showConfigure,    setShowConfigure]    = useState(false);
  const [configuredCabins, setConfiguredCabins] = useState<EditableCabin[] | null>(null);
  const [batchScenarioId,  setBatchScenarioId]  = useState("s1");
  const [showExportMenu,   setShowExportMenu]   = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeScenario  = MST_BATCH_SCENARIOS.find(s => s.id === batchScenarioId) ?? MST_BATCH_SCENARIOS[0];
  const capacity        = activeScenario.cabinCount * activeScenario.rolesPerCabin;
  const batchCount      = Math.ceil(activeScenario.totalTrainees / capacity);
  const lastBatchSize   = activeScenario.totalTrainees - (batchCount - 1) * capacity;
  const allBatches      = Array.from({ length: batchCount }, (_, i) => buildBatchGroups(activeScenario, i));
  const totalInScenario = allBatches.reduce((s, b) => s + b.reduce((ss, g) => ss + g.trainees.length, 0), 0);

  const passCount  = 6;
  const failCount  = 3;
  const marksman   = 5;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!isGenerated) {
    return (
      <div className="flex items-start justify-center pt-10 pb-16">
        <div className="w-full max-w-2xl space-y-5">

          <div className="text-center mb-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-brand-primary" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Generate Detail List</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Before generating the detail list, please verify that you have completed
              both Nominal Roll upload and Cabin Configuration.
            </p>
          </div>

          {/* Auto-completed status cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Nominal Roll",         description: "Trainee nominal roll data uploaded" },
              { title: "Cabin Configuration",  description: "Cabin assignment configuration complete" },
            ].map(({ title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-green-500 bg-green-50"
              >
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-700">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Template &amp; Upload
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center"
              >
                <Download size={15} className="text-gray-500" />
                Download Template
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-red-50 transition-colors flex-1 justify-center cursor-pointer">
                <Upload size={15} />
                {uploadedFile ?? "Upload File"}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadedFile(f.name);
                  }}
                />
              </label>
            </div>
            {uploadedFile && (
              <p className="text-xs text-green-600 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                File &ldquo;{uploadedFile}&rdquo; ready to upload
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setConfirmed(v => !v)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left",
              confirmed
                ? "border-brand-primary bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300",
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              confirmed ? "bg-brand-primary border-brand-primary" : "border-gray-300",
            )}>
              {confirmed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={cn(
              "text-sm font-medium",
              confirmed ? "text-brand-primary" : "text-gray-600",
            )}>
              Yes, I have completed the Nominal Roll upload and Cabin Configuration
            </span>
          </button>

          {confirmed && (
            <Button
              onClick={() => { onGenerated?.(); }}
              className="w-full py-3 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover flex items-center justify-center gap-2"
            >
              Generate Detail List
              <ChevronRight size={16} />
            </Button>
          )}

        </div>
      </div>
    );
  }

  // ── Generated state ────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-5">

        {/* Stats bar — only when training has started */}
        {["Ongoing", "Completed"].includes(status) && (
          <div className="bg-white rounded-xl border border-gray-200 flex items-center divide-x divide-gray-100 overflow-hidden">
            <div className="flex flex-col justify-center px-4 py-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 leading-tight">MST Training Session</p>
              <p className="text-xs text-gray-400 mt-0.5">{activeScenario.cabinCount} Cabins &bull; {batchCount} {batchCount === 1 ? "Batch" : "Batches"}</p>
            </div>
            <div className="flex flex-col justify-center px-4 py-3 shrink-0">
              <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Total Trainees</p>
              <p className="text-xs font-semibold text-gray-800">{totalInScenario}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UserCheck size={13} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Marksman (%)</p>
                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                  {marksman} <span className="font-normal text-gray-500">/ {totalInScenario}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <UserCheck size={13} className="text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pass (%)</p>
                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                  {passCount} <span className="font-normal text-gray-500">/ {totalInScenario}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <UserX size={13} className="text-red-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fail (%)</p>
                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                  {failCount} <span className="font-normal text-gray-500">/ {totalInScenario}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center px-4 py-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <Clock size={12} className="text-brand-primary flex-shrink-0" />
                <span className="text-xs font-bold text-brand-primary font-mono">{timer}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Detail List{" "}
            <span className="text-gray-400 font-normal">
              ({activeScenario.cabinCount} Cabins &bull; {totalInScenario} Trainees &bull; {batchCount} {batchCount === 1 ? "Batch" : "Batches"})
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              type="outline"
              onClick={() => setShowConfigure(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold w-auto border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Settings2 size={14} /> Configure
            </Button>
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden py-1">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={15} className="text-gray-400" /> Export as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileSpreadsheet size={15} className="text-gray-400" /> Export as DOC
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Batch capacity formula bar */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-gray-800">{activeScenario.cabinCount} cabins</span>
            <span className="text-gray-400 font-medium">×</span>
            <span className="font-bold text-gray-800">{activeScenario.rolesPerCabin} roles/cabin</span>
            <span className="text-gray-400 font-medium">=</span>
            <span className="font-bold text-brand-primary">{capacity} capacity</span>
          </div>
          <div className="w-px h-4 bg-amber-300 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-gray-800">{activeScenario.totalTrainees} trainees</span>
            <span className="text-gray-500">÷ {capacity}</span>
            <span className="text-gray-400 font-medium">=</span>
            <span className="font-bold text-brand-primary">
              {batchCount} {batchCount === 1 ? "batch" : "batches"}
            </span>
            {batchCount > 1 && (
              <span className="text-xs text-gray-400 ml-1">
                (last batch: {lastBatchSize} trainees)
              </span>
            )}
          </div>
        </div>

        {/* Batch tabs — only shown when there are multiple batches */}
        {batchCount > 1 && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start">
            {allBatches.map((_, bIdx) => {
              const isPartial     = bIdx === batchCount - 1 && lastBatchSize < capacity;
              const traineesInTab = bIdx < batchCount - 1 ? capacity : lastBatchSize;
              const isActive      = activeBatchTab === bIdx;
              return (
                <button
                  key={bIdx}
                  type="button"
                  onClick={() => { setActiveBatchTab(bIdx); setSelectedIdx(null); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    isActive ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  Batch {bIdx + 1}
                  {isPartial && (
                    <span className={cn(
                      "text-[9px] font-bold leading-none",
                      isActive ? "text-amber-600" : "text-amber-400",
                    )}>partial</span>
                  )}
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[9px] font-bold",
                    isActive
                      ? isPartial ? "bg-amber-500 text-white" : "bg-brand-primary text-white"
                      : "bg-gray-200 text-gray-500",
                  )}>
                    {traineesInTab}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Single-batch label (when only 1 batch, no tabs needed) */}
        {batchCount === 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-primary text-white">
              Batch 1
            </span>
            <span className="text-xs text-gray-500">
              {totalInScenario} trainees &bull; {activeScenario.cabinCount} cabins
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}

        {/* Active batch cabin grid */}
        {(() => {
          const batchGroups   = allBatches[activeBatchTab] ?? allBatches[0];
          const isLast        = activeBatchTab === batchCount - 1;
          const batchSize     = isLast ? lastBatchSize : capacity;
          const batchCabinCnt = batchGroups.filter(g => g.trainees.length > 0).length;
          return (
            <div className="space-y-3">
              {/* Batch info line (only when multiple batches so tabs are shown) */}
              {batchCount > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {batchSize} trainees &bull; {batchCabinCnt} cabin{batchCabinCnt !== 1 ? "s" : ""}
                    {isLast && lastBatchSize < capacity && (
                      <span className="text-amber-600 ml-1.5 font-medium">— partial batch</span>
                    )}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4">
                {batchGroups.map((group, i) =>
                  group.trainees.length > 0 ? (
                    <CabinCard
                      key={group.cabin}
                      group={group}
                      onViewDetail={() => { setSelectedBatchIdx(activeBatchTab); setSelectedIdx(i); }}
                    />
                  ) : (
                    <div key={group.cabin} className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                      <p className="text-sm font-bold text-gray-300">{group.cabin}</p>
                      <p className="text-[10px] text-gray-300 uppercase tracking-wide">Unused</p>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Per-cabin detail modal with prev/next navigation */}
      {selectedIdx !== null && (() => {
        const batchGroups   = allBatches[selectedBatchIdx] ?? allBatches[0];
        const activeCabins  = batchGroups.filter(g => g.trainees.length > 0);
        const activeCabinIdx = activeCabins.findIndex((_, i) => {
          const realIdx = batchGroups.findIndex(g => g === activeCabins[i]);
          return realIdx === selectedIdx;
        });
        const displayIdx = activeCabinIdx >= 0 ? activeCabinIdx : 0;
        return (
          <CabinDetailModal
            group={batchGroups[selectedIdx]}
            index={displayIdx}
            total={activeCabins.length}
            onClose={() => setSelectedIdx(null)}
            onPrev={() => {
              const prevFull = batchGroups.slice(0, selectedIdx).map((g, i) => ({ g, i })).filter(x => x.g.trainees.length > 0);
              if (prevFull.length > 0) setSelectedIdx(prevFull[prevFull.length - 1].i);
            }}
            onNext={() => {
              const nextFull = batchGroups.slice(selectedIdx + 1).map((g, i) => ({ g, i: selectedIdx + 1 + i })).filter(x => x.g.trainees.length > 0);
              if (nextFull.length > 0) setSelectedIdx(nextFull[0].i);
            }}
          />
        );
      })()}

      {/* ── Floating batch scenario switcher ── */}
      <BatchScenarioSwitcher value={batchScenarioId} onChange={id => { setBatchScenarioId(id); setActiveBatchTab(0); setSelectedIdx(null); }} />

      {showConfigure && (
        <MSTConfigureDetailList
          initialBatches={(() => {
            if (configuredCabins) {
              // Re-group saved cabins by batchIdx
              const groups: typeof CABIN_GROUPS[] = [];
              configuredCabins.forEach(c => {
                while (groups.length <= c.batchIdx) groups.push([]);
                groups[c.batchIdx].push(c);
              });
              return groups;
            }
            return allBatches;
          })()}
          onClose={() => setShowConfigure(false)}
          onSave={(saved) => {
            setConfiguredCabins(saved);
            setShowConfigure(false);
          }}
        />
      )}
    </>
  );
}
