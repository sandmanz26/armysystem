import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { ScannedAssetsTable } from "./components/ScannedAssetsTable";
import { SuccessModal } from "./components/SuccessModal";
import { DUMMY_SCANNED_ASSETS } from "./constants";
export function IssueAssets({ onNavigate }) {
    const [phase, setPhase] = useState("scanning");
    const [scannedAssets, setScannedAssets] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showSuccess, setShowSuccess] = useState(false);
    const [baseStation, setBaseStation] = useState("TRX-03");
    const [bookingId, setBookingId] = useState(null);
    // Parse URL params
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        let bs = searchParams.get("baseStation");
        let bk = searchParams.get("bookingIds");
        if (!bs && !bk) {
            const hash = window.location.hash;
            const bsMatch = hash.match(/baseStation=([^&]+)/);
            if (bsMatch)
                bs = decodeURIComponent(bsMatch[1]);
            const bkMatch = hash.match(/bookingIds=([^&]+)/);
            if (bkMatch)
                bk = decodeURIComponent(bkMatch[1]);
        }
        if (bs)
            setBaseStation(bs);
        if (bk)
            setBookingId(bk.split(",")[0]);
    }, []);
    // Auto-transition after 4 seconds
    useEffect(() => {
        if (phase === "scanning") {
            const timer = setTimeout(() => {
                setScannedAssets(DUMMY_SCANNED_ASSETS);
                setPhase("scanned");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [phase]);
    /* ── Checkbox helpers ── */
    const allChecked = scannedAssets.length > 0 && selectedIds.size === scannedAssets.length;
    const someChecked = selectedIds.size > 0 && !allChecked;
    const toggleAll = () => {
        if (allChecked) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(scannedAssets.map((a) => a.id)));
        }
    };
    const toggleOne = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    /* ── Delete helpers ── */
    const handleDeleteOne = (id) => {
        setScannedAssets((prev) => prev.filter((a) => a.id !== id).map((a, i) => ({ ...a, no: i + 1 })));
        setSelectedIds((prev) => {
            const n = new Set(prev);
            n.delete(id);
            return n;
        });
    };
    const handleDeleteSelected = () => {
        setScannedAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)).map((a, i) => ({ ...a, no: i + 1 })));
        setSelectedIds(new Set());
    };
    const handleStationChange = (id, station) => {
        setScannedAssets((prev) => prev.map((a) => (a.id === id ? { ...a, targetBaseStation: station } : a)));
    };
    const handleConfirm = () => setShowSuccess(true);
    const handleSuccessClose = () => setShowSuccess(false);
    const handleViewAssignment = () => {
        setShowSuccess(false);
        if (bookingId) {
            onNavigate?.(`/bookings/detail?id=${bookingId}`);
        }
        else {
            onNavigate?.("/bookings/list");
        }
    };
    const totalCount = scannedAssets.length;
    return (<div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* ── Success Modal ── */}
      {showSuccess && (<SuccessModal onClose={handleSuccessClose} onViewAssignment={handleViewAssignment}/>)}

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Scan Assets for Training ({baseStation})
            {phase === "scanned" && (<span className="ml-2 text-green-500 font-medium text-xs">● Connected</span>)}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Total Scans ({phase === "scanned" ? totalCount : 0} Assets)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => onNavigate?.("/system-hardware/create-assignment")} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
            <ArrowLeft size={14}/> Back
          </Button>
          {phase === "scanning" ? (<Button type="button" disabled className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-300 cursor-not-allowed">
              <ArrowRight size={14}/> Next
            </Button>) : (<Button type="button" onClick={handleConfirm} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover">
              <Check size={14}/> Confirm
            </Button>)}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-5">
        {phase === "scanning" ? (
        /* ── Scanning State ── */
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-20 px-6 text-center min-h-[400px]">
            <div className="mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-2 border-red-200 animate-ping opacity-30"/>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-2 border-red-300 animate-ping opacity-40" style={{ animationDelay: "0.5s" }}/>
              </div>
              <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="56" cy="56" r="54" stroke="#DC2626" strokeWidth="2"/>
                <path d="M 72 38 Q 82 47 82 56 Q 82 65 72 74" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M 79 31 Q 93 42 93 56 Q 93 70 79 81" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
                <rect x="28" y="38" width="30" height="38" rx="3" stroke="#DC2626" strokeWidth="2" fill="none"/>
                <rect x="32" y="42" width="22" height="8" rx="1" fill="#DC2626" opacity="0.25"/>
                <rect x="32" y="54" width="22" height="3" rx="1" fill="#DC2626" opacity="0.5"/>
                <rect x="32" y="60" width="14" height="3" rx="1" fill="#DC2626" opacity="0.3"/>
                <rect x="36" y="76" width="14" height="4" rx="1" fill="#DC2626" opacity="0.5"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Place your asset on the RFID reader.
            </h3>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Please make sure to place one asset on the RFID Reader at a time, wait for it to be
              scanned, and then place the next one.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}/>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}/>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}/>
              </span>
              Scanning in progress...
            </div>
          </div>) : (
        /* ── Scanned State ── */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Table toolbar */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                List of Assets ({totalCount} Assets)
              </h3>
              {selectedIds.size > 0 && (<Button type="button" onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                  <Trash2 size={13}/>
                  Delete Selected ({selectedIds.size})
                </Button>)}
            </div>

            {/* Table */}
            <ScannedAssetsTable data={scannedAssets} selectedIds={selectedIds} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} onToggleOne={toggleOne} onDeleteOne={handleDeleteOne} onStationChange={handleStationChange}/>
          </div>)}
      </div>
    </div>);
}
