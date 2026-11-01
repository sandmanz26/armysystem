import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Input, type InputStatus } from "@/components/input";
import { DatePicker } from "@/components/date-picker";
import { Icon } from "@/components/icon";
import { formatDisplayDate, parseDisplayDate, parseISO, toISO } from "../blackoutRules";

/*
 * A date text field with the calendar opening under it — Figma `Input` (calendar suffix) +
 * `Date Picker`, as on Add Blackout Date's "Date", "End Date" and Ends → "On date".
 *
 * Figma draws the field focused with the picker open and a caret in the text, so the field is
 * typeable (digits only, slashes added as you go: dd/mm/yyyy) and focusing it, or pressing the
 * calendar icon, opens the picker. A picked day fills the field and closes the picker.
 *
 * The picker renders through a portal to <body>. The drawer's body scrolls and clips, and a
 * 364px calendar anchored to a field near the bottom would otherwise be cut off — the same
 * reason Dropdown and BlackoutTooltip portal out (figma-slicing PITFALLS #21).
 *
 * `value` is ISO yyyy-mm-dd (or "" while the text is empty/incomplete); the text shows dd/mm/yyyy.
 */

interface DateFieldProps {
  value: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  label?: ReactNode;
  required?: boolean;
  status?: InputStatus;
  caption?: ReactNode;
  wrapperClassName?: string;
  name?: string;
}

const POPUP_WIDTH = 384;
const POPUP_HEIGHT = 364;

/** Keeps only digits and lays them out as dd/mm/yyyy while typing. */
function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += `/${d.slice(2, 4)}`;
  if (d.length > 4) out += `/${d.slice(4)}`;
  return out;
}

export function DateField({
  value,
  onChange,
  onBlur,
  label,
  required,
  status,
  caption,
  wrapperClassName,
  name,
}: DateFieldProps) {
  const [text, setText] = useState(() => formatDisplayDate(value));
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // A value set from outside (the picker, a reset) must show in the text too.
  useEffect(() => {
    setText((t) => (parseDisplayDate(t) === value ? t : formatDisplayDate(value)));
  }, [value]);

  useLayoutEffect(() => {
    if (!open || !inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    const roomBelow = window.innerHeight - r.bottom;
    const top =
      roomBelow >= POPUP_HEIGHT + 8 || r.top < POPUP_HEIGHT + 8 ? r.bottom + 4 : r.top - POPUP_HEIGHT - 4;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POPUP_WIDTH - 8));
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (popRef.current?.contains(t) || inputRef.current?.contains(t) || t.closest?.("[data-date-toggle]")) return;
      setOpen(false);
    };
    // Esc closes the picker only — not the drawer behind it (the drawer listens on document too).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pick = (iso: string) => {
    setText(formatDisplayDate(iso));
    onChange(iso);
    setOpen(false);
  };

  return (
    <>
      <Input
        ref={inputRef}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder="dd/mm/yyyy"
        label={label}
        required={required}
        status={status}
        caption={caption}
        wrapperClassName={wrapperClassName}
        value={text}
        onFocus={() => setOpen(true)}
        // After a day is picked the field keeps focus, so a second click must reopen it too.
        onClick={() => setOpen(true)}
        onBlur={onBlur}
        onChange={(e) => {
          const masked = maskDate(e.target.value);
          setText(masked);
          onChange(parseDisplayDate(masked));
        }}
        suffixIcon={
          <button
            type="button"
            data-date-toggle
            aria-label="Open calendar"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center text-caption"
          >
            <Icon name="calendar" size={22} />
          </button>
        }
      />
      {open &&
        pos &&
        createPortal(
          <div ref={popRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 2100 }}>
            <DatePicker
              value={parseISO(value)}
              onSelect={(d) => pick(toISO(d))}
              onClear={() => pick("")}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
