import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { isLockedDetail, laneFits, lanesOf, weaponsOf, type OngoingSession, type SessionDetail, type SessionTrainee } from "../session";
import { STATUS_TONE } from "../statusTone";
import { PrimaryButton, SecondaryButton } from "./SessionHeader";

// Ongoing Session → "Edit Detail List". NOT in Figma yet — built from the product owner's reference
// screenshot (3 Oct 2026). Every detail is a card listing every lane of its station: a trainee row
// (draggable), an "Available" lane, or "Lane turned off". Ready / Completed details are locked.
// Dragging a trainee onto another lane of the same station moves them (onto an empty lane) or swaps
// them (onto an occupied one); a lane only takes a trainee whose weapon it is set up for.

type Filter = "all" | "flat" | "cshaped";
type Source = { detailId: string; lane: number };

export function SessionEditDetailListView({
  session,
  onBack,
  onSave,
}: {
  session: OngoingSession;
  onBack: () => void;
  onSave: (details: SessionDetail[]) => void;
}) {
  const [draft, setDraft] = useState<SessionDetail[]>(() => JSON.parse(JSON.stringify(session.details)));
  const [filter, setFilter] = useState<Filter>("all");
  const [hint, setHint] = useState("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [discard, setDiscard] = useState(false);
  const drag = useRef<Source | null>(null);

  const traineeById = useMemo(() => new Map(session.trainees.map((t) => [t.id, t])), [session.trainees]);
  const stationByLabel = useMemo(() => new Map(session.stations.map((s) => [s.label, s])), [session.stations]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(session.details);

  const ordered = useMemo(
    () => [...draft].sort((a, b) => a.station.localeCompare(b.station) || a.order - b.order),
    [draft],
  );
  const shown = ordered.filter((d) => filter === "all" || d.type === filter);
  const count = (f: Filter) => draft.filter((d) => f === "all" || d.type === f).length;

  const say = (m: string) => { setHint(m); setTimeout(() => setHint((h) => (h === m ? "" : h)), 3500); };

  const drop = (target: Source) => {
    const src = drag.current;
    drag.current = null;
    setDragOver(null);
    if (!src || (src.detailId === target.detailId && src.lane === target.lane)) return;
    const from = draft.find((d) => d.id === src.detailId);
    const to = draft.find((d) => d.id === target.detailId);
    if (!from || !to) return;
    if (isLockedDetail(from) || isLockedDetail(to)) { say("Locked details can't be changed."); return; }
    if (from.station !== to.station) { say("A trainee can only move within their own station."); return; }
    const station = stationByLabel.get(from.station);
    if (!station) return;
    const lanes = lanesOf(station);
    const mover = traineeById.get(from.assignments.find((a) => a.lane === src.lane)?.traineeId ?? "");
    if (!mover) return;
    if (!laneFits(lanes[target.lane - 1], mover.weapon)) { say(`Lane ${target.lane} isn't set up for ${weaponsOf(mover.weapon).join(", ") || "this trainee's weapon"}.`); return; }
    const occupantId = to.assignments.find((a) => a.lane === target.lane)?.traineeId;
    const occupant = occupantId ? traineeById.get(occupantId) : undefined;
    if (occupant && !laneFits(lanes[src.lane - 1], occupant.weapon)) { say(`Lane ${src.lane} isn't set up for ${occupant.name}'s weapon, so they can't swap.`); return; }

    setDraft((prev) => prev.map((d) => {
      let a = d.assignments;
      if (d.id === from.id) a = a.filter((x) => x.lane !== src.lane);
      if (d.id === to.id && d.id !== from.id) a = a.filter((x) => x.lane !== target.lane);
      if (d.id === from.id && d.id === to.id) a = a.filter((x) => x.lane !== target.lane);
      if (d.id === to.id) a = [...a, { lane: target.lane, traineeId: mover.id }];
      if (d.id === from.id && occupant) a = [...a, { lane: src.lane, traineeId: occupant.id }];
      return { ...d, assignments: a.sort((x, y) => x.lane - y.lane) };
    }));
  };

  const back = () => (dirty ? setDiscard(true) : onBack());

  const renderRow = (detail: SessionDetail, lane: number, trainee: SessionTrainee | undefined) => {
    const st = stationByLabel.get(detail.station)!;
    const cfg = lanesOf(st)[lane - 1];
    const locked = isLockedDetail(detail);
    const key = `${detail.id}:${lane}`;
    const over = dragOver === key;
    const target = { detailId: detail.id, lane };
    const chip = <span className="flex-shrink-0 rounded bg-default-default px-2 py-0.5 text-[10px] font-medium text-default">Lane {lane}</span>;
    const handlers = locked ? {} : {
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(key); },
      onDragLeave: () => setDragOver((o) => (o === key ? null : o)),
      onDrop: () => drop(target),
    };

    if (!cfg?.active) {
      return (
        <div className="flex items-center justify-between px-3 py-2.5 text-xs italic text-disabled">
          <span className="pl-5">Lane turned off</span>{chip}
        </div>
      );
    }
    if (!trainee) {
      return (
        <div {...handlers} className={cn("flex items-center justify-between bg-success-invert-default px-3 py-2.5", over && "outline outline-2 -outline-offset-2 outline-primary")}>
          <span className="flex items-center gap-2 pl-5 text-xs">
            <span className="font-semibold text-success">Available</span>
            {(cfg.weapon.length > 0 || cfg.role) && (
              <span className="text-[10px] text-success">{[weaponsOf(cfg.weapon).join(", "), cfg.role].filter(Boolean).join(" • ")}</span>
            )}
          </span>
          {chip}
        </div>
      );
    }
    return (
      <div
        {...handlers}
        draggable={!locked}
        onDragStart={() => { drag.current = target; }}
        className={cn("flex items-center gap-2 px-3 py-2", locked ? "text-disabled" : "cursor-grab bg-surface active:cursor-grabbing", over && "outline outline-2 -outline-offset-2 outline-primary")}
      >
        <Icon name={locked ? "lock" : "grip-vertical"} size={12} className="flex-shrink-0 text-disabled" />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-xs font-semibold", locked ? "text-body" : "text-default")}>{trainee.rank} {trainee.name}</p>
          <p className="truncate text-[10px] text-body">{[trainee.svcId, weaponsOf(trainee.weapon).join(", "), cfg.role].filter(Boolean).join(" • ")}</p>
        </div>
        {chip}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-[72px] flex-shrink-0 items-center justify-between gap-4 bg-surface px-6">
        <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-default">Edit Detail List</h2>
          <p className="text-xs text-body">Drag a trainee onto another lane to move them. Lanes keep their configured weapon, so a trainee only fits a matching lane.</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <SecondaryButton onClick={back}><Icon name="arrow-left" size={16} />Back</SecondaryButton>
          <SecondaryButton onClick={() => setDraft(JSON.parse(JSON.stringify(session.details)))} className={cn(!dirty && "pointer-events-none opacity-50")}>
            <Icon name="rotate-ccw" size={16} />Reset
          </SecondaryButton>
          <PrimaryButton onClick={() => dirty && onSave(draft)} className={cn(!dirty && "pointer-events-none opacity-50")}>
            <Icon name="check" size={16} />Save changes
          </PrimaryButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex flex-wrap items-center gap-5 text-[11px] text-body">
          <span className="flex items-center gap-1.5"><Icon name="grip-vertical" size={12} className="text-disabled" />Drag to move</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success-default/50" />Available lane</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-default-default border border-invert-default" />Closed / off</span>
          <span className="flex items-center gap-1.5"><Icon name="lock" size={12} className="text-disabled" />Locked (already started or completed)</span>
          {hint && <span className="rounded bg-warning-invert-default px-2 py-0.5 font-semibold text-warning">{hint}</span>}
        </div>

        <div className="mb-5 flex items-center gap-2">
          {([["all", "All"], ["flat", "Flat Screen"], ["cshaped", "C-Shaped"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "h-8 rounded-lg border px-3 text-xs font-semibold transition-colors",
                filter === key ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-default-default text-default",
              )}
            >
              {label} ({count(key)})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {shown.map((d) => {
            const st = stationByLabel.get(d.station);
            if (!st) return null;
            const locked = isLockedDetail(d);
            return (
              <div key={d.id} className={cn("overflow-hidden rounded-xl border border-invert-default", locked ? "bg-default-soft" : "bg-surface")}>
                <div className="px-4 pb-2 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-default">Detail {d.number} <span className="font-normal text-body">({session.courseware})</span></p>
                    <StatusBadge tone={STATUS_TONE[d.status]}>{d.status}</StatusBadge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-body">
                    <span>{d.station}</span>
                    <span className="rounded border border-invert-info bg-info-invert-default px-1.5 py-0.5 font-medium text-info">{st.type === "flat" ? "Flat Screen" : "C-Shaped"}</span>
                    <span className="flex items-center gap-1"><Icon name="users" size={10} />{d.assignments.length} trainee{d.assignments.length === 1 ? "" : "s"}</span>
                    {locked && <span className="flex items-center gap-1"><Icon name="lock" size={10} />Not editable</span>}
                  </p>
                </div>
                <div className="divide-y divide-invert-default border-t border-invert-default">
                  {Array.from({ length: st.laneCount }, (_, i) => i + 1).map((lane) => (
                    <div key={lane}>{renderRow(d, lane, traineeById.get(d.assignments.find((a) => a.lane === lane)?.traineeId ?? ""))}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={discard}
        tone="warning"
        title="Discard changes?"
        subtitle="You moved trainees but haven't saved. Going back will lose those changes."
        confirmLabel="Discard"
        onCancel={() => setDiscard(false)}
        onConfirm={() => { setDiscard(false); onBack(); }}
      />
    </div>
  );
}
