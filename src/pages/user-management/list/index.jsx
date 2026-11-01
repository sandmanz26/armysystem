import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Trash2, SlidersHorizontal } from "lucide-react";
import { UserFilterSidebar } from "../components/UserFilterSidebar";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { users } from "@/data/userManagement";
import { cn } from "@/lib/utils";
import { tabs, ROLES, PER_PAGE } from "./constants";
import { UserTable } from "./components/UserTable";
import { FilterPanel } from "./components/FilterPanel";
import { AddUserDrawer } from "./modals/AddUserDrawer";
import { EditUserSidebar } from "./modals/EditUserSidebar";
export function UserList({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("Overall");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editSidebar, setEditSidebar] = useState({ open: false, user: null });
    const [selected, setSelected] = useState(new Set());
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRanks, setFilterRanks] = useState(new Set());
    const [filterUnits, setFilterUnits] = useState(new Set());
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const uniqueRanks = useMemo(() => [...new Set(users.map((u) => u.rank))].sort(), []);
    const uniqueUnits = useMemo(() => [...new Set(users.map((u) => u.unitName))].sort(), []);
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const toggleRank = (r) => setFilterRanks((prev) => {
        const n = new Set(prev);
        n.has(r) ? n.delete(r) : n.add(r);
        return n;
    });
    const toggleUnit = (u) => setFilterUnits((prev) => {
        const n = new Set(prev);
        n.has(u) ? n.delete(u) : n.add(u);
        return n;
    });
    const tabCounts = useMemo(() => {
        const counts = {};
        counts["Overall"] = users.filter((u) => u.accountStatus !== "Archived").length;
        counts["Archived"] = users.filter((u) => u.accountStatus === "Archived").length;
        for (const role of ROLES) {
            counts[role] = users.filter((u) => u.userRole === role).length;
        }
        return counts;
    }, []);
    const filtered = users.filter((u) => {
        const matchesTab = activeTab === "Overall"
            ? u.accountStatus !== "Archived"
            : activeTab === "Archived"
                ? u.accountStatus === "Archived"
                : u.userRole === activeTab;
        const matchesSearch = !searchQuery ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.userId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !filterStatus || u.accountStatus === filterStatus;
        const matchesRank = filterRanks.size === 0 || filterRanks.has(u.rank);
        const matchesUnit = filterUnits.size === 0 || filterUnits.has(u.unitName);
        return matchesTab && matchesSearch && matchesStatus && matchesRank && matchesUnit;
    });
    const activeFilterCount = (filterStatus ? 1 : 0) + filterRanks.size + filterUnits.size;
    const hasActiveFilters = activeFilterCount > 0;
    const clearAllFilters = () => {
        setFilterStatus("");
        setFilterRanks(new Set());
        setFilterUnits(new Set());
    };
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const allSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map((u) => u.id)));
    const toggleOne = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="px-6 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">
            User List{" "}
            <span className="text-gray-400 font-normal text-base ml-1">
              ({filtered.length} Users)
            </span>
          </h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (<Button onClick={() => setSelected(new Set())} className="flex items-center gap-2 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm transition-colors">
                <Trash2 size={15}/>
                Delete ({selected.size})
              </Button>)}
            <Button onClick={() => setDrawerOpen(true)} className="px-4 py-2.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold shadow-sm transition-colors">
              + Add User
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs + Search */}
          <div className="flex items-center justify-between px-5 border-b border-gray-200">
            {/* Tab buttons — kept as raw buttons per TRX rules (tab selectors) */}
            <div className="flex">
              {tabs.map((tab) => {
            const count = tabCounts[tab] ?? 0;
            return (<button key={tab} onClick={() => handleTabChange(tab)} className={cn("flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap", activeTab === tab
                    ? "text-brand-primary"
                    : "text-gray-500 hover:text-gray-700")}>
                    {tab}
                    {count > 0 && (<span className={cn("inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold", activeTab === tab
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-500")}>
                        {count}
                      </span>)}
                    {activeTab === tab && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"/>)}
                  </button>);
        })}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-2 py-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <InputCustom type="text" placeholder="Search" value={searchQuery} onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
        }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              </div>

              <button onClick={() => setFilterOpen(v => !v)} title="Filters" className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-colors relative", activeFilterCount > 0 ? "border-brand-primary text-brand-primary bg-brand-primary/5" : "border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary")}>
                <SlidersHorizontal size={14}/>
                {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (<div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
              {filterStatus && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("")} className="hover:text-brand-primary-hover ml-0.5">
                    ×
                  </button>
                </span>)}
              {[...filterRanks].map((r) => (<span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                  Rank: {r}
                  <button onClick={() => toggleRank(r)} className="hover:text-brand-primary-hover ml-0.5">
                    ×
                  </button>
                </span>))}
              {[...filterUnits].map((u) => (<span key={u} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                  Unit: {u}
                  <button onClick={() => toggleUnit(u)} className="hover:text-brand-primary-hover ml-0.5">
                    ×
                  </button>
                </span>))}
            </div>)}

          {/* Table */}
          <UserTable paginated={paginated} currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} selected={selected} allSelected={allSelected} onToggleAll={toggleAll} onToggleOne={toggleOne} onPageChange={setCurrentPage} onNavigate={onNavigate} onEditUser={(user) => setEditSidebar({ open: true, user })}/>
        </div>
      </div>

      <AddUserDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>
      <EditUserSidebar open={editSidebar.open} user={editSidebar.user} onClose={() => setEditSidebar({ open: false, user: null })} onSave={(updated) => { console.log("User updated:", updated); }}/>
      <UserFilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={{ status: filterStatus ? [filterStatus] : [], rank: [...filterRanks], unit: [...filterUnits] }}
        onChange={(key, value) => {
          if (key === "status") setFilterStatus(prev => prev === value ? "" : value);
          else if (key === "rank") toggleRank(value);
          else if (key === "unit") toggleUnit(value);
        }}
        onApply={() => setFilterOpen(false)}
        onClear={clearAllFilters}
        sections={[
          { key: "status", label: "Status", options: ["Active", "Inactive", "Archived"] },
          { key: "rank", label: "Rank", options: uniqueRanks },
          { key: "unit", label: "Unit Name", options: uniqueUnits },
        ]}
      />
    </div>);
}
