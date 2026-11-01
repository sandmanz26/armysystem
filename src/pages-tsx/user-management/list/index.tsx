import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { users as seedUsers } from "@/data/userManagement";
import type { User, UserRoleType } from "@/data/userManagement";
import { cn } from "@/lib/utils";
import { tabs, ROLES, PER_PAGE, COMPANY_NAMES } from "./constants";
import type { AddUserFormValues, TabType, UserListProps } from "./types";
import { UserTable } from "./components/UserTable";
import { FilterPanel } from "./components/FilterPanel";
import { AddUserDrawer } from "./modals/AddUserDrawer";

export function UserList({ onNavigate }: UserListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Overall");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterRanks, setFilterRanks] = useState<Set<string>>(new Set());
  const [filterUnits, setFilterUnits] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  // Local copy so Add User / Move to Archive change the list (mock data, no API).
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [archiveTarget, setArchiveTarget] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  const companyOptions = useMemo(
    () =>
      [...new Set([...COMPANY_NAMES, ...users.map((u) => u.companyName ?? "").filter(Boolean)])].sort(),
    [users],
  );

  const handleArchive = useCallback((u: User) => setArchiveTarget(u), []);

  const confirmArchive = () => {
    if (!archiveTarget) return;
    const name = archiveTarget.name;
    setUsers((prev) =>
      prev.map((u) => (u.id === archiveTarget.id ? { ...u, accountStatus: "Archived" } : u)),
    );
    setArchiveTarget(null);
    // Figma `Toast - Success` (5157:101519): "{Name} moved to archive".
    setToast(`${name} moved to archive`);
  };

  const handleCreate = (v: AddUserFormValues) => {
    setUsers((prev) => {
      const n = prev.length + 1;
      const newUser: User = {
        id: `new-${Date.now()}`,
        userId: `250101-USR${String(200 + n).padStart(3, "0")}`,
        rank: v.rank,
        name: v.name.trim(),
        svcId: `*****${v.svcId.trim().slice(-4).toUpperCase()}`,
        // Unit Name is no longer captured (Figma replaced it with Company Name).
        unitName: "",
        companyName: v.companyName || undefined,
        armskotePersonnel: v.role === "Operator" ? v.armskotePersonnel : undefined,
        userRole: v.role as UserRoleType,
        accountStatus: "Active",
      };
      return [newUser, ...prev];
    });
    // Figma `Toast - Success` (5014:9300): "{Name} added".
    setToast(`${v.name.trim()} added`);
  };

  const uniqueRanks = useMemo(() => [...new Set(users.map((u) => u.rank))].sort(), [users]);
  const uniqueUnits = useMemo(
    () => [...new Set(users.map((u) => u.unitName).filter(Boolean))].sort(),
    [users],
  );

  const toggleRank = (r: string) =>
    setFilterRanks((prev) => {
      const n = new Set(prev);
      n.has(r) ? n.delete(r) : n.add(r);
      return n;
    });

  const toggleUnit = (u: string) =>
    setFilterUnits((prev) => {
      const n = new Set(prev);
      n.has(u) ? n.delete(u) : n.add(u);
      return n;
    });

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    counts["Overall"] = users.filter((u) => u.accountStatus !== "Archived").length;
    counts["Archived"] = users.filter((u) => u.accountStatus === "Archived").length;
    for (const role of ROLES) {
      counts[role] = users.filter((u) => u.userRole === role && u.accountStatus !== "Archived").length;
    }
    return counts;
  }, [users]);

  const filtered = users.filter((u) => {
    const matchesTab =
      activeTab === "Overall"
        ? u.accountStatus !== "Archived"
        : activeTab === "Archived"
        ? u.accountStatus === "Archived"
        : u.userRole === (activeTab as UserRoleType) && u.accountStatus !== "Archived";
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || u.accountStatus === filterStatus;
    const matchesRank = filterRanks.size === 0 || filterRanks.has(u.rank);
    const matchesUnit = filterUnits.size === 0 || filterUnits.has(u.unitName);
    return matchesTab && matchesSearch && matchesStatus && matchesRank && matchesUnit;
  });

  const activeFilterCount =
    (filterStatus ? 1 : 0) + filterRanks.size + filterUnits.size;
  const hasActiveFilters = activeFilterCount > 0;
  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterRanks(new Set());
    setFilterUnits(new Set());
  };

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Page header — Figma `Page Header` + `Button Primary` (121x40) */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold text-default whitespace-nowrap">User List</h1>
          <Button
            onClick={() => setDrawerOpen(true)}
            className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
          >
            <Icon name="plus" size={18} />
            Add User
          </Button>
        </div>

        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          {/* Tab Group v2 — own full-width row, 44px tall, count badge per tab */}
          {/* Figma `Tab Group v2`: 20px side padding, items 16px padding, 6px gap. */}
          <div className="flex overflow-x-auto border-b border-invert-default px-5">
            {tabs.map((tab) => {
              const count = tabCounts[tab] ?? 0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "relative flex items-center gap-1.5 h-11 px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive ? "text-primary" : "text-body hover:text-default",
                  )}
                >
                  {tab}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full border border-surface text-xs font-semibold",
                      isActive
                        ? "bg-primary-default text-invert-default"
                        : "bg-disabled text-body",
                    )}
                  >
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary-default" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Header — title + (N users) left, Search + Filter right */}
          <div className="flex items-center justify-between gap-5 p-5">
            {/* Figma Section Header (7010:542599 / 5014:9093): "<Tab> Users" + bare count, both 16 Semi Bold. */}
            <h2 className="flex items-center gap-2 text-base font-semibold leading-6 text-default">
              {activeTab === "Archived" ? "Archived Users" : `${activeTab} Users`}
              <span className="text-body">{filtered.length}</span>
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative w-60">
                <Icon
                  name="search"
                  size={22}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 pl-[42px] pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                />
              </div>

              {/* Filter — Figma 91x36, surface fill, border/invert/default, r8, 8/16 */}
              <button
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-sm transition-colors",
                  activeFilterCount > 0
                    ? "border-primary text-primary bg-primary-invert-soft"
                    : "bg-surface border-invert-default text-default hover:bg-main-background",
                )}
              >
                <Icon name="sliders-horizontal" size={16} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full bg-primary-default text-invert-default text-xs font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
              {filterStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-invert-soft text-primary text-xs font-medium border border-invert-primary">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus("")}
                    className="hover:opacity-80 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {[...filterRanks].map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-invert-soft text-primary text-xs font-medium border border-invert-primary"
                >
                  Rank: {r}
                  <button
                    onClick={() => toggleRank(r)}
                    className="hover:opacity-80 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {[...filterUnits].map((u) => (
                <span
                  key={u}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-invert-soft text-primary text-xs font-medium border border-invert-primary"
                >
                  Unit: {u}
                  <button
                    onClick={() => toggleUnit(u)}
                    className="hover:opacity-80 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Table */}
          <UserTable
            paginated={paginated}
            currentPage={currentPage}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
            onNavigate={onNavigate}
            onArchive={handleArchive}
            variant={activeTab === "Operator" ? "operator" : "default"}
          />
        </div>
      </div>

      <AddUserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={handleCreate}
        companyOptions={companyOptions}
      />

      {/* Figma `Action - Move to Archive` → `Confirmation` (5157:101517) — exact copy. */}
      <ConfirmDialog
        open={!!archiveTarget}
        tone="warning"
        title={`Archive “${archiveTarget?.name ?? ""}”?`}
        subtitle="This will be moved to the archive and removed from active lists. You can restore it at any time."
        confirmLabel="Move to Archive"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />

      <Toast message={toast} open={!!toast} onDismiss={() => setToast("")} />

      <FilterPanel
        open={filterOpen}
        filterStatus={filterStatus}
        filterRanks={filterRanks}
        filterUnits={filterUnits}
        uniqueRanks={uniqueRanks}
        uniqueUnits={uniqueUnits}
        hasActiveFilters={hasActiveFilters}
        onSetFilterStatus={setFilterStatus}
        onToggleRank={toggleRank}
        onToggleUnit={toggleUnit}
        onClearAll={clearAllFilters}
        onClose={() => setFilterOpen(false)}
      />

    </div>
  );
}
