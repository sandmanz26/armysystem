import { useEffect, useRef } from "react";
import { CircleCheck } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * Toast — design-system component.
 *
 * Figma `Toast` (Asset Type page, 5157:85798): 56px tall, white, radius 8,
 * drop shadow, 8/16 padding, 8px gap. A 16px filled `circle-check` in
 * `background/success/default` and a 14px Semi Bold `text/default` message.
 * Figma places it bottom-centre over the page — except the Ongoing Session
 * screens (5549:141192), which pin it top-right: 24px from the right edge,
 * 12px under the header stack (`placement="top-right"` + `offsetTop`).
 *
 * `tone="danger"` — Figma `Toast` on Login - Filled Error (5161:185968): 48px
 * tall, 12/6 padding, 6px gap, 24px `octagon-alert` in `text/danger`, a 12px
 * Semi Bold message and a 20px `x` dismiss button. Pinned top-right 24/24.
 */

export interface ToastProps {
  message: string;
  open: boolean;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
  placement?: "bottom-center" | "top-right";
  /** top-right only: distance from the viewport top, in px. */
  offsetTop?: number;
  /** Optional — "danger" renders the error toast (alert icon + dismiss ✕). Default "success".
   *  "warning" (F-009) — Figma `Scan ID - If Trainee Double Scan` (5474:158145): 448px wide,
   *  16/8 padding, 8px gap, 24px `triangle-alert` in `text/warning`, a 14px Semi Bold message
   *  that wraps to two lines, and a 20px `x` dismiss. */
  tone?: "success" | "danger" | "warning";
}

export function Toast({ message, open, onDismiss, duration = 3000, placement = "bottom-center", offsetTop = 72, tone = "success" }: ToastProps) {
  // Held in a ref so a parent that re-renders often (a ticking clock) and
  // passes an inline arrow doesn't keep restarting the countdown.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => dismissRef.current(), duration);
    return () => clearTimeout(t);
  }, [open, duration, message]);

  if (!open) return null;

  if (tone === "warning") {
    return (
      <div
        role="alert"
        className={cn(
          placement === "top-right" ? "fixed right-6 z-[100200]" : "fixed bottom-8 left-1/2 z-[100200] -translate-x-1/2",
          "flex w-[448px] max-w-[calc(100vw-48px)] items-center gap-2 rounded-lg bg-surface px-4 py-2 shadow-lg",
        )}
        style={placement === "top-right" ? { top: offsetTop } : undefined}
      >
        <Icon name="triangle-alert" size={24} className="flex-shrink-0 text-warning" />
        <span className="min-w-0 flex-1 text-sm font-semibold text-default">{message}</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="flex-shrink-0 text-default hover:text-body">
          <Icon name="x" size={20} />
        </button>
      </div>
    );
  }

  if (tone === "danger") {
    return (
      <div
        role="alert"
        className={cn(
          placement === "top-right" ? "fixed right-6 z-[100200]" : "fixed bottom-8 left-1/2 z-[100200] -translate-x-1/2",
          "flex h-12 items-center gap-1.5 rounded-lg bg-surface px-3 shadow-lg",
        )}
        style={placement === "top-right" ? { top: offsetTop } : undefined}
      >
        <Icon name="octagon-alert" size={24} className="text-danger" />
        <span className="text-xs font-semibold text-default whitespace-nowrap">{message}</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-default hover:text-body">
          <Icon name="x" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // z-[100200]: stays above ConfirmDialog (z-[100100]) and above `Modal`'s
        // Radix content (z-[100000]) — a toast firing while either is still
        // closing should never be hidden underneath it.
        placement === "top-right" ? "fixed right-6 z-[100200]" : "fixed bottom-8 left-1/2 z-[100200] -translate-x-1/2",
        "flex h-14 items-center gap-2 rounded-lg bg-surface px-4 shadow-lg",
      )}
      style={placement === "top-right" ? { top: offsetTop } : undefined}
    >
      <CircleCheck size={16} className="flex-shrink-0 fill-success-default text-invert-default" />
      <span className="text-sm font-semibold text-default whitespace-nowrap">{message}</span>
    </div>
  );
}
