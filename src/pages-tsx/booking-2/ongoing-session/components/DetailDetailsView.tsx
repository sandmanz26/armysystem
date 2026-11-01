import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";
import { detailsOf, stationsOf, type OngoingSession, type SessionDetail, type SessionTrainee } from "../session";
import { AttemptsRow, BestAttemptCell, ResultBadge } from "./ResultCells";
import { SearchBox, matchesSearch } from "./LiveResultsView";

interface LaneRow {
  lane: number;
  trainee: SessionTrainee | null;
}

const dash = <span className="text-sm text-default">—</span>;

function NavButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold transition-colors",
        disabled ? "cursor-not-allowed text-disabled" : "text-default hover:bg-default-soft",
      )}
    >
      {children}
    </button>
  );
}

// Figma `Detail List - Details` (5551:211366): one detail at a time, every
// lane of the station listed — empty lanes as dashes.
export function DetailDetailsView({ session, detailId, onChangeDetail }: { session: OngoingSession; detailId: string; onChangeDetail: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const detail = session.details.find((d) => d.id === detailId);
  const sequence = useMemo<SessionDetail[]>(() => {
    if (!detail) return [];
    return stationsOf(session, detail.type).flatMap((st) => detailsOf(session, st.label));
  }, [session, detail]);

  const rows = useMemo<LaneRow[]>(() => {
    if (!detail) return [];
    const st = session.stations.find((s) => s.label === detail.station);
    const byLane = new Map(detail.assignments.map((a) => [a.lane, session.trainees.find((t) => t.id === a.traineeId) ?? null]));
    return Array.from({ length: st?.laneCount ?? 15 }, (_, i) => ({ lane: i + 1, trainee: byLane.get(i + 1) ?? null }))
      .filter((r) => !search || (r.trainee && matchesSearch(r.trainee, search)));
  }, [session, detail, search]);

  const columns = useMemo<ColumnDef<LaneRow, any>[]>(() => [
    { id: "no", width: 64, minWidth: 64, maxWidth: 64, header: () => "No.", cell: ({ row }) => <span className="text-sm text-body">{row.original.lane}</span> },
    { id: "rank", width: 80, header: () => "Rank", cell: ({ row }) => (row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.rank}</span> : dash) },
    { id: "name", width: 210, header: () => "Name", cell: ({ row }) => (row.original.trainee ? <span className="text-sm font-semibold text-default">{row.original.trainee.name}</span> : dash) },
    { id: "svcId", width: 210, header: () => "Service ID", cell: ({ row }) => (row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.svcId}</span> : dash) },
    { id: "lane", width: 210, header: () => "Lane", cell: ({ row }) => <span className="text-sm text-default">Lane {row.original.lane}</span> },
    { id: "weapon", width: 210, header: () => "Weapon Type(s)", cell: ({ row }) => (row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.weapon.join(", ")}</span> : dash) },
    { id: "best", width: 210, header: () => "Best Attempt", cell: ({ row }) => (row.original.trainee ? <BestAttemptCell trainee={row.original.trainee} /> : dash) },
    { id: "result", width: 120, header: () => "Result", cell: ({ row }) => (row.original.trainee ? <ResultBadge trainee={row.original.trainee} /> : dash) },
    { id: "actions", width: 80, minWidth: 80, maxWidth: 80, header: () => "", cell: () => null },
  ], []);

  if (!detail) return null;
  const idx = sequence.findIndex((d) => d.id === detail.id);
  const n = detail.assignments.length;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-default">Detail List</h2>
      <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
        <div className="relative flex items-center justify-between p-5">
          <NavButton disabled={idx <= 0} onClick={() => onChangeDetail(sequence[idx - 1].id)}>
            <ArrowLeft size={16} />
            Previous
          </NavButton>
          <span className="pointer-events-none absolute inset-x-0 text-center text-sm font-semibold text-default">
            {detail.station} · Detail {detail.number}
          </span>
          <NavButton disabled={idx >= sequence.length - 1} onClick={() => onChangeDetail(sequence[idx + 1].id)}>
            Next
            <ArrowRight size={16} />
          </NavButton>
        </div>
        <div className="h-px bg-divider" />
        <div className="flex items-center justify-between gap-5 p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-default">Detail {detail.number}</span>
            <span className="text-xs text-body">{n} trainee{n === 1 ? "" : "s"}</span>
          </div>
          <SearchBox value={search} onChange={setSearch} placeholder="Search by name, Service ID, rank, lane..." className="w-[268px]" />
        </div>
        <TableCustom<LaneRow>
          columns={columns}
          data={rows}
          autoScrollTable
          actionSticky
          nestedComponentButtonCondition={(row) => (row.original.trainee ? {} : { disabled: true })}
          getNestedComponent={(row) => (row.original.trainee ? <AttemptsRow trainee={row.original.trainee} /> : null)}
        />
      </div>
    </div>
  );
}
