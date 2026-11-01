import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Trophy, CheckCircle2, XCircle, Target } from "lucide-react";
import { DETAIL } from "../constants";
import { cn } from "@/lib/utils";

// ── Result badge ──────────────────────────────────────────────────────────────
function ResultBadge({ label }) {
  if (!label || label === "-") return <span className="text-xs text-gray-300">—</span>;
  const config = {
    MARKSMAN: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: <Trophy size={10} /> },
    PASSED:   { bg: "bg-green-50 border-green-200",  text: "text-green-700",  icon: <CheckCircle2 size={10} /> },
    FAILED:   { bg: "bg-red-50 border-red-200",      text: "text-red-600",    icon: <XCircle size={10} /> },
  }[label] ?? { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: null };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold", config.bg, config.text)}>
      {config.icon}
      {label}
    </span>
  );
}

// ── Score display ─────────────────────────────────────────────────────────────
function Score({ value, suffix, muted }) {
  if (!value || value === "--/--") return <span className="text-xs text-gray-300">—/—</span>;
  const [score, total] = value.split("/").map(s => s.trim());
  return (
    <span className={cn("text-sm font-bold", muted ? "text-gray-400" : "text-gray-800")}>
      {score}
      <span className="text-gray-400 font-normal">/{total}</span>
      {suffix && <span className="text-xs ml-1 text-brand-primary font-bold">({suffix})</span>}
    </span>
  );
}

// ── Main DetailView ───────────────────────────────────────────────────────────
export function DetailView({ detailIndex, onBack, courseware }) {
  const [currentIdx, setCurrentIdx] = useState(detailIndex ?? 0);
  const totalDetails = DETAIL.details.length;
  const detail = DETAIL.details[currentIdx];

  // Trainees for this station
  const stationTrainees = DETAIL.trainees.filter((_, i) => Math.floor(i / 10) === currentIdx);
  const activeTrainees = stationTrainees.filter(t => t.name && t.name !== "-");
  const passedCount = stationTrainees.filter(t => t.resultLabel !== "FAILED" && t.resultLabel).length;
  const failedCount = stationTrainees.filter(t => t.resultLabel === "FAILED").length;

  if (!detail) return null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* ── Top navigation bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="font-medium">Back to Detail List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-gray-400 px-2">{currentIdx + 1} / {totalDetails}</span>
          <button
            onClick={() => setCurrentIdx(i => Math.min(totalDetails - 1, i + 1))}
            disabled={currentIdx === totalDetails - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        {/* ── Header card ── */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Detail {currentIdx + 1}
                <span className="text-sm font-normal text-gray-400 ml-2">({detail.traineesCount} Trainees)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">{courseware ?? DETAIL.courseware}</p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                <p className="text-lg font-bold text-blue-700">{detail.traineesCount}</p>
                <p className="text-[10px] text-blue-500 font-medium">Trainees</p>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                <p className="text-lg font-bold text-green-700">{passedCount}</p>
                <p className="text-[10px] text-green-500 font-medium">Passed</p>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                <p className="text-lg font-bold text-red-600">{failedCount}</p>
                <p className="text-[10px] text-red-400 font-medium">Failed</p>
              </div>
            </div>
          </div>

          {/* Detail info row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Station</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{detail.id}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Weapon Type</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{detail.weapon}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Lane</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{detail.lane}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Avg Score</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{detail.avgScore}</p>
            </div>
          </div>
        </div>

        {/* ── Trainee results table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Trainee Results
              <span className="ml-2 text-xs font-normal text-gray-400">({activeTrainees.length} active)</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-200 text-[10px] font-bold text-yellow-700">
                <Trophy size={9} /> Marksman
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[10px] font-bold text-green-700">
                <CheckCircle2 size={9} /> Passed
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-600">
                <XCircle size={9} /> Failed
              </span>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-50/60">
                {["No", "Rank", "Name", "Service ID", "Lane", "Weapon", "Best Attempt", "Course Result"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-brand-primary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stationTrainees.map((t, i) => {
                const isEmpty = !t.name || t.name === "-";
                return (
                  <tr
                    key={i}
                    className={cn(
                      "border-t border-gray-50 transition-colors",
                      isEmpty ? "opacity-40" : "hover:bg-gray-50/70"
                    )}
                  >
                    <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3">
                      {!isEmpty ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">{t.rank}</span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{isEmpty ? <span className="text-gray-300 text-xs">—</span> : t.name}</td>
                    <td className="px-5 py-3 font-mono text-gray-500 text-xs">{isEmpty ? <span className="text-gray-300">—</span> : t.svcId}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{t.lane ?? `Lane ${i + 1}`}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{isEmpty ? <span className="text-gray-300">—</span> : t.weaponType ?? detail.weapon}</td>
                    <td className="px-5 py-3">
                      {isEmpty ? <span className="text-gray-300 text-xs">—/—</span> : (
                        <div className="flex items-center gap-1.5">
                          <Target size={12} className="text-gray-300" />
                          <Score value={t.performance} suffix="P" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEmpty ? (
                        <span className="text-gray-300 text-xs">—/—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Score value={t.courseResults ?? t.performance} suffix="M" />
                          <ResultBadge label={t.resultLabel} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
