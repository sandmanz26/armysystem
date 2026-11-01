import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/checkbox";
import { cn } from "@/lib/utils";
import { SEVERITY_EDGE, SeverityChip, StatusPill, toneColor } from "../shared";
import type { FeedEvent } from "./data";
import { RichText } from "./RichText";

export const BTN_PRIMARY =
  "h-9 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default transition-colors hover:bg-primary-hovered focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused";
export const BTN_OUTLINE =
  "h-9 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused";
export const BTN_TEXT =
  "h-9 rounded-lg px-4 text-sm font-medium text-default transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused";

export function ModelChip({ model }: { model: FeedEvent["model"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-invert-default bg-main-background px-2 py-0.5 font-mono text-[11px] text-default">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(model.tone) }} />
      {model.name}
    </span>
  );
}

interface Props {
  event: FeedEvent;
  selected: boolean;
  onSelect: () => void;
  onOpen: (intent?: "escalate" | "link") => void;
  onDismiss: () => void;
  onRestore?: () => void;
}

/*
 * One event row. Only a CRITICAL pending event gets the solid primary button — before, every
 * row shouted "Escalate Case" in the loudest colour on the page, so nothing stood out. Escalate
 * and Link now open the drawer with their form ready (they used to act silently: invent a case
 * id, attach to whichever case was first). Dismiss acts at once and can be undone.
 */
export function EventCard({ event: e, selected, onSelect, onOpen, onDismiss, onRestore }: Props) {
  const stop = (fn: () => void) => (ev: React.MouseEvent) => {
    ev.stopPropagation();
    fn();
  };
  return (
    <li
      className={cn(
        "flex gap-4 rounded-xl border border-l-4 bg-surface p-4 transition-colors hover:bg-main-background",
        SEVERITY_EDGE[e.severity],
        selected ? "border-primary bg-primary-invert-soft hover:bg-primary-invert-soft" : "border-invert-default",
        e.status === "dismissed" && "opacity-70",
      )}
    >
      <div className="relative h-[86px] w-[132px] shrink-0 overflow-hidden rounded-lg bg-default-default">
        <img src={e.thumb} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-1.5 top-1.5 rounded bg-surface">
          <Checkbox id={`sel-${e.id}`} name={`sel-${e.id}`} size={16} checked={selected} onChange={onSelect} disabled={e.status !== "pending"} />
        </span>
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-default-invert-default px-1.5 py-0.5 font-mono text-xs text-invert-default">
          {e.time}
        </span>
      </div>

      {/* The whole text block opens the drawer; a real button so it is reachable by keyboard */}
      <button
        type="button"
        onClick={() => onOpen()}
        className="flex min-w-0 flex-1 flex-col items-start gap-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused"
      >
        <span className="flex flex-wrap items-center gap-2">
          <SeverityChip severity={e.severity} dot />
          <span className="text-sm font-semibold text-default">{e.title}</span>
          {e.status === "escalated" && <StatusPill>ESCALATED</StatusPill>}
          {e.caseId && e.status !== "escalated" && (
            <span className="rounded-full border border-info bg-info-invert-soft px-2.5 py-0.5 font-mono text-xs text-info">
              {e.caseId}
            </span>
          )}
          <span className="font-mono text-[11px] text-body">{e.model.id}</span>
          <ModelChip model={e.model} />
        </span>
        <span className="text-sm text-body">
          <RichText parts={e.desc} />
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-body">
          <Icon name="map-pin" size={14} />
          {e.site} · {e.zone} · {e.camera}
        </span>
      </button>

      <div className="flex w-[140px] shrink-0 flex-col items-stretch gap-2">
        {e.status === "dismissed" ? (
          <button type="button" onClick={stop(() => onRestore?.())} className={BTN_OUTLINE}>
            Restore
          </button>
        ) : e.status === "escalated" ? (
          <>
            <button type="button" onClick={stop(() => onOpen())} className={cn(BTN_OUTLINE, "flex items-center justify-center gap-1.5")}>
              View Case
              <Icon name="arrow-right" size={14} />
            </button>
            {e.assignee && <p className="text-center text-xs text-body">Owner: {e.assignee}</p>}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={stop(() => onOpen("escalate"))}
              className={e.severity === "critical" ? BTN_PRIMARY : BTN_OUTLINE}
            >
              Escalate Case
            </button>
            <button
              type="button"
              onClick={stop(() => onOpen("link"))}
              disabled={!!e.caseId}
              className={cn(BTN_OUTLINE, "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled")}
            >
              Link Case
            </button>
            <button type="button" onClick={stop(onDismiss)} className={BTN_TEXT}>
              Dismiss
            </button>
          </>
        )}
      </div>
    </li>
  );
}
