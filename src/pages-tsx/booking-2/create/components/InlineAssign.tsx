// Booking 2.0 Lane Configuration — small inline "Assign ⌄" dropdown trigger
// used inside lane table cells (Role: single-select; Controlled Item/Weapon:
// multi-select). New, local to booking-2 — not shared with the old app.
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/checkbox";

interface InlineSingleAssignProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  /** Figma `Table - Body Cell Sm` (Create Booking lane table 5029:69433): 12/500 text, 16px
   *  chevron, value wraps inside the column. Optional; default keeps the 14px trigger. */
  size?: "md" | "sm";
  /** F-009 — Figma `Table - Body Cell State=Text Dropdown-Error` (Onboarding 5348:24232 /
   *  5358:92633): an empty value renders as a red 16px `circle-alert` + 14/500 "Not Assigned" +
   *  red chevron. Optional; only applies while the value is empty. */
  error?: boolean;
}

/** Shared trigger body for the error state of both inline assigns. */
function NotAssigned() {
  return (
    <span className="flex items-center gap-2 text-sm font-medium text-danger">
      <Icon name="circle-alert" size={16} className="flex-shrink-0" />
      Not Assigned
      <Icon name="chevron-down" size={16} className="flex-shrink-0" />
    </span>
  );
}

export function InlineSingleAssign({ value, onChange, options, disabled, size = "md", error }: InlineSingleAssignProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const sm = size === "sm";
  if (disabled) return <span className={cn(sm ? "text-xs" : "text-sm", "text-figma-body")}>—</span>;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1",
          sm ? "flex-wrap text-left text-xs font-medium" : "text-sm",
          value ? "text-figma-default" : "text-figma-placeholder hover:text-figma-body"
        )}
      >
        {error && !value ? <NotAssigned /> : (
          <>
            {value || "Assign"}
            <Icon name="chevron-down" size={sm ? 16 : 12} className={sm ? "text-figma-body" : "text-figma-disabled"} />
          </>
        )}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white border border-figma-subtle rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto min-w-[180px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn("w-full text-left px-3 py-2 text-xs text-figma-default hover:bg-figma-soft", value === opt && "bg-figma-primarysoft text-figma-primary font-medium")}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface InlineMultiAssignProps {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
  disabled?: boolean;
  /** See InlineSingleAssign `size`. */
  size?: "md" | "sm";
  /** See InlineSingleAssign `error`. */
  error?: boolean;
}

export function InlineMultiAssign({ value, onChange, options, disabled, size = "md", error }: InlineMultiAssignProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const sm = size === "sm";
  if (disabled) return <span className={cn(sm ? "text-xs" : "text-sm", "text-figma-body")}>—</span>;

  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <div ref={ref} className={cn("relative inline-block", !sm && "max-w-[220px]")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1",
          sm ? "text-left text-xs font-medium" : "text-sm truncate",
          value.length ? "text-figma-default" : "text-figma-placeholder hover:text-figma-body"
        )}
      >
        {error && !value.length ? <NotAssigned /> : (
          <>
            <span className={sm ? "whitespace-normal" : "truncate"}>{value.length ? value.join(", ") : "Assign"}</span>
            <Icon name="chevron-down" size={sm ? 16 : 12} className={cn("flex-shrink-0", sm ? "text-figma-body" : "text-figma-disabled")} />
          </>
        )}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white border border-figma-subtle rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto min-w-[200px]">
          {options.map((opt) => (
            <label key={opt} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-figma-default hover:bg-figma-soft cursor-pointer">
              <Checkbox size={14} checked={value.includes(opt)} onChange={() => toggle(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
