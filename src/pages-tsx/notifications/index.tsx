import { useRef, useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Icon } from "@/components/icon";
import { Select } from "@/components/select";
import { DatePickerFilter } from "@/components/date-picker-filter";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

/*
 * Notifications — Figma `Notifications` page (5029:24085), main frame 5029:24364.
 * Page Header (title 20 Semi Bold `text/default` + primary "Mark All as Read",
 * disabled when nothing is unread — 5029:24391) above one Section Layout card:
 * Tab Group v2 (All · Bookings · Users · Asset · Unread with a danger dot),
 * Section Header ("All Notifications" + Search 240 · Select Date · programme
 * Single Select 160), the list, pagination.
 * Rows (`Notifications List`): 36px bell circle, title 14 Semi Bold + programme
 * badge, description 14 `text/body`, absolute time 12 `text/body`
 * (Notes 6787:241303: "Today · 2:07 PM", older "15 Nov 2025 · 5:08 PM"),
 * unread dot; unread rows on `background/primary/invert/soft`, read titles
 * `text/loading`.
 * Select Date uses the shared `Date Picker - Filter` (5029:24447); an applied
 * date turns the button `border/primary` + `text/primary` (5029:24475).
 * Empty / no-result use the Figma Empty State (5029:24342 / 5029:24548).
 * The `Icon / bell` glyph is not in the icon library, so lucide `Bell` stays
 * until it is added.
 */

/* ─── Types ────────────────────────────────────────────────────────────────── */

type NotifCategory = "All" | "Bookings" | "Users" | "Assets";
type Program = "WPT" | "MST" | "TCT";
type ProgramFilter = "All" | Program;

interface NotifItem {
  id: string;
  category: NotifCategory;
  program: Program;
  title: string;
  description: string;
  /** Mock: minutes before page load. Real data will carry a timestamp. */
  minutesAgo: number;
  read: boolean;
}

/* ─── Mock data ─────────────────────────────────────────────────────────────── */

const MOCK_NOTIFICATIONS: NotifItem[] = [
  { id: "1",  category: "Bookings", program: "WPT", title: "New Booking Created",          description: "Booking #BK-2048 has been created for Squad Alpha — Live Firing (30 Apr 2026).", minutesAgo: 120,  read: false },
  { id: "2",  category: "Users",    program: "MST", title: "New User Registered",          description: "CPL James Tan has been added to the system by System Admin.",                            minutesAgo: 180,  read: false },
  { id: "3",  category: "Assets",   program: "WPT", title: "Asset Pending Return",         description: "SAR 21 #A-0042 is overdue for return by 1 day. Assigned to SGT Ravi Kumar.",            minutesAgo: 300,  read: false },
  { id: "4",  category: "Bookings", program: "TCT", title: "Booking Cancelled",            description: "Booking #BK-2039 (Grenade Range) has been cancelled by OC Training.",                   minutesAgo: 360,  read: false },
  { id: "5",  category: "Assets",   program: "WPT", title: "RFID Tag Disconnected",        description: "RFID Tag for Rifle #A-0017 reported disconnected at Armoury Gate 2.",                   minutesAgo: 480,  read: false },
  { id: "6",  category: "Users",    program: "TCT", title: "Role Permission Updated",      description: "Role 'Range Safety Officer' permissions updated by System Admin.",                       minutesAgo: 1662,    read: true  },
  { id: "7",  category: "Bookings", program: "MST", title: "Booking Reminder",             description: "Booking #BK-2051 (Urban Ops Training) starts in 2 hours. 24 pax registered.",           minutesAgo: 1699,    read: true  },
  { id: "8",  category: "Assets",   program: "WPT", title: "Asset Returned",               description: "SAR 21 #A-0028 successfully returned and verified by Armourer SGT Lee.",                minutesAgo: 1736,    read: true  },
  { id: "9",  category: "Bookings", program: "MST", title: "Training Results Submitted",   description: "Results for Booking #BK-2040 have been submitted. 18 passed, 2 failed.",                minutesAgo: 3213,   read: true  },
  { id: "10", category: "Assets",   program: "TCT", title: "Asset Category Added",         description: "New asset category 'Night Vision Devices' has been added to the system.",               minutesAgo: 3250,   read: true  },
  { id: "11", category: "Users",    program: "WPT", title: "Password Reset Request",       description: "CPL Ahmad requested a password reset. Action required by admin.",                       minutesAgo: 3287,   read: false },
  { id: "12", category: "Bookings", program: "WPT", title: "Booking Modified",             description: "Booking #BK-2033 updated — venue changed from Range 5 to Range 7.",                    minutesAgo: 4764,   read: true  },
  { id: "13", category: "Assets",   program: "MST", title: "Low Stock Alert",              description: "Blank rounds stock is below threshold (12 remaining). Reorder recommended.",            minutesAgo: 4801,   read: false },
  { id: "14", category: "Users",    program: "TCT", title: "User Deactivated",             description: "Account for 3SG Wesley Ng has been deactivated — ORD 30 Apr 2026.",                    minutesAgo: 6278,   read: true  },
  { id: "15", category: "Assets",   program: "WPT", title: "Maintenance Scheduled",        description: "Glock 17 #A-0091 scheduled for routine maintenance on 5 May 2026.",                     minutesAgo: 6315,   read: true  },
  { id: "16", category: "Bookings", program: "TCT", title: "Range Booking Conflict",       description: "Booking conflict detected for Range 3 on 6 May 2026. Please resolve.",                 minutesAgo: 7792,   read: false },
  { id: "17", category: "Users",    program: "MST", title: "New Role Created",             description: "Role 'Logistics Officer' created with 12 permissions by System Admin.",                 minutesAgo: 7229,   read: true  },
  { id: "18", category: "Assets",   program: "WPT", title: "Asset Issued",                 description: "9 units of SAR 21 issued to Golf Company for BIC Exercise.",                           minutesAgo: 8706,   read: true  },
  { id: "19", category: "Bookings", program: "MST", title: "Booking Approved",             description: "Booking #BK-2044 has been approved by CO Training.",                                    minutesAgo: 8743,   read: true  },
  { id: "20", category: "Assets",   program: "TCT", title: "RFID Reader Offline",          description: "RFID Reader at Armoury Exit Gate went offline. IT team notified.",                      minutesAgo: 10220,   read: false },
  { id: "21", category: "Users",    program: "WPT", title: "Bulk User Import",             description: "87 users successfully imported from CSV. 2 records had errors.",                        minutesAgo: 10257,   read: true  },
  { id: "22", category: "Bookings", program: "WPT", title: "Debrief Session Scheduled",    description: "Post-exercise debrief for BK-2040 scheduled 8 May 2026 at 1400H.",                    minutesAgo: 11734,   read: true  },
  { id: "23", category: "Assets",   program: "MST", title: "Asset Disposal Requested",     description: "Disposal request for 3 units of M203 Launcher submitted for approval.",               minutesAgo: 11771,   read: true  },
  { id: "24", category: "Users",    program: "TCT", title: "System Admin Login Alert",     description: "System Admin logged in from a new device (MacOS, Northvale).",                         minutesAgo: 13248,   read: true  },
  { id: "25", category: "Bookings", program: "WPT", title: "Annual ATEC Booking Created",  description: "Annual ATEC booking for Q3 FY2026 has been created. 450 pax expected.",              minutesAgo: 14725,  read: true  },
  { id: "26", category: "Assets",   program: "MST", title: "Stock Take Completed",         description: "Quarterly stock take completed. 2 discrepancies found in Section B.",                  minutesAgo: 14762,  read: true  },
  { id: "27", category: "Users",    program: "TCT", title: "Rank Updated",                 description: "5 users promoted — ranks updated in system by HR Admin.",                              minutesAgo: 16239,  read: true  },
  { id: "28", category: "Bookings", program: "WPT", title: "Training Cancelled",           description: "All range bookings on 11 May cancelled due to maintenance activities.",                 minutesAgo: 16276,  read: true  },
  { id: "29", category: "Assets",   program: "MST", title: "Asset Tracking Alert",         description: "Asset #A-0053 detected outside designated zone at 2315H.",                             minutesAgo: 17753,  read: false },
  { id: "30", category: "Users",    program: "TCT", title: "Session Timeout Alert",        description: "Multiple users experienced forced session timeout due to policy update.",               minutesAgo: 17790,  read: true  },
];

const LOADED_AT = Date.now();
const timeOf = (n: NotifItem) => new Date(LOADED_AT - n.minutesAgo * 60_000);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatClock = (d: Date) => {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
};
const formatDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
/** Notes 6787:241303 — absolute time, no "2 hours ago". */
const formatWhen = (d: Date) => `${sameDay(d, new Date()) ? "Today" : formatDay(d)} · ${formatClock(d)}`;

const TABS: { label: string; value: NotifCategory | "Unread" }[] = [
  { label: "All",      value: "All"      },
  { label: "Bookings", value: "Bookings" },
  { label: "Users",    value: "Users"    },
  { label: "Asset",    value: "Assets"   },
  { label: "Unread",   value: "Unread"   },
];

const PER_PAGE = 10;

/* ─── Notification row ──────────────────────────────────────────────────────── */

// Badge - Programme: WPT is `background/danger/invert/default` + `border/invert/danger` + `text/danger`.
const PROGRAM_BADGE_STYLES: Record<Program, string> = {
  WPT: "bg-danger-invert-default border-invert-danger text-danger",
  MST: "bg-info-invert-default border-invert-info text-info",
  TCT: "bg-success-invert-default border-invert-success text-success",
};

function NotifRow({ item }: { item: NotifItem }) {
  return (
    <div className={cn("border-b border-invert-default", !item.read && "bg-primary-invert-soft")}>
      <div className="flex items-start gap-4 px-5 py-4 cursor-pointer">
        <div className="pt-0.5 flex-shrink-0">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              item.read ? "bg-default-default text-body" : "bg-primary-default text-invert-default",
            )}
          >
            <Bell size={16} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm font-semibold leading-5", item.read ? "text-loading" : "text-default")}>
              {item.title}
            </p>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium leading-4",
                PROGRAM_BADGE_STYLES[item.program],
              )}
            >
              {item.program}
            </span>
          </div>
          <p className="pt-0.5 text-sm leading-5 text-body">{item.description}</p>
          <p className="pt-1.5 text-xs leading-4 text-body">{formatWhen(timeOf(item))}</p>
        </div>

        {!item.read && (
          <div className="pt-2 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-default" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Empty state (Figma Empty State, 5029:24342 / 5029:24548) ──────────────── */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="w-12 h-12 rounded-full bg-default-default flex items-center justify-center text-body">
        <Icon name={query ? "search" : "info"} size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold text-body">
          {query ? `No result for “${query}”` : "No data to show right now"}
        </p>
        <p className="pt-1 text-sm text-disabled">
          {query ? "Try a different keyword." : "This table will be automatically updated once users take action."}
        </p>
      </div>
    </div>
  );
}

/* ─── Programme filter (Figma `Input - Single Select`, 5333:84572) ──────────── */

const PROGRAM_OPTIONS: { label: string; value: ProgramFilter }[] = [
  { label: "All Programmes", value: "All" },
  { label: "WPT",            value: "WPT" },
  { label: "MST",            value: "MST" },
  { label: "TCT",            value: "TCT" },
];

/* ─── Main page ─────────────────────────────────────────────────────────────── */

export function Notifications() {
  const [activeTab, setActiveTab] = useState<NotifCategory | "Unread">("All");
  const [programFilter, setProgramFilter] = useState<ProgramFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [pickerOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const filtered = notifications.filter((n) => {
    const matchTab =
      activeTab === "All"    ? true :
      activeTab === "Unread" ? !n.read :
      n.category === activeTab;
    const matchProgram = programFilter === "All" || n.program === programFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    const matchDate = !selectedDate || sameDay(timeOf(n), selectedDate);
    return matchTab && matchProgram && matchSearch && matchDate;
  });

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const sectionTitle =
    activeTab === "All" ? "All Notifications" : `${TABS.find((t) => t.value === activeTab)?.label} Notifications`;

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold leading-7 text-default">Notifications</h1>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors disabled:bg-disabled disabled:text-disabled disabled:cursor-not-allowed"
          >
            <Icon name="check-check" size={18} />
            Mark All as Read
          </button>
        </div>

        {/* Section Layout - Table */}
        <div className="bg-surface rounded-xl border border-invert-default">
          {/* Tab Group v2 */}
          <div className="flex items-center px-5 border-b border-invert-default overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive ? "text-primary" : "text-body hover:text-default",
                  )}
                >
                  {tab.label}
                  {tab.value === "Unread" && unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-danger-default ring-1 ring-base" />
                  )}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-default" />}
                </button>
              );
            })}
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between gap-5 p-5">
            <h2 className="text-base font-semibold leading-6 text-default">{sectionTitle}</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-60">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none">
                  <Icon name="search" size={18} />
                </span>
                <InputCustom
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full h-9 pl-10 pr-9 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-default transition-colors"
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>

              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => !o)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
                    selectedDate ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
                  )}
                >
                  <Icon name="calendar" size={16} />
                  {selectedDate ? formatDay(selectedDate) : "Select Date"}
                </button>
                {pickerOpen && (
                  <DatePickerFilter
                    value={selectedDate}
                    onApply={(d) => { setSelectedDate(d); setCurrentPage(1); }}
                    onClear={() => { setSelectedDate(null); setCurrentPage(1); }}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>

              <Select
                size="sm"
                wrapperClassName="w-40"
                options={PROGRAM_OPTIONS}
                value={programFilter}
                onChange={(v) => { setProgramFilter(v as ProgramFilter); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* List */}
          <div>
            {paginated.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              paginated.map((item) => <NotifRow key={item.id} item={item} />)
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
