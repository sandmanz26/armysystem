import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Upload, Plus, Pencil, Trash2,
  Filter, X, Check, ChevronDown,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { MSTUploadListModal } from "../../mst-create/modals/MSTUploadListModal";
import { cn } from "@/lib/utils";
import { DemoSwitcher, type DemoSize } from "./DemoSwitcher";

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL_TRAINEES = [
  { rank: "REC", name: "Roger Botosh",     svcId: "*****212A", roles: "VO",    callSign: "11Z"  },
  { rank: "REC", name: "Davis Culhane",    svcId: "*****212A", roles: "VC",    callSign: "-"    },
  { rank: "REC", name: "Kadin Torff",      svcId: "*****212A", roles: "TC/PC", callSign: "11"   },
  { rank: "REC", name: "Craig Septimus",   svcId: "*****212A", roles: "VO",    callSign: "-"    },
  { rank: "REC", name: "Roger Septimus",   svcId: "*****212A", roles: "SC",    callSign: "11A"  },
  { rank: "REC", name: "Jaxson Donin",     svcId: "*****212A", roles: "TC/PC", callSign: "11SZ" },
  { rank: "REC", name: "James Lubin",      svcId: "*****212A", roles: "SO",    callSign: "-"    },
  { rank: "REC", name: "Jakob Vaccaro",    svcId: "*****212A", roles: "SC",    callSign: "11S"  },
  { rank: "REC", name: "Ruben Calzoni",    svcId: "*****212A", roles: "TC/PC", callSign: "-"    },
  { rank: "REC", name: "Tyrone Whitfield", svcId: "*****212B", roles: "VO",    callSign: "11B"  },
  { rank: "REC", name: "Marcus Chen",      svcId: "*****212B", roles: "VC",    callSign: "-"    },
  { rank: "REC", name: "Alvin Tan",        svcId: "*****212B", roles: "TC/PC", callSign: "12"   },
  { rank: "REC", name: "Wei Ming Lim",     svcId: "*****212B", roles: "SC",    callSign: "-"    },
  { rank: "REC", name: "Iskandar Shah",    svcId: "*****212B", roles: "SO",    callSign: "12A"  },
  { rank: "REC", name: "Rahul Patel",      svcId: "*****212B", roles: "TC/PC", callSign: "-"    },
  { rank: "REC", name: "Dylan Ong",        svcId: "*****212C", roles: "VO",    callSign: "13"   },
  { rank: "REC", name: "Brandon Lee",      svcId: "*****212C", roles: "VC",    callSign: "-"    },
  { rank: "REC", name: "Justin Koh",       svcId: "*****212C", roles: "TC/PC", callSign: "13A"  },
  { rank: "REC", name: "Nathan Yeo",       svcId: "*****212C", roles: "SC",    callSign: "-"    },
  { rank: "REC", name: "Ethan Ho",         svcId: "*****212C", roles: "SO",    callSign: "13S"  },
  { rank: "REC", name: "Samuel Ng",        svcId: "*****212D", roles: "TC/PC", callSign: "-"    },
  { rank: "REC", name: "Aaron Lim",        svcId: "*****212D", roles: "VO",    callSign: "14"   },
  { rank: "REC", name: "Zachary Tan",      svcId: "*****212D", roles: "VC",    callSign: "-"    },
  { rank: "REC", name: "Gabriel Wong",     svcId: "*****212D", roles: "TC/PC", callSign: "14A"  },
  { rank: "REC", name: "Caleb Chan",       svcId: "*****212D", roles: "SC",    callSign: "-"    },
];

const RANK_OPTIONS  = ["REC", "PTE", "LCP", "CPL", "3SG", "2SG", "SSG", "MSG", "WO", "2LT", "LTA", "CPT", "MAJ", "LTC", "COL"];
const ROLE_OPTIONS  = ["VC", "VO", "TC/PC", "SC", "SO"];

const PER_PAGE = 10;

type Trainee = typeof INITIAL_TRAINEES[number];

// ── Simple table checkbox ─────────────────────────────────────────────────────
// Using plain button + Check icon to avoid the CSS overlap issue in the Checkbox component

function TableCheck({
  checked, indeterminate, onClick,
}: {
  checked: boolean; indeterminate?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        checked
          ? "bg-brand-primary border-brand-primary"
          : indeterminate
            ? "border-brand-primary/50 bg-brand-primary/10"
            : "border-gray-300 hover:border-brand-primary/50",
      )}
    >
      {checked     && <Check size={9} className="text-white" strokeWidth={3} />}
      {!checked && indeterminate && <span className="w-1.5 h-0.5 bg-brand-primary block rounded-full" />}
    </button>
  );
}

// ── Simple dropdown for the sidebar form ─────────────────────────────────────

function SidebarDropdown({
  label, value, options, onChange, placeholder, required,
}: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-brand-primary ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors focus:outline-none",
            open ? "border-brand-primary" : "border-gray-200 hover:border-gray-300",
          )}
        >
          <span className={cn("truncate", value ? "text-gray-800" : "text-gray-400")}>
            {value || placeholder || "Select..."}
          </span>
          <ChevronDown size={14} className={cn("text-gray-400 flex-shrink-0 ml-2 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {opt}
                {value === opt && <Check size={13} className="text-brand-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Trainee sidebar ───────────────────────────────────────────────────────

function AddTraineeSidebar({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd:   (t: Trainee) => void;
}) {
  const [rank, setRank]         = useState("");
  const [name, setName]         = useState("");
  const [svcId, setSvcId]         = useState("");
  const [roles, setRoles]       = useState("");
  const [callSign, setCallSign] = useState("");

  const valid = rank && name.trim() && svcId.trim() && roles;

  const handleSubmit = () => {
    if (!valid) return;
    onAdd({ rank, name: name.trim(), svcId: svcId.trim(), roles, callSign: callSign.trim() || "-" });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">Add Trainee</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the trainee details below</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <SidebarDropdown
            label="Rank"
            value={rank}
            options={RANK_OPTIONS}
            onChange={setRank}
            placeholder="Select rank"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Service ID <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              value={svcId}
              onChange={e => setSvcId(e.target.value)}
              placeholder="e.g. *****212A"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary font-mono"
            />
          </div>

          <SidebarDropdown
            label="Role"
            value={roles}
            options={ROLE_OPTIONS}
            onChange={setRoles}
            placeholder="Select role"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Call Sign
            </label>
            <input
              type="text"
              value={callSign}
              onChange={e => setCallSign(e.target.value)}
              placeholder="e.g. 11Z"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={handleSubmit}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors",
              valid
                ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            Add Trainee
          </button>
        </div>

      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MSTNominalRollDetail({ onDataChange }: { onDataChange?: () => void } = {}) {
  const [trainees,     setTrainees]     = useState<Trainee[]>(INITIAL_TRAINEES);
  const [dataCount,    setDataCount]    = useState<DemoSize>(10);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [showUpload,   setShowUpload]   = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilter,   setShowFilter]   = useState(false);
  const [filterRanks,  setFilterRanks]  = useState<Set<string>>(new Set());
  const [filterRoles,  setFilterRoles]  = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter panel on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allRanks           = useMemo(() => [...new Set(trainees.map(t => t.rank))].sort(), [trainees]);
  const allRoles           = useMemo(() => [...new Set(trainees.map(t => t.roles))].sort(), [trainees]);
  const activeFilterCount  = filterRanks.size + filterRoles.size;

  // ── Filtering & pagination ────────────────────────────────────────────────
  const activeTrainees = useMemo(() => trainees.slice(0, dataCount), [trainees, dataCount]);

  const filtered = useMemo(
    () => activeTrainees.filter(t => {
      const matchSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.svcId.includes(searchQuery);
      const matchRank   = filterRanks.size === 0 || filterRanks.has(t.rank);
      const matchRole   = filterRoles.size === 0 || filterRoles.has(t.roles);
      return matchSearch && matchRank && matchRole;
    }),
    [activeTrainees, searchQuery, filterRanks, filterRoles],
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Columns ───────────────────────────────────────────────────────────────
  type Col = ColumnDef<Trainee, any> & { width?: string; minWidth?: string; maxWidth?: string };

  const columns = useMemo<Col[]>(() => {
    const allPageSelected  = paginated.length > 0 && paginated.every(t => selectedRows.has(t.name));
    const somePageSelected = paginated.some(t => selectedRows.has(t.name));

    const toggleAll = () => setSelectedRows(prev => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach(t => next.delete(t.name));
      else                 paginated.forEach(t => next.add(t.name));
      return next;
    });

    const toggleRow = (name: string) => setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });

    return [
      {
        id:     "select",
        header: () => (
          <div className="flex items-center justify-center">
            <TableCheck
              checked={allPageSelected}
              indeterminate={somePageSelected && !allPageSelected}
              onClick={toggleAll}
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center justify-center">
            <TableCheck
              checked={selectedRows.has(row.original.name)}
              onClick={() => toggleRow(row.original.name)}
            />
          </div>
        ),
        width: "44px", minWidth: "44px", maxWidth: "44px",
      },
      {
        id:     "no",
        header: () => "No",
        cell:   ({ row }: any) => (
          <span className="text-sm text-gray-700">
            {(currentPage - 1) * PER_PAGE + row.index + 1}
          </span>
        ),
        width: "56px", minWidth: "56px", maxWidth: "56px",
      },
      {
        accessorKey: "rank",
        header:      () => "Rank",
        cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
        width: "76px", minWidth: "76px", maxWidth: "76px",
      },
      {
        accessorKey: "name",
        header:      () => "Name",
        cell:        ({ getValue }: any) => (
          <span className="text-sm font-medium text-gray-800">{getValue()}</span>
        ),
        minWidth: "160px",
      },
      {
        accessorKey: "svcId",
        header:      () => "Service ID",
        cell:        ({ getValue }: any) => (
          <span className="text-sm text-gray-700 font-mono">{getValue()}</span>
        ),
        width: "112px", minWidth: "112px", maxWidth: "112px",
      },
      {
        accessorKey: "roles",
        header:      () => "Role",
        cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
        width: "72px", minWidth: "72px", maxWidth: "72px",
      },
      {
        accessorKey: "callSign",
        header:      () => "Call Sign",
        cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
        width: "88px", minWidth: "88px", maxWidth: "88px",
      },
      {
        id:     "lastUpdated",
        header: () => "Last Updated",
        cell:   () => (
          <div className="text-sm text-gray-500 whitespace-nowrap">
            17 Jan 2025
            <br />
            <span className="text-xs text-gray-400">09:29 AM</span>
          </div>
        ),
        width: "130px", minWidth: "130px", maxWidth: "130px",
      },
      {
        id:     "actions",
        header: () => "",
        cell:   () => (
          <div className="flex items-center gap-1.5">
            <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <Pencil size={13} />
            </button>
            <button type="button" onClick={() => onDataChange?.()} className="text-gray-400 hover:text-red-500 transition-colors p-1">
              <Trash2 size={13} />
            </button>
          </div>
        ),
        width: "64px", minWidth: "64px", maxWidth: "64px",
      },
    ];
  }, [currentPage, selectedRows, paginated]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header bar — relative + z-index so filter dropdown renders above table */}
      <div className="flex items-center justify-between mb-5 relative z-20">
        <h2 className="text-base font-semibold text-gray-800">
          Nominal Roll{" "}
          <span className="font-normal text-gray-500">({activeTrainees.length} Trainees)</span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <InputCustom
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-44 focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <Button
              type="outline"
              onClick={() => setShowFilter(v => !v)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium w-auto border",
                activeFilterCount > 0
                  ? "border-brand-primary text-brand-primary bg-red-50"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              )}
            >
              <Filter size={14} />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-brand-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[200] p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Filter</p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { setFilterRanks(new Set()); setFilterRoles(new Set()); }}
                      className="flex items-center gap-1 text-[11px] text-brand-primary hover:underline"
                    >
                      <X size={11} /> Clear all
                    </button>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rank</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allRanks.map(rank => (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setFilterRanks(prev => {
                          const next = new Set(prev);
                          if (next.has(rank)) next.delete(rank); else next.add(rank);
                          return next;
                        })}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                          filterRanks.has(rank)
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                        )}
                      >
                        {rank}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Role</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allRoles.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFilterRoles(prev => {
                          const next = new Set(prev);
                          if (next.has(role)) next.delete(role); else next.add(role);
                          return next;
                        })}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                          filterRoles.has(role)
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload List */}
          <Button
            type="outline"
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <Upload size={14} /> Upload List
          </Button>

          {/* Add Trainee → opens drawer */}
          <Button
            onClick={() => setShowAddDrawer(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <Plus size={14} /> Add Trainee
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <TableCustom<Trainee>
          columns={columns}
          data={paginated}
          autoScrollTable={true}
        />
        <Pagination
          currentPage={currentPage}
          itemsPerPage={PER_PAGE}
          totalItems={filtered.length}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Upload modal */}
      {showUpload && <MSTUploadListModal onClose={() => setShowUpload(false)} />}

      {/* Add Trainee drawer */}
      {showAddDrawer && (
        <AddTraineeSidebar
          onClose={() => setShowAddDrawer(false)}
          onAdd={(t) => {
            setTrainees(prev => [...prev, t]);
            setCurrentPage(Math.ceil((filtered.length + 1) / PER_PAGE));
            onDataChange?.();
          }}
        />
      )}

      {/* ── Floating demo switcher ── */}
      <DemoSwitcher value={dataCount} onChange={(v) => { setDataCount(v); setCurrentPage(1); }} />
    </>
  );
}
