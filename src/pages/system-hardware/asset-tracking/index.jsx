import { useState } from "react";
import { assets } from "@/data/systemHardware";
import { cn } from "@/lib/utils";
import { TABS } from "./constants";
import { RFIDMap } from "./components/RFIDMap";
import { AssetTrackingTable } from "./components/AssetTrackingTable";
export function AssetTracking() {
    const [activeTab, setActiveTab] = useState("RFID Map");
    const [currentPage, setCurrentPage] = useState(1);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">Asset Tracking List</h1>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs — stay raw buttons per rule (tab toggle buttons) */}
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab
                ? "text-brand-primary border-brand-primary"
                : "text-gray-500 border-transparent hover:text-gray-700")}>
                {tab}
              </button>))}
          </div>

          <div className="p-4">
            {activeTab === "RFID Map" ? (<RFIDMap />) : (<AssetTrackingTable data={assets} currentPage={currentPage} onPageChange={setCurrentPage}/>)}
          </div>
        </div>
      </div>
    </div>);
}
