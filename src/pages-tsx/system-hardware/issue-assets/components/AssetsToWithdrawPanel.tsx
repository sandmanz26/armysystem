import { useMemo, useState } from "react";
import { AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Weapon } from "@/data/mock";
import type { ScannedAsset } from "../types";

type WeaponStatus = "Pending" | "Complete" | "Over-scanned";

interface WeaponRow {
  type: string;
  required: number;
  scanned: number;
  status: WeaponStatus;
}

const STATUS_STYLES: Record<WeaponStatus, string> = {
  Pending: "bg-default-default text-body",
  Complete: "bg-success-invert-soft text-success",
  "Over-scanned": "bg-danger-invert-soft text-danger",
};

interface AssetsToWithdrawPanelProps {
  requiredWeapons: Weapon[];
  scannedAssets: ScannedAsset[];
}

export function AssetsToWithdrawPanel({ requiredWeapons, scannedAssets }: AssetsToWithdrawPanelProps) {
  const [view, setView] = useState<"overall" | "byStation">("overall");
  const [showDetails, setShowDetails] = useState(true);

  const rows: WeaponRow[] = useMemo(() => {
    const scannedByType = new Map<string, number>();
    for (const a of scannedAssets) {
      scannedByType.set(a.assetType, (scannedByType.get(a.assetType) ?? 0) + 1);
    }
    return requiredWeapons.map((w) => {
      const scanned = scannedByType.get(w.type) ?? 0;
      const status: WeaponStatus =
        scanned > w.quantity ? "Over-scanned" : scanned === w.quantity ? "Complete" : "Pending";
      return { type: w.type, required: w.quantity, scanned, status };
    });
  }, [requiredWeapons, scannedAssets]);

  const byStation = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const a of scannedAssets) {
      if (!map.has(a.targetBaseStation)) map.set(a.targetBaseStation, new Map());
      const inner = map.get(a.targetBaseStation)!;
      inner.set(a.assetType, (inner.get(a.assetType) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [scannedAssets]);

  const totalRequired = requiredWeapons.reduce((sum, w) => sum + w.quantity, 0);
  const totalScanned = scannedAssets.length;
  const overScannedCount = rows.filter((r) => r.status === "Over-scanned").length;

  return (
    <div className="w-[380px] flex-shrink-0 bg-surface border border-invert-default rounded-xl p-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-default">Assets to Withdraw</h3>
      </div>

      {overScannedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-invert-soft border border-invert-danger text-xs text-danger">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>
            {overScannedCount} weapon{overScannedCount > 1 ? "s" : ""} over-scanned.{" "}
            <button
              type="button"
              onClick={() => setView("overall")}
              className="font-semibold underline underline-offset-2 hover:text-primary"
            >
              Review issue
            </button>
          </span>
        </div>
      )}

      <div className="flex items-center rounded-lg bg-default-default p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setView("overall")}
          className={cn(
            "flex-1 py-1.5 rounded-md transition-colors",
            view === "overall" ? "bg-surface text-primary shadow-sm" : "text-body"
          )}
        >
          Overall
        </button>
        <button
          type="button"
          onClick={() => setView("byStation")}
          className={cn(
            "flex-1 py-1.5 rounded-md transition-colors",
            view === "byStation" ? "bg-surface text-primary shadow-sm" : "text-body"
          )}
        >
          By Station
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm">
          <span className="text-2xl font-bold text-default">{totalScanned}</span>
          <span className="text-disabled">/{totalRequired}</span>{" "}
          <span className="text-xs text-body">Total Scanned Assets</span>
        </p>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          {showDetails ? "Hide Details" : "Show Details"}
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {showDetails && view === "overall" && (
        <div className="border border-invert-default rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-danger-invert-soft/70 text-primary">
                <th className="text-left font-semibold px-3 py-2">Weapons</th>
                <th className="text-left font-semibold px-3 py-2">Qty Required</th>
                <th className="text-left font-semibold px-3 py-2">Qty Scanned</th>
                <th className="text-left font-semibold px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.type} className="border-t border-invert-default">
                  <td className="px-3 py-2 font-medium text-default">{r.type}</td>
                  <td className="px-3 py-2 text-caption">{r.required}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-semibold",
                      r.status === "Over-scanned" ? "text-danger" : "text-default"
                    )}
                  >
                    {r.scanned}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("px-2 py-0.5 rounded-full font-semibold", STATUS_STYLES[r.status])}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-disabled">
                    No weapon requirements found for this booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetails && view === "byStation" && (
        <div className="border border-invert-default rounded-lg overflow-hidden divide-y divide-invert-default">
          {byStation.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-disabled">No assets scanned yet.</p>
          )}
          {byStation.map(([station, types]) => (
            <div key={station} className="px-3 py-2">
              <p className="text-xs font-bold text-default mb-1">{station}</p>
              <ul className="space-y-0.5">
                {Array.from(types.entries()).map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between text-xs text-caption">
                    <span>{type}</span>
                    <span className="font-semibold text-default">{count} scanned</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
