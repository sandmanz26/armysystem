import { useMemo, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/drawer";
import { Radio } from "@/components/radio";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { resultOf, type OngoingSession, type SessionStation, type SessionTrainee } from "../session";
import { AttemptsRow, BestAttemptCell, ResultBadge } from "../components/ResultCells";
import { SearchBox, detailNumbersOf, matchesSearch } from "../components/LiveResultsView";
import { EMPTY_FILTER, FilterDrawer, filterCount, matchesFilter, type ResultFilter } from "./FilterDrawer";

type Ctx = CellContext<SessionTrainee, any>;

const PER_PAGE = 10;
const schema = Yup.object({ traineeId: Yup.string().required() });

// Figma `Select Trainee - Empty/Selected` (5765:217547, 5768:18978): a 675px
// drawer with a single-pick (radio) Nominal Roll.
export function SelectTraineeDrawer({
  open,
  session,
  candidates,
  stations,
  onClose,
  onConfirm,
}: {
  open: boolean;
  session: OngoingSession;
  candidates: SessionTrainee[];
  stations: SessionStation[];
  onClose: () => void;
  onConfirm: (traineeId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ResultFilter>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  const rows = useMemo(
    () => candidates.filter((t) => matchesSearch(t, search) && matchesFilter(filter, t, resultOf(t), detailNumbersOf(session, t.id))),
    [candidates, search, filter, session],
  );
  const paged = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const detailNumbers = useMemo(() => [...new Set(session.details.map((d) => d.number))].sort((a, b) => a - b), [session.details]);

  if (!open) return null;
  const n = filterCount(filter);

  return (
    <Formik initialValues={{ traineeId: "" }} validationSchema={schema} onSubmit={(v) => onConfirm(v.traineeId)}>
      {({ values, setFieldValue, submitForm }) => {
        const columns = [
          {
            id: "pick", width: 56, minWidth: 56, maxWidth: 56, header: () => "",
            cell: ({ row }: Ctx) => (
              <Radio name="select-trainee" value={row.original.id} checked={values.traineeId === row.original.id} onChange={(v) => setFieldValue("traineeId", v)} label="" />
            ),
          },
          { id: "no", width: 64, header: () => "No.", cell: ({ row }: Ctx) => <span className="text-sm text-body">{(page - 1) * PER_PAGE + row.index + 1}</span> },
          { id: "rank", width: 80, header: () => "Rank", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.rank}</span> },
          { id: "name", width: 200, header: () => "Name", cell: ({ row }: Ctx) => <span className="text-sm font-semibold text-default">{row.original.name}</span> },
          { id: "svcId", width: 120, header: () => "Service ID", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.svcId}</span> },
          { id: "station", width: 120, header: () => "Base Station", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.station}</span> },
          { id: "lane", width: 120, header: () => "Lane", cell: ({ row }: Ctx) => <span className="text-sm text-default">Lane {row.original.lane}</span> },
          { id: "weapon", width: 120, header: () => "Weapon", cell: ({ row }: Ctx) => <span className="text-sm text-default">{row.original.weapon.join(", ")}</span> },
          { id: "best", width: 120, header: () => "Best Attempt", cell: ({ row }: Ctx) => <BestAttemptCell trainee={row.original} /> },
          { id: "result", width: 120, header: () => "Result", cell: ({ row }: Ctx) => <ResultBadge trainee={row.original} /> },
          { id: "actions", width: 80, minWidth: 80, maxWidth: 80, header: () => "", cell: () => null },
        ] as unknown as ColumnDef<SessionTrainee, any>[];
        return (
          <Drawer
            open
            width={675}
            onClose={onClose}
            title="Select Trainee"
            footer={
              <>
                <button type="button" onClick={onClose} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={submitForm} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors">
                  Confirm
                </button>
              </>
            }
          >
            <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <span className="text-default">Nominal Roll</span>
                  <span className="text-body">{candidates.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search..." className="w-[144px]" />
                  <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-lg border bg-surface px-3 text-sm font-semibold transition-colors",
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
            <FilterDrawer
              open={filterOpen}
              value={filter}
              detailNumbers={detailNumbers}
              stations={stations}
              onClose={() => setFilterOpen(false)}
              onApply={(f) => { setFilter(f); setPage(1); setFilterOpen(false); }}
            />
          </Drawer>
        );
      }}
    </Formik>
  );
}
