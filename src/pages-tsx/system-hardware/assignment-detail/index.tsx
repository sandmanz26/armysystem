// Assignment Details — Figma page `Assignment Details - Issued` (5839:148774).
//
// One page, three variants, chosen by the assignment's type (see constants.ts):
//   Booking         `Assignment Details - Assets`    5839:148778 (+ Bookings tab 6991:172117)
//   Administration                                   5892:300734
//   Maintenance                                      5892:302729
//
// Status actions (SH-18):
//   Issued (Admin/Maint)  Ready For Return Assets → `Ready to return these assets?`
//                         (5890:296240) → Pending Return + toast (5890:296242)
//   Pending Return        Mark as Missing Assets → `Mark as missing assets?`
//                         (6998:255010) → Missing + toast (6998:255012); Return Assets
//   F-009                 Top Up Asset / Return Assets open the scan page
//                         (/system-hardware/issue-assets?mode=topup|return) and return here.
//
// A much older `.jsx` page exists at src/pages/system-hardware/assignment-detail,
// routed only from App.jsx — deliberately left untouched.
import { useEffect, useMemo, useState } from "react";
import { scanUrl, takeScanFlash } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import type { AssignmentStatus } from "@/data/systemHardware";
import { Pagination } from "@/components/ui/Pagination";
import { Icon } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { cn } from "@/lib/utils";
import { AssignmentStatusBadge } from "@/pages-tsx/system-hardware/assignment-list/components/AssignmentStatusBadge";
import { KeyValue, DetailCard } from "./components/KeyValue";
import { AssetTable } from "./components/AssetTable";
import { BookingTable } from "./components/BookingTable";
import { BookingFilterDrawer } from "./components/BookingFilterDrawer";
import {
  EMPTY_BOOKING_FILTERS,
  PER_PAGE,
  assetRowsFor,
  bookingRowsFor,
  countBookingFilters,
  findAssignment,
  matchesBookingFilters,
  setAssignmentStatus,
  variantOf,
} from "./constants";
import type { AssignmentDetailProps, BookingFilters } from "./types";

type DetailTab = "Assets" | "Bookings";
type Confirm = "ready" | "missing" | null;

function useAssignmentIdFromUrl(): string | null {
  const search = window.location.search || window.location.hash.replace(/^[^?]*/, "");
  return new URLSearchParams(search).get("assignmentId");
}

const SECONDARY_BTN =
  "flex items-center gap-2 h-10 px-4 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors";
const PRIMARY_BTN =
  "flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-default text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors";

export function AssignmentDetail({ onNavigate }: AssignmentDetailProps) {
  const assignmentId = useAssignmentIdFromUrl();
  const found = findAssignment(assignmentId);
  /** Local copy of the status so the actions below re-render the page; every
   *  change is also written to the shared mock (setAssignmentStatus). */
  const [statusOverride, setStatusOverride] = useState<AssignmentStatus | null>(null);
  const assignment = found ? { ...found, status: statusOverride ?? found.status } : undefined;

  const [tab, setTab] = useState<DetailTab>("Assets");
  const [assetPage, setAssetPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [assetQuery, setAssetQuery] = useState("");
  const [bookingQuery, setBookingQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_BOOKING_FILTERS);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [toast, setToast] = useState<string | null>(null);

  // F-009: toast handed over by the Top Up / Scan & Return page on the way back here.
  useEffect(() => {
    const msg = takeScanFlash();
    if (msg) setToast(msg);
  }, []);

  const variant = assignment ? variantOf(assignment) : "Booking";
  const status = assignment?.status;

  const rows = useMemo(
    () => (assignment ? assetRowsFor(assignment) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [found, status],
  );
  const filteredRows = useMemo(() => {
    const q = assetQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.assetTagId ?? "", r.assetType, r.assetCategory].some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, assetQuery]);
  const pagedAssets = filteredRows.slice((assetPage - 1) * PER_PAGE, assetPage * PER_PAGE);

  const bookingRows = useMemo(() => (found ? bookingRowsFor(found) : []), [found]);
  const filteredBookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    return bookingRows
      .filter((r) => matchesBookingFilters(r, filters))
      .filter(
        (r) =>
          !q ||
          [r.program, r.bookingId, r.courseware].some((v) => v.toLowerCase().includes(q)),
      )
      .map((r, i) => ({ ...r, no: i + 1 }));
  }, [bookingRows, filters, bookingQuery]);
  const pagedBookings = filteredBookings.slice((bookingPage - 1) * PER_PAGE, bookingPage * PER_PAGE);

  if (!assignment || !found) {
    return (
      <div className="flex-1 overflow-auto bg-main-background p-6">
        <p className="text-sm text-body">Assignment not found.</p>
      </div>
    );
  }

  const isBooking = variant === "Booking";
  const isPendingReturn = assignment.status === "Pending Return";
  const isMissing = assignment.status === "Missing";
  const isIssued = assignment.status === "Issued";
  const bookingCount = new Set(bookingRows.map((r) => r.bookingKey)).size;
  const activeFilterCount = countBookingFilters(filters);

  const changeStatus = (next: AssignmentStatus, message: string) => {
    setAssignmentStatus(found.id, next);
    setStatusOverride(next);
    setConfirm(null);
    setToast(message);
  };

  const openScan = (mode: "topup" | "return") =>
    onNavigate?.(
      scanUrl(
        "/system-hardware/issue-assets",
        mode,
        { assignmentId: found.assignmentId },
        `/system-hardware/assignment-detail?assignmentId=${found.assignmentId}`,
      ),
    );

  const onTab = (t: DetailTab) => {
    setTab(t);
  };

  const showingBookings = isBooking && tab === "Bookings";
  const query = showingBookings ? bookingQuery : assetQuery;
  const setQuery = (q: string) => {
    if (showingBookings) {
      setBookingQuery(q);
      setBookingPage(1);
    } else {
      setAssetQuery(q);
      setAssetPage(1);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-4 md:p-6 flex flex-col gap-6">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-default">Assignment Details</h1>
              <AssignmentStatusBadge status={assignment.status} />
            </div>
            <span className="inline-flex w-fit items-center rounded border border-base bg-default-invert-default px-2 py-0.5 text-sm font-medium text-invert-default">
              ID #{assignment.assignmentId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending Return (6998:256629): Mark as Missing Assets + Return Assets. */}
            {isPendingReturn && (
              <button type="button" onClick={() => setConfirm("missing")} className={SECONDARY_BTN}>
                <Icon name="octagon-alert" size={18} />
                Mark as Missing Assets
              </button>
            )}
            {/* Return Assets (Pending Return / Missing, 6998:256629 / 6998:255012) → F-009 Scan &
                Return Assets (Booking 5895:412248 · Admin & Maintenance 5895:423080), back here with
                "{n} assets returned" (5895:412469). */}
            {(isPendingReturn || isMissing) && (
              <button type="button" onClick={() => openScan("return")} className={PRIMARY_BTN}>
                <Icon name="scan-line" size={18} />
                Return Assets
              </button>
            )}

            {/* F-009: Top Up (Booking 5895:360297 · Admin & Maintenance 5895:368080) → toast
                "Top up asset issued" (5895:360327). */}
            {!isPendingReturn && !isMissing && (
              <button type="button" onClick={() => openScan("topup")} className={SECONDARY_BTN}>
                <Icon name="package-plus" size={18} />
                Top Up Asset
              </button>
            )}

            {/* Figma gives Administration and Maintenance a primary
                "Ready For Return Assets"; the Booking screen has no such action. */}
            {!isBooking && isIssued && (
              <button type="button" onClick={() => setConfirm("ready")} className={PRIMARY_BTN}>
                <Icon name="package-check" size={18} />
                Ready For Return Assets
              </button>
            )}
          </div>
        </header>

        {/* ── The two detail cards ───────────────────────────────────────── */}
        <div className="flex gap-6 flex-wrap items-start">
          <DetailCard title="Assignment Details">
            <div className="flex gap-5 flex-wrap">
              <KeyValue label="Operator" className="flex-1">
                {assignment.operator ?? "—"}
              </KeyValue>
              <KeyValue label="Armskote Operator" className="flex-1">
                {assignment.armskotePersonnel ?? "—"}
              </KeyValue>
            </div>

            <div className="flex gap-5 flex-wrap">
              <KeyValue label="Assignment Type" className="flex-1">
                {assignment.assignmentType}
              </KeyValue>

              {isBooking && (
                <KeyValue label="Bookings" className="flex-1">
                  {bookingRows.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onTab("Bookings")}
                      className="text-primary hover:underline font-semibold text-left"
                    >
                      {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}, {bookingRows.length}{" "}
                      courseware
                    </button>
                  ) : (
                    "—"
                  )}
                </KeyValue>
              )}
            </div>

            {isBooking && (
              <KeyValue label="Base Station Quantity">
                <span className="block">
                  {assignment.baseStations.length}{" "}
                  {assignment.baseStations.length === 1 ? "Station" : "Stations"}
                </span>
                <span className="block font-normal text-default">
                  {assignment.baseStations.join(", ")}
                </span>
              </KeyValue>
            )}
          </DetailCard>

          <DetailCard title="Issuance Details">
            <div className="flex gap-5 flex-wrap">
              <KeyValue label="Issued Date" className="flex-1">
                <span className="whitespace-pre-line">{assignment.issuedDate ?? "—"}</span>
              </KeyValue>
              <KeyValue label="Returned Date" className="flex-1">
                <span className="whitespace-pre-line">{assignment.returnedDate ?? "—"}</span>
              </KeyValue>
            </div>

            {!isBooking && (
              <KeyValue label="Issued Reason">
                <span className="font-normal">{assignment.issuedReason ?? "—"}</span>
              </KeyValue>
            )}
          </DetailCard>
        </div>

        {/* ── Assets / Bookings ──────────────────────────────────────────── */}
        <section className="rounded-xl bg-surface-lv1 border border-invert-default overflow-hidden">
          {/* Figma `Tab Group v2` — Booking variant only (Admin/Maint have no Bookings). */}
          {isBooking && (
            <div className="flex px-5 border-b border-invert-default">
              {(["Assets", "Bookings"] as DetailTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTab(t)}
                  className={cn(
                    "relative h-11 px-4 text-sm font-medium transition-colors",
                    tab === t ? "text-primary" : "text-body hover:text-default",
                  )}
                >
                  {t}
                  {tab === t && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary-default" />}
                </button>
              ))}
            </div>
          )}

          <header className="px-5 h-16 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <span className="text-default">{showingBookings ? "Bookings" : "Assets"}</span>
              <span className="text-body">
                {showingBookings ? filteredBookings.length : filteredRows.length}
              </span>
            </h2>

            {isBooking && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-body pointer-events-none">
                    <Icon name="search" size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-9 w-60 pl-9 pr-3 text-sm rounded-lg border border-invert-default bg-surface text-default placeholder:text-body focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className={cn(
                    "flex items-center gap-2 h-9 px-4 rounded-lg border text-sm font-semibold transition-colors",
                    activeFilterCount > 0
                      ? "border-primary text-primary bg-surface"
                      : "border-invert-default bg-surface text-default hover:bg-default-hovered",
                  )}
                >
                  <Icon name="list-filter" size={16} />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary-default text-invert-default text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </header>

          <div className="overflow-x-auto">
            {showingBookings ? (
              <BookingTable rows={pagedBookings} onNavigate={onNavigate} />
            ) : (
              <AssetTable rows={pagedAssets} variant={variant} onNavigate={onNavigate} />
            )}
          </div>

          {showingBookings ? (
            <Pagination
              currentPage={bookingPage}
              itemsPerPage={PER_PAGE}
              totalItems={filteredBookings.length}
              setCurrentPage={setBookingPage}
            />
          ) : (
            <Pagination
              currentPage={assetPage}
              itemsPerPage={PER_PAGE}
              totalItems={filteredRows.length}
              setCurrentPage={setAssetPage}
            />
          )}
        </section>
      </div>

      <BookingFilterDrawer
        isOpen={showFilters}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setBookingPage(1);
        }}
        onClose={() => setShowFilters(false)}
      />

      {/* Figma `Confirmation` (5890:296240). */}
      <ConfirmDialog
        open={confirm === "ready"}
        tone="warning"
        title="Ready to return these assets?"
        subtitle={`${rows.length} assets will change to Pending Return. This can't be undone.`}
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          changeStatus("Pending Return", "Ready for return request submitted successfully")
        }
      />

      {/* Figma `Confirmation` (6998:255010). */}
      <ConfirmDialog
        open={confirm === "missing"}
        tone="warning"
        title="Mark as missing assets?"
        subtitle="Some assets have not been returned. They will be marked as Not Returned, and the assignment will be marked as Missing. This action can't be undone."
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => changeStatus("Missing", "Assets recorded as Missing")}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </div>
  );
}
