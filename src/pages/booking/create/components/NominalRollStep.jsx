import { useState, useMemo } from "react";
import { Search, Upload, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmExportModal } from "../modals/ConfirmExportModal";
import { UploadListModal } from "../modals/UploadListModal";
import { NOMINAL_ROLL_DATA, PER_PAGE } from "../constants";
export function NominalRollStep({ onNext, sessionType }) {
    const [trainees] = useState(NOMINAL_ROLL_DATA);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const isIntegrated = sessionType === "Integrated";
    const filtered = useMemo(() => trainees.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery)), [trainees, searchQuery]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const columns = useMemo(() => [
        {
            id: "select",
            compact: true,
            width: "40px",
            minWidth: "40px",
            maxWidth: "40px",
            header: () => <Checkbox size={14}/>,
            cell: () => <Checkbox size={14}/>,
        },
        {
            id: "no",
            compact: true,
            width: "50px",
            minWidth: "50px",
            maxWidth: "50px",
            header: () => <span className="block text-center w-full">No</span>,
            cell: ({ row }) => (<span className="block text-center w-full text-sm text-gray-700">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>),
        },
        { accessorKey: "rank", header: () => "Rank", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "name", header: () => "Name", cell: ({ getValue }) => <span className="text-sm font-medium text-gray-800">{getValue()}</span> },
        { accessorKey: "svcId", header: () => "Service ID", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "platoon", header: () => "Platoon Number", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        { accessorKey: "weapon", header: () => "Weapon Type(s)", cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span> },
        {
            id: "lastUpdated",
            header: () => "Last Updated On",
            cell: () => (<span className="text-sm text-gray-500">
          17 January 2025<br /><span className="text-xs">09.29.33 AM</span>
        </span>),
        },
        {
            id: "actions",
            header: () => "",
            cell: () => (<div className="flex items-center gap-2">
          <button type="button" className="text-gray-400 hover:text-gray-600"><Pencil size={14}/></button>
          <button type="button" className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
        </div>),
        },
    ], [currentPage]);
    return (<div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">
          Nominal Roll List <span className="font-normal text-gray-500">( {trainees.length} Trainee(s) )</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <InputCustom value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search" className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:ring-1 focus:ring-brand-primary"/>
          </div>
          <Button type="outline" onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200">
            <Upload size={14}/> Upload List
          </Button>
          <Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
            <Plus size={14}/> Add Trainee
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <TableCustom columns={columns} data={paginated} autoScrollTable={true} tableFixed={true}/>
        <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
      </div>

      {showExportModal && (<ConfirmExportModal onCancel={() => setShowExportModal(false)} onConfirm={() => { setShowExportModal(false); onNext(); }}/>)}
      {showUploadModal && <UploadListModal onClose={() => setShowUploadModal(false)}/>}

      {/* Hidden trigger used by BookingForm to programmatically advance this step */}
      <button id="nominal-next-trigger" type="button" className="hidden" onClick={() => {
            if (isIntegrated) {
                setShowExportModal(true);
            }
            else {
                onNext();
            }
        }}/>
    </div>);
}
