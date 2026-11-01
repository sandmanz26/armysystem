import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, SlidersHorizontal, Eye, MoreVertical, ArrowUpDown, SearchX } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { trainingResults } from "@/data/mock";
import type { TrainingResult } from "@/data/mock";
import { cn } from "@/lib/utils";

import type { FilterState } from "./types";
import { PER_PAGE, TRAINING_SLOTS } from "./constants";
import { FilterPanel } from "./components/FilterPanel";

// ── Main page ─────────────────────────────────────────────────────────────────

// ── Main page ─────────────────────────────────────────────────────────────────

export function TrainingResults({
  onNavigate,
  program,
  detailPath = "/training-results/detail",
}: {
  onNavigate?: (path: string) => void;
  /** Scopes the results to one programme's rail — mirrors MST's BookingList `program` prop.
   *  Omit for the WPT rail (its own dedicated route). */
  program?: "MST" | "TCT";
  /** Where a row navigates to — override for Training Results 2.0's own detail route. */
  detailPath?: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<FilterState>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});

  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters((prev) => {
      const current = prev[key] ?? [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleApply = () => {
    setAppliedFilters(pendingFilters);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleSetRange = (key: "dateFrom" | "dateTo", value: string) =>
    setPendingFilters((prev) => ({ ...prev, [key]: value ? [value] : [] }));

  const handleClear = () => {
    setPendingFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const openFilter = () => {
    setPendingFilters(appliedFilters);
    setFilterOpen(true);
  };

  const activeFilterCount = Object.values(appliedFilters).flat().length;

  // Scope results to the active rail, same as MST's BookingList: MST shows only
  // pure "MST" records (a shared MST+TCT booking belongs to the TCT rail once
  // relabelled below), TCT shows only "MST TCT" records relabelled to "TCT",
  // and the WPT rail (no `program` prop) shows only "WPT" records — a shared
  // booking never surfaces under the wrong programme's name.
  const scopedResults = useMemo(() => {
    if (program === "MST") return trainingResults.filter((r) => r.systemType === "MST");
    if (program === "TCT")
      return trainingResults
        .filter((r) => r.systemType === "MST TCT")
        .map((r) => ({ ...r, program: r.program.replace(/^MST TCT/, "TCT") }));
    return trainingResults.filter((r) => r.systemType === "WPT");
  }, [program]);

  const filtered = useMemo(() => {
    // `appliedFilters` used to sit in this dependency list without ever being
    // read — every section of the drawer was decorative. The three Figma
    // sections all map to real fields, so they are wired up here.
    const types = appliedFilters.trainingType ?? [];
    const slots = appliedFilters.trainingSlot ?? [];
    const from = appliedFilters.dateFrom?.[0];
    const to = appliedFilters.dateTo?.[0];

    const bookingDateOf = (r: TrainingResult) => {
      const d = new Date(r.bookingDate.split("\n")[0]);
      return isNaN(d.getTime()) ? null : d;
    };

    let result = scopedResults.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.program.toLowerCase().includes(q) && !r.bookingId.toLowerCase().includes(q))
          return false;
      }
      if (types.length && !types.includes(r.trainingType)) return false;
      if (slots.length) {
        const matched = TRAINING_SLOTS.filter((s) =>
          r.bookingDate.toLowerCase().includes(s.toLowerCase()),
        );
        if (!matched.some((s) => slots.includes(s))) return false;
      }
      if (from || to) {
        const d = bookingDateOf(r);
        if (d) {
          if (from && d < new Date(from)) return false;
          if (to && d > new Date(to)) return false;
        }
      }
      return true;
    });

    result = [...result].sort((a, b) =>
      sortDir === "desc"
        ? b.bookingDate.localeCompare(a.bookingDate)
        : a.bookingDate.localeCompare(b.bookingDate)
    );

    return result;
  }, [scopedResults, searchQuery, sortDir, appliedFilters]);

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── TanStack columns ──────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<TrainingResult, any>[]>(
    () => [
      // Figma column set, order and captions — `No · Booking ID · Training Type
      // · Training Mode · Booking Time · FTMS File ID · Actions`. The code used
      // to read `Program / Type / Booking Date / Mode` in a different order.
      {
        id: "no",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        header: () => "No.",
        cell: (info: any) => (
          <div
            className="text-sm text-body cursor-pointer"
            onClick={() => onNavigate?.(detailPath)}
          >
            {(currentPage - 1) * PER_PAGE + info.row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "program",
        header: () => "Booking ID",
        minWidth: "248px",
        cell: (info: any) => (
          <div className="cursor-pointer" onClick={() => onNavigate?.(detailPath)}>
            <div className="text-sm font-semibold text-default hover:text-primary transition-colors">
              {info.getValue()}
            </div>
            {/* Figma: color/text/body, Regular 12 — not a mono caption. */}
            <div className="text-xs text-body mt-0.5">{info.row.original.bookingId}</div>
          </div>
        ),
      },
      {
        accessorKey: "trainingType",
        header: () => "Training Type",
        minWidth: "120px",
        // Figma renders this as plain `color/text/default` at Regular 14.
        // It was a blue/purple pill here, which the design does not have.
        cell: (info: any) => (
          <div
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(detailPath)}
          >
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "trainingMode",
        header: () => "Training Mode",
        minWidth: "160px",
        cell: (info: any) => (
          <div
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(detailPath)}
          >
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "bookingDate",
        minWidth: "280px",
        header: () => (
          <button
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Booking Time
            <ArrowUpDown size={11} className="text-disabled" />
          </button>
        ),
        // Figma splits this into two lines with different tokens and sizes:
        // the date in color/text/default at 14, the session beneath it in
        // color/text/body at 12. It was one flat grey block. A booking with
        // several coursewares carries no single session to show, so its
        // second line reads "Multiple Courseware" instead — styled as a
        // link (color/text/primary, Medium), not the same caption grey.
        cell: (info: any) => {
          const [date, ...rest] = String(info.getValue() ?? "").split("\n");
          const second = rest.join(" ");
          const isMultipleCourseware = second === "Multiple Courseware";
          return (
            <div className="cursor-pointer" onClick={() => onNavigate?.(detailPath)}>
              <div className="text-sm text-default leading-snug">{date}</div>
              {second && (
                <div
                  className={cn(
                    "mt-0.5 leading-snug",
                    isMultipleCourseware ? "text-xs font-medium text-primary" : "text-xs text-body",
                  )}
                >
                  {second}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "ftmsFileId",
        header: () => "FTMS File ID",
        minWidth: "128px",
        cell: (info: any) => (
          <div
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(detailPath)}
          >
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "action",
        // Figma labels this column and puts TWO controls in it: an eye and a
        // row menu. The header was blank and the menu missing.
        header: () => "Actions",
        minWidth: "96px",
        cell: () => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.(detailPath);
              }}
              className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-all"
              title="View Results"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-all"
              title="More actions"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, sortDir, onNavigate, detailPath],
  );

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-4">
        {/* Table card — Figma `Section Layout - Table`. Figma's own dev note on
            this frame ("Why no page title") says a page title that's redundant
            with the section title (both read "Training Results") gets dropped,
            and the page's actions move down into the section header instead —
            so there is only ONE heading row, not a plain page title above a
            second "Training Results (N records)" title inside the card. */}
        <div className="isolate bg-surface-lv1 rounded-xl border border-invert-default shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-5 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-default">Training Results</h1>
                <span className="text-xs text-body">
                  {/* Figma writes "(0 record)" singular when empty and "(N records)"
                      otherwise — same on Antenna Listing (5167:211907). */}
                  ({filtered.length} {filtered.length > 1 ? "records" : "record"})
                </span>
              </div>
              <p className="text-xs text-body mt-0.5">Summary of all completed training sessions</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-placeholder z-10 pointer-events-none"
                />
                <InputCustom
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-lg w-56 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Filters button (icon-only toggle — raw button per TRX rule 3) */}
              <button
                onClick={openFilter}
                title="Filters"
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors",
                  activeFilterCount > 0
                    ? "border-primary bg-danger-invert-soft text-primary"
                    : "border-invert-default bg-surface text-body hover:bg-default-hovered"
                )}
              >
                <SlidersHorizontal size={13} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-default text-invert-default text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={false}
            classThead="bg-danger-invert-soft"
            classTheadTh="bg-danger-invert-soft text-primary font-semibold text-sm py-3 px-5"
            classTBodyTd="px-5 py-3.5"
            // Figma `Empty State`, `What = Search` (5029:101385): a search glyph,
            // the query echoed back in the title, and a different subtitle. Only
            // when a search is what emptied the table — a filter that matches
            // nothing keeps the default `Table` wording, per 5826:52013.
            {...(searchQuery && filtered.length === 0
              ? {
                  emptyIcon: <SearchX width={24} className="text-disabled" />,
                  emptyTitle: `No result for \u201c${searchQuery}\u201d`,
                  emptySubtitle: "Try a different keyword",
                }
              : {})}
          />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Filter drawer */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={handleFilterChange}
        onSetRange={handleSetRange}
        onApply={handleApply}
        onClear={handleClear}
      />
    </div>
  );
}
