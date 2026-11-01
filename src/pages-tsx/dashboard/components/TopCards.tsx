import { cn } from "@/lib/utils";
import type { ViewMode } from "../types";
import { TOP_CARDS_DATA } from "../constants";

interface TopCardsProps {
  view: ViewMode;
}

/** Threshold pill — Figma turns it green only at 100%, danger below that. */
function PercentBadge({ pct, suffix }: { pct: number; suffix: string }) {
  const complete = pct >= 100;
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        complete ? "bg-success-invert-default text-success" : "bg-danger-invert-default text-danger",
      )}
    >
      {pct}% {suffix}
    </span>
  );
}

/** One metric column — label + value. The bar lives under the whole grid (StackedBar). */
function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-body">{label}</p>
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
    </div>
  );
}

/**
 * ONE stacked, proportional progress bar under the metric grid — Figma
 * `Progress` row (494px wide, 4px gap, 8px tall, fully rounded segments):
 * Done/Returned (`background/success/default`) · Ongoing/Pending
 * (`background/warning/default`) · Awaiting (`background/primary/default`).
 * Each segment's width follows its share of the total; zero-value segments are
 * dropped. Proof: Filled 4/2/2 of 8 (5654:75643) = 50/25/25, All Completed
 * (5673:49394) = one full green bar, Empty (5029:16153) = no bar at all.
 */
function StackedBar({ segments }: { segments: { value: number; bar: string }[] }) {
  const shown = segments.filter((s) => s.value > 0);
  if (shown.length === 0) return null;
  return (
    <div className="flex gap-1">
      {shown.map((s, i) => (
        <div
          key={i}
          className={cn("h-2 min-w-0 rounded-full transition-all duration-500", s.bar)}
          style={{ flex: `${s.value} 1 0%` }}
        />
      ))}
    </div>
  );
}

export function TopCards({ view }: TopCardsProps) {
  const d = TOP_CARDS_DATA[view];
  const bookingPct = d.booking.total ? Math.round((d.booking.done / d.booking.total) * 100) : 0;
  const assetPct = d.asset.issued ? Math.round((d.asset.returned / d.asset.issued) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bookings */}
      <div className="bg-surface rounded-xl border border-invert-default p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-caption uppercase tracking-wide">
            {d.bookingLabel}
          </span>
          <PercentBadge pct={bookingPct} suffix="done" />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-4">
            <Metric label="Total"    value={d.booking.total}    color="text-default" />
            <Metric label="Done"     value={d.booking.done}     color="text-success" />
            <Metric label="Ongoing"  value={d.booking.ongoing}  color="text-warning" />
            <Metric label="Awaiting" value={d.booking.awaiting} color="text-danger"  />
          </div>
          <StackedBar
            segments={[
              { value: d.booking.done,     bar: "bg-success-default" },
              { value: d.booking.ongoing,  bar: "bg-warning-default" },
              { value: d.booking.awaiting, bar: "bg-primary-default" },
            ]}
          />
        </div>
      </div>

      {/* Asset Overview */}
      <div className="bg-surface rounded-xl border border-invert-default p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-caption uppercase tracking-wide">
            Asset Overview
          </span>
          <PercentBadge pct={assetPct} suffix="returned" />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-4">
            <Metric label="Total Issued"   value={d.asset.issued}   color="text-default" />
            <Metric label="Returned"       value={d.asset.returned} color="text-success" />
            <Metric label="Pending Return" value={d.asset.pending}  color="text-warning" />
            <Metric label="Awaiting"       value={d.asset.awaiting} color="text-danger"  />
          </div>
          <StackedBar
            segments={[
              { value: d.asset.returned, bar: "bg-success-default" },
              { value: d.asset.pending,  bar: "bg-warning-default" },
              { value: d.asset.awaiting, bar: "bg-primary-default" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
