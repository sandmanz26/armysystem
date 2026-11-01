import { useState } from "react";
import { Icon } from "@/components/icon";
import type { MoreMenuProps } from "../types";

/**
 * Page-header ⋮ — Figma `Dropdown - More` (7021:596179 / 7021:593634).
 * Trigger: `Button Icon` outlined 40x40, r8, 18px `ellipsis-vertical`.
 * Menu: `Listbox New` 224 wide, r8, 4px vertical padding, shadow, no border;
 * items 36 tall, 12px side padding, 20px `text/body` icon, 10px gap, 14 Medium.
 */
export function MoreMenu({ onArchive, onResetPassword }: MoreMenuProps) {
  const [open, setOpen] = useState(false);

  const item = (icon: "archive" | "key-round", label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default hover:bg-default-soft transition-colors"
    >
      <Icon name={icon} size={20} className="text-body" />
      {label}
    </button>
  );

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More actions"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors"
      >
        <Icon name="ellipsis-vertical" size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-[5px] w-56 rounded-lg bg-surface py-1 shadow-lg z-20">
            {item("archive", "Move to Archive", onArchive)}
            {item("key-round", "Reset Password", onResetPassword)}
          </div>
        </>
      )}
    </div>
  );
}
