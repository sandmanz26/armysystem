import { useState } from "react";
import { cn } from "@/lib/utils";
import { BOOKING_OPTIONS } from "../constants";
export function NotificationSetting() {
    const [activeTab, setActiveTab] = useState("Booking");
    const [enabled, setEnabled] = useState({
        "New Booking": true,
        "Booking Assignment": true,
        "Cancel Booking": true,
    });
    return (<div>
      <h2 className="text-base font-semibold text-gray-800 mb-4">Notification Setting</h2>
      <div className="flex border-b border-gray-200 mb-6">
        {["Booking", "Asset", "Training", "User"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab
                ? "text-brand-primary border-brand-primary"
                : "text-gray-400 border-transparent hover:text-gray-600")}>
            {tab}
          </button>))}
      </div>
      {activeTab === "Booking" ? (<div className="space-y-5">
          {BOOKING_OPTIONS.map((option) => (<div key={option}>
              <p className="text-sm font-medium text-gray-700 mb-2">{option}</p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name={option} checked={enabled[option] === true} onChange={() => setEnabled((p) => ({ ...p, [option]: true }))} className="accent-brand-primary"/>
                  Enable
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name={option} checked={enabled[option] === false} onChange={() => setEnabled((p) => ({ ...p, [option]: false }))} className="accent-brand-primary"/>
                  Disable
                </label>
              </div>
            </div>))}
        </div>) : (<div className="py-12 text-center text-gray-400 text-sm">{activeTab} notification settings — coming soon</div>)}
    </div>);
}
