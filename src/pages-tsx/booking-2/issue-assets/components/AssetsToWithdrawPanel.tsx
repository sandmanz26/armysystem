import { useMemo, useState } from "react";
import { AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Weapon } from "@/data/mock";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert } from "@/components/alert";
import { Icon } from "@/components/icon";
import { SegmentedPicker } from "@/components/segmented-picker";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { TableCustom } from "@/components/table";
import { Select } from "@/components/select";
import type { ScanCourseware, ScanTarget } from "../scanMode";
import type { ScanMode, ScannedAsset } from "../types";

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
              <tr className="bg-danger-invert-soft text-primary">
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
                  <td className="px-3 py-2 text-body">{r.required}</td>
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
                  <li key={type} className="flex items-center justify-between text-xs text-body">
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

/* ── F-009: Top Up / Scan & Return right-hand panel ──────────────────────────────────
 * Figma `Assets to Withdraw` (Top Up, 5895:360312) / `Assets to Return` (5895:412370 /
 * 5895:412400): Section header 64 · Alert · Segmented Picker md (Overall / By Station) ·
 * "{scanned}/{target} Total Scanned Assets" + View / Hide Details · table Asset Type (Return:
 * "Asset") · Target Qty · Qty Scanned · Status. Top Up counts what is already issued into Qty
 * Scanned (103/120 before any scan) and flags extras as "Above Target" (warning); Return
 * flags extras as "Over-scanned" (danger). By Station (5895:412325): stations collapsed,
 * a station that doesn't add up opens by itself, with a coloured dot and fraction.
 * Administration & Maintenance: Top Up is a bare "Summary" (5895:368095 / 5895:368110 —
 * Asset Type · Qty Scanned); Return keeps the table without the picker (5895:423102).
 */
const colW = (px: number): any => ({ width: `${px}px`, minWidth: `${px}px`, maxWidth: `${px}px` });

type ScanRowStatus = "Pending" | "Complete" | "Above Target" | "Over-scanned";

const SCAN_STATUS_TONE: Record<ScanRowStatus, BadgeTone> = {
  Pending: "neutral",
  Complete: "success",
  "Above Target": "warning",
  "Over-scanned": "danger",
};

interface ScanTargetRow {
  type: string;
  target: number;
  scanned: number;
  status: ScanRowStatus;
}

export interface ScanTargetsPanelProps {
  mode: ScanMode;
  kind: "booking" | "admin";
  title: string;
  targets: ScanTarget[];
  scanned: ScannedAsset[];
  /** Issue with 2+ courseware: Figma's "Courseware" picker (8091:191587). */
  coursewares?: ScanCourseware[];
  courseware?: string;
  onCoursewareChange?: (key: string) => void;
}

export function ScanTargetsPanel({ mode, kind, title, targets: allTargets, scanned, coursewares, courseware = "all", onCoursewareChange }: ScanTargetsPanelProps) {
  const activeCw = coursewares?.find((c) => c.key === courseware);
  const targets = activeCw ? activeCw.targets : allTargets;
  const [view, setView] = useState<"overall" | "byStation">("overall");
  const [showDetails, setShowDetails] = useState(false);
  const [openStations, setOpenStations] = useState<Set<string> | null>(null);
  const over: ScanRowStatus = mode !== "return" ? "Above Target" : "Over-scanned";
  const statusOf = (s: number, t: number): ScanRowStatus => (s > t ? over : s === t ? "Complete" : "Pending");

  const rows: ScanTargetRow[] = useMemo(() => {
    const counts = new Map<string, number>();
    scanned.forEach((a) => counts.set(a.assetType, (counts.get(a.assetType) ?? 0) + 1));
    const list = targets.map((t) => {
      const s = t.baseline + (counts.get(t.type) ?? 0);
      return { type: t.type, target: t.target, scanned: s, status: statusOf(s, t.target) };
    });
    // A type nobody asked for (top up of a new type) still shows, against a target of 0.
    counts.forEach((n, type) => {
      if (!targets.some((t) => t.type === type)) list.push({ type, target: 0, scanned: n, status: statusOf(n, 0) });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, scanned, mode]);

  const stations = useMemo(() => {
    const names = new Set<string>();
    targets.forEach((t) => Object.keys(t.byStation).forEach((s) => names.add(s)));
    scanned.forEach((a) => names.add(a.targetBaseStation));
    return [...names].sort().map((station) => {
      const types = new Set<string>([...targets.map((t) => t.type), ...scanned.map((a) => a.assetType)]);
      const items = [...types]
        .map((type) => {
          const t = targets.find((x) => x.type === type);
          const target = t?.byStation[station] ?? 0;
          const base = t && t.baseline ? target : 0;
          const s = base + scanned.filter((a) => a.assetType === type && a.targetBaseStation === station).length;
          return { type, target, scanned: s, status: statusOf(s, target) };
        })
        .filter((r) => r.target > 0 || r.scanned > 0);
      const target = items.reduce((n, r) => n + r.target, 0);
      const got = items.reduce((n, r) => n + r.scanned, 0);
      return { station, items, target, scanned: got, status: statusOf(got, target), mismatch: items.some((r) => r.status === over) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, scanned, mode]);

  const openSet = openStations ?? new Set(stations.filter((s) => s.mismatch).map((s) => s.station));
  const toggleStation = (s: string) => {
    const next = new Set(openSet);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setOpenStations(next);
  };

  const totalTarget = rows.reduce((n, r) => n + r.target, 0);
  const totalScanned = rows.reduce((n, r) => n + r.scanned, 0);
  const extras = rows.filter((r) => r.status === over);
  const summaryOnly = kind === "admin" && mode !== "return";

  const columns: ColumnDef<ScanTargetRow, any>[] = summaryOnly
    ? [
        { id: "type", ...colW(200), header: () => "Asset Type", cell: (i) => <span className="text-sm font-semibold text-default">{i.row.original.type}</span> },
        { id: "scanned", ...colW(120), header: () => "Qty Scanned", cell: (i) => <span className="text-sm text-default">{i.row.original.scanned}</span> },
      ]
    : [
        {
          id: "type",
          ...colW(96),
          header: () => (mode === "return" ? "Asset" : "Asset Type"),
          cell: (i) => <span className="text-sm font-semibold text-default">{i.row.original.type}</span>,
        },
        { id: "target", ...colW(84), header: () => "Target Qty", cell: (i) => <span className="text-sm text-default">{i.row.original.target}</span> },
        {
          id: "scanned",
          ...colW(104),
          header: () => "Qty Scanned",
          cell: (i) => {
            const r = i.row.original;
            return (
              <span
                className={cn(
                  "text-sm font-semibold",
                  r.status === "Above Target" ? "text-warning" : r.status === "Over-scanned" ? "text-danger" : "text-default",
                )}
              >
                {r.scanned}
              </span>
            );
          },
        },
        {
          id: "status",
          ...colW(112),
          header: () => "Status",
          cell: (i) => <StatusBadge tone={SCAN_STATUS_TONE[i.row.original.status]}>{i.row.original.status}</StatusBadge>,
        },
      ];

  const scannedOnlyRows = summaryOnly
    ? rows.filter((r) => r.scanned > 0).map((r) => ({ ...r, scanned: r.scanned - (targets.find((t) => t.type === r.type)?.baseline ?? 0) })).filter((r) => r.scanned > 0)
    : rows;
  const summaryTotal = summaryOnly ? scanned.length : totalScanned;

  return (
    <section className="w-[400px] flex-shrink-0 self-start overflow-hidden rounded-xl border border-invert-default bg-surface">
      <header className="flex h-16 items-center px-5">
        <h3 className="text-base font-semibold text-default">{title}</h3>
      </header>

      <div className="flex flex-col gap-5 px-5 pb-5">
        {extras.length > 0 && !summaryOnly && (
          mode !== "return" ? (
            <Alert message={`Above Target Qty: ${extras.map((r) => `${r.type} (+${r.scanned - r.target})`).join(", ")}`} />
          ) : (
            <Alert
              status="danger"
              message={`${extras.reduce((n, r) => n + r.scanned - r.target, 0)} asset${extras.reduce((n, r) => n + r.scanned - r.target, 0) === 1 ? "" : "s"} over-scanned.`}
            />
          )
        )}

        {coursewares && coursewares.length > 1 && (
          <Select
            label="Courseware"
            required
            value={courseware}
            onChange={(v) => onCoursewareChange?.(v)}
            options={[
              { value: "all", label: `All Courseware (${coursewares.length})` },
              ...coursewares.map((c) => ({ value: c.key, label: c.label })),
            ]}
            caption={activeCw ? `Showing: ${activeCw.sub}` : undefined}
          />
        )}

        {kind === "booking" && (
          <SegmentedPicker
            size="md"
            className="flex w-full [&>button]:flex-1 [&>button]:justify-center"
            value={view}
            onChange={setView}
            options={[
              { value: "overall", label: "Overall" },
              { value: "byStation", label: "By Station" },
            ]}
          />
        )}

        {view === "overall" || kind === "admin" ? (
          <div className="flex items-center gap-2">
            <p className="flex items-baseline text-xl text-default">
              <span className="font-semibold">{summaryTotal}</span>
              {!summaryOnly && <span>/{totalTarget}</span>}
            </p>
            <span className="flex-1 text-sm text-default">Total Scanned Assets</span>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              {showDetails ? "Hide Details" : "View Details"}
              <Icon name={showDetails ? "chevron-up" : "chevron-down"} size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 text-sm font-medium text-primary">
            <button type="button" onClick={() => setOpenStations(new Set(stations.map((s) => s.station)))}>
              Expand All
            </button>
            <span className="h-4 w-px bg-divider" aria-hidden />
            <button type="button" onClick={() => setOpenStations(new Set())}>
              Collapse All
            </button>
          </div>
        )}

        {view === "byStation" && kind === "booking" && (
          <div className="flex flex-col gap-3">
            {stations.map((s) => {
              const open = openSet.has(s.station);
              return (
                <div key={s.station} className="rounded-lg border border-invert-default">
                  <button
                    type="button"
                    onClick={() => toggleStation(s.station)}
                    className="flex h-12 w-full items-center gap-2 px-4 text-left"
                  >
                    <StationDot status={s.mismatch ? over : s.status} />
                    <span className="flex-1 text-sm font-semibold text-default">{s.station}</span>
                    <span className={cn("text-sm font-medium", fractionTone(s.mismatch ? over : s.status))}>
                      {s.scanned}/{s.target}
                    </span>
                    <Icon name={open ? "chevron-up" : "chevron-down"} size={16} className="text-body" />
                  </button>
                  {open && (
                    <ul className="flex flex-col border-t border-invert-default px-4 py-2">
                      {s.items.map((r) => (
                        <li key={r.type} className="flex h-9 items-center gap-2 text-xs">
                          <StationDot status={r.status} />
                          <span className="flex-1 text-default">{r.type}</span>
                          <span className={cn("font-semibold", fractionTone(r.status))}>
                            {r.scanned}/{r.target}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetails && (view === "overall" || kind === "admin") && (
        <TableCustom
          columns={columns}
          data={scannedOnlyRows}
          autoScrollTable={true}
          classTheadTh="px-3"
          classTBodyTd="px-3"
          {...(summaryOnly
            ? {
                // Figma `Scan Assets - Empty Expand` (Admin, 5499:80347): "No assets scanned yet".
                emptyIcon: <Icon name="box" size={24} className="text-placeholder" />,
                emptyTitle: <span className="text-body">No assets scanned yet</span>,
                emptySubtitle: <span />,
              }
            : {})}
        />
      )}
    </section>
  );
}

function fractionTone(s: ScanRowStatus) {
  if (s === "Complete") return "text-success";
  if (s === "Over-scanned") return "text-danger";
  if (s === "Above Target") return "text-warning";
  return "text-default";
}

function StationDot({ status }: { status: ScanRowStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-1.5 w-1.5 flex-shrink-0 rounded-full",
        status === "Complete"
          ? "bg-success-default"
          : status === "Over-scanned"
            ? "bg-danger-default"
            : status === "Above Target"
              ? "bg-warning-default"
              : "bg-default-invert-default",
      )}
    />
  );
}
