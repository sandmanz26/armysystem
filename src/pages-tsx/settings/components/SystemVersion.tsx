import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Toast } from "@/components/toast";
import { INITIAL_VERSIONS } from "../constants";
import type { VersionEntry } from "../types";
import { AddVersionDrawer } from "../modals/AddVersionDrawer";
import { SettingsPanel } from "./SettingsPanel";

const columnHelper = createColumnHelper<VersionEntry>();

const VER_PER_PAGE = 10;

/**
 * Figma `System Version` (`5108:73523` ▸ frame "System Version").
 *
 * Body = `Page Header` 1096×40 + `Section Layout - Table` 1096×480.
 * The Page Header grows to 40 because its `🔄 Right Content` slot holds the
 * primary **Add Version** button — so the button belongs beside the page
 * title, not above the table as a second heading row.
 *
 * Inside the card: `Section Header` ("System Version", 16 Semi Bold), then the
 * table **full-bleed** to the card's 1096 width (hence `flush`), then
 * `Pagination`. There is no inner border around the table — the card's own
 * `color/border/invert/default` is the only outline.
 *
 * Cell tokens, read off `Table - Settings - System Version`:
 * version `text/default` 14 Semi Bold · date `text/default` 14 · time
 * `text/body` 12 · patch notes `text/default` 14 · action icons `text/caption`.
 */
export function SystemVersion() {
  const [versions, setVersions] = useState<VersionEntry[]>(INITIAL_VERSIONS);
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; entry?: VersionEntry } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const paginated = versions.slice((currentPage - 1) * VER_PER_PAGE, currentPage * VER_PER_PAGE);

  // Toast copy is Figma's, verbatim: "Version 0.6.9-21 added" / "updated" /
  // "deleted" (the `Toast - Success` frame in each action section).
  const handleAdd = (v: Omit<VersionEntry, "id">) => {
    setVersions((prev) => [{ ...v, id: `v-${Date.now()}` }, ...prev]);
    setToast(`Version ${v.version} added`);
  };
  const handleEdit = (v: Omit<VersionEntry, "id">) => {
    if (!drawer?.entry) return;
    setVersions((prev) => prev.map((e) => e.id === drawer.entry!.id ? { ...e, ...v } : e));
    setToast(`Version ${v.version} updated`);
  };
  const handleDelete = (id: string) => {
    const gone = versions.find((v) => v.id === id);
    setVersions((prev) => prev.filter((v) => v.id !== id));
    if (gone) setToast(`Version ${gone.version} deleted`);
  };

  const columns: ColumnDef<VersionEntry, any>[] = [
    columnHelper.accessor("version", {
      header: () => "Version",
      cell: (info) => <span className="font-semibold text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("date", {
      header: () => "Date",
      cell: (info) => {
        const parts = info.getValue().split("\n");
        return (
          <div>
            <div className="text-sm text-default">{parts[0]}</div>
            <div className="text-xs text-body">{parts[1]}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("patchNotes", {
      header: () => "Patch Notes",
      cell: (info) => (
        <ul className="list-disc list-inside space-y-0.5">
          {info.getValue().map((note: string, i: number) => (
            <li key={i} className="text-sm text-default">{note}</li>
          ))}
        </ul>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDrawer({ mode: "edit", entry: row.original })}
            className="p-1.5 text-caption hover:text-primary hover:bg-primary-invert-soft rounded transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteConfirm(row.original.id)}
            className="p-1.5 text-caption hover:text-danger hover:bg-danger-invert-soft rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ];

  return (
    <>
      <SettingsPanel
        title="System Version"
        sectionTitle="System Version"
        flush
        headerAction={
          <Button
            onClick={() => setDrawer({ mode: "add" })}
            className="w-auto h-10 px-4 gap-1.5 bg-primary-default hover:bg-primary-hovered text-invert-default text-sm font-semibold rounded-lg"
          >
            <Plus size={18} /> Add Version
          </Button>
        }
      >
        <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
        <Pagination
          currentPage={currentPage}
          itemsPerPage={VER_PER_PAGE}
          totalItems={versions.length}
          setCurrentPage={setCurrentPage}
        />
      </SettingsPanel>

      {drawer && (
        <AddVersionDrawer
          mode={drawer.mode}
          initial={drawer.entry}
          existingVersions={versions.map((v) => v.version)}
          onClose={() => setDrawer(null)}
          onConfirm={drawer.mode === "add" ? handleAdd : handleEdit}
        />
      )}
      {deleteConfirm && (
        <DeleteConfirmDialog
          // Figma's copy, verbatim: the title names the version and the body is
          // one short line — not a sentence restating the title.
          title={`Delete \u201C${versions.find((v) => v.id === deleteConfirm)?.version ?? ""}\u201D?`}
          message="This can't be undone."
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => { handleDelete(deleteConfirm); setDeleteConfirm(null); }}
        />
      )}
      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </>
  );
}
