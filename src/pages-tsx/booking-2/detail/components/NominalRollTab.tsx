// Booking 2.0 — Booking Details › tab "Nominal Roll" (BD-1, F-008).
//
// Figma section `Tab - Nominal Roll` on Booking Details (page 5029:40418):
//   Empty   5511:21854 (Collective) · 5512:139295 (Judgemental) · 5512:140809 (Marksmanship)
//   Filled  5511:53579 (Collective) · 5512:139297 (Judgemental) · 5512:140811 (Marksmanship)
// — one white `Section Layout - Table`: underline tabs Flat Screen / C-Shaped, `Section Header`
// "Nominal Roll List {count}" + Search + "Import List" (file-up) + primary "Add Trainee" (plus),
// then `Table - Nominal Role`: ☐ · No. · Rank · Name · Service ID · Platoon Number · [Role, Collective
// only] · Weapon Type(s) · Last Updated On · Actions (pencil / trash-2, fixed right column), and the
// table Pagination. Role/Weapon cells are the inline "Assign ⌄" dropdowns.
// The `Link Page` frames (Add / Edit / Delete Trainee, Import List (Single CW)) point to Create
// Booking's Nominal Roll actions (page 5313:13115):
//   Add Trainee    5328:248276 (+ Role) / 5477:41265 (no Role) · errors 5328:248317 · Service ID taken
//                  5427:157220 "Service ID already existed" · toast 5328:248382 "Trainee added"
//   Edit Trainee   5328:248404 (button "Confirm") · toast 5328:248416 "Trainee updated"
//   Delete Trainee 5328:255358 `Delete “{name}”?` / "This can't be undone." · toast 5328:255360
//   Import (1 CW)  5601:323443 · toast 5601:323467 "1 Nominal Roll List imported"
// Trainee model + mock generator, the Import modal and the inline Assign dropdowns are Create
// Booking 2.0 Step 4's, reused read-only. Data lives in nominalRollStore (feeds the readiness
// banner).
import { useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { createColumnHelper, type CellContext } from "@tanstack/react-table";
import type { Booking } from "@/data/mock";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Drawer } from "@/components/drawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS } from "@/pages-tsx/booking/create/constants";
import { InlineSingleAssign, InlineMultiAssign } from "@/pages-tsx/booking-2/create/components/InlineAssign";
import { ImportNominalRollModal } from "@/pages-tsx/booking-2/create/modals/ImportNominalRollModal";
import { RANK_OPTIONS, generateTrainees } from "@/pages-tsx/booking-2/create/nominalRollTypes";
import {
  getNominalRolls, saveNominalRolls, rollKey, todayLabel,
  type DetailTrainee, type NominalRolls, type RollStation,
} from "./nominalRollStore";

const PER_PAGE = 10;
/** Figma `Import List - Separate - Filled` (5601:323371): "18 rows ready to import". */
const IMPORT_ROWS = 18;

interface Props {
  booking: Booking;
  /** Every courseware of the booking (seed) … */
  coursewares: string[];
  /** … and the one this tab shows (multi-courseware layout swaps it). */
  courseware: string;
}

const col = createColumnHelper<DetailTrainee>();

const maskSvcId = (n: string) => (n.startsWith("*") ? n : `*****${n.slice(-4)}`);

interface FormValues { name: string; rank: string; svcId: string; platoon: string; role: string; weapon: string }

function TraineeDrawer({
  mode, initial, unitName, isCollective, roleOptions, weaponOptions, takenSvcIds, onClose, onSubmit,
}: {
  mode: "add" | "edit";
  initial?: DetailTrainee;
  unitName: string;
  isCollective: boolean;
  roleOptions: string[];
  weaponOptions: string[];
  takenSvcIds: string[];
  onClose: () => void;
  onSubmit: (v: FormValues) => void;
}) {
  const schema = Yup.object().shape({
    name: Yup.string().trim().required("Trainee Name is required"),
    rank: Yup.string().required("Rank is required"),
    svcId: Yup.string().trim().required("Service ID is required")
      .test("unique", "Service ID already existed", (v) => !v || !takenSvcIds.includes(maskSvcId(v.trim().toUpperCase()))),
    platoon: Yup.string().trim().required("Platoon Number is required"),
    role: isCollective ? Yup.string().required("Role is required") : Yup.string(),
    weapon: Yup.string().required("Weapon Type is required"),
  });
  return (
    <Formik<FormValues>
      initialValues={{
        name: initial?.name ?? "",
        rank: initial?.rank ?? "",
        svcId: initial?.svcId ?? "",
        platoon: initial?.platoon.replace(/^Platoon\s+/, "") ?? "",
        role: initial?.role ?? "",
        weapon: initial?.weapon[0] ?? "",
      }}
      validationSchema={schema}
      validateOnChange={false}
      onSubmit={onSubmit}
    >
      {({ values, errors, submitCount, setFieldValue, handleChange, submitForm }) => {
        const err = (k: keyof FormValues) => (submitCount > 0 ? errors[k] : undefined);
        return (
          <Drawer
            open
            onClose={onClose}
            title={mode === "add" ? "Add New Trainee" : "Edit Trainee"}
            footer={
              <>
                <button type="button" onClick={onClose} className="h-9 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">
                  Cancel
                </button>
                <button type="button" onClick={submitForm} className="h-9 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered">
                  {mode === "add" ? "Create Trainee" : "Confirm"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-5">
              <Input name="name" label="Trainee Name" required placeholder="Enter Trainee Name" value={values.name} onChange={handleChange} status={err("name") ? "danger" : "default"} caption={err("name")} />
              <Select label="Rank" required placeholder="Select Rank" options={initial?.rank && !RANK_OPTIONS.includes(initial.rank) ? [initial.rank, ...RANK_OPTIONS] : RANK_OPTIONS} value={values.rank} onChange={(v) => setFieldValue("rank", v)} status={err("rank") ? "danger" : "default"} caption={err("rank")} />
              <Input name="svcId" label="Service ID" required placeholder="e.g. A1234567" value={values.svcId} onChange={handleChange} status={err("svcId") ? "danger" : "default"} caption={err("svcId")} />
              <Input name="platoon" label="Platoon Number" required placeholder="Enter Platoon Number (e.g. 1)" value={values.platoon} onChange={handleChange} status={err("platoon") ? "danger" : "default"} caption={err("platoon")} />
              {isCollective && (
                <Select label="Role" required placeholder="Select Role" options={roleOptions} value={values.role} onChange={(v) => setFieldValue("role", v)} status={err("role") ? "danger" : "default"} caption={err("role")} />
              )}
              <Select label="Weapon Type" required placeholder="Select Weapon Type" options={weaponOptions} value={values.weapon} onChange={(v) => setFieldValue("weapon", v)} status={err("weapon") ? "danger" : "default"} caption={err("weapon")} />
              <Input label="Unit Name" value={unitName} disabled readOnly />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

export function NominalRollTab({ booking, coursewares, courseware }: Props) {
  const isCollective = booking.trainingMode === "Collective";
  const weaponOptions = booking.weaponTypes?.length
    ? booking.weaponTypes
    : isCollective ? COLLECTIVE_WEAPONS : booking.trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const roleOptions = booking.roles?.length ? booking.roles : COLLECTIVE_TEAM_OPTIONS;
  const unitName = booking.unitName ? `Unit ${booking.unitName}` : "-";

  const [rolls, setRolls] = useState<NominalRolls>(() => getNominalRolls(booking, coursewares));
  const [station, setStation] = useState<RollStation>("flat");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; trainee?: DetailTrainee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DetailTrainee | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // The multi-courseware layout swaps `courseware` on the same mounted tab.
  useEffect(() => {
    setRolls(getNominalRolls(booking, coursewares));
    setStation("flat"); setPage(1); setSearch(""); setSelected(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id, courseware]);

  const key = rollKey(courseware, station);
  const roll = rolls[key] ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? roll.filter((t) => t.name.toLowerCase().includes(q) || t.svcId.toLowerCase().includes(q)) : roll;
  }, [roll, search]);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const update = (fn: (list: DetailTrainee[]) => DetailTrainee[]) => {
    const next = { ...rolls, [key]: fn(rolls[key] ?? []) };
    setRolls(next);
    saveNominalRolls(booking.id, next);
  };
  const patch = (id: string, p: Partial<DetailTrainee>) =>
    update((list) => list.map((t) => (t.id === id ? { ...t, ...p, updatedOn: todayLabel() } : t)));

  const submitDrawer = (v: FormValues) => {
    const values = {
      name: v.name.trim(), rank: v.rank, svcId: maskSvcId(v.svcId.trim().toUpperCase()),
      platoon: `Platoon ${v.platoon.trim().replace(/^Platoon\s+/i, "")}`, role: v.role, weapon: [v.weapon],
    };
    if (drawer?.mode === "edit" && drawer.trainee) {
      patch(drawer.trainee.id, values);
      setToast("Trainee updated");
    } else {
      update((list) => [...list, { id: `t-new-${Date.now()}`, ...values, updatedOn: todayLabel() }]);
      setToast("Trainee added");
    }
    setDrawer(null);
  };

  const pageIds = paginated.map((t) => t.id);
  const allOn = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const columns = [
    col.display({
      id: "select",
      width: "56px",
      header: () => (
        <Checkbox size={18} checked={allOn} onChange={() => setSelected((prev) => {
          const n = new Set(prev); pageIds.forEach((id) => (allOn ? n.delete(id) : n.add(id))); return n;
        })} />
      ),
      cell: ({ row }: CellContext<DetailTrainee, unknown>) => (
        <Checkbox size={18} checked={selected.has(row.original.id)} onChange={() => toggle(row.original.id)} />
      ),
    } as any),
    col.display({
      id: "no", width: "56px", header: () => "No.",
      cell: ({ row }: CellContext<DetailTrainee, unknown>) => <span className="text-sm text-body">{(page - 1) * PER_PAGE + row.index + 1}</span>,
    } as any),
    col.accessor("rank", { header: () => "Rank", width: "80px", cell: (i: CellContext<DetailTrainee, string>) => <span className="text-sm text-default">{i.getValue()}</span> } as any),
    col.accessor("name", { header: () => "Name", width: "200px", cell: (i: CellContext<DetailTrainee, string>) => <span className="text-sm font-semibold text-default">{i.getValue()}</span> } as any),
    col.accessor("svcId", { header: () => "Service ID", width: "120px", cell: (i: CellContext<DetailTrainee, string>) => <span className="text-sm text-default">{i.getValue()}</span> } as any),
    col.accessor("platoon", { header: () => "Platoon Number", width: "160px", cell: (i: CellContext<DetailTrainee, string>) => <span className="text-sm text-default">{i.getValue()}</span> } as any),
    ...(isCollective ? [col.display({
      id: "role", header: () => "Role", width: "200px",
      cell: ({ row }: CellContext<DetailTrainee, unknown>) => (
        <InlineSingleAssign value={row.original.role} onChange={(v) => patch(row.original.id, { role: v })} options={roleOptions} />
      ),
    } as any)] : []),
    col.display({
      id: "weapon", header: () => "Weapon Type(s)", width: "200px",
      cell: ({ row }: CellContext<DetailTrainee, unknown>) => (
        <InlineMultiAssign value={row.original.weapon} onChange={(v) => patch(row.original.id, { weapon: v })} options={weaponOptions} />
      ),
    } as any),
    col.accessor("updatedOn", { header: () => "Last Updated On", width: "160px", cell: (i: CellContext<DetailTrainee, string>) => <span className="whitespace-nowrap text-sm text-default">{i.getValue()}</span> } as any),
    col.display({
      id: "actions",
      width: "104px",
      header: () => (isCollective ? "Actions" : "Action"),
      cell: ({ row }: CellContext<DetailTrainee, unknown>) => (
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label="Edit trainee" onClick={() => setDrawer({ mode: "edit", trainee: row.original })} className="flex h-7 w-7 items-center justify-center rounded-lg text-default hover:bg-default-soft">
            <Icon name="pencil" size={16} />
          </button>
          <button type="button" aria-label="Delete trainee" onClick={() => setDeleteTarget(row.original)} className="flex h-7 w-7 items-center justify-center rounded-lg text-default hover:bg-default-soft">
            <Icon name="trash-2" size={16} />
          </button>
        </div>
      ),
    } as any),
  ];

  return (
    <>
      {/* Figma `Section Layout - Table`: white, 1px border/invert/default, radius 12. */}
      <div className="overflow-hidden rounded-xl border border-invert-default bg-surface">
        {/* `Tab Group v2` (44px, 20px side padding, divider under). */}
        <div className="flex border-b border-invert-default px-5">
          {(["flat", "cshaped"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setStation(t); setPage(1); setSelected(new Set()); }}
              className={cn("relative -mb-px h-11 px-4 text-sm font-medium leading-5 transition-colors", station === t ? "text-primary" : "text-body hover:text-default")}
            >
              {t === "flat" ? "Flat Screen" : "C-Shaped"}
              {station === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />}
            </button>
          ))}
        </div>

        {/* `Section Header` (76px, 20px padding): title + count, Search 240, Import List, Add Trainee. */}
        <div className="flex h-[76px] items-center justify-between gap-5 px-5">
          <h3 className="flex items-center gap-2 text-base font-semibold leading-6 text-default">
            Nominal Roll List <span className="text-body">{roll.length}</span>
          </h3>
          <div className="flex items-center gap-3">
            <Input
              size="sm"
              wrapperClassName="w-60"
              placeholder="Search..."
              prefixIcon={<Icon name="search" size={16} />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <button type="button" onClick={() => setShowImport(true)} className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold leading-5 text-default hover:bg-default-soft">
              <Icon name="file-up" size={16} />
              Import List
            </button>
            <button type="button" onClick={() => setDrawer({ mode: "add" })} className="flex h-9 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold leading-5 text-invert-default hover:bg-primary-hovered">
              <Icon name="plus" size={16} />
              Add Trainee
            </button>
          </div>
        </div>

        <TableCustom<DetailTrainee>
          data={paginated}
          columns={columns}
          autoScrollTable
          shadowAction
          classTheadTh="px-5 py-3.5 text-sm leading-5 font-semibold"
          classTBodyTd="h-14 px-5 py-3 align-middle"
          emptySubtitle="This table will be automatically updated once users take action."
        />

        <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
      </div>

      {drawer && (
        <TraineeDrawer
          mode={drawer.mode}
          initial={drawer.trainee}
          unitName={unitName}
          isCollective={isCollective}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          takenSvcIds={roll.filter((t) => t.id !== drawer.trainee?.id).map((t) => t.svcId)}
          onClose={() => setDrawer(null)}
          onSubmit={submitDrawer}
        />
      )}

      {/* Figma `Action - Delete Trainee › Confirmation` (5328:255358). */}
      <ConfirmDialog
        open={deleteTarget !== null}
        tone="danger"
        title={`Delete “${deleteTarget?.name ?? ""}”?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          update((list) => list.filter((t) => t.id !== id));
          setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
          setDeleteTarget(null);
          setToast("Trainee updated");
        }}
      />

      {showImport && (
        <ImportNominalRollModal
          coursewareList={[courseware]}
          hasCShaped={() => true}
          onClose={() => setShowImport(false)}
          onImport={() => {
            const offset = roll.length + 100;
            update((list) => [...list, ...generateTrainees(IMPORT_ROWS, offset).map((t) => ({ ...t, id: `${t.id}-imp-${Date.now()}`, updatedOn: todayLabel() }))]);
            setShowImport(false);
            setToast("1 Nominal Roll List imported");
          }}
        />
      )}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </>
  );
}
