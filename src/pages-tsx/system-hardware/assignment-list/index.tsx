import { useEffect, useState } from "react";
import { scanUrl, takeScanFlash } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import { assignments as INITIAL_ASSIGNMENTS } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { Toast } from "@/components/toast";
import { Icon } from "@/components/icon";
import { AssignmentToolbar } from "./components/AssignmentToolbar";
import { AssignmentTable } from "./components/AssignmentTable";
import {
  AssignmentFilterDrawer,
  EMPTY_ASSIGNMENT_FILTERS,
  countAssignmentFilters,
  type AssignmentFilters,
} from "./components/AssignmentFilterDrawer";
import { ReadyForReturnDrawer } from "./modals/ReadyForReturnDrawer";
import { setAssignmentStatus, variantOf } from "../assignment-detail/constants";
import { TAB_STATUS_MAP, type Tab } from "./types";
import { matchesAssignmentId } from "./constants";

/** "22 Apr 2026" out of "10:35:58 PM\n28 Apr 2026" — order-independent. */
function issuedDateOf(a: { issuedDate?: string }): Date | null {
  if (!a.issuedDate) return null;
  const line = a.issuedDate.split("\n").find((l) => /\d{4}/.test(l));
  if (!line) return null;
  const d = new Date(line.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export function AssignmentList({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [activeTab, setActiveTab] = useState<Tab>("Overall");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReturnDrawer, setShowReturnDrawer] = useState(false);
  /** Row ids pre-ticked when the drawer is opened from a row's ⋮ menu. */
  const [returnPreselected, setReturnPreselected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AssignmentFilters>(EMPTY_ASSIGNMENT_FILTERS);
  const [toast, setToast] = useState<string | null>(null);
  // F-009: toast handed over by the Top Up / Scan & Return page on the way back here.
  useEffect(() => {
    const msg = takeScanFlash();
    if (msg) setToast(msg);
  }, []);

  // Eligible rows in Figma's `Drawer - Select Assignment` (5889:280024) are
  // Issued and Pending Return assignments.
  const returnCandidates = assignments.filter(
    (a) => a.status === "Issued" || a.status === "Pending Return",
  );

  const openReturnDrawer = (preselected: string[] = []) => {
    setReturnPreselected(preselected);
    setShowReturnDrawer(true);
  };

  const tabFiltered =
    activeTab === "Overall"
      ? assignments
      : assignments.filter((a) => a.status === TAB_STATUS_MAP[activeTab]);

  const typeFiltered = filters.assignmentType
    ? tabFiltered.filter((a) => variantOf(a) === filters.assignmentType)
    : tabFiltered;

  const stationFiltered =
    filters.baseStations.length === 0
      ? typeFiltered
      : typeFiltered.filter((a) => a.baseStations.some((s) => filters.baseStations.includes(s)));

  const dateFiltered = stationFiltered.filter((a) => {
    if (!filters.dateFrom && !filters.dateTo) return true;
    const issued = issuedDateOf(a);
    if (!issued) return false;
    if (filters.dateFrom && issued < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && issued > new Date(filters.dateTo)) return false;
    return true;
  });

  const filtered = dateFiltered.filter((a) => matchesAssignmentId(a.assignmentId, searchQuery));

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      {showReturnDrawer && (
        <ReadyForReturnDrawer
          candidates={returnCandidates}
          initialSelected={returnPreselected}
          onClose={() => setShowReturnDrawer(false)}
          onSubmitted={(ids) => {
            // Also write to the shared mock so Assignment Details agrees.
            ids.forEach((id) => setAssignmentStatus(id, "Pending Return"));
            setAssignments((prev) =>
              prev.map((a) => (ids.includes(a.id) ? { ...a, status: "Pending Return" } : a)),
            );
            // Figma's own toast text (5895:484001) — singular "request" even for N > 1.
            setToast(`${ids.length} ready for return request submitted successfully`);
          }}
        />
      )}

      <AssignmentFilterDrawer
        isOpen={showFilters}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />

      <div className="p-4 md:p-6">
        {/* Figma's Page Header (5154:76248): "Assignment List" + Subtitle,
            "Ready For Return Assets" (secondary) and "Issue Asset" (primary,
            singular — this read "Issue Assets" before). */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
          <h1 className="text-xl font-semibold text-default">Assignment List</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Always shown — Figma has a `No Assignment` drawer state
                (5895:505516) for when nothing is eligible. */}
            <Button
              onClick={() => openReturnDrawer()}
              className="w-auto whitespace-nowrap flex items-center gap-1.5 px-4 py-2 text-sm border border-invert-default rounded-lg text-default hover:bg-default-hovered font-semibold transition-colors bg-surface"
            >
              <Icon name="package-check" size={18} />
              Ready For Return Assets
            </Button>
            <Button
              onClick={() => onNavigate?.("/system-hardware/create-assignment")}
              className="w-auto whitespace-nowrap flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-default text-invert-default rounded-lg hover:bg-primary-hovered font-semibold shadow-sm transition-colors"
            >
              <Icon name="plus" size={18} />
              Issue Asset
            </Button>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-invert-default">
          <AssignmentToolbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            allAssignments={assignments}
            visibleCount={filtered.length}
            activeFilterCount={countAssignmentFilters(filters)}
            onOpenFilters={() => setShowFilters(true)}
          />

          <AssignmentTable
            data={filtered}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onNavigate={onNavigate}
            onReadyForReturn={(a) => openReturnDrawer([a.id])}
            onScan={(a, mode) =>
              onNavigate?.(scanUrl("/system-hardware/issue-assets", mode, { assignmentId: a.assignmentId }, "/system-hardware/assignment-list"))
            }
          />
        </div>
      </div>

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </div>
  );
}
