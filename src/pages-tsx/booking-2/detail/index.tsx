// Booking 2.0 — Booking Detail page.
//
// New, isolated page (not a restyle of src/pages-tsx/booking/detail) — only
// reachable via Booking 2.0's own Booking List (/bookings/detail?id=...).
// The old booking module's detail page is untouched. Driven directly off the
// shared mock.ts Booking fields rather than a Zustand-store BOOKING_DATA
// shape, since Booking 2.0's other pages follow that simpler, data-driven
// pattern.
//
// Rebuilt 29 Sep 2026 against Figma `Booking Details: Upcoming` (5029:40418),
// `Upcoming (Asset Issued)` (5093:179275) and `Upcoming (The Day)`
// (5093:165858) — the previous pass had never actually been checked against
// these frames: wrong header (an invented date/time row that isn't there, a
// permanent "Issue Assets" dropdown that Figma only shows before assets are
// issued), a single merged "Training Information" card instead of Figma's
// two ("Booking Details" / "Courseware Details" with a different field
// split), Base Station/Briefing Room rows missing their Flat Screen/
// C-Shaped type pill and count, and a hand-rolled centered Reassign dialog
// instead of Figma's actual Drawer-based edit form.
//
// Out of scope for this pass (flagged, not touched): the Nominal Roll, Lane
// Configuration and Detail List tab CONTENT (Figma has real Empty/Filled
// frames for all three — this page still shows a placeholder), Reschedule
// (a multi-step flow: Edit Schedule, date-slot dropdown, confirmation,
// toast), and Edit Lane Config. Cancel Booking is built; Reschedule is not.
//
// 19 Oct 2026 (F-004): the ⋮ menu of an Upcoming booking now carries Figma's two items
// (5499:19921) — Reschedule (clock-3) and Cancel Booking (x, danger) — and Reschedule runs the
// full `Action - Reschedule` flow (RescheduleView). Tab count badges follow Figma's `Count`
// property: hidden for a single courseware (5511:16209), shown for multiple.
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, CirclePlay, MoreVertical,
} from "lucide-react";
import { scanUrl, takeScanFlash } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import { sessionStatusOverride } from "@/pages-tsx/booking-2/ongoing-session/session";
import { bookings } from "@/data/mock";
import { calendarMockBookings } from "@/pages-tsx/booking-2/list/calendarMock";
import { getCreatedBookings } from "@/pages-tsx/booking-2/create/createdBookings";
import { Drawer } from "@/components/drawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { BookingSummaryCards, WeaponRoleCards, Section } from "@/pages-tsx/booking-2/components/BookingSummaryCards";
import { Icon } from "@/components/icon";
import { formatBookingTime } from "@/pages-tsx/booking-2/components/formatBookingTime";
import { cn } from "@/lib/utils";
import { RescheduleView } from "./components/RescheduleView";
import { LaneConfigurationTab } from "./components/LaneConfigurationTab";
import { NominalRollTab } from "./components/NominalRollTab";
import { useNominalRollVersion } from "./components/nominalRollStore";
import { MultiCwDetails } from "./components/MultiCwDetails";
import { MultiCwActions, onboardingReady, type MultiCwAction } from "./components/MultiCwActions";
import { useMultiCw, oneLine, parseBookingTime } from "./components/multiCw";
// F-006 BD-21 / BD-3 / BD-23: readiness banners + post-session header actions.
import { detailMockBookings } from "./components/detailMocks";
import { bookingReadiness } from "./components/bookingReadiness";
import { ReadinessBanner, DetailListBanner, BookingStatusBadge } from "./components/DetailBanners";
import { PostSessionActions, usePostSession } from "./components/PostSessionActions";
import { isPostSessionStatus, readPostSession, writePostSession } from "./components/postSession";
import { findOwnershipTransfer } from "./components/ownershipTransfer";

type DetailTab = "Booking Details" | "Nominal Roll" | "Lane Configuration" | "Detail List";

function getBookingFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");
  // Calendar-only mock bookings (booking-2/list/calendarMock) open here too.
  // + bookings made in Create Booking 2.0 this session (create/createdBookings.ts, C-28).
  return [...getCreatedBookings(), ...bookings, ...calendarMockBookings, ...detailMockBookings].find((b) => b.id === (bookingId ?? "")) ?? bookings[0];
}

const FLAT_STATION_OPTIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05", "WPT-06"];
const CSHAPED_STATION_OPTIONS = ["C-Shaped 01", "C-Shaped 02", "C-Shaped 03", "C-Shaped 04"];
const BRIEFING_ROOM_OPTIONS = ["Briefing Room 1", "Briefing Room 2", "Briefing Room 3"];

type ReassignTarget = { kind: "base" | "cshaped" | "briefing"; current: string };

// Figma `Action - Reassign Base Station` / `Action - Reassign Briefing Room`
// (5513:287446 / 5513:295195): a 384px Drawer — "Current X" read-only, "New
// X *" dropdown, required-field error, Cancel/Confirm.
function ReassignDrawer({
  target, onConfirm, onCancel,
}: {
  target: ReassignTarget;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const isBriefing = target.kind === "briefing";
  const options = isBriefing ? BRIEFING_ROOM_OPTIONS : target.kind === "cshaped" ? CSHAPED_STATION_OPTIONS : FLAT_STATION_OPTIONS;
  const label = isBriefing ? "Briefing Room" : "Base Station";
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const error = touched && !selected ? `New ${label} is required` : null;

  return (
    <Drawer
      open
      onClose={onCancel}
      title={`Reassign ${label}`}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-default border border-invert-default rounded-lg hover:bg-default-soft bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (selected) onConfirm(selected);
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-figma-primary rounded-lg hover:bg-figma-primaryhover"
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-figma-body">Current {label}</p>
          <p className="text-sm font-semibold text-figma-default mt-0.5">{target.current}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-figma-default mb-1">
            New {label} <span className="text-figma-primary">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-surface",
                error ? "border-danger" : "border-invert-default",
              )}
            >
              <span className={selected ? "text-figma-default" : "text-figma-placeholder"}>
                {selected || `Select New ${label}`}
              </span>
              <ChevronDown size={14} className={cn("text-figma-disabled transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                {options.filter((o) => o !== target.current).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setSelected(opt); setOpen(false); setTouched(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-figma-default hover:bg-default-soft transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      </div>
    </Drawer>
  );
}

interface BookingDetail2Props {
  onNavigate?: (path: string) => void;
}

export function BookingDetail2({ onNavigate }: BookingDetail2Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>("Booking Details");
  // F-008: re-render (readiness banner, Start Onboarding) when the Nominal Roll tab edits a roll.
  useNominalRollVersion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [bookingTimeOverride, setBookingTimeOverride] = useState<string | null>(null);
  const sourceBooking = useMemo(getBookingFromUrl, []);
  const booking = bookingTimeOverride && sourceBooking ? { ...sourceBooking, bookingTime: bookingTimeOverride } : sourceBooking;

  const [baseStationOverrides, setBaseStationOverrides] = useState<Record<string, string>>({});
  const [briefingRoomOverrides, setBriefingRoomOverrides] = useState<Record<string, string>>({});
  const [reassignTarget, setReassignTarget] = useState<ReassignTarget | null>(null);
  // BD-16 (Figma 5834:183285): booking with several courseware → MultiCwDetails / MultiCwActions.
  const multi = useMultiCw(sourceBooking);
  const [multiAction, setMultiAction] = useState<MultiCwAction | null>(null);
  // F-009 (BD-17): Figma `Start Onboarding` (8152:103723, single courseware) and the "Exactly 1
  // CW ready" frame (7908:12699) — confirm before leaving for Onboarding.
  const [onboardingConfirm, setOnboardingConfirm] = useState<{ courseware: string; schedule: string; url: string } | null>(null);
  const [multiExpanded, setMultiExpanded] = useState(false);
  // F-012 (BD-19): courseware whose assets were handed to its sibling (survives the round trip like the phase).
  const [transferFrom, setTransferFrom] = useState<number | null>(() => readPostSession(sourceBooking.id).transferFrom ?? null);
  const post = usePostSession(sourceBooking, sessionStatusOverride(sourceBooking.id) ?? sourceBooking.status);
  // F-009: toast handed over by the Top Up / Scan & Return page on the way back here.
  useEffect(() => {
    const msg = takeScanFlash();
    if (msg) setToast(msg);
  }, []);

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center bg-figma-soft text-sm text-figma-body">
        Booking not found.
      </div>
    );
  }

  const baseStations = (booking.assignedStations ?? []).map((s) => baseStationOverrides[s] ?? s);
  const cShapedStations = (booking.assignedCShapedStations ?? []).map((s) => baseStationOverrides[s] ?? s);
  // Figma `briefingRoom` is one field on this shared Booking type but the
  // frame shows a whole card of rooms — the field already carries multiple
  // rooms comma-joined elsewhere in this app (same pattern as weapon/role
  // lists), so split it rather than adding a new array field.
  const briefingRooms = (booking.briefingRoom ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean)
    .map((r) => briefingRoomOverrides[r] ?? r);
  const assetIssued = booking.assetIssued;
  // Figma `Booking Details: Ongoing` (5093:186809/186811): a session started
  // in Ongoing Session (sessionStorage) wins over the mock's static status.
  const status = sessionStatusOverride(booking.id) ?? booking.status;
  const isOngoing = !cancelled && status === "Ongoing";
  const isUpcoming = !cancelled && status === "Upcoming";
  const isPostSession = cancelled || isPostSessionStatus(status);
  const coursewareList = booking.courseware.split(",").map((c) => c.trim()).filter(Boolean);
  const readiness = bookingReadiness(booking, coursewareList);
  const blocked = isUpcoming && readiness.blocked;
  const coursewareCount = booking.courseware ? booking.courseware.split(",").filter((c) => c.trim()).length : 1;
  const isMultiCw = coursewareCount > 1;
  const transferredPair = (() => {
    if (!isMultiCw || transferFrom === null || post.phase !== "ownership-transferred") return null;
    const t = findOwnershipTransfer(booking, multi.list, transferFrom);
    return t ? { from: t.fromIndex, to: t.toIndex } : null;
  })();
  const startOnboarding = () => {
    const ready = onboardingReady(multi);
    if (!isMultiCw) setOnboardingConfirm({ courseware: booking.courseware, schedule: oneLine(parseBookingTime(booking.bookingTime)), url: `/bookings/onboarding?id=${booking.id}` });
    else if (ready.length === 1) setOnboardingConfirm({ courseware: ready[0].name, schedule: oneLine(ready[0].schedule), url: `/bookings/onboarding?id=${booking.id}&courseware=${encodeURIComponent(ready[0].name)}` });
    else setMultiAction("onboarding");
  };

  const [bookingDateLine, rawTimeLine] = (booking.bookingTime ?? "").split("\n");
  const bookingTimeLine = formatBookingTime(rawTimeLine);

  const tabs: DetailTab[] = ["Booking Details", "Nominal Roll", "Lane Configuration", "Detail List"];

  const handleReassignConfirm = (value: string) => {
    if (!reassignTarget) return;
    if (reassignTarget.kind === "briefing") {
      setBriefingRoomOverrides((prev) => ({ ...prev, [reassignTarget.current]: value }));
      setToast("Briefing Room reassigned");
    } else {
      setBaseStationOverrides((prev) => ({ ...prev, [reassignTarget.current]: value }));
      setToast("Base station reassigned");
    }
    setReassignTarget(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-figma-soft">
      <div className="p-4 md:p-6">
        {/* F-006 BD-21: readiness `Alert` above the page header (5512:75076 / 5513:405960); the
            Detail List tab shows its own banner instead (5513:254787). */}
        {isUpcoming && activeTab !== "Detail List" && <ReadinessBanner readiness={readiness} />}
        {/* Figma `Page Header/Left Content`: title + status badge on one
            line, "ID #{bookingId}" pill on its own line below. */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <h1 className="text-xl font-semibold text-figma-default">{booking.program}</h1>
              {/* Figma `Badge - Booking Status` on THIS frame resolves to
                  background/info/invert/default + text/info for "Upcoming" —
                  not the invert/soft variant the shared StatusBadge uses
                  (verified on a different frame, the calendar card). Only
                  the Upcoming tone is verified here; "Cancelled" reuses
                  StatusBadge's own already-audited neutral mapping since
                  this page has no Figma frame of its own for that state. */}
              {cancelled ? (
                <span className="px-2 py-0.5 rounded-full bg-default-default text-default border border-invert-default text-xs font-medium">Cancelled</span>
              ) : isOngoing ? (
                <span className="px-2 py-0.5 rounded-full bg-orange-invert-default text-orange border border-invert-orange text-xs font-medium">Ongoing</span>
              ) : (
                <BookingStatusBadge status={isPostSession ? post.status : status} />
              )}
            </div>
            {/* background/default/invert/default (#374151) + text/base
                (white) — the exact same pair already used for the Toggle
                component's "Off" track, reused directly rather than adding
                a redundant figma-* alias for an identical value. */}
            <span className="inline-block px-2.5 py-1 rounded-lg bg-default-invert-default text-figma-base text-sm font-medium">
              ID #{booking.bookingId.replace(/^#/, "")}
            </span>
          </div>

          {isOngoing ? (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => onNavigate?.(`/bookings/session?id=${booking.id}`)}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
              >
                <CirclePlay size={16} />
                Continue Session
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label="More actions"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-56 rounded-lg border border-invert-default bg-surface py-1 shadow-lg z-20">
                      {/* PRD §12a.8 Case 7: Top Up scans more assets against the
                          EXISTING Assignment on the same Scan Assets screen — no New
                          Assignment step. */}
                      {/* F-009 BD-14: Top Up opens the scan page in Top Up mode (5895:360297) and comes
                          back here with "Top up asset issued". Multiple courseware first asks which
                          assignment (Select Assignment, 6829:38601). */}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          if (isMultiCw) setMultiAction("topup");
                          else onNavigate?.(scanUrl("/bookings/issue-assets", "topup", { baseStation: baseStations[0], bookingIds: booking.id, courseware: booking.courseware }, `/bookings/detail?id=${booking.id}`));
                        }}
                        className="flex h-9 w-full items-center gap-2 px-3 text-left text-sm font-medium text-default hover:bg-default-default"
                      >
                        <Icon name="package-plus" size={16} className="text-body" />
                        Top Up Assets
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : isPostSession ? (
            <PostSessionActions
              booking={booking}
              status={cancelled ? "Cancelled" : post.status}
              phase={post.phase}
              onPhaseChange={post.setPhase}
              onStatusChange={post.setStatus}
              onToast={setToast}
              onNavigate={onNavigate}
              ownershipTransfer={isMultiCw ? findOwnershipTransfer(booking, multi.list, multi.selected) : null}
              onOwnershipTransferred={() => {
                setTransferFrom(multi.selected);
                writePostSession(booking.id, { transferFrom: multi.selected });
              }}
            />
          ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Multiple courseware: Issue Assets stays while any courseware is still Not Issued (6829:37016). */}
            {(!assetIssued || (isMultiCw && multi.list.some((c) => !c.assignmentId && !c.cancelled))) && (
              <button
                type="button"
                disabled={blocked}
                onClick={() => onNavigate?.(`/bookings/assignments/new?bookingId=${booking.id}&courseware=${encodeURIComponent(booking.courseware)}`)}
                className={cn(
                  "flex h-10 items-center gap-2 px-4 text-sm font-semibold border border-invert-default rounded-lg bg-surface",
                  blocked ? "text-disabled cursor-not-allowed" : "text-default hover:bg-default-soft",
                )}
              >
                <Icon name="package-check" size={18} />
                Issue Assets
              </button>
            )}
            <button
              type="button"
              disabled={!assetIssued || blocked}
              title={!assetIssued ? "Issue assets first to enable this action" : undefined}
              onClick={startOnboarding}
              className={cn(
                "flex h-10 items-center gap-2 px-4 text-sm font-semibold rounded-lg transition-colors",
                assetIssued && !blocked ? "bg-primary-default text-invert-default hover:bg-primary-hovered" : "bg-disabled text-disabled cursor-not-allowed"
              )}
            >
              <Icon name="circle-play" size={18} />
              Start Onboarding
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-invert-default text-default hover:bg-default-soft bg-surface"
              >
                <Icon name="ellipsis-vertical" size={18} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  {/* Figma `Listbox New` (5499:19921): 224 wide, radius 8, 4px vertical padding,
                      shadow, no border; `Listbox Item` 36 tall, 12px side padding, 20px icon, 10px gap,
                      14 Medium. Reschedule exists for Upcoming bookings only. */}
                  <div className="absolute right-0 mt-1 w-56 rounded-lg bg-surface py-1 shadow-lg z-20">
                    {isMultiCw && isUpcoming && assetIssued && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); setMultiAction("topup"); }}
                        className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default hover:bg-default-soft"
                      >
                        <Icon name="package-plus" size={20} />
                        Top Up Assets
                      </button>
                    )}
                    {isUpcoming && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); if (isMultiCw) setMultiAction("reschedule"); else setRescheduleOpen(true); }}
                        className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default hover:bg-default-soft"
                      >
                        <Icon name="clock-3" size={20} />
                        Reschedule
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); if (isMultiCw) setMultiAction("cancel"); else setCancelConfirmOpen(true); }}
                      className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-danger hover:bg-default-soft"
                    >
                      <Icon name="x" size={20} />
                      Cancel Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          )}
        </div>

        {isMultiCw ? (
          <MultiCwDetails
            booking={booking}
            status={cancelled ? "Cancelled" : status}
            multi={multi}
            activeTab={activeTab === "Booking Details" ? "Overview" : activeTab}
            onTabChange={(t) => setActiveTab(t === "Overview" ? "Booking Details" : t)}
            expanded={multiExpanded}
            onToggleExpanded={() => setMultiExpanded((v) => !v)}
            resolveStation={(s) => baseStationOverrides[s] ?? s}
            briefingRooms={briefingRooms}
            onReassign={(kind, current) => setReassignTarget({ kind, current })}
            ownership={transferredPair}
            tabContent={
              activeTab === "Lane Configuration" ? (
                <LaneConfigurationTab
                  id={booking.id}
                  bookingId={booking.bookingId}
                  program={booking.program}
                  courseware={multi.list[multi.selected]?.name ?? ""}
                  flatStations={baseStations}
                  cShapedStations={cShapedStations}
                  flatQty={booking.baseStationQty}
                  cShapedQty={booking.cShapedStationQty}
                />
              ) : activeTab === "Nominal Roll" ? (
                <NominalRollTab booking={booking} coursewares={coursewareList} courseware={multi.list[multi.selected]?.name ?? ""} />
              ) : activeTab === "Detail List" && isUpcoming && readiness.blocked ? (
                <DetailListBanner readiness={readiness} />
              ) : (
                <div className="bg-white rounded-xl border border-figma-subtle p-10 flex items-center justify-center text-sm text-figma-disabled">
                  {activeTab} — coming soon.
                </div>
              )
            }
          />
        ) : (<>
        {/* Figma `Tab Item/Base v2` has a `Count` property: off for a single-courseware booking
            (5511:16209), on — the courseware count — when the booking holds several. */}
        <div className="flex items-center gap-1 border-b border-figma-subtle mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-figma-primary text-figma-primary font-semibold"
                  : "border-transparent text-figma-body hover:text-figma-default"
              )}
            >
              {tab}
              {/* Figma `Badge Number` 16px: active `background/primary/default`, others `background/disabled`; text/base, ring border/base. */}
              {coursewareCount > 1 && <span
                className={cn(
                  "min-w-4 h-4 px-0.5 rounded-full ring-1 ring-base flex items-center justify-center text-xs font-semibold leading-4 text-invert-default",
                  activeTab === tab ? "bg-primary-default" : "bg-disabled",
                )}
              >
                {coursewareCount}
              </span>}
            </button>
          ))}
        </div>

        {activeTab === "Booking Details" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <BookingSummaryCards booking={booking} variant="page" session={isPostSession ? post.session : undefined} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <WeaponRoleCards booking={booking} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Section title="Base Station" count={baseStations.length + cShapedStations.length}>
                <div className="-mx-5 -mb-5">
                  {baseStations.map((station) => (
                    <StationRow
                      key={station}
                      label={station}
                      type="flat"
                      onReassign={isPostSession ? undefined : () => setReassignTarget({ kind: "base", current: station })}
                    />
                  ))}
                  {cShapedStations.map((station) => (
                    <StationRow
                      key={station}
                      label={station}
                      type="cshaped"
                      onReassign={isPostSession ? undefined : () => setReassignTarget({ kind: "cshaped", current: station })}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Briefing Room" count={briefingRooms.length}>
                {briefingRooms.length === 0 ? (
                  <p className="text-sm text-body">No briefing room required.</p>
                ) : (
                  <div className="-mx-5 -mb-5">
                    {briefingRooms.map((room) => (
                      <StationRow
                        key={room}
                        label={room}
                        onReassign={isPostSession ? undefined : () => setReassignTarget({ kind: "briefing", current: room })}
                      />
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* F-006 BD-1: Lane Configuration tab (Figma `Tab - Lane Config`, 5511:46139). */}
        {activeTab === "Lane Configuration" && (
          <LaneConfigurationTab
            id={booking.id}
            bookingId={booking.bookingId}
            program={booking.program}
            courseware={booking.courseware.split(",")[0]?.trim() ?? ""}
            flatStations={baseStations}
            cShapedStations={cShapedStations}
            flatQty={booking.baseStationQty}
            cShapedQty={booking.cShapedStationQty}
          />
        )}

        {/* F-008 BD-1: Nominal Roll tab (Figma `Tab - Nominal Roll`, 5511:21854 / 5511:53579). */}
        {activeTab === "Nominal Roll" && (
          <NominalRollTab booking={booking} coursewares={coursewareList} courseware={coursewareList[0] ?? ""} />
        )}

        {/* F-006 BD-21: Detail List of a booking not ready yet = the tab's own Alert (5513:254787). */}
        {activeTab === "Detail List" && isUpcoming && readiness.blocked ? (
          <DetailListBanner readiness={readiness} />
        ) : activeTab !== "Booking Details" && activeTab !== "Lane Configuration" && activeTab !== "Nominal Roll" && (
          <div className="bg-white rounded-xl border border-figma-subtle p-10 flex items-center justify-center text-sm text-figma-disabled">
            {activeTab} — coming soon.
          </div>
        )}
        </>)}
      </div>

      {reassignTarget && (
        <ReassignDrawer
          target={reassignTarget}
          onConfirm={handleReassignConfirm}
          onCancel={() => setReassignTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!onboardingConfirm}
        tone="neutral"
        icon="users-round"
        title={`Start onboarding for ${onboardingConfirm?.courseware ?? ""}?`}
        subtitle={onboardingConfirm?.schedule}
        confirmLabel="Start Onboarding"
        onCancel={() => setOnboardingConfirm(null)}
        onConfirm={() => {
          const url = onboardingConfirm?.url;
          setOnboardingConfirm(null);
          if (url) onNavigate?.(url);
        }}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        tone="warning"
        title="Cancel this training session?"
        subtitle={`This will cancel the booking for ${booking.program}, ${bookingDateLine}, ${bookingTimeLine}. Assigned stations and briefing rooms for this session will be released. This can't be undone.`}
        confirmLabel="Cancel Booking"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          setCancelConfirmOpen(false);
          setCancelled(true);
          setToast("Booking cancelled");
        }}
      />

      {rescheduleOpen && (
        <RescheduleView
          bookingId={booking.bookingId}
          program={booking.program}
          courseware={booking.courseware}
          currentDate={bookingDateLine}
          currentTime={bookingTimeLine}
          flatStations={baseStations.length || (cShapedStations.length ? 0 : booking.baseStationQty ?? 0)}
          cShapedStations={cShapedStations.length}
          onClose={() => setRescheduleOpen(false)}
          onConfirm={(r) => {
            setRescheduleOpen(false);
            setBookingTimeOverride(r.bookingTime);
            setToast(r.toast);
          }}
        />
      )}

      {isMultiCw && (
        <MultiCwActions
          action={multiAction}
          booking={booking}
          multi={multi}
          onClose={() => setMultiAction(null)}
          onToast={setToast}
          onCancelBooking={() => setCancelled(true)}
          onNavigate={onNavigate}
        />
      )}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} />
    </div>
  );
}

function StationRow({ label, type, onReassign }: { label: string; type?: "flat" | "cshaped"; onReassign?: () => void }) {
  // Figma `Table - Body Cell` (5511:16209): plain row, 12/20 padding, divider
  // between rows — not a bordered box. Badge - Base Station: pill with
  // invert border (Flat Screen = danger, C-Shaped = info). Reassign: 36px
  // outline button, `card/border-neutral`.
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-invert-default">
      <span className="flex items-center gap-2 text-sm text-default">
        {label}
        {type && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full border text-xs font-medium leading-4",
              type === "flat"
                ? "bg-danger-invert-default border-invert-danger text-danger"
                : "bg-info-invert-default border-invert-info text-info",
            )}
          >
            {type === "flat" ? "Flat Screen" : "C-Shaped"}
          </span>
        )}
      </span>
      {/* F-006 BD-23: no Reassign once the session is over (5029:55565 …). */}
      {onReassign && (
        <button
          type="button"
          onClick={onReassign}
          className="h-9 px-4 text-sm font-semibold text-default border border-card-neutral rounded-lg bg-surface hover:bg-default-soft transition-colors"
        >
          Reassign
        </button>
      )}
    </div>
  );
}
