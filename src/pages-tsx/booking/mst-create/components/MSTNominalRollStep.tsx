// MST Create Booking — Step 4: Nominal Roll (CM-4).
//
// ASSUMPTION (flagged): Figma's MST "Step 4 - Nominal Roll" page (6183:481240) holds WPT frames — header "WPT",
// "Lane Configuration", a Courseware sidebar, Flat Screen / C-Shaped tabs, Platoon Number / Weapon Type columns. There is
// no MST frame, so this keeps MST's own model (one roll per IOS, columns Rank · Name · Service ID · Batch · Course · Unit ·
// Call Sign · Role) and takes everything that is not WPT-specific from those frames:
//   • header row "Nominal Roll List (N Trainees)" with Search..., Import List and Add Trainee (6183:481282…286)
//   • table columns "No." … "Last Updated On" · "Actions" with pencil / trash-2, the shared Pagination
//   • toasts "Trainee added" 6183:481348 · "Trainee updated" 6183:481354 / …360 · "N Nominal Roll List imported" 6183:481316
//   • Delete “name”? / "This can't be undone." 6183:481358
//   • Add / Edit drawer and Import modal — see MSTTraineeDrawer / MSTImportRollModal
// The old floating "Show 3/5/10/15" demo pill is behind HIDDEN_FEATURES.mstRollDemoSwitcher.
import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { ChipAdvanced } from "@/components/chip-advanced";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { TableCustom } from "@/components/table";
import { Toast } from "@/components/toast";
import { Pagination } from "@/components/ui/Pagination";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { cn } from "@/lib/utils";
import { MST_IMPORT_FILE_ROWS, MSTImportRollModal } from "../modals/MSTImportRollModal";
import { MSTTraineeDrawer, type MSTTraineeValues } from "../modals/MSTTraineeDrawer";
import { seedRoll, todayLong, type MSTRollTrainee } from "../mstRollData";
import type { IosEntry } from "./MSTCabinConfigStep";

const DEFAULT_ROWS = 10;
const DATA_SIZES = [3, 5, 10, 15] as const;
const columnHelper = createColumnHelper<MSTRollTrainee>();

/** One tab per IOS — named by base station (PRD §2.3), with the IOS number added when several share a base station. */
export function stationLabels(iosList: IosEntry[]): string[] {
  const base = iosList.map((e, i) => e.baseStation || e.iosDevice || `IOS ${i + 1}`);
  return base.map((b, i) => (base.filter((x) => x === b).length > 1 ? `${b} · IOS ${i + 1}` : b));
}

export function MSTNominalRollStep({ iosList, onTotalChange }: {
  iosList: IosEntry[];
  /** Total trainees across all IOS tabs — the Review modal's "Total Trainee". */
  onTotalChange: (n: number) => void;
}) {
  const stations = useMemo(() => stationLabels(iosList), [iosList]);
  const uids = iosList.map((e) => e.uid);
  const [activeUid, setActiveUid] = useState(uids[0]);
  const active = uids.includes(activeUid) ? activeUid : uids[0];
  const activeIdx = uids.indexOf(active);

  const [rolls, setRolls] = useState<Record<number, MSTRollTrainee[]>>({});
  const rollOf = (uid: number) => rolls[uid] ?? seedRoll(DEFAULT_ROWS, `u${uid}`);
  const roll = rollOf(active);
  const updateRoll = (uid: number, fn: (l: MSTRollTrainee[]) => MSTRollTrainee[]) => setRolls((p) => ({ ...p, [uid]: fn(p[uid] ?? seedRoll(DEFAULT_ROWS, `u${uid}`)) }));

  const total = uids.reduce((n, uid) => n + (rolls[uid]?.length ?? DEFAULT_ROWS), 0);
  useEffect(() => { onTotalChange(total); }, [total, onTotalChange]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; row?: MSTRollTrainee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MSTRollTrainee | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? roll.filter((t) => t.name.toLowerCase().includes(q) || t.svcId.toLowerCase().includes(q)) : roll;
  }, [roll, search]);
  // A delete/search can leave the open page past the last one — clamp instead of showing an empty page.
  const curPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)));
  const paginated = filtered.slice((curPage - 1) * perPage, curPage * perPage);

  const switchStation = (uid: number) => { setActiveUid(uid); setSearch(""); setPage(1); };

  const submitTrainee = (v: MSTTraineeValues) => {
    const base = { rank: v.rank, name: v.name, svcId: v.svcId, batch: v.batch, course: v.course, unit: v.unit, callSign: v.callSign || "-", roles: v.roles, updatedOn: todayLong() };
    if (drawer?.mode === "edit" && drawer.row) {
      updateRoll(active, (l) => l.map((t) => (t.id === drawer.row!.id ? { ...t, ...base } : t)));
      setToast("Trainee updated");
    } else {
      const row: MSTRollTrainee = { ...base, id: `new-${Date.now()}`, battalion: "-", company: "-", section: "-", appointment: "-", platoon: "-" };
      updateRoll(active, (l) => [...l, row]);
      setSearch("");
      setPage(Math.ceil((roll.length + 1) / perPage)); // jump to the page that holds it
      setToast("Trainee added");
    }
    setDrawer(null);
  };

  const removeTrainee = (id: string) => {
    updateRoll(active, (l) => l.filter((t) => t.id !== id));
    setDeleteTarget(null);
    setToast("Trainee updated"); // Figma's own copy for delete (6183:481360)
  };

  // Each file that passed the check adds MST_IMPORT_FILE_ROWS mock trainees to its IOS tab.
  const importFiles = (idxs: number[]) => {
    idxs.forEach((i, k) => {
      const uid = uids[i];
      const stamp = Date.now() + k;
      updateRoll(uid, (l) => [...l, ...seedRoll(MST_IMPORT_FILE_ROWS, `imp${stamp}`).map((t) => ({ ...t, name: `${t.name} (${l.length + 1})`, updatedOn: todayLong() }))]);
    });
    setShowImport(false);
    setPage(1);
    setToast(`${idxs.length} Nominal Roll List imported`);
  };

  type Col = ColumnDef<MSTRollTrainee, any> & { width?: string; minWidth?: string };
  const columns = useMemo<Col[]>(() => {
    const text = (k: keyof MSTRollTrainee, extra?: string) => ({ row }: any) => <span className={cn("text-sm text-default", extra)}>{row.original[k]}</span>;
    return [
      { ...columnHelper.display({ id: "no", header: () => "No.", cell: ({ row }) => <span className="text-sm text-body">{(curPage - 1) * perPage + row.index + 1}</span> }), width: "56px", minWidth: "56px" },
      { ...columnHelper.display({ id: "rank", header: () => "Rank", cell: text("rank") }), width: "76px", minWidth: "76px" },
      { ...columnHelper.display({ id: "name", header: () => "Name", cell: text("name", "font-medium") }), minWidth: "160px" },
      { ...columnHelper.display({ id: "svcId", header: () => "Service ID", cell: text("svcId") }), width: "112px", minWidth: "112px" },
      { ...columnHelper.display({ id: "batch", header: () => "Batch", cell: text("batch") }), width: "76px", minWidth: "76px" },
      { ...columnHelper.display({ id: "course", header: () => "Course", cell: text("course") }), width: "124px", minWidth: "124px" },
      { ...columnHelper.display({ id: "unit", header: () => "Unit", cell: text("unit") }), width: "84px", minWidth: "84px" },
      { ...columnHelper.display({ id: "callSign", header: () => "Call Sign", cell: text("callSign") }), width: "88px", minWidth: "88px" },
      { ...columnHelper.display({ id: "roles", header: () => "Role", cell: text("roles") }), width: "72px", minWidth: "72px" },
      { ...columnHelper.display({ id: "updatedOn", header: () => "Last Updated On", cell: text("updatedOn", "whitespace-nowrap") }), width: "150px", minWidth: "150px" },
      { ...columnHelper.display({
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Edit trainee" onClick={() => setDrawer({ mode: "edit", row: row.original })} className="flex h-7 w-7 items-center justify-center rounded-md text-body hover:bg-default-default hover:text-default"><Icon name="pencil" size={16} /></button>
            <button type="button" aria-label="Delete trainee" onClick={() => setDeleteTarget(row.original)} className="flex h-7 w-7 items-center justify-center rounded-md text-body hover:bg-default-default hover:text-danger"><Icon name="trash-2" size={16} /></button>
          </div>
        ),
      }), width: "96px", minWidth: "96px" },
    ];
  }, [curPage, perPage]);

  return (
    <div className="flex-1 overflow-auto bg-main-background p-6">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-default">Nominal Roll</h2>
          </div>
          <button type="button" onClick={() => setShowImport(true)} className="flex h-10 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">
            <Icon name="file-up" size={16} />Import List
          </button>
        </div>

        {stations.length > 1 && (
          <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="IOS">
            {iosList.map((e, i) => (
              <ChipAdvanced key={e.uid} label={stations[i]} selected={e.uid === active} onSelect={() => switchStation(e.uid)} />
            ))}
          </div>
        )}

        <section className="rounded-xl border border-invert-default bg-surface">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <h3 className="text-base font-semibold text-default">Nominal Roll List <span className="font-normal text-body">({roll.length} {roll.length === 1 ? "Trainee" : "Trainees"})</span></h3>
              {stations.length > 1 && <p className="mt-0.5 text-xs text-body">{stations[activeIdx]}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Input
                aria-label="Search" placeholder="Search..." value={search} wrapperClassName="w-64"
                prefixIcon={<Icon name="search" size={18} />}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <button type="button" onClick={() => setDrawer({ mode: "add" })} className="flex h-10 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered">
                <Icon name="plus" size={16} />Add Trainee
              </button>
            </div>
          </div>
          <TableCustom<MSTRollTrainee>
            columns={columns} data={paginated} autoScrollTable actionSticky={false}
            classTheadTh="px-5 py-3 text-sm font-semibold text-primary" classTBodyTd="px-5 py-3"
          />
          <Pagination currentPage={curPage} setCurrentPage={setPage} itemsPerPage={perPage} setItemsPerPage={setPerPage} totalItems={filtered.length} />
        </section>
      </div>

      {drawer && (
        <MSTTraineeDrawer
          mode={drawer.mode}
          initial={drawer.row && { rank: drawer.row.rank, name: drawer.row.name, svcId: drawer.row.svcId, batch: drawer.row.batch, course: drawer.row.course, unit: drawer.row.unit, callSign: drawer.row.callSign === "-" ? "" : drawer.row.callSign, roles: drawer.row.roles }}
          takenSvcIds={roll.filter((t) => t.id !== drawer.row?.id).map((t) => t.svcId)}
          onClose={() => setDrawer(null)}
          onSubmit={submitTrainee}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete “${deleteTarget?.name ?? ""}”?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeTrainee(deleteTarget.id)}
      />

      {showImport && <MSTImportRollModal stations={stations} onClose={() => setShowImport(false)} onImport={importFiles} />}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" offsetTop={132} />

      {HIDDEN_FEATURES.mstRollDemoSwitcher && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-invert-default bg-surface px-3 py-1.5 shadow-lg">
          <span className="mr-0.5 text-[10px] font-medium text-body">Show</span>
          {DATA_SIZES.map((size) => (
            <button key={size} type="button" onClick={() => { setRolls((p) => ({ ...p, [active]: seedRoll(size, `u${active}`) })); setPage(1); }}
              className={cn("rounded-full px-2.5 py-1 text-xs font-bold", roll.length === size ? "bg-primary-default text-invert-default" : "text-body hover:bg-default-default")}>
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
