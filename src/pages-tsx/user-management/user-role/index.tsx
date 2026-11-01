import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Icon } from "@/components/icon";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/button";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { SortIcon, nextSort, sortBy, type SortDir } from "@/lib/sortUtils";
import { userRoles as initialRoles, users } from "@/data/userManagement";
import type { UserRole } from "@/data/userManagement";
import { UserRoleDrawer } from "./modals/UserRoleDrawer";

const PER_PAGE = 10;

/** Figma `User Role - List` (5029:61): Inactive is DANGER here, unlike the
    Asset pages where the same word is neutral — hence the per-screen map. */
const TONE = { Active: "success", Inactive: "danger" } as const;

function TwoLine({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-default">{primary}</span>
      {secondary && <span className="text-xs text-body">{secondary}</span>}
    </div>
  );
}

export function UserRole() {
  const [roles, setRoles] = useState<UserRole[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRole | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserRole | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = roles.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const sorted = sortField ? sortBy(filtered, sortField as keyof UserRole, sortDir) : filtered;
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /** Figma's blocked-delete state counts users still holding this role. */
  const assignedUserCount = (r: UserRole | null) =>
    r ? users.filter((u) => u.userRole === r.name).length : 0;

  const handleSubmit = (v: { name: string; status: string }) => {
    if (editTarget) {
      setRoles((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...v } as UserRole : r)));
      setToast(`${v.name} updated`);
      setEditTarget(null);
    } else {
      setRoles((prev) => [
        ...prev,
        {
          ...(v as unknown as UserRole),
          id: `r${Date.now()}`,
          createdBy: "Admin",
          createdByRole: "System Admin",
          createdOn: "Just now\n—",
        },
      ]);
      setToast(`${v.name} added`);
      setShowAdd(false);
    }
  };

  const columns = useMemo<ColumnDef<UserRole, any>[]>(
    () => [
      {
        id: "no",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        header: () => "No.",
        cell: ({ row }: any) => (
          <span className="text-sm text-default">
            {(currentPage - 1) * PER_PAGE + row.index + 1}
          </span>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: () => (
          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            User Role <SortIcon active={sortField === "name"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.name}</span>,
      },
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => (
          <StatusBadge tone={TONE[row.original.status as keyof typeof TONE] ?? "neutral"}>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        id: "createdBy",
        header: () => "Created by",
        cell: ({ row }: any) => (
          <TwoLine primary={row.original.createdBy} secondary={row.original.createdByRole} />
        ),
      },
      {
        id: "createdOn",
        accessorKey: "createdOn",
        header: () => (
          <button
            onClick={() => handleSort("createdOn")}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            Created on <SortIcon active={sortField === "createdOn"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.createdOn).split("\n");
          return <TwoLine primary={date} secondary={time} />;
        },
      },
      {
        id: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditTarget(row.original)}
              aria-label="Edit"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Icon name="pencil" size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirm(row.original)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-danger hover:bg-primary-invert-soft transition-colors"
            >
              <Icon name="trash-2" size={16} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, sortField, sortDir],
  );

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Page header — Figma `Page Header` + `Button Primary` (154x40) */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold text-default whitespace-nowrap">User Role</h1>
          <Button
            onClick={() => setShowAdd(true)}
            className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
          >
            <Icon name="plus" size={16} />
            Add User Role
          </Button>
        </div>

        {/* Section Layout - Table */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            {/* Figma Section Header (5029:61): "User Role" + bare count, both 16 Semi Bold, count in text/body. */}
            <h2 className="flex items-center gap-2 text-base font-semibold leading-6 text-default">
              User Role
              <span className="text-body">{sorted.length}</span>
            </h2>
            <div className="relative w-60">
              <Icon
                name="search"
                size={22}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-[42px] pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
              />
            </div>
          </div>

          <TableCustom<UserRole> columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={sorted.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Add / Edit share one drawer */}
      <UserRoleDrawer
        open={showAdd || !!editTarget}
        initial={editTarget}
        existingNames={roles.map((r) => r.name)}
        onClose={() => {
          setShowAdd(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteConfirm && assignedUserCount(deleteConfirm) === 0}
        tone="warning"
        title={<>Delete &ldquo;{deleteConfirm?.name}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            setRoles((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
            setToast(`${deleteConfirm.name} deleted`);
          }
          setDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm && assignedUserCount(deleteConfirm) > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{deleteConfirm?.name}&rdquo;</>}
        subtitle={`${assignedUserCount(deleteConfirm)} users are currently assigned this role. Reassign them before deleting it.`}
        cancelLabel="Close"
        confirmLabel="View Users"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          setDeleteConfirm(null);
          window.location.href = "/user-management/user-list";
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
