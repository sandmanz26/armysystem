import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";
import { cn } from "@/lib/utils";
import { SeverityChip, toneColor } from "../shared";
import { ASSIGNEES, OPEN_CASES, type FeedEvent } from "./data";
import { BTN_OUTLINE, BTN_PRIMARY, ModelChip } from "./EventCard";
import { RichText } from "./RichText";

/*
 * Detail drawer. What changed from the first build, and why:
 *  · Triage without leaving the drawer: "n of N" with previous/next (also J / K), and after
 *    Escalate or Dismiss the page moves on to the next pending event instead of closing —
 *    an operator working a queue was forced to close, find the next card and reopen.
 *  · The play button used to do nothing. The clip is now a simulated 8-second playback
 *    (still frame + moving playhead + clock) — there is no real video in the prototype.
 *  · Escalate and Link no longer act silently. Escalate asks who owns the case and why
 *    (it is an accountability record); Link shows the open cases to choose from.
 *  · Shortcuts: E escalate · L link · D dismiss. Shown in the footer so they are discoverable.
 */

const CLIP_SECONDS = 8;

function addSeconds(hms: string, s: number) {
  const [h, m, sec] = hms.split(":").map(Number);
  const t = (((h * 3600 + m * 60 + sec + s) % 86400) + 86400) % 86400;
  const f = (n: number) => String(Math.floor(n)).padStart(2, "0");
  return `${f(t / 3600)}:${f((t % 3600) / 60)}:${f(t % 60)}`;
}

function Clip({ event: e }: { event: FeedEvent }) {
  const [t, setT] = useState(CLIP_SECONDS / 2); // opens on the moment of detection
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setT(CLIP_SECONDS / 2);
    setPlaying(false);
  }, [e.id]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((x) => {
        if (x >= CLIP_SECONDS) {
          setPlaying(false);
          return CLIP_SECONDS;
        }
        return Math.min(CLIP_SECONDS, x + 0.1);
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [playing]);

  const clock = addSeconds(e.full.split(", ")[1], Math.round(t - CLIP_SECONDS / 2));
  return (
    <div className="overflow-hidden rounded-xl bg-default-invert-default">
      <div className="relative flex aspect-[2.4/1] items-center justify-center">
        <img src={e.thumb} alt={`Evidence frame from ${e.camera}`} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <span className="absolute left-[34%] top-[28%] h-[34%] w-[24%] border-2" style={{ borderColor: toneColor("warning") }}>
          <span className="absolute -top-5 left-0 rounded px-1.5 text-[11px] font-semibold text-default" style={{ background: toneColor("warning") }}>
            Asset · 0.890
          </span>
        </span>
        <span className="absolute left-[55%] top-[20%] h-[50%] w-[24%] border-2" style={{ borderColor: toneColor("info") }}>
          <span className="absolute -top-5 left-0 rounded px-1.5 text-[11px] font-semibold text-invert-default" style={{ background: toneColor("info") }}>
            Person · 0.850
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (t >= CLIP_SECONDS) setT(0);
            setPlaying((p) => !p);
          }}
          aria-label={playing ? "Pause clip" : "Play clip"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-default text-invert-default transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused"
        >
          <Icon name={playing ? "pause" : "play"} size={24} />
        </button>
      </div>
      <div className="flex items-center gap-3 px-3 py-2 text-invert-default">
        <span className="font-mono text-xs">{clock}</span>
        <input
          type="range"
          min={0}
          max={CLIP_SECONDS}
          step={0.1}
          value={t}
          onChange={(ev) => setT(Number(ev.target.value))}
          aria-label="Clip position"
          className="h-1 flex-1 cursor-pointer accent-[rgb(var(--color-background-primary-default))]"
        />
        <span className="font-mono text-xs opacity-70">{CLIP_SECONDS}s clip</span>
      </div>
    </div>
  );
}

function Label({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-body">{children}</span>
      {right}
    </div>
  );
}

interface Props {
  event: FeedEvent | null;
  intent: "escalate" | "link" | null;
  position: { index: number; total: number };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEscalate: (id: string, assignee: string, note: string) => void;
  onLink: (id: string, caseId: string) => void;
  onDismiss: (id: string) => void;
}

export function EventDrawer({ event: e, intent, position, onClose, onPrev, onNext, onEscalate, onLink, onDismiss }: Props) {
  const [mode, setMode] = useState<"escalate" | "link" | null>(null);
  const [assignee, setAssignee] = useState("");
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Each event opens clean; a card's Escalate/Link button opens the matching form straight away.
  useEffect(() => {
    setMode(intent);
    setAssignee("");
    setNote("");
  }, [e?.id, intent]);
  useEffect(() => {
    if (mode) formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mode]);

  useEffect(() => {
    if (!e) return;
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement;
      if (el?.closest?.("input,textarea,select,[role=listbox]")) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      if (k === "j" || k === "arrowdown") { ev.preventDefault(); onNext(); }
      else if (k === "k" || k === "arrowup") { ev.preventDefault(); onPrev(); }
      else if (e.status === "pending") {
        if (k === "e") { ev.preventDefault(); setMode("escalate"); }
        else if (k === "l" && !e.caseId) { ev.preventDefault(); setMode("link"); }
        else if (k === "d") { ev.preventDefault(); onDismiss(e.id); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [e, onNext, onPrev, onDismiss]);

  const pending = e?.status === "pending";

  return (
    <Drawer
      open={!!e}
      onClose={onClose}
      width={800}
      title={
        e && (
          <span className="flex flex-col items-start gap-1.5">
            <SeverityChip severity={e.severity} dot />
            <span className="text-xl">{e.title}</span>
          </span>
        )
      }
      subtitle={e && `${e.ref} · ${e.model.id} · ${e.full}`}
      footer={
        e && (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {pending ? (
                <>
                  <button type="button" className={cn(mode === "escalate" ? BTN_OUTLINE : BTN_PRIMARY)} onClick={() => setMode(mode === "escalate" ? null : "escalate")}>
                    Escalate Case <kbd className="ml-1 font-mono text-[10px] opacity-70">E</kbd>
                  </button>
                  <button
                    type="button"
                    className={cn(BTN_OUTLINE, "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled")}
                    disabled={!!e.caseId}
                    onClick={() => setMode(mode === "link" ? null : "link")}
                  >
                    Link Case <kbd className="ml-1 font-mono text-[10px] opacity-70">L</kbd>
                  </button>
                </>
              ) : (
                <span className="text-sm text-body">
                  {e.status === "escalated" ? `Escalated to ${e.caseId}${e.assignee ? ` · owner ${e.assignee}` : ""}` : "Dismissed"}
                </span>
              )}
            </div>
            {pending && (
              <button type="button" className="h-9 px-3 text-sm font-semibold text-danger hover:underline" onClick={() => onDismiss(e.id)}>
                Dismiss <kbd className="ml-1 font-mono text-[10px] opacity-70">D</kbd>
              </button>
            )}
          </div>
        )
      }
    >
      {e && (
        <>
          <div className="flex items-center justify-between rounded-lg bg-main-background px-3 py-2">
            <span className="text-sm text-body">
              Event <span className="font-semibold text-default">{position.index + 1}</span> of {position.total}
            </span>
            <span className="flex items-center gap-1">
              <span className="mr-2 hidden text-xs text-caption sm:inline">J / K to move</span>
              <button type="button" onClick={onPrev} disabled={position.index === 0} aria-label="Previous event" className="flex h-8 w-8 items-center justify-center rounded-md text-default hover:bg-surface disabled:opacity-40">
                <Icon name="chevron-up" size={16} />
              </button>
              <button type="button" onClick={onNext} disabled={position.index >= position.total - 1} aria-label="Next event" className="flex h-8 w-8 items-center justify-center rounded-md text-default hover:bg-surface disabled:opacity-40">
                <Icon name="chevron-down" size={16} />
              </button>
            </span>
          </div>

          <Clip event={e} />

          <Label>Event summary</Label>
          <p className="rounded-xl border border-invert-default p-4 text-sm leading-relaxed text-default">
            <RichText parts={e.desc} />
          </p>

          <Label
            right={
              <span className="rounded-md border border-purple bg-purple-invert-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-purple">
                AI-GENERATED · 8S CLIP
              </span>
            }
          >
            <Icon name="sparkles" size={16} className="text-purple" />
            VLM reasoning
          </Label>
          <p className="rounded-xl border border-purple bg-purple-invert-soft p-4 text-sm leading-relaxed text-default">
            <RichText parts={e.vlm} />
          </p>

          <Label right={<span className="flex items-center gap-1 text-xs font-medium text-purple">View model <Icon name="arrow-right" size={12} /></span>}>
            Detected by
          </Label>
          <div className="rounded-xl border border-invert-default p-4">
            <p className="flex items-center gap-2 font-mono text-sm font-semibold text-purple">
              <Icon name="settings" size={16} />
              {e.model.name}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-body">
              <span>Model ID: {e.model.id}</span>
              <span>Trained: {e.model.trained}</span>
              <span>Last eval mAP: {e.model.mAP}</span>
            </div>
            <div className="mt-3">
              <ModelChip model={e.model} />
            </div>
          </div>

          {pending && mode === "escalate" && (
            <div ref={formRef} className="flex flex-col gap-3 rounded-xl border border-primary bg-primary-invert-soft p-4">
              <Label>Escalate to a new case</Label>
              <Select
                label="Assign to"
                required
                options={ASSIGNEES}
                value={assignee}
                onChange={setAssignee}
                placeholder="Choose an owner"
              />
              <label className="flex flex-col gap-1 text-sm font-medium text-default">
                Note <span className="text-xs font-normal text-body">Why is this a case? Kept in the activity log.</span>
                <textarea
                  value={note}
                  onChange={(ev) => setNote(ev.target.value)}
                  rows={3}
                  className="rounded-lg border border-invert-default bg-surface p-3 text-sm font-normal text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused"
                  placeholder="Optional"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" className={BTN_OUTLINE} onClick={() => setMode(null)}>Cancel</button>
                <button
                  type="button"
                  disabled={!assignee}
                  className={cn(BTN_PRIMARY, "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled")}
                  onClick={() => onEscalate(e.id, assignee, note)}
                >
                  Escalate
                </button>
              </div>
            </div>
          )}

          {pending && mode === "link" && (
            <div ref={formRef} className="flex flex-col gap-2 rounded-xl border border-primary bg-primary-invert-soft p-4">
              <Label>Link to an open case</Label>
              <ul className="flex flex-col gap-2">
                {OPEN_CASES.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onLink(e.id, c.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-invert-default bg-surface px-3 py-2 text-left hover:border-primary"
                    >
                      <span className="text-sm text-default">{c.title}</span>
                      <span className="font-mono text-xs text-info">{c.id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
