import { useState } from "react";
import { cn } from "@/lib/utils";
import { GENERAL_DEFAULTS, MENU_ITEMS } from "./constants";
import type { GeneralSettingsValues, MenuItem, NotificationValues } from "./types";
import { GeneralSettings } from "./components/GeneralSettings";
import { NotificationSetting, NOTIFICATION_DEFAULTS } from "./components/NotificationSetting";
import { IPWhitelisting } from "./components/IPWhitelisting";
import { BriefingRoom } from "./components/BriefingRoom";
import { LocationSetting } from "./components/LocationSetting";
import { SystemVersion } from "./components/SystemVersion";

/**
 * Settings — Figma pages General (7033:691121), Briefing Room (5108:73521),
 * Location (5108:73522), Notification (7033:691122), System Version
 * (5108:73523), IP Whitelisting (5191:191627). Six menu items; General opens
 * first, as in Figma's `General` frame (5029:6257).
 */
export function Settings() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("General");
  // Saved values live here (not in the panels) so a save survives switching menus.
  const [general, setGeneral] = useState<GeneralSettingsValues>(GENERAL_DEFAULTS);
  const [notifications, setNotifications] = useState<NotificationValues>(NOTIFICATION_DEFAULTS);

  function renderContent() {
    switch (activeMenu) {
      case "General":
        return <GeneralSettings saved={general} onSave={setGeneral} />;
      case "Briefing Room":
        return <BriefingRoom />;
      case "Location":
        return <LocationSetting />;
      case "Notification":
        return <NotificationSetting saved={notifications} onSave={setNotifications} />;
      case "System Version":
        return <SystemVersion />;
      case "IP Whitelisting":
        return <IPWhitelisting />;
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-default-default">
      <div className="p-6">
        <div className="flex gap-5 items-start">
          {/* Left nav — Figma `Sidebar-Settings New`: "Settings" 14 Bold, then
              36-tall items (padding 12/8, radius 8, gap 2) inside a 12px inset;
              14 Medium — active `background/primary/invert/default` + `text/primary`,
              inactive `text/caption`.
              NOTE: Figma puts this in the app sidebar itself (240 wide,
              replacing the normal rail). Kept here as an in-content panel
              because the sidebar was explicitly out of scope. */}
          <nav className="w-56 flex-shrink-0 bg-surface-lv1 rounded-lg border border-invert-default p-3">
            <p className="px-3 pb-3 pt-1 text-sm font-bold text-default">Settings</p>
            <div className="flex flex-col gap-0.5">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveMenu(item)}
                  aria-current={activeMenu === item ? "page" : undefined}
                  className={cn(
                    "h-9 w-full rounded-lg px-3 text-left text-sm font-medium transition-colors",
                    activeMenu === item
                      ? "bg-primary-invert-default text-primary"
                      : "text-caption hover:bg-default-hovered",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>

          {/* Right content. Each panel brings its own page header + cards. */}
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
