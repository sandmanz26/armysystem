import { useState } from "react";
import { ArrowLeft, Archive, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { assets } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { AddRfidTagFlow } from "@/components/rfid-tag-setup";
import { TABS } from "./types";
import type { Tab, AssetDetailProps } from "./types";
import { AssetStatusBadge } from "./components/AssetStatusBadge";
import { RfidStatusPill } from "./components/RfidStatusPill";
import { RfidTable } from "./components/RfidTable";
import { ActivitiesTable } from "./components/ActivitiesTable";
import { DisposalListTable } from "./components/DisposalListTable";

/** Figma `Key Value`: label in color/text/body 12 over the value in
 *  color/text/default Semi Bold 14. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs font-normal leading-4 text-body">{label}</span>
      <div className="text-sm font-semibold leading-5 text-default">{children}</div>
    </div>
  );
}

export function AssetDetail({ assetId, onNavigate, onEdit, onArchive }: AssetDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("RFID Details");
  const [activeRfid, setActiveRfid] = useState<1 | 2>(1);
  const [asset, setAsset] = useState(() => assets.find((a) => a.id === assetId) || assets[0]);
  /** Tag slot the RFID Set Up page is filling; null = flow closed. */
  const [addTagSlot, setAddTagSlot] = useState<1 | 2 | null>(null);
  /** Figma `Action - Remove Tag` › `Remove Tag` (5149:50101): confirm before the tag is removed. */
  const [removeTarget, setRemoveTarget] = useState<1 | 2 | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const hasTag = (n: 1 | 2) => {
    const id = n === 1 ? asset.rfidTag1Id : asset.rfidTag2Id;
    return !!id && id !== "—";
  };
  /** Figma `RFID Details - 2 Tags` (8028:96470): `Add Tag` is disabled once both tags are connected. */
  const bothTagsConnected = hasTag(1) && hasTag(2);
  /** Add Tag fills the selected slot, or the other one when the selected slot already holds a tag. */
  const slotToAdd = (): 1 | 2 => (!hasTag(activeRfid) ? activeRfid : activeRfid === 1 ? 2 : 1);

  const removeTag = (n: 1 | 2) => {
    setAsset((prev) =>
      n === 1
        ? { ...prev, rfidTag1Id: "—", rfidTag1Status: "No RFID" }
        : { ...prev, rfidTag2Id: "—", rfidTag2Status: "No RFID" }
    );
  };

  const handleConnectTag = (n: 1 | 2, rfidTagId: string) => {
    setAsset((prev) =>
      n === 1
        ? { ...prev, rfidTag1Id: rfidTagId, rfidTag1Status: "Connected" }
        : { ...prev, rfidTag2Id: rfidTagId, rfidTag2Status: "Connected" }
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-default-soft">
      <div className="p-6 space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-disabled">
          <button
            onClick={() => onNavigate?.("/system-hardware")}
            className="hover:text-caption transition-colors"
          >
            System Hardware Management
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate?.("/system-hardware/assets-list")}
            className="hover:text-caption transition-colors"
          >
            Assets List
          </button>
          <span>/</span>
          <span className="text-primary font-medium">Asset Detail</span>
        </nav>

        {/* Figma `Page Header` (5149:50144): title + status badge, then a dark
            `SN #…` badge and the tag id; actions are `Move to Archive`
            (secondary 168) and `Edit Asset` (primary 127). The header used to
            carry a lone kebab button that did nothing, and showed the serial
            as plain mono text in brackets. */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => onNavigate?.("/system-hardware/assets-list")}
                className="text-disabled hover:text-primary transition-colors"
                aria-label="Back to Asset List"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-semibold text-default">{asset.name}</h1>
              <AssetStatusBadge status={asset.status} />
            </div>
            <div className="flex items-center gap-4 flex-wrap ml-7">
              {/* Figma `Badge`: background/default/invert/default on border/base. */}
              <span className="inline-flex items-center rounded border border-base bg-default-invert-default px-2 py-0.5 text-sm font-medium text-invert-default">
                SN #{asset.serialNumber}
              </span>
              <span className="text-xs text-body">Tag ID: {asset.assetTagId || "\u2014"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onArchive?.(asset)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
            >
              <Archive size={18} />
              Move to Archive
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(asset)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary-default text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
            >
              <Pencil size={18} />
              Edit Asset
            </button>
          </div>
        </div>

        {/* Figma splits this 715 / 357 into `Asset Details` and `RFID Status`;
            the code had three equal columns with the fields spread across them. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
          <section className="rounded-xl bg-surface-lv1 border border-invert-default">
            <header className="px-5 h-16 flex items-center">
              <h2 className="text-base font-semibold text-default">Asset Details</h2>
            </header>
            <div className="px-5 pb-5 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Asset Type">{asset.assetType}</Field>
              <Field label="Asset Category">{asset.assetCategory}</Field>
              <Field label="Site / Location">{asset.rfidLocation || "\u2014"}</Field>
              <Field label="Number of Layers">{asset.issuanceCycle ?? 0}</Field>
              <Field label="Created By">
                <span className="block">{asset.createdBy || "\u2014"}</span>
                <span className="block text-xs font-normal text-body">{asset.createdByRole || "\u2014"}</span>
              </Field>
              <Field label="Created Date">{asset.createdDate || "\u2014"}</Field>
              <Field label="Issuance Cycle">{asset.issuanceCycle ?? 0}</Field>
              <Field label="Remarks">
                <span className="font-normal">{asset.remarks || "\u2014"}</span>
              </Field>
            </div>
          </section>

          <section className="rounded-xl bg-surface-lv1 border border-invert-default">
            <header className="px-5 h-16 flex items-center">
              <h2 className="text-base font-semibold text-default">RFID Status</h2>
            </header>
            <div className="px-5 pb-5 flex flex-col gap-5">
              <Field label="RFID Tag 1 Status">
                <RfidStatusPill status={asset.rfidTag1Status || "No RFID"} />
              </Field>
              <Field label="RFID Tag 2 Status">
                <RfidStatusPill status={asset.rfidTag2Status || "No RFID"} />
              </Field>
            </div>
          </section>
        </div>

        {/* Tab card */}
        <div className="bg-surface rounded-lg border border-invert-default overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-invert-default px-5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative py-3.5 mr-6 text-sm font-medium transition-colors",
                  activeTab === tab ? "text-primary" : "text-body hover:text-default"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-default rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === "RFID Details" && (
              <div>
                {/* RFID tag selector + action buttons */}
                <div className="flex items-center gap-2 mb-5">
                  {([1, 2] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setActiveRfid(n)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                        activeRfid === n
                          ? "bg-primary-default text-invert-default border-primary"
                          : "border-invert-default text-caption hover:bg-default-soft"
                      )}
                    >
                      RFID Tag {n}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setRemoveTarget(activeRfid)}
                      className="w-auto flex-shrink-0 whitespace-nowrap px-4 py-2 border border-invert-default rounded-lg text-sm font-medium text-caption hover:bg-default-soft bg-surface"
                    >
                      Remove Tag
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAddTagSlot(slotToAdd())}
                      disabled={bothTagsConnected}
                      className="w-auto flex-shrink-0 whitespace-nowrap px-4 py-2 bg-primary-default text-invert-default rounded-lg text-sm font-semibold hover:bg-primary-hovered disabled:bg-disabled disabled:text-disabled"
                    >
                      Add Tag
                    </Button>
                  </div>
                </div>

                {/* RFID details table */}
                <div className="overflow-x-auto rounded-lg border border-invert-default">
                  <RfidTable asset={asset} activeRfid={activeRfid} />
                </div>
              </div>
            )}

            {activeTab === "Activities" && (
              <ActivitiesTable data={[]} />
            )}

            {activeTab === "Disposal List" && (
              <DisposalListTable data={[]} />
            )}
          </div>
        </div>

      </div>

      {/* Figma `Action - Add Tag` (8004:26876 → Add RFID Tag section → toast 5151:55928). */}
      {addTagSlot !== null && (
        <AddRfidTagFlow
          assetName={asset.name}
          startWith="setup"
          tag={addTagSlot}
          offerSecondTag={false}
          onTagConnected={handleConnectTag}
          onFinish={(tagsAdded) => {
            if (tagsAdded > 0) setToast(`RFID tag added to ${asset.name}`);
            setAddTagSlot(null);
          }}
        />
      )}

      {/* Figma `Remove Tag` (5149:50101): warning Modal Confirmation, exact copy. */}
      <ConfirmDialog
        open={removeTarget !== null}
        tone="warning"
        title={`Remove \u201CRFID Tag ${removeTarget ?? ""}\u201D?`}
        subtitle={`RFID Tag ${removeTarget ?? ""} will be removed from ${asset.name}. Status will be set to No RFID.`}
        cancelLabel="Cancel"
        confirmLabel="Remove"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget !== null) removeTag(removeTarget);
          setRemoveTarget(null);
          // `Toast - Success` (5149:50060).
          setToast(`RFID tag removed from ${asset.name}`);
        }}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </div>
  );
}
