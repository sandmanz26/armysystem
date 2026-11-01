import { useEffect } from "react";
import { Icon } from "@/components/icon";
import { useAccel } from "./store";

/*
 * Confirmation with a way back. Replaces the plain success toast for Escalate / Link /
 * Dismiss: those change an audit-relevant record, and Dismiss in particular was one click
 * with no recovery. Lives in AccelLayout so it survives page changes; clears itself after 8s.
 */
export function UndoToast() {
  const last = useAccel((s) => s.last);
  const undo = useAccel((s) => s.undo);
  const clear = useAccel((s) => s.clearLast);

  useEffect(() => {
    if (!last) return;
    const t = window.setTimeout(clear, 8000);
    return () => window.clearTimeout(t);
  }, [last, clear]);

  if (!last) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[2100] flex h-14 -translate-x-1/2 items-center gap-4 rounded-lg bg-surface px-4 shadow-lg"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-default">
        <Icon name="circle-check" size={16} className="text-success" />
        {last.label}
      </span>
      <button type="button" onClick={undo} className="text-sm font-semibold text-primary hover:underline">
        Undo
      </button>
    </div>
  );
}
