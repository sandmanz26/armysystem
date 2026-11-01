import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, Clock } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { cn } from "@/lib/utils";
import { ClusterScenarioSwitcher, TCT_CLUSTER_SCENARIOS, type ClusterScenarioDef } from "./DemoSwitcher";

// TCT doesn't use "cabins" the way MST does — it uses "clusters", the same
// concept (a platform + crew grouping), at a much larger per-batch scale: a
// TCT Detail (batch) can reuse a pool of up to **64** clusters, vs. MST's
// ~12-15 cabins. The hierarchy is otherwise identical to MST's Detail List:
//
//   Booking → 1 Detail List → many Details (batches) → each batch reuses the
//   *same* pool of physical clusters/cabins for a different set of trainees.
//
// Batch count is capacity-driven (clusterCount × rolesPerCluster), exactly
// like MST's `buildBatchGroups`. The only TCT-specific concern is *display*:
// a batch with all 64 clusters occupied would render 64 cards at once, so the
// grid is windowed 16-at-a-time within a batch, and a search box (scoped to
// the active batch's clusters) lets you jump straight to one without paging.

interface ClusterTrainee {
  role: string; name: string; svcId: string; rank: string;
  callsign?: string; batch: string; unit: string;
}

interface ClusterGroup {
  cluster: string;
  vehicleVariant: string;
  callsign: string;
  trainees: ClusterTrainee[];
}

const CLUSTERS_PER_PAGE = 16;

const VEHICLE_VARIANTS = [
  "TERREX (COMMANDER)", "TERREX (TROOPER)", "TERREX (SCOUT)",
  "TERREX (PIONEER)", "TERREX (MEDICAL)", "TERREX (STORM)", "BRONCO",
];
const ROLES = ["VO", "VC", "TC", "SC", "SO"];
const RANKS = ["PTE", "CPL", "MAJ", "WO", "SGT"];
const UNITS = ["1SIR", "2SIR", "3SIR", "40SAR"];
const NAME_POOL = [
  "Ahmad Firdaus", "Ng Jian Wei", "Hafiz Rahman", "Tan Wei Ming", "Lim Jun Xian",
  "Syed Farhan", "Lu Ling Hui", "Tong Yi Ling", "Liu Shu Qi", "Choong Yi Min",
  "Ang Jun De", "Kwa Xuan Ming", "Tang Jia Hui", "Law Yong Rui", "Guo Guo Qiang",
  "Wei Ming Lee", "Kai En Tan", "Ismail Yusof", "Farid Rahman", "Ravi Kumar",
];

// Fixed pool of up to 64 cluster identities — reused by every batch, the same
// way MST's `BATCH_CABINS` (MST01–MST12) is reused across all its batches.
const CLUSTER_DEFS = Array.from({ length: 64 }, (_, i) => {
  const n = i + 1;
  return {
    cluster: `TCT${String(n).padStart(2, "0")}`,
    vehicleVariant: VEHICLE_VARIANTS[n % VEHICLE_VARIANTS.length],
    callsign: `${10 + (n % 9)}${n % 2 === 0 ? "Z" : "SZ"}`,
  };
});

// Same formula as MST's buildBatchGroups: capacity = clusterCount × rolesPerCluster,
// and every batch fills the *same* clusterCount clusters from the shared pool.
function buildClusterBatch(scenario: ClusterScenarioDef, batchIdx: number): ClusterGroup[] {
  const capacity = scenario.clusterCount * scenario.rolesPerCluster;
  const totalBatches = Math.ceil(scenario.totalTrainees / capacity);
  const traineesInBatch = batchIdx < totalBatches - 1
    ? capacity
    : scenario.totalTrainees - (totalBatches - 1) * capacity;
  const globalOffset = batchIdx * capacity;
  const groups: ClusterGroup[] = [];
  let assigned = 0;

  for (let c = 0; c < scenario.clusterCount; c++) {
    const def = CLUSTER_DEFS[c];
    const trainees: ClusterTrainee[] = [];
    for (let r = 0; r < scenario.rolesPerCluster; r++) {
      if (assigned >= traineesInBatch) break;
      const absIdx = globalOffset + assigned;
      trainees.push({
        role: ROLES[r % ROLES.length],
        name: NAME_POOL[absIdx % NAME_POOL.length],
        svcId: `T${String(absIdx + 1001).padStart(7, "0")}H`,
        rank: RANKS[r % RANKS.length],
        callsign: r === 2 ? def.callsign : undefined,
        batch: `0${batchIdx + 1}/26`,
        unit: UNITS[absIdx % UNITS.length],
      });
      assigned++;
    }
    groups.push({ ...def, trainees });
  }
  return groups;
}

const ROLE_COLOUR: Record<string, string> = {
  VC: "bg-blue-100 text-blue-700",
  VO: "bg-violet-100 text-violet-700",
  TC: "bg-orange-100 text-orange-700",
  SC: "bg-emerald-100 text-emerald-700",
  SO: "bg-gray-100 text-gray-600",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide", ROLE_COLOUR[role] ?? "bg-gray-100 text-gray-600")}>
      {role}
    </span>
  );
}

function ClusterCard({ group, onViewDetail }: { group: ClusterGroup; onViewDetail: () => void }) {
  if (group.trainees.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 min-h-[110px]">
        <p className="text-sm font-bold text-gray-300">{group.cluster}</p>
        <p className="text-[10px] text-gray-300 uppercase tracking-wide">Unused</p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onViewDetail}
      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-gray-300 transition-all text-left w-full cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 leading-tight">{group.cluster}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{group.vehicleVariant}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0 bg-blue-100 text-blue-700">TCT</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Callsign</p>
          <p className="text-xs font-bold text-gray-800">{group.callsign}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Trainees</p>
          <p className="text-xs font-bold text-gray-800">{group.trainees.length}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {group.trainees.map((t, i) => <RoleBadge key={i} role={t.role} />)}
      </div>
    </button>
  );
}

const DETAIL_GRID = "68px 1fr 108px 52px 70px 70px";

function ClusterDetailModal({
  group, index, total, onClose, onPrev, onNext,
}: { group: ClusterGroup; index: number; total: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  return (
    <Modal open onClose={onClose} width="760px">
      <div className="flex items-center gap-4 mb-6 -mt-1 pr-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold bg-blue-100 text-blue-700">
          TCT
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800">{group.cluster}</h3>
          <p className="text-sm text-gray-500">
            {group.vehicleVariant} &bull; Callsign: <span className="font-semibold text-gray-700">{group.callsign}</span>
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {group.trainees.length} {group.trainees.length === 1 ? "Trainee" : "Trainees"}
        </span>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid px-4 py-2.5 bg-gray-50 border-b border-gray-200" style={{ gridTemplateColumns: DETAIL_GRID }}>
          {["Role", "Name", "Service ID", "Rank", "Callsign", "Unit"].map((h) => (
            <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>
        {group.trainees.map((t, i) => (
          <div key={i} className="grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors" style={{ gridTemplateColumns: DETAIL_GRID }}>
            <div><RoleBadge role={t.role} /></div>
            <span className="text-sm text-gray-800 pr-4">{t.name}</span>
            <span className="text-xs font-mono text-gray-600">{t.svcId}</span>
            <span className="text-xs text-gray-700">{t.rank}</span>
            <span className="text-xs text-gray-600">{t.callsign ?? "—"}</span>
            <span className="text-xs text-gray-700">{t.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-100">
        <button type="button" onClick={onPrev} disabled={index === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-medium text-gray-500 tabular-nums min-w-[48px] text-center">
          {index + 1} <span className="text-gray-300">/</span> {total}
        </span>
        <button type="button" onClick={onNext} disabled={index === total - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>
    </Modal>
  );
}

export function TCTDetailListTab({ status = "Upcoming" }: { status?: string }) {
  const [scenarioId, setScenarioId] = useState(TCT_CLUSTER_SCENARIOS[2].id); // default: "64 Clusters"
  const scenario = TCT_CLUSTER_SCENARIOS.find((s) => s.id === scenarioId) ?? TCT_CLUSTER_SCENARIOS[2];

  const capacity = scenario.clusterCount * scenario.rolesPerCluster;
  const batchCount = Math.ceil(scenario.totalTrainees / capacity);
  const lastBatchSize = scenario.totalTrainees - (batchCount - 1) * capacity;
  const allBatches = useMemo(
    () => Array.from({ length: batchCount }, (_, i) => buildClusterBatch(scenario, i)),
    [scenario, batchCount],
  );

  const [activeBatch, setActiveBatch] = useState(0);
  const [gridPage, setGridPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null); // index within active batch's cluster array

  const batchGroups = allBatches[activeBatch] ?? allBatches[0] ?? [];
  const batchUsedCount = batchGroups.filter((g) => g.trainees.length > 0).length;
  const batchTraineeCount = batchGroups.reduce((s, g) => s + g.trainees.length, 0);
  const gridPageCount = Math.ceil(batchGroups.length / CLUSTERS_PER_PAGE);

  // Search is scoped to the active batch's clusters — clusters are reused
  // across batches, so a global search would surface the same cluster id
  // from every batch with no way to tell them apart.
  const searching = search.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!searching) return [];
    const q = search.trim().toLowerCase();
    return batchGroups
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => g.trainees.length > 0 && (
        g.cluster.toLowerCase().includes(q) ||
        g.callsign.toLowerCase().includes(q) ||
        g.vehicleVariant.toLowerCase().includes(q)
      ));
  }, [search, batchGroups, searching]);

  const pageGroups = batchGroups
    .map((g, idx) => ({ g, idx }))
    .slice(gridPage * CLUSTERS_PER_PAGE, (gridPage + 1) * CLUSTERS_PER_PAGE);

  const displayGroups = searching ? searchResults : pageGroups;
  const totalTrainees = allBatches.reduce((s, b) => s + b.reduce((ss, g) => ss + g.trainees.length, 0), 0);

  return (
    <div className="space-y-5">
      {["Ongoing", "Completed"].includes(status) && (
        <div className="bg-white rounded-xl border border-gray-200 flex items-center divide-x divide-gray-100 overflow-hidden">
          <div className="flex flex-col justify-center px-4 py-3 flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 leading-tight">TCT Training Session</p>
            <p className="text-xs text-gray-400 mt-0.5">{scenario.clusterCount} Clusters &bull; {batchCount} {batchCount === 1 ? "Batch" : "Batches"}</p>
          </div>
          <div className="flex flex-col justify-center px-4 py-3 shrink-0">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Total Trainees</p>
            <p className="text-xs font-semibold text-gray-800">{totalTrainees}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 shrink-0">
            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <UserCheck size={13} className="text-green-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pass</p>
              <p className="text-xs font-bold text-gray-800">—</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 shrink-0">
            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <UserX size={13} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fail</p>
              <p className="text-xs font-bold text-gray-800">—</p>
            </div>
          </div>
          <div className="flex items-center px-4 py-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
              <Clock size={12} className="text-blue-600 flex-shrink-0" />
              <span className="text-xs font-bold text-blue-700">In Progress</span>
            </div>
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-800">
          Detail List{" "}
          <span className="text-gray-400 font-normal">
            ({scenario.clusterCount} Clusters &bull; {totalTrainees} Trainees &bull; {batchCount} {batchCount === 1 ? "Batch" : "Batches"})
          </span>
        </h3>
      </div>

      {/* Batch capacity formula bar */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-gray-800">{scenario.clusterCount} clusters</span>
          <span className="text-gray-400 font-medium">×</span>
          <span className="font-bold text-gray-800">{scenario.rolesPerCluster} roles/cluster</span>
          <span className="text-gray-400 font-medium">=</span>
          <span className="font-bold text-brand-primary">{capacity} capacity</span>
        </div>
        <div className="w-px h-4 bg-amber-300 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-gray-800">{scenario.totalTrainees} trainees</span>
          <span className="text-gray-500">÷ {capacity}</span>
          <span className="text-gray-400 font-medium">=</span>
          <span className="font-bold text-brand-primary">
            {batchCount} {batchCount === 1 ? "batch" : "batches"}
          </span>
          {batchCount > 1 && (
            <span className="text-xs text-gray-400 ml-1">(last batch: {lastBatchSize} trainees)</span>
          )}
        </div>
      </div>

      {/* Batch tabs — a batch is a "Details" group; every batch reuses the same cluster pool */}
      {batchCount > 1 && (
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start flex-wrap">
          {allBatches.map((_, bIdx) => {
            const isPartial = bIdx === batchCount - 1 && lastBatchSize < capacity;
            const traineesInTab = bIdx < batchCount - 1 ? capacity : lastBatchSize;
            const isActive = activeBatch === bIdx;
            return (
              <button
                key={bIdx}
                type="button"
                onClick={() => { setActiveBatch(bIdx); setGridPage(0); setSearch(""); setSelected(null); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700",
                )}
              >
                Batch {bIdx + 1}
                {isPartial && <span className={cn("text-[9px] font-bold leading-none", isActive ? "text-amber-600" : "text-amber-400")}>partial</span>}
                <span className={cn("inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[9px] font-bold",
                  isActive ? (isPartial ? "bg-amber-500 text-white" : "bg-brand-primary text-white") : "bg-gray-200 text-gray-500")}>
                  {traineesInTab}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {batchCount === 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-primary text-white">Batch 1</span>
          <span className="text-xs text-gray-500">{batchTraineeCount} trainees &bull; {batchUsedCount} clusters in use</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      )}

      {/* Search + grid pagination — scoped to the active batch only */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          {searching
            ? `${displayGroups.length} cluster${displayGroups.length === 1 ? "" : "s"} match "${search}" in this batch`
            : `${batchUsedCount} of ${scenario.clusterCount} clusters in this batch are in use`}
        </p>
        <div className="relative w-56">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cluster or callsign"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {displayGroups.length === 0 ? (
          <div className="col-span-4 text-center text-sm text-gray-400 py-10">No clusters match your search.</div>
        ) : (
          displayGroups.map(({ g, idx }) => (
            <ClusterCard key={g.cluster} group={g} onViewDetail={() => setSelected(idx)} />
          ))
        )}
      </div>

      {/* Grid pagination — cosmetic windowing only, not a data/batch boundary */}
      {!searching && gridPageCount > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: gridPageCount }, (_, p) => (
            <button
              key={p}
              type="button"
              onClick={() => setGridPage(p)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                gridPage === p ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-100",
              )}
            >
              {p + 1}
            </button>
          ))}
        </div>
      )}

      {selected !== null && (() => {
        const activeOnes = batchGroups.filter((g) => g.trainees.length > 0);
        const current = batchGroups[selected];
        const currentPos = activeOnes.indexOf(current);
        return (
          <ClusterDetailModal
            group={current}
            index={currentPos}
            total={activeOnes.length}
            onClose={() => setSelected(null)}
            onPrev={() => {
              if (currentPos > 0) setSelected(batchGroups.indexOf(activeOnes[currentPos - 1]));
            }}
            onNext={() => {
              if (currentPos < activeOnes.length - 1) setSelected(batchGroups.indexOf(activeOnes[currentPos + 1]));
            }}
          />
        );
      })()}

      <ClusterScenarioSwitcher
        value={scenarioId}
        onChange={(id) => { setScenarioId(id); setActiveBatch(0); setGridPage(0); setSearch(""); setSelected(null); }}
      />
    </div>
  );
}
