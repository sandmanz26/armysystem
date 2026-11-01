import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";

const DEFAULT_ROWS = [
  {
    id: "1",
    no: 1,
    assignmentId: "260605-AT002",
    assetName: "M16 (4)",
    assetTagId: "250101-M16004",
    assetType: "M16",
    assetCategory: "Weapon",
    status: "Missing",
    issuedDate: "11:21:01 AM\n05 Jul 2026",
  },
];

export function ReadyForReturnAssetsModal({ open, onClose }) {
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const rows = DEFAULT_ROWS;

  const allSelected = rows.length > 0 && selectedRows.size === rows.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < rows.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
      return;
    }
    setSelectedRows(new Set(rows.map((row) => row.id)));
  };

  const toggleOne = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} size={16} />
      ),
      cell: ({ row }) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selectedRows.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            size={16}
          />
        </div>
      ),
      compact: true,
    },
    {
      id: "no",
      header: () => "No",
      accessorKey: "no",
      compact: true,
    },
    {
      id: "assignmentId",
      header: () => "Assignment ID",
      accessorKey: "assignmentId",
    },
    {
      id: "assetName",
      header: () => "Asset Name",
      accessorKey: "assetName",
    },
    {
      id: "assetTagId",
      header: () => "Asset Tag ID",
      accessorKey: "assetTagId",
    },
    {
      id: "assetType",
      header: () => "Asset Type",
      accessorKey: "assetType",
    },
    {
      id: "assetCategory",
      header: () => "Asset Category",
      accessorKey: "assetCategory",
    },
    {
      id: "status",
      header: () => "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500">
          {getValue()}
        </span>
      ),
    },
    {
      id: "issuedDate",
      header: () => "Issued Date",
      accessorKey: "issuedDate",
      normalWhitespace: "true",
      cell: ({ getValue }) => {
        const value = String(getValue() || "");
        const [time = "", date = ""] = value.split("\n");
        return (
          <div className="text-sm text-gray-700 leading-5">
            <div>{time}</div>
            <div>{date}</div>
          </div>
        );
      },
    },
  ], [allSelected, someSelected, selectedRows]);

  return (
    <Modal open={open} onClose={onClose} width={980} isUseX={false}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={24} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-2sm font-bold text-gray-800">Select Asset For Ready To Return</h3>
          <p className="text-sm text-gray-500">Please select asset or continue without select for all asset to ready for return</p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <TableCustom
          columns={columns}
          data={rows}
          autoScrollTable={true}
          classTheadTh="py-3 px-3 text-xs"
          classTBodyTd="h-[48px] px-3 text-sm"
          outerClass="max-h-[300px]"
        />
      </div>

      <div className="pt-3">
        <Pagination currentPage={1} itemsPerPage={10} totalItems={rows.length} setCurrentPage={() => {}} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="button"
          onClick={onClose}
          className="w-full justify-center bg-[#F5ECEA] text-[#9B231A] hover:bg-[#F0E1DE]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="w-full justify-center bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
