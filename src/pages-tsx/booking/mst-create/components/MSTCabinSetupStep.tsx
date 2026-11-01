// MST Create Booking — Step 3: Cabin Configuration (CM-3, Figma `↪ Step 3 - Cabin Config` 6183:422450).
//
// Frames: Single (Max 1 types) 6183:422470 Empty · 6189:120503 Selected · 6189:121104 Filled · 6189:129510
// Call Sign dropdown · 6189:131225 / 8108:199466 / 8108:197740 / 8108:200099 errors · IOS 6189:132000 …
// 6189:137095 · Multiple (Standalone) 6189:150567 … 6189:150575.
//
// Layout: Cabin table (920) | IOS card (448), 24px apart, under the optional danger Alert.
//   Cabin  radio (1 cabin) or checkbox (several) · "MST-01" · Platform Type select · Role chips with
//          "All roles selected" / "1 of 2 roles" · Call Sign select with search. Rows that are Occupied or
//          Unavailable are grey; once the booked amount is reached the other rows are disabled.
//   IOS    "1 master required · up to 3 more optional". IOS 1 is always the Master (badge "Master"); IOS 2-4 are
//          "Optional" and can be removed. Each card is Save → collapsed chips → Edit.
// A cabin counts as completed with a Platform Type, at least one Role AND a Call Sign (6189:121104 vs
// 8108:199466) — Call Sign was optional before.
// This is a new wizard-only step; `MSTCabinConfigStep` stays as it was for Booking Detail and MST+TCT.
import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Alert } from "@/components/alert";
import { ChipAdvanced } from "@/components/chip-advanced";
import { Checkbox } from "@/components/checkbox";
import { Chip } from "@/components/chip";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Radio } from "@/components/radio";
import { Select } from "@/components/select";
import { StatusBadge } from "@/components/status-badge";
import { TableCustom } from "@/components/table";
import { callSigns } from "@/data/mstTctMasterData";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { cn } from "@/lib/utils";
import { cabinLabel, freeCabinCount } from "../cabinAvailability";
import { MST_ROLES_BY_KIND, mstTrainingKind } from "../mstTrainingTypes";
import { BASE_STATION_OPTIONS, IOS_OPTIONS, type CabinRow, type IosEntry } from "./MSTCabinConfigStep";
import { FieldLabel, SearchSelect, SectionCard } from "./MSTFields";

const CALL_SIGN_OPTIONS = callSigns.filter((c) => c.status === "Active").map((c) => c.name);
const FORCE_TYPES = ["Opposing", "Friendly"] as const;
const MAX_IOS = 4; // 1 master + up to 3 optional
const columnHelper = createColumnHelper<CabinRow>();

const rolesOf = (c: CabinRow) => (c.role ? c.role.split(",").filter(Boolean) : []);
const cabinComplete = (c: CabinRow) => !!c.weaponVariant && rolesOf(c).length > 0 && !!c.callSign;
const iosComplete = (e: IosEntry) => !!e.iosDevice && !!e.baseStation && !!e.forceType && (!HIDDEN_FEATURES.mstMasterIosToggle || !!e.masterIOS);

export const newIos = (master: boolean): IosEntry => ({
  uid: Date.now() + Math.floor(Math.random() * 1000), iosDevice: "", baseStation: BASE_STATION_OPTIONS[0], masterIOS: master ? "Yes" : "No", forceType: "",
});

/** Cabins a booking must finish: the booked amount, but never more than the free cabins on that date. */
export function requiredCabinCount(cabinAmount: number, date: Date | null) {
  return Math.max(1, Math.min(cabinAmount, freeCabinCount(date) || cabinAmount));
}

export function MSTCabinSetupStep({ trainingType, cabinAmount, date, platformOptions, cabins, onCabinsChange, iosList, onIosChange, validateRef }: {
  trainingType: string;
  cabinAmount: number;
  date: Date | null;
  platformOptions: string[];
  cabins: CabinRow[];
  onCabinsChange: (next: CabinRow[]) => void;
  iosList: IosEntry[];
  onIosChange: (next: IosEntry[]) => void;
  /** Filled with the wizard's "Next" check: shows the errors and resolves whether Step 3 is complete. */
  validateRef: MutableRefObject<(() => boolean) | null>;
}) {
  const kind = mstTrainingKind(trainingType);
  const roleOptions = MST_ROLES_BY_KIND[kind ?? "Standalone"];
  const required = requiredCabinCount(cabinAmount, date);
  const single = cabinAmount === 1;

  const [submitted, setSubmitted] = useState(false);
  /** IOS cards open for editing: new and incomplete ones; Save (or nothing to edit) collapses a complete card. */
  const [openUids, setOpenUids] = useState<Set<number>>(() => new Set(iosList.filter((e) => !iosComplete(e)).map((e) => e.uid)));
  const [triedUids, setTriedUids] = useState<Set<number>>(new Set());

  // ── cabin state ──
  const selectedCount = cabins.filter((c) => c.selected).length;
  const atCap = selectedCount >= required;
  const completedCabins = cabins.filter((c) => c.selected && cabinComplete(c)).length;
  const patchCabin = (id: string, patch: Partial<CabinRow>) =>
    onCabinsChange(cabins.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const selectCabin = (id: string, on: boolean) => {
    if (on && single) {
      onCabinsChange(cabins.map((c) => ({ ...c, selected: c.id === id, role: c.id === id && !c.role ? roleOptions.join(",") : c.role })));
      return;
    }
    if (on && atCap) return;
    onCabinsChange(cabins.map((c) => (c.id === id ? { ...c, selected: on, role: on && !c.role ? roleOptions.join(",") : c.role } : c)));
  };
  /** Editing a field of a free row picks that row first (nothing is disabled until the amount is reached). */
  const editCabin = (row: CabinRow, patch: Partial<CabinRow>) => {
    if (row.selected) return patchCabin(row.id, patch);
    if (single) return onCabinsChange(cabins.map((c) => (c.id === row.id ? { ...c, selected: true, role: c.role || roleOptions.join(","), ...patch } : { ...c, selected: false })));
    patchCabin(row.id, { selected: true, role: row.role || roleOptions.join(","), ...patch });
  };

  // ── IOS state ──
  const master = HIDDEN_FEATURES.mstMasterIosToggle ? iosList.find((e) => e.masterIOS === "Yes") : iosList[0];
  const masterComplete = !!master && iosComplete(master);
  const isOpen = (e: IosEntry) => openUids.has(e.uid);
  const completedIos = iosList.filter(iosComplete).length;
  const patchIos = (uid: number, patch: Partial<IosEntry>) =>
    onIosChange(iosList.map((e) => {
      if (e.uid === uid) return { ...e, ...patch };
      // Legacy switch (flag): only one Master — a new Yes demotes the old holder.
      return patch.masterIOS === "Yes" && e.masterIOS === "Yes" ? { ...e, masterIOS: "No" } : e;
    }));
  const setOpen = (uid: number, on: boolean) => setOpenUids((p) => { const n = new Set(p); if (on) n.add(uid); else n.delete(uid); return n; });
  const openEditor = (e: IosEntry) => setOpen(e.uid, true);
  const saveIos = (e: IosEntry) => {
    setTriedUids((s) => new Set(s).add(e.uid));
    if (iosComplete(e)) setOpen(e.uid, false);
  };
  const addIos = () => { const e = newIos(false); onIosChange([...iosList, e]); setOpen(e.uid, true); };
  const removeIos = (uid: number) => { onIosChange(iosList.filter((e) => e.uid !== uid)); setOpen(uid, false); };

  // ── errors (Figma 6189:131225 / 8108:199466 / 8108:197740 / 8108:200099 / 6189:150569) ──
  const message = (() => {
    const cabinsOk = completedCabins >= required;
    const optionalIdx = iosList.findIndex((e) => e !== master && !iosComplete(e));
    if (!cabinsOk && !masterComplete) return single ? `Complete ${required} cabin and the master IOS to continue.` : "Cabin configuration is not completed.";
    if (!cabinsOk) return single ? `Complete ${required} cabin to continue.` : "Cabin configuration is not completed.";
    if (!masterComplete) return "Complete the master IOS to continue.";
    if (optionalIdx >= 0) return `Complete IOS ${optionalIdx + 1} or remove it to continue.`;
    return null;
  })();
  useEffect(() => {
    validateRef.current = () => {
      setSubmitted(true);
      setTriedUids(new Set(iosList.filter((e) => !iosComplete(e)).map((e) => e.uid)));
      return message === null;
    };
    return () => { validateRef.current = null; };
  }, [validateRef, message, iosList]);

  // ── cabin table ──
  const columns = useMemo<(ColumnDef<CabinRow, any> & { width?: string; minWidth?: string })[]>(() => {
    const off = (c: CabinRow) => c.occupied || c.unavailable;
    const blocked = (c: CabinRow) => !c.selected && atCap;
    return [
      { ...columnHelper.display({
        id: "select",
        header: () => null,
        cell: ({ row }) => {
          const c = row.original;
          if (off(c)) return null;
          return single
            ? <Radio name="mst-cabin" value={c.id} label="" checked={c.selected} onChange={() => selectCabin(c.id, true)} className="h-5 gap-0" />
            : <Checkbox size={18} checked={c.selected} disabled={blocked(c)} onChange={() => selectCabin(c.id, !c.selected)} />;
        },
      }), width: "48px", minWidth: "48px" },
      { ...columnHelper.accessor("id", {
        header: () => "Cabin",
        cell: ({ row }) => <span className={cn("text-sm", off(row.original) ? "text-body" : "text-default")}>{cabinLabel(row.original.id)}</span>,
      }), width: "96px", minWidth: "96px" },
      { ...columnHelper.display({
        id: "platform",
        header: () => "Platform Type",
        cell: ({ row }) => {
          const c = row.original;
          if (off(c)) return <span className="text-sm text-body">{c.occupied ? "Occupied" : "Unavailable"}</span>;
          return <Select options={platformOptions} placeholder="Select Platform Type" value={c.weaponVariant} onChange={(v) => editCabin(c, { weaponVariant: v })} disabled={blocked(c)} wrapperClassName="w-[200px]" />;
        },
      }), width: "240px", minWidth: "240px" },
      { ...columnHelper.display({
        id: "role",
        header: () => "Role",
        cell: ({ row }) => {
          const c = row.original;
          if (off(c)) return null;
          const picked = rolesOf(c);
          const only = roleOptions.length === 1;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex gap-3">
                {roleOptions.map((r) => (
                  <ChipAdvanced
                    key={r} label={r} multi disabled={blocked(c)} selected={only ? true : picked.includes(r)}
                    onSelect={() => {
                      if (only) return;
                      editCabin(c, { role: (picked.includes(r) ? picked.filter((x) => x !== r) : [...picked, r]).join(",") });
                    }}
                    className={only ? "cursor-default" : undefined}
                  />
                ))}
              </div>
              <p className="text-xs text-caption">
                {only ? "Only role for this training type" : picked.length === roleOptions.length ? "All roles selected" : `${picked.length} of ${roleOptions.length} roles`}
              </p>
            </div>
          );
        },
      }), width: "336px", minWidth: "336px" },
      { ...columnHelper.display({
        id: "callSign",
        header: () => "Call Sign",
        cell: ({ row }) => {
          const c = row.original;
          if (off(c)) return null;
          return <SearchSelect compact placeholder="Select Call Sign" options={CALL_SIGN_OPTIONS} value={c.callSign} onChange={(v) => editCabin(c, { callSign: v })} disabled={blocked(c)} className="w-[160px]" />;
        },
      }), width: "200px", minWidth: "200px" },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabins, atCap, single, platformOptions, roleOptions, required]);

  return (
    <div className="flex-1 overflow-auto bg-main-background p-6">
      <div className="flex flex-col gap-6">
        {submitted && message && <Alert status="danger" message={message} />}

        <div className="flex items-start gap-6">
          <SectionCard
            className="min-w-0 flex-1"
            title="Cabin Configuration"
            subtitle={trainingType}
            right={<StatusBadge>{completedCabins}/{required} cabin completed</StatusBadge>}
          >
            <div className="-mx-5 -mb-5">
              <TableCustom<CabinRow>
                data={cabins} columns={columns} autoScrollTable={false} actionSticky={false} tableFixed
                outerClass="overflow-visible"
                classTheadTh="px-5 py-3 text-sm font-semibold text-primary"
                classTBodyTd="px-5 py-3 align-middle"
                getRowClass={(c: CabinRow) => (c.occupied || c.unavailable ? "[&>td]:bg-default-default" : "")}
              />
            </div>
          </SectionCard>

          <SectionCard
            className="w-[448px] flex-shrink-0"
            title="IOS"
            subtitle="1 master required · up to 3 more optional"
            right={<StatusBadge>{completedIos}/{iosList.length} completed</StatusBadge>}
          >
            {iosList.map((e, idx) => {
              const isMaster = e === master;
              const open = isOpen(e);
              const tried = triedUids.has(e.uid);
              const used = iosList.filter((o) => o.uid !== e.uid && o.iosDevice).map((o) => o.iosDevice);
              return (
                <div key={e.uid} className="rounded-lg border border-invert-default bg-surface">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="text-sm font-semibold text-default">IOS {idx + 1}</span>
                      {isMaster
                        ? <span className="rounded-full border border-invert-primary bg-primary-invert-default px-2 py-0.5 text-xs font-medium text-primary">Master</span>
                        : <StatusBadge className="px-2 py-0.5 text-xs">Optional</StatusBadge>}
                    </div>
                    <div className="flex items-center gap-3">
                      {open ? (
                        <button type="button" onClick={() => saveIos(e)} className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft">
                          <Icon name="save" size={16} />Save
                        </button>
                      ) : (
                        <button type="button" onClick={() => openEditor(e)} className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft">
                          <Icon name="pencil" size={16} />Edit
                        </button>
                      )}
                      {!isMaster && (
                        <button type="button" aria-label={`Remove IOS ${idx + 1}`} onClick={() => removeIos(e.uid)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft">
                          <Icon name="trash-2" size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {open ? (
                    <div className="flex flex-col gap-4 px-4 pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="IOS" required placeholder="Select IOS" options={IOS_OPTIONS.filter((o) => !used.includes(o))}
                          value={e.iosDevice} onChange={(v) => patchIos(e.uid, { iosDevice: v })}
                          status={tried && !e.iosDevice ? "danger" : "default"} caption={tried && !e.iosDevice ? "IOS is required" : undefined}
                        />
                        <Input label="Base Station" value={e.baseStation} readOnly disabled />
                      </div>
                      <div className="flex flex-col gap-1">
                        <FieldLabel required>Force Type</FieldLabel>
                        <div className="flex gap-3">
                          {FORCE_TYPES.map((f) => (
                            <ChipAdvanced key={f} label={f} selected={e.forceType === f} onSelect={() => patchIos(e.uid, { forceType: f })} />
                          ))}
                        </div>
                        {tried && !e.forceType && <p className="text-xs text-danger">Force Type is required</p>}
                      </div>
                      {HIDDEN_FEATURES.mstMasterIosToggle && (
                        <div className="flex flex-col gap-1">
                          <FieldLabel required>Master IOS</FieldLabel>
                          <div className="flex gap-3">
                            {(["Yes", "No"] as const).map((opt) => {
                              const taken = opt === "Yes" && e.masterIOS !== "Yes" && iosList.some((o) => o.uid !== e.uid && o.masterIOS === "Yes");
                              return <ChipAdvanced key={opt} label={opt} selected={e.masterIOS === opt} disabled={taken} onSelect={() => patchIos(e.uid, { masterIOS: opt })} />;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 px-4 pb-4">
                      {[e.iosDevice, e.baseStation, isMaster ? "Master: Yes" : null, e.forceType].filter(Boolean).map((t) => (
                        <Chip key={t} kind="filled">{t}</Chip>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {iosList.length < MAX_IOS && (
              <button type="button" onClick={addIos} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-soft">
                <Icon name="plus" size={16} />Add Another IOS
              </button>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
