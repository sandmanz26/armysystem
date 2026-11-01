import { useState } from "react";
import { MoreVertical, Calendar, Filter, ChevronDown } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
const USER = {
    name: "Mia Murphy",
    userId: "#250101-USR199",
    role: "System Admin",
    status: "Active",
    rank: "REC",
    svcId: "*****341A",
    unitName: "SAR1",
    createdOn: "21 Apr 2026 (01:17:42 PM)",
};
const TABS = ["User Details", "Bookings", "Training Results", "Activities"];
const BOOKINGS_DATA = [
    { no: 1, id: "BK-250101-001", type: "Marksmanship", time: "09:00 AM – 12:00 PM", date: "17 Jan 2025", status: "Completed", mode: "SAR21" },
    { no: 2, id: "BK-250101-002", type: "Collective", time: "01:00 PM – 05:00 PM", date: "22 Jan 2025", status: "Completed", mode: "Component Type A" },
    { no: 3, id: "BK-250101-003", type: "Judgemental", time: "09:00 AM – 11:00 AM", date: "30 Jan 2025", status: "Ongoing", mode: "15 Scenarios" },
    { no: 4, id: "BK-250101-004", type: "Marksmanship", time: "02:00 PM – 05:00 PM", date: "10 Feb 2025", status: "Upcoming", mode: "LMG" },
];
const BOOKING_SUB_TABS = ["Upcoming", "Ongoing", "Return Assets", "Completed"];
const RESULTS_DATA = [
    { no: 1, id: "BK-250101-001", type: "Marksmanship", date: "17 Jan 2025", weapon: "SAR21", score: "88/100", result: "Pass" },
    { no: 2, id: "BK-250101-002", type: "Collective", date: "22 Jan 2025", weapon: "Component Type A", score: "—", result: "Pass" },
];
const ACTIVITIES_DATA = [
    { no: 1, action: "Booking Created", module: "Booking Management", date: "22 Jan 2025, 09:14 AM", desc: "Created booking BK-250101-002 for Collective training" },
    { no: 2, action: "Nominal Roll Uploaded", module: "Booking Management", date: "22 Jan 2025, 08:55 AM", desc: "Uploaded nominal roll for booking BK-250101-002 (28 trainees)" },
    { no: 3, action: "Training Completed", module: "Training Performance", date: "17 Jan 2025, 12:04 PM", desc: "Marksmanship session BK-250101-001 ended successfully" },
    { no: 4, action: "Asset Issued", module: "System Hardware", date: "17 Jan 2025, 08:40 AM", desc: "SAR21 × 15 issued to Base Station 2 for BK-250101-001" },
    { no: 5, action: "User Login", module: "System", date: "17 Jan 2025, 08:30 AM", desc: "Logged into TOMS from Pulau Thornton Camp terminal" },
    { no: 6, action: "Booking Created", module: "Booking Management", date: "10 Jan 2025, 03:22 PM", desc: "Created booking BK-250101-001 for Marksmanship training" },
];
// ── Status badge helpers ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const styles = {
        Completed: "bg-green-50 text-green-700 border-green-200",
        Ongoing: "bg-blue-50 text-blue-700 border-blue-200",
        Upcoming: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Pass: "bg-green-50 text-green-700 border-green-200",
        Fail: "bg-red-50 text-red-700 border-red-200",
    };
    return (<span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
      {status}
    </span>);
}
// ── Column helpers ─────────────────────────────────────────────────────────────
const bookingColHelper = createColumnHelper();
const resultColHelper = createColumnHelper();
const activityColHelper = createColumnHelper();
const bookingColumns = [
    bookingColHelper.accessor("no", { header: () => "No", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    bookingColHelper.accessor("id", { header: () => "Booking ID", cell: (info) => <div className="text-sm text-brand-primary font-medium">{info.getValue()}</div> }),
    bookingColHelper.accessor("type", { header: () => "Training Type", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    bookingColHelper.accessor("time", { header: () => "Booking Time", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    bookingColHelper.accessor("status", { header: () => "Status", cell: (info) => <StatusBadge status={info.getValue()}/> }),
    bookingColHelper.accessor("mode", { header: () => "Training Mode", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
];
const resultColumns = [
    resultColHelper.accessor("no", { header: () => "No", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    resultColHelper.accessor("id", { header: () => "Booking ID", cell: (info) => <div className="text-sm text-brand-primary font-medium">{info.getValue()}</div> }),
    resultColHelper.accessor("type", { header: () => "Training Type", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    resultColHelper.accessor("date", { header: () => "Date", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    resultColHelper.accessor("weapon", { header: () => "Weapon / Mode", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    resultColHelper.accessor("score", { header: () => "Score", cell: (info) => <div className="text-sm font-semibold text-gray-800">{info.getValue()}</div> }),
    resultColHelper.accessor("result", { header: () => "Result", cell: (info) => <StatusBadge status={info.getValue()}/> }),
];
const activityColumns = [
    activityColHelper.accessor("no", { header: () => "No", cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div> }),
    activityColHelper.accessor("action", { header: () => "Action", cell: (info) => <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{info.getValue()}</div> }),
    activityColHelper.accessor("module", {
        header: () => "Module",
        cell: (info) => (<div onClick={() => { }}>
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap">{info.getValue()}</span>
      </div>),
    }),
    activityColHelper.accessor("date", { header: () => "Date", cell: (info) => <div className="text-xs text-gray-500 whitespace-nowrap">{info.getValue()}</div> }),
    activityColHelper.accessor("desc", { header: () => "Description", cell: (info) => <div className="text-sm text-gray-600">{info.getValue()}</div> }),
];
// ── Tabs ──────────────────────────────────────────────────────────────────────
function UserDetailsTab() {
    return (<div className="py-6">
      <h2 className="text-base font-bold text-gray-900 mb-6">User Details</h2>
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        <div className="pr-8 space-y-5">
          {[["Rank", USER.rank], ["Name", USER.name], ["Created on", USER.createdOn]].map(([label, val]) => (<div key={label}>
              <div className="text-sm text-gray-500 mb-0.5">{label}</div>
              <div className="text-sm font-bold text-gray-900">{val}</div>
            </div>))}
          <div>
            <div className="text-sm text-gray-500 mb-0.5">Status</div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">{USER.status}</span>
          </div>
        </div>
        <div className="px-8 space-y-5">
          {[["User ID", USER.userId], ["Service ID", USER.svcId], ["Role", USER.role]].map(([label, val]) => (<div key={label}>
              <div className="text-sm text-gray-500 mb-0.5">{label}</div>
              <div className="text-sm font-bold text-gray-900">{val}</div>
            </div>))}
        </div>
        <div className="pl-8 space-y-5">
          <div>
            <div className="text-sm text-gray-500 mb-0.5">Unit Name</div>
            <div className="text-sm font-bold text-gray-900">{USER.unitName}</div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-200"/>
    </div>);
}
function BookingsTab() {
    const [subTab, setSubTab] = useState("Upcoming");
    const [search, setSearch] = useState("");
    const subMap = { Upcoming: "Upcoming", Ongoing: "Ongoing", "Return Assets": "Return Assets", Completed: "Completed" };
    const filtered = BOOKINGS_DATA.filter((b) => {
        const matchTab = subTab === "Return Assets" ? false : b.status === subMap[subTab];
        const matchSearch = !search || b.id.toLowerCase().includes(search.toLowerCase()) || b.type.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });
    return (<div className="py-5">
      {/* Sub-tabs — raw buttons per TRX rule (tab buttons stay raw) */}
      <div className="flex border-b border-gray-200 mb-5">
        {BOOKING_SUB_TABS.map((t) => (<button key={t} type="button" onClick={() => setSubTab(t)} className={cn("px-4 py-2.5 text-sm font-medium relative transition-colors", subTab === t ? "text-brand-primary" : "text-gray-400 hover:text-gray-600")}>
            {t}
            {subTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"/>}
          </button>))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">{subTab} booking list ({filtered.length})</h3>
        <div className="flex items-center gap-2">
          <InputCustom type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="py-1.5 px-3 text-xs border border-gray-200 rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-brand-primary"/>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50">
            <Calendar size={13}/> Select Date
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50">
            <Filter size={13}/> Filters <ChevronDown size={12}/>
          </button>
        </div>
      </div>

      <TableCustom columns={bookingColumns} data={filtered} autoScrollTable={true}/>
    </div>);
}
function TrainingResultsTab() {
    const [search, setSearch] = useState("");
    const filtered = RESULTS_DATA.filter((r) => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));
    return (<div className="py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Training Results</h3>
        <div className="flex items-center gap-2">
          <InputCustom type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="py-1.5 px-3 text-xs border border-gray-200 rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-brand-primary"/>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50">
            <Calendar size={13}/> Select Date
          </button>
        </div>
      </div>

      <TableCustom columns={resultColumns} data={filtered} autoScrollTable={true}/>
    </div>);
}
function ActivitiesTab() {
    return (<div className="py-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Activities</h3>
      <TableCustom columns={activityColumns} data={ACTIVITIES_DATA} autoScrollTable={true}/>
    </div>);
}
// ── Main ──────────────────────────────────────────────────────────────────────
export function UserDetail({ onNavigate: _onNavigate }) {
    const [activeTab, setActiveTab] = useState("User Details");
    return (<div className="flex-1 overflow-auto bg-white">
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{USER.name}</h1>
            <div className="text-sm text-gray-500 mt-1">User ID - {USER.userId}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">{USER.role}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">{USER.status}</span>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
            <MoreVertical size={18}/>
          </button>
        </div>

        <div className="border-b border-gray-200 flex mt-6">
          {TABS.map((tab) => (<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("px-4 py-3 text-sm font-medium relative transition-colors", activeTab === tab ? "text-brand-primary" : "text-gray-400 hover:text-gray-600")}>
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"/>}
            </button>))}
        </div>

        {activeTab === "User Details" && <UserDetailsTab />}
        {activeTab === "Bookings" && <BookingsTab />}
        {activeTab === "Training Results" && <TrainingResultsTab />}
        {activeTab === "Activities" && <ActivitiesTab />}
      </div>
    </div>);
}
