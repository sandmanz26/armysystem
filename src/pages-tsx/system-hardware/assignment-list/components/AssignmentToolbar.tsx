import { Search, SlidersHorizontal } from "lucide-react";
import { InputCustom } from "@/components/input";
import { cn } from "@/lib/utils";
import { TABS, TAB_STATUS_MAP, type Tab } from "../types";
import type { Assignment } from "@/data/systemHardware";

interface AssignmentToolbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allAssignments: Assignment[];
  visibleCount: number;
  activeFilterCount?: number;
  onOpenFilters?: () => void;
}

export function AssignmentToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  allAssignments,
  visibleCount,
  activeFilterCount = 0,
  onOpenFilters,
}: AssignmentToolbarProps) {
  const tabCounts = TABS.reduce(
    (acc, tab) => {
      acc[tab] =
        tab === "Overall"
          ? allAssignments.length
          : allAssignments.filter((a) => a.status === TAB_STATUS_MAP[tab]).length;
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
                activeTab === tab ? "text-primary" : "text-body hover:text-default",
              )}
            >
              {tab}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    activeTab === tab ? "bg-primary-default text-invert-default" : "bg-disabled text-body",
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
        Section Header — Figma (5154:76248) is ONE row: "{Tab} Assignment
        List (N)" on the left, Search + Filter on the right. This row didn't
        exist at all before; the toolbar went straight from tabs to a
        Search/Select Date/Filters row (with a "Select Date" button Figma
        never has — the date range lives in the Filter drawer instead).
      */}
      <div className="flex items-center justify-between gap-4 px-5 py-5 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-default">{activeTab} Assignment List</h2>
          <span className="text-base font-semibold text-body">{visibleCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-disabled" />
            <InputCustom
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={onOpenFilters}
            className={cn(
              "flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors relative",
              activeFilterCount > 0
                ? "border-primary text-primary bg-primary-default/5"
                : "border-invert-default bg-surface text-default hover:bg-default-hovered",
            )}
          >
            <SlidersHorizontal size={14} />
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
