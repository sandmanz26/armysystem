import { create } from "zustand";
import { EVENTS, DISMISSED_BEFORE, type FeedEvent } from "./detection-feed/data";

/*
 * Shared Accel state. The Detection Feed, the sidebar badge, the "Attention Needed"
 * pill in the top bar and the Live Monitoring alert all read the same events — before
 * this they were separate copies, so acting on a detection changed one page and left
 * every other count stale.
 *
 * Every mutation keeps one snapshot so it can be undone (Dismiss is the dangerous one:
 * it used to be one click with no way back).
 */

interface Last {
  label: string;
  before: FeedEvent[];
  beforeDismissed: number;
}

interface AccelState {
  events: FeedEvent[];
  dismissedBefore: number;
  last: Last | null;
  escalate: (ids: string[], assignee: string, note?: string) => void;
  link: (id: string, caseId: string) => void;
  dismiss: (ids: string[]) => void;
  restore: (id: string) => void;
  undo: () => void;
  clearLast: () => void;
}

export const useAccel = create<AccelState>((set, get) => {
  const apply = (label: string, fn: (e: FeedEvent) => FeedEvent, ids: string[], dismissedDelta = 0) => {
    const { events, dismissedBefore } = get();
    set({
      last: { label, before: events, beforeDismissed: dismissedBefore },
      events: events.map((e) => (ids.includes(e.id) ? fn(e) : e)),
      dismissedBefore: dismissedBefore + dismissedDelta,
    });
  };
  return {
    events: EVENTS,
    dismissedBefore: DISMISSED_BEFORE,
    last: null,
    escalate: (ids, assignee, note) =>
      apply(
        ids.length > 1 ? `${ids.length} events escalated` : "Case escalated",
        (e) => ({ ...e, status: "escalated", assignee, note, caseId: e.caseId ?? "CASE-2026-0212" }),
        ids,
      ),
    link: (id, caseId) => apply(`Linked to ${caseId}`, (e) => ({ ...e, caseId }), [id]),
    dismiss: (ids) =>
      apply(ids.length > 1 ? `${ids.length} events dismissed` : "Event dismissed", (e) => ({ ...e, status: "dismissed" }), ids, ids.length),
    restore: (id) => apply("Event restored", (e) => ({ ...e, status: "pending" }), [id], -1),
    undo: () => {
      const l = get().last;
      if (l) set({ events: l.before, dismissedBefore: l.beforeDismissed, last: null });
    },
    clearLast: () => set({ last: null }),
  };
});

/** Pending critical events — what the top-bar pill and the sidebar badge count. */
export const selectPendingCritical = (s: AccelState) =>
  s.events.filter((e) => e.status === "pending" && e.severity === "critical").length;
