import { Link } from "react-router-dom";
import { Icon } from "@/components/icon";
import type { FeedEvent } from "../detection-feed/data";

/*
 * Replaces the floating pop-up in the bottom-right. That toast covered camera tiles, vanished when closed
 * (no inbox — the bell isn't drawn), and offered no next step. A critical alert is something to ACT on, so
 * it is now pinned above the wall, stays until acknowledged, and carries the three things you do next.
 */
export function AlertBanner({
  event: e,
  more,
  onShowCamera,
  onAcknowledge,
}: {
  event: FeedEvent;
  more: number;
  onShowCamera: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div role="alert" className="flex items-center gap-4 rounded-xl border border-l-4 border-danger bg-danger-invert-soft px-5 py-3">
      <Icon name="triangle-alert" size={20} className="shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-default">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-danger">Critical</span>
          {e.title}
          {more > 0 && <span className="ml-2 text-xs font-medium text-body">+{more} more waiting</span>}
        </p>
        <p className="truncate text-sm text-body">
          <span className="font-mono">{e.camera}</span> · {e.zone} · {e.site} · {e.time}
        </p>
      </div>
      <button
        type="button"
        onClick={onShowCamera}
        className="h-9 shrink-0 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background"
      >
        Show {e.camera}
      </button>
      <Link
        to="/accel/detection-feed?severity=critical&status=pending"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered"
      >
        Open in feed
        <Icon name="arrow-right" size={14} />
      </Link>
      <button type="button" onClick={onAcknowledge} className="h-9 shrink-0 px-2 text-sm font-medium text-body hover:text-default">
        Acknowledge
      </button>
    </div>
  );
}
