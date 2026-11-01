// Booking 2.0 — Step 4: Nominal Roll. New design per the screenshots: a
// per-courseware sidebar (Flat Screen / C-Shaped trainee counts), Flat
// Screen/C-Shaped tabs, a TableCustom-backed roll list with inline Role/
// Weapon assign, Add Trainee drawer, Import List modal, and a bulk-select
// toolbar (Assign / Delete) with a Bulk Delete confirmation. New file, local
// to booking-2 — not touching the old NominalRollStep.
//
// Feedback states (C-20, Figma page 5313:13115) — top-right toasts 12px under the wizard header:
//   "Trainee added" 5328:248382 · "Trainee updated" 5328:248416 (edit) and 5328:255360 (after a
//   single delete — Figma's own copy) · "N trainees deleted" 5328:282401 · "N Nominal Roll List
//   imported" 5328:281422. Delete confirmation 5328:255358: `Delete “{name}”?` / "This can't be
//   undone." / Delete; bulk 5328:283375: "Delete N trainees?".
import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/icon";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS } from "@/pages-tsx/booking/create/constants";
import { InlineSingleAssign, InlineMultiAssign } from "./InlineAssign";
import { AddTraineeDrawer } from "../modals/AddTraineeDrawer";
import { ImportNominalRollModal, IMPORT_FILE_ROWS } from "../modals/ImportNominalRollModal";
import { generateTrainees, type Trainee } from "../nominalRollTypes";

const PER_PAGE = 10;
const columnHelper = createColumnHelper<Trainee>();

interface NominalRollStepProps {
  trainingMode: string;
  bookingWeapons: string[];
  bookingRoles: string[];
  bookingCourseware: string;
  unitName?: string;
  stationCountsByCourseware?: Record<string, { base: number; cshaped: number }>;
  onAllRollsChange?: (rolls: Record<string, Trainee[]>) => void;
}

export function NominalRollStep({ trainingMode, bookingWeapons, bookingRoles, bookingCourseware, unitName, stationCountsByCourseware, onAllRollsChange }: NominalRollStepProps) {
  const isCollective = trainingMode === "Collective";
  const weaponOptions = bookingWeapons.length > 0
    ? bookingWeapons
    : isCollective ? COLLECTIVE_WEAPONS : trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const roleOptions = bookingRoles.length > 0 ? bookingRoles : COLLECTIVE_TEAM_OPTIONS;

  const coursewareList = bookingCourseware ? bookingCourseware.split(",").map((c) => c.trim()).filter(Boolean) : [];
  const countsFor = (cw: string) => stationCountsByCourseware?.[cw] ?? { base: 1, cshaped: 0 };

  // Roll data keyed by "{courseware}::{flat|cshaped}" — mirrors the WPT rule that
  // Nominal Roll is one roll per courseware x per station type (Sec. 3.4.2).
  const [rolls, setRolls] = useState<Record<string, Trainee[]>>(() => {
    const map: Record<string, Trainee[]> = {};
    coursewareList.forEach((cw, cwIdx) => {
      map[`${cw}::flat`] = cwIdx === 0 ? generateTrainees(32, 0) : [];
      map[`${cw}::cshaped`] = [];
    });
    return map;
  });

  const [active, setActive] = useState(coursewareList[0] ?? "");
  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; trainee?: Trainee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trainee | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    onAllRollsChange?.(rolls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolls]);

  const rollKey = `${active}::${stationType}`;
  const roll = rolls[rollKey] ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return roll;
    const q = search.trim().toLowerCase();
    return roll.filter((t) => t.name.toLowerCase().includes(q) || t.svcId.toLowerCase().includes(q));
  }, [roll, search]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const updateRoll = (key: string, updater: (list: Trainee[]) => Trainee[]) => {
    setRolls((prev) => ({ ...prev, [key]: updater(prev[key] ?? []) }));
  };

  const updateTrainee = (id: string, patch: Partial<Trainee>) => {
    updateRoll(rollKey, (list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const handleAddTrainee = (values: { name: string; rank: string; svcId: string; platoon: string; role: string; weapon: string[] }) => {
    if (drawer?.mode === "edit" && drawer.trainee) {
      updateTrainee(drawer.trainee.id, values);
      setToast("Trainee updated");
    } else {
      updateRoll(rollKey, (list) => [...list, { id: `t-new-${Date.now()}`, ...values }]);
      setToast("Trainee added");
    }
    setDrawer(null);
  };

  const removeOne = (id: string) => {
    updateRoll(rollKey, (list) => list.filter((t) => t.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setDeleteTarget(null);
    setToast("Trainee updated");
  };

  const removeSelected = () => {
    const n = selected.size;
    updateRoll(rollKey, (list) => list.filter((t) => !selected.has(t.id)));
    setToast(`${n} trainee${n === 1 ? "" : "s"} deleted`);
    setSelected(new Set());
    setShowBulkDelete(false);
  };

  // Each file that passed the import check adds IMPORT_FILE_ROWS mock trainees to its roll
  // ("Shared" applies one file to every courseware's roll of that station type).
  const handleImport = (readyCells: string[], method: "separated" | "shared") => {
    const targets = method === "shared"
      ? readyCells.flatMap((cell) => { const st = cell.split("::")[1]; return coursewareList.map((cw) => `${cw}::${st}`); })
      : readyCells;
    setRolls((prev) => {
      const next = { ...prev };
      targets.forEach((key, i) => {
        const list = next[key] ?? [];
        const stamp = `${Date.now()}-${i}`;
        next[key] = [...list, ...generateTrainees(IMPORT_FILE_ROWS, list.length + 100 + i * IMPORT_FILE_ROWS).map((t) => ({ ...t, id: `${t.id}-imp-${stamp}` }))];
      });
      return next;
    });
    setShowImport(false);
    setToast(`${readyCells.length} Nominal Roll List imported`);
  };

  const toggleAllVisible = () => {
    const visibleIds = paginated.map((t) => t.id);
    const allOn = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      size: 40,
      header: () => (
        <Checkbox size={16} checked={paginated.length > 0 && paginated.every((t) => selected.has(t.id))} onChange={toggleAllVisible} />
      ),
      cell: (info) => {
        const t = info.row.original;
        return (
          <Checkbox
            size={16}
            checked={selected.has(t.id)}
            onChange={() => setSelected((prev) => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })}
          />
        );
      },
    }),
    columnHelper.display({ id: "no", header: () => "No", cell: (info) => <span className="text-sm text-figma-body">{(page - 1) * PER_PAGE + info.row.index + 1}</span> }),
    columnHelper.accessor("rank", { header: () => "Rank", cell: (info) => <span className="text-sm text-figma-default">{info.getValue()}</span> }),
    columnHelper.accessor("name", { header: () => "Name", cell: (info) => <span className="text-sm font-semibold text-figma-default">{info.getValue()}</span> }),
    columnHelper.accessor("svcId", { header: () => "Service ID", cell: (info) => <span className="text-sm text-figma-default font-mono">{info.getValue()}</span> }),
    columnHelper.accessor("platoon", { header: () => "Platoon Number", cell: (info) => <span className="text-sm text-figma-default">{info.getValue()}</span> }),
    ...(isCollective ? [
      columnHelper.display({
        id: "role",
        header: () => "Role",
        cell: (info: any) => <InlineSingleAssign value={info.row.original.role} onChange={(v) => updateTrainee(info.row.original.id, { role: v })} options={roleOptions} />,
      } as any),
    ] : []),
    columnHelper.display({
      id: "weapon",
      header: () => "Weapon Type(s)",
      cell: (info: any) => <InlineMultiAssign value={info.row.original.weapon} onChange={(v) => updateTrainee(info.row.original.id, { weapon: v })} options={weaponOptions} />,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: (info: any) => {
        const t = info.row.original;
        return (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDrawer({ mode: "edit", trainee: t })} className="p-1.5 rounded-md text-figma-disabled hover:text-figma-primary hover:bg-figma-primarysoft"><Icon name="pencil" size={13} /></button>
            <button type="button" onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-md text-figma-disabled hover:text-figma-danger hover:bg-figma-dangersoft"><Icon name="trash-2" size={13} /></button>
          </div>
        );
      },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [paginated, selected, page, isCollective, roleOptions, weaponOptions]);

  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      <div className="flex gap-6 items-start">
        <div className="w-72 flex-shrink-0 bg-white border border-figma-subtle rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-figma-subtle">
            <h3 className="text-base font-bold text-figma-default">Courseware ({coursewareList.length})</h3>
          </div>
          {coursewareList.map((cw) => {
            const isActive = cw === active;
            const flatCount = rolls[`${cw}::flat`]?.length ?? 0;
            const cshapedCount = rolls[`${cw}::cshaped`]?.length ?? 0;
            return (
              <button
                key={cw}
                type="button"
                onClick={() => { setActive(cw); setStationType("flat"); setPage(1); setSelected(new Set()); }}
                className={cn("w-full text-left px-4 py-3 border-l-4 transition-colors", isActive ? "border-figma-primary bg-figma-primarysoft" : "border-transparent hover:bg-figma-soft")}
              >
                <p className={cn("text-sm truncate", isActive ? "font-bold text-figma-default" : "font-medium text-figma-default")}>{cw}</p>
                <p className="text-xs text-figma-body mt-0.5">Flat Screens <span className="font-semibold">{flatCount} Trainee{flatCount === 1 ? "" : "s"}</span></p>
                {countsFor(cw).cshaped > 0 && (
                  <p className="text-xs text-figma-body">C-Shaped <span className="font-semibold">{cshapedCount} Trainee{cshapedCount === 1 ? "" : "s"}</span></p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-figma-default">{active}</h2>
              <p className="text-xs text-figma-body mt-0.5">Configure this courseware's nominal roll list</p>
            </div>
            <button type="button" onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-figma-default border border-figma-strong rounded-lg hover:bg-figma-soft bg-white">
              <Icon name="file-up" size={14} /> Import List
            </button>
          </div>

          {countsFor(active).cshaped > 0 && (
            <div className="flex items-center gap-2 mb-5">
              {(["flat", "cshaped"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setStationType(t); setPage(1); setSelected(new Set()); }}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg border transition-colors",
                    stationType === t ? "border-figma-primary text-figma-primary bg-figma-primarysoft ring-1 ring-figma-primary" : "border-figma-subtle text-figma-caption bg-figma-muted hover:bg-figma-soft"
                  )}
                >
                  {t === "flat" ? "Flat Screen" : "C-Shaped"}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-figma-subtle rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-figma-subtle">
              <div>
                <h3 className="text-sm font-bold text-figma-default">Nominal Roll List <span className="font-normal text-figma-body">({roll.length} Trainees)</span></h3>
                <p className="text-xs text-figma-body mt-0.5">{active} — {stationType === "flat" ? "Flat Screen" : "C-Shaped"}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-figma-disabled" />
                  <InputCustom
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-1.5 text-sm border border-figma-subtle rounded-lg w-52 placeholder:text-figma-placeholder focus:outline-none focus:ring-2 focus:ring-figma-primary/30 focus:border-figma-primary"
                  />
                </div>
                <button type="button" onClick={() => setDrawer({ mode: "add" })} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
                  <Icon name="plus" size={14} /> Add Trainee
                </button>
              </div>
            </div>

            <TableCustom columns={columns} data={paginated} autoScrollTable={true} classThead="bg-figma-dangersoft/70" classTheadTh="text-figma-primary text-xs font-semibold" />

            <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1500] bg-white border border-figma-subtle rounded-xl shadow-xl px-5 py-3 flex items-center gap-3">
          <button type="button" onClick={() => setSelected(new Set())} className="text-figma-disabled hover:text-figma-caption">✕</button>
          <span className="text-sm font-semibold text-figma-default">{selected.size} selected</span>
          <button type="button" onClick={() => setSelected(new Set(roll.map((t) => t.id)))} className="px-3 py-1.5 text-xs font-semibold text-figma-caption border border-figma-subtle rounded-lg hover:bg-figma-soft">
            Select All {roll.length} Trainees
          </button>
          <button type="button" onClick={() => setDrawer({ mode: "edit", trainee: roll.find((t) => selected.has(t.id)) })} className="px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
            Assign
          </button>
          <button type="button" onClick={() => setShowBulkDelete(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-figma-danger border border-red-200 rounded-lg hover:bg-figma-dangersoft">
            <Icon name="trash-2" size={14} /> Delete
          </button>
        </div>
      )}

      {drawer && (
        <AddTraineeDrawer
          mode={drawer.mode}
          initial={drawer.trainee}
          unitName={unitName || "Unit"}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          showRole={isCollective}
          takenSvcIds={roll.filter((t) => t.id !== drawer.trainee?.id).map((t) => t.svcId)}
          onClose={() => setDrawer(null)}
          onSubmit={handleAddTrainee}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete “${deleteTarget?.name ?? ""}”?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeOne(deleteTarget.id)}
      />

      <ConfirmDialog
        open={showBulkDelete}
        title={`Delete ${selected.size} trainee${selected.size === 1 ? "" : "s"}?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setShowBulkDelete(false)}
        onConfirm={removeSelected}
      />

      {showImport && (
        <ImportNominalRollModal
          coursewareList={coursewareList}
          hasCShaped={(cw) => countsFor(cw).cshaped > 0}
          onClose={() => setShowImport(false)}
          onImport={handleImport}
        />
      )}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" offsetTop={140} />
    </div>
  );
}
