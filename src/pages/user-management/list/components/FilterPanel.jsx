export function FilterPanel({ filterStatus, filterRanks, filterUnits, uniqueRanks, uniqueUnits, hasActiveFilters, onSetFilterStatus, onToggleRank, onToggleUnit, onClearAll, }) {
    return (<div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">Filters</span>
        {hasActiveFilters && (<button onClick={onClearAll} className="text-xs text-brand-primary hover:underline">
            Clear all
          </button>)}
      </div>

      {/* Status section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {["Active", "Inactive"].map((s) => (<button key={s} onClick={() => onSetFilterStatus(filterStatus === s ? "" : s)} className={filterStatus === s
                ? "px-3 py-1.5 text-xs rounded-full border border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                : "px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors"}>
              {s}
            </button>))}
        </div>
      </div>

      {/* Rank section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Rank</p>
        <div className="flex flex-wrap gap-1.5">
          {uniqueRanks.map((r) => (<button key={r} onClick={() => onToggleRank(r)} className={filterRanks.has(r)
                ? "px-3 py-1.5 text-xs rounded-full border border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                : "px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors"}>
              {r}
            </button>))}
        </div>
      </div>

      {/* Unit Name section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Unit Name</p>
        <div className="flex flex-wrap gap-1.5">
          {uniqueUnits.map((u) => (<button key={u} onClick={() => onToggleUnit(u)} className={filterUnits.has(u)
                ? "px-3 py-1.5 text-xs rounded-full border border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                : "px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors"}>
              {u}
            </button>))}
        </div>
      </div>
    </div>);
}
