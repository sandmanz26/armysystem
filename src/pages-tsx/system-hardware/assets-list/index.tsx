import { useState } from "react";
import { assets } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { AddRfidTagFlow } from "@/components/rfid-tag-setup";
import { AssetsToolbar } from "./components/AssetsToolbar";
import { AssetsTable } from "./components/AssetsTable";
import { FilterDrawer, EMPTY_ASSET_FILTERS, countAssetFilters } from "./components/FilterDrawer";
import { AddAssetDrawer } from "./modals/AddAssetDrawer";
import type { AssetFilters } from "./components/FilterDrawer";
import { EditAssetDrawer } from "./modals/EditAssetDrawer";
import { TAB_STATUS_MAP, type Tab } from "./types";
import { NEW_ASSET_STATUS } from "./assetForm.constants";
import type { Asset, AssetStatus } from "@/data/systemHardware";

/*
 * Figma Notes (4 Sep 2026) on `Move to Archive - Blocked` (5937:33503):
 * archiving is blocked while the asset is in an active issuance cycle —
 * Issued, Pending Return, Maintenance, Missing, Not Returned — and allowed
 * only for Available and No RFID assets.
 */
const ARCHIVE_BLOCKED_STATUSES: AssetStatus[] = [
  "Issued",
  "Pending Return",
  "Maintenance",
  "Missing",
  "Not Returned",
];

export function AssetsList({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [assetList, setAssetList] = useState<Asset[]>(assets);
  /* Figma's `Archived` tab and its `List - Archived` section (5943:14705…)
     mean archiving MOVES an asset, it does not delete it. Archiving used to
     drop the row from state entirely, so the tab could never have shown one. */
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("Overall");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Asset | null>(null);
  const [archiveBlocked, setArchiveBlocked] = useState<Asset | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Asset | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  /* Figma `Action - Add Asset` is a DRAWER (5133:51392), not the separate page
     this button used to navigate to. */
  const [showAddAsset, setShowAddAsset] = useState(false);
  /* Figma `Action - Add Asset` › `Modal - Connect RFID` (8002:46853): after Create Asset the new asset
     is offered an RFID tag (→ `Action - Add RFID Tag`). Holds the asset that was just created. */
  const [tagFlow, setTagFlow] = useState<{ id: string; name: string } | null>(null);
  const [assetFilters, setAssetFilters] = useState<AssetFilters>(EMPTY_ASSET_FILTERS);

  const activeFilterCount = countAssetFilters(assetFilters);

  /** "25 May 2026\n03:45 PM" / "—" → "2026-05-25", or null when there is no date. */
  const toISO = (value?: string) => {
    if (!value) return null;
    const first = value.split("\n")[0].trim();
    if (!first || first === "\u2014" || first === "-") return null;
    const d = new Date(first);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  /** An asset with neither RFID tag connected — Figma's `No RFID` tab. */
  const hasNoRfid = (a: Asset) =>
    (a.rfidTag1Status ?? "No RFID") === "No RFID" && (a.rfidTag2Status ?? "No RFID") === "No RFID";

  /** Available or No RFID only; every in-cycle status is blocked. */
  const canArchive = (a: Asset) =>
    !ARCHIVE_BLOCKED_STATUSES.includes(a.status) && (a.status === "Available" || hasNoRfid(a));

  const active = assetList.filter((a) => !archivedIds.has(a.id));

  const tabFiltered =
    activeTab === "Archived"
      ? assetList.filter((a) => archivedIds.has(a.id))
      : activeTab === "Overall"
        ? active
        : activeTab === "No RFID"
          ? active.filter(hasNoRfid)
          : active.filter((a) => a.status === TAB_STATUS_MAP[activeTab]);

  const filtered = tabFiltered.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = assetFilters.types.length === 0 || assetFilters.types.includes(a.assetType);
    const matchesCategory = assetFilters.categories.length === 0 || assetFilters.categories.includes(a.assetCategory);

    /*
     * Figma's filter drawer opens with a Date range, so it has to actually
     * filter. The column it reads is the one the table is showing: Archived
     * Date on the Archived tab, Issued Date everywhere else. Rows with no date
     * ("—") drop out once a range is set, which is what a date filter means.
     */
    const stamp = activeTab === "Archived" ? a.archivedDate : a.issuedDate;
    const asISO = toISO(stamp);
    const matchesFrom = !assetFilters.from || (!!asISO && asISO >= assetFilters.from);
    const matchesTo = !assetFilters.to || (!!asISO && asISO <= assetFilters.to);

    return matchesSearch && matchesType && matchesCategory && matchesFrom && matchesTo;
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto bg-default-soft">
      {editingAsset && (
        <EditAssetDrawer
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={(values) => {
            setAssetList((prev) =>
              prev.map((a) =>
                a.id === editingAsset.id
                  ? {
                      ...a,
                      name: values.name,
                      serialNumber: values.serialNumber,
                      assetCategory: values.assetCategory,
                      assetType: values.assetType,
                    }
                  : a,
              ),
            );
            // Figma `Action - Edit Asset` → `Toast - Success` (5133:51533).
            setToast(`${values.name} updated`);
          }}
        />
      )}

      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-5 gap-3">
          {/* Figma: 20 Semi Bold `color/text/default`. It was `text-primary` —
              that red belongs to the BREADCRUMB above (12px), not the page title. */}
          <h1 className="text-xl font-semibold text-default">Asset List</h1>
          <Button
            onClick={() => setShowAddAsset(true)}
            className="flex items-center w-fit gap-1.5 px-4 py-2 text-sm bg-primary-default text-invert-default rounded-lg hover:bg-primary-default/90 font-semibold shadow-sm transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add Asset
          </Button>
        </div>

        <div className="bg-surface rounded-lg border border-invert-default">
          <AssetsToolbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onOpenFilters={() => setShowFilters(true)}
            activeFilterCount={activeFilterCount}
            allAssets={assetList.filter((a) => !archivedIds.has(a.id))}
            archivedCount={archivedIds.size}
          />

          <AssetsTable
            data={filtered}
            archived={activeTab === "Archived"}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onEdit={(asset) => setEditingAsset(asset)}
            onArchive={(asset) => (canArchive(asset) ? setArchiveTarget(asset) : setArchiveBlocked(asset))}
            onRestore={(asset) => setRestoreTarget(asset)}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <AddAssetDrawer
        open={showAddAsset}
        existingNames={assetList.map((a) => a.name)}
        onClose={() => setShowAddAsset(false)}
        onCreate={(values) => {
          const newId = `asset-${Date.now()}`;
          setAssetList((prev) => [
            {
              id: newId,
              no: prev.length + 1,
              name: values.assetName,
              serialNumber: values.serialNumber,
              assetType: values.assetType,
              assetCategory: values.assetCategory,
              status: NEW_ASSET_STATUS,
              issuedDate: "\u2014",
              remarks: values.remarks || undefined,
            } as Asset,
            ...prev,
          ]);
          setShowAddAsset(false);
          // The toast waits for the RFID prompt: Not Now → "{Asset Name} added" (5133:51498),
          // Tag 1 → "{Asset Name} added with RFID Tag 1" (8002:43627), Tag 2 → "2 RFID tags added to {Asset Name}" (8028:64582).
          setTagFlow({ id: newId, name: values.assetName });
        }}
      />

      {tagFlow && (
        <AddRfidTagFlow
          assetName={tagFlow.name}
          onTagConnected={(tagNo, rfidTagId) =>
            setAssetList((prev) =>
              prev.map((a) =>
                a.id === tagFlow.id
                  ? tagNo === 1
                    ? { ...a, rfidTag1Id: rfidTagId, rfidTag1Status: "Connected" }
                    : { ...a, rfidTag2Id: rfidTagId, rfidTag2Status: "Connected" }
                  : a,
              ),
            )
          }
          onFinish={(tagsAdded) => {
            setToast(
              tagsAdded === 0
                ? `${tagFlow.name} added`
                : tagsAdded === 1
                  ? `${tagFlow.name} added with RFID Tag 1`
                  : `2 RFID tags added to ${tagFlow.name}`,
            );
            setTagFlow(null);
          }}
        />
      )}

      <FilterDrawer
        isOpen={showFilters}
        filters={assetFilters}
        onApply={(f) => { setAssetFilters(f); setCurrentPage(1); }}
        onClose={() => setShowFilters(false)}
      />

      {archiveTarget && (
        <DeleteConfirmDialog
          // Figma `Action - Move to Archive` (5336:274362) — exact copy.
          title={`Archive “${archiveTarget.name}”?`}
          confirmLabel="Move to Archive"
          message="This will be moved to the archive and removed from active lists. You can restore it at any time."
          onCancel={() => setArchiveTarget(null)}
          onConfirm={() => {
            setArchivedIds((prev) => new Set(prev).add(archiveTarget.id));
            /*
             * Stamp the moment it was archived, so the Archived tab's
             * Archived Date column has something to show and the drawer's
             * date range has something to match.
             */
            const now = new Date();
            const stamp =
              now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
              "\n" +
              now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            setAssetList((prev) =>
              prev.map((a) => (a.id === archiveTarget.id ? { ...a, archivedDate: stamp } : a)),
            );
            setToast(`${archiveTarget.name} moved to archived`);
            setArchiveTarget(null);
          }}
        />
      )}

      {/* Figma `Move to Archive - Blocked` (5937:33503) — red octagon-alert,
          a single "Got It" button, exact copy. */}
      <ConfirmDialog
        open={archiveBlocked !== null}
        tone="danger"
        title={`Can’t archive “${archiveBlocked?.name ?? ""}”`}
        subtitle="This asset is part of an active issuance cycle and hasn't been returned. Complete the return before archiving."
        confirmLabel="Got It"
        hideCancel
        onCancel={() => setArchiveBlocked(null)}
      />

      {restoreTarget && (
        <DeleteConfirmDialog
          // Figma `Action - Restore from Archive` (5943:21143) — exact copy.
          title={`Restore “${restoreTarget.name}”?`}
          confirmLabel="Restore"
          message="This asset will be moved back to the Asset List with status Available."
          onCancel={() => setRestoreTarget(null)}
          onConfirm={() => {
            setArchivedIds((prev) => {
              const next = new Set(prev);
              next.delete(restoreTarget.id);
              return next;
            });
            setAssetList((prev) =>
              prev.map((a) =>
                a.id === restoreTarget.id ? { ...a, status: "Available", archivedDate: undefined } : a,
              ),
            );
            setToast(`${restoreTarget.name} restored`);
            setRestoreTarget(null);
          }}
        />
      )}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </div>
  );
}
