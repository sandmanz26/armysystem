import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetailEntry } from "../types";

interface TraineeAttempt {
  no: number;
  label: string;
  score: number;
  max: number;
  passed: boolean;
}

interface TraineeRow {
  no: number;
  rank: string;
  name: string;
  svcId: string;
  lane: string;
  weapon: string;
  bestScore: number;
  maxScore: number;
  passed: boolean;
  resultLabel: "MARKSMAN" | "PASSED" | "FAILED";
  attempts: TraineeAttempt[];
}

const ATTEMPT_LABELS = ["1st Attempt", "2nd Attempt", "3rd Attempt"];

function makeTrainees(group: DetailEntry, groupIdx: number): TraineeRow[] {
  const names = [
    "Charlotte Hall", "Fatimah Osman", "Aisha binti Abdul Rahim", "Ibrahim Abdul Halim",
    "Rizwan binti Mohamad Sulaiman", "Siti Ismail", "Olivia Thompson", "Sophia Davis",
    "Elijah Lewis", "Mason Rodriguez",
    "Ava Martinez", "Lucas Anderson", "Emma Taylor", "Benjamin White", "Harper Brown",
    "Michael Davis", "Amelia Garcia", "Daniel Miller", "Evelyn Davis", "James Rodriguez",
    "Abigail Martinez", "Matthew Anderson", "Mia Taylor", "David White", "Emily Brown",
    "Joseph Garcia", "Scarlett Miller", "Samuel Davis", "Chloe Rodriguez", "Alexander Martinez",
  ];
  const laneMap = [
    ["Lane 1", "Lane 2", "Lane 3"],
    ["Lane 4", "Lane 5", "Lane 6"],
    ["Lane 7", "Lane 8", "Lane 9"],
  ];
  const lanes = laneMap[groupIdx] ?? ["Lane 1", "Lane 2", "Lane 3"];
  const maxScore = 20;
  const passMark = 13;

  return Array.from({ length: group.traineesCount }, (_, i) => {
    const globalIdx = groupIdx * 10 + i;
    const numAttempts = (i % 3) + 1;
    const attempts: TraineeAttempt[] = [];

    let prevScore = 5 + (i % 8);
    for (let a = 0; a < numAttempts; a++) {
      const score = Math.min(maxScore, prevScore + (a === 0 ? 0 : 2 + (i % 4)));
      attempts.push({
        no: a + 1,
        label: ATTEMPT_LABELS[a],
        score,
        max: maxScore,
        passed: score >= passMark,
      });
      prevScore = score;
    }

    const best = attempts[attempts.length - 1];
    const resultLabel: TraineeRow["resultLabel"] =
      best.score >= 18 ? "MARKSMAN" : best.score >= passMark ? "PASSED" : "FAILED";

    return {
      no: i + 1,
      rank: globalIdx % 3 === 0 ? "3SG" : "REC",
      name: names[globalIdx] ?? `Trainee ${globalIdx + 1}`,
      svcId: `****${String(globalIdx + 1).padStart(3, "0")}${String.fromCharCode(65 + (globalIdx % 26))}`,
      lane: lanes[i % lanes.length],
      weapon: group.weapon,
      bestScore: best.score,
      maxScore,
      passed: best.passed,
      resultLabel,
      attempts,
    };
  });
}

function ResultBadge({ label }: { label: TraineeRow["resultLabel"] }) {
  const cls =
    label === "MARKSMAN"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
      : label === "PASSED"
      ? "bg-green-50 text-green-700 border border-green-100"
      : "bg-red-50 text-red-700 border border-red-100";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", cls)}>
      {label}
    </span>
  );
}

interface Props {
  groups: DetailEntry[];
  initialGroupIndex: number;
  courseware: string;
  onBack: () => void;
}

export function GroupDetailPage({ groups, initialGroupIndex, onBack }: Props) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const group = groups[groupIdx];
  const trainees = makeTrainees(group, groupIdx);

  const filtered = search.trim()
    ? trainees.filter((t) => {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.svcId.toLowerCase().includes(q) ||
          t.rank.toLowerCase().includes(q) ||
          t.lane.toLowerCase().includes(q)
        );
      })
    : trainees;

  const toggleRow = (no: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  };

  const goTo = (idx: number) => {
    setGroupIdx(idx);
    setExpandedRows(new Set());
    setSearch("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-nav bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="w-px h-5 bg-gray-200" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(groupIdx - 1)}
            disabled={groupIdx === 0}
            className={cn(
              "flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors",
              groupIdx === 0
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="px-4 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
            <span className="text-sm font-bold text-brand-primary">{group.id}</span>
            <span className="text-xs text-gray-500 ml-1.5">({group.traineesCount} Trainees)</span>
          </div>

          <button
            type="button"
            onClick={() => goTo(groupIdx + 1)}
            disabled={groupIdx === groups.length - 1}
            className={cn(
              "flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors",
              groupIdx === groups.length - 1
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>

        <div className="ml-auto text-xs text-gray-400">
          {groupIdx + 1} of {groups.length}
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, Service ID, rank, lane…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {search && (
              <span className="text-xs text-gray-400 flex-shrink-0">
                {filtered.length} of {trainees.length} trainees
              </span>
            )}
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[36px_80px_48px_1fr_140px_100px_100px_110px_36px] gap-0 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            {["No", "Station", "Rank", "Name / Service ID", "Lane", "Weapon", "Best Score", "Result", ""].map((h) => (
              <div key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No trainees match your search.</div>
          ) : (
            filtered.map((t) => {
              const isExpanded = expandedRows.has(t.no);
              return (
                <div key={t.no} className="border-b border-gray-50 last:border-0">
                  {/* Main row */}
                  <div
                    className={cn(
                      "grid grid-cols-[36px_80px_48px_1fr_140px_100px_100px_110px_36px] gap-0 px-4 py-3 items-center cursor-pointer transition-colors",
                      isExpanded ? "bg-gray-50/80" : "hover:bg-gray-50/60"
                    )}
                    onClick={() => toggleRow(t.no)}
                  >
                    <div className="text-xs text-gray-400 font-mono px-1">{t.no}</div>
                    <div className="px-1">
                      <span className="text-xs font-semibold text-gray-500">{group.id}</span>
                    </div>
                    <div className="px-1">
                      <span className="text-[11px] font-medium text-gray-600">{t.rank}</span>
                    </div>
                    <div className="px-1">
                      <div className="text-sm font-semibold text-gray-800 leading-tight">{t.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{t.svcId}</div>
                    </div>
                    <div className="px-1 text-xs text-gray-600">{t.lane}</div>
                    <div className="px-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-semibold">
                        {t.weapon}
                      </span>
                    </div>
                    <div className="px-1 text-sm font-bold text-gray-800 tabular-nums">
                      {t.bestScore} / {t.maxScore}
                    </div>
                    <div className="px-1">
                      <ResultBadge label={t.resultLabel} />
                    </div>
                    <div className="flex items-center justify-center">
                      {isExpanded
                        ? <ChevronUp size={14} className="text-gray-400" />
                        : <ChevronDown size={14} className="text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded — compact past attempts only */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/40 px-6 py-2.5 flex items-center gap-4">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">
                        Attempts
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-end flex-1">
                        {t.attempts.map((att) => (
                          <div
                            key={att.no}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-100 shadow-sm"
                          >
                            <span className="text-[10px] text-gray-400 font-mono">{att.no}.</span>
                            <span className="text-[11px] text-gray-500">{att.label.replace(" Attempt", "")}</span>
                            <span className="text-xs font-bold text-gray-800 tabular-nums">{att.score}/{att.max}</span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                              att.passed
                                ? "bg-green-50 text-green-600 border border-green-100"
                                : "bg-red-50 text-red-600 border border-red-100"
                            )}>
                              {att.passed ? "P" : "F"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
