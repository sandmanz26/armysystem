import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { attemptPassed, bestAttempt, ordinal, resultOf, type SessionTrainee } from "../session";

const RESULT_TONE: Record<string, BadgeTone> = { Marksman: "info", Passed: "success", Failed: "danger" };

export function ResultBadge({ trainee }: { trainee: SessionTrainee }) {
  const r = resultOf(trainee);
  if (!r) return <span className="text-sm text-default">—</span>;
  return <StatusBadge tone={RESULT_TONE[r]}>{r}</StatusBadge>;
}

export function BestAttemptCell({ trainee }: { trainee: SessionTrainee }) {
  const best = bestAttempt(trainee);
  return <span className="text-sm font-semibold text-default">{best ? `${best.score}/${best.max}` : "--/--"}</span>;
}

// Figma `Sub Table Content Item`: `background/default/soft`, an "Attempts"
// label cell (120 wide) then one `Badge - Attempts (Training Result)` chip per
// attempt — 1st/2nd… (`text/body`), the score (`text/default`), a P/F badge,
// and "Detail N" underneath.
export function AttemptsRow({ trainee }: { trainee: SessionTrainee }) {
  return (
    <div className="flex items-center border-b border-invert-default bg-default-soft">
      {/* Figma `Live Results` (5552:216821): "All attempts" + the rule for what counts. */}
      <div className="flex w-[220px] flex-shrink-0 flex-col gap-0.5 px-5 py-3">
        <span className="text-sm text-default">All attempts</span>
        <span className="text-xs text-body">Newest at the bottom. The best attempt counts.</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-3">
        {trainee.attempts.length === 0 ? (
          <span className="text-sm font-semibold text-default">--/--</span>
        ) : (
          trainee.attempts.map((a, i) => (
            <div key={i} className="flex flex-col gap-0.5 rounded border border-invert-default bg-surface-lv1 px-3 py-[3px]">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <span className="text-body">{ordinal(i + 1)}</span>
                <span className="text-default">{a.score}/{a.max}</span>
                <StatusBadge tone={attemptPassed(a) ? "success" : "danger"}>{attemptPassed(a) ? "P" : "F"}</StatusBadge>
              </div>
              <span className="text-xs text-body">Detail {a.detailNumber}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
