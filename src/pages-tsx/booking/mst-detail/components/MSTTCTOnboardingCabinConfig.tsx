import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CabinRow {
  id:             string;
  occupied:       boolean;
  selected:       boolean;
  vehicleVariant: string;
  role:           string;
}

interface ClusterRow {
  id:             string;
  occupied:       boolean;
  selected:       boolean;
  vehicleVariant: string;
  weaponVariant:  string;
  roles:          string[];
}

interface SlaveIOSEntry {
  uid:            number;
  value:          string;
  forceSelection: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MST_VEHICLE_VARIANT_OPTIONS = ["40AGL", "50HMG", "7.62 COAX", "Smoke Discharger"];
const MST_ROLE_OPTIONS            = ["All role selected", "Commander", "Gunner", "Driver", "Loader"];
const TCT_VEHICLE_VARIANT_OPTIONS = [
  "TERREX (COMMANDER)", "TERREX (TROOPER)", "TERREX (SCOUT)",
  "TERREX (PIONEER)",   "TERREX (MEDICAL)", "TERREX (STORM)", "BRONCO",
];
const TCT_WEAPON_VARIANT_OPTIONS  = ["40AGL", "50HMG", "MORTAL", "7.62mm COAXIAL", "120MM SMOOTHBORE"];
const TCT_ROLE_OPTIONS            = ["VO", "VC", "TC", "SC", "SO"];
const FORCE_OPTIONS               = ["Blue", "Red", "Both"];
const MAIN_IOS_OPTIONS            = Array.from({ length: 5 }, (_, i) => `Main IOS ${i + 1}`);

const TCT_ITEMS_PER_PAGE = 10;

// ── Initial data ──────────────────────────────────────────────────────────────

const INITIAL_CABINS: CabinRow[] = [
  { id: "MST_CABIN_01", occupied: false, selected: true,  vehicleVariant: "40AGL", role: "All role selected" },
  { id: "MST_CABIN_02", occupied: false, selected: true,  vehicleVariant: "40AGL", role: "All role selected" },
  { id: "MST_CABIN_03", occupied: true,  selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_04", occupied: false, selected: true,  vehicleVariant: "50HMG", role: "All role selected" },
  { id: "MST_CABIN_05", occupied: true,  selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_06", occupied: false, selected: true,  vehicleVariant: "40AGL", role: "All role selected" },
  { id: "MST_CABIN_07", occupied: true,  selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_08", occupied: false, selected: true,  vehicleVariant: "50HMG", role: "All role selected" },
  { id: "MST_CABIN_09", occupied: true,  selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_10", occupied: true,  selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_11", occupied: false, selected: false, vehicleVariant: "",       role: "" },
  { id: "MST_CABIN_12", occupied: false, selected: false, vehicleVariant: "",       role: "" },
];

/** 64 clusters total. Occupied: (n % 10) ∈ {3,5,7,9}. First 16 available are pre-selected. */
const TCT_INITIAL_CLUSTERS: ClusterRow[] = (() => {
  const all = Array.from({ length: 64 }, (_, i) => {
    const n   = i + 1;
    const mod = n % 10;
    return {
      id:             `TCT_CLUSTER_${String(n).padStart(2, "0")}`,
      occupied:       mod === 3 || mod === 5 || mod === 7 || mod === 9,
      selected:       false,
      vehicleVariant: "",
      weaponVariant:  "",
      roles:          [] as string[],
    };
  });
  let count = 0;
  return all.map(c => {
    if (!c.occupied && count < 16) {
      count++;
      return {
        ...c,
        selected:       true,
        vehicleVariant: "TERREX (COMMANDER)",
        weaponVariant:  "40AGL",
        roles:          [...TCT_ROLE_OPTIONS],
      };
    }
    return c;
  });
})();

const mstColHelper = createColumnHelper<CabinRow>();
const tctColHelper = createColumnHelper<ClusterRow>();

// ── Sub-components ────────────────────────────────────────────────────────────

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
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white whitespace-nowrap transition-colors max-w-[160px] w-full"
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

function MultiCheckboxTableDropdown({
  selected, onChange, options, placeholder,
}: {
  selected: string[]; onChange: (roles: string[]) => void; options: string[]; placeholder: string;
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

  const toggle = (opt: string) =>
    selected.includes(opt)
      ? onChange(selected.filter(r => r !== opt))
      : onChange([...selected, opt]);

  const displayValue = selected.join(", ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap transition-colors max-w-[160px] w-full"
      >
        <span className={cn("flex-1 text-left truncate", displayValue ? "text-gray-800" : "text-gray-400")}>
          {displayValue || placeholder}
        </span>
        <ChevronDown size={11} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[50] py-1 min-w-[130px]">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <div className={cn(
                "w-[15px] h-[15px] rounded border-2 flex items-center justify-center flex-shrink-0",
                selected.includes(opt) ? "bg-brand-primary border-brand-primary" : "border-gray-300"
              )}>
                {selected.includes(opt) && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

export function MSTTCTOnboardingCabinConfig({
  onBack,
  onConfirm,
  only,
}: {
  onBack:    () => void;
  onConfirm: () => void;
  /** Show just one programme's half and hide the MST/TCT switch (standalone TCT booking). */
  only?:     "MST" | "TCT";
}) {
  const [activeTab, setActiveTab] = useState<"MST" | "TCT">(only ?? "MST");

  // ── MST cabin state ────────────────────────────────────────────────────────
  const [cabins,    setCabins]    = useState<CabinRow[]>(INITIAL_CABINS);
  const [mstMainIOS, setMstMainIOS] = useState("Main IOS 2");
  const [mstForce,   setMstForce]   = useState("Red");

  const availableCabins   = cabins.filter(c => !c.occupied);
  const selectedCabinCount = cabins.filter(c => !c.occupied && c.selected).length;
  const allCabinsSelected  = availableCabins.length > 0 && availableCabins.every(c => c.selected);
  const someCabinsSelected = availableCabins.some(c => c.selected);

  const toggleAllCabins = useCallback(() => {
    const shouldSelect = !allCabinsSelected;
    setCabins(prev => prev.map(c =>
      c.occupied ? c : { ...c, selected: shouldSelect, role: shouldSelect ? "All role selected" : "" }
    ));
  }, [allCabinsSelected]);

  const toggleCabin = useCallback((id: string) => {
    setCabins(prev => prev.map(c =>
      c.id === id ? { ...c, selected: !c.selected, role: !c.selected ? "All role selected" : "" } : c
    ));
  }, []);

  const setCabinVehicleVariant = useCallback((id: string, v: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, vehicleVariant: v } : c));
  }, []);

  const setCabinRole = useCallback((id: string, role: string) => {
    setCabins(prev => prev.map(c => c.id === id ? { ...c, role } : c));
  }, []);

  // ── TCT cluster state ──────────────────────────────────────────────────────
  const [clusters,      setClusters]      = useState<ClusterRow[]>(TCT_INITIAL_CLUSTERS);
  const [tctMainIOS,    setTctMainIOS]    = useState("Main IOS 2");
  const [tctForce,      setTctForce]      = useState("Red");
  const [tctSlave,      setTctSlave]      = useState<SlaveIOSEntry[]>([
    { uid: 1, value: "Main IOS 3", forceSelection: "Blue" },
  ]);
  const [tctPage,       setTctPage]       = useState(1);

  const availableClusters    = useMemo(() => clusters.filter(c => !c.occupied), [clusters]);
  const selectedClusterCount = useMemo(() => clusters.filter(c => !c.occupied && c.selected).length, [clusters]);
  const targetClusterCount   = 16;
  const allClustersSelected  = selectedClusterCount >= targetClusterCount;
  const someClustersSelected = selectedClusterCount > 0;

  const pagedClusters = useMemo(
    () => clusters.slice((tctPage - 1) * TCT_ITEMS_PER_PAGE, tctPage * TCT_ITEMS_PER_PAGE),
    [clusters, tctPage]
  );

  const toggleAllClusters = useCallback(() => {
    if (selectedClusterCount < targetClusterCount) {
      let remaining = targetClusterCount - selectedClusterCount;
      setClusters(prev => prev.map(c => {
        if (c.occupied || c.selected) return c;
        if (remaining > 0) { remaining--; return { ...c, selected: true, roles: [...TCT_ROLE_OPTIONS] }; }
        return c;
      }));
    } else {
      setClusters(prev => prev.map(c =>
        c.occupied ? c : { ...c, selected: false, roles: [] }
      ));
    }
  }, [selectedClusterCount]);

  const toggleCluster = useCallback((id: string) => {
    setClusters(prev => prev.map(c =>
      c.id === id ? { ...c, selected: !c.selected, roles: [] } : c
    ));
  }, []);

  const setClusterVehicleVariant = useCallback((id: string, v: string) => {
    setClusters(prev => prev.map(c => c.id === id ? { ...c, vehicleVariant: v } : c));
  }, []);

  const setClusterWeaponVariant = useCallback((id: string, v: string) => {
    setClusters(prev => prev.map(c => c.id === id ? { ...c, weaponVariant: v } : c));
  }, []);

  const setClusterRoles = useCallback((id: string, roles: string[]) => {
    setClusters(prev => prev.map(c => c.id === id ? { ...c, roles } : c));
  }, []);

  const addSlaveIOS    = () => setTctSlave(prev => [...prev, { uid: Date.now(), value: "", forceSelection: "" }]);
  const updateSlave    = (uid: number, value: string) => setTctSlave(prev => prev.map(s => s.uid === uid ? { ...s, value } : s));
  const updateSlaveForce = (uid: number, forceSelection: string) => setTctSlave(prev => prev.map(s => s.uid === uid ? { ...s, forceSelection } : s));
  const removeSlave    = (uid: number) => setTctSlave(prev => prev.filter(s => s.uid !== uid));

  // ── MST cabin columns ──────────────────────────────────────────────────────
  const mstColumns = useMemo<ColumnDef<CabinRow, any>[]>(() => [
    mstColHelper.display({
      id: "select",
      header: () => (
        <button
          type="button"
          onClick={toggleAllCabins}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            allCabinsSelected
              ? "bg-brand-primary border-brand-primary"
              : someCabinsSelected
                ? "bg-brand-primary/30 border-brand-primary/50"
                : "border-gray-300 hover:border-gray-400"
          )}
        >
          {allCabinsSelected  && <Check size={10} className="text-white" strokeWidth={3} />}
          {someCabinsSelected && !allCabinsSelected && <span className="w-2 h-px bg-brand-primary" />}
        </button>
      ),
      cell: ({ row }) => row.original.occupied ? null : (
        <button
          type="button"
          onClick={() => toggleCabin(row.original.id)}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            row.original.selected ? "bg-brand-primary border-brand-primary" : "border-gray-300 hover:border-gray-400"
          )}
        >
          {row.original.selected && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
      ),
    }),
    mstColHelper.accessor("id", {
      header: () => "Cabin",
      cell:   ({ row }) => (
        <span className={cn(
          "text-sm font-medium",
          row.original.occupied ? "text-gray-400" :
          row.original.selected ? "text-gray-800" : "text-gray-600"
        )}>
          {row.original.id}
        </span>
      ),
    }),
    mstColHelper.display({
      id:     "vehicleVariant",
      header: () => "Vehicle Variant",
      cell:   ({ row }) => row.original.occupied ? (
        <span className="text-sm text-gray-400 italic">Occupied</span>
      ) : (
        <TableDropdown
          value={row.original.vehicleVariant}
          onChange={(v) => setCabinVehicleVariant(row.original.id, v)}
          options={MST_VEHICLE_VARIANT_OPTIONS}
          placeholder="Vehicle Variant"
        />
      ),
    }),
    mstColHelper.display({
      id:     "role",
      header: () => "Role",
      cell:   ({ row }) => row.original.occupied ? null : (
        <TableDropdown
          value={row.original.role}
          onChange={(v) => setCabinRole(row.original.id, v)}
          options={MST_ROLE_OPTIONS}
          placeholder="Assign role"
        />
      ),
    }),
  ], [allCabinsSelected, someCabinsSelected, toggleAllCabins, toggleCabin, setCabinVehicleVariant, setCabinRole]);

  // ── TCT cluster columns ────────────────────────────────────────────────────
  const tctColumns = useMemo<ColumnDef<ClusterRow, any>[]>(() => [
    tctColHelper.display({
      id: "select",
      header: () => (
        <button
          type="button"
          onClick={toggleAllClusters}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            allClustersSelected
              ? "bg-brand-primary border-brand-primary"
              : someClustersSelected
                ? "bg-brand-primary/30 border-brand-primary/50"
                : "border-gray-300 hover:border-gray-400"
          )}
        >
          {allClustersSelected  && <Check size={10} className="text-white" strokeWidth={3} />}
          {someClustersSelected && !allClustersSelected && <span className="w-2 h-px bg-brand-primary" />}
        </button>
      ),
      cell: ({ row }) => row.original.occupied ? null : (
        <button
          type="button"
          onClick={() => toggleCluster(row.original.id)}
          className={cn(
            "w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors",
            row.original.selected ? "bg-brand-primary border-brand-primary" : "border-gray-300 hover:border-gray-400"
          )}
        >
          {row.original.selected && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
      ),
    }),
    tctColHelper.accessor("id", {
      header: () => "Cluster",
      cell:   ({ row }) => (
        <span className={cn(
          "text-sm font-medium",
          row.original.occupied ? "text-gray-400" :
          row.original.selected ? "text-gray-800" : "text-gray-600"
        )}>
          {row.original.id}
        </span>
      ),
    }),
    tctColHelper.display({
      id:     "vehicleVariant",
      header: () => "Vehicle Variant",
      cell:   ({ row }) => row.original.occupied ? (
        <span className="text-sm text-gray-400 italic">Occupied</span>
      ) : (
        <TableDropdown
          value={row.original.vehicleVariant}
          onChange={(v) => setClusterVehicleVariant(row.original.id, v)}
          options={TCT_VEHICLE_VARIANT_OPTIONS}
          placeholder="Vehicle Variant"
        />
      ),
    }),
    tctColHelper.display({
      id:     "weaponVariant",
      header: () => "Weapon Variant",
      cell:   ({ row }) => row.original.occupied ? null : (
        <TableDropdown
          value={row.original.weaponVariant}
          onChange={(v) => setClusterWeaponVariant(row.original.id, v)}
          options={TCT_WEAPON_VARIANT_OPTIONS}
          placeholder="Weapon Variant"
        />
      ),
    }),
    tctColHelper.display({
      id:     "role",
      header: () => "Role",
      cell:   ({ row }) => row.original.occupied ? null : (
        <MultiCheckboxTableDropdown
          selected={row.original.roles}
          onChange={(roles) => setClusterRoles(row.original.id, roles)}
          options={TCT_ROLE_OPTIONS}
          placeholder="Assign role"
        />
      ),
    }),
  ], [
    allClustersSelected, someClustersSelected,
    toggleAllClusters, toggleCluster,
    setClusterVehicleVariant, setClusterWeaponVariant, setClusterRoles,
  ]);

  // ── Derived labels ─────────────────────────────────────────────────────────
  const pageTitle    = activeTab === "MST" ? "Cabin Configuration"  : "Cluster Configuration";
  const pageSubtitle = activeTab === "MST"
    ? "Please confirm the cabin before start of the training."
    : "Please confirm the cluster before start of the training.";
  const confirmLabel = activeTab === "MST" ? "Confirm cabin configuration" : "Confirm Cluster Configuration";

  // suppress unused warning for availableClusters (used by targetClusterCount logic)
  void availableClusters;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{pageSubtitle}</p>
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
            {confirmLabel} <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Card header with MST/TCT tabs */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {activeTab === "MST" ? (
                <>Cabin Configuration{" "}
                  <span className="font-normal text-gray-400">
                    ({selectedCabinCount}/{availableCabins.length} Cabins)
                  </span>
                </>
              ) : (
                <>Cluster Configuration{" "}
                  <span className="font-normal text-gray-400">
                    ({selectedClusterCount}/{targetClusterCount} Clusters)
                  </span>
                </>
              )}
            </h3>
            <div className="flex gap-2">
              {(only ? ([] as ("MST" | "TCT")[]) : (["MST", "TCT"] as ("MST" | "TCT")[])).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    activeTab === tab
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-brand-primary border-brand-primary hover:bg-brand-primary/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── MST tab ── */}
          {activeTab === "MST" && (
            <div className="grid grid-cols-[1fr_380px]">
              {/* Left: cabin table */}
              <div className="border-r border-gray-100">
                <TableCustom<CabinRow>
                  data={cabins}
                  columns={mstColumns}
                  autoScrollTable={true}
                  actionSticky={false}
                  classTheadTh="!px-4 !py-3 !text-xs"
                  classTBodyTd="!px-4 !py-2.5 !h-auto"
                />
              </div>

              {/* Right: Main IOS + Force Selection */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Main IOS <span className="text-brand-primary">*</span>
                    </label>
                    <PanelDropdown
                      value={mstMainIOS}
                      onChange={setMstMainIOS}
                      options={MAIN_IOS_OPTIONS}
                      placeholder="Choose main IOS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Force Selection <span className="text-brand-primary">*</span>
                    </label>
                    <PanelDropdown
                      value={mstForce}
                      onChange={setMstForce}
                      options={FORCE_OPTIONS}
                      placeholder="Choose force"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TCT tab ── */}
          {activeTab === "TCT" && (
            <div className="grid grid-cols-[1fr_380px]">
              {/* Left: cluster table + pagination */}
              <div className="border-r border-gray-100">
                <TableCustom<ClusterRow>
                  data={pagedClusters}
                  columns={tctColumns}
                  autoScrollTable={true}
                  actionSticky={false}
                  classTheadTh="!px-4 !py-3 !text-xs"
                  classTBodyTd="!px-4 !py-2.5 !h-auto"
                  getRowClass={(row: any) => row.selected ? "bg-red-50" : ""}
                />
                <Pagination
                  currentPage={tctPage}
                  setCurrentPage={setTctPage}
                  itemsPerPage={TCT_ITEMS_PER_PAGE}
                  totalItems={clusters.length}
                />
              </div>

              {/* Right: IOS Configuration */}
              <div className="p-4 space-y-4">
                {/* Main IOS + Force Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Main IOS <span className="text-brand-primary">*</span>
                    </label>
                    <PanelDropdown
                      value={tctMainIOS}
                      onChange={setTctMainIOS}
                      options={MAIN_IOS_OPTIONS}
                      placeholder="Choose main IOS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Force Selection <span className="text-brand-primary">*</span>
                    </label>
                    <PanelDropdown
                      value={tctForce}
                      onChange={setTctForce}
                      options={FORCE_OPTIONS}
                      placeholder="Choose force selection"
                    />
                  </div>
                </div>

                {/* Slave IOS entries */}
                {tctSlave.length > 0 && (
                  <div className="space-y-3 border-t border-gray-100 pt-3">
                    {tctSlave.map(slave => (
                      <div key={slave.uid} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Slave IOS <span className="text-brand-primary">*</span>
                          </label>
                          <PanelDropdown
                            value={slave.value}
                            onChange={(v) => updateSlave(slave.uid, v)}
                            options={MAIN_IOS_OPTIONS}
                            placeholder="Choose slave IOS"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Force Selection <span className="text-brand-primary">*</span>
                          </label>
                          <PanelDropdown
                            value={slave.forceSelection}
                            onChange={(v) => updateSlaveForce(slave.uid, v)}
                            options={FORCE_OPTIONS}
                            placeholder="Choose force"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlave(slave.uid)}
                          className="h-[42px] w-9 flex items-center justify-center text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Slave IOS button */}
                <div className="border border-dashed border-gray-200 rounded-lg py-4 flex justify-center">
                  <button
                    type="button"
                    onClick={addSlaveIOS}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                      <Plus size={11} />
                    </div>
                    Add Slave IOS
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
