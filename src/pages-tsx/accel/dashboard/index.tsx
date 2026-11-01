import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Icon } from "@/components/icon";
import { DatePickerFilter } from "@/components/date-picker-filter";
import { selectPendingCritical, useAccel } from "../store";
import { cn } from "@/lib/utils";
import {
  DateRangeBar,
  PageTitle,
  SEVERITY_EDGE,
  SectionCard,
  SeverityChip,
  StatCard,
  StatusPill,
  toneColor,
  severityTone,
} from "../shared";
import {
  ACTIVITY,
  ALERT_EVENTS,
  INCIDENT_CASES,
  KIND_TONE,
  RANGES,
  RANGE_OPTIONS,
  STATIONS,
  type ActivityRow,
  type RangeKey,
  type StationId,
} from "./data";
import { AlertsChart } from "./AlertsChart";

/*
 * Accel → Dashboard, from three reference screenshots (6 Oct 2026). No Figma, no PRD.
 * Not drawn: the notification bell (see AccelLayout). Which numbers change with the
 * date range is ASSUMED — the screenshots only show "Today" and a monthly chart:
 * here the range drives "Showing … · N events" and the chart/stations block, while
 * the LIVE STATUS cards and the lists below stay as they are.
 */

const fmt = (d: Date) =>
  `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getFullYear()}`;


// Recent Activity Log: When (monospace age over the area) · Type chip · Activity (who in bold).
const activityColumns = [
  {
    id: "when",
    width: 220,
    header: () => "When",
    cell: ({ row }: any) => (
      <div className="flex flex-col">
        <span className="font-mono text-xs text-body">{row.original.when}</span>
        <span className="text-xs text-caption">{row.original.area}</span>
      </div>
    ),
  },
  {
    id: "type",
    width: 200,
    header: () => "Type",
    cell: ({ row }: any) => (
      <span
        className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
        style={{ borderColor: toneColor(KIND_TONE[row.original.kind as ActivityRow["kind"]]), color: toneColor(KIND_TONE[row.original.kind as ActivityRow["kind"]]) }}
      >
        {row.original.kind}
      </span>
    ),
  },
  {
    id: "activity",
    header: () => "Activity",
    cell: ({ row }: any) => (
      <span className="text-sm text-body">
        <span className="font-medium text-default">{row.original.who}</span> {row.original.what}
      </span>
    ),
  },
] as ColumnDef<ActivityRow, any>[];


function AttentionStrip({ pendingCritical }: { pendingCritical: number }) {
  const items = [
    pendingCritical > 0 && { to: "/accel/detection-feed?severity=critical&status=pending", n: pendingCritical, text: pendingCritical === 1 ? "critical event waiting for triage" : "critical events waiting for triage" },
    { to: "/accel/detection-feed?status=pending", n: 2, text: "weapons missing from racks" },
    { to: "/accel/incident-cases", n: 1, text: "critical case still open" },
  ].filter(Boolean) as { to: string; n: number; text: string }[];

  if (!items.length) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success bg-success-invert-soft px-5 py-4 text-sm font-medium text-success">
        <Icon name="circle-check" size={18} />
        Nothing needs attention right now.
      </div>
    );
  }
  return (
    <section aria-label="Needs attention" className="flex items-stretch overflow-hidden rounded-xl border border-danger bg-danger-invert-soft">
      <span className="flex items-center gap-2 border-r border-danger px-5 text-xs font-semibold uppercase tracking-wider text-danger">
        <Icon name="triangle-alert" size={16} />
        Needs attention
      </span>
      {items.map((it) => (
        <Link
          key={it.text}
          to={it.to}
          className="flex flex-1 items-center gap-3 border-r border-danger/30 px-5 py-3 transition-colors last:border-r-0 hover:bg-danger-invert-default focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused"
        >
          <span className="text-2xl font-semibold text-danger">{it.n}</span>
          <span className="text-sm text-default">{it.text}</span>
          <Icon name="arrow-right" size={14} className="ml-auto text-danger" />
        </Link>
      ))}
    </section>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const pendingCritical = useAccel(selectPendingCritical);
  const [hidden, setHidden] = useState<StationId["id"][]>([]);
  const [range, setRange] = useState<RangeKey>("today");
  const [custom, setCustom] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // A single custom day has no hourly data of its own here — it reuses yesterday's shape.
  const data = RANGES[range === "custom" ? "yesterday" : range];
  const showing =
    range === "custom" && custom
      ? fmt(custom)
      : RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "Today";

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Accel TOMS · Dashboard"
        subtitle="Training resource overview — weapon tracking, base-station alerts, cases and activity for Kingsmere Camp."
        right={<StatusPill>All Systems Operational</StatusPill>}
      />

      {/* The first thing on the page is the answer to "what needs me right now?" — it used to be five
          equal-weight cards with the problems ("2 missing", "1 critical") in small grey sub-text. */}
      <AttentionStrip pendingCritical={pendingCritical} />

      <DateRangeBar
        options={RANGE_OPTIONS}
        value={range}
        onChange={(k) => setRange(k)}
        customKey="custom"
        customLabel={range === "custom" && custom ? fmt(custom) : "Custom Date"}
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
                    setRange("today");
                  }}
                  onClose={() => setPickerOpen(false)}
                />
              </div>
            </div>
          )
        }
        right={
          <span className="text-sm text-body">
            Showing <span className="font-semibold text-default">{showing}</span> ·{" "}
            <span className="text-caption">{data.events} events</span>
          </span>
        }
      />

      <div className="flex items-stretch gap-6">
        <div className="flex flex-[3] flex-col gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-body">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor("success") }} />
            Live status
            <span className="font-normal normal-case tracking-normal text-caption">· right now, not affected by the date range</span>
          </span>
          <div className="flex flex-1 gap-4">
            <StatCard label="Sites" value="3" sub="3 active" tone="primary" />
            <StatCard label="Weapons detected" value="18" of="/ 20" sub="2 missing from racks" subTone="danger" tone="success" valueTone="success" onClick={() => navigate("/accel/detection-feed?status=pending")} hint="See the pending events" />
            <StatCard label="Cameras" value="142" of="/ 150" sub="8 offline" subTone="danger" tone="purple" valueTone="purple" onClick={() => navigate("/accel/live-monitoring")} hint="Open Live Monitoring" />
          </div>
        </div>
        <div className="w-px bg-[rgb(var(--color-border-invert-default))]" />
        <div className="flex flex-[1.3] flex-col gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-body">
            Period · {showing}
            <span className="font-normal normal-case tracking-normal text-caption">· also drives the chart below</span>
          </span>
          <div className="flex flex-1 gap-4">
            <StatCard label="Events" value={data.events} sub={showing} tone="info" valueTone="info" onClick={() => navigate("/accel/detection-feed")} hint="Open the Detection Feed" />
            <StatCard label="Open cases" value="2" sub="1 critical" subTone="danger" tone="danger" valueTone="danger" onClick={() => navigate("/accel/incident-cases")} hint="Open Incident Cases" />
          </div>
        </div>
      </div>

      <SectionCard title="Alerts by Base Station — Severity Breakdown" to="/accel/detection-feed" linkLabel="View feed">
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {STATIONS.map((s) => {
              const on = !hidden.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  title={on ? `Hide ${s.id}` : `Show ${s.id}`}
                  onClick={() => setHidden((h) => (h.includes(s.id) ? h.filter((x) => x !== s.id) : [...h, s.id]))}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
                    !on && "opacity-40",
                  )}
                  style={{ borderColor: toneColor(s.tone), color: toneColor(s.tone) }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(s.tone) }} />
                  {s.id}
                  <span className="rounded-full bg-main-background px-1.5 text-[11px] text-body">{data.stations[s.id].alerts}</span>
                </button>
              );
            })}
            <span className="text-xs text-caption">Click a station to hide or show its line · hover the chart for values</span>
          </div>

          <AlertsChart data={data} visible={STATIONS.map((x) => x.id).filter((id) => !hidden.includes(id))} />

          <div className="grid grid-cols-3 gap-4">
            {STATIONS.map((s) => {
              const st = data.stations[s.id];
              return (
                <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-invert-default p-4">
                  <span className="flex items-center gap-2 text-sm text-default">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneColor(s.tone) }} />
                    {s.id}
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold text-default">{st.alerts}</span>
                    <span className="font-mono text-xs text-body">alerts</span>
                  </span>
                  <span className="flex gap-2">
                    {(["critical", "medium", "low"] as const).map((sev, i) => (
                      <span
                        key={sev}
                        className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold"
                        style={{ borderColor: toneColor(severityTone(sev)), color: toneColor(severityTone(sev)) }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(severityTone(sev)) }} />
                        {st.split[i]}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 items-start gap-6">
        <SectionCard title="Detected Alert Events" to="/accel/detection-feed">
          <ul className="flex flex-col gap-2 p-4">
            {ALERT_EVENTS.map((e) => (
              <li key={e.id}>
              <Link
                to={`/accel/detection-feed?severity=${e.severity}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-l-4 border-invert-default py-3 pl-3 pr-4 transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
                  SEVERITY_EDGE[e.severity],
                )}
              >
                <SeverityChip severity={e.severity} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-default">{e.title}</p>
                  <p className="truncate text-xs text-body">{e.detail}</p>
                </div>
                {e.caseId && (
                  <span className="rounded-full border border-info bg-info-invert-soft px-2.5 py-0.5 font-mono text-xs text-info">
                    {e.caseId}
                  </span>
                )}
                <span className="font-mono text-xs text-body">{e.time}</span>
              </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Incident Cases" to="/accel/incident-cases">
          <ul className="flex flex-col gap-2 p-4">
            {INCIDENT_CASES.map((c) => (
              <li key={c.id}>
              <Link to="/accel/incident-cases" className="flex items-center gap-3 rounded-lg border border-invert-default py-3 pl-3 pr-4 transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-main-background text-body">
                  <Icon name="folder-open" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-default">{c.title}</p>
                  <p className="truncate text-xs text-body">{c.meta}</p>
                </div>
                <SeverityChip severity={c.severity} />
              </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent Activity Log" to="/accel/activity-logs" linkLabel="View full log">
        <TableCustom columns={activityColumns} data={ACTIVITY} autoScrollTable={false} />
      </SectionCard>
    </div>
  );
}

