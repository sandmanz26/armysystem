import { Search, Filter } from "lucide-react";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
import { TABS, TAB_STATUS_MAP, type Tab } from "../types";
import type { Asset } from "@/data/systemHardware";

interface AssetsToolbarProps {
  /** Rows moved to the Archived tab. */
  archivedCount?: number;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
  allAssets: Asset[];
}

export function AssetsToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenFilters,
  activeFilterCount = 0,
  allAssets,
  archivedCount = 0,
}: AssetsToolbarProps) {
  const hasNoRfid = (a: (typeof allAssets)[number]) =>
    (a.rfidTag1Status ?? "No RFID") === "No RFID" && (a.rfidTag2Status ?? "No RFID") === "No RFID";

  const tabCounts = TABS.reduce(
    (acc, tab) => {
      acc[tab] =
        tab === "Overall"
          ? allAssets.length
          : tab === "Archived"
            ? archivedCount
            : tab === "No RFID"
              ? allAssets.filter(hasNoRfid).length
              : allAssets.filter((a) => a.status === TAB_STATUS_MAP[tab]).length;
      return acc;
    },
    {} as Record<Tab, number>,
  );

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-invert-default overflow-x-auto">
        {TABS.map((tab) => {
          const count = tabCounts[tab] ?? 0;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                activeTab === tab
                  ? "text-primary"
                  : "text-body hover:text-default",
              )}
            >
              {tab}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    activeTab === tab
                      ? "bg-primary-default text-invert-default"
                      : "bg-disabled text-body",
                  )}
                >
                  {count}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-default rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/*
        Section Header — Figma's `Section Header` (5133:38648) is ONE row:
        "Overall Assets 32" on the left and Search + Filter on the right,
        vertically centered together. This used to be two stacked rows —
        title above, search/filter below on their own line.
      */}
      <div className="flex items-center justify-between gap-4 px-5 py-5 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-default">{activeTab} Assets</h2>
          <span className="text-base font-semibold text-body">{tabCounts[activeTab] ?? 0}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-disabled"
            />
            <InputCustom
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-md w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          {/*
            No "Select Date" button. Figma moved the date range INTO the filter
            drawer (`Drawer - Filter` 5133:51362 opens with a Date From/To
            pair), so a second date control out here would be a duplicate.
          */}
          <button
            onClick={onOpenFilters}
            className={cn(
              "flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors",
              activeFilterCount > 0
                ? "border-primary text-primary bg-primary-default/5"
                : "border-invert-default bg-surface text-default hover:border-primary hover:text-primary"
            )}
          >
            <Filter size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-default text-invert-default text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
