import { useState } from "react";
import { Icon } from "@/components/icon";
import type { UserRowMenuProps } from "../types";

export function UserRowMenu({ onEdit, onArchive, onResetPassword }: UserRowMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="More actions"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-default-default transition-colors"
      >
        <Icon name="ellipsis-vertical" size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-invert-default rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors"
            >
              <Icon name="pencil" size={14} className="text-disabled" /> Edit User
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onArchive();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors"
            >
              <Icon name="archive" size={14} className="text-disabled" /> Move to Archive
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onResetPassword();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors"
            >
              <Icon name="key-round" size={14} className="text-disabled" /> Reset Password
            </button>
          </div>
        </>
      )}
    </div>
  );
}
