// F-009 (SH-4 / SH-27 / SH-18 / BD-14 / BD-20) — the Top Up and Scan & Return modes of the
// Scan Assets page; F-010 (SH-3 / SH-15 / SH-16) adds the Issue mode (`issue`, no `mode` param:
// Scan Assets for Training / Administration / Maintenance, wrong-scan "Asset not recognised",
// Bulk Assign "Can't assign", Multiple CW picker). Frames and URL params: see ../scanMode.ts.
//
//   Header Nav      44px round ✕ · centred title (16 Semi Bold) + Connected / Disconnected (12) ·
//                   primary "Confirm Issue Assets" / "Confirm Return Assets"
//   Page header     "Scan Assets for Training" | "Scan & Return Assets" (20 Semi Bold) + Assignment ID
//   Left            Scanned Assets table (search, Filter, bulk bar: Assign Target Base Station · Remove)
//   Right           Assets to Withdraw / Assets to Return / Summary panel
//
// The RFID reader is simulated: Disconnected for 2 s (so the empty state and its
// "Scan at least 1 asset before confirming." error can be seen), then Connected and the
// expected assets arrive one by one. Return reads one asset that is not on the assignment
// (Figma `Scanned Wrong Item`) and pauses until "Got It".
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/alert";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Icon } from "@/components/icon";
import { Toast } from "@/components/toast";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { ScanFlowTable } from "./ScannedAssetsTable";
import { SuccessModal } from "./SuccessModal";
import { BulkAssignAssetsModal } from "../modals/BulkAssignAssetsModal";
import { getLaneOptions } from "../constants";
import { ScanTargetsPanel } from "./AssetsToWithdrawPanel";
import { AssignStationDrawer, EMPTY_SCAN_FILTERS, ScanFilterDrawer, type ScanFilters } from "../modals/ScanDrawers";
import { buildScanContext, setScanFlash } from "../scanMode";
import type { ScanMode, ScannedAsset } from "../types";

const PER_PAGE = 10;
const CONNECT_MS = 2000;
const READ_MS = 400;
// Hidden (autoScanTimer): the original Issue prototype "scans" everything 4 s after load.
const AUTO_SCAN_MS = 4000;

interface ScanFlowViewProps {
  mode: ScanMode;
  onNavigate?: (path: string) => void;
}

export function ScanFlowView({ mode, onNavigate }: ScanFlowViewProps) {
  const ctx = useMemo(() => buildScanContext(mode), [mode]);
  const isReturn = mode === "return";
  const showStation = ctx.kind === "booking";

  const [connected, setConnected] = useState(false);
  const [readIndex, setReadIndex] = useState(0);
  const [scanned, setScanned] = useState<ScannedAsset[]>([]);
  const [wrongItemOpen, setWrongItemOpen] = useState(false);
  const [wrongItemShown, setWrongItemShown] = useState(false);
  const [emptyError, setEmptyError] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ScannedAsset | null>(null);
  const [cantAssign, setCantAssign] = useState<string | null>(null);
  const [courseware, setCourseware] = useState<string>("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ScanFilters>(EMPTY_SCAN_FILTERS);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  // Hidden features (see src/config/hiddenFeatures.ts) — every one is Issue-mode only.
  const lanesOn = HIDDEN_FEATURES.targetLanePerAsset && mode === "issue" && showStation;
  const bulkLanesOn = HIDDEN_FEATURES.bulkAssignLanes && mode === "issue" && showStation;
  const successOn = HIDDEN_FEATURES.successModal && mode === "issue";
  const autoScanOn = HIDDEN_FEATURES.autoScanTimer && mode === "issue";
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const withLane = useCallback(
    (a: ScannedAsset): ScannedAsset =>
      lanesOn && !a.targetLane ? { ...a, targetLane: getLaneOptions(a.targetBaseStation)[0] } : a,
    [lanesOn],
  );

  /* ── simulated RFID reader ── */
  useEffect(() => {
    if (autoScanOn) {
      // 4 s "Disconnected" scanning state, then every expected asset appears at once; Confirm stays disabled meanwhile.
      const t = setTimeout(() => {
        setScanned(renumber(ctx.scanQueue.map(withLane)));
        setReadIndex(ctx.scanQueue.length);
        setConnected(true);
      }, AUTO_SCAN_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setConnected(true), CONNECT_MS);
    return () => clearTimeout(t);
  }, [autoScanOn, ctx, withLane]);

  useEffect(() => {
    if (autoScanOn) return;
    if (!connected || wrongItemOpen || readIndex >= ctx.scanQueue.length) return;
    const t = setTimeout(() => {
      if (ctx.wrongItem && !wrongItemShown && readIndex === Math.min(3, ctx.scanQueue.length - 1)) {
        setWrongItemShown(true);
        setWrongItemOpen(true);
        return;
      }
      const next = ctx.scanQueue[readIndex];
      setScanned((prev) => renumber([...prev, withLane(next)]));
      setReadIndex((i) => i + 1);
      setEmptyError(false);
    }, READ_MS);
    return () => clearTimeout(t);
  }, [connected, wrongItemOpen, wrongItemShown, readIndex, ctx, autoScanOn, withLane]);

  /* ── table view ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scanned
      .filter((a) => !filters.types.length || filters.types.includes(a.assetType))
      .filter((a) => !filters.stations.length || filters.stations.includes(a.targetBaseStation))
      .filter((a) => !q || [a.name, a.assetType].some((v) => v.toLowerCase().includes(q)));
  }, [scanned, filters, query]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const allChecked = paged.length > 0 && paged.every((a) => selectedIds.has(a.id));
  const someChecked = !allChecked && paged.some((a) => selectedIds.has(a.id));
  const onToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (paged.every((a) => prev.has(a.id))) paged.forEach((a) => next.delete(a.id));
      else paged.forEach((a) => next.add(a.id));
      return next;
    });
  }, [paged]);
  const onToggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const removeOne = useCallback((asset: ScannedAsset) => {
    setScanned((prev) => renumber(prev.filter((a) => a.id !== asset.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(asset.id);
      return next;
    });
    setToast(`${asset.name} removed`);
  }, []);
  // Figma `Action - Remove Scanned Asset › Confirmation Delete` (5869:43303).
  const onRemove = useCallback((asset: ScannedAsset) => setRemoveTarget(asset), []);
  const onStationChange = useCallback((id: string, station: string) => {
    setScanned((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, targetBaseStation: station, ...(lanesOn ? { targetLane: getLaneOptions(station)[0] } : {}) } : a,
      ),
    );
  }, [lanesOn]);
  const onLaneChange = useCallback((id: string, lane: string) => {
    setScanned((prev) => prev.map((a) => (a.id === id ? { ...a, targetLane: lane } : a)));
  }, []);
  const bulkAssignLanes = (station: string, lane: string) => {
    setScanned((prev) => prev.map((a) => (selectedIds.has(a.id) ? { ...a, targetBaseStation: station, targetLane: lane } : a)));
    setSelectedIds(new Set());
    setToast(`Target base station and lane assigned to ${selectedIds.size} scanned assets`);
  };

  const removeSelected = () => {
    const n = selectedIds.size;
    setScanned((prev) => renumber(prev.filter((a) => !selectedIds.has(a.id))));
    setSelectedIds(new Set());
    setConfirmRemove(false);
    setToast(`${n} scanned assets removed`);
  };

  const assignSelected = (station: string) => {
    const n = selectedIds.size;
    // Issue (Figma 5869:43329 / 5869:43331): a station cannot take more of a type than it requires.
    if (mode === "issue") {
      const blocked = checkStationCapacity(station);
      if (blocked) {
        setAssignOpen(false);
        setCantAssign(blocked);
        return;
      }
    }
    setScanned((prev) =>
      prev.map((a) =>
        selectedIds.has(a.id) ? { ...a, targetBaseStation: station, ...(lanesOn ? { targetLane: getLaneOptions(station)[0] } : {}) } : a,
      ),
    );
    setSelectedIds(new Set());
    setAssignOpen(false);
    setToast(`Target base station assigned to ${n} scanned assets`);
  };

  const checkStationCapacity = (station: string): string | null => {
    const types = [...new Set(scanned.filter((a) => selectedIds.has(a.id)).map((a) => a.assetType))];
    for (const type of types) {
      const required = ctx.targets.find((t) => t.type === type)?.byStation[station] ?? 0;
      if (required <= 0) continue;
      const incoming = scanned.filter((a) => selectedIds.has(a.id) && a.assetType === type && a.targetBaseStation !== station).length;
      if (incoming === 0) continue;
      const assigned = scanned.filter((a) => !selectedIds.has(a.id) && a.assetType === type && a.targetBaseStation === station).length;
      const remaining = required - assigned;
      if (remaining <= 0) {
        return `${station}'s ${type} requirement is already fully assigned (${assigned}/${required}). Remove an existing assignment before adding more.`;
      }
      if (incoming > remaining) {
        return `${station} requires ${required} ${type}. ${assigned} are already assigned, leaving ${remaining} remaining. Reduce your selection to ${remaining} or fewer and try again.`;
      }
    }
    return null;
  };

  /* ── exit / confirm ── */
  const exit = () => onNavigate?.(ctx.returnTo);
  const finish = () => {
    const message = ctx.complete(scanned);
    const dest = ctx.doneTo ?? ctx.returnTo;
    if (message) setScanFlash(dest, message);
    onNavigate?.(dest);
  };
  const onConfirm = () => {
    if (scanned.length === 0) {
      setEmptyError(true);
      return;
    }
    // Hidden (successModal): "Assignment Created!" modal with "View Assignment" instead of the toast hand-off.
    if (successOn) {
      setSuccessOpen(true);
      return;
    }
    // Return: every outstanding asset back → "Confirm return complete?" (5895:412450). A partial
    // return has no confirmation frame in Figma — it goes straight to the toast (5895:412469).
    if (isReturn && scanned.length >= ctx.scanQueue.length) setConfirmAll(true);
    else finish();
  };

  const typeOptions = useMemo(
    () => [...new Set([...ctx.targets.map((t) => t.type), ...scanned.map((a) => a.assetType)])],
    [ctx.targets, scanned],
  );
  const filterCount = filters.types.length + filters.stations.length;
  const total = ctx.scanQueue.length;

  return (
    <div className="flex-1 flex flex-col bg-main-background overflow-hidden">
      {/* ── Header Nav (Figma `Header Nav - Return Assets`, 60px) ── */}
      <div className="relative flex h-[60px] flex-shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
        <button
          type="button"
          aria-label="Close"
          onClick={exit}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-hovered transition-colors"
        >
          <Icon name="x" size={20} />
        </button>
        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5">
          <p className="text-base font-semibold text-default">{ctx.headerTitle}</p>
          <p className={cn("text-xs", connected ? "text-success" : "text-danger")}>
            {connected ? "Connected" : "Disconnected"}
          </p>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={autoScanOn && !connected}
          className={cn(
            "flex h-10 items-center rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors",
            autoScanOn && !connected && "cursor-not-allowed opacity-50",
          )}
        >
          {ctx.confirmLabel}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          {/* `Scan Assets - Empty Error when Click on Confirm` (5895:412431). */}
          {emptyError && <Alert status="danger" message="Scan at least 1 asset before confirming." />}

          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-default">{ctx.pageTitle}</h1>
            {ctx.pageSubtitle && <p className="text-xs text-body">{ctx.pageSubtitle}</p>}
          </div>

          <div className="flex items-start gap-6">
            <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-invert-default bg-surface">
              <header className="flex h-[76px] items-center justify-between gap-5 px-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-default">
                  Scanned Assets
                  {/* Top Up shows the count beside the title (5895:360312); Return doesn't (5895:412370). */}
                  {!isReturn && <span className="text-body">{scanned.length}</span>}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-body">
                      <Icon name="search" size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 w-60 rounded-lg border border-invert-default bg-surface pl-9 pr-3 text-sm text-default placeholder:text-body focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
                      filterCount > 0
                        ? "border-primary bg-surface text-primary"
                        : "border-invert-default bg-surface text-default hover:bg-default-hovered",
                    )}
                  >
                    <Icon name="list-filter" size={16} />
                    Filter
                    {filterCount > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-default px-1 text-[10px] font-bold text-invert-default">
                        {filterCount}
                      </span>
                    )}
                  </button>
                </div>
              </header>

              <ScanFlowTable
                data={paged}
                mode={mode}
                showStation={showStation}
                stationOptions={ctx.stationOptions}
                selectedIds={selectedIds}
                allChecked={allChecked}
                someChecked={someChecked}
                onToggleAll={onToggleAll}
                onToggleOne={onToggleOne}
                onRemove={onRemove}
                onStationChange={onStationChange}
                onLaneChange={lanesOn ? onLaneChange : undefined}
              />
              <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />
            </section>

            <ScanTargetsPanel
              mode={mode}
              kind={ctx.kind}
              title={ctx.panelTitle}
              targets={ctx.targets}
              scanned={scanned}
              coursewares={ctx.coursewares}
              courseware={courseware}
              onCoursewareChange={setCourseware}
            />
          </div>
        </div>
      </div>

      {/* Figma `Action - Table Bulk Edit › Bulk Select` (5869:43311). */}
      <BulkActionBar
        open={selectedIds.size > 0}
        count={selectedIds.size}
        onDismiss={() => setSelectedIds(new Set())}
        actions={
          <>
            {!isReturn && showStation && !bulkLanesOn && (
              <BulkActionButton tone="primary" onClick={() => setAssignOpen(true)}>
                Assign Target Base Station
              </BulkActionButton>
            )}
            {/* Hidden (bulkAssignLanes): station + lane in one modal, replaces the station-only drawer. */}
            {bulkLanesOn && (
              <BulkActionButton tone="primary" onClick={() => setBulkAssignOpen(true)}>
                Bulk Assign ({selectedIds.size})
              </BulkActionButton>
            )}
            <BulkActionButton tone="danger" onClick={() => setConfirmRemove(true)}>
              <Icon name="trash-2" size={16} />
              Remove
            </BulkActionButton>
          </>
        }
      />

      {bulkLanesOn && (
        <BulkAssignAssetsModal
          open={bulkAssignOpen}
          onClose={() => setBulkAssignOpen(false)}
          count={selectedIds.size}
          onConfirm={bulkAssignLanes}
        />
      )}
      {successOpen && (
        <SuccessModal
          onClose={() => setSuccessOpen(false)}
          onViewAssignment={() => {
            setSuccessOpen(false);
            finish();
          }}
        />
      )}

      <AssignStationDrawer open={assignOpen} options={ctx.stationOptions} onClose={() => setAssignOpen(false)} onConfirm={assignSelected} />
      <ScanFilterDrawer
        open={filterOpen}
        typeOptions={typeOptions}
        stationOptions={showStation ? ctx.stationOptions : []}
        stationLabel={isReturn ? "Source Base Station" : "Target Base Station"}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      {/* `Action - Remove Scanned Asset › Confirmation Delete` (5869:43303). */}
      <ConfirmDialog
        open={removeTarget !== null}
        tone="warning"
        title={`Remove “${removeTarget?.name ?? ""}”?`}
        subtitle={`${removeTarget?.name ?? ""} will be removed from the scanned asset list.`}
        confirmLabel="Remove"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) removeOne(removeTarget);
          setRemoveTarget(null);
        }}
      />

      {/* `Action - Table Bulk Edit › Confirmation` (5869:43322). */}
      <ConfirmDialog
        open={confirmRemove}
        tone="warning"
        title={`Remove ${selectedIds.size} scanned assets?`}
        subtitle="This can't be undone."
        confirmLabel="Remove"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={removeSelected}
      />

      {/* `Scan Assets - Scanned Wrong Item` — Return 5895:412448, Issue 5869:43295 (copy differs). */}
      <ConfirmDialog
        open={wrongItemOpen}
        tone="danger"
        title={isReturn ? "Asset Not Recognised" : "Asset not recognised"}
        subtitle={
          isReturn ? (
            <>
              <b>{ctx.wrongItem}</b> is not part of the weapons issued for <b>{ctx.assignmentLabel}</b>. It has not been added to Scanned Assets.
            </>
          ) : (
            <>
              <b>{ctx.wrongItem}</b> is not part of the weapons required for <b>{ctx.assignmentLabel}</b>. It has not been added to Scanned Assets.
            </>
          )
        }
        hideCancel
        confirmLabel="Got It"
        onCancel={() => setWrongItemOpen(false)}
      >
        <p className="mt-3">Remove it from the RFID reader and scan the correct asset.</p>
      </ConfirmDialog>

      {/* `Bulk Assign - Exceeds Capacity` 5869:43329 / `Fully Assigned` 5869:43331. */}
      <ConfirmDialog
        open={cantAssign !== null}
        tone="danger"
        title="Can't assign"
        subtitle={cantAssign}
        hideCancel
        confirmLabel="Got It"
        onCancel={() => setCantAssign(null)}
      />

      {/* `Confirmation - All Complete` — Booking 5895:412450 / Admin & Maintenance 5895:423109. */}
      <ConfirmDialog
        open={confirmAll}
        tone="success"
        title="Confirm return complete?"
        subtitle={
          <>
            All <b>{total} of {total} assets</b> have been returned. This will mark Assignment{" "}
            <b>{ctx.assignmentLabel}</b> as <b>Returned</b>
            {ctx.kind === "booking" ? " and complete the booking(s)." : "."} This can't be undone.
          </>
        }
        confirmLabel="Confirm Return Assets"
        onCancel={() => setConfirmAll(false)}
        onConfirm={() => {
          setConfirmAll(false);
          finish();
        }}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </div>
  );
}

function renumber(list: ScannedAsset[]): ScannedAsset[] {
  return list.map((a, i) => ({ ...a, no: i + 1 }));
}
