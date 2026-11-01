import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import logoTrx from "@/assets/logotrx.png";
import { BIT_TOMS_SECTIONS } from "../constants";
import { statusColor } from "../utils";

type Stage = "intro" | "running" | "done";

function ProgressRing({ percent }: { percent: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none" stroke="#DC2626" strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="78" textAnchor="middle" className="fill-gray-800" style={{ fontSize: 28, fontWeight: 700 }}>
        {percent}%
      </text>
    </svg>
  );
}

export function RunBitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (open) { setStage("intro"); setPercent(0); }
  }, [open]);

  useEffect(() => {
    if (stage !== "running") return;
    const interval = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(100, p + Math.round(8 + Math.random() * 12));
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage("done"), 300);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <Modal open={open} onClose={onClose} width={stage === "done" ? "800px" : "560px"} isUseX={stage !== "running"}>
      {stage === "intro" && (
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mx-auto mb-5 flex items-center justify-center">
            <img src={logoTrx} alt="TOMS" className="w-full h-full object-contain p-2" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Begin Built-In Test (BIT) for system readiness</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Run the BIT to verify key TOMS components like network connectivity, database access, system alerts, and RFID functionality.
            Ensure the system is fully operational before training activities begin.
          </p>
          <Button
            onClick={() => setStage("running")}
            className="px-8 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover mx-auto"
          >
            Run BIT
          </Button>
        </div>
      )}

      {stage === "running" && (
        <div className="text-center py-4">
          <ProgressRing percent={percent} />
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-1">Running system checks...</h3>
          <p className="text-sm text-gray-500">This may take a few moments. Please don't close this window.</p>
        </div>
      )}

      {stage === "done" && (
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-5">Built-in Test completed successfully!</h3>
          <Button
            onClick={onClose}
            className="px-8 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover mx-auto mb-6"
          >
            Proceed to dashboard
          </Button>

          <div className="border border-gray-100 rounded-xl overflow-hidden text-left">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800">BIT (TOMS)</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {BIT_TOMS_SECTIONS.map((section) => (
                <div key={section.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                    <span className={cn("text-xs font-semibold", statusColor(section.overallStatus))}>{section.overallStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-600 whitespace-nowrap">{item.label}</span>
                        <span className={cn("font-medium flex-shrink-0", statusColor(item.status))}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
