import { useState } from "react";
import { assets } from "@/data/systemHardware";
import { cn } from "@/lib/utils";
import { TABS } from "./constants";
import { RFIDMap } from "./components/RFIDMap";
import { AssetTrackingTable } from "./components/AssetTrackingTable";
import type { Tab } from "./types";

export function AssetTracking() {
  const [activeTab, setActiveTab] = useState<Tab>("RFID Map");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-semibold text-default">Asset Tracking List</h1>

        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          {/* Tab Group v2 — Figma: 44px tall, 12/16 padding, 14 Medium,
              active `text/primary` with a 2px full-width underline. */}
          <div className="flex border-b border-invert-default">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative h-11 px-4 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "text-primary"
                    : "text-body hover:text-default",
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary-default" />
                )}
              </button>
            ))}
          </div>

          {/* Section Header — names the active tab */}
          <div className="p-5">
            <h2 className="text-base font-semibold text-default">{activeTab}</h2>
          </div>

          <div className="px-5 pb-5">
            {activeTab === "RFID Map" ? (
              <RFIDMap />
            ) : (
              <AssetTrackingTable
                data={assets}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
