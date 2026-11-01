import { useState } from "react";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "./constants";
import { NotificationSetting } from "./components/NotificationSetting";
import { AutoArchiveSetting } from "./components/AutoArchiveSetting";
import { IPWhitelisting } from "./components/IPWhitelisting";
import { BriefingRoom } from "./components/BriefingRoom";
import { LocationSetting } from "./components/LocationSetting";
import { HUMSInterval } from "./components/HUMSInterval";
import { TransitionRuleForm } from "./components/TransitionRuleForm";
import { SystemVersion } from "./components/SystemVersion";
import { PlaceholderContent } from "./components/PlaceholderContent";
import { PreferenceSetting } from "./components/PreferenceSetting";
import { IndividualBooking } from "./components/IndividualBooking";
import { MaskServiceId } from "./components/MaskServiceId";
const IMPLEMENTED = [
    "Preference",
    "Notification Setting",
    "Auto-Archive Setting",
    "IP Whitelisting",
    "Briefing Room",
    "Location",
    "HUMS Interval",
    "RFID Transition Rules",
    "Armskote Transition Rules",
    "System Version",
];
function renderContent(activeMenu) {
    switch (activeMenu) {
        case "Preference":
            return <PreferenceSetting />;
        case "Notification Setting":
            return <NotificationSetting />;
        case "Auto-Archive Setting":
            return <AutoArchiveSetting />;
        case "IP Whitelisting":
            return <IPWhitelisting />;
        case "Briefing Room":
            return <BriefingRoom />;
        case "Location":
            return <LocationSetting />;
        case "HUMS Interval":
            return <HUMSInterval />;
        case "RFID Transition Rules":
            return <TransitionRuleForm title="RFID Transition Rules" defaultValue="80"/>;
        case "Armskote Transition Rules":
            return <TransitionRuleForm title="Armskote Transition Rules" defaultValue="60"/>;
        case "Individual Booking":
            return <IndividualBooking />;
        case "Mask Service ID":
            return <MaskServiceId />;
        case "System Version":
            return <SystemVersion />;
        default:
            return <PlaceholderContent title={activeMenu}/>;
    }
}
export function Settings() {
    const [activeMenu, setActiveMenu] = useState("Auto-Archive Setting");
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex gap-5 items-start">
          {/* Left nav */}
          <div className="w-56 flex-shrink-0 bg-white rounded-lg border border-gray-200 py-2">
            <p className="px-4 py-2 text-sm font-semibold text-gray-800">Settings</p>
            {MENU_ITEMS.map((item) => (<button key={item} onClick={() => setActiveMenu(item)} className={cn("w-full text-left px-4 py-2.5 text-sm transition-colors", activeMenu === item
                ? "bg-brand-primary text-white font-medium"
                : "text-gray-600 hover:bg-gray-50")}>
                {item}
              </button>))}
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-6 min-h-[480px] overflow-x-auto">
            {renderContent(activeMenu)}
          </div>
        </div>
      </div>
    </div>);
}
// Keep IMPLEMENTED export for potential future audit use
export { IMPLEMENTED };
