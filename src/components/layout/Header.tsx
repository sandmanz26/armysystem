import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react"; // `bell` is not in the icon library yet — waiting on a decision
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { bookings, trainingResults } from "@/data/mock";
import { mstBookings } from "@/data/mst-mock";
import { assets, assetTypes, assetCategories } from "@/data/systemHardware";
import { users } from "@/data/userManagement";
import { baseStations as siteBaseStations } from "@/data/siteManagement";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";

export type ProgramTag = "WPT" | "MST" | "TCT";

type SearchCategory =
  | "Bookings"
  | "Trainees"
  | "Users"
  | "Asset Types"
  | "Asset Categories"
  | "Assets"
  | "Training Results"
  | "Locations";

// Figma Search Result (5029:16212) lists the groups in this order.
const CATEGORY_ORDER: SearchCategory[] = [
  "Bookings",
  "Trainees",
  "Users",
  "Asset Types",
  "Asset Categories",
  "Assets",
  "Training Results",
  "Locations",
];

interface SearchItem {
  category: SearchCategory;
  label: string;
  sub: string;
  path: string;
  program?: ProgramTag; // bookings only — used by the hidden programme tabs/pills
}

// ── Build search index from real data ─────────────────────────────────────────
function buildSearchData() {
  const data: SearchItem[] = [];

  // 1. Booking ID / Booking Name — WPT bookings
  for (const b of bookings) {
    data.push({
      category: "Bookings",
      label: b.program,
      sub: `${b.bookingId} · ${b.bookingDate} · ${b.status}`,
      path: `/bookings/detail?id=${b.id}`,
      program: "WPT",
    });
  }

  // 1b. Booking ID / Booking Name — MST & TCT bookings
  for (const b of mstBookings) {
    data.push({
      category: "Bookings",
      label: b.isMSTTCT ? b.program.replace(/^MST TCT/, "TCT") : b.program,
      sub: `${b.bookingId} · ${b.bookingDate} · ${b.status}`,
      path: `/bookings/mst/detail?id=${b.id}`,
      program: b.isMSTTCT ? "TCT" : "MST",
    });
  }

  // 2. Trainees — no trainee data source exists in src/data (the Training Result
  //    nominal roll is generated inside that page), so this group stays empty
  //    and is hidden until one does.

  // 3. User
  for (const u of users) {
    data.push({
      category: "Users",
      label: `${u.rank} ${u.name}`,
      sub: `${u.userId} · ${u.userRole} · ${u.unitName}`,
      path: `/user-management/user-list`,
    });
  }

  // 4. Asset type
  for (const t of assetTypes) {
    data.push({
      category: "Asset Types",
      label: t.assetType,
      sub: `${t.assetCategory} · ${t.code} · ${t.status}`,
      path: `/system-hardware/asset-type`,
    });
  }

  // 5. Asset category
  for (const c of assetCategories) {
    data.push({
      category: "Asset Categories",
      label: c.assetCategory,
      sub: c.status,
      path: `/system-hardware/asset-category`,
    });
  }

  // 6. Asset name
  for (const a of assets) {
    data.push({
      category: "Assets",
      label: a.name,
      sub: `${a.serialNumber} · ${a.assetType} · ${a.status}`,
      path: `/system-hardware/assets-list`,
    });
  }

  // 7. Training results
  for (const t of trainingResults) {
    data.push({
      category: "Training Results",
      label: t.program,
      sub: `${t.bookingId} · ${t.trainingMode} · ${t.systemType}`,
      path: `/training-results`,
    });
  }

  // 8. Locations — Site Management base stations
  for (const st of siteBaseStations) {
    data.push({
      category: "Locations",
      label: st.name,
      sub: `${st.status} · ${st.lanes.length} ${st.lanes.length === 1 ? "lane" : "lanes"}`,
      path: `/site-management`,
    });
  }

  return data;
}

const SEARCH_DATA = buildSearchData();

// Figma group badges: Bookings blue · Trainees/Users purple · Asset Types/Categories/Locations
// green · Assets/Training Results amber. The row dot follows Figma too (blue / purple / green).
const CATEGORY_BADGE: Record<SearchCategory, string> = {
  Bookings:           "bg-blue-100 text-blue-700",
  Trainees:           "bg-purple-100 text-purple-700",
  Users:              "bg-purple-100 text-purple-700",
  "Asset Types":      "bg-green-100 text-green-700",
  "Asset Categories": "bg-green-100 text-green-700",
  Assets:             "bg-amber-100 text-amber-700",
  "Training Results": "bg-amber-100 text-amber-700",
  Locations:          "bg-green-100 text-green-700",
};

const CATEGORY_DOT: Record<SearchCategory, string> = {
  Bookings:           "bg-blue-700",
  Trainees:           "bg-purple-700",
  Users:              "bg-purple-700",
  "Asset Types":      "bg-green-700",
  "Asset Categories": "bg-green-700",
  Assets:             "bg-green-700",
  "Training Results": "bg-green-700",
  Locations:          "bg-green-700",
};

const PROGRAM_TABS: ("All" | ProgramTag)[] = ["All", "WPT", "MST", "TCT"];

const PROGRAM_COLORS: Record<ProgramTag, string> = {
  WPT: "bg-red-50 text-brand-primary border-red-100",
  MST: "bg-sky-50 text-sky-700 border-sky-100",
  TCT: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

// Rows shown per group (Figma Bookings group: 5 rows, header "5 results").
const MAX_PER_GROUP = 5;

// ── Global Search ─────────────────────────────────────────────────────────────
function GlobalSearch({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [programTab, setProgramTab] = useState<"All" | ProgramTag>("All");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const q = query.trim().toLowerCase();
  const matchesQuery = (item: SearchItem) =>
    item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
  const allResults = q.length >= 2
    ? SEARCH_DATA.filter(
        (item) =>
          matchesQuery(item) &&
          // Programme tab (hidden feature) only scopes Bookings.
          (!HIDDEN_FEATURES.searchProgrammeTabs || programTab === "All" || item.category !== "Bookings" || item.program === programTab)
      )
    : [];

  // Booking counts per programme from the query alone — drives the tab counts.
  const bookingMatches = HIDDEN_FEATURES.searchProgrammeTabs && q.length >= 2
    ? SEARCH_DATA.filter((item) => item.category === "Bookings" && matchesQuery(item))
    : [];
  const programCounts: Record<"All" | ProgramTag, number> = {
    All: bookingMatches.length,
    WPT: bookingMatches.filter((i) => i.program === "WPT").length,
    MST: bookingMatches.filter((i) => i.program === "MST").length,
    TCT: bookingMatches.filter((i) => i.program === "TCT").length,
  };

  // Group by category in Figma's order; each group keeps its full match count
  // for the header ("5 results") but only shows MAX_PER_GROUP rows.
  const groups = CATEGORY_ORDER
    .map((cat) => {
      const items = allResults.filter((i) => i.category === cat);
      return { cat, total: items.length, shown: items.slice(0, MAX_PER_GROUP) };
    })
    .filter((g) => g.total > 0);

  const totalCount = allResults.length;
  const shownCount = groups.reduce((n, g) => n + g.shown.length, 0);
  const hiddenCount = totalCount - shownCount;

  // Highlight matching text
  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5 not-italic font-semibold">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const handleSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.(path);
  };

  return (
    <div ref={ref} className="relative w-64">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-main-background transition-colors",
        open || query ? "border-brand-primary bg-surface" : "border-invert-default hover:border-gray-300"
      )}>
        <Icon name="search" size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          placeholder="Search bookings, assets, users..."
          className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-disabled outline-none"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setOpen(false); }}>
            <Icon name="x" size={12} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {open && q.length >= 2 && (
        // Figma Popover - Search Result (5029:16232 / 5029:16211): 420px, radius 8, 1px border, shadow.
        <div className="absolute top-full left-0 mt-1.5 w-[420px] bg-surface border border-invert-default rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Programme tabs (hidden feature: searchProgrammeTabs) — scope Bookings to WPT / MST / TCT */}
          {HIDDEN_FEATURES.searchProgrammeTabs && programCounts.All > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 bg-surface">
              {PROGRAM_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setProgramTab(tab)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors",
                    programTab === tab
                      ? "bg-brand-primary text-invert-default border-brand-primary"
                      : "bg-surface text-gray-500 border-invert-default hover:border-gray-300"
                  )}
                >
                  {tab} <span className={cn("ml-0.5", programTab === tab ? "text-invert-default/80" : "text-gray-400")}>{programCounts[tab]}</span>
                </button>
              ))}
            </div>
          )}
          {/* Results list — Figma container is 384px tall and scrolls */}
          <div className="max-h-[384px] overflow-y-auto">
            {groups.length === 0 ? (
              // Search No Result (5029:16191): 48px grey circle + search icon, title / subtitle.
              <div className="flex flex-col items-center gap-3 px-0 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Icon name="search" size={24} className="text-gray-400" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-gray-500">No result for “{query}”</p>
                  <p className="pt-1 text-sm text-gray-400">Try a different keyword.</p>
                </div>
              </div>
            ) : (
              groups.map(({ cat, total, shown }) => (
                <div key={cat}>
                  {/* Group header: badge + "N results" */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-medium uppercase", CATEGORY_BADGE[cat])}>
                      {cat}
                    </span>
                    <span className="text-xs text-gray-500">{total} {total === 1 ? "result" : "results"}</span>
                  </div>
                  {/* Result rows */}
                  {shown.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-200 transition-colors group"
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", CATEGORY_DOT[cat])} />
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-default truncate">
                            {highlight(item.label)}
                          </span>
                          {HIDDEN_FEATURES.searchProgrammeTabs && item.program && (
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0", PROGRAM_COLORS[item.program])}>
                              {item.program}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 truncate">
                          {highlight(item.sub)}
                        </span>
                      </div>
                      <Icon name="chevron-right" size={16} className="text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer — Figma shows it on the no-result state too ("Showing 0 of 0 results") */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-1 text-xs">
            <span className="text-gray-500">Showing</span>
            <span className="font-semibold text-default">{shownCount}</span>
            <span className="text-gray-500">of</span>
            <span className="font-semibold text-default">{totalCount}</span>
            <span className="text-gray-500">{totalCount === 1 ? "result" : "results"}</span>
            {hiddenCount > 0 && (
              <span className="ml-auto flex items-center gap-1 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                {hiddenCount} more — refine your search
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Path to Breadcrumb mapping ────────────────────────────────────────────────
const PATH_BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  // Figma Today's Booking (6214:246975): home › "Today's Booking".
  "/bookings/today": ["Today's Booking"],
  // Figma Notifications (5029:24364): home › "Notifications".
  "/notifications": ["Notifications"],
  // Figma Booking List 2.0 (5331:428546): home › "Booking List".
  "/bookings/list": ["Booking List"],
  // Figma Booking Details (5511:16209): home › Booking List › "Booking Details".
  "/bookings/detail": ["Booking List", "Booking Detail"],
  "/training-results": ["Training Results"],
  "/training-results/detail": ["Training Results", "Detail"],
  "/reports/asset-movement": ["Reports", "Asset Movement"],
  "/reports/stock-take": ["Reports", "Stock Take Variance"],
  "/reports/asset-audit": ["Reports", "Assets Audit"],
  // Figma User List (7010:542599): home › "User List".
  "/user-management/user-list": ["User List"],
  // Figma User Details (5014:9360): home › User List › "User Details".
  "/user-management/user-detail": ["User List", "User Details"],
  "/user-management/user-role": ["User Management", "User Role"],
  "/user-management/role-permission": ["User Management", "User Permission"],
  "/user-management/rank": ["User Management", "Rank"],
  // Figma Site Management (5112:111648): home › "Site Management". The base station
  // details view lives on the same path with `?view=station` — see getBreadcrumbs.
  "/site-management": ["Site Management"],
  "/system-hardware": ["System Hardware"],
  "/system-hardware/dashboard": ["System Hardware", "Dashboard"],
  "/system-hardware/assets-list": ["System Hardware", "Assets List"],
  "/system-hardware/assignment-list": ["System Hardware", "Assignment List"],
  "/system-hardware/asset-type": ["System Hardware", "Asset Type"],
  "/system-hardware/asset-category": ["System Hardware", "Asset Category"],
  "/system-hardware/asset-tracking": ["System Hardware", "Asset Tracking"],
  "/system-hardware/rfid-configuration": ["System Hardware", "RFID Configuration"],
  "/system-hardware/rfid-configuration/reader-listing": ["System Hardware", "RFID Configuration", "Reader Listing"],
  "/system-hardware/rfid-configuration/antenna-listing": ["System Hardware", "RFID Configuration", "Antenna Listing"],
  "/system-health": ["System Health"],
  // Figma System Health - Full Page (5128:324469): home › "System Health".
  "/accel": ["Accel"],
  "/operational-availability": ["Operational Availability"],
  // Figma OA List (5119:297872): home › "Operational Availability".
  "/operational-availability-2": ["Operational Availability"],
  "/system-maintenance": ["System Maintenance"],
  "/data-management": ["Data Management"],
  "/data-management/export": ["Data Management", "Export"],
  "/data-management/import": ["Data Management", "Import"],
  "/activity-log": ["Activity Log"],
  "/resource-planning": ["Resource Planning"],
  "/settings": ["Settings"],
};

// Map breadcrumb label → navigable hash path
const BREADCRUMB_LINKS: Record<string, string> = {
  "Booking List": "/bookings/list",
  "Bookings": "/bookings/list",
  "Training Results": "/training-results",
  "Operational Availability": "/operational-availability-2",
  "User Management": "/user-management/user-list",
  "User List": "/user-management/user-list",
  "System Hardware": "/system-hardware",
  "Reports": "/reports/asset-movement",
  "Stock Take Variance Report": "/reports/stock-take",
  "Site Management": "/site-management",
  "Resource Planning": "/resource-planning",
};

function getBreadcrumbs(pathname: string, search = ""): string[] {
  const normalizedPath = pathname || "/dashboard";

  // Figma Base Station Details (5115:207624): home › Site Management › "Base Station Details".
  if (normalizedPath === "/site-management" && new URLSearchParams(search).get("view") === "station") {
    return ["Site Management", "Base Station Details"];
  }

  // Figma Resource Planning Edit frames (6900:44444, 8054:29705, 8054:34862): home ›
  // Resource Planning › "Edit Resource Planning" while one of the page's cards is in edit mode.
  if (normalizedPath === "/resource-planning" && new URLSearchParams(search).get("edit")) {
    return ["Resource Planning", "Edit Resource Planning"];
  }

  if (/^\/reports\/stock-take\/[^/]+\/report$/.test(normalizedPath)) {
    return ["Stock Take Variance Report", "Report Detail"];
  }

  // Figma OA Details (8033:293789): home › Operational Availability › "July 2026".
  const oaMonth = /^\/operational-availability-2\/([a-z]+)-(\d{4})$/.exec(normalizedPath);
  if (oaMonth) {
    const name = new Date(`${oaMonth[1]} 1, ${oaMonth[2]}`).toLocaleString("en-US", { month: "long" });
    return ["Operational Availability", `${name} ${oaMonth[2]}`];
  }

  if (/^\/reports\/stock-take\/[^/]+$/.test(normalizedPath)) {
    return ["Stock Take Variance Report"];
  }

  return PATH_BREADCRUMBS[normalizedPath] || ["Dashboard"];
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(() => getBreadcrumbs(location.pathname, location.search));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setBreadcrumbs(getBreadcrumbs(location.pathname, location.search));
  }, [location.pathname, location.search]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <header className="h-[60px] bg-surface border-b border-invert-default flex items-center px-6 gap-4 flex-shrink-0">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-body flex-1">
        <Icon name="house" size={13} className="text-gray-400" />
        {breadcrumbs.map((item, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const linkPath = !isLast ? BREADCRUMB_LINKS[item] : undefined;
          return (
            <div key={idx} className="flex items-center gap-1">
              <Icon name="chevron-right" size={13} className="text-gray-300" />
              {linkPath ? (
                <button
                  type="button"
                  onClick={() => navigate(linkPath)}
                  className="text-body hover:text-brand-primary hover:underline transition-colors"
                >
                  {item}
                </button>
              ) : (
                <span className={isLast ? "text-brand-primary font-medium" : "text-body"}>
                  {item}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <GlobalSearch onNavigate={onNavigate} />

      <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap bg-gray-50 border border-invert-default rounded-lg px-3 py-1.5">
        <Icon name="map-pin" size={12} className="text-brand-primary flex-shrink-0" />
        <span className="font-semibold text-gray-700">Pulau Thornton Camp</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-400">{formatDate(time)}</span>
        <span className="text-gray-300">|</span>
        <span className="font-medium text-caption">{formatTime(time)}</span>
      </div>

      <button
        onClick={() => onNavigate?.("/notifications")}
        className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Bell size={17} />
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-invert-default flex items-center justify-center font-bold">
          9
        </span>
      </button>
    </header>
  );
}
