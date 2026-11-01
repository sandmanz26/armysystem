// Booking 2.0 — Booking List ⋮ row menu (DIFFS B-17, dev feedback #2/#3).
//
// Figma: every row carries the Eye AND the ⋮ regardless of status (Booking List
// `5635:84476…` / `5831:113213`), and the items depend on the status:
//   Upcoming, assets not issued   Issue Assets · Reschedule · Cancel Booking
//   Upcoming, assets issued       Start Onboarding · Top Up Assets
//   Ongoing                       Continue Session · Top Up Assets
//   Return Assets / Missing       Return Assets · View Training Result
//   Completed                     View Training Result
//   Cancelled / Overdue           View Booking Details (PRD §12: Overdue offers View only;
//                                 Cancelled has no action of its own — the item keeps ⋮ present)
// Replaces the old booking module's BookingRowMenu (lucide icons, Top Up / Ready For Return
// disabled, no Start Onboarding), which Booking 2.0 may import but not edit.
// The menu is portalled and positioned from the button so the table's horizontal scroll
// container cannot clip it on the last rows.
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Booking } from "@/data/mock";
import { scanUrl } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import { oneLine, parseBookingTime } from "@/pages-tsx/booking-2/detail/components/multiCw";

interface MenuItem {
  key: string;
  label: string;
  icon: IconName;
  danger?: boolean;
  run: () => void;
}

const MENU_W = 224;

export function BookingRowMenu({ booking, onNavigate }: { booking: Booking; onNavigate?: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const [onboardingConfirm, setOnboardingConfirm] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const go = (path: string) => { setOpen(false); onNavigate?.(path); };
  const detail = `/bookings-2/detail?id=${booking.id}`;
  const result = `/training-results-2/detail?bookingId=${encodeURIComponent(booking.id)}`;
  const multiCw = String(booking.courseware ?? "").split(",").filter((c) => c.trim()).length > 1;
  const topUp = () =>
    // One courseware: straight to the Top Up scan page. Several: Booking Detail asks which assignment first.
    go(multiCw
      ? detail
      : scanUrl("/bookings-2/issue-assets", "topup", { baseStation: booking.assignedStations?.[0], bookingIds: booking.id, courseware: booking.courseware }, detail));

  const items: MenuItem[] = (() => {
    switch (booking.status) {
      case "Upcoming":
        return booking.assetIssued
          ? [
              { key: "onboard", label: "Start Onboarding", icon: "circle-play", run: () => { if (multiCw) go(detail); else { setOpen(false); setOnboardingConfirm(true); } } },
              { key: "topup", label: "Top Up Assets", icon: "package-plus", run: topUp },
            ]
          : [
              { key: "issue", label: "Issue Assets", icon: "package-check", run: () => go(`/bookings-2/assignments/new?bookingId=${booking.id}&courseware=${encodeURIComponent(booking.courseware)}`) },
              // Reschedule / Cancel live on Booking Detail (its own dialogs and views).
              { key: "resched", label: "Reschedule", icon: "clock-3", run: () => go(detail) },
              { key: "cancel", label: "Cancel Booking", icon: "x", danger: true, run: () => go(detail) },
            ];
      case "Ongoing":
        return [
          { key: "continue", label: "Continue Session", icon: "circle-play", run: () => go(`/bookings-2/session?id=${booking.id}`) },
          { key: "topup", label: "Top Up Assets", icon: "package-plus", run: topUp },
        ];
      case "Return Assets":
      case "Completed with Missing Assets":
        return [
          { key: "return", label: "Return Assets", icon: "scan-line", run: () => go(scanUrl("/bookings-2/issue-assets", "return", { bookingIds: booking.id, baseStation: booking.assignedStations?.[0] }, detail)) },
          { key: "result", label: "View Training Result", icon: "clipboard-list", run: () => go(result) },
        ];
      case "Completed":
        return [{ key: "result", label: "View Training Result", icon: "clipboard-list", run: () => go(result) }];
      default:
        return [{ key: "view", label: "View Booking Details", icon: "eye", run: () => go(detail) }];
    }
  })();

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const h = items.length * 36 + 8;
    const left = Math.max(8, Math.min(window.innerWidth - MENU_W - 8, r.right - MENU_W));
    if (r.bottom + 4 + h > window.innerHeight) setPos({ bottom: window.innerHeight - r.top + 4, left });
    else setPos({ top: r.bottom + 4, left });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const schedule = oneLine(parseBookingTime(booking.bookingTime));

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More actions"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
      >
        <Icon name="ellipsis-vertical" size={16} />
      </button>
      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          {/* Figma `Listbox New`: 224 wide, radius 8, 4px vertical padding, shadow; `Listbox Item` 36 tall. */}
          <div role="menu" className="fixed z-[61] rounded-lg bg-surface py-1 shadow-lg ring-1 ring-black/5" style={{ ...pos, width: MENU_W }}>
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                role="menuitem"
                onClick={it.run}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium hover:bg-default-soft",
                  it.danger ? "text-danger" : "text-default",
                )}
              >
                <Icon name={it.icon} size={20} className={it.danger ? undefined : "text-body"} />
                {it.label}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
      {createPortal(
      <ConfirmDialog
        open={onboardingConfirm}
        tone="neutral"
        icon="users-round"
        title={`Start onboarding for ${booking.courseware}?`}
        subtitle={schedule}
        confirmLabel="Start Onboarding"
        onCancel={() => setOnboardingConfirm(false)}
        onConfirm={() => { setOnboardingConfirm(false); onNavigate?.(`/bookings-2/onboarding?id=${booking.id}`); }}
      />,
        document.body,
      )}
    </div>
  );
}
