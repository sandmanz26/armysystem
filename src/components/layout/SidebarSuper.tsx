import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useActiveProgramStore } from "@/store/useActiveProgramStore";
import {
  LayoutDashboard, GraduationCap, Users, MapPin,
  Wrench, Database, ClipboardList,
  ChevronRight, Shield, Settings, Cpu, FileBarChart, CalendarDays, Boxes, LogOut,
  Clock3, HardDrive, DoorOpen,
  Zap,
} from "lucide-react";
import logoTrx from "@/assets/logotrx.png";

type AppVersion = "beta" | "advance";
type NavVer = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

interface SidebarSuperProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  appVersion?: AppVersion;
  navVersion?: NavVer;
}

// Rail is always a shade darker than the panel so the two-column hierarchy reads clearly.
const COLOR_MAP: Record<NavVer, { rail: string; panel: string; isLight?: boolean }> = {
  v1: { rail: "#2B2D30", panel: "#3C3F41" },
  v2: { rail: "#0F0F1A", panel: "#1C1C2E" },
  v3: { rail: "#04201f", panel: "#0f4f4b" },
  v4: { rail: "#0C1F3D", panel: "#1A3A6B" },
  v5: { rail: "#0D2115", panel: "#1E4A2E" },
  v6: { rail: "#1E2A38", panel: "#334155" },
  v7: { rail: "#070D18", panel: "#0F172A" },
  v8: { rail: "#FFFFFF", panel: "#FFFFFF", isLight: true },
};

type ProgramId = "WPT" | "MST" | "TCT" | "THANOS" | "MST_TCT" | "INTEGRATED";

interface ProgramDef {
  id: ProgramId;
  label: string;
  badge: string;
  color: string;
  bookingsPath?: string;
  resultsPath?: string;
}

// Each program owns its own booking + training-results data. As new
// programmes come online, add them here — the rail and nav panel pick
// them up automatically. `bookingsPath`/`resultsPath` are omitted for
// programmes whose booking flow hasn't been built yet — selecting them
// shows a "coming soon" placeholder instead of navigating.
const PROGRAMS: ProgramDef[] = [
  { id: "WPT",        label: "Weapon Proficiency Trainer",          badge: "WPT", color: "bg-brand-primary",  bookingsPath: "/bookings/list", resultsPath: "/training-results"     },
  { id: "MST",        label: "Company Mission Simulation Trainer",    badge: "MST", color: "bg-sky-600",        bookingsPath: "/bookings/mst",  resultsPath: "/training-results/mst" },
  { id: "TCT",        label: "Team Command Trainer",                badge: "TCT", color: "bg-emerald-600"    },
  { id: "THANOS",     label: "Thanos",                              badge: "TH",  color: "bg-purple-600"      },
  { id: "MST_TCT",    label: "MST / TCT Combined",                  badge: "C/C", color: "bg-amber-600"       },
  { id: "INTEGRATED", label: "Integrated Programme",                badge: "INT", color: "bg-slate-500"       },
];

// Shared utilities — NOT programme-specific. Appear in the rail MENU section.
// These are cross-site tools accessible regardless of which programme is selected.
type UtilityId = "user-management" | "system-hardware-mgmt" | "briefing-room" | "activity-log" | "system-maintenance" | "settings";

interface UtilityDef {
  id: UtilityId;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

const UTILITIES: UtilityDef[] = [
  {
    id: "user-management",
    label: "User Management",
    icon: <Users size={17} />,
    path: "/user-management",
    children: [
      { label: "User List",       icon: <></>, path: "/user-management/user-list"       },
      { label: "User Role",       icon: <></>, path: "/user-management/user-role"       },
      { label: "User Permission", icon: <></>, path: "/user-management/role-permission" },
      { label: "Rank",            icon: <></>, path: "/user-management/rank"            },
    ],
  },
  {
    id: "system-hardware-mgmt",
    label: "System Hardware Management",
    icon: <Cpu size={17} />,
    path: "/system-hardware-management",
    children: [
      { label: "Asset Type",     icon: <></>, path: "/system-hardware-management/asset-type"     },
      { label: "Asset Category", icon: <></>, path: "/system-hardware-management/asset-category" },
      { label: "Asset Tracking", icon: <></>, path: "/system-hardware-management/asset-tracking" },
    ],
  },
  {
    id: "briefing-room",
    label: "Briefing Room",
    icon: <DoorOpen size={17} />,
    path: "/briefing-room",
  },
  {
    id: "activity-log",
    label: "Activity Log",
    icon: <ClipboardList size={17} />,
    path: "/activity-log",
  },
  {
    id: "system-maintenance",
    label: "System Maintenance",
    icon: <Wrench size={17} />,
    path: "/system-maintenance",
    children: [
      { label: "Data Archiving", icon: <></>, path: "/system-maintenance/data-archiving" },
      { label: "Logs",           icon: <></>, path: "/system-maintenance/logs"           },
    ],
  },
  { id: "settings", label: "Settings", icon: <Settings size={17} />, path: "/settings" },
];

// Rail icons are compact and easy to misread — every one gets a small
// tooltip on hover so the user always knows what they're pointing at.
function RailTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex-shrink-0">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0a12] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
      </span>
    </div>
  );
}

type ActiveSection = { type: "program"; id: ProgramId } | { type: "utility"; id: UtilityId };

function detectSection(currentPath: string): ActiveSection {
  // Check utilities first — their paths are distinct from programme paths
  const utility = UTILITIES.find((u) =>
    u.children
      ? u.children.some((c) => currentPath.startsWith(c.path)) || currentPath === u.path
      : currentPath.startsWith(u.path)
  );
  if (utility) return { type: "utility", id: utility.id };
  if (currentPath.startsWith("/bookings/mst") || currentPath.startsWith("/training-results/mst")) return { type: "program", id: "MST" };
  if (currentPath.startsWith("/bookings/tct") || currentPath.startsWith("/training-results/tct")) return { type: "program", id: "TCT" };
  // Cluster/Cabin Management are MST/TCT-only — default to MST on direct load
  if (currentPath.startsWith("/site-management/clusters") || currentPath.startsWith("/site-management/cabins")) return { type: "program", id: "MST" };
  return { type: "program", id: "WPT" };
}

function buildProgramNavGroup(program: ProgramDef): { label: string; items: NavItem[] }[] {
  if (!program.bookingsPath || !program.resultsPath) {
    return [
      {
        label: `${program.badge} OPERATIONS`,
        items: [{ label: "Coming Soon", icon: <Clock3 size={16} />, path: "#" }],
      },
    ];
  }

  return [
    {
      label: "OPERATIONS",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/dashboard" },
        {
          label: "Bookings",
          icon: <CalendarDays size={16} />,
          path: program.bookingsPath,
          children: [
            { label: "Today's Booking", icon: <></>, path: "/bookings/today"    },
            { label: "Booking List",    icon: <></>, path: program.bookingsPath },
            // WPT-only entry into the Create Booking wizard (same route as the
            // "+ Create Booking" button on Booking List). MST/TCT keep their own.
            ...(program.id === "WPT"
              ? [{ label: "Create New Booking", icon: <></>, path: "/bookings/create" }]
              : []),
          ],
        },
        // Booking 2.0 — WPT-only, isolated build still in discussion; see
        // src/pages-tsx/booking-2. Mirrors the "Bookings" entry above 1:1
        // (same Today's Booking / Booking List submenu shape).
        ...(program.id === "WPT"
          ? [{
              label: "Booking 2.0",
              icon: <CalendarDays size={16} />,
              path: "/bookings-2/list",
              children: [
                { label: "Today's Booking", icon: <></>, path: "/bookings-2/today" },
                { label: "Booking List",    icon: <></>, path: "/bookings-2/list"  },
              ],
            }]
          : []),
        ...(program.id === "WPT"
          ? [
              { label: "Training Results 2.0", icon: <GraduationCap size={16} />, path: "/training-results-2" },
              { label: "Resource Planning", icon: <Boxes size={16} />, path: "/resource-planning" },
            ]
          : [{ label: "Training Results", icon: <GraduationCap size={16} />, path: program.resultsPath }]),
        { label: "Operational Availability", icon: <Shield size={16} />, path: "/operational-availability-2" },
        // MST and TCT only have one report, so it's a direct link instead of a
        // "Reports" parent with an All Reports/Asset Audit Report submenu.
        (program.id === "MST" || program.id === "TCT"
          ? { label: "Asset Report", icon: <FileBarChart size={16} />, path: "/reports/asset-audit" }
          : {
              label: "Reports",
              icon: <FileBarChart size={16} />,
              path: "/reports",
              children: [
                { label: "All Reports",        icon: <></>, path: "/reports"              },
                { label: "Asset Audit Report", icon: <></>, path: "/reports/asset-audit" },
              ],
            }),
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        // MST and TCT each only manage one station type, so their Site Management
        // entry is replaced with a direct link to that type instead of a parent
        // with a Cluster/Cabin Management submenu.
        (program.id === "MST"
          ? { label: "Cabin Management",   icon: <MapPin size={16} />, path: "/site-management/cabins"   }
          : program.id === "TCT"
          ? { label: "Zone Management", icon: <MapPin size={16} />, path: "/site-management/clusters" }
          : { label: "Site Management",    icon: <MapPin size={16} />, path: "/site-management" }),
        {
          label: "Data Management",
          icon: <Database size={16} />,
          path: "/data-management",
          children: [
            { label: "Data Export", icon: <></>, path: "/data-management/export" },
            { label: "Data Import", icon: <></>, path: "/data-management/import" },
          ],
        },
        // MST/TCT Master Data (Platform Type / Call Sign / Role) is scoped to the
        // MST and TCT programmes only — mirrors the Cluster/Cabin Management gating above.
        ...(program.id === "MST" || program.id === "TCT"
          ? [{
              label: "MST/TCT Master Data",
              icon: <Database size={16} />,
              path: "/bookings/mst-tct/platform-type",
              children: [
                { label: "Platform Type", icon: <></>, path: "/bookings/mst-tct/platform-type" },
                { label: "Call Sign",     icon: <></>, path: "/bookings/mst-tct/call-sign"     },
                { label: "Role",          icon: <></>, path: "/bookings/mst-tct/role"          },
                { label: "Vehicle",       icon: <></>, path: "/bookings/mst-tct/vehicle"       },
              ],
            }]
          : []),
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          label: "System Hardware",
          icon: <HardDrive size={16} />,
          path: "/system-hardware",
          children: [
            { label: "SHM Dashboard",    icon: <></>, path: "/system-hardware/dashboard"   },
            // MST doesn't manage discrete asset units the way WPT/TCT do, so these
            // asset-level views are hidden for that programme.
            ...(program.id !== "MST"
              ? [
                  { label: "Assets List",     icon: <></>, path: "/system-hardware/assets-list" },
                  // Neither MST nor TCT bookings issue physical assets (no Issue Assets flow),
                  // so Assignment List — which tracks asset issue/return — is WPT-only.
                  ...(program.id !== "TCT"
                    ? [{ label: "Assignment List", icon: <></>, path: "/system-hardware/assignment-list" }]
                    : []),
                  { label: "Asset Type",      icon: <></>, path: "/system-hardware/asset-type"  },
                  { label: "Asset Category",  icon: <></>, path: "/system-hardware/asset-category"  },
                  { label: "Asset Tracking",  icon: <></>, path: "/system-hardware/asset-tracking"  },
                ]
              : []),
            {
              label: "RFID Configuration", icon: <></>, path: "/system-hardware/rfid-configuration",
              children: [
                { label: "RFID Reader Listing", icon: <></>, path: "/system-hardware/rfid-configuration/reader-listing" },
                { label: "Antenna Listing",     icon: <></>, path: "/system-hardware/rfid-configuration/antenna-listing"     },
              ],
            },
          ],
        },
        // "Accel TOMS CV" (static prototype) hidden 6 Oct 2026 and archived in
        // archive/accel-toms-cv/. "Accel" is its replacement: a React route.
        { label: "Accel", icon: <Zap size={16} />, path: "/accel" },
        // Hidden 6 Oct 2026 (menu only — route and page still exist): { label: "System Health", icon: <Activity size={16} />, path: "/system-health" },
        { label: "System Maintenance", icon: <Wrench size={16} />, path: "/system-maintenance" },
      ],
    },
  ];
}

// Utility panels are flat — no nested expand/collapse. If a utility has
// no children of its own, it's just a single link (kept for consistency
// with the header above it, even though it looks a little redundant).
function buildUtilityNavGroup(utility: UtilityDef): { label: string; items: NavItem[] } {
  return {
    label: utility.label.toUpperCase(),
    items: utility.children?.length
      ? utility.children
      : [{ label: utility.label, icon: utility.icon, path: utility.path }],
  };
}


export function SidebarSuper({ currentPath, onNavigate, onLogout, navVersion = "v2" }: SidebarSuperProps) {
  const colors = COLOR_MAP[navVersion] ?? COLOR_MAP.v2;
  const isLight = colors.isLight ?? false;

  const t = isLight ? {
    textPrimary:    "text-gray-900",
    textTertiary:   "text-gray-400",
    textMicro:      "text-gray-400",
    bgActive:       "bg-red-50",
    bgActiveUtil:   "bg-red-50",
    border:         "border-gray-200",
    borderPanel:    "border-gray-100",
    ringUtil:       "ring-2 ring-red-200",
    logoContainer:  "bg-gray-200",
    indicator:      "bg-brand-primary",
    iconActive:     "text-brand-primary",
    iconBase:       "text-gray-400 group-hover:text-gray-600",
    chevron:        "text-gray-300",
    chevronActive:  "text-brand-primary",
    utilBtn:        "bg-red-50 text-brand-primary ring-2 ring-red-200",
    utilBtnInactive:"text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    navItem:        "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    navItemActive:  "bg-brand-primary text-white font-medium",
    navItemDeep:    "bg-red-50 text-brand-primary font-semibold",
    navChildActive: "bg-brand-primary text-white font-medium",
    logoutBtn:      "text-gray-400 hover:text-red-600 hover:bg-gray-100",
    footerText:     "text-gray-400",
    footerSub:      "text-gray-500",
    footerVer:      "text-gray-300",
  } : {
    textPrimary:    "text-white",
    textTertiary:   "text-white/30",
    textMicro:      "text-white/25",
    bgActive:       "bg-white/10",
    bgActiveUtil:   "bg-white/15",
    border:         "border-white/10",
    borderPanel:    "border-white/5",
    ringUtil:       "ring-2 ring-white/40",
    logoContainer:  "bg-white/5",
    indicator:      "bg-white",
    iconActive:     "text-white",
    iconBase:       "text-white/40 group-hover:text-white/70",
    chevron:        "text-white/30",
    chevronActive:  "text-white/70",
    utilBtn:        "bg-white/15 text-white ring-2 ring-white/40",
    utilBtnInactive:"text-white/50 hover:text-white hover:bg-white/8",
    navItem:        "text-white/60 hover:text-white hover:bg-white/8",
    navItemActive:  "bg-brand-primary text-white font-medium",
    navItemDeep:    "bg-white/10 text-white font-medium",
    navChildActive: "bg-brand-primary/80 text-white font-medium",
    logoutBtn:      "text-white/30 hover:text-red-400 hover:bg-white/8",
    footerText:     "text-white/30",
    footerSub:      "text-white/40",
    footerVer:      "text-white/20",
  };
  const [active, setActive] = useState<ActiveSection>(() => detectSection(currentPath));
  const setActiveProgramStore = useActiveProgramStore((s) => s.setActiveProgram);

  useEffect(() => {
    if (active.type === "program") setActiveProgramStore(active.id);
  }, [active, setActiveProgramStore]);

  const activeProgramDef = active.type === "program" ? PROGRAMS.find((p) => p.id === active.id)! : null;
  const activeUtilityDef = active.type === "utility" ? UTILITIES.find((u) => u.id === active.id)! : null;

  const navGroups = activeProgramDef
    ? buildProgramNavGroup(activeProgramDef)
    : [buildUtilityNavGroup(activeUtilityDef!)];

  // Utilities with no sub-menu of their own (e.g. Settings) go straight to
  // their main screen — showing a panel with a single repeat-the-label
  // button would just be a redundant extra click.
  const showPanel = !!activeProgramDef || !!activeUtilityDef?.children?.length;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    navGroups.flatMap((g) => g.items).forEach((item) => {
      if (item.children) {
        state[item.path] =
          currentPath.startsWith(item.path) || item.children.some((c) => currentPath.startsWith(c.path));
      }
    });
    return state;
  });

  const toggle = (path: string) => setExpanded((p) => ({ ...p, [path]: !p[path] }));

  const isActive = (path: string) => currentPath === path;
  const isDeepActive = (item: NavItem): boolean =>
    isActive(item.path) || (item.children?.some((c) => isActive(c.path)) ?? false);

  const selectProgram = (p: ProgramDef) => {
    setActive({ type: "program", id: p.id });
    if (p.bookingsPath) onNavigate(p.bookingsPath);
  };

  const selectUtility = (u: UtilityDef) => {
    setActive({ type: "utility", id: u.id });
    onNavigate(u.path);
  };

  return (
    <div className="flex h-full flex-shrink-0 select-none">
      {/* ── Rail: programme workspaces + pinned utilities (Slack-style) ────── */}
      <aside className={cn("w-14 min-w-[56px] flex flex-col items-center h-full py-2.5 gap-1", isLight && "border-r border-gray-200")} style={{ backgroundColor: colors.rail }}>
        <div className={cn("w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 mb-1.5", t.logoContainer)}>
          <img src={logoTrx} alt="TRX" className="w-full h-full object-contain p-1" />
        </div>
        <div className={cn("w-6 border-t mb-1 flex-shrink-0", t.border)} />

        {/* Programme workspaces — always anchored to the top, under the logo */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {PROGRAMS.map((p) => {
            const active_ = active.type === "program" && active.id === p.id;
            const built = !!p.bookingsPath;
            return (
              <RailTooltip key={p.id} label={built ? p.label : `${p.label} — coming soon`}>
                <button
                  type="button"
                  onClick={() => built && selectProgram(p)}
                  disabled={!built}
                  aria-disabled={!built}
                  style={active_ && !isLight ? { "--tw-ring-offset-color": colors.rail } as React.CSSProperties : undefined}
                  className={cn(
                    "relative w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-lg text-[9px] font-bold tracking-tight transition-all",
                    isLight
                      ? active_
                        ? "border-2 border-brand-primary bg-red-50 text-brand-primary"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      : cn(p.color, "text-white", active_ ? "ring-2 ring-white ring-offset-2" : "opacity-60 hover:opacity-100"),
                    !built && "opacity-30 grayscale cursor-not-allowed hover:opacity-30"
                  )}
                >
                  {active_ && !isLight && <span className={cn("absolute -left-[7px] top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full", t.indicator)} />}
                  {p.badge}
                </button>
              </RailTooltip>
            );
          })}
        </div>

        {/* Other menu — global utilities, not tied to any programme. Pinned
            to the bottom of the rail so the two groups read as clearly
            separate: programmes up top, everything else down here. */}
        <div className="mt-auto flex flex-col items-center gap-1 flex-shrink-0 pt-2">
          <span className={cn("text-[7px] font-bold uppercase tracking-widest mb-0.5", t.textMicro)}>Menu</span>
          {UTILITIES.map((u) => {
            const active_ = active.type === "utility" && active.id === u.id;
            return (
              <RailTooltip key={u.id} label={u.label}>
                <button
                  type="button"
                  onClick={() => selectUtility(u)}
                  className={cn(
                    "relative w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-lg transition-all",
                    active_ ? t.utilBtn : t.utilBtnInactive
                  )}
                >
                  {active_ && <span className={cn("absolute -left-[7px] top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full", t.indicator)} />}
                  {u.icon}
                </button>
              </RailTooltip>
            );
          })}

          <div className={cn("w-6 border-t my-1.5 flex-shrink-0", t.border)} />
          {onLogout && (
            <RailTooltip label="Log out">
              <button onClick={onLogout} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", t.logoutBtn)}>
                <LogOut size={13} />
              </button>
            </RailTooltip>
          )}
          <RailTooltip label="Olivia Carter · System Admin">
            <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[9px] font-bold mb-1">
              OC
            </div>
          </RailTooltip>
        </div>
      </aside>

      {/* ── Nav Panel: programme operations, or a utility's own menu ───────── */}
      {/* Skipped entirely for utilities with no sub-menu (e.g. Settings) —
          the rail icon goes straight to that tool's main screen instead. */}
      {showPanel && (
        <aside className={cn("w-[232px] min-w-[232px] flex flex-col h-full border-l", t.borderPanel)} style={{ backgroundColor: colors.panel }}>
          <div className={cn("h-[60px] px-4 border-b flex items-center flex-shrink-0", t.border)}>
            <div className={cn("text-sm font-bold truncate", t.textPrimary)}>
              {activeProgramDef ? activeProgramDef.label : activeUtilityDef!.label}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                <div className="px-2 mb-1.5">
                  <span className={cn("text-[9px] font-bold tracking-widest uppercase", t.textTertiary)}>{group.label}</span>
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isPlaceholder = item.path === "#";
                    const hasChildren = !!(item.children?.length);
                    const isExp = expanded[item.path];
                    const deepActive = isDeepActive(item);
                    const selfActive = isActive(item.path) && !hasChildren;

                    return (
                      <div key={item.path}>
                        <button
                          disabled={isPlaceholder}
                          onClick={() => (hasChildren ? toggle(item.path) : onNavigate(item.path))}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                            isPlaceholder
                              ? cn(t.textTertiary, "cursor-default italic")
                              : selfActive
                              ? t.navItemActive
                              : deepActive && hasChildren
                              ? t.navItemDeep
                              : t.navItem
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cn(selfActive || deepActive ? t.iconActive : t.iconBase)}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {hasChildren && (
                            <span className={cn("flex-shrink-0 transition-transform", isExp && "rotate-90")}>
                              <ChevronRight size={13} className={cn(deepActive ? t.chevronActive : t.chevron)} />
                            </span>
                          )}
                        </button>

                        {hasChildren && isExp && (
                          <div className={cn("mt-0.5 ml-3 pl-3 border-l space-y-0.5 py-1", t.border)}>
                            {item.children!.map((child) => {
                              const childHasChildren = !!(child.children?.length);
                              const isChildExp = expanded[child.path];
                              const childDeepActive = isActive(child.path) || (child.children?.some((g) => isActive(g.path)) ?? false);
                              return (
                                <div key={child.path}>
                                  <button
                                    onClick={() => childHasChildren ? toggle(child.path) : onNavigate(child.path)}
                                    className={cn(
                                      "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left",
                                      isActive(child.path) && !childHasChildren
                                        ? t.navChildActive
                                        : childDeepActive && childHasChildren
                                        ? t.navItemDeep
                                        : t.navItem
                                    )}
                                  >
                                    <span>{child.label}</span>
                                    {childHasChildren && (
                                      <ChevronRight size={11} className={cn("flex-shrink-0 transition-transform", isChildExp && "rotate-90", childDeepActive ? t.chevronActive : t.chevron)} />
                                    )}
                                  </button>
                                  {childHasChildren && isChildExp && (
                                    <div className={cn("mt-0.5 ml-3 pl-3 border-l space-y-0.5 py-0.5", t.border)}>
                                      {child.children!.map((grandchild) => (
                                        <button
                                          key={grandchild.path}
                                          onClick={() => onNavigate(grandchild.path)}
                                          className={cn(
                                            "w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors text-left",
                                            isActive(grandchild.path)
                                              ? t.navChildActive
                                              : t.navItem
                                          )}
                                        >
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
                </div>
              </div>
            ))}
          </nav>

          <div className={cn("border-t flex-shrink-0 px-4 py-3", t.border)}>
            <span className={cn("text-[10px]", t.footerText)}>
              Powered by <span className={t.footerSub}>Blue Silo</span>
            </span>
            <span className={cn("ml-2 text-[10px]", t.footerVer)}>v0.6.7</span>
          </div>
        </aside>
      )}
    </div>
  );
}
