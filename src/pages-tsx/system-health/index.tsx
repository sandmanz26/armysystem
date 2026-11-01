import { useState } from "react";
import { RefreshCw, Activity, CheckCircle2, AlertTriangle, Cpu, Server, Thermometer, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import type { Status } from "./types";
import { BIT_TOMS_SECTIONS, BIT_TRX_ITEMS, HUMS_ITEMS, LAST_UPDATE, BASE_STATIONS } from "./constants";
import { isGood, isWarn, statusColor, statusDot } from "./utils";
import { SectionCard } from "./components/SectionCard";
import { TrxCard } from "./components/TrxCard";
import { OverallIcon } from "./components/OverallIcon";
import { SystemInformation } from "./components/SystemInformation";
import { RunBitModal } from "./components/RunBitModal";

export function SystemHealth() {
  const [detailSection, setDetailSection] = useState<string | null>(null);
  const [showRunBit, setShowRunBit] = useState(false);

  if (detailSection !== null) {
    return <SystemInformation initialSection={detailSection} onBack={() => setDetailSection(null)} />;
  }

  const trxCols: (typeof BIT_TRX_ITEMS)[] = [[], [], []];
  BIT_TRX_ITEMS.forEach((item, i) => trxCols[i % 3].push(item));

  const humsCols: (typeof HUMS_ITEMS)[] = [[], [], []];
  HUMS_ITEMS.forEach((item, i) => humsCols[i % 3].push(item));

  // Summary stats
  const allItems    = [...BIT_TOMS_SECTIONS.flatMap((s) => s.items), ...BIT_TRX_ITEMS, ...HUMS_ITEMS];
  const passedCount = allItems.filter((i) => isGood(i.status)).length;
  const failedCount = allItems.filter((i) => i.status === "Failed").length;
  const warnCount   = allItems.filter((i) => isWarn(i.status)).length;
  const overallPct  = Math.round((passedCount / allItems.length) * 100);
  const systemStatus: Status = failedCount > 0 ? "Failed" : warnCount > 0 ? "Unknown" : "Passed";

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-5">

        {/* Page header + summary */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">System Health</h1>
            <p className="text-xs text-gray-400 mt-0.5">Built-In Test &amp; Health Monitor Status</p>
          </div>
          <Button
            onClick={() => setShowRunBit(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg font-semibold transition-all hover:bg-brand-primary/90 shadow-sm w-auto"
          >
            <RefreshCw size={14} />
            Re-run BIT
          </Button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "System Status",
              value: systemStatus,
              icon: <OverallIcon status={systemStatus} />,
              bg: systemStatus === "Passed" ? "bg-green-50 border-green-200" : systemStatus === "Failed" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200",
              valClass: statusColor(systemStatus),
            },
            {
              label: "Overall Health",
              value: `${overallPct}%`,
              icon: <Activity size={16} className="text-blue-500" />,
              bg: "bg-blue-50 border-blue-200",
              valClass: "text-blue-600",
            },
            {
              label: "Passed Checks",
              value: passedCount.toString(),
              icon: <CheckCircle2 size={16} className="text-green-500" />,
              bg: "bg-green-50 border-green-200",
              valClass: "text-green-600",
            },
            {
              label: "Issues Found",
              value: (failedCount + warnCount).toString(),
              icon: <AlertTriangle size={16} className="text-red-500" />,
              bg: "bg-red-50 border-red-200",
              valClass: "text-red-600",
            },
          ].map((card) => (
            <div key={card.label} className={cn("rounded-xl border p-4 flex items-center gap-3", card.bg)}>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={cn("text-xl font-bold leading-tight", card.valClass)}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BIT (Built-In Test) section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Activity size={16} className="text-brand-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">BIT (Built-In Test)</h2>
                <p className="text-xs text-gray-400">Last Update: {LAST_UPDATE}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* BIT (TOMS) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">BIT (TOMS)</h3>
              </div>
              <div className="flex gap-4 flex-wrap">
                {BIT_TOMS_SECTIONS.map((section) => (
                  <SectionCard key={section.id} section={section} onDetail={setDetailSection} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* BIT (TRX) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">BIT (TRX)</h3>
                <span className="ml-auto text-xs text-gray-400">{BIT_TRX_ITEMS.length} components in {BASE_STATIONS.length} base stations</span>
              </div>
              <div className="flex gap-3">
                {trxCols.map((col, ci) => (
                  <TrxCard key={ci} items={col} onDetail={setDetailSection} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HUMS section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Thermometer size={16} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">HUMS</h2>
              <p className="text-xs text-gray-400">{HUMS_ITEMS.length} components in {BASE_STATIONS.length} base stations</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              {humsCols.map((col, ci) => (
                <div key={ci} className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {col.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setDetailSection("hums-trx")}
                      className="w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(item.status))} />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-xs font-semibold", statusColor(item.status))}>
                          {item.perStation
                            ? `${item.perStation.filter((s) => s.status === item.status).length}/${item.perStation.length} ${item.status}`
                            : item.status}
                        </span>
                        <ChevronRight size={13} className="text-gray-300" />
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <RunBitModal open={showRunBit} onClose={() => setShowRunBit(false)} />
    </div>
  );
}
