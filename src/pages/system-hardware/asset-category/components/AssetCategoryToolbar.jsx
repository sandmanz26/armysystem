import { Search } from "lucide-react";
export function AssetCategoryToolbar({ searchQuery, onSearchChange }) {
    return (<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
      </div>
    </div>);
}
