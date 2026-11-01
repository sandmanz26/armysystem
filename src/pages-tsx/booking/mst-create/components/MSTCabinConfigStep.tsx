import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronDown, Clock, Plus, X } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Toggle } from "@/components/toggle";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";
import type { MSTBookingDetailsValues } from "./MSTBookingDetailsStep";
import { platformTypes, callSigns } from "@/data/mstTctMasterData";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CabinRow {
  id:            string;
  occupied:      boolean;
  /** Temporarily unavailable (e.g. under maintenance) — displayed like Occupied but amber */
  unavailable?:  boolean;
  selected:      boolean;
  callSign:      string;
  weaponVariant: string;
  role:          string;
}

export interface IosEntry {
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

// MST-only IOS devices. TCT IOS devices (TCTIOS01, TCTIOS02) are reserved for
// the MST+TCT flow and should not appear in standalone MST bookings.
export const IOS_OPTIONS = [
  "MSTIOS01", "MSTIOS02", "MSTIOS03", "MSTIOS04",
];

/** Extended list that includes TCT devices — used when MST+TCT flow is re-enabled */
export const MSTTCT_IOS_OPTIONS = [
  "MSTIOS01", "MSTIOS02", "MSTIOS03", "MSTIOS04",
  "TCTIOS01", "TCTIOS02",
];
export const BASE_STATION_OPTIONS                 = ["BMS1ForceSide"];
export const BASE_STATION_OPTIONS_TCT             = ["BMS1ForceSide", "BMS2ForceSide"];
const FORCE_TYPE_OPTIONS   = ["Opposing", "Friendly"];

const CALL_SIGN_OPTIONS = callSigns.filter((c) => c.status === "Active").map((c) => c.name);

/** Default cabin data for Standalone MST — cabins 11 & 12 are occupied */
export const INITIAL_CABINS: CabinRow[] = [
  { id: "MST01", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST02", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST03", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST04", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST05", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST06", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST07", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST08", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST09", occupied: false, unavailable: true, selected: false, callSign: "", weaponVariant: "", role: "" }, // Under maintenance
  { id: "MST10", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST11", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST12", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
];

/** Cabin data for MST+TCT — cabins 11 & 12 are selectable (not occupied) */
export const MSTTCT_INITIAL_CABINS: CabinRow[] = [
  { id: "MST01", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST02", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST03", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST04", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST05", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST06", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST07", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST08", occupied: false, selected: true,  callSign: "", weaponVariant: "", role: "" },
  { id: "MST09", occupied: false, unavailable: true, selected: false, callSign: "", weaponVariant: "", role: "" }, // Under maintenance
  { id: "MST10", occupied: true,  selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST11", occupied: false, selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST12", occupied: false, selected: false, callSign: "", weaponVariant: "", role: "" },
];

const columnHelper = createColumnHelper<CabinRow>();

// ── Sub-components ────────────────────────────────────────────────────────────

/** Compact dropdown used inside table cells */
function TableDropdown({
  value, onChange, options, placeholder, disabled = false,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
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
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap transition-colors max-w-[160px] w-full disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:border-gray-200"
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
function MultiRoleDropdown({ value, onChange, options = ROLE_OPTIONS, disabled = false }: {
  value: string; onChange: (v: string) => void; options?: string[]; disabled?: boolean;
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

  const selected   = value ? value.split(",").filter(Boolean) : [];
  const allChecked = options.every(r => selected.includes(r));
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
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md hover:border-gray-300 bg-white transition-colors w-full max-w-[180px] disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:border-gray-200"
      >
        <span className={cn("flex-1 text-left truncate", selected.length > 0 ? "text-gray-800" : "text-gray-400")}>
          {label}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] py-1 min-w-[150px]">
          {/* All */}
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

          {/* Core roles */}
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
  value, onChange, options, placeholder, disabled = false,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref     = useRef<HTMLDivElement>(null);
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
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap transition-colors max-w-[160px] w-full disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:border-gray-200"
      >
        <span className={cn("flex-1 text-left truncate", value ? "text-gray-800" : "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] min-w-[170px]">
          {/* Search input */}
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
          {/* Options list */}
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
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; error?: boolean;
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
          error  ? "border-red-400" :
          open   ? "border-brand-primary" : "border-gray-200 hover:border-gray-300"
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

export function MSTCabinConfigStep({
  bookingDetails,
  weaponVariantOptions,
  initialCabins: initialCabinsProp,
  initialIosList: initialIosListProp,
  showCallSign = true,
  onIOSChange,
  onCabinsChange,
  onUserEdit,
  gridCols = "grid-cols-[55%_45%]",
  roleOptions: roleOptionsProp,
  baseStationOptions: baseStationOptionsProp,
  lastUpdated,
  unitLabel = "Cabin",
}: {
  bookingDetails?:       MSTBookingDetailsValues | null;
  /** Overrides the default weapon variant list in the cabin table (e.g. for MST+TCT with qty labels) */
  weaponVariantOptions?: string[];
  /** Overrides the default initial cabin data (e.g. MST+TCT uses MSTTCT_INITIAL_CABINS) */
  initialCabins?:        CabinRow[];
  /** Pre-populate IOS entries (e.g. loaded from localStorage for the detail page) */
  initialIosList?:       IosEntry[];
  /** Whether to show the Call Sign column (default: true). Set false for MST+TCT flow. */
  showCallSign?:         boolean;
  /** Called whenever the IOS list changes — used to bubble state up to parent */
  onIOSChange?:          (list: IosEntry[]) => void;
  /** Called whenever the cabin list changes — used to bubble state up to parent */
  onCabinsChange?:       (cabins: CabinRow[]) => void;
  /** Called only when the user explicitly edits a cabin/IOS field (never on mount) */
  onUserEdit?:           () => void;
  /** Tailwind grid-cols class for the table/IOS panel split. Default: "grid-cols-[60%_40%]" (60/40) */
  gridCols?:             string;
  /** Override the role options shown in the cabin table. Defaults to ROLE_OPTIONS (VO/VC/TC/SC/SO).
   *  For TCT bookings pass ["VO", "VC", "TC", "SO"] to exclude SC. */
  roleOptions?:          string[];
  /** Override the base station options in the IOS panel. Defaults to ["BMS1ForceSide"] (MST only).
   *  For MST+TCT pass BASE_STATION_OPTIONS_TCT to include BMS2ForceSide. */
  baseStationOptions?:   string[];
  /** Last updated timestamp string displayed in the section header (e.g. "17 Jan 2025 09:29 AM") */
  lastUpdated?:          string;
  /** Overrides the "Cabin" label used in the section title, column header, selection count, and tooltip.
   *  Pass "Cluster" to reuse this component for TCT's Cluster Configuration tab. */
  unitLabel?:            string;
}) {
  const activeRoleOptions        = roleOptionsProp        ?? ROLE_OPTIONS;
  const activeBaseStationOptions = baseStationOptionsProp ?? BASE_STATION_OPTIONS;

  const defaultIosList: IosEntry[] = [
    { uid: 1, iosDevice: "", baseStation: "", masterIOS: "", forceType: "" },
  ];

  const [cabins, setCabins] = useState<CabinRow[]>(() => {
    const base   = initialCabinsProp ?? INITIAL_CABINS;
    const amount = bookingDetails?.cabinAmount;
    // If loaded from localStorage or no amount specified — use as-is
    if (initialCabinsProp || !amount) return base;
    // Pre-select exactly `amount` non-occupied cabins in order
    let count = 0;
    return base.map(c => {
      if (c.occupied) return c;
      const selected = count < amount;
      if (selected) count++;
      return { ...c, selected };
    });
  });
  const [iosList,     setIosList]     = useState<IosEntry[]>(initialIosListProp ?? defaultIosList);
  /** uid of the IOS entry currently open in form-edit mode (null = all collapsed) */
  const [editingUid, setEditingUid]   = useState<number | null>(initialIosListProp ? null : 1);
  /** Snapshot of the entry's fields when it was opened for editing — used to detect unsaved changes */
  const [editSnapshot, setEditSnapshot] = useState<IosEntry | null>(
    () => (editingUid !== null ? iosList.find(e => e.uid === editingUid) ?? null : null)
  );

  // Bubble IOS list up to parent whenever it changes (used by create-booking flow)
  const onIOSChangeRef = useRef(onIOSChange);
  onIOSChangeRef.current = onIOSChange;
  const prevIosRef = useRef<IosEntry[] | null>(null);
  useEffect(() => {
    if (prevIosRef.current === null || prevIosRef.current === iosList) {
      prevIosRef.current = iosList;
      return;
    }
    prevIosRef.current = iosList;
    onIOSChangeRef.current?.(iosList);
  }, [iosList]);

  // Bubble cabin list up to parent whenever it changes (used by create-booking flow)
  const onCabinsChangeRef = useRef(onCabinsChange);
  onCabinsChangeRef.current = onCabinsChange;
  const prevCabinsRef = useRef<CabinRow[] | null>(null);
  useEffect(() => {
    if (prevCabinsRef.current === null || prevCabinsRef.current === cabins) {
      // First run. When the step pre-selected exactly `cabinAmount` cabins on mount (create flow), tell the
      // parent right away — otherwise a booking saved without touching a cabin keeps the parent's stale list
      // (5 cabins on) while the screen showed 1/1.
      if (prevCabinsRef.current === null && !initialCabinsProp && bookingDetails?.cabinAmount) onCabinsChangeRef.current?.(cabins);
      prevCabinsRef.current = cabins;
      return;
    }
    prevCabinsRef.current = cabins;
    onCabinsChangeRef.current?.(cabins);
  }, [cabins]);

  // Guard: canEditRef is false until after the first paint + effect flush.
  // This blocks any accidental call during the React StrictMode mount → cleanup → remount cycle.
  const canEditRef = useRef(false);
  useEffect(() => {
    canEditRef.current = true;
    return () => { canEditRef.current = false; };
  }, []);

  // onUserEdit fires ONLY from explicit user interactions — never on mount
  const onUserEditRef = useRef(onUserEdit);
  onUserEditRef.current = onUserEdit;
  const notifyUserEdit = useCallback(() => {
    if (canEditRef.current) onUserEditRef.current?.();
  }, []);

  // ── Derive Platform Type options from booking details ─────────────────────────
  // Only show variants the user actually selected in Booking Details step
  const platformTypeOptions = useMemo(() => {
    const selected = bookingDetails?.platformVariants?.filter(v => v.selected).map(v => v.label);
    return selected && selected.length > 0 ? selected : (weaponVariantOptions ?? WEAPON_VARIANT_OPTIONS);
  }, [bookingDetails, weaponVariantOptions]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const availableCabins = cabins.filter(c => !c.occupied);
  const selectedCount   = cabins.filter(c => !c.occupied && c.selected).length;
  // Cap = cabinAmount from booking details (or all available if not specified)
  const maxCabins       = bookingDetails?.cabinAmount ?? availableCabins.length;
  const atMax           = selectedCount >= maxCabins;
  const allSelected     = selectedCount > 0 && selectedCount >= Math.min(maxCabins, availableCabins.length);
  const someSelected    = availableCabins.some(c => c.selected);

  // Available options for a cabin — any selected platform type, unlimited per type.
  // The actual count of each type is decided here, per cabin, not capped from Booking Details.
  const availableVariantOptions = useCallback((_currentValue: string) =>
    platformTypeOptions,
  [platformTypeOptions]);

  // ── Cabin state setters ─────────────────────────────────────────────────────
  const toggleAll = useCallback(() => {
    if (allSelected) {
      setCabins(prev => prev.map(c => c.occupied ? c : { ...c, selected: false }));
    } else {
      let count = 0;
      setCabins(prev => prev.map(c => {
        if (c.occupied) return c;
        const sel = count < maxCabins;
        if (sel) count++;
        return { ...c, selected: sel };
      }));
    }
    notifyUserEdit();
  }, [allSelected, maxCabins, notifyUserEdit]);

  const toggleCabin = useCallback((id: string) => {
    let changed = false;
    setCabins(prev => {
      const cabin = prev.find(c => c.id === id);
      if (!cabin || cabin.occupied) return prev;
      if (!cabin.selected && prev.filter(c => !c.occupied && c.selected).length >= maxCabins) return prev;
      changed = true;
      return prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
    });
    if (changed) notifyUserEdit();
  }, [maxCabins, notifyUserEdit]);

  const setCallSign = useCallback((id: string, callSign: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, callSign } : c));
    notifyUserEdit();
  }, [notifyUserEdit]);

  const setWeaponVariant = useCallback((id: string, variant: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, weaponVariant: variant } : c));
    notifyUserEdit();
  }, [notifyUserEdit]);

  const setRole = useCallback((id: string, role: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, role } : c));
    notifyUserEdit();
  }, [notifyUserEdit]);

  // ── IOS list helpers ────────────────────────────────────────────────────────
  const iosFieldsEqual = (a: IosEntry, b: IosEntry) =>
    a.iosDevice === b.iosDevice && a.baseStation === b.baseStation &&
    a.masterIOS === b.masterIOS && a.forceType === b.forceType;

  const editingEntry = editingUid !== null ? iosList.find(e => e.uid === editingUid) ?? null : null;
  const isEditingDirty = !!(editSnapshot && editingEntry && !iosFieldsEqual(editSnapshot, editingEntry));

  /** Opens an entry for editing — reverting any unsaved edits on the entry currently open. */
  const openIOSEditor = (uid: number) => {
    setIosList(prev => {
      const reverted = editingUid !== null && editSnapshot
        ? prev.map(e => e.uid === editingUid ? editSnapshot : e)
        : prev;
      return reverted;
    });
    const target = iosList.find(e => e.uid === uid) ?? null;
    setEditSnapshot(target);
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
    notifyUserEdit();
  };

  const removeIOS = (uid: number) => {
    setIosList(prev => prev.filter(e => e.uid !== uid));
    setEditingUid(prev => prev === uid ? null : prev);
    setEditSnapshot(prev => (editingUid === uid ? null : prev));
    notifyUserEdit();
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
    notifyUserEdit();
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = useMemo<(ColumnDef<CabinRow, any> & { minWidth?: string; maxWidth?: string; width?: string })[]>(() => {
    const all: (ColumnDef<CabinRow, any> & { minWidth?: string; maxWidth?: string; width?: string })[] = [
    {
      ...columnHelper.display({
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
        cell: ({ row }) => {
          if (row.original.occupied || row.original.unavailable) return null;
          const isUnavail = false;
          const isDisabled = isUnavail || (!row.original.selected && atMax);
          // Same on/off switch WPT's Lane Configuration uses. Once the cabin cap is reached the
          // switches of the other cabins are disabled (and so are their dropdowns, below).
          return (
            <span title={isUnavail ? `${unitLabel} unavailable — under maintenance` : isDisabled ? `All ${maxCabins} ${unitLabel.toLowerCase()}${maxCabins !== 1 ? "s" : ""} are already selected` : undefined}>
              <Toggle
                checked={row.original.selected}
                disabled={isDisabled}
                hideStateLabel
                onChange={() => toggleCabin(row.original.id)}
                className="[&>div]:h-6"
              />
            </span>
          );
        },
      }),
      minWidth: "72px",
      maxWidth: "72px",
      width:    "72px",
    },

    columnHelper.accessor("id", {
      header: () => unitLabel,
      cell:   ({ row }) => (
        <span className={cn(
          "text-sm font-medium",
          row.original.occupied || row.original.unavailable ? "text-gray-400" :
          row.original.selected ? "text-gray-800"  : "text-gray-600"
        )}>
          {row.original.id}
        </span>
      ),
    }),

    columnHelper.display({
      id:     "weaponVariant",
      header: () => "Platform Type",
      cell:   ({ row }) => row.original.occupied ? (
        <span className="text-sm text-gray-400 italic">Occupied</span>
      ) : row.original.unavailable ? (
        <span className="text-sm text-gray-400 italic">Unavailable</span>
      ) : (
        <TableDropdown
          value={row.original.weaponVariant}
          onChange={(v) => setWeaponVariant(row.original.id, v)}
          options={availableVariantOptions(row.original.weaponVariant)}
          placeholder="Platform Type"
          disabled={!row.original.selected && atMax}
        />
      ),
    }),

    columnHelper.display({
      id:     "role",
      header: () => "Role",
      cell:   ({ row }) => row.original.occupied || row.original.unavailable ? null : (
        <MultiRoleDropdown
          value={row.original.role}
          onChange={(v) => setRole(row.original.id, v)}
          options={activeRoleOptions}
          disabled={!row.original.selected && atMax}
        />
      ),
    }),

    columnHelper.display({
      id:     "callSign",
      header: () => "Call Sign",
      cell:   ({ row }) => row.original.occupied || row.original.unavailable ? null : (
        <SearchableTableDropdown
          value={row.original.callSign}
          onChange={(v) => setCallSign(row.original.id, v)}
          options={CALL_SIGN_OPTIONS}
          placeholder="Call Sign"
          disabled={!row.original.selected && atMax}
        />
      ),
    }),
    ];
    return showCallSign
      ? all
      : all.filter(col => (col as any).id !== "callSign");
  }, [allSelected, someSelected, toggleAll, toggleCabin, setCallSign, setWeaponVariant, setRole, platformTypeOptions, availableVariantOptions, showCallSign, activeRoleOptions, unitLabel, atMax, maxCabins]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-gray-800">
            {unitLabel} Configuration{" "}
            <span className="font-normal text-gray-500 text-sm">
              ({selectedCount}/{maxCabins} {unitLabel.toLowerCase()}{maxCabins !== 1 ? "s" : ""} selected)
            </span>
          </h2>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} className="flex-shrink-0" />
              <span>Last updated: <span className="text-gray-600 font-medium">{lastUpdated}</span></span>
            </div>
          )}
        </div>

      </div>

      {/* Configurable layout split */}
      <div className={cn("grid gap-4 items-start", gridCols)}>

        {/* ── LEFT: Cabin table ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <TableCustom<CabinRow>
            data={cabins}
            columns={columns}
            autoScrollTable={true}
            actionSticky={false}
            classTheadTh="!px-4 !py-3 !text-xs"
            classTBodyTd="!px-4 !py-2.5 !h-auto"
            getRowClass={() => ""}
          />
        </div>

        {/* ── RIGHT: IOS Configuration list ──────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">

          {/* IOS entries — full width, stacked vertically */}
          <div className="flex flex-col gap-3">
          {iosList.map((entry, idx) => {
            const isEditing = editingUid === entry.uid;
            const isFilled  = !!entry.iosDevice;

            /* ── Collapsed list-item card ── */
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

            /* ── Expanded form card ── */
            // IOS devices already chosen by other entries (exclude current entry so it can keep its own)
            const usedIosDevices = iosList
              .filter(e => e.uid !== entry.uid && e.iosDevice !== "")
              .map(e => e.iosDevice);
            const availableIosOptions = IOS_OPTIONS.filter(opt => !usedIosDevices.includes(opt));

            return (
              <div key={entry.uid} className="rounded-lg border border-brand-primary/30 bg-white p-3 space-y-3">
                {/* Entry header */}
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

                {/* Select IOS + Base Station — side by side */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Select IOS */}
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

                  {/* Select Base Station */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Base Station <span className="text-brand-primary">*</span>
                    </label>
                    <PanelDropdown
                      value={entry.baseStation}
                      onChange={(v) => updateIOS(entry.uid, "baseStation", v)}
                      options={activeBaseStationOptions}
                      placeholder="Choose base station"
                    />
                  </div>
                </div>

                {/* Master IOS Yes / No */}
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

                {/* Force Type Opposing / Friendly */}
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

          </div>{/* /grid grid-cols-2 */}

          {/* Add Another IOS — spans full width */}
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
  );
}
