import React, { useEffect } from "react";
import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * ConfirmDialog — design-system component.
 *
 * Figma `Modal Confirmation` (Asset Type page, 5158:105857 / 5158:105855).
 * 384px wide, radius 16, white, over a black scrim at 30%. Header padding 32
 * with a 24px gap: a 48px tinted circle holding a 24px icon, then a 20px Semi
 * Bold `text/default` title and a 14px Regular subtitle. Footer padding
 * 0/32/32/32, buttons 12px apart, primary on the right.
 *
 * `tone` picks the icon + circle: `warning` for a reversible-but-destructive
 * confirm, `danger` for a blocked action the user cannot complete.
 */

export type ConfirmTone = "warning" | "danger" | "neutral" | "success";

const TONE: Record<ConfirmTone, { circle: string; icon: string; name: IconName; subtitle: string }> = {
  warning: {
    circle: "bg-warning-invert-default",
    icon: "text-warning",
    name: "triangle-alert",
    subtitle: "text-caption",
  },
  danger: {
    circle: "bg-danger-invert-default",
    icon: "text-danger",
    name: "octagon-alert",
    subtitle: "text-body",
  },
  // F-009 (BD-17): Figma `Start Onboarding` (8152:103723) — a grey
  // `background/default/default` circle, `text/caption` icon, `text/body`
  // subtitle. Pass the icon via `icon` (Figma draws `users-round`).
  neutral: {
    circle: "bg-default-default",
    icon: "text-caption",
    name: "info",
    subtitle: "text-body",
  },
  // F-009 (A1, SH-4): Scan & Return `Confirmation - All Complete` (5895:412450) —
  // green circle + check.
  success: {
    circle: "bg-success-invert-default",
    icon: "text-success",
    name: "check",
    subtitle: "text-caption",
  },
};

export interface ConfirmDialogProps {
  open: boolean;
  tone?: ConfirmTone;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Left-hand button. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Right-hand primary button. Omit to show only the cancel button. */
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  /**
   * Acknowledge-only dialog: hide the Cancel button and show just the primary
   * `confirmLabel` button (falls back to `onCancel` when `onConfirm` is
   * omitted). Figma `Move to Archive - Blocked` (5937:33503) — "Got It".
   */
  hideCancel?: boolean;
  /** Extra classes for the dialog panel — e.g. `w-[768px]` for Figma's wide
   *  `Confirmation (Multiple Courseware)` (6501:286020). Optional; default 384px. */
  className?: string;
  /** Optional icon override (Figma `Icon / <name>`). Default: the tone's icon. */
  icon?: IconName;
  /** Extra body under the subtitle (lists, paragraphs), same 14px caption style. Optional. */
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  tone = "warning",
  title,
  subtitle,
  cancelLabel = "Cancel",
  confirmLabel,
  onCancel,
  onConfirm,
  hideCancel = false,
  className,
  children,
  icon,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onCancel]);

  if (!open) return null;
  const t = TONE[tone];

  return (
    // z-[100100]: above `Modal`'s Radix content (z-[100000], components/modal-1)
    // as well as Drawer's z-[2000] family. A confirm raised while a Modal is
    // open (Data Import's Leaderboard "Discard this import?") was rendering
    // UNDER that modal and was unclickable — see CHANGES.md.
    <div className="fixed inset-0 z-[100100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} aria-hidden />
      <div role="dialog" aria-modal="true" className={cn("relative w-96 max-w-full rounded-2xl bg-surface shadow-2xl", className)}>
        <div className="flex gap-6 p-8">
          <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full", t.circle)}>
            <Icon name={icon ?? t.name} size={24} className={t.icon} />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-xl font-semibold text-default">{title}</h2>
            {subtitle && <p className={cn("text-sm", t.subtitle)}>{subtitle}</p>}
            {children && <div className={cn("text-sm", t.subtitle)}>{children}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 pb-8">
          {!hideCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          {confirmLabel && (
            <button
              type="button"
              onClick={onConfirm ?? (hideCancel ? onCancel : undefined)}
              className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
