import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, GraduationCap, Users, MapPin,
  Wrench, Database, ClipboardList,
  ChevronRight, Settings, Cpu, FileBarChart, CalendarDays, Boxes, LogOut, Shield,
} from "lucide-react";
import logoTrx from "@/assets/logotrx.png";

type AppVersion = "beta" | "advance";

const VERSION_KEY = "toms_version";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  bgColor?: string;
  appVersion?: AppVersion;
}

// ── Palette — brand-primary maroon red ───────────────────────────────────────
const BG        = "bg-[#0f4f4b]";
const BORDER    = "border-white/10";
const GRP_LABEL = "text-white/35";
const ITEM_DEF  = "text-white/60 hover:text-white hover:bg-white/10";
const ITEM_ACT  = "bg-white/20 text-white font-semibold shadow-sm";
const ITEM_DEEP = "bg-white/10 text-white font-medium";
const CHV_DEF   = "text-white/30";
const CHV_ACT   = "text-white/70";
const CHILD_DEF = "text-white/50 hover:text-white hover:bg-white/8";
const CHILD_ACT = "bg-white/20 text-white font-medium";
const CHILD_DEEP= "text-white font-medium";
const GRAND_ACT = "bg-white/20 text-white font-medium";
const GRAND_DEF = "text-white/40 hover:text-white hover:bg-white/8";

function buildNavGroups(appVersion: AppVersion): { label: string; items: NavItem[] }[] {
  const bookingChildren: NavItem[] = appVersion === "advance"
    ? [
        { label: "Today's Booking", icon: <></>, path: "/bookings/today" },
        { label: "WPT",             icon: <></>, path: "/bookings/list"  },
        { label: "MST",             icon: <></>, path: "/bookings/mst"   },
        { label: "TCT",             icon: <></>, path: "/bookings/tct"   },
        {
          label: "MST/TCT Master Data",
          icon: <></>,
          path: "/bookings/mst-tct/platform-type",
          children: [
            { label: "Platform Type", icon: <></>, path: "/bookings/mst-tct/platform-type" },
            { label: "Call Sign",     icon: <></>, path: "/bookings/mst-tct/call-sign"     },
            { label: "Role",          icon: <></>, path: "/bookings/mst-tct/role"          },
          ],
        },
      ]
    : [
        { label: "Today's Booking", icon: <></>, path: "/bookings/today" },
        { label: "Booking List",    icon: <></>, path: "/bookings/list"  },
      ];

  const trainingResultsItem: NavItem = appVersion === "advance"
    ? {
        label: "Training Results",
        icon: <GraduationCap size={16} />,
        path: "/training-results",
        children: [
          { label: "WPT", icon: <></>, path: "/training-results"      },
          { label: "MST", icon: <></>, path: "/training-results/mst"  },
          { label: "TCT", icon: <></>, path: "/training-results/tct"  },
        ],
      }
    : { label: "Training Results", icon: <GraduationCap size={16} />, path: "/training-results" };

  return [
    {
      label: "OPERATIONS",
      items: [
        { label: "Dashboard",    icon: <LayoutDashboard size={16} />, path: "/dashboard"   },
        {
          label: "Bookings",
          icon: <CalendarDays size={16} />,
          path: "/bookings/list",
          children: bookingChildren,
        },
        trainingResultsItem,
        { label: "Resource Planning",         icon: <Boxes size={16} />,  path: "/resource-planning"          },
        { label: "Operational Availability",  icon: <Shield size={16} />, path: "/operational-availability-2" },
        {
          label: "System Hardware",
          icon: <Cpu size={16} />,
          path: "/system-hardware",
          children: [
            { label: "SHM Dashboard",   icon: <></>, path: "/system-hardware/dashboard"          },
            { label: "Assets List",     icon: <></>, path: "/system-hardware/assets-list"        },
            { label: "Assignment List", icon: <></>, path: "/system-hardware/assignment-list"    },
            { label: "Asset Type",      icon: <></>, path: "/system-hardware/asset-type"         },
            { label: "Asset Category",  icon: <></>, path: "/system-hardware/asset-category"     },
            { label: "Asset Tracking",  icon: <></>, path: "/system-hardware/asset-tracking"     },
            {
              label: "RFID Configuration",
              icon: <></>,
              path: "/system-hardware/rfid-configuration",
              children: [
                { label: "RFID Reader Listing", icon: <></>, path: "/system-hardware/rfid-configuration/reader-listing"  },
                { label: "Antenna Listing",     icon: <></>, path: "/system-hardware/rfid-configuration/antenna-listing" },
              ],
            },
          ],
        },
        {
          label: "Reports",
          icon: <FileBarChart size={16} />,
          path: "/reports",
          children: [
            { label: "Asset Movement Report",      icon: <></>, path: "/reports/asset-movement" },
            { label: "Stock Take Variance Report", icon: <></>, path: "/reports/stock-take"     },
            { label: "Asset Audit Report",         icon: <></>, path: "/reports/asset-audit"    },
          ],
        },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          label: "User Management",
          icon: <Users size={16} />,
          path: "/user-management",
          children: [
            { label: "User List",       icon: <></>, path: "/user-management/user-list"       },
            { label: "User Role",       icon: <></>, path: "/user-management/user-role"       },
            { label: "User Permission", icon: <></>, path: "/user-management/role-permission" },
            { label: "Rank",            icon: <></>, path: "/user-management/rank"            },
          ],
        },
        { label: "Site Management", icon: <MapPin size={16} />, path: "/site-management" },
        {
          label: "Data",
          icon: <Database size={16} />,
          path: "/data-management",
          children: [
            { label: "Data Export", icon: <></>, path: "/data-management/export" },
            { label: "Data Import", icon: <></>, path: "/data-management/import" },
          ],
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        // Hidden 6 Oct 2026 (menu only — route and page still exist): { label: "System Health",      icon: <Activity size={16} />,      path: "/system-health"     },
        { label: "System Maintenance", icon: <Wrench size={16} />,        path: "/system-maintenance"},
        { label: "Activity Log",       icon: <ClipboardList size={16} />, path: "/activity-log"      },
        { label: "Settings",           icon: <Settings size={16} />,      path: "/settings"          },
      ],
    },
  ];
}

export function SidebarV3({ currentPath, onNavigate, onLogout, bgColor, appVersion: appVersionProp }: SidebarProps) {
  const [appVersionState, setAppVersionState] = useState<AppVersion>(
    () => (localStorage.getItem(VERSION_KEY) as AppVersion) ?? "beta"
  );

  useEffect(() => {
    const h = () => setAppVersionState((localStorage.getItem(VERSION_KEY) as AppVersion) ?? "beta");
    window.addEventListener("toms_version_change", h);
    return () => window.removeEventListener("toms_version_change", h);
  }, []);

  const appVersion = appVersionProp ?? appVersionState;
  const navGroups = buildNavGroups(appVersion);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    navGroups.flatMap((g) => g.items).forEach((item) => {
      if (item.children) {
        state[item.path] =
          currentPath.startsWith(item.path) ||
          item.children.some((c) => currentPath.startsWith(c.path));
      }
    });
    return state;
  });

  const toggle = (path: string) => setExpanded((p) => ({ ...p, [path]: !p[path] }));

  const isActive = (path: string) => currentPath === path;
  const isDeepActive = (item: NavItem): boolean =>
    isActive(item.path) ||
    (item.children?.some((c) => isActive(c.path) || c.children?.some((gc) => isActive(gc.path))) ?? false);

  return (
    <aside className={cn("w-[240px] min-w-[240px] flex flex-col h-full select-none", bgColor ?? BG)}>

      {/* Logo */}
      <div className={cn("px-4 py-3 border-b", BORDER)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img src={logoTrx} alt="TRX Logo" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[11px] font-bold text-white truncate">TOMS</div>
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Training Resource Mgmt</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-2 mb-1.5">
              <span className={cn("text-[9px] font-bold tracking-widest uppercase", GRP_LABEL)}>
                {group.label}
              </span>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const hasChildren = !!(item.children?.length);
                const isExp       = expanded[item.path];
                const deepActive  = isDeepActive(item);
                const selfActive  = isActive(item.path) && !hasChildren;

                return (
                  <div key={item.path}>
                    <button
                      onClick={() => hasChildren ? toggle(item.path) : onNavigate(item.path)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                        selfActive
                          ? ITEM_ACT
                          : deepActive && hasChildren
                          ? ITEM_DEEP
                          : ITEM_DEF
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "transition-colors",
                          selfActive || deepActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                        )}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {hasChildren && (
                        <span className={cn("flex-shrink-0 transition-transform duration-200", isExp && "rotate-90")}>
                          <ChevronRight size={13} className={cn(deepActive ? CHV_ACT : CHV_DEF)} />
                        </span>
                      )}
                    </button>

                    {/* Children */}
                    {hasChildren && isExp && (
                      <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5 py-1">
                        {item.children!.map((child) => {
                          const childHasChildren = !!(child.children?.length);
                          const childExp         = expanded[child.path];
                          const childDeepActive  =
                            isActive(child.path) || child.children?.some((gc) => isActive(gc.path));

                          return (
                            <div key={child.path}>
                              <button
                                onClick={() => childHasChildren ? toggle(child.path) : onNavigate(child.path)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150",
                                  isActive(child.path)
                                    ? CHILD_ACT
                                    : childDeepActive
                                    ? CHILD_DEEP
                                    : CHILD_DEF
                                )}
                              >
                                <span className="truncate">{child.label}</span>
                                {childHasChildren && (
                                  <ChevronRight
                                    size={11}
                                    className={cn("flex-shrink-0 transition-transform text-white/30", childExp && "rotate-90")}
                                  />
                                )}
                              </button>

                              {/* Grandchildren */}
                              {childHasChildren && childExp && (
                                <div className="ml-2 pl-2 border-l border-white/10 space-y-0.5 py-1">
                                  {child.children!.map((gc) => (
                                    <button
                                      key={gc.path}
                                      onClick={() => onNavigate(gc.path)}
                                      className={cn(
                                        "w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-all duration-150 text-left",
                                        isActive(gc.path) ? GRAND_ACT : GRAND_DEF
                                      )}
                                    >
                                      {gc.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t flex-shrink-0", BORDER)}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            OC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Olivia Carter</div>
            <div className="text-[10px] text-white/40 truncate">System Admin</div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="text-white/30 hover:text-white/80 cursor-pointer flex-shrink-0 transition-colors"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>

        <div className={cn("px-4 pb-3 flex items-center gap-2 border-t pt-2", "border-white/10")}>
          <div className="w-4 h-4 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)" />
              <text x="10" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">BS</text>
            </svg>
          </div>
          <span className="text-[10px] text-white/30">
            Powered by <span className="text-white/40">Blue Silo</span>
          </span>
          <span className="ml-auto text-[10px] text-white/20">v0.6.7</span>
        </div>
      </div>
    </aside>
  );
}
