import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Company Name — Figma `Input - Single Select Creatable` (Add User drawer,
 * 7014:572509 / 7014:572712 / 7014:572185). Same 40px shell as the shared
 * `Select`, but the box is a text input you can type into:
 *  - open with no text → every existing company (`Listbox New`, 36px items);
 *  - typing filters the list; a name that doesn't exist yet adds a first row
 *    `+ Create “<text>”` in `text/primary` (7014:572712);
 *  - no companies at all → "No companies yet. Start typing to add one."
 * Helper caption sits under the box (12 Regular `text/caption`).
 */

export interface CompanyNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  caption?: string;
  label?: string;
  placeholder?: string;
}

export function CompanyNameField({
  value,
  onChange,
  options,
  caption,
  label = "Company Name",
  placeholder = "Search or add company name",
}: CompanyNameFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, value]);

  const text = query.trim();
  // While the box still shows the chosen value, list everything.
  const filtering = text.length > 0 && text !== value;
  const matches = filtering
    ? options.filter((o) => o.toLowerCase().includes(text.toLowerCase()))
    : options;
  const exists = options.some((o) => o.toLowerCase() === text.toLowerCase());
  const showCreate = filtering && !exists;

  const pick = (v: string) => {
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label htmlFor={id} className="text-sm font-medium text-default">
        {label}
      </label>

      <div className="relative rounded-lg">
        <input
          id={id}
          ref={inputRef}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value === "") onChange("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(value);
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (showCreate) pick(text);
              else if (filtering && matches.length > 0) pick(matches[0]);
            }
          }}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface pl-3 pr-11 text-sm text-default placeholder:text-placeholder transition-colors",
            "hover:border-primary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary-invert-focused",
            open ? "border-primary" : "border-invert-default",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Close list" : "Open list"}
          onClick={() => {
            if (open) setOpen(false);
            else inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-body"
        >
          <Icon name={open ? "chevron-up" : "chevron-down"} size={22} />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[203px] overflow-y-auto rounded-lg bg-surface py-1 shadow-lg"
          >
            {showCreate && (
              <li>
                <button
                  type="button"
                  onClick={() => pick(text)}
                  className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-primary hover:bg-default-default transition-colors"
                >
                  <Icon name="plus" size={20} className="flex-shrink-0" />
                  <span className="flex-1 truncate">Create “{text}”</span>
                </button>
              </li>
            )}
            {!showCreate && matches.length === 0 && (
              <li className="flex h-9 items-center px-3 text-sm font-medium text-disabled">
                No companies yet. Start typing to add one.
              </li>
            )}
            {matches.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o === value}
                  onClick={() => pick(o)}
                  className={cn(
                    "flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default transition-colors",
                    o === value ? "bg-primary-invert-soft" : "hover:bg-default-default",
                  )}
                >
                  <span className="flex-1 truncate">{o}</span>
                  {o === value && <Icon name="check" size={20} className="flex-shrink-0 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {caption && <p className="text-xs text-caption">{caption}</p>}
    </div>
  );
}
