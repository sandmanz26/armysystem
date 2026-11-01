import { useState, useMemo } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { ranks as initialRanks } from "@/data/userManagement";
import { Search, Trash2, Check, SlidersHorizontal } from "lucide-react";
import { UserFilterSidebar } from "../components/UserFilterSidebar";
import { SortIcon, nextSort, sortBy } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "./constants";
import { RankModal } from "./components/RankModal";
import { RowMenu } from "./components/RowMenu";
export function RankPage() {
    const [ranks, setRanks] = useState(initialRanks);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [modal, setModal] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [pendingFilters, setPendingFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const creators = useMemo(() => [...new Set(ranks.map((r) => r.createdBy))], [ranks]);
    const activeFilterCount = Object.values(appliedFilters).flat().length;
    const openFilter = () => { setPendingFilters(appliedFilters); setFilterOpen(true); };
    const handleFilterChange = (key, value) => {
        setPendingFilters((prev) => {
            const cur = prev[key] ?? [];
            return { ...prev, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
        });
    };
    const handleApply = () => { setAppliedFilters(pendingFilters); setFilterOpen(false); setCurrentPage(1); };
    const handleClear = () => { setPendingFilters({}); setAppliedFilters({}); setCurrentPage(1); };
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const filtered = ranks.filter((r) => {
        if (searchQuery && !r.rank.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (appliedFilters.createdBy?.length && !appliedFilters.createdBy.includes(r.createdBy)) return false;
        return true;
    });
    const hasActiveFilters = activeFilterCount > 0;
    const sorted = sortField ? sortBy(filtered, sortField, sortDir) : filtered;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const allSelected = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
    const someSelected = paginated.some((r) => selected.has(r.id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map((r) => r.id)));
    const toggleSelect = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const handleConfirm = (rankName, sequence, _status) => {
        if (modal?.mode === "edit" && modal.rank) {
            setRanks((prev) => prev.map((r) => (r.id === modal.rank.id ? { ...r, rank: rankName, sequence } : r)));
            showSuccess("Rank updated successfully.");
        }
        else {
            const newRank = {
                id: String(Date.now()),
                sequence,
                rank: rankName,
                createdBy: "Olivia Carter",
                createdByRole: "System Admin",
                createdOn: new Date().toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                }),
            };
            setRanks((prev) => [...prev, newRank].sort((a, b) => a.sequence - b.sequence));
            showSuccess("Rank added successfully.");
        }
        setModal(null);
    };
    const handleDelete = (id) => {
        setRanks((prev) => prev.filter((r) => r.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    const handleDeleteSelected = () => {
        setRanks((prev) => prev.filter((r) => !selected.has(r.id)));
        setSelected(new Set());
    };
    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };
    const columns = useMemo(() => [
        {
            id: "select",
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            header: () => (<div className="flex items-center justify-center">
            <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={() => toggleAll()} size={16}/>
          </div>),
            cell: ({ row }) => (<div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.original.id)} onChange={() => toggleSelect(row.original.id)} size={16}/>
          </div>),
            enableSorting: false,
        },
        {
            accessorKey: "sequence",
            header: () => (<button onClick={() => handleSort("sequence")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Sequence <SortIcon active={sortField === "sequence"} dir={sortDir}/>
          </button>),
            cell: (info) => (<div className="text-sm text-gray-700">{info.getValue()}</div>),
        },
        {
            accessorKey: "rank",
            header: () => (<button onClick={() => handleSort("rank")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Rank <SortIcon active={sortField === "rank"} dir={sortDir}/>
          </button>),
            cell: (info) => (<div className="text-sm font-semibold text-gray-800">{info.getValue()}</div>),
        },
        {
            id: "createdBy",
            header: () => "Created By",
            cell: ({ row }) => (<div>
            <div className="text-sm text-gray-800">{row.original.createdBy}</div>
            <div className="text-xs text-gray-400">{row.original.createdByRole}</div>
          </div>),
            enableSorting: false,
        },
        {
            accessorKey: "createdOn",
            header: () => "Created On",
            cell: (info) => {
                const val = info.getValue();
                const parts = val.split("\n");
                return (<div>
              <div className="text-sm text-gray-800">{parts[0]}</div>
              <div className="text-xs text-gray-400">{parts[1]}</div>
            </div>);
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: () => "",
            cell: ({ row }) => (<div onClick={(e) => e.stopPropagation()}>
            <RowMenu onEdit={() => setModal({ mode: "edit", rank: row.original })} onDelete={() => handleDelete(row.original.id)}/>
          </div>),
            enableSorting: false,
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, someSelected, selected, currentPage, sortField, sortDir]);
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Success toast */}
        {successMsg && (<div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
            <Check size={16}/>
            {successMsg}
          </div>)}

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">
            Rank{" "}
            <span className="text-gray-400 font-normal text-base ml-1">
              ({ranks.length} Ranks)
            </span>
          </h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (<Button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm">
                <Trash2 size={14}/> Delete ({selected.size})
              </Button>)}
            <Button onClick={() => setModal({ mode: "add" })} className="px-4 py-2.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold shadow-sm transition-colors">
              + Add Rank
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <InputCustom type="text" placeholder="Search rank…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"/>
            </div>
            <button onClick={openFilter} title="Filters" className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-colors relative", activeFilterCount > 0 ? "border-brand-primary text-brand-primary bg-brand-primary/5" : "border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary")}>
              <SlidersHorizontal size={14}/>
              {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
              {Object.entries(appliedFilters).flatMap(([key, vals]) => vals.map(v => (
                <span key={`${key}-${v}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                  {v}
                  <button onClick={() => { const next = { ...appliedFilters, [key]: appliedFilters[key].filter(x => x !== v) }; setAppliedFilters(next); setPendingFilters(next); }} className="hover:text-brand-primary-hover ml-0.5">×</button>
                </span>
              )))}
            </div>
          )}

          <TableCustom columns={columns} data={paginated} autoScrollTable={true} classThead="bg-red-50/70"/>
          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
        </div>
      </div>

      {modal && (<RankModal mode={modal.mode} rank={modal.rank} onClose={() => setModal(null)} onConfirm={handleConfirm}/>)}
      <UserFilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
        sections={[{ key: "createdBy", label: "Created By", options: creators }]}
      />
    </div>);
}
