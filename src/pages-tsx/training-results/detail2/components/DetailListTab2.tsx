import { useState } from "react";
import { Eye } from "lucide-react";
import { GroupDetailPage } from "./GroupDetailPage";
import { DETAIL } from "../constants";

// Reuses the same visual grammar as the Booking Detail "Detail List" tab
// (capacity formula bar + station cards with info tiles) instead of the
// bespoke 3-column card grid the old Training Results detail page used —
// same read-only data, nicer component.
interface DetailListTab2Props {
  courseware: string;
}

const TRAINEES_PER_STATION = 10;

// Lanes aren't necessarily contiguous per station (a station's trainees can
// land on lane 1, 2, 3 and 8, say) — so instead of a canned "Lane 1 – 3"
// string, derive the actual set of lane numbers a station's trainees used
// and format them as "1, 2, 3 & 8".
function laneNumbers(trainees: { lane: string }[]): number[] {
  return [...new Set(trainees.map((t) => parseInt(t.lane.replace(/\D/g, ""), 10)))]
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

function formatLaneList(nums: number[]): string {
  if (nums.length === 0) return "-";
  if (nums.length === 1) return String(nums[0]);
  return `${nums.slice(0, -1).join(", ")} & ${nums[nums.length - 1]}`;
}

export function DetailListTab2({ courseware }: DetailListTab2Props) {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);

  const stationCount = DETAIL.details.length;
  const capacity      = stationCount * TRAINEES_PER_STATION;
  const batchCount    = Math.ceil(DETAIL.totalTrainees / capacity);

  if (selectedGroupIdx !== null) {
    return (
      <GroupDetailPage
        groups={DETAIL.details}
        initialGroupIndex={selectedGroupIdx}
        courseware={courseware}
        onBack={() => setSelectedGroupIdx(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-5">
      <h3 className="text-sm font-semibold text-gray-800">
        Detail List{" "}
        <span className="text-gray-400 font-normal">
          ({stationCount} Stations &bull; {DETAIL.totalTrainees} Trainees &bull; {batchCount} {batchCount === 1 ? "Batch" : "Batches"})
        </span>
      </h3>

      {/* Capacity formula bar — same pattern as MST/TCT's Detail List tabs */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-gray-800">{stationCount} stations</span>
          <span className="text-gray-400 font-medium">×</span>
          <span className="font-bold text-gray-800">{TRAINEES_PER_STATION} trainees/station</span>
          <span className="text-gray-400 font-medium">=</span>
          <span className="font-bold text-brand-primary">{capacity} capacity</span>
        </div>
        <div className="w-px h-4 bg-amber-300 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-gray-800">{DETAIL.totalTrainees} trainees</span>
          <span className="text-gray-500">÷ {capacity}</span>
          <span className="text-gray-400 font-medium">=</span>
          <span className="font-bold text-brand-primary">
            {batchCount} {batchCount === 1 ? "batch" : "batches"}
          </span>
        </div>
      </div>

      {/* Station cards */}
      <div className="grid grid-cols-3 gap-4">
        {DETAIL.details.map((detail, idx) => {
          const stationTrainees = DETAIL.trainees.filter((_, i) => Math.floor(i / TRAINEES_PER_STATION) === idx);
          const stationPassed = stationTrainees.filter(t => t.resultLabel !== "FAILED").length;
          const passPct = stationTrainees.length > 0 ? Math.round((stationPassed / stationTrainees.length) * 100) : 0;
          const laneLabel = formatLaneList(laneNumbers(stationTrainees));

          return (
            <button
              key={detail.id}
              type="button"
              onClick={() => setSelectedGroupIdx(idx)}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 text-left w-full cursor-pointer transition-all hover:shadow-md hover:border-brand-primary/40 hover:bg-gray-50/60"
            >
              {/* No repeated "WPT" tag — this page is always WPT. The corner slot
                  instead holds a plain eye icon as a visual "view detail" hint —
                  the whole card is clickable, not just the icon, so a grid of
                  many stations doesn't turn into a wall of full-width buttons
                  or require pixel-precise clicking on a small icon. */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-base font-bold text-gray-900 leading-tight">{detail.id}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{detail.weapon}</p>
                </div>
                <Eye size={15} className="text-gray-400 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Lane</p>
                  <p className="text-xs font-bold text-gray-800">{laneLabel}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Trainees</p>
                  <p className="text-xs font-bold text-gray-800">{detail.traineesCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Avg Score</p>
                  <p className="text-xs font-bold text-gray-800">{detail.avgScore}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Pass</p>
                  <p className="text-xs font-bold text-green-600">{passPct}%</p>
                </div>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${passPct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
