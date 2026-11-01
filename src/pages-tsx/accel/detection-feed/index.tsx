import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/checkbox";
import { Select } from "@/components/select";
import { DatePickerFilter } from "@/components/date-picker-filter";
import { cn } from "@/lib/utils";
import { DateRangeBar, PageTitle, StatCard, StatusPill, type Severity } from "../shared";
import { useAccel } from "../store";
import { ASSIGNEES, DAY_LABEL, TODAY, type FeedEvent, type Status } from "./data";
import { BTN_OUTLINE, BTN_PRIMARY, BTN_TEXT, EventCard } from "./EventCard";
import { EventDrawer } from "./EventDrawer";

/*
 * Accel → Detection Feed. Reference screenshots (6 Oct 2026) gave the list and the drawer;
 * this is the second pass, redesigned around the operator's actual job: work a queue of
 * AI-flagged events quickly and leave a record. Changes from the first build:
 *  · The summary cards are filters (click Critical → critical only) — they were inert numbers.
 *  · Severity and status filters are always visible; they were behind a "Filters · 1 active"
 *    accordion whose one "active" filter was just the date range.
 *  · Default order is PRIORITY (critical first, then newest), with Newest / Oldest still there.
 *  · Select boxes now do something: a bulk bar to escalate or dismiss several at once.
 *  · Dismiss is undoable, and "Dismissed (n)" opens a list with Restore.
 *  · State lives in the shared store, so the top-bar pill and sidebar badge stay in step.
 * Still assumed (not in the screenshots): the filter set, bulk behaviour, the Dismissed view,
 * and everything in the Escalate / Link forms.
 */

type RangeKey = "all" | "today" | "yesterday" | "week" | "month" | "custom";
const RANGES: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];
const RANGE_LABEL: Record<Exclude<RangeKey, "custom">, string> = {
  all: "All time", today: "Today", yesterday: "Yesterday", week: "This Week", month: "This Month",
};
const SEVERITIES: Severity[] = ["critical", "medium", "low"];
const SEV_RANK: Record<Severity, number> = { critical: 0, medium: 1, low: 2 };
const STATUSES: Exclude<Status, "dismissed">[] = ["pending", "escalated"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function DetectionFeed() {
  const { events, dismissedBefore, escalate, link, dismiss, restore } = useAccel();
  const [params] = useSearchParams();

  // Deep links (the top-bar "need attention" pill, dashboard cards) arrive as ?severity=&status=
  const fromUrl = <T extends string>(key: string, allowed: readonly T[]) =>
    (params.get(key)?.split(",") ?? []).filter((v): v is T => (allowed as readonly string[]).includes(v));

  const [range, setRange] = useState<RangeKey>(params.get("severity") || params.get("status") ? "all" : "today");
  const [custom, setCustom] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sevFilter, setSevFilter] = useState<Severity[]>(() => fromUrl("severity", SEVERITIES));
  const [statusFilter, setStatusFilter] = useState<Status[]>(() => fromUrl("status", STATUSES));
  const [sort, setSort] = useState<"priority" | "newest" | "oldest">("priority");
  const [view, setView] = useState<"feed" | "dismissed">("feed");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [intent, setIntent] = useState<"escalate" | "link" | null>(null);
  const [bulkOwner, setBulkOwner] = useState("");

  const live = events.filter((e) => e.status !== "dismissed");
  const count = (s: Severity) => live.filter((e) => e.severity === s).length;
  const sites = new Set(live.map((e) => e.site)).size;
  const dismissedNow = events.filter((e) => e.status === "dismissed");

  const inRange = useCallback(
    (e: FeedEvent) => {
      if (range === "all" || range === "month" || range === "week") return true; // both example days share a week/month
      if (range === "today") return e.day === TODAY;
      if (range === "yesterday") return e.day === "2026-05-18";
      return !!custom && e.day === ymd(custom);
    },
    [range, custom],
  );

  const visible = useMemo(() => {
    const base = view === "dismissed" ? dismissedNow : live.filter(inRange);
    return base
      .filter((e) => !sevFilter.length || sevFilter.includes(e.severity))
      .filter((e) => view === "dismissed" || !statusFilter.length || statusFilter.includes(e.status))
      .sort((a, b) => {
        const t = (a.day + a.time).localeCompare(b.day + b.time);
        if (sort === "oldest") return t;
        if (sort === "priority" && a.day === b.day && a.severity !== b.severity) return SEV_RANK[a.severity] - SEV_RANK[b.severity];
        return -t;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, view, inRange, sevFilter, statusFilter, sort]);

  const groups = useMemo(() => {
    const m = new Map<FeedEvent["day"], FeedEvent[]>();
    for (const e of visible) m.set(e.day, [...(m.get(e.day) ?? []), e]);
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [visible]);

  // Drawer navigation follows the order on screen (groups flattened).
  const ordered = groups.flatMap(([, l]) => l);
  const idx = ordered.findIndex((e) => e.id === openId);
  const openEvent = idx >= 0 ? ordered[idx] : null;
  const open = (id: string, i: "escalate" | "link" | null = null) => {
    setIntent(i);
    setOpenId(id);
  };
  const go = (to: number) => ordered[to] && open(ordered[to].id);

  const showing =
    range === "custom" && custom ? `${custom.getDate()} ${MON[custom.getMonth()]} ${custom.getFullYear()}` : RANGE_LABEL[range as Exclude<RangeKey, "custom">];
  const pendingShown = visible.filter((e) => e.status === "pending").length;
  const filtersOn = range !== "all" || sevFilter.length > 0 || statusFilter.length > 0;
  const clearAll = () => {
    setRange("all");
    setSevFilter([]);
    setStatusFilter([]);
  };
  const selectablePending = visible.filter((e) => e.status === "pending").map((e) => e.id);
  const selectedPending = selected.filter((id) => selectablePending.includes(id));

  // After acting on an event, move the queue on rather than closing the drawer.
  const advanceFrom = (id: string, leaves: boolean) => {
    const i = ordered.findIndex((e) => e.id === id);
    const after = ordered.slice(i + 1).find((e) => e.status === "pending");
    if (after) return open(after.id);
    if (leaves) {
      const prev = ordered[i - 1];
      return prev ? open(prev.id) : setOpenId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Detection Feed"
        badge={<StatusPill>LIVE</StatusPill>}
        subtitle="AI-flagged events across all sites. Triage, dismiss, or escalate to a case."
        right={
          <button
            type="button"
            onClick={() => setView((v) => (v === "feed" ? "dismissed" : "feed"))}
            aria-pressed={view === "dismissed"}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold hover:bg-main-background",
              view === "dismissed" ? "border-primary text-primary" : "border-invert-default text-default",
            )}
          >
            <Icon name={view === "dismissed" ? "arrow-right" : "trash-2"} size={16} className={view === "dismissed" ? "rotate-180" : undefined} />
            {view === "dismissed" ? "Back to feed" : `Dismissed (${dismissedBefore})`}
          </button>
        }
      />

      {view === "feed" && (
        <>
          <div className="flex gap-4">
            <StatCard label="Total" value={live.length} sub={`Across ${sites} sites`} tone="primary" onClick={clearAll} active={!filtersOn} hint="Show everything" />
            {SEVERITIES.map((s) => (
              <StatCard
                key={s}
                label={s}
                value={count(s)}
                sub={{ critical: "Immediate threat", medium: "Needs review", low: "Informational" }[s]}
                tone={{ critical: "danger", medium: "warning", low: "info" }[s] as "danger" | "warning" | "info"}
                valueTone={{ critical: "danger", medium: "warning", low: "info" }[s] as "danger" | "warning" | "info"}
                onClick={() => setSevFilter(sevFilter.length === 1 && sevFilter[0] === s ? [] : [s])}
                active={sevFilter.length === 1 && sevFilter[0] === s}
                hint={`Show only ${s}`}
              />
            ))}
            <StatCard
              label="Pending"
              value={live.filter((e) => e.status === "pending").length}
              sub="Awaiting triage"
              tone="warning"
              valueTone="warning"
              onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "pending" ? [] : ["pending"])}
              active={statusFilter.length === 1 && statusFilter[0] === "pending"}
              hint="Show only pending"
            />
            <StatCard
              label="Escalated"
              value={live.filter((e) => e.status === "escalated").length}
              sub="In incident case"
              tone="success"
              valueTone="success"
              onClick={() => setStatusFilter(statusFilter.length === 1 && statusFilter[0] === "escalated" ? [] : ["escalated"])}
              active={statusFilter.length === 1 && statusFilter[0] === "escalated"}
              hint="Show only escalated"
            />
          </div>

          <DateRangeBar
            options={RANGES}
            value={range}
            onChange={setRange}
            customKey="custom"
            customLabel={range === "custom" && custom ? showing : "Custom Date"}
            onCustomClick={() => setPickerOpen((o) => !o)}
            customPicker={
              pickerOpen && (
                <div className="absolute left-0 top-full z-[2000] mt-2">
                  <div className="relative">
                    <DatePickerFilter
                      value={custom}
                      onApply={(d) => {
                        setCustom(d);
                        setRange("custom");
                      }}
                      onClear={() => {
                        setCustom(null);
                        setRange("all");
                      }}
                      onClose={() => setPickerOpen(false)}
                    />
                  </div>
                </div>
              )
            }
          />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-invert-default bg-surface px-5 py-3">
            <FilterGroup label="Severity">
              {SEVERITIES.map((s) => (
                <FilterChip key={s} active={sevFilter.includes(s)} onClick={() => setSevFilter(toggle(sevFilter, s))}>{s}</FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Status">
              {STATUSES.map((s) => (
                <FilterChip key={s} active={statusFilter.includes(s)} onClick={() => setStatusFilter(toggle(statusFilter, s))}>{s}</FilterChip>
              ))}
            </FilterGroup>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-body">Sort</span>
              <Select
                options={[
                  { value: "priority", label: "Priority" },
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
                value={sort}
                onChange={(v) => setSort(v as typeof sort)}
                size="sm"
                wrapperClassName="w-[150px]"
              />
            </div>
          </div>
        </>
      )}

      {view === "dismissed" && (
        <p className="rounded-xl border border-invert-default bg-surface px-5 py-4 text-sm text-body">
          Showing events you dismissed in this session — restore one to return it to the feed.{" "}
          {dismissedBefore - dismissedNow.length} earlier dismissals are archived and not listed.
        </p>
      )}

      {/* Result line + select-all */}
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-3 text-sm text-body">
          {view === "feed" && selectablePending.length > 0 && (
            <Checkbox
              id="select-all"
              name="select-all"
              size={18}
              label="Select all pending"
              checked={selectedPending.length === selectablePending.length}
              indeterminate={selectedPending.length > 0 && selectedPending.length < selectablePending.length}
              onChange={() => setSelected(selectedPending.length === selectablePending.length ? [] : selectablePending)}
            />
          )}
          <span>
            <span className="font-semibold text-default">{visible.length}</span> {view === "feed" ? "events match" : "dismissed"}
            {view === "feed" && <> · {pendingShown} pending</>}
            {view === "feed" && filtersOn && (
              <>
                {" "}
                <button type="button" onClick={clearAll} className="text-default underline hover:text-primary">Clear all</button>
              </>
            )}
          </span>
        </p>
      </div>

      {/* Bulk bar — appears as soon as something is selected */}
      {selectedPending.length > 0 && (
        <div className="sticky top-0 z-20 flex items-center gap-3 rounded-xl border border-primary bg-surface px-5 py-3 shadow-lg">
          <span className="text-sm font-semibold text-default">{selectedPending.length} selected</span>
          <div className="ml-auto flex items-center gap-3">
            <Select options={ASSIGNEES} value={bulkOwner} onChange={setBulkOwner} placeholder="Assign to…" size="sm" wrapperClassName="w-[170px]" />
            <button
              type="button"
              disabled={!bulkOwner}
              onClick={() => {
                escalate(selectedPending, bulkOwner);
                setSelected([]);
              }}
              className={cn(BTN_PRIMARY, "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled")}
            >
              Escalate
            </button>
            <button
              type="button"
              onClick={() => {
                dismiss(selectedPending);
                setSelected([]);
              }}
              className={cn(BTN_OUTLINE, "text-danger")}
            >
              Dismiss
            </button>
            <button type="button" onClick={() => setSelected([])} className={BTN_TEXT}>Clear</button>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-invert-default bg-surface py-14 text-center">
          <p className="text-sm font-semibold text-body">{view === "dismissed" ? "Nothing dismissed yet" : "No events to show"}</p>
          <p className="mt-1 text-sm text-disabled">
            {view === "dismissed" ? "Dismissed events will appear here." : "Try a different date range or clear the filters."}
          </p>
        </div>
      ) : (
        groups.map(([day, list]) => (
          <section key={day} className="flex flex-col gap-3">
            <h2 className="text-sm text-body">
              <span className="font-semibold text-default">{DAY_LABEL[day]}</span> &nbsp; {list.length} events
            </h2>
            <ul className="flex flex-col gap-3">
              {list.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  selected={selected.includes(e.id)}
                  onSelect={() => setSelected(toggle(selected, e.id))}
                  onOpen={(i) => open(e.id, i ?? null)}
                  onDismiss={() => dismiss([e.id])}
                  onRestore={() => restore(e.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <EventDrawer
        event={openEvent}
        intent={intent}
        position={{ index: Math.max(idx, 0), total: ordered.length }}
        onClose={() => setOpenId(null)}
        onPrev={() => go(idx - 1)}
        onNext={() => go(idx + 1)}
        onEscalate={(id, who, note) => {
          escalate([id], who, note);
          advanceFrom(id, false);
        }}
        onLink={(id, caseId) => link(id, caseId)}
        onDismiss={(id) => {
          dismiss([id]);
          advanceFrom(id, true);
        }}
      />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-body">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-full border px-4 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
        active ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-surface text-default hover:bg-main-background",
      )}
    >
      {children}
    </button>
  );
}
