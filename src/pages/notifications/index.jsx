import { useState } from "react";
import { Calendar, CheckCheck, CalendarDays, UserCircle2, Package, Bell } from "lucide-react";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

// ── Category icon + color config ─────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Bookings: {
    icon: CalendarDays,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    bgUnread: "bg-blue-600",
    iconUnread: "text-white",
  },
  Users: {
    icon: UserCircle2,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
    bgUnread: "bg-purple-600",
    iconUnread: "text-white",
  },
  Assets: {
    icon: Package,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
    bgUnread: "bg-amber-500",
    iconUnread: "text-white",
  },
};
/* ─── Mock data ─────────────────────────────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
    { id: "1", category: "Bookings", title: "New Booking Created", description: "Booking #BK-2048 has been created for Squad Alpha — Live Firing (30 Apr 2026).", timestamp: "2 hours ago", read: false },
    { id: "2", category: "Users", title: "New User Registered", description: "CPL James Tan has been added to the system by System Admin.", timestamp: "3 hours ago", read: false },
    { id: "3", category: "Assets", title: "Asset Pending Return", description: "SAR 21 #A-0042 is overdue for return by 1 day. Assigned to SGT Ravi Kumar.", timestamp: "5 hours ago", read: false },
    { id: "4", category: "Bookings", title: "Booking Cancelled", description: "Booking #BK-2039 (Grenade Range) has been cancelled by OC Training.", timestamp: "6 hours ago", read: false },
    { id: "5", category: "Assets", title: "RFID Tag Disconnected", description: "RFID Tag for Rifle #A-0017 reported disconnected at Armoury Gate 2.", timestamp: "8 hours ago", read: false },
    { id: "6", category: "Users", title: "Role Permission Updated", description: "Role 'Range Safety Officer' permissions updated by System Admin.", timestamp: "1 day ago", read: true },
    { id: "7", category: "Bookings", title: "Booking Reminder", description: "Booking #BK-2051 (Urban Ops Training) starts in 2 hours. 24 pax registered.", timestamp: "1 day ago", read: true },
    { id: "8", category: "Assets", title: "Asset Returned", description: "SAR 21 #A-0028 successfully returned and verified by Armourer SGT Lee.", timestamp: "1 day ago", read: true },
    { id: "9", category: "Bookings", title: "Training Results Submitted", description: "Results for Booking #BK-2040 have been submitted. 18 passed, 2 failed.", timestamp: "2 days ago", read: true },
    { id: "10", category: "Assets", title: "Asset Category Added", description: "New asset category 'Night Vision Devices' has been added to the system.", timestamp: "2 days ago", read: true },
    { id: "11", category: "Users", title: "Password Reset Request", description: "CPL Ahmad requested a password reset. Action required by admin.", timestamp: "2 days ago", read: false },
    { id: "12", category: "Bookings", title: "Booking Modified", description: "Booking #BK-2033 updated — venue changed from Range 5 to Range 7.", timestamp: "3 days ago", read: true },
    { id: "13", category: "Assets", title: "Low Stock Alert", description: "Blank rounds stock is below threshold (12 remaining). Reorder recommended.", timestamp: "3 days ago", read: false },
    { id: "14", category: "Users", title: "User Deactivated", description: "Account for 3SG Wesley Ng has been deactivated — ORD 30 Apr 2026.", timestamp: "4 days ago", read: true },
    { id: "15", category: "Assets", title: "Maintenance Scheduled", description: "Glock 17 #A-0091 scheduled for routine maintenance on 5 May 2026.", timestamp: "4 days ago", read: true },
    { id: "16", category: "Bookings", title: "Range Booking Conflict", description: "Booking conflict detected for Range 3 on 6 May 2026. Please resolve.", timestamp: "5 days ago", read: false },
    { id: "17", category: "Users", title: "New Role Created", description: "Role 'Logistics Officer' created with 12 permissions by System Admin.", timestamp: "5 days ago", read: true },
    { id: "18", category: "Assets", title: "Asset Issued", description: "9 units of SAR 21 issued to Golf Company for BIC Exercise.", timestamp: "6 days ago", read: true },
    { id: "19", category: "Bookings", title: "Booking Approved", description: "Booking #BK-2044 has been approved by CO Training.", timestamp: "6 days ago", read: true },
    { id: "20", category: "Assets", title: "RFID Reader Offline", description: "RFID Reader at Armoury Exit Gate went offline. IT team notified.", timestamp: "7 days ago", read: false },
    { id: "21", category: "Users", title: "Bulk User Import", description: "87 users successfully imported from CSV. 2 records had errors.", timestamp: "7 days ago", read: true },
    { id: "22", category: "Bookings", title: "Debrief Session Scheduled", description: "Post-exercise debrief for BK-2040 scheduled 8 May 2026 at 1400H.", timestamp: "8 days ago", read: true },
    { id: "23", category: "Assets", title: "Asset Disposal Requested", description: "Disposal request for 3 units of M203 Launcher submitted for approval.", timestamp: "8 days ago", read: true },
    { id: "24", category: "Users", title: "System Admin Login Alert", description: "System Admin logged in from a new device (MacOS, Northvale).", timestamp: "9 days ago", read: true },
    { id: "25", category: "Bookings", title: "Annual ATEC Booking Created", description: "Annual ATEC booking for Q3 FY2026 has been created. 450 pax expected.", timestamp: "10 days ago", read: true },
    { id: "26", category: "Assets", title: "Stock Take Completed", description: "Quarterly stock take completed. 2 discrepancies found in Section B.", timestamp: "10 days ago", read: true },
    { id: "27", category: "Users", title: "Rank Updated", description: "5 users promoted — ranks updated in system by HR Admin.", timestamp: "11 days ago", read: true },
    { id: "28", category: "Bookings", title: "Training Cancelled", description: "All range bookings on 11 May cancelled due to maintenance activities.", timestamp: "11 days ago", read: true },
    { id: "29", category: "Assets", title: "Asset Tracking Alert", description: "Asset #A-0053 detected outside designated zone at 2315H.", timestamp: "12 days ago", read: false },
    { id: "30", category: "Users", title: "Session Timeout Alert", description: "Multiple users experienced forced session timeout due to policy update.", timestamp: "12 days ago", read: true },
];
const TABS = [
    { label: "All", value: "All" },
    { label: "Bookings", value: "Bookings" },
    { label: "Users", value: "Users" },
    { label: "Assets", value: "Assets" },
    { label: "Unread", value: "Unread" },
];
const PER_PAGE = 10;
/* ─── Notification row ──────────────────────────────────────────────────────── */
function NotifRow({ item }) {
    const config = CATEGORY_CONFIG[item.category] ?? {
        icon: Bell,
        bg: "bg-gray-100",
        iconColor: "text-gray-500",
        bgUnread: "bg-gray-600",
        iconUnread: "text-white",
    };
    const Icon = config.icon;
    return (<div className={cn("flex items-start gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer", !item.read && "bg-red-50/20")}>
      {/* Category icon */}
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", !item.read ? config.bgUnread : config.bg)}>
        <Icon size={15} className={!item.read ? config.iconUnread : config.iconColor}/>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold leading-snug", !item.read ? "text-gray-900" : "text-gray-700")}>
          {item.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
        <p className="text-[11px] text-gray-400 mt-1">{item.timestamp}</p>
      </div>

      {/* Unread dot — matches category color */}
      {!item.read && (<div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2", config.bgUnread)}/>)}
    </div>);
}
/* ─── Main page ─────────────────────────────────────────────────────────────── */
export function Notifications() {
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    // Filter
    const filtered = notifications.filter((n) => {
        const matchTab = activeTab === "All" ? true :
            activeTab === "Unread" ? !n.read :
                n.category === activeTab;
        const matchSearch = !searchQuery ||
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const handleTabChange = (val) => {
        setActiveTab(val);
        setCurrentPage(1);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Notifications</h1>
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors">
            <CheckCheck size={15}/>
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tabs + search row */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 gap-4">
            {/* Tabs — raw buttons per TRX rule (tab buttons stay raw) */}
            <div className="flex items-center overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const isUnread = tab.value === "Unread";
            return (<button key={tab.value} onClick={() => handleTabChange(tab.value)} className={cn("relative flex items-center gap-2 px-3 py-3.5 text-sm font-medium whitespace-nowrap transition-colors", isActive ? "text-brand-primary" : "text-gray-500 hover:text-gray-700")}>
                    {tab.label}
                    {isUnread && unreadCount > 0 && (<span className={cn("inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold", isActive ? "bg-brand-primary text-white" : "bg-red-500 text-white")}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>)}
                    {/* Underline indicator */}
                    {isActive && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"/>)}
                  </button>);
        })}
            </div>

            {/* Search + date */}
            <div className="flex items-center gap-2 flex-shrink-0 py-2">
              <InputCustom type="text" placeholder="Search notifications" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-3 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Calendar size={13} className="text-gray-400"/>
                Select Date
              </button>
            </div>
          </div>

          {/* Notification list */}
          {paginated.length === 0 ? (<div className="py-16 text-center text-gray-400 text-sm">
              No notifications found
            </div>) : (<div>
              {paginated.map((item) => (<NotifRow key={item.id} item={item}/>))}
            </div>)}

          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>
    </div>);
}
