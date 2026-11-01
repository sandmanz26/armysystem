import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart2,
  Users,
  MapPin,
  Monitor,
  Wrench,
  Database,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Shield,
  Boxes,
} from "lucide-react";
import logoTrx from "@/assets/logotrx.png";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  {
    label: "Bookings",
    icon: <BookOpen size={18} />,
    path: "/bookings/list",
    children: [
      { label: "Today's Booking", icon: <></>, path: "/bookings/today" },
      { label: "Booking List", icon: <></>, path: "/bookings/list" },
    ],
  },
  { label: "Training Results",         icon: <GraduationCap size={18} />, path: "/training-results"         },
  { label: "Resource Planning",         icon: <Boxes size={18} />,         path: "/resource-planning"         },
  { label: "Operational Availability", icon: <Shield size={18} />,      path: "/operational-availability-2" },
  {
    label: "System Hardware",
    icon: <Monitor size={18} />,
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
    icon: <BarChart2 size={18} />,
    path: "/reports",
    children: [
      { label: "Asset Movement Report",    icon: <></>, path: "/reports/asset-movement" },
      { label: "Stock Take Variance R...", icon: <></>, path: "/reports/stock-take"     },
      { label: "Asset Audit Report",       icon: <></>, path: "/reports/asset-audit"    },
    ],
  },
  {
    label: "User Management",
    icon: <Users size={18} />,
    path: "/user-management",
    children: [
      { label: "User List",       icon: <></>, path: "/user-management/user-list"       },
      { label: "User Role",       icon: <></>, path: "/user-management/user-role"       },
      { label: "User Permission", icon: <></>, path: "/user-management/role-permission" },
      { label: "Rank",            icon: <></>, path: "/user-management/rank"            },
    ],
  },
  { label: "Site Management", icon: <MapPin size={18} />, path: "/site-management" },
  // Hidden 6 Oct 2026 (menu only — route and page still exist): { label: "System Health",   icon: <Activity size={18} />, path: "/system-health"  },
  { label: "System Maintenance", icon: <Wrench size={18} />, path: "/system-maintenance" },
  {
    label: "Data Management",
    icon: <Database size={18} />,
    path: "/data-management",
    children: [
      { label: "Data Export", icon: <></>, path: "/data-management/export" },
      { label: "Data Import", icon: <></>, path: "/data-management/import" },
    ],
  },
  { label: "Activity Log", icon: <ClipboardList size={18} />, path: "/activity-log" },
  { label: "Settings", icon: <Monitor size={18} />, path: "/settings" },
];

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    "/bookings": currentPath.startsWith("/bookings"),
    "/reports": currentPath.startsWith("/reports"),
    "/user-management": currentPath.startsWith("/user-management"),
    "/system-hardware": currentPath.startsWith("/system-hardware"),
    "/system-hardware/rfid-configuration": currentPath.startsWith("/system-hardware/rfid-configuration"),
    "/data-management": currentPath.startsWith("/data-management"),
  }));

  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path: string) => currentPath === path;

  const isDeepActive = (item: NavItem): boolean => {
    if (isActive(item.path)) return true;
    return (
      item.children?.some(
        (c) => isActive(c.path) || c.children?.some((gc) => isActive(gc.path))
      ) ?? false
    );
  };

  return (
    <aside className="w-[248px] min-w-[248px] bg-surface border-r border-invert-default flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-invert-default">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface border border-invert-default">
            <img src={logoTrx} alt="TRX Logo" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-[9px] font-bold text-brand-navy uppercase tracking-wide">
              TRAINING RESOURCE
            </div>
            <div className="text-[9px] font-bold text-brand-navy uppercase tracking-wide">
              MANAGEMENT SYSTEM
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded[item.path];
          const parentActive = isDeepActive(item);

          return (
            <div key={item.path}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.path);
                  } else {
                    onNavigate(item.path);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  parentActive && !hasChildren
                    ? "text-brand-primary font-medium"
                    : hasChildren && isExpanded
                    ? "text-brand-primary font-medium bg-red-50"
                    : "text-gray-600 hover:bg-default-soft"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      parentActive || (hasChildren && isExpanded)
                        ? "text-brand-primary"
                        : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {hasChildren && (
                  <span className="text-gray-400">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>

              {hasChildren && isExpanded && (
                <div className="bg-red-50">
                  {item.children!.map((child) => {
                    const childHasChildren = child.children && child.children.length > 0;
                    const childExpanded = expanded[child.path];
                    const childActive = isActive(child.path) || child.children?.some((gc) => isActive(gc.path));

                    return (
                      <div key={child.path}>
                        <button
                          onClick={() => {
                            if (childHasChildren) {
                              toggleExpand(child.path);
                            } else {
                              onNavigate(child.path);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center justify-between pl-10 pr-4 py-2.5 text-sm transition-colors",
                            isActive(child.path) && !childHasChildren
                              ? "text-white bg-brand-primary font-medium"
                              : childHasChildren && childExpanded
                              ? "text-brand-primary font-medium"
                              : childActive
                              ? "text-white bg-brand-primary font-medium"
                              : "text-gray-600 hover:bg-red-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                isActive(child.path) || childActive ? "bg-white" : "bg-gray-400"
                              )}
                            />
                            <span>{child.label}</span>
                          </div>
                          {childHasChildren && (
                            <span className={cn(isActive(child.path) || childActive ? "text-white" : "text-gray-400")}>
                              {childExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </span>
                          )}
                        </button>

                        {childHasChildren && childExpanded && (
                          <div className="bg-red-100">
                            {child.children!.map((grandchild) => (
                              <button
                                key={grandchild.path}
                                onClick={() => onNavigate(grandchild.path)}
                                className={cn(
                                  "w-full flex items-center gap-3 pl-14 pr-4 py-2 text-sm transition-colors",
                                  isActive(grandchild.path)
                                    ? "text-white bg-brand-primary font-medium"
                                    : "text-gray-600 hover:bg-red-200"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    isActive(grandchild.path) ? "bg-white" : "bg-gray-400"
                                  )}
                                />
                                {grandchild.label}
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
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-invert-default flex items-center gap-2">
        <div className="w-5 h-5">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" className="fill-brand-bluesilo" />
            <text x="10" y="14" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              BS
            </text>
          </svg>
        </div>
        <span className="text-xs text-body">
          Powered by{" "}
          <span className="font-semibold text-brand-bluesilo">Blue Silo</span>
        </span>
        <span className="ml-auto text-xs text-gray-400">ver 0.6.7-0</span>
      </div>
    </aside>
  );
}
