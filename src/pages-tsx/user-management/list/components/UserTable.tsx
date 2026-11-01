import { useMemo, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Icon } from "@/components/icon";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import type { User } from "@/data/userManagement";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { UserRowMenu } from "./UserRowMenu";
import { PER_PAGE } from "../constants";
import type { UserNavigate } from "../types";

interface UserTableProps {
  paginated: User[];
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onNavigate?: UserNavigate;
  /** Row action "Move to Archive" — ⋮ menu (Overall etc.) or the archive icon (Operator). */
  onArchive: (user: User) => void;
  /**
   * Figma Operator tab (5014:9093): an "Armskote Personnel" column after Service ID,
   * and the row actions are 👁 + an archive icon button instead of 👁 + ⋮.
   * (That frame also shows "Archived Date" and "Inactive" — copied from the
   * Archived tab; deliberately not added to the active Operator tab.)
   */
  variant?: "default" | "operator";
}

/**
 * Fixed Figma column width (`Table - Header Cell` / `Table - Body Cell`, 20px
 * side padding). Content wider than the cell truncates with an ellipsis, the
 * way Figma shows "Vector Defence…" / "System A…" (7010:542599).
 */
function col(width: number) {
  return { width, minWidth: width, maxWidth: width } as const;
}

function Cell({
  width,
  className,
  onClick,
  children,
}: {
  width: number;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("cursor-pointer truncate text-sm text-default", className)}
      style={{ maxWidth: width - 40 }}
    >
      {children}
    </div>
  );
}

export function UserTable({
  paginated,
  currentPage,
  totalItems,
  onPageChange,
  onNavigate,
  onArchive,
  variant = "default",
}: UserTableProps) {
  const columns = useMemo<ColumnDef<User, any>[]>(() => {
    // User Details (5014:9360 / 7021:593632 / 5947:73530) shows the clicked user:
    // `?id=` for a reload, router state for the row as edited/archived in this list.
    const openUser = (u: User) =>
      onNavigate?.(`/user-management/user-detail?id=${encodeURIComponent(u.id)}`, { state: { user: u } });
    const isOperator = variant === "operator";

    return [
      {
        id: "no",
        ...col(56),
        header: () => "No.",
        cell: ({ row }) => (
          <Cell width={56} onClick={() => openUser(row.original)} className="text-body">
            {(currentPage - 1) * PER_PAGE + row.index + 1}
          </Cell>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "userId",
        ...col(200),
        header: () => "User ID",
        cell: (info) => (
          <Cell width={200} onClick={() => openUser(info.row.original)} className="font-semibold">
            #{info.getValue()}
          </Cell>
        ),
      },
      {
        accessorKey: "rank",
        ...col(80),
        header: () => "Rank",
        cell: (info) => <Cell width={80} onClick={() => openUser(info.row.original)}>{info.getValue()}</Cell>,
      },
      {
        accessorKey: "name",
        ...col(200),
        header: () => "Name",
        cell: (info) => <Cell width={200} onClick={() => openUser(info.row.original)}>{info.getValue()}</Cell>,
      },
      {
        accessorKey: "svcId",
        ...col(120),
        header: () => "Service ID",
        // Masked Service ID never truncates: the app font draws "*" wider than Figma's,
        // so "*****218J" is a few px over 80 — let the column grow instead.
        cell: (info) => (
          <div onClick={() => openUser(info.row.original)} className="cursor-pointer whitespace-nowrap text-sm text-default">
            {info.getValue()}
          </div>
        ),
      },
      ...(isOperator
        ? [
            {
              id: "armskotePersonnel",
              ...col(176),
              header: () => "Armskote Personnel",
              cell: ({ row }: { row: { original: User } }) => (
                <Cell width={176} onClick={() => openUser(row.original)}>
                  {row.original.armskotePersonnel ? "Yes" : "No"}
                </Cell>
              ),
            } as ColumnDef<User, any>,
          ]
        : []),
      {
        accessorKey: "companyName",
        ...col(160),
        header: () => "Company Name",
        cell: (info) => (
          <Cell width={160} onClick={() => openUser(info.row.original)}>
            {info.getValue() || "—"}
          </Cell>
        ),
      },
      {
        accessorKey: "userRole",
        ...col(120),
        header: () => "User Role",
        cell: (info) => <Cell width={120} onClick={() => openUser(info.row.original)}>{info.getValue()}</Cell>,
      },
      {
        accessorKey: "accountStatus",
        ...col(120),
        header: () => "Status",
        cell: (info) => (
          <div onClick={() => openUser(info.row.original)} className="cursor-pointer">
            <AccountStatusBadge status={info.getValue()} />
          </div>
        ),
      },
      {
        // Figma `Table - Fixed Column`: 104 wide, 20px padding, buttons right-aligned.
        id: "actions",
        ...col(104),
        header: () => <span className="flex-1 pr-1 text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5 pr-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="View user"
              onClick={() => openUser(row.original)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-default-default transition-colors"
            >
              <Icon name="eye" size={16} />
            </button>
            {isOperator ? (
              <button
                type="button"
                aria-label="Move to Archive"
                title="Move to Archive"
                onClick={() => onArchive(row.original)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-default-default transition-colors"
              >
                <Icon name="archive" size={16} />
              </button>
            ) : (
              <UserRowMenu
                onEdit={() => {}}
                onArchive={() => onArchive(row.original)}
                onResetPassword={() => {}}
              />
            )}
          </div>
        ),
        enableSorting: false,
      },
    ];
  }, [currentPage, onNavigate, onArchive, variant]);

  return (
    <>
      <TableCustom<User> columns={columns} data={paginated} autoScrollTable={true} />
      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={totalItems}
        setCurrentPage={onPageChange}
      />
    </>
  );
}
