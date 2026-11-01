import { useState, useMemo } from "react";
import { Search, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon, nextSort, sortBy } from "@/lib/sortUtils";
import { baseStations as initialStations } from "@/data/siteManagement";
import { PER_PAGE } from "../constants";
import { StatusBadge } from "./StatusBadge";
import { BlackoutTooltip } from "./BlackoutTooltip";
import { StationRowMenu } from "./StationRowMenu";
import { AddBaseStationModal } from "../modals/AddBaseStationModal";
export function StationList({ onView }) {
    const [stations, setStations] = useState(initialStations);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const filtered = useMemo(() => stations.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())), [stations, searchQuery]);
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const sorted = sortField ? sortBy(filtered, sortField, sortDir) : filtered;
    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const allSelected = paginated.length > 0 && paginated.every(s => selected.has(s.id));
    const someSelected = paginated.some(s => selected.has(s.id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map(s => s.id)));
    const toggleSelect = (id) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    const getLaneSummary = (station) => {
        if (station.lanes.length === 0)
            return [{ label: "0 Lanes", status: "Active" }];
        const active = station.lanes.filter(l => l.status === "Active").length;
        const inactive = station.lanes.filter(l => l.status === "Inactive").length;
        const result = [];
        if (active > 0)
            result.push({ label: `${active} Lane${active !== 1 ? "s" : ""}`, status: "Active" });
        if (inactive > 0)
            result.push({ label: `${inactive} Lane${inactive !== 1 ? "s" : ""}`, status: "Inactive" });
        return result;
    };
    const handleAddStation = (name) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setStations(prev => [...prev, {
                id: `st-${Date.now()}`,
                name,
                status: "Active",
                lanes: [],
                blackoutDates: [],
                lastUpdatedOn: `${dateStr}\n${timeStr}`,
            }]);
    };
    const columns = useMemo(() => [
        {
            id: "select",
            header: () => (<Checkbox size={16} checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll}/>),
            cell: ({ row }) => (<div onClick={e => e.stopPropagation()}>
          <Checkbox size={16} checked={selected.has(row.original.id)} onChange={() => toggleSelect(row.original.id)}/>
        </div>),
        },
        {
            id: "no",
            header: () => "No",
            cell: ({ row }) => (<div className="cursor-pointer" onClick={() => onView(row.original)}>
          <span className="text-sm text-gray-600">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>
        </div>),
        },
        {
            accessorKey: "name",
            header: () => (<button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-brand-primary-hover">
          <Search size={12} className="text-gray-400"/> Base Station <SortIcon active={sortField === "name"} dir={sortDir}/>
        </button>),
            cell: ({ row, getValue }) => (<div className="cursor-pointer" onClick={() => onView(row.original)}>
          <span className="text-sm font-semibold text-gray-800 hover:text-brand-primary">{getValue()}</span>
        </div>),
        },
        {
            accessorKey: "status",
            header: () => "Status",
            cell: ({ row, getValue }) => (<div className="cursor-pointer" onClick={() => onView(row.original)}>
          <StatusBadge status={getValue()}/>
        </div>),
        },
        {
            id: "lane",
            header: () => "Lane",
            cell: ({ row }) => (<div className="cursor-pointer" onClick={() => onView(row.original)}>
          <div className="flex flex-col gap-1">
            {getLaneSummary(row.original).map((s, i) => (<div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span>{s.label}</span>
                {s.label !== "0 Lanes" && <StatusBadge status={s.status}/>}
              </div>))}
          </div>
        </div>),
        },
        {
            id: "blackoutDates",
            header: () => "Blackout Date",
            cell: ({ row }) => (<div onClick={e => e.stopPropagation()}>
          {row.original.blackoutDates.length > 0
                    ? <BlackoutTooltip dates={row.original.blackoutDates.map((d) => d.label)}/>
                    : <span className="text-gray-300 text-sm">—</span>}
        </div>),
        },
        {
            id: "lastUpdatedOn",
            header: () => "Last Updated On",
            cell: ({ row }) => (<div className="cursor-pointer" onClick={() => onView(row.original)}>
          <div className="text-sm text-gray-800">{row.original.lastUpdatedOn.split("\n")[0]}</div>
          <div className="text-xs text-gray-400">{row.original.lastUpdatedOn.split("\n")[1]}</div>
        </div>),
        },
        {
            id: "actions",
            header: () => "",
            cell: ({ row }) => (<div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => onView(row.original)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors">
            <Eye size={15}/>
          </button>
          <StationRowMenu onEdit={() => { }} onDelete={() => setStations(prev => prev.filter(s => s.id !== row.original.id))}/>
        </div>),
        },
    ], [allSelected, someSelected, selected, currentPage, sortField, sortDir]);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-800">Site Management</h1>
          <div className="flex items-center gap-3">
            <Button type="outline" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold w-auto">
              <Download size={14}/> Export
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold w-auto shadow-sm">
              Add Base Station
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">
              Base Station <span className="text-gray-500 font-normal">({stations.length} Base Stations)</span>
            </h2>
            <div className="flex items-center gap-3">
              {selected.size > 0 && (<Button type="outline" onClick={() => { setStations(prev => prev.filter(s => !selected.has(s.id))); setSelected(new Set()); }} className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 border-0 w-auto px-0 py-0">
                  <Trash2 size={14}/> Delete
                </Button>)}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <InputCustom value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search" className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              </div>
            </div>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={true}/>
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={sorted.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>

      {showAddModal && (<AddBaseStationModal onClose={() => setShowAddModal(false)} onAdd={handleAddStation}/>)}
    </div>);
}
