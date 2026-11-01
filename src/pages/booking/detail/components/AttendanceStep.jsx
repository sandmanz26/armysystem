import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search, Upload, Plus, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { ScanIDContent } from "./ScanIDContent";
import { Case2FinalNominalRollPage } from "./Case2FinalNominalRollPage";
import { AttendanceConfirmationModal, FinalConfirmationModal, Case2AttendanceSummaryModal, Case2UnregisteredAlert, Case2SuccessAlert, } from "../modals/AlertModals";
import { UploadModal } from "../modals/UploadModal";
import { CASE2_TRAINEES, PER_PAGE } from "../constants";
import { useBookingStore } from "../store/useBookingStore";
const columnHelper = createColumnHelper();
function AttendanceStatusText({ status }) {
    if (status === "Non-registered (Present)")
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 whitespace-nowrap">{status}</span>;
    if (status === "Registered (Absent)")
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 whitespace-nowrap">{status}</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">{status}</span>;
}
export function AttendanceStep({ onNext }) {
    const booking = useBookingStore((s) => s.booking);
    const [trainees, setTrainees] = useState([]);
    const [scanVariant, setScanVariant] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showUpload, setShowUpload] = useState(false);
    const [showScanPage, setShowScanPage] = useState(false);
    const [pendingVariant, setPendingVariant] = useState("case1");
    const [showAttendanceConfirm, setShowAttendanceConfirm] = useState(false);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [showCase2Summary, setShowCase2Summary] = useState(false);
    const [showCase2Unregistered, setShowCase2Unregistered] = useState(false);
    const [showCase2FinalRoll, setShowCase2FinalRoll] = useState(false);
    const [showCase2Alert, setShowCase2Alert] = useState(false);
    const hasData = trainees.length > 0;
    const isCase2 = scanVariant === "case2";
    const startScan = (variant) => { setPendingVariant(variant); setShowScanPage(true); };
    const handleUpload = () => { setTrainees(booking?.trainees ?? []); setShowUpload(false); };
    const columns = useMemo(() => [
        columnHelper.display({
            id: "select",
            header: () => <Checkbox size={16}/>,
            cell: () => <Checkbox size={16}/>,
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
            id: "weaponType",
            header: () => isCase2 ? "Weapon Type(s)" : "Role(s)",
            cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
        }),
        columnHelper.display({
            id: "status",
            header: () => "Status",
            cell: ({ row }) => isCase2
                ? <AttendanceStatusText status={row.original.attendanceStatus ?? "Registered (Present)"}/>
                : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">Registered (Present)</span>,
        }),
        columnHelper.accessor("lastUpdated", {
            header: () => "Last Updated On",
            cell: ({ getValue }) => (<span className="text-sm text-gray-400 whitespace-pre-line leading-snug">
          {getValue() ?? "17 January 2025\n09:29:33 AM"}
        </span>),
        }),
        columnHelper.display({
            id: "actions",
            header: () => "",
            cell: () => (<div className="flex items-center gap-2">
          <Button className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Pencil size={14}/>
          </Button>
          <Button className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 size={14}/>
          </Button>
        </div>),
        }),
    ], [isCase2, currentPage]);
    if (showScanPage) {
        return (<ScanIDContent onBack={() => setShowScanPage(false)} onFinished={(scanned) => {
                const data = pendingVariant === "case2" ? CASE2_TRAINEES : scanned;
                setTrainees(data);
                setScanVariant(pendingVariant);
                setShowScanPage(false);
                if (pendingVariant === "case1")
                    setShowAttendanceConfirm(true);
            }}/>);
    }
    if (showAttendanceConfirm) {
        return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <AttendanceConfirmationModal open={true} attendeesCount={trainees.length} onConfirm={() => setShowAttendanceConfirm(false)} onCancel={() => { setTrainees([]); setShowAttendanceConfirm(false); setShowScanPage(false); }}/>
      </div>);
    }
    if (showCase2FinalRoll) {
        return (<>
        <Case2FinalNominalRollPage trainees={trainees} onBack={() => setShowCase2FinalRoll(false)} onConfirm={() => { setShowCase2FinalRoll(false); setShowCase2Alert(true); }}/>
        {showCase2Alert && (<Case2SuccessAlert open={showCase2Alert} onClose={() => { setShowCase2Alert(false); onNext(); }}/>)}
      </>);
    }
    if (showFinalConfirm) {
        return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <FinalConfirmationModal open={true} traineesCount={trainees.length} onConfirm={onNext} onCancel={() => setShowFinalConfirm(false)}/>
      </div>);
    }
    const filtered = trainees.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Confirm Attendance for the Training</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please check the attendance of the trainees by scanning or uploading final nominal roll.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="outline" onClick={onNext} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200">
            <ArrowLeft size={14}/> Back
          </Button>
          <Button onClick={hasData ? () => isCase2 ? setShowCase2Summary(true) : setShowFinalConfirm(true) : undefined} disabled={!hasData} className={cn("flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto", hasData ? "bg-brand-primary text-white hover:bg-brand-primary-hover" : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
            {hasData ? (isCase2 ? "Confirm attendance submission" : "Confirm nominal roll list") : "Next"} <ArrowRight size={14}/>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Nominal Roll List <span className="font-normal text-gray-400">({trainees.length} Trainees)</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <InputCustom type="text" placeholder="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-48 focus:ring-1 focus:ring-brand-primary"/>
              </div>
              <Button type="outline" onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200">
                <Upload size={14}/> Upload List
              </Button>
              <Button onClick={() => startScan("case1")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
                <Plus size={13}/> Scan ID
              </Button>
              <button type="button" onClick={() => startScan("case2")} className="text-xs text-gray-400 underline underline-offset-2 hover:text-brand-primary transition-colors whitespace-nowrap">
                Scan ID Case 2 →
              </button>
            </div>
          </div>

          {paginated.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No trainees to show right now !</p>
              <p className="text-xs text-gray-400 mb-6">Click on "Upload List" or "Scan ID" to create a nominal roll in the system</p>
              <div className="flex items-center gap-3">
                <Button type="outline" onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-300">
                  <Upload size={14}/> Upload List
                </Button>
                <Button onClick={() => startScan("case1")} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
                  <Plus size={13}/> Scan ID
                </Button>
              </div>
            </div>) : (<TableCustom columns={columns} data={paginated} autoScrollTable={false}/>)}

          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>

      {showUpload && <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUpload={handleUpload}/>}
      {showCase2Summary && (<Case2AttendanceSummaryModal open={showCase2Summary} trainees={trainees} onCancel={() => setShowCase2Summary(false)} onConfirm={() => { setShowCase2Summary(false); setShowCase2Unregistered(true); }}/>)}
      {showCase2Unregistered && (<Case2UnregisteredAlert open={showCase2Unregistered} onCancel={() => setShowCase2Unregistered(false)} onUpdate={() => { setShowCase2Unregistered(false); setShowCase2FinalRoll(true); }}/>)}
      {showCase2Alert && (<Case2SuccessAlert open={showCase2Alert} onClose={() => { setShowCase2Alert(false); onNext(); }}/>)}
    </div>);
}
