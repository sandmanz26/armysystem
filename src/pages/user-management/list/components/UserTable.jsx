import { useMemo } from "react";
import { Eye } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { UserRowMenu } from "./UserRowMenu";
import { PER_PAGE } from "../constants";
export function UserTable({ paginated, currentPage, totalPages, totalItems, selected, allSelected, onToggleAll, onToggleOne, onPageChange, onNavigate, onEditUser }) {
    const columns = useMemo(() => {
        const someSelected = selected.size > 0 && !allSelected;
        return [
            {
                id: "select",
                width: 60,
                minWidth: 60,
                maxWidth: 60,
                header: () => (<div className="flex items-center justify-center">
            <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} size={16}/>
          </div>),
                cell: ({ row }) => (<div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.original.id)} onChange={() => onToggleOne(row.original.id)} size={16}/>
          </div>),
                enableSorting: false,
            },
            {
                id: "no",
                width: 60,
                minWidth: 60,
                maxWidth: 60,
                header: () => "No",
                cell: ({ row }) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-500 font-medium">
            {(currentPage - 1) * PER_PAGE + row.index + 1}
          </div>),
                enableSorting: false,
            },
            {
                accessorKey: "userId",
                header: () => "User ID",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-700">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "rank",
                header: () => "Rank",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-700">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "name",
                header: () => "Name",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-800 font-medium">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "svcId",
                header: () => "Service ID",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-700">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "unitName",
                header: () => "Unit Name",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-700">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "userRole",
                header: () => "User Role",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer text-gray-700">
            {info.getValue()}
          </div>),
            },
            {
                accessorKey: "accountStatus",
                header: () => "Status",
                cell: (info) => (<div onClick={() => onNavigate?.("/user-management/user-detail")} className="cursor-pointer">
            <AccountStatusBadge status={info.getValue()}/>
          </div>),
            },
            {
                id: "actions",
                header: () => "Actions",
                cell: (info) => (<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onNavigate?.("/user-management/user-detail")} className="p-1 rounded text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors">
              <Eye size={16}/>
            </button>
            <UserRowMenu onEdit={() => onEditUser?.(info.row.original)} onArchive={() => { }} onResetPassword={() => { }}/>
          </div>),
                enableSorting: false,
            },
        ];
    }, [allSelected, selected, currentPage, onToggleAll, onToggleOne, onNavigate]);
    return (<>
      <TableCustom columns={columns} data={paginated} autoScrollTable={true} classThead="bg-red-50"/>
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={totalItems} setCurrentPage={onPageChange}/>
    </>);
}
