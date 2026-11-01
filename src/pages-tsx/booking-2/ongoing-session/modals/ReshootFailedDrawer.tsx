import { useMemo } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { TableCustom } from "@/components/table";
import { nextDetailNumber, resultOf, type LaneAssignment, type OngoingSession, type ReshootGroup, type SessionTrainee } from "../session";

type Row = LaneAssignment & { trainee: SessionTrainee };
type Ctx = CellContext<Row, any>;

const schema = Yup.object({ selected: Yup.array().of(Yup.string()).min(1) });

/** Detail numbers each group would get, counting only groups that still have
 *  someone selected — the same order `addDetail` will number them in. */
function previewNumbers(session: OngoingSession, groups: ReshootGroup[], selected: Set<string>): Map<string, number> {
  const next = new Map<string, number>();
  const out = new Map<string, number>();
  groups.forEach((g) => {
    const n = next.get(g.station) ?? nextDetailNumber(session, g.station);
    out.set(g.key, n);
    if (g.assignments.some((a) => selected.has(a.traineeId))) next.set(g.station, n + 1);
  });
  return out;
}

function GroupTable({ rows, selected, onToggle }: { rows: Row[]; selected: Set<string>; onToggle: (ids: string[], on: boolean) => void }) {
  const all = rows.every((r) => selected.has(r.traineeId));
  const some = !all && rows.some((r) => selected.has(r.traineeId));
  const columns = useMemo<ColumnDef<Row, any>[]>(() => [
    {
      id: "select", width: 48, minWidth: 48, maxWidth: 48, compact: true,
      header: () => <Checkbox size={16} checked={all} indeterminate={some} onChange={() => onToggle(rows.map((r) => r.traineeId), !all)} />,
      cell: ({ row }: Ctx) => (
        <Checkbox size={16} checked={selected.has(row.original.traineeId)} onChange={() => onToggle([row.original.traineeId], !selected.has(row.original.traineeId))} />
      ),
    },
    { id: "lane", width: 80, minWidth: 80, header: () => "Lane", cell: ({ row }: Ctx) => <span className="text-xs text-default">Lane {row.original.lane}</span> },
    {
      id: "name", width: 256, minWidth: 256, header: () => "Name",
      cell: ({ row }: Ctx) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-default">{row.original.trainee.name}</span>
          <span className="text-xs text-body">{row.original.trainee.svcId}</span>
        </div>
      ),
    },
    {
      id: "result", width: 88, minWidth: 88, header: () => "Result",
      // Failed trainees (reshoot) always read "Failed"; trainees picked on Live Results show their own result
      // (Figma `Create New Detail List` 5753:83359 lists Failed and Passed side by side).
      cell: ({ row }: Ctx) => {
        const r = resultOf(row.original.trainee);
        return <StatusBadge tone={r === "Marksman" ? "info" : r === "Passed" ? "success" : "danger"}>{r ?? "Failed"}</StatusBadge>;
      },
    },
  ] as unknown as ColumnDef<Row, any>[], [rows, selected, all, some, onToggle]);

  return (
    <TableCustom<Row>
      columns={columns}
      data={rows}
      tableFixed
      classTheadTh="px-4 py-2.5 text-xs"
      classTBodyTd="px-4 py-2"
    />
  );
}

/** Figma `Action - Reshoot / Create New Detail List` (7897:50464) — opened from
 *  the Detail List's "Create New Detail" dropdown → "Reshoot Failed Trainees".
 *  One card per detail it will create, every failed trainee ticked by default. */
export function ReshootFailedDrawer({
  open,
  session,
  candidates,
  groups,
  title = "Reshoot Failed Trainees",
  createLabel = (n) => `Create ${n} Detail${n === 1 ? "" : "s"}`,
  onClose,
  onCreate,
}: {
  open: boolean;
  session: OngoingSession;
  candidates: SessionTrainee[];
  groups: ReshootGroup[];
  /** Drawer title — Live Results' bulk "Create New Detail" reuses this drawer as "Create New Detail". */
  title?: string;
  createLabel?: (count: number) => string;
  onClose: () => void;
  onCreate: (groups: { station: string; assignments: LaneAssignment[] }[]) => void;
}) {
  if (!open) return null;
  const byId = new Map(candidates.map((t) => [t.id, t]));

  return (
    <Formik
      initialValues={{ selected: candidates.map((t) => t.id) }}
      validationSchema={schema}
      onSubmit={(v) => {
        const sel = new Set(v.selected);
        onCreate(
          groups
            .map((g) => ({ station: g.station, assignments: g.assignments.filter((a) => sel.has(a.traineeId)) }))
            .filter((g) => g.assignments.length > 0),
        );
      }}
    >
      {({ values, setFieldValue, submitForm }) => {
        const selected = new Set(values.selected);
        const numbers = previewNumbers(session, groups, selected);
        const count = groups.filter((g) => g.assignments.some((a) => selected.has(a.traineeId))).length;
        const toggle = (ids: string[], on: boolean) => {
          const next = new Set(selected);
          ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
          setFieldValue("selected", candidates.map((t) => t.id).filter((id) => next.has(id)));
        };
        return (
          <Drawer
            open
            width={512}
            onClose={onClose}
            title={title}
            footer={
              <>
                <button type="button" onClick={onClose} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  disabled={count === 0}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors disabled:cursor-not-allowed disabled:bg-default-default disabled:text-disabled"
                >
                  {createLabel(count)}
                </button>
              </>
            }
          >
            <div className="flex flex-col gap-8">
              {groups.map((g) => {
                const rows: Row[] = g.assignments.map((a) => ({ ...a, trainee: byId.get(a.traineeId)! }));
                return (
                  <div key={g.key} className="overflow-hidden rounded-lg border border-invert-default bg-surface-lv1">
                    <div className="flex flex-col gap-0.5 p-4">
                      <span className="text-sm font-semibold text-default">{g.station} · Detail {numbers.get(g.key)}</span>
                      <span className="text-xs text-body">{rows.length} trainee{rows.length === 1 ? "" : "s"}</span>
                    </div>
                    <GroupTable rows={rows} selected={selected} onToggle={toggle} />
                  </div>
                );
              })}
            </div>
          </Drawer>
        );
      }}
    </Formik>
  );
}
