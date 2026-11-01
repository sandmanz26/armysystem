// Booking Details 2.0 — page body for a booking with MULTIPLE courseware.
//
// Figma page `Booking Details: Upcoming` (5834:183279), frame `Details` 5834:183285; same layout in
// `Upcoming (Asset Issued)` 6829:37016, Ongoing 6831:41410 and Completed 6851:144584. Below the page
// header (owned by detail/index.tsx):
//   1. `Booking Details Item - Details Multi CW` — Section Layout, "Booking Details" + tertiary link
//      "View Details ⌄". Collapsed: one row of icon/value items (clipboard-list "6 Courseware" ·
//      calendar-clock booking range · package-check "2 of 6 Assignment IDs issued"), 20 apart.
//      Expanded (`Dropdown - More Icon` 6495:72004 shows it): "Hide Details ⌃" and a 4-column grid
//      Training Type · Training Mode · Unit Name · Dry Run Training / FTMS File ID · Instructor ·
//      Created on · Total Courseware / Assignment IDs · Total Booking Time (2 columns).
//   2. A row, 16 apart: the 256px `Courseware` list (one 100px `Courseware Vertical - Selection`
//      per courseware: "Courseware #n" + status badge (Xs), name, two schedule lines; selected =
//      primary/invert/soft fill, 4px primary left bar, name Semi Bold) and, beside it, the tabs
//      Overview · Nominal Roll · Lane Configuration · Detail List (no count badges) scoped to the
//      selected courseware. Overview = Courseware Details (3 columns) · Weapon Type · Base Station
//      + Briefing Room. Figma's Overview has no Role card.
// "View Details" therefore expands the booking-level card; a courseware's own details are shown by
// selecting it in the list (there is no per-courseware "View Details" link in these frames).
import type { ReactNode } from "react";
import type { Booking } from "@/data/mock";
import { Icon, type IconName } from "@/components/icon";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { Section } from "@/pages-tsx/booking-2/components/BookingSummaryCards";
import { cn } from "@/lib/utils";
import { bookingRange, listLines, sessionLine, type MultiCw, type MultiCwState } from "./multiCw";

export type MultiCwTab = "Overview" | "Nominal Roll" | "Lane Configuration" | "Detail List";
const TABS: MultiCwTab[] = ["Overview", "Nominal Roll", "Lane Configuration", "Detail List"];

const STATUS_TONE: Record<string, BadgeTone> = {
  Upcoming: "info",
  Ongoing: "orange",
  Completed: "success",
  Cancelled: "neutral",
  Overdue: "danger",
};

interface Props {
  booking: Booking;
  /** Booking-level status already resolved by the page (session override / cancelled). */
  status: string;
  multi: MultiCwState;
  activeTab: MultiCwTab;
  onTabChange: (tab: MultiCwTab) => void;
  /** Content for the Nominal Roll / Lane Configuration / Detail List tabs (owned by the page). */
  tabContent?: ReactNode;
  expanded: boolean;
  onToggleExpanded: () => void;
  /** Station / room names after the page's Reassign overrides. */
  resolveStation: (name: string) => string;
  briefingRooms: string[];
  onReassign: (kind: "base" | "briefing", current: string) => void;
  /** F-012 (BD-19): after Ready For Return handed courseware `from`'s assets to courseware `to`. */
  ownership?: { from: number; to: number } | null;
}

export function MultiCwDetails({
  booking, status, multi, activeTab, onTabChange, tabContent, expanded, onToggleExpanded,
  resolveStation, briefingRooms, onReassign, ownership,
}: Props) {
  const list = multi.list;
  const cw = list[multi.selected];
  const issued = list.filter((c) => c.assignmentId).length;
  const range = bookingRange(list.filter((c) => !c.cancelled).length ? list.filter((c) => !c.cancelled) : list);
  const cwStatus = (c: MultiCw) => (c.cancelled ? "Cancelled" : status);

  return (
    <div className="flex flex-col gap-6">
      <BookingOverviewCard
        booking={booking}
        count={list.length}
        issued={issued}
        range={range}
        expanded={expanded}
        onToggle={onToggleExpanded}
      />

      <div className="flex items-start gap-4">
        {/* Booking Details - Courseware Selection (256 wide). */}
        <div className="w-64 flex-shrink-0 overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
          <h2 className="flex items-center gap-2 p-5 text-base font-semibold leading-6 text-default">
            Courseware <span className="text-body">{list.length}</span>
          </h2>
          <div role="listbox" aria-label="Courseware">
            {list.map((c) => {
              const selected = c.index === multi.selected;
              const [line1, line2] = listLines(c.schedule);
              return (
                <button
                  key={c.index}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => multi.setSelected(c.index)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-invert-default py-3 pr-5 text-left transition-colors last:border-b-0",
                    selected ? "border-l-4 border-l-primary bg-primary-invert-soft pl-4" : "pl-5 hover:bg-default-soft",
                  )}
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="flex-1 text-xs leading-4 text-body">Courseware #{c.index + 1}</span>
                    <StatusBadge tone={STATUS_TONE[cwStatus(c)] ?? "neutral"} className="py-0 leading-4">
                      {cwStatus(c)}
                    </StatusBadge>
                  </span>
                  <span className={cn("text-sm leading-5 text-default", selected ? "font-semibold" : "font-normal")}>{c.name}</span>
                  <span className="flex flex-col text-xs leading-4 text-body">
                    <span>{line1}</span>
                    {line2 && <span>{line2}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Tab Group v2 — 44px items, 16/12 padding, 14 Medium; active text/primary + 2px bar. */}
          <div className="flex border-b border-invert-default" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-3 text-sm font-medium leading-5 transition-colors",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-body hover:text-default",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Overview" && cw ? (
            <CoursewareOverview
              booking={booking}
              cw={cw}
              status={cwStatus(cw)}
              resolveStation={resolveStation}
              briefingRooms={briefingRooms}
              onReassign={onReassign}
              ownership={ownership}
            />
          ) : (
            tabContent
          )}
        </div>
      </div>
    </div>
  );
}

function BookingOverviewCard({
  booking, count, issued, range, expanded, onToggle,
}: {
  booking: Booking;
  count: number;
  issued: number;
  range: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [createdDate, createdTime] = (booking.createdOn ?? "").split(/\n|,\s*/);
  return (
    <div className="rounded-xl border border-invert-default bg-surface-lv1">
      <div className="flex items-center gap-5 p-5">
        <h2 className="flex-1 text-base font-semibold leading-6 text-default">Booking Details</h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex items-center gap-2 text-sm font-medium leading-5 text-primary hover:underline"
        >
          {expanded ? "Hide Details" : "View Details"}
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={18} />
        </button>
      </div>
      <div className="px-5 pb-5">
        {expanded ? (
          <div className="grid grid-cols-4 gap-5">
            <KeyValue label="Training Type" value={booking.trainingType} />
            <KeyValue label="Training Mode" value={booking.trainingMode} />
            <KeyValue label="Unit Name" value={booking.unitName} />
            <KeyValue label="Dry Run Training" value={booking.dryRunTraining ? "Yes" : "No"} />
            <KeyValue label="FTMS File ID" value={booking.ftmsFileId != null ? String(booking.ftmsFileId) : "-"} />
            <KeyValue label="Instructor" value={booking.instructorName ?? "-"} sub={booking.instructorPhone} />
            <KeyValue label="Created on" value={createdDate ? (createdTime ? `${createdDate}, ${createdTime}` : createdDate) : "-"} />
            <KeyValue label="Total Courseware" value={String(count)} />
            <KeyValue label="Assignment IDs" value={`${issued} of ${count} issued`} />
            <div className="col-span-2">
              <KeyValue label="Total Booking Time" value={range} />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-5">
            <IconValue icon="clipboard-list" strong={String(count)} text="Courseware" />
            <IconValue icon="calendar-clock" text={range} />
            <IconValue icon="package-check" strong={`${issued} of ${count}`} text="Assignment IDs issued" />
          </div>
        )}
      </div>
    </div>
  );
}

function IconValue({ icon, strong, text }: { icon: IconName; strong?: string; text: string }) {
  return (
    <span className="flex items-center gap-2 text-sm leading-5 text-default">
      <Icon name={icon} size={16} className="text-body" />
      <span className="flex gap-1">
        {strong && <span className="font-semibold">{strong}</span>}
        <span>{text}</span>
      </span>
    </span>
  );
}

function KeyValue({ label, value, sub, muted }: { label: string; value: ReactNode; sub?: string; muted?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-xs leading-4 text-body">{label}</p>
      <div className="flex flex-col gap-0.5">
        <div className={cn("text-sm font-semibold leading-5", muted ? "text-body" : "text-default")}>{value}</div>
        {sub && <p className="text-sm leading-5 text-default">{sub}</p>}
      </div>
    </div>
  );
}

function CoursewareOverview({
  booking, cw, status, resolveStation, briefingRooms, onReassign, ownership,
}: {
  booking: Booking;
  cw: MultiCw;
  status: string;
  resolveStation: (name: string) => string;
  briefingRooms: string[];
  onReassign: (kind: "base" | "briefing", current: string) => void;
  ownership?: { from: number; to: number } | null;
}) {
  const weapons = booking.weaponTypes ?? [];
  const notStarted = status === "Upcoming" || status === "Cancelled";
  const station = cw.baseStation ? resolveStation(cw.baseStation) : undefined;
  const reassignable = status === "Upcoming";

  return (
    <div className="flex flex-col gap-4">
      <Section title="Courseware Details">
        <div className="grid grid-cols-3 gap-5">
          <KeyValue label="Courseware" value={cw.name} />
          <KeyValue
            label="Assignment ID"
            value={
              cw.assignmentId ? (
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-primary">{cw.assignmentId}</span>
                  {/* BD-19: `Badge - Assignment Status` Ownership Transferred (6851:138477) / Ownership Received (6851:138496). */}
                  {ownership?.from === cw.index ? (
                    <StatusBadge tone="success">Ownership Transferred</StatusBadge>
                  ) : ownership?.to === cw.index ? (
                    <StatusBadge tone="purple">Ownership Received</StatusBadge>
                  ) : (
                    <StatusBadge tone="purple">Issued</StatusBadge>
                  )}
                </span>
              ) : (
                <StatusBadge tone="warning">Not Issued</StatusBadge>
              )
            }
          />
          <KeyValue label="Booking Time" value={cw.schedule.date || "-"} sub={sessionLine(cw.schedule) || undefined} />
          {/* Ongoing / Completed session stamps aren't in the mock — shown as "—" rather than invented. */}
          <KeyValue label="Session Start Time" value={notStarted ? "Not started" : "—"} muted={notStarted} />
          <KeyValue label="Session End Time" value={notStarted ? "Not started" : status === "Ongoing" ? "In progress" : "—"} muted={notStarted} />
          <KeyValue label="Total Duration" value="—" muted />
        </div>
      </Section>

      <Section title="Weapon Type" count={weapons.length}>
        {weapons.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {weapons.map((w) => (
              <span key={w} className="rounded bg-default-default px-2 py-1 text-sm leading-5 text-default">{w}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default">-</p>
        )}
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <TableSection title="Base Station" count={station ? 1 : 0}>
          {station ? (
            <ResourceRow
              label={station}
              badge
              onReassign={reassignable ? () => onReassign("base", cw.baseStation ?? station) : undefined}
            />
          ) : (
            <p className="px-5 py-4 text-sm leading-5 text-default">-</p>
          )}
        </TableSection>
        <TableSection title="Briefing Room" count={briefingRooms.length}>
          {briefingRooms.length === 0 ? (
            <p className="px-5 py-4 text-sm leading-5 text-default">No briefing room required.</p>
          ) : (
            briefingRooms.map((room) => (
              <ResourceRow
                key={room}
                label={room}
                onReassign={reassignable ? () => onReassign("briefing", room) : undefined}
              />
            ))
          )}
        </TableSection>
      </div>
    </div>
  );
}

/** Section Layout - Table: header, then rows on a top divider (5834:183285 Base Station / Briefing Room). */
function TableSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
      <h2 className="flex items-center gap-2 p-5 text-base font-semibold leading-6 text-default">
        {title} <span className="text-body">{count}</span>
      </h2>
      <div className="border-t border-invert-default">{children}</div>
    </div>
  );
}

function ResourceRow({ label, badge, onReassign }: { label: string; badge?: boolean; onReassign?: () => void }) {
  const cShaped = /c-shaped/i.test(label);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-invert-default px-5 py-4 last:border-b-0">
      <span className="flex items-center gap-2 text-sm leading-5 text-default">
        {label}
        {badge && (
          <StatusBadge tone={cShaped ? "info" : "danger"}>{cShaped ? "C-Shaped" : "Flat Screen"}</StatusBadge>
        )}
      </span>
      {onReassign && (
        <button
          type="button"
          onClick={onReassign}
          className="h-9 rounded-lg border border-card-neutral bg-surface px-4 text-sm font-semibold text-default transition-colors hover:bg-default-soft"
        >
          Reassign
        </button>
      )}
    </div>
  );
}
