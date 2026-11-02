// Booking 2.0 — Ongoing Session (Figma page 5549:141192), full screen.
//
// Entry: Onboarding's Begin Session (lands here with a "Session has begun"
// toast), or Booking Detail's "Continue Session" on an Ongoing booking.
// One page, several views — the Detail List dashboard, Live Results, a
// single detail's lanes, the Create New Detail lane table, and Session Ended
// — because Figma keeps the same Header Nav across all of them rather than
// routing to separate screens.
import { useCallback, useEffect, useMemo, useState } from "react";
import { bookings } from "@/data/mock";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import {
  addDetail, reshootCandidates, reshootGroups, applyCutQueue, applyDetailEdits, applyLaneConfig, loadSession, mockSession, saveSession,
  type DraftDetail, type LaneAssignment, type OngoingSession, type SessionDetail, type StationType,
} from "./session";
import { PrimaryButton, SecondaryButton, SessionHeader, SessionSubHeader, SessionSubtitle } from "./components/SessionHeader";
import { SessionLaneConfigView } from "./components/SessionLaneConfigView";
import { SessionEditDetailListView } from "./components/SessionEditDetailListView";
import { SessionSidebar } from "./components/SessionSidebar";
import { DetailListView, LaneDownBanner } from "./components/DetailListView";
import { LiveResultsView } from "./components/LiveResultsView";
import { DetailDetailsView } from "./components/DetailDetailsView";
import { CreateDetailView } from "./components/CreateDetailView";
import { SessionEndedView } from "./components/SessionEndedView";
import { CutQueueDrawer } from "./modals/CutQueueDrawer";
import { CreateDetailDrawer } from "./modals/DetailDrawers";
import { ReshootFailedDrawer } from "./modals/ReshootFailedDrawer";

type View =
  | { kind: "main" }
  | { kind: "live" }
  | { kind: "detail"; id: string }
  | { kind: "create"; draft: DraftDetail }
  | { kind: "lanes" }
  | { kind: "edit" }
  | { kind: "ended" };

function initialSession(): OngoingSession | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") ?? "";
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return null;
  const s = loadSession(id) ?? mockSession(booking);
  // Prototype hook for Figma `Toast - Lane Down` (5551:211454) — there is no
  // hardware signal to raise it: `?laneDown=WPT-01:3`.
  const ld = params.get("laneDown");
  if (ld) {
    const [station, lane] = ld.split(":");
    s.laneDown = { station, lane: Number(lane) };
  }
  saveSession(s);
  return s;
}

export function OngoingSessionPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [session, setSessionState] = useState<OngoingSession | null>(initialSession);
  const [view, setView] = useState<View>(() => (session?.endedAt ? { kind: "ended" } : { kind: "main" }));
  const [tab, setTab] = useState<StationType>("flat");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("begun") ? "Session has begun" : null,
  );
  const [cutTarget, setCutTarget] = useState<SessionDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reshoot, setReshoot] = useState<string[] | null>(null);
  const [reshootFailedOpen, setReshootFailedOpen] = useState(false);
  const [liveKey, setLiveKey] = useState(0);
  const [finishOpen, setFinishOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Stable on purpose: Toast restarts its auto-dismiss timer whenever
  // onDismiss changes, and the duration clock re-renders this page every second.
  const dismissToast = useCallback(() => setToast(null), []);

  const setSession = (s: OngoingSession) => {
    saveSession(s);
    setSessionState(s);
  };

  const unfinished = useMemo(() => session?.details.filter((d) => d.status !== "Completed").length ?? 0, [session]);
  const failed = useMemo(() => (session ? reshootCandidates(session) : []), [session]);
  const failedGroups = useMemo(() => (session ? reshootGroups(session, failed) : []), [session, failed]);

  if (!session) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-default-soft">
        <div className="text-center">
          <p className="mb-4 text-sm text-body">Booking not found in Booking 2.0.</p>
          <button type="button" onClick={() => onNavigate("/bookings/list")} className="text-sm font-semibold text-primary">
            Back to Booking List
          </button>
        </div>
      </div>
    );
  }

  // Creates one detail per group (Reshoot Failed Trainees and Live Results' bulk "Create New Detail").
  const createFromGroups = (groups: { station: string; assignments: LaneAssignment[] }[]) => {
    let next = session;
    const created: { station: string; number: number; size: number }[] = [];
    groups.forEach((g) => {
      const r = addDetail(next, g.station, g.assignments);
      next = r.session;
      created.push({ station: g.station, number: r.detail.number, size: g.assignments.length });
    });
    setSession(next);
    setReshootFailedOpen(false);
    setReshoot(null);
    setLiveKey((k) => k + 1);
    if (created.length === 1) {
      const c = created[0];
      setToast(`Detail ${c.number} created with ${c.size} trainees in ${c.station}`);
    } else {
      const stations = [...new Set(created.map((c) => c.station))].map(
        (st) => `${st} (${created.filter((c) => c.station === st).map((c) => `Detail ${c.number}`).join(", ")})`,
      );
      const list = stations.length > 1 ? `${stations.slice(0, -1).join(", ")} and ${stations[stations.length - 1]}` : stations[0];
      setToast(`${created.length} details created for ${list}`);
    }
  };

  const goBooking = () => onNavigate(`/bookings/detail?id=${session.bookingId}`);

  if (view.kind === "ended") {
    return (
      <div className="fixed inset-0 z-[1000] bg-default-soft">
        <SessionEndedView session={session} onGoToBooking={goBooking} onViewResults={() => onNavigate("/training-results-2")} />
      </div>
    );
  }

  // Lane Configuration / Edit Detail List replace the whole screen (own header), as in the reference screenshots.
  if (view.kind === "lanes") {
    return (
      <div className="fixed inset-0 z-[1000] bg-default-soft">
        <SessionLaneConfigView
          session={session}
          onBack={() => setView({ kind: "main" })}
          onApply={(lanes, changed) => {
            setSession(applyLaneConfig(session, lanes));
            setView({ kind: "main" });
            setToast(`Lane configuration updated — ${changed} lane${changed === 1 ? "" : "s"} changed, queue recalculated`);
          }}
        />
      </div>
    );
  }

  if (view.kind === "edit") {
    return (
      <div className="fixed inset-0 z-[1000] bg-default-soft">
        <SessionEditDetailListView
          session={session}
          onBack={() => setView({ kind: "main" })}
          onSave={(details) => {
            setSession(applyDetailEdits(session, details));
            setView({ kind: "main" });
            setToast("Detail list updated");
          }}
        />
      </div>
    );
  }

  if (view.kind === "create") {
    return (
      <div className="fixed inset-0 z-[1000] bg-default-soft">
        <CreateDetailView
          session={session}
          initial={view.draft}
          onClose={() => setView({ kind: "main" })}
          onSaveDraft={(d) => {
            const exists = session.drafts.some((x) => x.id === d.id);
            setSession({ ...session, drafts: exists ? session.drafts.map((x) => (x.id === d.id ? d : x)) : [...session.drafts, d] });
            setView({ kind: "main" });
            setToast(`New Detail — ${d.station} saved`);
          }}
          onConfirm={(d) => {
            const r = addDetail({ ...session, drafts: session.drafts.filter((x) => x.id !== d.id) }, d.station, d.assignments);
            setSession(r.session);
            setView({ kind: "main" });
            setToast("Detail list created");
          }}
        />
      </div>
    );
  }

  const sub = view.kind === "live" ? "Live Results" : view.kind === "detail" ? "Detail List" : null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-default-soft">
      <SessionHeader
        title="Ongoing Session"
        subtitle={<SessionSubtitle code={session.bookingCode} name={session.bookingName} courseware={session.courseware} />}
        onClose={goBooking}
        right={
          <>
            <SecondaryButton onClick={() => setView({ kind: "lanes" })}>Lane Configuration</SecondaryButton>
            <SecondaryButton onClick={() => setView({ kind: "edit" })}>Edit Detail List</SecondaryButton>
            <PrimaryButton onClick={() => setFinishOpen(true)}>Finish Session</PrimaryButton>
          </>
        }
      />
      {sub && <SessionSubHeader title={sub} onBack={() => setView({ kind: "main" })} />}

      <div className="flex-1 overflow-auto p-6">
        {view.kind === "main" && (
          <div className="flex flex-col gap-6">
            {session.laneDown && <LaneDownBanner station={session.laneDown.station} lane={session.laneDown.lane} />}
            <div className="flex items-start gap-6">
              <SessionSidebar session={session} now={now} onOpenResults={() => setView({ kind: "live" })} />
              <DetailListView
                session={session}
                tab={tab}
                onTabChange={setTab}
                onCreateDetail={() => setCreateOpen(true)}
                reshootCount={failed.length}
                onReshoot={() => setReshootFailedOpen(true)}
                onLiveResults={() => setView({ kind: "live" })}
                onCut={setCutTarget}
                onView={(d) => setView({ kind: "detail", id: d.id })}
                onDeleteDraft={(d) => setSession({ ...session, drafts: session.drafts.filter((x) => x.id !== d.id) })}
                onEditDraft={(d) => setView({ kind: "create", draft: d })}
              />
            </div>
          </div>
        )}
        {view.kind === "live" && <LiveResultsView key={liveKey} session={session} onCreateDetail={setReshoot} />}
        {view.kind === "detail" && <DetailDetailsView session={session} detailId={view.id} onChangeDetail={(id) => setView({ kind: "detail", id })} />}
      </div>

      <CutQueueDrawer
        session={session}
        detail={cutTarget}
        onClose={() => setCutTarget(null)}
        onConfirm={(beforeId) => {
          const before = session.details.find((d) => d.id === beforeId);
          if (cutTarget && before) {
            setSession(applyCutQueue(session, cutTarget.id, beforeId));
            setToast(`Detail ${cutTarget.number} cut before Detail ${before.number} in ${cutTarget.station}`);
          }
          setCutTarget(null);
        }}
      />

      <CreateDetailDrawer
        open={createOpen}
        stations={session.stations.filter((s) => s.type === tab).map((s) => s.label)}
        onClose={() => setCreateOpen(false)}
        onCreate={({ stages, station }) => {
          setCreateOpen(false);
          const type = session.stations.find((s) => s.label === station)?.type ?? "flat";
          setView({ kind: "create", draft: { id: `draft-${Date.now()}`, type, station, stages, assignments: [] } });
        }}
      />

      {/* Figma `Create New Detail List` (5753:83359) — Live Results' bulk "Create New Detail": the picked trainees
          grouped into the details they would fill, each with its own Result. */}
      <ReshootFailedDrawer
        open={!!reshoot}
        session={session}
        candidates={reshoot ? session.trainees.filter((t) => reshoot.includes(t.id)) : []}
        groups={reshoot ? reshootGroups(session, session.trainees.filter((t) => reshoot.includes(t.id))) : []}
        title="Create New Detail"
        createLabel={(n) => `Create Detail (${n})`}
        onClose={() => setReshoot(null)}
        onCreate={createFromGroups}
      />

      {/* Figma `Action - Reshoot` (7897:50464 → 7897:50466 / 7897:50469). */}
      <ReshootFailedDrawer
        open={reshootFailedOpen}
        session={session}
        candidates={failed}
        groups={failedGroups}
        onClose={() => setReshootFailedOpen(false)}
        onCreate={createFromGroups}
      />

      <ConfirmDialog
        open={finishOpen}
        tone={unfinished > 0 ? "danger" : "warning"}
        title="Finish session?"
        subtitle={unfinished > 0 ? (
          <>
            Ending this session will stop all remaining details. <strong>{unfinished} detail{unfinished === 1 ? "" : "s"}</strong> still In Queue or Pending will not be completed. <strong>This can&apos;t be undone.</strong>
          </>
        ) : (
          `All ${session.details.length} details have been completed.`
        )}
        confirmLabel="Finish Session"
        onCancel={() => setFinishOpen(false)}
        onConfirm={() => {
          setSession({ ...session, endedAt: Date.now() });
          setFinishOpen(false);
          setView({ kind: "ended" });
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={dismissToast} placement="top-right" offsetTop={sub ? 132 : 72} />
    </div>
  );
}
