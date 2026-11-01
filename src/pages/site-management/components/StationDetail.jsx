import { useState, useMemo } from "react";
import { Search, Download, Eye, Check, ChevronRight, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon, nextSort, sortBy } from "@/lib/sortUtils";
import { CalendarX, X } from "lucide-react";
import { LANE_PER_PAGE } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { LaneRowMenu } from "./LaneRowMenu";
import { AddLaneModal } from "../modals/AddLaneModal";
import { AddBlackoutModal } from "../modals/AddBlackoutModal";
export function StationDetail({ station, onBack, onViewLane, }) {
    const [activeTab, setActiveTab] = useState("details");
    const [lanes, setLanes] = useState(station.lanes);
    const [blackoutDates, setBlackoutDates] = useState(station.blackoutDates);
    const [laneSearch, setLaneSearch] = useState("");
    const [lanePage, setLanePage] = useState(1);
    const [successMsg, setSuccessMsg] = useState("");
    const [showAddBlackout, setShowAddBlackout] = useState(false);
    const [laneSortField, setLaneSortField] = useState("");
    const [laneSortDir, setLaneSortDir] = useState("asc");
    const [laneSelected, setLaneSelected] = useState(new Set());
    const [showAddLane, setShowAddLane] = useState(false);
    const filteredLanes = useMemo(() => lanes.filter(l => !laneSearch || l.name.toLowerCase().includes(laneSearch.toLowerCase())), [lanes, laneSearch]);
    const handleLaneSort = (field) => {
        const s = nextSort(laneSortField, field, laneSortDir);
        setLaneSortField(s.field);
        setLaneSortDir(s.dir);
        setLanePage(1);
    };
    const sortedLanes = laneSortField ? sortBy(filteredLanes, laneSortField, laneSortDir) : filteredLanes;
    const laneTotalPages = Math.max(1, Math.ceil(sortedLanes.length / LANE_PER_PAGE));
    const paginatedLanes = sortedLanes.slice((lanePage - 1) * LANE_PER_PAGE, lanePage * LANE_PER_PAGE);
    const allLanesSelected = paginatedLanes.length > 0 && paginatedLanes.every(l => laneSelected.has(l.id));
    const someLanesSelected = paginatedLanes.some(l => laneSelected.has(l.id));
    const toggleAllLanes = () => setLaneSelected(allLanesSelected ? new Set() : new Set(paginatedLanes.map(l => l.id)));
    const toggleLane = (id) => setLaneSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };
    const handleToggleLane = (id) => {
        setLanes(prev => prev.map(l => l.id === id ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" } : l));
        showSuccess("Lane status updated.");
    };
    const handleDeleteLane = (id) => { setLanes(prev => prev.filter(l => l.id !== id)); showSuccess("Lane removed."); };
    const handleAddLane = (name) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLanes(prev => [...prev, {
                id: `lane-${Date.now()}`,
                name,
                status: "Active",
                blackoutDates: [],
                lastUpdatedOn: `${dateStr}\n${timeStr}`,
            }]);
        showSuccess("Lane added successfully.");
    };
    const lastUpdatedDate = station.lastUpdatedOn.split("\n")[0];
    const laneColumns = useMemo(() => [
        {
            id: "select",
            header: () => (<Checkbox size={16} checked={allLanesSelected} indeterminate={someLanesSelected && !allLanesSelected} onChange={toggleAllLanes}/>),
            cell: ({ row }) => (<Checkbox size={16} checked={laneSelected.has(row.original.id)} onChange={() => toggleLane(row.original.id)}/>),
        },
        {
            accessorKey: "name",
            header: () => (<button onClick={() => handleLaneSort("name")} className="flex items-center gap-1 hover:text-brand-primary-hover">
          <Search size={12} className="text-gray-400"/> Lane <SortIcon active={laneSortField === "name"} dir={laneSortDir}/>
        </button>),
            cell: ({ row, getValue }) => (<div className="cursor-pointer" onClick={() => onViewLane(row.original)}>
          <span className="text-sm font-medium text-gray-800">{getValue()}</span>
        </div>),
        },
        {
            accessorKey: "status",
            header: () => "Status",
            cell: ({ row, getValue }) => (<div className="cursor-pointer" onClick={() => onViewLane(row.original)}>
          <StatusBadge status={getValue()}/>
        </div>),
        },
        {
            id: "blackoutDates",
            header: () => "Blackout Date",
            cell: ({ row }) => (row.original.blackoutDates.length > 0 ? (<div className="flex flex-col gap-0.5">
            {row.original.blackoutDates.map((d, i) => (<span key={i} className="text-sm text-gray-700">{d}</span>))}
          </div>) : <span className="text-gray-300 text-sm">—</span>),
        },
        {
            id: "lastUpdatedOn",
            header: () => "Last Updated On",
            cell: ({ row }) => (<div className="cursor-pointer" onClick={() => onViewLane(row.original)}>
          <div className="text-sm text-gray-800">{row.original.lastUpdatedOn.split("\n")[0]}</div>
          <div className="text-xs text-gray-400">{row.original.lastUpdatedOn.split("\n")[1]}</div>
        </div>),
        },
        {
            id: "actions",
            header: () => "",
            cell: ({ row }) => (<div className="flex items-center justify-center gap-1">
          <button onClick={() => onViewLane(row.original)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors">
            <Eye size={14}/>
          </button>
          <LaneRowMenu onToggle={() => handleToggleLane(row.original.id)} onDelete={() => handleDeleteLane(row.original.id)}/>
        </div>),
        },
    ], [allLanesSelected, someLanesSelected, laneSelected, laneSortField, laneSortDir]);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {successMsg && (<div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
            <Check size={16}/>{successMsg}
          </div>)}

        <nav className="flex items-center gap-1.5 text-sm mb-5">
          <button onClick={onBack} className="text-gray-500 hover:text-brand-primary transition-colors">
            Site Management
          </button>
          <ChevronRight size={14} className="text-gray-400"/>
          <span className="text-brand-primary font-medium">Base Station Details</span>
        </nav>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-6 pt-5 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-gray-900">{station.name}</h1>
                <StatusBadge status={station.status}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">Last updated on: {lastUpdatedDate}</p>
            </div>
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5">
              <MoreVertical size={16}/>
            </button>
          </div>

          <div className="flex border-b border-gray-200 px-6">
            {([
            { key: "details", label: "Base Station Details" },
            { key: "blackout", label: "Blackout Dates" },
        ]).map(({ key, label }) => (<button key={key} onClick={() => setActiveTab(key)} className={cn("px-1 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors -mb-px", activeTab === key ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-gray-600")}>
                {label}
              </button>))}
          </div>

          {activeTab === "details" && (<>
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 mb-4">Base Station Details</h2>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="pr-6">
                    <p className="text-xs text-gray-400">Base Station</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{station.name}</p>
                    <p className="text-xs text-gray-400 mt-3">Status</p>
                    <div className="mt-1"><StatusBadge status={station.status}/></div>
                  </div>
                  <div className="px-6">
                    <p className="text-xs text-gray-400">Lane</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">Lane</p>
                  </div>
                  <div className="pl-6">
                    <p className="text-xs text-gray-400">Blackout Dates</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{blackoutDates.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800">
                    Lane <span className="text-gray-400 font-normal">({lanes.length} Lanes)</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <InputCustom value={laneSearch} onChange={e => { setLaneSearch(e.target.value); setLanePage(1); }} placeholder="Search" className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
                    </div>
                    <Button type="outline" className="flex items-center gap-2 px-3.5 py-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold w-auto">
                      <Download size={13}/> Export
                    </Button>
                    <Button onClick={() => setShowAddLane(true)} className="flex items-center gap-2 px-3.5 py-2 text-sm bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold w-auto">
                      Add Lane
                    </Button>
                  </div>
                </div>

                <TableCustom columns={laneColumns} data={paginatedLanes} autoScrollTable={true}/>
                <Pagination currentPage={lanePage} itemsPerPage={LANE_PER_PAGE} totalItems={sortedLanes.length} setCurrentPage={setLanePage}/>
              </div>
            </>)}

          {activeTab === "blackout" && (<div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">
                  Blackout Dates <span className="text-gray-400 font-normal ml-1">({blackoutDates.length})</span>
                </h2>
                <Button onClick={() => setShowAddBlackout(true)} className="flex items-center gap-2 px-3.5 py-2 text-sm bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold w-auto">
                  <Plus size={13}/> Add Date
                </Button>
              </div>
              {blackoutDates.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CalendarX size={36} className="mb-3 opacity-30"/>
                  <p className="text-sm font-medium">No blackout dates configured</p>
                  <p className="text-xs mt-1">Add dates when this station is unavailable</p>
                </div>) : (<div className="divide-y divide-gray-50">
                  {blackoutDates.map((d, i) => (<div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                          <CalendarX size={15} className="text-orange-500"/>
                        </div>
                        <span className="text-sm text-gray-800 font-medium">{d.label}</span>
                      </div>
                      <button onClick={() => setBlackoutDates(prev => prev.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={14}/>
                      </button>
                    </div>))}
                </div>)}
            </div>)}
        </div>
      </div>

      {showAddLane && (<AddLaneModal onClose={() => setShowAddLane(false)} onAdd={handleAddLane}/>)}
      {showAddBlackout && (<AddBlackoutModal onClose={() => setShowAddBlackout(false)} onConfirm={label => {
                setBlackoutDates(prev => [...prev, { label }]);
                showSuccess("Blackout date added successfully.");
            }}/>)}
    </div>);
}
