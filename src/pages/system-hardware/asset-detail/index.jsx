import { useState } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { assets } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { TABS } from "./types";
import { AssetStatusBadge } from "./components/AssetStatusBadge";
import { RfidStatusPill } from "./components/RfidStatusPill";
import { RfidTable } from "./components/RfidTable";
export function AssetDetail({ assetId, onNavigate }) {
    const [activeTab, setActiveTab] = useState("RFID Information");
    const [activeRfid, setActiveRfid] = useState(1);
    const asset = assets.find((a) => a.id === assetId) || assets[0];
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <button onClick={() => onNavigate?.("/system-hardware")} className="hover:text-gray-600 transition-colors">
            System Hardware Management
          </button>
          <span>/</span>
          <button onClick={() => onNavigate?.("/system-hardware/assets-list")} className="hover:text-gray-600 transition-colors">
            Assets List
          </button>
          <span>/</span>
          <span className="text-brand-primary font-medium">Asset Detail</span>
        </nav>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => onNavigate?.("/system-hardware/assets-list")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={18}/>
              </button>
              <h1 className="text-xl font-bold text-brand-primary">{asset.name}</h1>
              <span className="text-sm text-gray-500 font-mono">({asset.serialNumber})</span>
              <AssetStatusBadge status={asset.status}/>
            </div>
            <p className="text-sm text-gray-400 ml-7">Tag ID: {asset.assetTagId || "—"}</p>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0">
            <MoreVertical size={18}/>
          </button>
        </div>

        {/* Info grid — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Col 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Asset Type</p>
              <p className="text-sm font-semibold text-gray-800">{asset.assetType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Asset Category</p>
              <p className="text-sm font-semibold text-gray-800">{asset.assetCategory}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Asset Serial Number</p>
              <p className="text-sm font-semibold text-gray-800">{asset.serialNumber}</p>
            </div>
          </div>

          {/* Col 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Created Date</p>
              <p className="text-sm font-semibold text-gray-800">{asset.createdDate || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Issuance Cycle</p>
              <p className="text-sm font-semibold text-gray-800">{asset.issuanceCycle ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">RFID Tag 1 Status</p>
              <RfidStatusPill status={asset.rfidTag1Status || "No RFID"}/>
            </div>
          </div>

          {/* Col 3 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">RFID Tag 2 Status</p>
              <RfidStatusPill status={asset.rfidTag2Status || "No RFID"}/>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created By</p>
              <p className="text-sm font-semibold text-gray-800">{asset.createdBy || "Olivia Carter"}</p>
              <p className="text-xs text-gray-400">{asset.createdByRole || "System-Admin"}</p>
            </div>
          </div>
        </div>

        {/* Tab card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-gray-100 px-5">
            {TABS.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn("relative py-3.5 mr-6 text-sm font-medium transition-colors", activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700")}>
                {tab}
                {activeTab === tab && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"/>)}
              </button>))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === "RFID Information" && (<div>
                {/* RFID tag selector + action buttons */}
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2].map((n) => (<button key={n} onClick={() => setActiveRfid(n)} className={cn("px-4 py-2 text-sm font-medium rounded-lg border transition-colors", activeRfid === n
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                      RFID Tag {n}
                    </button>))}
                  <div className="ml-auto flex items-center gap-2">
                    <Button type="button" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
                      Remove Tag
                    </Button>
                    <Button type="button" className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover">
                      Add Tag
                    </Button>
                  </div>
                </div>

                {/* RFID details table */}
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <RfidTable asset={asset} activeRfid={activeRfid}/>
                </div>
              </div>)}

            {activeTab === "Activities" && (<div className="py-12 text-center text-sm text-gray-400">
                No activities recorded for this asset
              </div>)}

            {activeTab === "Disposal List" && (<div className="py-12 text-center text-sm text-gray-400">
                No disposal records for this asset
              </div>)}
          </div>
        </div>

      </div>
    </div>);
}
