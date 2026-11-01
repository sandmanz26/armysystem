import { useMemo, useRef, useState } from "react";
import { ArrowUpDown, FileUp, Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/toast";
import { ImportModal } from "./ImportModal";
import { ImportReviewModal, type ImportReviewVariant } from "./ImportReviewModal";

/*
 * Data Import — Figma page `Data Import` (5103:61279).
 *   Booking Details tab   list 5103:61670 · empty 5103:61654
 *   Import (Booking)      6046:35382 / 35393 / 35404 / 35415 / 35426 · toast 35439
 *                         · toast 6046:33937
 *
 * Columns: File Name 365 · Uploaded by 365 · Upload Date 365. No checkbox and
 * no row actions. Upload Date IS sortable — its header cell carries a visible
 * `Icon / arrow-up-down` that the other two do not; an earlier read of the
 * frame missed it and dropped the sort. Restored, newest first by default.
 *
 * Section Header (5103:61670) is a Left Content / Right Content row: title on
 * the left, a 240px `Input - Search` + the `Import` button on the right, gap
 * 12 — a Search box had been left out entirely in the previous pass. Reused
 * the same search-input markup already used on every other list page in
 * `pages-tsx` (e.g. `system-hardware/asset-type/index.tsx`) rather than
 * inventing a new one. Import's icon is `Icon / file-up` in the frame, not a
 * plain upload arrow — mapped to lucide's `FileUp`.
 *
 * Flow (Figma section `Action - Import (Booking Details)`):
 *   Import - Filled Ready (6046:35426) → Import → `Review Booking - Import -
 *   All / Some Lane Incomplete` (6046:35437 / 35458) → Confirm → `Toast -
 *   Success` (6046:35439). The file is only added to the list, and the toast
 *   shown, on Confirm; Cancel / X / scrim / Esc on the review drop it. The
 *   review's content is Figma's sample booking (the import mock carries none) and
 *   the two frames alternate import by import — see ImportReviewModal.tsx.
 */

type Tab = "Booking Details";

interface ImportRow {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedByRole: string;
  /** "<date>\n<time>" — Figma renders it as a two-line cell. */
  uploadDate: string;
}

const PER_PAGE = 10;

const SEED: Record<Tab, ImportRow[]> = {
  "Booking Details": [
    { id: "b1", fileName: "filename.csv", uploadedBy: "System", uploadedByRole: "System", uploadDate: "06 Jun 2026\n11:09:00 PM" },
    { id: "b2", fileName: "filename.csv", uploadedBy: "Olivia Carter", uploadedByRole: "System Admin", uploadDate: "03 Jun 2026\n08:00:00 PM" },
  ],
};

/** "06 Jun 2026\n11:09:00 PM" → epoch ms, so the column can sort on it. */
function uploadedAt(value: string): number {
  const [date, time] = value.split("\n");
  const parsed = Date.parse(`${date} ${time ?? ""}`.trim());
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function DataImport() {
  const activeTab: Tab = "Booking Details";
  const [rows, setRows] = useState<Record<Tab, ImportRow[]>>(SEED);
  const [currentPage, setCurrentPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // File waiting on the Review Your Booking step; null = no review open.
  const [review, setReview] = useState<{ fileName: string; variant: ImportReviewVariant } | null>(null);
  const reviewCount = useRef(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const data = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = rows[activeTab].filter(
      (r) => !q || r.fileName.toLowerCase().includes(q) || r.uploadedBy.toLowerCase().includes(q),
    );
    list.sort((a, b) =>
      sortDir === "desc"
        ? uploadedAt(b.uploadDate) - uploadedAt(a.uploadDate)
        : uploadedAt(a.uploadDate) - uploadedAt(b.uploadDate),
    );
    return list;
  }, [rows, activeTab, sortDir, searchQuery]);
  const paginated = data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = useMemo<ColumnDef<ImportRow, any>[]>(
    () => [
      {
        id: "fileName",
        width: 365,
        header: () => "File Name",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.fileName}</span>,
      },
      {
        id: "uploadedBy",
        width: 365,
        header: () => "Uploaded by",
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-default">{row.original.uploadedBy}</span>
            <span className="text-xs text-body">{row.original.uploadedByRole}</span>
          </div>
        ),
      },
      {
        id: "uploadDate",
        width: 365,
        // The only header in 5103:61670 carrying `Icon / arrow-up-down`.
        header: () => (
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Upload Date
            <ArrowUpDown size={11} className="text-disabled" />
          </button>
        ),
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.uploadDate).split("\n");
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-default">{date}</span>
              {time && <span className="text-xs text-body">{time}</span>}
            </div>
          );
        },
      },
    ],
    [],
  );

  const handleImported = (fileName: string) => {
    const now = new Date();
    const d = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const t = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setRows((prev) => ({
      ...prev,
      [activeTab]: [
        {
          id: `${activeTab}-${Date.now()}`,
          fileName,
          uploadedBy: "Admin User",
          uploadedByRole: "System Admin",
          uploadDate: `${d}\n${t}`,
        },
        ...prev[activeTab],
      ],
    }));
    // Figma uses the same toast on both tabs.
    setToast("Booking imported");
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-semibold text-default">Data Import</h1>

        {/*
          No tab row. Figma's Data Import page (`5103:61279`) now holds a
          single section — `Data Import - Tab - Booking Details` — and the
          Leaderboard sections it used to carry (list `5103:61709`, import
          `6046:33925`, confirmation `6058:15817`) are gone from the file.
          Removed on the product owner's instruction to follow Figma.
        */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5">
            <h2 className="text-base font-semibold text-default">{activeTab}</h2>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative w-60">
                <Search
                  size={18}
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
                  className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                />
              </div>
              <Button
                onClick={() => setImportOpen(true)}
                className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
              >
                <FileUp size={16} />
                Import
              </Button>
            </div>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={data.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <ImportModal
        open={importOpen}
        variant="booking"
        onClose={() => setImportOpen(false)}
        onImport={(name) => {
          setImportOpen(false);
          // Figma 6046:35437 (all lanes incomplete) then 6046:35458 (some), alternating.
          const variant: ImportReviewVariant = reviewCount.current % 2 === 0 ? "all" : "some";
          reviewCount.current += 1;
          setReview({ fileName: name, variant });
        }}
      />

      {review && (
        <ImportReviewModal
          variant={review.variant}
          onCancel={() => setReview(null)}
          onConfirm={() => {
            handleImported(review.fileName);
            setReview(null);
          }}
        />
      )}

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
