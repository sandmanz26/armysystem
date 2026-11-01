import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Small pieces shared by the Accel pages (Dashboard, Detection Feed, Live Monitoring).
 * Colours are existing TOMS tokens only; where Tailwind has no utility for the variable
 * (a coloured top edge, a chart line) the CSS variable is referenced directly.
 */

export type Severity = "critical" | "medium" | "low";

export type Tone = "primary" | "success" | "purple" | "info" | "danger" | "warning";

const TONE_VAR: Record<Tone, string> = {
  primary: "--color-background-primary-default",
  success: "--color-text-success",
  purple: "--color-background-purple-default",
  info: "--color-text-info",
  danger: "--color-text-danger",
  warning: "--color-background-warning-default",
};

export const toneColor = (t: Tone) => `rgb(var(${TONE_VAR[t]}))`;

const SEVERITY_TONE: Record<Severity, Tone> = { critical: "danger", medium: "warning", low: "info" };
export const severityTone = (s: Severity) => SEVERITY_TONE[s];

const CHIP: Record<Severity, string> = {
  critical: "border-danger bg-danger-invert-soft text-danger",
  medium: "border-warning bg-warning-invert-soft text-warning",
  low: "border-info bg-info-invert-soft text-info",
};

export function SeverityChip({ severity, dot }: { severity: Severity; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
        CHIP[severity],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(SEVERITY_TONE[severity]) }} />}
      {severity}
    </span>
  );
}

/** Left edge of a row/card in the severity colour. */
export const SEVERITY_EDGE: Record<Severity, string> = {
  critical: "border-l-danger",
  medium: "border-l-warning",
  low: "border-l-info",
};

export function PageTitle({
  title,
  subtitle,
  badge,
  right,
}: {
  title: string;
  subtitle: string;
  badge?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-default">{title}</h1>
          {badge}
        </div>
        <p className="text-sm text-body">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

/** Green "LIVE" / "All Systems Operational" style pill. */
export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-success bg-success-invert-soft px-3 py-1 text-xs font-semibold text-success">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor("success") }} />
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  of,
  sub,
  subTone,
  tone,
  valueTone,
  onClick,
  active,
  hint,
}: {
  label: string;
  value: ReactNode;
  of?: string;
  sub: string;
  /** Colour the sub-line when it is a problem ("2 missing from racks"), not just a caption. */
  subTone?: Tone;
  tone: Tone;
  valueTone?: Tone;
  /** Makes the card a button — a number you can click should take you to what it counts. */
  onClick?: () => void;
  active?: boolean;
  hint?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={hint}
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-xl border border-t-2 bg-surface p-5 text-left",
        active ? "border-primary" : "border-invert-default",
        onClick && "cursor-pointer transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
      )}
      style={{ borderTopColor: toneColor(tone) }}
    >
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-body">
        {label}
        {onClick && <Icon name="arrow-up-right" size={14} />}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-default" style={valueTone ? { color: toneColor(valueTone) } : undefined}>
          {value}
        </span>
        {of && <span className="text-base text-body">{of}</span>}
      </span>
      <span className={cn("text-sm", subTone ? "font-medium" : "text-body")} style={subTone ? { color: toneColor(subTone) } : undefined}>
        {sub}
      </span>
    </Tag>
  );
}

export interface RangeOption<K extends string> {
  key: K;
  label: string;
}

/** "DATE RANGE" chip row; the active chip is outlined in the primary colour. */
export function DateRangeBar<K extends string>({
  options,
  value,
  onChange,
  right,
  customKey,
  customLabel,
  customPicker,
  onCustomClick,
}: {
  options: RangeOption<K>[];
  value: K;
  onChange: (k: K) => void;
  right?: ReactNode;
  /** The chip that opens the date picker instead of selecting directly. */
  customKey: K;
  customLabel: string;
  customPicker: ReactNode;
  onCustomClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-invert-default bg-surface px-5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-body">
          <Icon name="calendar" size={16} />
          Date range
        </span>
        {options.map((o) => (
          <Chip key={o.key} active={value === o.key} onClick={() => onChange(o.key)}>
            {o.label}
          </Chip>
        ))}
        <div className="relative">
          <Chip active={value === customKey} onClick={onCustomClick}>
            <Icon name="calendar" size={14} />
            {customLabel}
          </Chip>
          {customPicker}
        </div>
      </div>
      {right}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary-invert-soft text-primary"
          : "border-invert-default bg-surface text-default hover:bg-main-background",
      )}
    >
      {children}
    </button>
  );
}

/** Card with a title row and an optional "View all ↗" link. */
export function SectionCard({
  title,
  to,
  linkLabel = "View all",
  children,
  className,
}: {
  title: string;
  to?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-invert-default bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-invert-default px-5 py-4">
        <h2 className="text-base font-semibold text-default">{title}</h2>
        {to && (
          <Link to={to} className="flex items-center gap-1.5 text-sm font-medium text-default hover:text-primary">
            {linkLabel}
            <Icon name="arrow-up-right" size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
