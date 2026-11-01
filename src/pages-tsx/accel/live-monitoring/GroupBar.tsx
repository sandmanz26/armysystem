import { Icon } from "@/components/icon";
import type { Playback } from "./playback";

/*
 * Appears the moment cameras are selected. This is the feature the page's own subtitle promises —
 * "select cameras and scrub them back together" — which the first build never delivered: the boxes
 * selected, and nothing could be done to the selection.
 */
export function GroupBar({
  count,
  onApply,
  onClear,
}: {
  count: number;
  onApply: (fn: (p: Playback) => Partial<Playback>) => void;
  onClear: () => void;
}) {
  const b =
    "flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-3 text-sm font-medium text-default hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused";
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-primary bg-surface px-5 py-3 shadow-lg">
      <span className="text-sm font-semibold text-default">{count} selected</span>
      <span className="hidden text-xs text-body sm:inline">Controls below move all of them together</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" className={b} onClick={() => onApply((p) => ({ behind: p.behind + 10 }))}>
          <Icon name="rotate-ccw" size={16} /> Back 10s
        </button>
        <button type="button" className={b} onClick={() => onApply(() => ({ paused: true }))}>
          <Icon name="pause" size={16} /> Pause all
        </button>
        <button type="button" className={b} onClick={() => onApply(() => ({ paused: false }))}>
          <Icon name="play" size={16} /> Play all
        </button>
        <button type="button" className={b} onClick={() => onApply((p) => ({ behind: Math.max(0, p.behind - 10) }))}>
          <Icon name="rotate-cw" size={16} /> Forward 10s
        </button>
        <button type="button" className={b} onClick={() => onApply(() => ({ paused: false, behind: 0 }))}>
          <span className="h-2 w-2 rounded-full bg-[rgb(var(--color-text-success))]" /> All live
        </button>
        <button type="button" className="h-9 px-3 text-sm font-medium text-body hover:text-default" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
