import { useState } from "react";
import { assets } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { AssetsToolbar } from "./components/AssetsToolbar";
import { AssetsTable } from "./components/AssetsTable";
import { FilterDrawer } from "./components/FilterDrawer";
import { EditAssetModal } from "./modals/EditAssetModal";
import { TAB_STATUS_MAP } from "./types";

export function AssetsList({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("Overall");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingAsset, setEditingAsset] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [pendingFilters, setPendingFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});

    const handleFilterChange = (key, value) => {
        setPendingFilters((prev) => {
            const cur = prev[key] ?? [];
            return { ...prev, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
        });
    };

    const handleApply = () => { setAppliedFilters(pendingFilters); setShowFilters(false); setCurrentPage(1); };
    const handleClear = () => { setPendingFilters({}); setAppliedFilters({}); setCurrentPage(1); };
    const openFilters = () => { setPendingFilters(appliedFilters); setShowFilters(true); };

    const activeFilterCount = Object.values(appliedFilters).flat().length;

    const tabFiltered = activeTab === "Overall" || activeTab === "No RFI"
        ? assets
        : assets.filter((a) => a.status === TAB_STATUS_MAP[activeTab]);

    const filtered = tabFiltered.filter((a) => {
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (appliedFilters.assetType?.length && !appliedFilters.assetType.includes(a.assetType)) return false;
        if (appliedFilters.assetCategory?.length && !appliedFilters.assetCategory.includes(a.assetCategory)) return false;
        return true;
    });

    const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); };
    const handleSearchChange = (q) => { setSearchQuery(q); setCurrentPage(1); };

    return (
        <div className="flex-1 overflow-auto bg-gray-50">
            {editingAsset && (<EditAssetModal asset={editingAsset} onClose={() => setEditingAsset(null)}/>)}

            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-brand-primary">Asset List</h1>
                    <Button onClick={() => onNavigate?.("/system-hardware/asset-creation")} className="flex items-center w-fit gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors">
                        <span className="text-base leading-none">+</span>
                        Add Asset
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <AssetsToolbar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onOpenFilters={openFilters}
                        allAssets={assets}
                        dateRange={dateRange}
                        onDateChange={(v) => { setDateRange(v); setCurrentPage(1); }}
                        onDateClear={() => { setDateRange({ from: "", to: "" }); setCurrentPage(1); }}
                        activeFilterCount={activeFilterCount}
                    />
                    <AssetsTable data={filtered} currentPage={currentPage} onPageChange={setCurrentPage} onEdit={(asset) => setEditingAsset(asset)} onNavigate={onNavigate}/>
                </div>
            </div>

            <FilterDrawer
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={pendingFilters}
                onChange={handleFilterChange}
                onApply={handleApply}
                onClear={handleClear}
            />
        </div>
    );
}
