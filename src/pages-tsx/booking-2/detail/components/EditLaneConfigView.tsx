// Booking 2.0 — Booking Details › Edit Lane Configuration (BD-2 part, F-006).
//
// Figma `Edit Lane Config - 5 FS` (5512:166256, section `Action - Edit Lane Config`): a full-screen
// page without sidebar —
//   header   ✕ (44px round) · centred "Edit Lane Configuration" + "#id · programme · courseware"
//            · primary "Confirm"
//   body     courseware name (20 SemiBold) + "Configure this courseware's lanes", "Bulk Assign"
//            box tabs Flat Screen / C-Shaped
//            station cards (2 per row): 4px progress bar, "Flat Screen #1", "12/15 lanes active ·
//            0/12 lanes role-assigned · 0/12 lanes weapon-assigned", "Copy to"; table
//            Lane · Role (Assign ⌄) · Controlled Item/Weapon (Assign ⌄) · Status (sm success toggle;
//            disabled on the occupied Flat Screen lanes 4/11/15)
// Confirm closes the page and the tab shows the toast "Lane configuration updated" (5513:180809).
//
// Copy to / Bulk Assign reuse Create Booking 2.0 Step 3's modals (read-only import). "Add Lane" on
// a C-Shaped station keeps Create Booking's rule (1 → 15 lanes); Figma has no C-Shaped edit frame.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { createColumnHelper, type CellContext } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Toggle } from "@/components/toggle";
import { Checkbox } from "@/components/checkbox";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { COLLECTIVE_TEAM_OPTIONS, COLLECTIVE_WEAPONS } from "@/pages-tsx/booking/create/constants";
import { CSHAPED_MAX, type StationRef } from "@/pages-tsx/booking-2/create/laneConfigTypes";
import { CopyToModal } from "@/pages-tsx/booking-2/create/modals/CopyToModal";
import { BulkAssignModal } from "@/pages-tsx/booking-2/create/modals/BulkAssignModal";
import { isOccupiedLane, type DetailLane, type DetailLaneConfig, type DetailStation } from "./laneConfigStore";

type StationType = "flat" | "cshaped";

const laneSchema = Yup.object({
  // Formik hands "" to Yup as undefined, so an unassigned role is simply optional.
  role: Yup.string(),
  weapon: Yup.array(Yup.string().required()).defined(),
  active: Yup.boolean().defined(),
});
const stationSchema = Yup.object({ name: Yup.string().required(), lanes: Yup.array(laneSchema).min(1) });
// Figma has no error frame for this page: blank lanes may be saved (Confirm is enabled on the
// all-"Assign" frame), so the schema only guards the shape of the data.
const schema = Yup.object({ flat: Yup.array(stationSchema), cshaped: Yup.array(stationSchema) });

/** Options = the Collective lists Create Booking uses, plus anything already on a lane. */
function optionsFrom(base: string[], cfg: DetailLaneConfig, pick: (l: DetailLane) => string[]) {
  const extra = [...cfg.flat, ...cfg.cshaped].flatMap((s) => s.lanes.flatMap(pick)).filter(Boolean);
  return Array.from(new Set([...extra, ...base]));
}

function progress(st: DetailStation, type: StationType) {
  const active = st.lanes.filter((l, i) => l.active && !isOccupiedLane(type, i + 1));
  const activeCount = active.length;
  const roleAssigned = active.filter((l) => !!l.role).length;
  const weaponAssigned = active.filter((l) => l.weapon.length > 0).length;
  const complete = activeCount > 0 && roleAssigned === activeCount && weaponAssigned === activeCount;
  return { activeCount, roleAssigned, weaponAssigned, complete };
}

// ── "Assign ⌄" cell trigger with a portal menu (the table body clips absolute popovers). ──────────
function AssignMenu({
  value, options, multi, onChange,
}: { value: string[]; options: string[]; multi: boolean; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const h = menu.current?.offsetHeight ?? 0;
    const below = r.bottom + 4 + h <= window.innerHeight;
    setPos({ top: below ? r.bottom + 4 : r.top - 4 - h, left: r.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    const close = (e: Event) => { if (!menu.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    window.addEventListener("scroll", close, true);
    return () => { document.removeEventListener("mousedown", away); window.removeEventListener("scroll", close, true); };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex max-w-full items-center gap-1 text-left text-xs font-medium leading-4"
      >
        <span className={cn("truncate", value.length ? "text-default" : "text-body")}>
          {value.length ? value.join(", ") : "Assign"}
        </span>
        <Icon name="chevron-down" size={16} className={cn("text-body transition-transform", open && "rotate-180")} />
      </button>
      {open && createPortal(
        <div
          ref={menu}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[100050] max-h-52 min-w-[200px] overflow-y-auto rounded-lg bg-surface py-1 shadow-lg"
        >
          {options.map((opt) => {
            const on = value.includes(opt);
            return multi ? (
              <label key={opt} className="flex h-9 cursor-pointer items-center gap-2.5 px-3 text-sm font-medium text-default hover:bg-default-soft">
                <Checkbox size={16} checked={on} onChange={() => onChange(on ? value.filter((v) => v !== opt) : [...value, opt])} />
                {opt}
              </label>
            ) : (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange([opt]); setOpen(false); }}
                className={cn("flex h-9 w-full items-center px-3 text-left text-sm font-medium hover:bg-default-soft", on ? "text-primary" : "text-default")}
              >
                {opt}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

type Row = DetailLane & { laneNo: number };

interface CardProps {
  label: string;
  station: DetailStation;
  type: StationType;
  roleOptions: string[];
  weaponOptions: string[];
  onLane: (laneIdx: number, patch: Partial<DetailLane>) => void;
  onCopy: () => void;
  onAddLane: () => void;
}

function StationEditCard({ label, station, type, roleOptions, weaponOptions, onLane, onCopy, onAddLane }: CardProps) {
  const p = progress(station, type);
  const canCopy = p.roleAssigned > 0 || p.weaponAssigned > 0;
  const pct = p.activeCount ? ((p.roleAssigned + p.weaponAssigned) / (2 * p.activeCount)) * 100 : 0;
  const col = createColumnHelper<Row>();
  const rows: Row[] = station.lanes.map((l, i) => ({ ...l, laneNo: i + 1 }));
  const columns = [
    col.accessor("laneNo", {
      header: () => "Lane",
      width: "96px",
      cell: ({ row }: CellContext<Row, unknown>) => (
        <span className={cn("text-xs leading-4", row.original.active ? "text-default" : "text-body")}>Lane {row.original.laneNo}</span>
      ),
    } as any),
    col.accessor("role", {
      header: () => "Role",
      width: "256px",
      cell: ({ row }: CellContext<Row, unknown>) => {
        const l = row.original;
        if (!l.active) return <span className="text-xs leading-4 text-body">—</span>;
        return <AssignMenu value={l.role ? [l.role] : []} options={roleOptions} multi={false} onChange={(v) => onLane(l.laneNo - 1, { role: v[0] ?? "" })} />;
      },
    } as any),
    col.accessor("weapon", {
      header: () => "Controlled Item/Weapon",
      width: "256px",
      cell: ({ row }: CellContext<Row, unknown>) => {
        const l = row.original;
        if (!l.active) return <span className="text-xs leading-4 text-body">—</span>;
        return <AssignMenu value={l.weapon} options={weaponOptions} multi onChange={(v) => onLane(l.laneNo - 1, { weapon: v })} />;
      },
    } as any),
    col.accessor("active", {
      header: () => "Status",
      width: "80px",
      cell: ({ row }: CellContext<Row, unknown>) => {
        const l = row.original;
        const occupied = isOccupiedLane(type, l.laneNo);
        return (
          <Toggle
            size="sm"
            tone="success"
            hideStateLabel
            checked={l.active && !occupied}
            disabled={occupied}
            onChange={(next) => onLane(l.laneNo - 1, { active: next })}
          />
        );
      },
    } as any),
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-invert-default bg-surface">
      {/* `Progress` 4px bar on top of the card. */}
      <div className="h-1 bg-divider">
        <div className="h-full bg-success-default transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-5 text-default">{label}</h4>
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs leading-4">
            <span className="text-body">{p.activeCount}/{station.lanes.length} lanes active</span>
            <span className={p.roleAssigned === p.activeCount && p.activeCount > 0 ? "text-success" : "text-danger"}>
              {p.roleAssigned}/{p.activeCount} lanes role-assigned
            </span>
            <span className={p.weaponAssigned === p.activeCount && p.activeCount > 0 ? "text-success" : "text-danger"}>
              {p.weaponAssigned}/{p.activeCount} lanes weapon-assigned
            </span>
          </p>
        </div>
        <button
          type="button"
          disabled={!canCopy}
          onClick={onCopy}
          className={cn(
            "h-9 shrink-0 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold leading-5",
            canCopy ? "text-default hover:bg-default-soft" : "cursor-not-allowed text-disabled",
          )}
        >
          Copy to
        </button>
      </div>
      <TableCustom<Row>
        data={rows}
        columns={columns}
        tableFixed
        autoScrollTable={false}
        actionSticky={false}
        classTheadTh="px-4 py-2.5 text-xs leading-4 font-semibold"
        classTBody="hover:bg-surface [&:last-child>td]:border-b-0"
        classTBodyTd="h-9 px-4 py-2 align-middle"
      />
      {type === "cshaped" && (
        <div className="border-t border-invert-default px-4 py-3">
          <button
            type="button"
            disabled={station.lanes.length >= CSHAPED_MAX}
            onClick={onAddLane}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold",
              station.lanes.length >= CSHAPED_MAX ? "cursor-not-allowed text-disabled" : "text-primary",
            )}
          >
            <Icon name="plus" size={16} /> Add Lane
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  bookingId: string;
  program: string;
  courseware: string;
  initial: DetailLaneConfig;
  onClose: () => void;
  onConfirm: (cfg: DetailLaneConfig) => void;
}

export function EditLaneConfigView({ bookingId, program, courseware, initial, onClose, onConfirm }: Props) {
  const types = (["flat", "cshaped"] as const).filter((t) => initial[t].length > 0);
  const [type, setType] = useState<StationType>(types[0] ?? "flat");
  const [copySource, setCopySource] = useState<StationRef | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const roleOptions = optionsFrom(COLLECTIVE_TEAM_OPTIONS, initial, (l) => [l.role]);
  const weaponOptions = optionsFrom(COLLECTIVE_WEAPONS, initial, (l) => l.weapon);

  const labelOf = (t: StationType, i: number) => `${t === "flat" ? "Flat Screen" : "C-Shaped"} #${i + 1}`;
  const refsOf = (cfg: DetailLaneConfig, t: StationType): StationRef[] =>
    cfg[t].map((_, i) => ({ courseware, type: t, index: i, label: labelOf(t, i) }));

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-default-soft">
      <Formik<DetailLaneConfig>
        initialValues={initial}
        validationSchema={schema}
        onSubmit={(values) => onConfirm(values)}
      >
        {({ values, setFieldValue, handleSubmit }) => {
          const setStation = (t: StationType, i: number, st: DetailStation) => setFieldValue(`${t}.${i}`, st);
          const patchLane = (t: StationType, i: number, li: number, patch: Partial<DetailLane>) => {
            const st = values[t][i];
            setStation(t, i, { ...st, lanes: st.lanes.map((l, k) => (k === li ? { ...l, ...patch } : l)) });
          };
          const stations = values[type];
          const pairs: number[][] = [];
          for (let i = 0; i < stations.length; i += 2) pairs.push(stations.length > i + 1 ? [i, i + 1] : [i]);

          return (
            <>
              {/* `Header Nav - Edit Lane Config` (60px). */}
              <header className="relative flex h-[60px] shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-soft"
                >
                  <Icon name="x" size={18} />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                  <p className="text-base font-semibold leading-6 text-default">Edit Lane Configuration</p>
                  <p className="text-xs leading-4 text-body">
                    <span className="text-default">#{bookingId.replace(/^#/, "")}</span> · <span className="text-default">{program}</span> · {courseware}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="h-11 rounded-lg bg-primary-default px-5 text-sm font-semibold leading-5 text-invert-default hover:bg-primary-hovered"
                >
                  Confirm
                </button>
              </header>

              <div className="flex-1 overflow-auto p-6">
                {/* `Page Header`. */}
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-semibold leading-7 text-default">{courseware}</h2>
                    <p className="mt-1 text-xs leading-4 text-body">Configure this courseware's lanes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkOpen(true)}
                    className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold leading-5 text-default hover:bg-default-soft"
                  >
                    Bulk Assign
                  </button>
                </div>

                {/* `Box Tab Group`. */}
                <div className="mt-6 flex gap-3">
                  {types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "h-9 rounded-lg border px-3 text-sm font-medium leading-5 transition-colors",
                        type === t
                          ? "border-primary bg-primary-invert-soft text-primary"
                          : "border-invert-default bg-default-default text-body hover:text-default",
                      )}
                    >
                      {t === "flat" ? "Flat Screen" : "C-Shaped"}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  {pairs.map((pair) => (
                    <div key={pair[0]} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                      {pair.map((i) => (
                        <StationEditCard
                          key={`${type}-${i}`}
                          label={labelOf(type, i)}
                          station={stations[i]}
                          type={type}
                          roleOptions={roleOptions}
                          weaponOptions={weaponOptions}
                          onLane={(li, patch) => patchLane(type, i, li, patch)}
                          onCopy={() => setCopySource({ courseware, type, index: i, label: labelOf(type, i) })}
                          onAddLane={() => {
                            const st = stations[i];
                            if (st.lanes.length < CSHAPED_MAX) setStation(type, i, { ...st, lanes: [...st.lanes, { role: "", weapon: [], active: true }] });
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {copySource && (() => {
                const src = values[copySource.type][copySource.index];
                const p = progress(src, copySource.type);
                return (
                  <CopyToModal
                    source={copySource}
                    sourceProgress={p}
                    stationType={copySource.type}
                    coursewareList={[courseware]}
                    stationsByCourseware={() => refsOf(values, copySource.type)}
                    onClose={() => setCopySource(null)}
                    onConfirm={(targets) => {
                      targets.forEach((t) => {
                        const dst = values[t.type][t.index];
                        setStation(t.type, t.index, {
                          ...dst,
                          lanes: src.lanes
                            .slice(0, t.type === "flat" ? dst.lanes.length : undefined)
                            .map((l, li) => ({ ...l, weapon: [...l.weapon], active: l.active && !isOccupiedLane(t.type, li + 1) })),
                        });
                      });
                      setCopySource(null);
                    }}
                  />
                );
              })()}

              {bulkOpen && (
                <BulkAssignModal
                  isCollective
                  roleOptions={roleOptions}
                  weaponOptions={weaponOptions}
                  coursewareList={[courseware]}
                  flatStationsByCourseware={() => refsOf(values, "flat")}
                  cshapedStationsByCourseware={() => refsOf(values, "cshaped")}
                  activeLaneCountFor={(s) => progress(values[s.type][s.index], s.type).activeCount}
                  onClose={() => setBulkOpen(false)}
                  onConfirm={(role, weapon, targets) => {
                    // Only the field(s) filled in the modal change, and only on lanes switched on.
                    targets.forEach((t) => {
                      const st = values[t.type][t.index];
                      setStation(t.type, t.index, {
                        ...st,
                        lanes: st.lanes.map((l, li) =>
                          !l.active || isOccupiedLane(t.type, li + 1)
                            ? l
                            : { ...l, role: role || l.role, weapon: weapon ? [weapon] : l.weapon }),
                      });
                    });
                    setBulkOpen(false);
                  }}
                />
              )}
            </>
          );
        }}
      </Formik>
    </div>
  );
}
