import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Drawer — design-system component.
 *
 * Figma `Drawer Right` (Asset Type page, 5157:85668): a 384px panel on the
 * right over a black scrim at 30%. Header 64px tall (12/9/12/20 padding) with a
 * 16px Semi Bold `text/default` title and a 40px close button; a
 * `background/divider` line; content at 20px padding / 20px gap; another
 * divider; footer at 20px padding whose button group is 12px apart.
 */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** A second line under the title, e.g. Figma's "Select assignments to mark
   *  as ready for return." under "Select Assignment" (5889:280024). Grows the
   *  header past its default 64px — omit for the plain single-line header
   *  every other drawer in this app uses. */
  subtitle?: React.ReactNode;
  /** A validation/status banner between the title and the subtitle, e.g.
   *  Figma's "Select at least 1 assignment to continue" error
   *  (`Drawer - Select Assignment - Empty Error`, 5895:504788). Omit when
   *  there's nothing to show — most drawers never set this. */
  banner?: React.ReactNode;
  /** Rendered in the footer, right-aligned, 12px apart. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Figma's width is 384px; override only when a screen genuinely differs. */
  width?: number;
}

export function Drawer({ open, onClose, title, subtitle, banner, footer, children, width = 384 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-full flex-col bg-surface shadow-2xl"
        style={{ width }}
      >
        <div
          className={cn(
            "flex flex-shrink-0 items-start justify-between gap-6 pl-5 pr-2",
            subtitle ? "py-3.5" : "h-16 items-center",
          )}
        >
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-base font-semibold text-default">{title}</h2>
            {banner && <div className="mt-2 mr-4">{banner}</div>}
            {subtitle && <p className="mt-0.5 text-xs text-body">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-default hover:bg-default-default transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-px flex-shrink-0 bg-divider" />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">{children}</div>

        {footer && (
          <>
            <div className="h-px flex-shrink-0 bg-divider" />
            <div className="flex flex-shrink-0 items-center justify-end gap-3 p-5">{footer}</div>
          </>
        )}
      </div>
    </div>
  );
}
