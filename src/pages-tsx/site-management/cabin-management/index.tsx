import { useState, useMemo } from "react";
import { Search, Download, Eye, Pencil, Trash2, X, CalendarX, Home } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { BlackoutDatesTab, type BlackoutDate } from "../components/BlackoutDatesPanel";

// ── Types ─────────────────────────────────────────────────────────────────────
type CabinStatus = "Available" | "Unavailable" | "Degraded";

interface Cabin {
  id: string;
  name: string;
  clusterId?: string;
  status: CabinStatus;
  blackoutDates: BlackoutDate[];
  updatedOn: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockBlackout = (id: string, startDate: string, endDate = startDate): BlackoutDate => ({
  id, startDate, endDate, startTime: "08:00 AM", endTime: "05:00 PM", recurringDays: [],
});

const INITIAL_CABINS: Cabin[] = [
  { id: "cb01", name: "TCT01", clusterId: "TCT-CLUSTER-01", status: "Available",   blackoutDates: [mockBlackout("bo1","2025-01-08"),mockBlackout("bo2","2025-02-09"),mockBlackout("bo3","2025-02-10"),mockBlackout("bo4","2025-03-11"),mockBlackout("bo5","2025-04-12"),mockBlackout("bo6","2025-05-15"),mockBlackout("bo7","2025-06-20"),mockBlackout("bo8","2025-07-25")], updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb02", name: "TCT02", clusterId: "TCT-CLUSTER-02", status: "Unavailable", blackoutDates: [mockBlackout("bo9","2025-01-08")],                                                                                                                                                                                          updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb03", name: "TCT03", clusterId: "TCT-CLUSTER-03", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb04", name: "TCT04", clusterId: "TCT-CLUSTER-04", status: "Degraded",    blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb05", name: "TCT05", clusterId: "TCT-CLUSTER-05", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb06", name: "TCT06", clusterId: "TCT-CLUSTER-06", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb07", name: "TCT07", clusterId: "TCT-CLUSTER-07", status: "Degraded",    blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb08", name: "TCT08", clusterId: "TCT-CLUSTER-08", status: "Available",   blackoutDates: [mockBlackout("bo10","2025-01-08")],                                                                                                                                                                                          updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb09", name: "TCT09", clusterId: "TCT-CLUSTER-09", status: "Unavailable", blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb10", name: "TCT10", clusterId: "TCT-CLUSTER-10", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb11", name: "TCT11", clusterId: "TCT-CLUSTER-11", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb12", name: "TCT12", clusterId: "TCT-CLUSTER-12", status: "Degraded",    blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb13", name: "TCT13", clusterId: "TCT-CLUSTER-01", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb14", name: "TCT14", clusterId: "TCT-CLUSTER-02", status: "Available",   blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "cb15", name: "TCT15", clusterId: "TCT-CLUSTER-03", status: "Unavailable", blackoutDates: [],                                                                                                                                                                                                                            updatedOn: "10 January 2025\n08:00:00 AM" },
];

const PER_PAGE = 10;
const STATUS_OPTIONS: CabinStatus[] = ["Available", "Unavailable", "Degraded"];

// ── Status badge ──────────────────────────────────────────────────────────────
function CabinStatusBadge({ status }: { status: CabinStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5",
      status === "Available"   && "bg-success-invert-default text-success border-invert-success",
      status === "Unavailable" && "bg-danger-invert-default text-danger border-invert-danger",
      status === "Degraded"    && "bg-warning-invert-default text-warning border-invert-warning",
    )}>
      {status}
    </span>
  );
}

// ── Blackout dates display ────────────────────────────────────────────────────
function formatBlackoutDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function BlackoutCell({ dates }: { dates: BlackoutDate[] }) {
  const [show, setShow] = useState(false);
  if (dates.length === 0) return <span className="text-sm text-disabled">-</span>;
  const labels = dates.map((d) => formatBlackoutDate(d.startDate));
  const visible = labels.slice(0, 3);
  const extra = labels.slice(3);
  return (
    <div className="text-sm text-default">
      {visible.join(", ")}
      {extra.length > 0 && (
        <div className="relative inline-block ml-1">
          <button onClick={() => setShow(v => !v)} className="text-xs text-primary font-medium hover:underline">
            +{extra.length} more
          </button>
          {show && (
            <div className="absolute left-0 top-full mt-1.5 z-30 bg-surface border border-invert-default rounded-xl shadow-xl p-3 min-w-[220px]">
              <p className="text-[10px] font-bold text-caption uppercase tracking-wide mb-2">All Blackout Dates</p>
              {labels.map((d, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <CalendarX size={12} className="text-caption flex-shrink-0" />
                  <span className="text-xs text-default">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cabin form drawer ─────────────────────────────────────────────────────────
const cabinSchema = Yup.object().shape({
  name:   Yup.string().required("Cabin name is required"),
  status: Yup.string().required("Status is required"),
});

function CabinDrawer({
  onClose,
  onSave,
  initial,
  title = "Add Cabin",
  confirmLabel = "Confirm",
}: {
  onClose: () => void;
  onSave: (data: { name: string; status: CabinStatus }) => void;
  initial?: Cabin;
  title?: string;
  confirmLabel?: string;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[2100] w-[440px] bg-surface shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-invert-default flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-warning-invert-default flex items-center justify-center flex-shrink-0">
              <Home size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-default">{title}</h2>
              <p className="text-xs text-body mt-0.5">Fill in the cabin details below.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-caption hover:text-body hover:bg-default-hovered transition-colors"><X size={18} /></button>
        </div>

        <Formik
          initialValues={{ name: initial?.name ?? "", status: initial?.status ?? "Available" as CabinStatus }}
          validationSchema={cabinSchema}
          onSubmit={(values) => { onSave({ ...values, status: values.status as CabinStatus }); onClose(); }}
          enableReinitialize
        >
          {() => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Cabin Name */}
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">Cabin Name <span className="text-primary">*</span></label>
                  <Field name="name" type="text" placeholder="e.g. TCT01"
                    className="w-full px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <ErrorMessage name="name" component="p" className="mt-1 text-xs text-danger" />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">Status <span className="text-primary">*</span></label>
                  <Field as="select" name="status"
                    className="w-full px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Field>
                </div>
                <p className="text-xs text-caption -mt-2">
                  Blackout dates are managed from this cabin&apos;s detail view.
                </p>
              </div>
              <div className="px-6 py-5 border-t border-invert-default flex gap-3 flex-shrink-0">
                <Button type="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-invert-default text-default justify-center">Cancel</Button>
                <Button type="submit" className="flex-1 py-2.5 text-sm font-semibold bg-primary-default text-invert-default hover:bg-primary-hovered justify-center">{confirmLabel}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

// ── View detail drawer ─────────────────────────────────────────────────────────
function CabinDetailDrawer({
  cabin, onClose, onUpdateBlackoutDates,
}: {
  cabin: Cabin;
  onClose: () => void;
  onUpdateBlackoutDates: (cabinId: string, next: BlackoutDate[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "blackout">("details");

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[2100] w-[640px] bg-surface shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-invert-default flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-default">{cabin.name}</h2>
            {cabin.clusterId && <p className="text-xs text-body mt-0.5">{cabin.clusterId}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-caption hover:text-body hover:bg-default-hovered transition-colors"><X size={18} /></button>
        </div>

        <div className="flex border-b border-invert-default px-6 flex-shrink-0">
          {([
            { key: "details" as const, label: "Cabin Details" },
            { key: "blackout" as const, label: "Blackout Dates" },
          ]).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={cn(
                "px-1 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === key ? "border-primary text-primary" : "border-transparent text-caption hover:text-body"
              )}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "details" ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="bg-default-default rounded-xl border border-invert-default divide-y divide-invert-default">
              {[
                { label: "Cabin Name", value: cabin.name },
                ...(cabin.clusterId ? [{ label: "Cluster", value: cabin.clusterId }] : []),
                { label: "Updated On", value: cabin.updatedOn.replace("\n", " ") },
                { label: "Blackout Dates", value: String(cabin.blackoutDates.length) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-4 py-3">
                  <span className="text-xs text-body">{label}</span>
                  <span className="text-xs font-semibold text-default text-right">{value}</span>
                </div>
              ))}
              <div className="flex items-start justify-between px-4 py-3">
                <span className="text-xs text-body">Status</span>
                <CabinStatusBadge status={cabin.status} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <BlackoutDatesTab
              dates={cabin.blackoutDates}
              onChange={(next) => onUpdateBlackoutDates(cabin.id, next)}
            />
          </div>
        )}
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function CabinManagement() {
  const [cabins, setCabins] = useState<Cabin[]>(INITIAL_CABINS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Cabin | null>(null);
  const [viewing, setViewing] = useState<Cabin | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBulk, setDeleteBulk] = useState(false);

  const filtered = useMemo(
    () => cabins.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.clusterId?.toLowerCase().includes(searchQuery.toLowerCase())),
    [cabins, searchQuery]
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const allSelected = paginated.length > 0 && paginated.every(c => selected.has(c.id));
  const someSelected = paginated.some(c => selected.has(c.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map(c => c.id)));
  const toggleSelect = (id: string) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const handleAdd = (data: { name: string; status: CabinStatus }) => {
    const now = new Date();
    setCabins(prev => [...prev, {
      id: `cb-${Date.now()}`,
      ...data,
      blackoutDates: [],
      updatedOn: `${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}\n${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
    }]);
  };

  const handleEdit = (data: { name: string; status: CabinStatus }) => {
    if (!editing) return;
    setCabins(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c));
    setEditing(null);
  };

  const handleDelete = (id: string) => setCabins(prev => prev.filter(c => c.id !== id));
  const handleDeleteBulk = () => { setCabins(prev => prev.filter(c => !selected.has(c.id))); setSelected(new Set()); };

  const handleUpdateBlackoutDates = (cabinId: string, next: BlackoutDate[]) => {
    setCabins(prev => prev.map(c => c.id === cabinId ? { ...c, blackoutDates: next } : c));
    setViewing(prev => prev && prev.id === cabinId ? { ...prev, blackoutDates: next } : prev);
  };

  const columns = useMemo<ColumnDef<Cabin, any>[]>(() => [
    {
      id: "select", width: "44px" as any, minWidth: "44px" as any, maxWidth: "44px" as any,
      header: () => <Checkbox size={16} checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />,
      cell: ({ row }: any) => <div onClick={e => e.stopPropagation()}><Checkbox size={16} checked={selected.has(row.original.id)} onChange={() => toggleSelect(row.original.id)} /></div>,
    },
    {
      id: "no", header: () => "No", width: "52px" as any, minWidth: "52px" as any, maxWidth: "52px" as any,
      cell: ({ row }: any) => <span className="text-sm text-body">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>,
    },
    {
      id: "cabin",
      header: () => "Cabin",
      cell: ({ row }: any) => (
        <div className="cursor-pointer" onClick={() => setViewing(row.original)}>
          <div className="text-sm font-semibold text-default hover:text-primary">{row.original.name}</div>
          {row.original.clusterId && <div className="text-xs text-caption">{row.original.clusterId}</div>}
        </div>
      ),
    },
    {
      id: "status", header: () => "Status",
      cell: ({ row }: any) => <div className="cursor-pointer" onClick={() => setViewing(row.original)}><CabinStatusBadge status={row.original.status} /></div>,
    },
    {
      id: "blackoutDates", header: () => "Blackout Date",
      cell: ({ row }: any) => <div onClick={e => e.stopPropagation()}><BlackoutCell dates={row.original.blackoutDates} /></div>,
    },
    {
      id: "updatedOn", header: () => "Updated On",
      cell: ({ row }: any) => (
        <div className="cursor-pointer" onClick={() => setViewing(row.original)}>
          <div className="text-sm text-default">{row.original.updatedOn.split("\n")[0]}</div>
          <div className="text-xs text-caption">{row.original.updatedOn.split("\n")[1]}</div>
        </div>
      ),
    },
    {
      id: "actions", header: () => "",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => setViewing(row.original)} className="p-1.5 rounded-lg text-caption hover:text-primary hover:bg-default-hovered transition-colors"><Eye size={15} /></button>
          <button onClick={() => setEditing(row.original)} className="p-1.5 rounded-lg text-caption hover:text-primary hover:bg-default-hovered transition-colors"><Pencil size={15} /></button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded-lg text-caption hover:text-danger hover:bg-danger-invert-soft transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ], [allSelected, someSelected, selected, currentPage]);

  return (
    <div className="flex-1 overflow-auto bg-default-default">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-default">Cabin Management</h1>
          <div className="flex items-center gap-3">
            <Button type="outline" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-invert-default text-body hover:bg-default-hovered font-semibold w-auto">
              <Download size={14} /> Export Spreadsheet
            </Button>
            <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-primary-default text-invert-default hover:bg-primary-hovered font-semibold w-auto shadow-sm">
              Add Cabin
            </Button>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-invert-default shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-invert-default">
            <h2 className="text-sm font-bold text-default">
              Cabin <span className="text-body font-normal">({cabins.length} Cabins)</span>
            </h2>
            <div className="flex items-center gap-3">
              {selected.size > 0 && (
                <Button type="outline" onClick={() => setDeleteBulk(true)} className="flex items-center gap-1.5 text-sm font-medium text-danger hover:text-danger border-0 w-auto px-0 py-0">
                  <Trash2 size={14} /> Delete
                </Button>
              )}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
                <InputCustom
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search"
                  className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage} />
        </div>
      </div>

      {showAdd    && <CabinDrawer onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {editing    && <CabinDrawer title="Edit Cabin" confirmLabel="Save Changes" initial={editing} onClose={() => setEditing(null)} onSave={handleEdit} />}
      {viewing    && <CabinDetailDrawer cabin={viewing} onClose={() => setViewing(null)} onUpdateBlackoutDates={handleUpdateBlackoutDates} />}
      {deleteId   && <DeleteConfirmDialog message="Are you sure you want to delete this cabin?" onCancel={() => setDeleteId(null)} onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }} />}
      {deleteBulk && <DeleteConfirmDialog message={`Delete ${selected.size} selected cabin${selected.size === 1 ? "" : "s"}?`} onCancel={() => setDeleteBulk(false)} onConfirm={() => { handleDeleteBulk(); setDeleteBulk(false); }} />}
    </div>
  );
}
