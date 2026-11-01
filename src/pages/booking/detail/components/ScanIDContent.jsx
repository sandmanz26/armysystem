import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { useBookingStore } from "../store/useBookingStore";
export function ScanIDContent({ onBack, onFinished, }) {
    const booking = useBookingStore((s) => s.booking);
    const [status, setStatus] = useState("scanning");
    const [scanned, setScanned] = useState([]);
    const [scanPage, setScanPage] = useState(1);
    const COLS = 10;
    const SCAN_PER = COLS * 2;
    const isConnected = status === "connected";
    useEffect(() => {
        if (status !== "scanning")
            return;
        const t = setTimeout(() => { setStatus("connected"); setScanned(booking?.trainees ?? []); }, 2500);
        return () => clearTimeout(t);
    }, [status, booking?.trainees]);
    const totalPages = Math.max(1, Math.ceil(scanned.length / SCAN_PER));
    const pageStart = (scanPage - 1) * SCAN_PER;
    const pageItems = scanned.slice(pageStart, pageStart + SCAN_PER);
    const leftItems = pageItems.slice(0, COLS);
    const rightItems = pageItems.slice(COLS);
    return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <style>{`@keyframes scanLine { 0%,100%{top:4%} 50%{top:82%} } .scan-line-anim { position:absolute; left:0; right:0; height:2px; background:#ef4444; animation:scanLine 2s ease-in-out infinite; }`}</style>
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Scan ID for the training
            {isConnected && <span className="text-green-500 font-normal"> — (Connected)</span>}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Total scans ({scanned.length} IDs)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="outline" onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200">
            <ArrowLeft size={14}/> Back
          </Button>
          <Button onClick={() => isConnected && onFinished(scanned)} disabled={!isConnected} className={cn("flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto", isConnected ? "bg-brand-primary text-white hover:bg-brand-primary-hover" : "bg-gray-100 text-gray-300 cursor-not-allowed")}>
            <ArrowRight size={14}/> Finished scanning
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!isConnected ? (<div className="relative h-[520px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"/>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }}/>
              <div className="absolute top-6 left-0 right-0 flex justify-center">
                <span className="text-white text-base font-semibold drop-shadow-lg">Place your identity card inside the rectangle box to scan it</span>
              </div>
              <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "480px", height: "300px" }}>
                <div className="absolute inset-0 border-2 border-green-400 rounded-sm"/>
                {[["top-0 left-0", "border-t-4 border-l-4"], ["top-0 right-0", "border-t-4 border-r-4"], ["bottom-0 left-0", "border-b-4 border-l-4"], ["bottom-0 right-0", "border-b-4 border-r-4"]].map(([pos, b]) => (<div key={pos} className={cn("absolute w-6 h-6 border-green-400", pos, b)}/>))}
                <div className="scan-line-anim"/>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                  <span className="text-white text-xs font-medium">Scanning…</span>
                </div>
              </div>
            </div>) : (<div>
              <div className="px-5 py-4 border-b border-gray-100 text-center">
                <h3 className="text-base font-bold text-gray-800">Trainned Scanned List</h3>
              </div>
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {[leftItems, rightItems].map((col, ci) => (<div key={ci} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-2 bg-red-50 border-b border-gray-100">
                        <div className="px-4 py-2.5 text-xs font-bold text-brand-primary">No</div>
                        <div className="px-4 py-2.5 text-xs font-bold text-brand-primary">Service ID</div>
                      </div>
                      {col.map((t, i) => (<div key={i} className="grid grid-cols-2 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                          <div className="px-4 py-3 text-sm text-gray-700">{pageStart + (ci === 1 ? COLS : 0) + i + 1}</div>
                          <div className="px-4 py-3 text-sm text-gray-600">{t.svcId}</div>
                        </div>))}
                    </div>))}
                </div>
                <div className="flex items-center justify-center gap-1 mt-5">
                  {[["«", 1], ["‹", Math.max(1, scanPage - 1)], null, ["›", Math.min(totalPages, scanPage + 1)], ["»", totalPages]].map((item, idx) => item === null ? (<span key={idx} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded bg-white min-w-[40px] text-center">
                        {scanPage} of {totalPages}
                      </span>) : (<Button key={idx} onClick={() => setScanPage(item[1])} disabled={item[1] === scanPage || (item[0] === "«" || item[0] === "‹" ? scanPage === 1 : scanPage === totalPages)} className="w-8 h-8 p-0 flex items-center justify-center border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                        {item[0]}
                      </Button>))}
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
