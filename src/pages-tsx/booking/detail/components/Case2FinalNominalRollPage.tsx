import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search, Upload, Plus, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { PER_PAGE } from "../constants";

const columnHelper = createColumnHelper<any>();

export function Case2FinalNominalRollPage({
  trainees,
  onBack,
  onConfirm,
}: {
  trainees: any[];
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const finalTrainees = trainees.map((t) => ({ ...t, attendanceStatus: "Registered (Present)" }));

  const filtered = finalTrainees.filter(
    (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery)
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: () => <Checkbox size={16} />,
      cell: () => <Checkbox size={16} />,
    }),
    columnHelper.display({
      id: "no",
      header: () => "No",
      cell: ({ row }) => <span className="text-sm text-gray-700">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>,
    }),
    columnHelper.accessor("rank", {
      header: () => "Rank",
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
    }),
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: ({ getValue }) => <span className="text-sm font-medium text-gray-800">{getValue()}</span>,
    }),
    columnHelper.accessor("svcId", {
      header: () => "Service ID",
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
    }),
    columnHelper.accessor("platoon", {
      header: () => "Platoon Number",
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
    }),
    columnHelper.accessor("weaponType", {
      header: () => "Weapon Type(s)",
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
    }),
    columnHelper.display({
      id: "status",
      header: () => "Status",
      cell: () => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
          Registered (Present)
        </span>
      ),
    }),
    columnHelper.accessor("lastUpdated", {
      header: () => "Last Updated On",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-400 whitespace-pre-line leading-snug">
          {getValue() ?? "17 January 2025\n09:29:33 AM"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => "",
      cell: () => (
        <div className="flex items-center gap-2">
          <Button className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Pencil size={14} />
          </Button>
          <Button className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    }),
  ], [currentPage]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Final Nominal Roll List</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm your final nominal roll list submitted is correct.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
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
            Confirm nominal roll list <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Nominal Roll List <span className="font-normal text-gray-400">({finalTrainees.length} Trainees)</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputCustom
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-48 focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <Button
                type="outline"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200"
              >
                <Upload size={14} /> Upload final nominal roll list
              </Button>
              <Button
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                <Plus size={13} /> Scan ID
              </Button>
            </div>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={false} />
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
