import { useMemo, useState } from "react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { Check, CircleCheck, CircleX, Target } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { bestAttempt, resultOf, SCORE_MAX, type OngoingSession, type SessionTrainee } from "../session";
import { SessionHeader } from "./SessionHeader";

type Ctx = CellContext<SessionTrainee, any>;

const PER_PAGE = 10;

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  // Figma: "10 Nov 2025 08:01 AM" — fixed 3-letter months (en-GB gives "Sept").
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

function formatTotal(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}

// Figma `Chart - Performance` 160×160, inner radius 60%, Marksman from 12
// o'clock clockwise, then Passed, then Failed.
function Donut({ marksman, passed, failed, total }: { marksman: number; passed: number; failed: number; total: number }) {
  const size = 160;
  const r = 64;
  const c = 2 * Math.PI * r;
  const segs = [
    { n: marksman, color: "rgb(var(--color-background-info-default))" },
    { n: passed, color: "rgb(var(--color-background-success-default))" },
    { n: failed, color: "rgb(var(--color-background-danger-default))" },
  ];
  let acc = 0;
  return (
    <div className="relative h-40 w-40">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 -rotate-90">
        <circle cx={80} cy={80} r={r} fill="none" stroke="rgb(var(--color-background-default-default))" strokeWidth={32} />
        {total > 0 && segs.map((s, i) => {
          const len = (s.n / total) * c;
          const el = <circle key={i} cx={80} cy={80} r={r} fill="none" stroke={s.color} strokeWidth={32} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-caption">Total</span>
        <span className="text-3xl font-bold text-default">{total}</span>
      </div>
    </div>
  );
}

// Figma `Session Ended` (5820:31459) and `Session Ended - if Failed = 0`
// (7122:181316).
export function SessionEndedView({
  session,
  onGoToBooking,
  onViewResults,
}: {
  session: OngoingSession;
  onGoToBooking: () => void;
  onViewResults: () => void;
}) {
  const [page, setPage] = useState(1);
  const total = session.trainees.length;
  const count = (k: "Marksman" | "Passed" | "Failed") => session.trainees.filter((t) => resultOf(t) === k).length;
  const m = count("Marksman"), p = count("Passed"), f = count("Failed");
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const failed = useMemo(() => session.trainees.filter((t) => resultOf(t) === "Failed"), [session.trainees]);
  const paged = failed.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const stations = session.stations.map((s) => s.label);
  const endedAt = session.endedAt ?? Date.now();

  const columns = [
    { id: "no", width: 64, header: () => "No.", cell: ({ row }: Ctx) => <span className="text-sm text-body">{(page - 1) * PER_PAGE + row.index + 1}</span> },
    { id: "rank", width: 80, header: () => "Rank", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.rank}</span> },
    { id: "name", width: 152, header: () => "Name", cell: ({ row }: Ctx) => <span className="text-sm font-semibold text-default">{row.original.name}</span> },
    { id: "svcId", width: 152, header: () => "Service ID", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.svcId}</span> },
    {
      id: "score", width: 200, header: () => "Score",
      cell: ({ row }: Ctx) => {
        const b = bestAttempt(row.original);
        const score = b?.score ?? 0;
        return (
          <div className="flex items-center gap-4">
            <span className="w-10 text-sm font-semibold text-default">{score}/{b?.max ?? SCORE_MAX}</span>
            <div className="h-2.5 w-24 overflow-hidden rounded-full bg-disabled">
              <div className="h-full rounded-full bg-primary-default" style={{ width: `${(score / (b?.max ?? SCORE_MAX)) * 100}%` }} />
            </div>
          </div>
        );
      },
    },
    { id: "result", width: 120, header: () => "Result", cell: () => <StatusBadge tone="danger">Failed</StatusBadge> },
  ] as unknown as ColumnDef<SessionTrainee, any>[];

  const legend = [
    { label: "MARKSMAN", n: m, Icon: Target, box: "bg-info-invert-default", tone: "text-info" },
    { label: "PASSED", n: p, Icon: CircleCheck, box: "bg-success-invert-default", tone: "text-success" },
    { label: "FAILED", n: f, Icon: CircleX, box: "bg-danger-invert-default", tone: "text-danger" },
  ];

  return (
    <div className="flex h-full flex-col">
      <SessionHeader title="Completion of Training" subtitle={null} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-6">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success-invert-default">
              <Check size={56} className="text-success" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-xl font-bold text-default">Session completed</h2>
              <p className="text-sm text-body">All results have been recorded for this booking.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onGoToBooking} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
                Go to Booking Details
              </button>
              <button type="button" onClick={onViewResults} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors">
                View Training Results
              </button>
            </div>
          </div>

          <div className="h-px bg-divider" />

          <div className="flex flex-col gap-5 rounded-xl border border-invert-default bg-surface-lv1 p-5">
            <span className="text-base font-semibold text-default">{session.bookingName}</span>
            <div className="grid grid-cols-3 gap-x-6 gap-y-5">
              {[
                ["Booking ID", `#${session.bookingCode}`],
                ["Courseware", session.courseware],
                [`Base Stations (${stations.length})`, stations.join(", ")],
                ["Session Start Time", formatDateTime(session.startedAt)],
                ["Session End Time", formatDateTime(endedAt)],
                ["Total Duration", formatTotal(endedAt - session.startedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-xs text-body">{k}</span>
                  <span className="text-sm font-semibold text-default">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex w-[240px] flex-shrink-0 flex-col gap-5 rounded-xl border border-invert-default bg-surface-lv1 p-5">
              <span className="text-base font-semibold text-default">Performance Chart</span>
              <div className="flex justify-center">
                <Donut marksman={m} passed={p} failed={f} total={total} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-default">Result Legend</span>
                <div className="overflow-hidden rounded-xl border border-invert-default">
                  {legend.map(({ label, n, Icon, box, tone }, i) => (
                    <div key={label} className={cn("flex items-center gap-4 bg-surface-lv2 px-4 py-3", i > 0 && "border-t border-invert-default")}>
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", box)}>
                        <Icon size={16} className={tone} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={cn("text-xs font-semibold", tone)}>{label}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-default">{n}</span>
                          <span className="text-xs text-body">({pct(n)}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
              <div className="flex items-center gap-2 p-5 text-base font-semibold">
                <span className="text-default">Failed Trainees</span>
                <span className="text-body">{failed.length}</span>
              </div>
              <TableCustom<SessionTrainee>
                columns={columns}
                data={paged}
                autoScrollTable
                emptySubtitle="This table will be automatically updated once users take action."
              />
              <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={failed.length} setCurrentPage={setPage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
