import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, X } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { platformTypes, callSigns } from "@/data/mstTctMasterData";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CabinRow {
  id:            string;
  occupied:      boolean;
  selected:      boolean;
  weaponVariant: string;
  role:          string;
  callSign:      string;
}

interface IosEntry {
  uid:         number;
  iosDevice:   string;
  baseStation: string;
  masterIOS:   "Yes" | "No" | "";
  forceType:   "Opposing" | "Friendly" | "";
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Platform Type / Call Sign now come from MST/TCT Master Data (see
// src/data/mstTctMasterData.ts, editable at Settings > MST/TCT Master Data)
// instead of being hardcoded here — only Active entries are offered.
const WEAPON_VARIANT_OPTIONS = platformTypes.filter((p) => p.status === "Active").map((p) => p.name);
const ROLE_OPTIONS           = ["VO", "VC", "SC", "SO"];
const FORCE_TYPE_OPTIONS     = ["Opposing", "Friendly"];
const IOS_OPTIONS            = ["MSTIOS01", "MSTIOS02", "MSTIOS03", "MSTIOS04"];
const BASE_STATION_OPTIONS   = ["BMS1ForceSide"];
const CALL_SIGN_OPTIONS = callSigns.filter((c) => c.status === "Active").map((c) => c.name);

// Pre-populated with weapon variants matching the booking creation mock
const INITIAL_CABINS: CabinRow[] = [
  { id: "MST_CABIN_01", occupied: false, selected: true,  weaponVariant: "40AGL", role: "", callSign: "" },
  { id: "MST_CABIN_02", occupied: false, selected: true,  weaponVariant: "40AGL", role: "", callSign: "" },
  { id: "MST_CABIN_03", occupied: true,  selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_04", occupied: false, selected: true,  weaponVariant: "50HMG", role: "", callSign: "" },
  { id: "MST_CABIN_05", occupied: true,  selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_06", occupied: false, selected: true,  weaponVariant: "40AGL", role: "", callSign: "" },
  { id: "MST_CABIN_07", occupied: true,  selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_08", occupied: false, selected: true,  weaponVariant: "50HMG", role: "", callSign: "" },
  { id: "MST_CABIN_09", occupied: true,  selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_10", occupied: true,  selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_11", occupied: false, selected: false, weaponVariant: "",       role: "", callSign: "" },
  { id: "MST_CABIN_12", occupied: false, selected: false, weaponVariant: "",       role: "", callSign: "" },
];

const columnHelper = createColumnHelper<CabinRow>();

// ── Sub-components (mirrors MSTCabinConfigStep's create-booking styling) ──────

/** Compact dropdown used inside table cells */
function TableDropdown({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap transition-colors max-w-[160px] w-full"
      >
        <span className={cn("flex-1 text-left truncate", value ? "text-gray-800" : "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] py-1 min-w-[170px]">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              {opt}
              {value === opt && <Check size={11} className="text-brand-primary flex-shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Multi-select dropdown for Role column — stores comma-separated values in role: string */
function MultiRoleDropdown({ value, onChange, options = ROLE_OPTIONS }: {
  value: string; onChange: (v: string) => void; options?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected    = value ? value.split(",").filter(Boolean) : [];
  const allChecked  = options.every(r => selected.includes(r));
  const someChecked = selected.length > 0 && !allChecked;

  const toggleAll = () => onChange(allChecked ? "" : options.join(","));

  const toggleRole = (role: string) => {
    const next = selected.includes(role)
      ? selected.filter(r => r !== role)
      : [...selected, role];
    onChange(next.join(","));
  };

  const label = selected.length > 0 ? selected.join(", ") : "Select roles";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md hover:border-gray-300 bg-white transition-colors w-full max-w-[180px]"
      >
        <span className={cn("flex-1 text-left truncate", selected.length > 0 ? "text-gray-800" : "text-gray-400")}>
          {label}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] py-1 min-w-[150px]">
          <button
            type="button"
            onClick={toggleAll}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <div className={cn(
              "w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              allChecked  ? "bg-brand-primary border-brand-primary" :
              someChecked ? "bg-brand-primary/20 border-brand-primary/50" : "border-gray-300",
            )}>
              {allChecked  && <Check size={8} className="text-white" strokeWidth={3} />}
              {someChecked && !allChecked && <span className="w-1.5 h-0.5 bg-brand-primary block rounded-full" />}
            </div>
            All
          </button>

          <div className="h-px bg-gray-100 mx-2 my-0.5" />

          {options.map(role => {
            const checked = selected.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <div className={cn(
                  "w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  checked ? "bg-brand-primary border-brand-primary" : "border-gray-300",
                )}>
                  {checked && <Check size={8} className="text-white" strokeWidth={3} />}
                </div>
                {role}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Searchable (Select2-style) dropdown used for Call Sign column */
function SearchableTableDropdown({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap transition-colors max-w-[160px] w-full"
      >
        <span className={cn("flex-1 text-left truncate", value ? "text-gray-800" : "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] min-w-[170px]">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="max-h-40 overflow-y-auto py-1">
            {filtered.length > 0 ? filtered.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                {opt}
                {value === opt && <Check size={11} className="text-brand-primary flex-shrink-0 ml-1" />}
              </button>
            )) : (
              <p className="px-3 py-2 text-xs text-gray-400 italic">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Full-width custom select for the IOS panel */
function PanelDropdown({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none",
          open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300"
        )}
      >
        <span className={cn("flex-1 text-left", value ? "text-gray-800" : "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={cn("text-gray-400 flex-shrink-0 ml-2 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {opt}
              {value === opt && <Check size={14} className="text-brand-primary flex-shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MSTOnboardingCabinConfig({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [cabins, setCabins]   = useState<CabinRow[]>(INITIAL_CABINS);
  const [iosList, setIosList] = useState<IosEntry[]>([
    { uid: 1, iosDevice: "MSTIOS02", baseStation: "BMS1ForceSide", masterIOS: "", forceType: "" },
  ]);
  const [editingUid, setEditingUid] = useState<number | null>(1);
  /** Snapshot of the entry's fields when it was opened for editing — used to detect unsaved changes */
  const [editSnapshot, setEditSnapshot] = useState<IosEntry | null>(
    () => iosList.find(e => e.uid === 1) ?? null
  );

  const availableCabins = cabins.filter(c => !c.occupied);
  const selectedCount   = cabins.filter(c => !c.occupied && c.selected).length;
  const allSelected     = availableCabins.length > 0 && availableCabins.every(c => c.selected);
  const someSelected    = availableCabins.some(c => c.selected);

  const toggleAll = useCallback(() => {
    const shouldSelect = !allSelected;
    setCabins(prev => prev.map(c => c.occupied ? c : { ...c, selected: shouldSelect }));
  }, [allSelected]);

  const toggleCabin = useCallback((id: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  }, []);

  const setWeaponVariant = useCallback((id: string, variant: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, weaponVariant: variant } : c));
  }, []);

  const setRole = useCallback((id: string, role: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, role } : c));
  }, []);

  const setCallSign = useCallback((id: string, callSign: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, callSign } : c));
  }, []);

  // ── IOS list helpers ────────────────────────────────────────────────────────
  const iosFieldsEqual = (a: IosEntry, b: IosEntry) =>
    a.iosDevice === b.iosDevice && a.baseStation === b.baseStation &&
    a.masterIOS === b.masterIOS && a.forceType === b.forceType;

  const editingEntry = editingUid !== null ? iosList.find(e => e.uid === editingUid) ?? null : null;
  const isEditingDirty = !!(editSnapshot && editingEntry && !iosFieldsEqual(editSnapshot, editingEntry));

  /** Opens an entry for editing — reverting any unsaved edits on the entry currently open. */
  const openIOSEditor = (uid: number) => {
    setIosList(prev =>
      editingUid !== null && editSnapshot
        ? prev.map(e => e.uid === editingUid ? editSnapshot : e)
        : prev
    );
    setEditSnapshot(iosList.find(e => e.uid === uid) ?? null);
    setEditingUid(uid);
  };

  /** Accepts the current edits on the open entry and collapses it. */
  const saveIOSEditor = () => {
    setEditSnapshot(null);
    setEditingUid(null);
  };

  const addIOS = () => {
    const newUid = Date.now();
    const newEntry: IosEntry = { uid: newUid, iosDevice: "", baseStation: "", masterIOS: "", forceType: "" };
    setIosList(prev => {
      const reverted = editingUid !== null && editSnapshot
        ? prev.map(e => e.uid === editingUid ? editSnapshot : e)
        : prev;
      return [...reverted, newEntry];
    });
    setEditSnapshot(newEntry);
    setEditingUid(newUid);
  };

  const removeIOS = (uid: number) => {
    setIosList(prev => prev.filter(e => e.uid !== uid));
    setEditingUid(prev => prev === uid ? null : prev);
    setEditSnapshot(prev => (editingUid === uid ? null : prev));
  };

  const updateIOS = (uid: number, field: keyof Omit<IosEntry, "uid">, value: string) => {
    setIosList(prev => prev.map(e => {
      if (e.uid === uid) return { ...e, [field]: value };
      // Only one IOS may be Master at a time — picking a new Master demotes any other.
      if (field === "masterIOS" && value === "Yes" && e.masterIOS === "Yes") {
        return { ...e, masterIOS: "No" };
      }
      return e;
    }));
  };

  const columns = useMemo<ColumnDef<CabinRow, any>[]>(() => [
    columnHelper.display({
      id: "select",
      header: () => (
        <button
          type="button"
          onClick={toggleAll}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            allSelected
              ? "bg-brand-primary border-brand-primary"
              : someSelected
                ? "bg-brand-primary/30 border-brand-primary/50"
                : "border-gray-300 hover:border-gray-400"
          )}
        >
          {allSelected  && <Check size={10} className="text-white" strokeWidth={3} />}
          {someSelected && !allSelected && <span className="w-2 h-px bg-brand-primary" />}
        </button>
      ),
      cell: ({ row }) => row.original.occupied ? null : (
        <button
          type="button"
          onClick={() => toggleCabin(row.original.id)}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            row.original.selected
              ? "bg-brand-primary border-brand-primary"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          {row.original.selected && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
      ),
    }),

    columnHelper.accessor("id", {
      header: () => "Cabin",
      cell: ({ row }) => (
        <span className={cn(
          "text-sm font-medium",
          row.original.occupied ? "text-gray-400" :
          row.original.selected ? "text-gray-800" : "text-gray-600"
        )}>
          {row.original.id}
        </span>
      ),
    }),

    columnHelper.display({
      id: "weaponVariant",
      header: () => "Platform Type",
      cell: ({ row }) => row.original.occupied ? (
        <span className="text-sm text-gray-400 italic">Occupied</span>
      ) : (
        <TableDropdown
          value={row.original.weaponVariant}
          onChange={(v) => setWeaponVariant(row.original.id, v)}
          options={WEAPON_VARIANT_OPTIONS}
          placeholder="Platform Type"
        />
      ),
    }),

    columnHelper.display({
      id: "role",
      header: () => "Role",
      cell: ({ row }) => row.original.occupied ? null : (
        <MultiRoleDropdown
          value={row.original.role}
          onChange={(v) => setRole(row.original.id, v)}
        />
      ),
    }),

    columnHelper.display({
      id: "callSign",
      header: () => "Call Sign",
      cell: ({ row }) => row.original.occupied ? null : (
        <SearchableTableDropdown
          value={row.original.callSign}
          onChange={(v) => setCallSign(row.original.id, v)}
          options={CALL_SIGN_OPTIONS}
          placeholder="Call Sign"
        />
      ),
    }),
  ], [allSelected, someSelected, toggleAll, toggleCabin, setWeaponVariant, setRole, setCallSign]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Cabin Configuration</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the cabin before start of the training.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Confirm cabin configuration <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Cabin Configuration{" "}
              <span className="font-normal text-gray-400">({selectedCount}/{availableCabins.length} Cabins)</span>
            </h3>
          </div>

          {/* 60/40 layout — matches Create Booking's Cabin Configuration step */}
          <div className="grid grid-cols-[55%_45%] gap-4 items-start p-4">

            {/* Left: cabin table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <TableCustom<CabinRow>
                data={cabins}
                columns={columns}
                autoScrollTable={true}
                actionSticky={false}
                classTheadTh="!px-4 !py-3 !text-xs"
                classTBodyTd="!px-4 !py-2.5 !h-auto"
              />
            </div>

            {/* Right: IOS Configuration list */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3">
                {iosList.map((entry, idx) => {
                  const isEditing = editingUid === entry.uid;
                  const isFilled  = !!entry.iosDevice;

                  if (!isEditing) {
                    return (
                      <div key={entry.uid} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-700 mb-1">IOS {idx + 1}</p>
                          {isFilled ? (
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                entry.iosDevice,
                                entry.baseStation,
                                entry.masterIOS ? `Master: ${entry.masterIOS}` : null,
                                entry.forceType,
                              ].filter(Boolean).map((chip, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white border border-gray-200 text-gray-600 whitespace-nowrap">
                                  {chip}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Not configured</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openIOSEditor(entry.uid)}
                            className="text-[11px] font-medium text-brand-primary hover:underline transition-colors"
                          >
                            Edit
                          </button>
                          {iosList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeIOS(entry.uid)}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const usedIosDevices = iosList
                    .filter(e => e.uid !== entry.uid && e.iosDevice !== "")
                    .map(e => e.iosDevice);
                  const availableIosOptions = IOS_OPTIONS.filter(opt => !usedIosDevices.includes(opt));

                  return (
                    <div key={entry.uid} className="rounded-lg border border-brand-primary/30 bg-white p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          IOS {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {isEditingDirty && (
                            <button
                              type="button"
                              onClick={saveIOSEditor}
                              className="text-[11px] font-semibold text-brand-primary hover:underline transition-colors"
                            >
                              Save
                            </button>
                          )}
                          {iosList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeIOS(entry.uid)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Select IOS <span className="text-brand-primary">*</span>
                          </label>
                          <PanelDropdown
                            value={entry.iosDevice}
                            onChange={(v) => updateIOS(entry.uid, "iosDevice", v)}
                            options={availableIosOptions}
                            placeholder="Choose IOS"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Base Station <span className="text-brand-primary">*</span>
                          </label>
                          <PanelDropdown
                            value={entry.baseStation}
                            onChange={(v) => updateIOS(entry.uid, "baseStation", v)}
                            options={BASE_STATION_OPTIONS}
                            placeholder="Choose base station"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Master IOS <span className="text-brand-primary">*</span>
                        </label>
                        <div className="flex gap-2">
                          {(["Yes", "No"] as const).map(opt => {
                            // Only one Master IOS per booking: "Yes" is locked while another IOS holds it.
                            const masterTaken = opt === "Yes" && entry.masterIOS !== "Yes" &&
                              iosList.some(o => o.uid !== entry.uid && o.masterIOS === "Yes");
                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={masterTaken}
                                title={masterTaken ? "Another IOS is already the Master" : undefined}
                                onClick={() => updateIOS(entry.uid, "masterIOS", opt)}
                                className={cn(
                                  "flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                                  masterTaken && "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed",
                                  !masterTaken && (entry.masterIOS === opt
                                    ? "bg-brand-primary text-white border-brand-primary"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Force Type <span className="text-brand-primary">*</span>
                        </label>
                        <div className="flex gap-2">
                          {(FORCE_TYPE_OPTIONS as ("Opposing" | "Friendly")[]).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateIOS(entry.uid, "forceType", opt)}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                                entry.forceType === opt
                                  ? "bg-brand-primary text-white border-brand-primary"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border border-dashed border-gray-200 rounded-lg py-3 flex justify-center mt-3">
                <button
                  type="button"
                  onClick={addIOS}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                    <Plus size={11} />
                  </div>
                  Add Another IOS
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
