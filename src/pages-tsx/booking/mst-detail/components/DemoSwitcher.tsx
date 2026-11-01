/**
 * DemoSwitcher — floating switchers for vibe-coding demos.
 *
 * DemoSwitcher:         toggle number of records shown (3 / 5 / 10 / 15).
 * BatchScenarioSwitcher: toggle MST batch scenarios (1 / 2 / 3 batches).
 *
 * NOT production features — do not include in real booking flow requirements.
 */

import { cn } from "@/lib/utils";
import { DraggableFloating } from "@/components/layout/DraggableFloating";

export const DEMO_SIZES = [3, 5, 10, 15] as const;
export type  DemoSize   = typeof DEMO_SIZES[number];

export function DemoSwitcher({
  value,
  onChange,
}: {
  value:    DemoSize;
  onChange: (v: DemoSize) => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-1.5 select-none">
      <span className="text-[10px] text-gray-400 font-medium mr-0.5">Show</span>
      {DEMO_SIZES.map(size => (
        <button
          key={size}
          type="button"
          onClick={() => onChange(size)}
          className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-full transition-all",
            value === size
              ? "bg-brand-primary text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

// ── Batch scenario switcher ────────────────────────────────────────────────────

export interface BatchScenarioDef {
  id:            string;
  label:         string;
  cabinCount:    number;
  rolesPerCabin: number;
  totalTrainees: number;
}

export const MST_BATCH_SCENARIOS: BatchScenarioDef[] = [
  { id: "s1", label: "1 Batch",    cabinCount: 4,  rolesPerCabin: 3, totalTrainees: 12 },
  { id: "s2", label: "2 Batches",  cabinCount: 4,  rolesPerCabin: 3, totalTrainees: 24 },
  { id: "s3", label: "3 Batches",  cabinCount: 4,  rolesPerCabin: 3, totalTrainees: 30 },
  { id: "s4", label: "12 Cabins",  cabinCount: 12, rolesPerCabin: 3, totalTrainees: 120 },
  { id: "s5", label: "Worst Case", cabinCount: 12, rolesPerCabin: 5, totalTrainees: 65 },
];

export function BatchScenarioSwitcher({
  value,
  onChange,
}: {
  value:    string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-1.5 select-none">
      <span className="text-[10px] text-gray-400 font-medium mr-1">Batch Demo</span>
      {MST_BATCH_SCENARIOS.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          title={`${s.cabinCount} cabins × ${s.rolesPerCabin} roles = ${s.cabinCount * s.rolesPerCabin} capacity | ${s.totalTrainees} trainees`}
          className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-full transition-all",
            value === s.id
              ? "bg-brand-primary text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Cluster scenario switcher (TCT) ────────────────────────────────────────────
// Mirrors BatchScenarioSwitcher's data shape exactly: `clusterCount` is TCT's
// equivalent of MST's `cabinCount` — the pool of physical clusters reused by
// *every* batch (up to 64 for TCT vs. ~12-15 cabins for MST) — and `totalTrainees`
// drives how many batches are needed (capacity = clusterCount × rolesPerCluster).
// A batch never shows more clusters than `clusterCount`; when that's 64, the
// Detail List's own search/pagination (in TCTDetailListTab) is what keeps a
// single batch's grid from being overwhelming — this switcher just controls
// the underlying numbers, not the display windowing.

export interface ClusterScenarioDef {
  id:              string;
  label:           string;
  clusterCount:    number;
  rolesPerCluster: number;
  totalTrainees:   number;
}

export const TCT_CLUSTER_SCENARIOS: ClusterScenarioDef[] = [
  { id: "c1", label: "1 Batch",       clusterCount: 8,  rolesPerCluster: 3, totalTrainees: 20  },
  { id: "c2", label: "3 Batches",     clusterCount: 8,  rolesPerCluster: 3, totalTrainees: 60  },
  { id: "c3", label: "64 Clusters",   clusterCount: 64, rolesPerCluster: 3, totalTrainees: 150 },
  { id: "c4", label: "3× 64 Clusters", clusterCount: 64, rolesPerCluster: 3, totalTrainees: 550 },
  // 1 detail per cluster (rolesPerCluster: 1) so capacity == cluster count exactly —
  // "1 batch has 64 clusters" means 64 details per batch, not 192 (64 × 3 roles).
  { id: "c5", label: "3 Full Batches (TCT64)", clusterCount: 64, rolesPerCluster: 1, totalTrainees: 192 },
  { id: "c6", label: "Worst Case",    clusterCount: 64, rolesPerCluster: 5, totalTrainees: 640 },
];

export function ClusterScenarioSwitcher({
  value,
  onChange,
}: {
  value:    string;
  onChange: (id: string) => void;
}) {
  const defaultLeft = Math.max(16, (typeof window !== "undefined" ? window.innerWidth : 1280) / 2 - 260);
  const defaultTop  = Math.max(16, (typeof window !== "undefined" ? window.innerHeight : 900) - 64);

  return (
    <DraggableFloating storageKey="toms_cluster_demo_position" defaultPosition={{ x: defaultLeft, y: defaultTop }}>
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-1.5 select-none">
        <span
          data-drag-handle="true"
          title="Cluster Demo (drag to move)"
          className="text-[10px] text-gray-400 font-medium mr-1 cursor-move"
        >
          Cluster Demo
        </span>
        {TCT_CLUSTER_SCENARIOS.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            title={`${s.clusterCount} clusters × ${s.rolesPerCluster} roles = ${s.clusterCount * s.rolesPerCluster} capacity | ${s.totalTrainees} trainees`}
            className={cn(
              "px-2.5 py-1 text-xs font-bold rounded-full transition-all",
              value === s.id
                ? "bg-brand-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </DraggableFloating>
  );
}
