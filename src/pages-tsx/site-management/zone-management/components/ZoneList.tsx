import { useState, useMemo } from "react";
import { Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PER_PAGE } from "../constants";
import type { Cluster, Zone } from "../types";

const zoneSchema = Yup.object().shape({
  name: Yup.string().required("Zone name is required"),
});

function ZoneDrawer({
  onClose,
  onSave,
  initial,
  title = "Add Zone",
  confirmLabel = "Confirm",
}: {
  onClose: () => void;
  onSave: (data: { name: string }) => void;
  initial?: Zone;
  title?: string;
  confirmLabel?: string;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[2100] w-[440px] bg-surface shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-invert-default flex-shrink-0">
          <h2 className="text-base font-semibold text-default">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-caption hover:text-body hover:bg-default-hovered transition-colors">
            <X size={18} />
          </button>
        </div>

        <Formik
          initialValues={{ name: initial?.name ?? "" }}
          validationSchema={zoneSchema}
          onSubmit={(values) => { onSave(values); onClose(); }}
          enableReinitialize
        >
          {() => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-default mb-1.5">
                    Zone Name <span className="text-primary">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="e.g. Zone A"
                    className="w-full px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <ErrorMessage name="name" component="p" className="mt-1 text-xs text-danger" />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-invert-default flex gap-3 flex-shrink-0">
                <Button type="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-invert-default text-default justify-center">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 py-2.5 text-sm font-semibold bg-primary-default text-invert-default hover:bg-primary-hovered justify-center">
                  {confirmLabel}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

interface ZoneListProps {
  zones: Zone[];
  clusters: Cluster[];
  onView: (zone: Zone) => void;
  onAdd: (data: { name: string }) => void;
  onEdit: (zone: Zone, data: { name: string }) => void;
  onDelete: (zoneId: string) => void;
}

export function ZoneList({ zones, clusters, onView, onAdd, onEdit, onDelete }: ZoneListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);

  const clusterCountOf = (zoneId: string) => clusters.filter((c) => c.zoneId === zoneId).length;

  const filtered = useMemo(
    () => zones.filter((z) => !searchQuery || z.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [zones, searchQuery],
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = useMemo<ColumnDef<Zone, any>[]>(() => [
    {
      id: "no", header: () => "No", width: "52px" as any, minWidth: "52px" as any, maxWidth: "52px" as any,
      cell: ({ row }: any) => <span className="text-sm text-body">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>,
    },
    {
      id: "name",
      header: () => "Zone Name",
      cell: ({ row }: any) => (
        <div className="cursor-pointer" onClick={() => onView(row.original)}>
          <span className="text-sm font-semibold text-default hover:text-primary">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "clusters",
      header: () => "Clusters",
      cell: ({ row }: any) => (
        <div className="cursor-pointer" onClick={() => onView(row.original)}>
          <span className="text-sm text-default">{clusterCountOf(row.original.id)}</span>
        </div>
      ),
    },
    {
      id: "actions", header: () => "",
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onView(row.original)} className="p-1.5 rounded-lg text-caption hover:text-primary hover:bg-default-hovered transition-colors"><Eye size={15} /></button>
          <button onClick={() => setEditing(row.original)} className="p-1.5 rounded-lg text-caption hover:text-primary hover:bg-default-hovered transition-colors"><Pencil size={15} /></button>
          <button onClick={() => setDeleteTarget(row.original)} className="p-1.5 rounded-lg text-caption hover:text-danger hover:bg-danger-invert-soft transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [currentPage, clusters]);

  return (
    <div className="flex-1 overflow-auto bg-default-default">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-default">Zone Management</h1>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-primary-default text-invert-default hover:bg-primary-hovered font-semibold w-auto shadow-sm">
            Add Zone
          </Button>
        </div>

        <div className="bg-surface rounded-xl border border-invert-default shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-invert-default">
            <h2 className="text-sm font-bold text-default">
              Zone <span className="text-body font-normal">({zones.length} Zones)</span>
            </h2>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
              <InputCustom
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage} />
        </div>
      </div>

      {showAdd && <ZoneDrawer onClose={() => setShowAdd(false)} onSave={onAdd} />}
      {editing && (
        <ZoneDrawer
          title="Edit Zone"
          confirmLabel="Save Changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => { onEdit(editing, data); setEditing(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? Its ${clusterCountOf(deleteTarget.id)} cluster(s) will be deleted too.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
