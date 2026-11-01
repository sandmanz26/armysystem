import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";
import { UndoToast } from "./UndoToast";
import { selectPendingCritical, useAccel } from "./store";

/*
 * Accel's own shell — a separate app from TOMS (it opens in a new tab and shares
 * none of TOMS's sidebar or header), drawn in TOMS's tokens rather than the dark
 * theme of the reference screenshots. Nav and top bar are read off those screenshots.
 *
 * Not drawn: the notification bell. `bell` is not in the icon library (the TOMS
 * Header has the same open question), and Rule 2.6 says to ask rather than
 * substitute — so the bell and its "7" badge are left out until that is decided.
 */

export interface AccelNavItem {
  slug: string;
  label: string;
  icon: IconName;
  group: "Monitor" | "Manage" | "System";
  /** Drawn with a chevron in the reference; no children are shown anywhere. */
  expandable?: boolean;
  /** Has a designed page. The rest open an empty page and say so in the menu ("Soon"). */
  ready?: boolean;
}

export const ACCEL_NAV: AccelNavItem[] = [
  { slug: "dashboard", ready: true, label: "Dashboard", icon: "layout-dashboard", group: "Monitor" },
  { slug: "live-monitoring", ready: true, label: "Live Monitoring", icon: "video", group: "Monitor" },
  { slug: "detection-feed", ready: true, label: "Detection Feed", icon: "triangle-alert", group: "Monitor" },
  { slug: "site", label: "Site", icon: "map-pin", group: "Manage", expandable: true },
  { slug: "rules-library", label: "Rules Library", icon: "book-open", group: "Manage" },
  { slug: "incident-cases", label: "Incident Cases", icon: "folder-open", group: "Manage" },
  { slug: "activity-logs", label: "Activity Logs", icon: "scroll-text", group: "System" },
];

const GROUPS = ["Monitor", "Manage", "System"] as const;

export function AccelLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const pendingCritical = useAccel(selectPendingCritical);

  useEffect(() => {
    const prev = document.title;
    document.title = "Accel";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="flex h-screen bg-main-background">
      {!collapsed && (
        <aside className="flex w-[240px] shrink-0 flex-col border-r border-invert-default bg-surface">
          <div className="flex h-[60px] items-center px-5">
            <span className="text-2xl font-bold italic tracking-tight text-primary">Accel</span>
          </div>
          <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
            {GROUPS.map((g) => (
              <div key={g} className="flex flex-col gap-0.5">
                <span className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-body">
                  {g}
                </span>
                {ACCEL_NAV.filter((n) => n.group === g).map((n) => (
                  <NavLink
                    key={n.slug}
                    to={`/accel/${n.slug}`}
                    className={({ isActive }) =>
                      cn(
                        "flex h-10 items-center gap-3 rounded-lg px-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-invert-soft text-primary"
                          : "text-default hover:bg-main-background",
                      )
                    }
                  >
                    <Icon name={n.icon} size={18} />
                    <span className="flex-1">{n.label}</span>
                    {n.slug === "detection-feed" && pendingCritical > 0 && (
                      <span
                        title={`${pendingCritical} critical events waiting`}
                        className="min-w-5 rounded-full bg-[rgb(var(--color-text-danger))] px-1.5 text-center text-[11px] font-semibold leading-5 text-invert-default"
                      >
                        {pendingCritical}
                      </span>
                    )}
                    {!n.ready && <span className="rounded-full bg-main-background px-2 text-[10px] font-semibold uppercase tracking-wide text-body">Soon</span>}
                    {n.expandable && <Icon name="chevron-down" size={16} className="text-body" />}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="flex flex-col items-center gap-0.5 border-t border-invert-default px-5 py-4 text-xs text-body">
            <span>Powered by Sigmawave</span>
            <span>Version 1.01</span>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-default hover:bg-main-background"
          >
            <Icon name={collapsed ? "panel-left" : "panel-left-close"} size={18} />
          </button>
          <div className="flex items-center gap-4">
            {/* Was a decorative pill with a chevron that opened nothing. Now it is the one number an
                operator must not miss, and a shortcut to exactly those events. */}
            <button
              type="button"
              onClick={() => navigate(pendingCritical > 0 ? "/accel/detection-feed?severity=critical&status=pending" : "/accel/dashboard")}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
                pendingCritical > 0
                  ? "border-danger bg-danger-invert-soft text-danger hover:bg-danger-invert-default"
                  : "border-success bg-success-invert-soft text-success",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: pendingCritical > 0 ? "rgb(var(--color-text-danger))" : "rgb(var(--color-text-success))" }} />
              {pendingCritical > 0 ? `${pendingCritical} critical need attention` : "All clear"}
              {pendingCritical > 0 && <Icon name="arrow-right" size={14} />}
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-default text-sm font-semibold text-invert-default">
                DA
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-default">Delbin Arkar</span>
                <span className="text-xs text-body">Owner</span>
              </div>
              <Icon name="chevron-down" size={16} className="text-body" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <UndoToast />
      </div>
    </div>
  );
}
