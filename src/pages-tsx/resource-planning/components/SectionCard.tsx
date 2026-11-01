import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icon";
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/lib/utils";

/*
 * Figma `Section Layout` / `Section Layout - Table` (6875:125827): a white card, 1px
 * `border/invert/default`, radius 12. Its `Section Header` is one row (padding 20, gap 20):
 * left = title 16 Semi Bold `text/default` (+ optional count 16 Semi Bold `text/body`, gap 8)
 * over a 12 Regular `text/body` subtitle (gap 2); right = the `🔄 Right Content` slot with
 * 36px buttons, gap 12 — "Edit" in view, "Cancel" + "Save Changes" while the card is edited.
 */

export function SectionCard({
  title,
  count,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  count?: number;
  subtitle: string;
  actions: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-invert-default bg-surface", className)}>
      <div className="flex items-center gap-5 p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-default">{title}</h2>
            {count !== undefined && <span className="text-base font-semibold text-body">{count}</span>}
          </div>
          <p className="text-xs text-body">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      </div>
      {children}
    </section>
  );
}

const outline =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default transition-colors hover:bg-default-hovered disabled:cursor-not-allowed disabled:opacity-50";

/** Figma `Button` (outline, md): pencil + "Edit". */
export function EditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={outline}>
      <Icon name="pencil" size={16} />
      Edit
    </button>
  );
}

/** Figma edit-state pair: outline "Cancel" (x) + primary "Save Changes" (save). */
export function EditActions({ onCancel }: { onCancel: () => void }) {
  return (
    <>
      <button type="button" onClick={onCancel} className={outline}>
        <Icon name="x" size={16} />
        Cancel
      </button>
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default transition-colors hover:bg-primary-hovered"
      >
        <Icon name="save" size={16} />
        Save Changes
      </button>
    </>
  );
}

/**
 * Figma `Input > Caption` in danger with a trailing `Icon / info` that opens
 * `Tooltip - RP-Danger Info` (240 wide, bullet list) on hover — 8060:57595 / 8060:73122.
 * The tooltip is portalled to <body>: these captions live inside the table's scroll box,
 * which would clip an absolutely-positioned popup (PITFALLS #21).
 */
export function DangerCaption({ text, tooltip }: { text: string; tooltip?: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  return (
    <p className="mt-1 whitespace-normal text-xs text-danger">
      {text}
      {tooltip && (
        <span
          ref={ref}
          className="ml-0.5 inline-flex cursor-help align-[-2px]"
          onMouseEnter={() => setRect(ref.current?.getBoundingClientRect() ?? null)}
          onMouseLeave={() => setRect(null)}
        >
          <Icon name="info" size={12} />
        </span>
      )}
      {tooltip &&
        rect &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[3000]"
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          >
            <Tooltip visible width={240}>
              {tooltip}
            </Tooltip>
          </div>,
          document.body,
        )}
    </p>
  );
}

/** Tooltip body: optional lead paragraph, then a bulleted list — Figma's UNORDERED list style. */
export function TooltipList({ lead, items }: { lead?: string; items: string[] }) {
  return (
    <div className="text-sm leading-5 text-invert-default">
      {lead && <p className="mb-5">{lead}</p>}
      <ul className="list-disc pl-5">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/** Digits only, max 3 — the limit/count cells are small whole numbers. */
export const digitsOnly = (v: string) => v.replace(/\D/g, "").slice(0, 3);
