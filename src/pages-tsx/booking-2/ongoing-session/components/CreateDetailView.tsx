import { useMemo, useState } from "react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { ArrowLeftRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { cn } from "@/lib/utils";
import { stationsOf, type DraftDetail, type LaneAssignment, type OngoingSession, type SessionTrainee } from "../session";
import { PrimaryButton, SecondaryButton, SessionHeader } from "./SessionHeader";
import { EditStageDrawer } from "../modals/DetailDrawers";
import { SelectTraineeDrawer } from "../modals/SelectTraineeDrawer";
import { MoveLaneDrawer } from "../modals/MoveLaneDrawer";

type Ctx = CellContext<LaneRow, any>;

interface LaneRow {
  lane: number;
  active: boolean;
  trainee: SessionTrainee | null;
}

const dash = <span className="text-sm text-default">—</span>;

// Figma `Action: Create New Detail` step 2 (`Detail List - Empty/Filled`,
// 5764:208967 / 5765:214658): one row per lane, Off lanes greyed, each free
// lane with its own "Select Trainee".
export function CreateDetailView({
  session,
  initial,
  onClose,
  onSaveDraft,
  onConfirm,
}: {
  session: OngoingSession;
  initial: DraftDetail;
  onClose: () => void;
  onSaveDraft: (d: DraftDetail) => void;
  onConfirm: (d: DraftDetail) => void;
}) {
  const [draft, setDraft] = useState<DraftDetail>(initial);
  const [selectLane, setSelectLane] = useState<number | null>(null);
  const [moveTrainee, setMoveTrainee] = useState<SessionTrainee | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ trainee: SessionTrainee; lane: number } | null>(null);
  const [editStage, setEditStage] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const station = session.stations.find((s) => s.label === draft.station);
  const active = station?.activeLanes ?? [];
  const byId = useMemo(() => new Map(session.trainees.map((t) => [t.id, t])), [session.trainees]);
  const laneOf = (traineeId: string) => draft.assignments.find((a) => a.traineeId === traineeId)?.lane;
  const occupant = (lane: number) => {
    const a = draft.assignments.find((x) => x.lane === lane);
    return a ? byId.get(a.traineeId) ?? null : null;
  };

  const rows: LaneRow[] = Array.from({ length: station?.laneCount ?? 15 }, (_, i) => ({
    lane: i + 1,
    active: active.includes(i + 1),
    trainee: occupant(i + 1),
  }));
  const free = active.length - draft.assignments.length;
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const setAssignments = (fn: (a: LaneAssignment[]) => LaneAssignment[]) => setDraft((d) => ({ ...d, assignments: fn(d.assignments) }));

  // Figma `Toast - Swapped with Other Trainee` / `Swapped to Available Lane`.
  const moveTo = (traineeId: string, toLane: number) => {
    const fromLane = laneOf(traineeId);
    if (fromLane == null || fromLane === toLane) return;
    const mover = byId.get(traineeId);
    const other = occupant(toLane);
    setAssignments((list) => list.map((a) => {
      if (a.traineeId === traineeId) return { ...a, lane: toLane };
      if (other && a.traineeId === other.id) return { ...a, lane: fromLane };
      return a;
    }));
    if (!mover) return;
    setToast(other
      ? `${mover.rank} ${mover.name} and ${other.rank} ${other.name} swapped positions`
      : `${mover.rank} ${mover.name} moved to Lane ${toLane}`);
  };

  const dropZone = (row: LaneRow, children: React.ReactNode, extra?: string) => (
    <div
      onDragOver={(e) => { if (row.active && dragFrom != null) e.preventDefault(); }}
      onDrop={(e) => {
        e.preventDefault();
        const from = dragFrom;
        setDragFrom(null);
        if (from == null || !row.active) return;
        const t = occupant(from);
        if (t) moveTo(t.id, row.lane);
      }}
      className={cn("-mx-5 -my-3 flex h-14 items-center px-5", !row.active && "bg-default-default", extra)}
    >
      {children}
    </div>
  );

  const columns = [
    {
      id: "lane", width: 144, header: () => "Lane",
      cell: ({ row }: Ctx) => dropZone(row.original, (
        <span className="flex items-center gap-3 text-sm text-default">
          Lane {row.original.lane}
          {row.original.trainee && (
            <span
              draggable
              onDragStart={() => setDragFrom(row.original.lane)}
              onDragEnd={() => setDragFrom(null)}
              className="cursor-grab text-body"
              aria-label="Drag to another lane"
            >
              <GripVertical size={16} />
            </span>
          )}
        </span>
      )),
    },
    {
      id: "rank", width: 80, header: () => "Rank",
      cell: ({ row }: Ctx) => dropZone(row.original, !row.original.active ? <span className="text-sm text-body">Off</span> : row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.rank}</span> : dash),
    },
    {
      id: "name", width: 323, header: () => "Name",
      cell: ({ row }: Ctx) => dropZone(row.original, !row.original.active ? null : row.original.trainee ? <span className="text-sm font-semibold text-default">{row.original.trainee.name}</span> : dash),
    },
    {
      id: "svcId", width: 323, header: () => "Service ID",
      cell: ({ row }: Ctx) => dropZone(row.original, !row.original.active ? null : row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.svcId}</span> : dash),
    },
    {
      id: "weapon", width: 323, header: () => "Weapon Type(s)",
      cell: ({ row }: Ctx) => dropZone(row.original, !row.original.active ? null : row.original.trainee ? <span className="text-sm text-default">{row.original.trainee.weapon.join(", ")}</span> : dash),
    },
    {
      id: "actions", width: 200, header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }: Ctx) => dropZone(row.original, !row.original.active ? null : row.original.trainee ? (
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Move" onClick={() => setMoveTrainee(row.original.trainee)} className="flex h-7 w-7 items-center justify-center rounded text-caption hover:bg-primary-invert-soft hover:text-primary transition-colors">
            <ArrowLeftRight size={16} />
          </button>
          <button type="button" aria-label="Remove" onClick={() => setRemoveTarget({ trainee: row.original.trainee!, lane: row.original.lane })} className="flex h-7 w-7 items-center justify-center rounded text-caption hover:bg-primary-invert-soft hover:text-danger transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setSelectLane(row.original.lane)} className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
          <Plus size={16} />
          Select Trainee
        </button>
      ), "justify-end"),
    },
  ] as unknown as ColumnDef<LaneRow, any>[];

  const candidates = session.trainees.filter((t) => t.type === draft.type && !draft.assignments.some((a) => a.traineeId === t.id));

  return (
    <div className="flex h-full flex-col">
      <SessionHeader
        title="Create New Detail"
        subtitle={<span className="text-body">{draft.station}</span>}
        onClose={() => (dirty ? setLeaveOpen(true) : onClose())}
        right={
          <>
            <SecondaryButton onClick={() => onSaveDraft(draft)}>Save &amp; Close</SecondaryButton>
            <PrimaryButton onClick={() => onConfirm(draft)}>Confirm New Detail</PrimaryButton>
          </>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-default">Detail List{draft.stages.length > 0 ? ` (${draft.stages.join(", ")})` : ""}</span>
              <span className="text-xs text-success">{free}/{active.length} Seat{free === 1 ? "" : "s"} Available</span>
            </div>
            {/* Edit Stage stays (Figma `Edit Stage` 5765:216870): stages can still be set here while the drawer's Booking Type is hidden. */}
            <button type="button" onClick={() => setEditStage(true)} className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
              <Pencil size={16} />
              Edit Stage
            </button>
          </div>
          <TableCustom<LaneRow> columns={columns} data={rows} autoScrollTable />
        </div>
      </div>

      <SelectTraineeDrawer
        open={selectLane != null}
        session={session}
        candidates={candidates}
        stations={stationsOf(session, draft.type)}
        onClose={() => setSelectLane(null)}
        onConfirm={(id) => {
          const lane = selectLane!;
          setAssignments((list) => [...list.filter((a) => a.lane !== lane), { lane, traineeId: id }]);
          setSelectLane(null);
        }}
      />

      <MoveLaneDrawer
        trainee={moveTrainee}
        currentPosition={`${draft.station}, New Detail, Lane ${moveTrainee ? laneOf(moveTrainee.id) : ""}`}
        destinations={active.filter((l) => !moveTrainee || l !== laneOf(moveTrainee.id)).map((l) => ({ lane: l, occupant: occupant(l) }))}
        onClose={() => setMoveTrainee(null)}
        onConfirm={(lane) => { if (moveTrainee) moveTo(moveTrainee.id, lane); setMoveTrainee(null); }}
      />

      <EditStageDrawer
        open={editStage}
        stages={draft.stages}
        onClose={() => setEditStage(false)}
        onConfirm={(stages) => { setDraft((d) => ({ ...d, stages })); setEditStage(false); setToast("Stage updated"); }}
      />

      <ConfirmDialog
        open={!!removeTarget}
        tone="warning"
        title={<>Remove &ldquo;{removeTarget?.trainee.name}&rdquo;?</>}
        subtitle={`${removeTarget?.trainee.name} will be removed from the detail list.`}
        confirmLabel="Remove"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) {
            setAssignments((list) => list.filter((a) => a.traineeId !== removeTarget.trainee.id));
            setToast(`${removeTarget.trainee.name} removed from Lane ${removeTarget.lane}`);
          }
          setRemoveTarget(null);
        }}
      />

      <ConfirmDialog
        open={leaveOpen}
        tone="warning"
        title="Leave this page?"
        subtitle="You have unsaved detail list. If you go back now, all the information you’ve entered will be lost."
        cancelLabel="Continue Editing"
        confirmLabel="Yes, Leave"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => { setLeaveOpen(false); onClose(); }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} placement="top-right" offsetTop={72} />
    </div>
  );
}
