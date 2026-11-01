import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, SlidersHorizontal } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { cn } from "@/lib/utils";
import { resultOf, stationsOf, type OngoingSession, type SessionTrainee, type StationType } from "../session";
import { AttemptsRow, BestAttemptCell, ResultBadge } from "./ResultCells";
import { EMPTY_FILTER, FilterDrawer, filterCount, matchesFilter, type ResultFilter } from "../modals/FilterDrawer";

const PER_PAGE = 10;

export function UnderlineTabs({ value, onChange }: { value: StationType; onChange: (v: StationType) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-invert-default px-5">
      {(["flat", "cshaped"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors",
            value === t ? "border-primary text-primary" : "border-transparent text-body hover:text-default",
          )}
        >
          {t === "flat" ? "Flat Screen" : "C-Shaped"}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-invert-default bg-surface pl-10 pr-3 text-sm text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused transition-colors"
      />
    </div>
  );
}

export function matchesSearch(t: SessionTrainee, q: string): boolean {
  if (!q) return true;
  const s = q.toLowerCase();
  return [t.name, t.svcId, t.rank, `lane ${t.lane}`].some((v) => v.toLowerCase().includes(s));
}

export function detailNumbersOf(session: OngoingSession, traineeId: string): number[] {
  return session.details.filter((d) => d.assignments.some((a) => a.traineeId === traineeId)).map((d) => d.number);
}

// Figma `Live Results` (5524:452071) + `Action: New Detail` Bulk Select
// (5753:74561): pick trainees for a reshoot detail.
export function LiveResultsView({ session, onCreateDetail }: { session: OngoingSession; onCreateDetail: (ids: string[]) => void }) {
  const [tab, setTab] = useState<StationType>("flat");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ResultFilter>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  const ofType = useMemo(() => session.trainees.filter((t) => t.type === tab), [session.trainees, tab]);
  const rows = useMemo(
    () => ofType.filter((t) => matchesSearch(t, search) && matchesFilter(filter, t, resultOf(t), detailNumbersOf(session, t.id))),
    [ofType, search, filter, session],
  );
  const paged = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const detailNumbers = useMemo(
    () => [...new Set(session.details.filter((d) => d.type === tab).map((d) => d.number))].sort((a, b) => a - b),
    [session.details, tab],
  );

  const pageAll = paged.length > 0 && paged.every((t) => selected.has(t.id));
  const pageSome = paged.some((t) => selected.has(t.id)) && !pageAll;
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const columns = useMemo<ColumnDef<SessionTrainee, any>[]>(() => [
    {
      id: "select", width: 56, minWidth: 56, maxWidth: 56,
      header: () => (
        <Checkbox
          checked={pageAll}
          indeterminate={pageSome}
          onChange={() => setSelected((prev) => {
            const next = new Set(prev);
            paged.forEach((t) => (pageAll ? next.delete(t.id) : next.add(t.id)));
            return next;
          })}
          size={18}
        />
      ),
      cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onChange={() => toggle(row.original.id)} size={18} />,
    },
    { id: "no", width: 64, minWidth: 64, maxWidth: 64, header: () => "No.", cell: ({ row }) => <span className="text-sm text-body">{(page - 1) * PER_PAGE + row.index + 1}</span> },
    { id: "rank", width: 80, header: () => "Rank", cell: ({ row }) => <span className="text-sm text-default">{row.original.rank}</span> },
    { id: "name", width: 165, header: () => "Name", cell: ({ row }) => <span className="text-sm font-semibold text-default">{row.original.name}</span> },
    { id: "svcId", width: 165, header: () => "Service ID", cell: ({ row }) => <span className="text-sm text-default">{row.original.svcId}</span> },
    { id: "station", width: 165, header: () => "Base Station", cell: ({ row }) => <span className="text-sm text-default">{row.original.station}</span> },
    { id: "lane", width: 165, header: () => "Lane", cell: ({ row }) => <span className="text-sm text-default">Lane {row.original.lane}</span> },
    { id: "weapon", width: 165, header: () => "Weapon Type(s)", cell: ({ row }) => <span className="text-sm text-default">{row.original.weapon.join(", ")}</span> },
    { id: "best", width: 165, header: () => "Best Attempt", cell: ({ row }) => <BestAttemptCell trainee={row.original} /> },
    { id: "result", width: 120, header: () => "Course Results", cell: ({ row }) => <ResultBadge trainee={row.original} /> },
    { id: "actions", width: 80, minWidth: 80, maxWidth: 80, header: () => "", cell: () => null },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [paged, selected, pageAll, pageSome, page]);

  const n = filterCount(filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-default">Select Trainee</h2>
        <p className="text-xs text-body">Select trainees you would like to add into new detail for reshoot.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
        <UnderlineTabs value={tab} onChange={(t) => { setTab(t); setPage(1); setSelected(new Set()); setFilter(EMPTY_FILTER); }} />
        <div className="flex items-center justify-between gap-5 p-5">
          <div className="flex items-center gap-2 text-base font-semibold">
            <span className="text-default">Nominal Roll</span>
            <span className="text-body">{ofType.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, Service ID, rank, lane..." className="w-[300px]" />
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
                n > 0 ? "border-primary text-primary" : "border-invert-default text-default hover:bg-default-soft",
              )}
            >
              <SlidersHorizontal size={16} />
              Filter
              {n > 0 && <span className="rounded-full bg-primary-default px-1.5 text-xs font-medium text-invert-default">{n}</span>}
            </button>
          </div>
        </div>

        <TableCustom<SessionTrainee>
          columns={columns}
          data={paged}
          autoScrollTable
          actionSticky
          getNestedComponent={(row) => <AttemptsRow trainee={row.original} />}
        />
        <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={rows.length} setCurrentPage={setPage} />
      </div>

      <BulkActionBar
        open={selected.size > 0}
        count={selected.size}
        onDismiss={() => setSelected(new Set())}
        actions={
          <>
            {selected.size < ofType.length && (
              <BulkActionButton onClick={() => setSelected(new Set(ofType.map((t) => t.id)))}>
                Select All {ofType.length} Trainees
              </BulkActionButton>
            )}
            <BulkActionButton tone="primary" onClick={() => onCreateDetail([...selected])}>
              Create New Detail
            </BulkActionButton>
          </>
        }
      />

      <FilterDrawer
        open={filterOpen}
        value={filter}
        detailNumbers={detailNumbers}
        stations={stationsOf(session, tab)}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilter(f); setPage(1); setFilterOpen(false); }}
      />
    </div>
  );
}
