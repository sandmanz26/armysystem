// MST Create Booking — form pieces that the shared `Select` / `Input` do not cover.
//
//   SectionCard       Figma `Section Layout` (white, radius 12, `Section Header` 64px, 20px content gutter)
//   SearchSelect      `Input - Single Select` + `Listbox New` with a `Listbox Item/Search` row on top
//                     (Training Type 6068:92693, Rank in `Input - Name With Rank`, Call Sign 6189:129510)
//   MultiSelectField  `Input - Multiple Select`: label row with "N selected | Clear All", chips in the field,
//                     checkbox list (Platform Type 8102:43284, Briefing Room 6183:411795)
//   InstructorField   `Input - Name With Rank`: rank dropdown + name in one field
// Everything uses the Figma-named colour tokens (text-default, border-invert-default, …).
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/checkbox";
import { cn } from "@/lib/utils";

// ── Section Layout ───────────────────────────────────────────────────────────

export function SectionCard({ title, subtitle, right, children, className }: {
  title: ReactNode; subtitle?: ReactNode; right?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-invert-default bg-surface", className)}>
      <div className="flex items-center gap-5 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-default">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-body">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="flex flex-col gap-5 px-5 pb-5">{children}</div>
    </section>
  );
}

// ── shared label / caption ───────────────────────────────────────────────────

export function FieldLabel({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-0.5 text-sm font-medium text-default">
      {children}
      {required && <span className="text-danger">*</span>}
    </label>
  );
}

export function FieldCaption({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return <p className={cn("text-xs", danger ? "text-danger" : "text-caption")}>{children}</p>;
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open, close]);
  return ref;
}

/** `Listbox Item/Search` — the Search... row on top of a list. */
function ListSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="p-2">
      <div className="flex h-10 items-center gap-2 rounded-lg border border-invert-default bg-surface px-3 focus-within:border-primary">
        <Icon name="search" size={16} className="flex-shrink-0 text-body" />
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search..."
          className="min-w-0 flex-1 bg-transparent text-sm text-default placeholder:text-placeholder focus:outline-none"
        />
      </div>
    </div>
  );
}

const TRIGGER_BASE = "flex w-full items-center justify-between gap-2.5 rounded-lg border text-left text-sm transition-colors";

// ── SearchSelect ─────────────────────────────────────────────────────────────

export function SearchSelect({
  label, required, placeholder, value, options, onChange, status = "default", caption, disabled,
  searchable = true, marker = "check", compact, className, hint,
}: {
  label?: ReactNode;
  required?: boolean;
  placeholder: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  status?: "default" | "danger";
  caption?: ReactNode;
  disabled?: boolean;
  searchable?: boolean;
  /** "radio" draws Figma's `Listbox Item - Radio`; "check" the end-of-row check used by the shared Select. */
  marker?: "check" | "radio";
  /** Table-cell size: 40px high, no label. */
  compact?: boolean;
  className?: string;
  /** Grey helper line, shown while no danger caption is. */
  hint?: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const close = () => { setOpen(false); setQ(""); };
  const ref = useOutsideClose(open, close);
  const shown = useMemo(() => options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase())), [options, q]);

  return (
    <div className={cn("flex flex-col gap-1", className)} ref={ref}>
      {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className={cn(
            TRIGGER_BASE, "h-10 px-3",
            status === "danger" ? "border-danger" : "border-invert-default",
            disabled
              ? "cursor-not-allowed bg-disabled text-body"
              : cn("bg-surface hover:border-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused", open && "border-primary"),
          )}
        >
          <span className={cn("flex-1 truncate", value ? "text-default" : "text-placeholder", disabled && "text-body")}>{value || placeholder}</span>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={18} className="flex-shrink-0 text-body" />
        </button>
        {open && !disabled && (
          <div className={cn("absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-lg bg-surface shadow-lg", compact && "w-56")}>
            {searchable && <ListSearch value={q} onChange={setQ} />}
            <ul role="listbox" className="max-h-[203px] overflow-y-auto py-1">
              {shown.length === 0 && <li className="px-3 py-2 text-sm text-body">No results</li>}
              {shown.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o === value}
                    onClick={() => { onChange(o); close(); }}
                    className={cn("flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default transition-colors", o === value ? "bg-primary-invert-soft" : "hover:bg-default-default")}
                  >
                    {marker === "radio" && (
                      <span className={cn("grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-full border bg-surface", o === value ? "border-primary" : "border-default")}>
                        {o === value && <span className="h-2.5 w-2.5 rounded-full bg-primary-default" />}
                      </span>
                    )}
                    <span className="flex-1 truncate">{o}</span>
                    {marker === "check" && o === value && <Icon name="check" size={20} className="flex-shrink-0 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {caption ? <FieldCaption danger={status === "danger"}>{caption}</FieldCaption> : hint ? <FieldCaption>{hint}</FieldCaption> : null}
    </div>
  );
}

// ── MultiSelectField ─────────────────────────────────────────────────────────

export interface MultiOption { value: string; label: string; meta?: ReactNode }

export function MultiSelectField({
  label, required, placeholder, value, options, onChange, status = "default", caption, hint, disabled,
}: {
  label: ReactNode;
  required?: boolean;
  placeholder: string;
  value: string[];
  options: MultiOption[];
  onChange: (v: string[]) => void;
  status?: "default" | "danger";
  caption?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
        {value.length > 0 && (
          <div className="flex items-center gap-2 text-xs leading-4">
            <span className="text-body">{value.length} selected</span>
            <span className="h-3 w-px bg-divider" aria-hidden />
            <button type="button" onClick={() => onChange([])} className="font-semibold text-primary hover:underline">Clear All</button>
          </div>
        )}
      </div>
      <div className="relative">
        <div
          id={id}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen((o) => !o); } }}
          className={cn(
            TRIGGER_BASE, "min-h-10 cursor-pointer px-3 py-1.5",
            status === "danger" ? "border-danger" : "border-invert-default",
            disabled ? "cursor-not-allowed bg-disabled" : cn("bg-surface hover:border-primary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-invert-focused", open && "border-primary"),
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {value.length === 0 && <span className="text-placeholder">{placeholder}</span>}
            {value.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded bg-default-default px-2 py-0.5 text-sm text-default">
                {options.find((o) => o.value === v)?.label ?? v}
                <button type="button" aria-label={`Remove ${v}`} onClick={(e) => { e.stopPropagation(); toggle(v); }} className="text-body hover:text-default">
                  <Icon name="x" size={14} />
                </button>
              </span>
            ))}
          </div>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={18} className="flex-shrink-0 text-body" />
        </div>
        {open && !disabled && (
          <ul role="listbox" aria-multiselectable className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[203px] overflow-y-auto rounded-lg bg-surface py-1 shadow-lg">
            {options.map((o) => {
              const on = value.includes(o.value);
              return (
                <li key={o.value}>
                  <div
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(o.value)}
                    className={cn("flex h-9 cursor-pointer items-center gap-2.5 px-3 text-sm font-medium text-default", on ? "bg-primary-invert-soft" : "hover:bg-default-default")}
                  >
                    <Checkbox size={18} checked={on} onChange={() => toggle(o.value)} />
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.meta}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {caption ? <FieldCaption danger={status === "danger"}>{caption}</FieldCaption> : hint ? <FieldCaption>{hint}</FieldCaption> : null}
    </div>
  );
}

// ── InstructorField ──────────────────────────────────────────────────────────

/** Figma `Input - Name With Rank` (Contact Information, 290px): rank dropdown "Mr ∨" | divider | name input. */
export const INSTRUCTOR_RANKS = ["Mr", "Mrs", "Ms", "PFC", "LCP", "CPL", "CFC", "3SG", "2SG", "1SG", "SSG", "MSG", "3WO", "2WO", "1WO", "MWO", "SWO", "CWO", "2LT", "LTA", "CPT", "MAJ", "LTC", "SLTC", "COL"];

export function InstructorField({ rank, name, onRank, onName, status = "default", caption }: {
  rank: string; name: string; onRank: (v: string) => void; onName: (v: string) => void;
  status?: "default" | "danger"; caption?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const close = () => { setOpen(false); setQ(""); };
  const ref = useOutsideClose(open, close);
  const shown = INSTRUCTOR_RANKS.filter((r) => r.toLowerCase().includes(q.trim().toLowerCase()));
  const id = useId();
  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <FieldLabel htmlFor={id} required>Instructor</FieldLabel>
      <div className="relative">
        <div className={cn("flex h-10 items-stretch rounded-lg border bg-surface transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary-invert-focused", status === "danger" ? "border-danger" : "border-invert-default")}>
          <button
            type="button"
            aria-label="Instructor rank"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => (open ? close() : setOpen(true))}
            className="flex w-[84px] flex-shrink-0 items-center justify-between gap-1 rounded-l-lg border-r border-invert-default px-3 text-sm text-default hover:bg-default-soft"
          >
            <span>{rank}</span>
            <Icon name="chevron-down" size={18} className="text-body" />
          </button>
          <input
            id={id}
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Enter Instructor Name"
            className="min-w-0 flex-1 rounded-r-lg bg-transparent px-3 text-sm text-default placeholder:text-placeholder focus:outline-none"
          />
        </div>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg bg-surface shadow-lg">
            <ListSearch value={q} onChange={setQ} />
            <ul role="listbox" className="max-h-[203px] overflow-y-auto py-1">
              {shown.map((r) => (
                <li key={r}>
                  <button type="button" role="option" aria-selected={r === rank} onClick={() => { onRank(r); close(); }}
                    className={cn("flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default", r === rank ? "bg-primary-invert-soft" : "hover:bg-default-default")}>
                    <span className="flex-1">{r}</span>
                    {r === rank && <Icon name="check" size={20} className="text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {caption && <FieldCaption danger={status === "danger"}>{caption}</FieldCaption>}
    </div>
  );
}
