import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Check, Trash2, GripVertical, ArrowLeft, Pencil, CornerUpLeft,
} from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EditableTrainee {
  _id:      string;
  role:     string;
  name:     string;
  svcId:     string;
  rank:     string;
  callsign: string;
  batch:    string;
  course:   string;
  unit:     string;
}

export interface EditableCabin {
  _id:          string;
  cabin:        string;
  platformType: string;
  callsign:     string;
  trainees:     EditableTrainee[];
  batchIdx:     number;
}

interface StagedEntry {
  _id:            string;
  trainee:        EditableTrainee;
  sourceCabinId:  string;
  sourceBatchIdx: number;
  targetBatchIdx: number;
}

interface PointerDrag {
  traineeId:      string;
  sourceCabinId:  string;
  stagedEntryId?: string;
  role:           string;
  name:           string;
  rank:           string;
  cursorX:        number;
  cursorY:        number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_COLOUR: Record<string, string> = {
  VC:      "bg-blue-100   text-blue-700",
  VO:      "bg-violet-100 text-violet-700",
  "TC/PC": "bg-orange-100 text-orange-700",
  TC:      "bg-orange-100 text-orange-700",
  SC:      "bg-emerald-100 text-emerald-700",
  SO:      "bg-gray-100   text-gray-600",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function RoleBadge({ role, sm }: { role: string; sm?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded font-bold tracking-wide whitespace-nowrap",
      sm ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]",
      ROLE_COLOUR[role] ?? "bg-gray-100 text-gray-600",
    )}>
      {role}
    </span>
  );
}

let _uid = 0;
const uid = () => `${++_uid}`;

type RawCabin = {
  cabin: string; platformType: string; callsign: string;
  trainees: Array<{ role: string; name: string; svcId: string; rank: string; callsign?: string; batch: string; course: string; unit: string }>;
};

function initEditable(batches: RawCabin[][]): EditableCabin[] {
  return batches.flatMap((batch, batchIdx) =>
    batch.map(g => ({
      _id: uid(), cabin: g.cabin, platformType: g.platformType, callsign: g.callsign, batchIdx,
      trainees: g.trainees.map(t => ({
        _id: uid(), role: t.role, name: t.name, svcId: t.svcId, rank: t.rank,
        callsign: t.callsign ?? "", batch: t.batch, course: t.course, unit: t.unit,
      })),
    }))
  );
}

// ── Staging panel ─────────────────────────────────────────────────────────────

function StagingPanel({
  entries, drag, onPointerDownEntry, onReturn,
}: {
  entries:            StagedEntry[];
  drag:               PointerDrag | null;
  onPointerDownEntry: (e: React.PointerEvent, s: StagedEntry) => void;
  onReturn:           (s: StagedEntry) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
          Incoming Transfer — {entries.length} trainee{entries.length > 1 ? "s" : ""}
        </span>
        <span className="text-xs text-amber-600">
          · Drag into a cabin below to assign, or ↩ to return to original batch
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map(staged => {
          const isBeingDragged = drag?.stagedEntryId === staged._id;
          return (
            <div
              key={staged._id}
              onPointerDown={(e) => { if (!isBeingDragged) onPointerDownEntry(e, staged); }}
              className={cn(
                "flex items-center gap-2 bg-white border rounded-lg px-3 py-2 select-none transition-all",
                isBeingDragged
                  ? "opacity-30 border-dashed border-amber-300 bg-amber-50"
                  : "border-amber-200 cursor-grab active:cursor-grabbing hover:border-amber-400 hover:shadow-sm",
              )}
            >
              <GripVertical size={12} className="text-amber-300 shrink-0" />
              <RoleBadge role={staged.trainee.role} />
              <span className="text-[11px] text-gray-400 font-mono shrink-0 w-8">{staged.trainee.rank}</span>
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{staged.trainee.name}</span>
              <span className="text-[10px] text-amber-500 font-medium ml-1 whitespace-nowrap">
                from Batch {staged.sourceBatchIdx + 1}
              </span>
              <button
                type="button"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => onReturn(staged)}
                title={`Return to Batch ${staged.sourceBatchIdx + 1}`}
                className="ml-1 flex items-center gap-1 text-[11px] text-amber-600 hover:text-gray-700 font-medium px-1.5 py-0.5 rounded hover:bg-amber-100 transition-colors"
              >
                <CornerUpLeft size={11} />
                Return
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Cabin card ────────────────────────────────────────────────────────────────

function EditableCabinCard({
  cabin, drag, onPointerDownTrainee, onRemoveTrainee, onRemoveCabin,
}: {
  cabin:                EditableCabin;
  drag:                 PointerDrag | null;
  onPointerDownTrainee: (e: React.PointerEvent, t: EditableTrainee) => void;
  onRemoveTrainee:      (traineeId: string, cabinId: string) => void;
  onRemoveCabin:        (cabinId: string) => void;
}) {
  const isMST      = cabin.cabin.startsWith("MST");
  const isDragging = drag !== null;
  const isSource   = drag?.sourceCabinId === cabin._id;
  const canDrop    = isDragging && !isSource;

  return (
    <div
      data-cabin-id={cabin._id}
      className={cn(
        "bg-white rounded-xl flex flex-col border-2 transition-colors",
        !isDragging           && "border-gray-200",
        isDragging && canDrop && "border-blue-300 ring-2 ring-blue-100 shadow-md",
        isDragging && isSource && "border-gray-200 opacity-60",
      )}
    >
      {isDragging && canDrop && (
        <div className="bg-blue-500 text-white text-xs font-bold text-center py-1 rounded-t-xl">
          ↓ Drop here
        </div>
      )}

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-gray-100",
        isMST ? "bg-red-50/50" : "bg-blue-50/50",
      )}>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
              isMST ? "bg-red-100 text-brand-primary" : "bg-blue-100 text-blue-700")}>
              {isMST ? "MST" : "TCT"}
            </span>
            <p className="text-sm font-bold text-gray-800">{cabin.cabin}</p>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {cabin.platformType}{cabin.callsign && <> &bull; <span className="font-medium">{cabin.callsign}</span></>}
          </p>
        </div>
        <button type="button" onClick={() => onRemoveCabin(cabin._id)}
          className="text-gray-300 hover:text-red-400 p-1 rounded transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Trainee list */}
      <div className="flex-1 px-3 py-2 space-y-0.5" data-cabin-id={cabin._id}>
        {cabin.trainees.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-5" data-cabin-id={cabin._id}>
            {isDragging && canDrop ? "Release to drop here" : "No trainees assigned"}
          </p>
        )}
        {cabin.trainees.map(t => {
          const isBeingDragged = drag?.traineeId === t._id && !drag?.stagedEntryId;
          return (
            <div
              key={t._id}
              data-cabin-id={cabin._id}
              onPointerDown={(e) => onPointerDownTrainee(e, t)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg group select-none",
                isBeingDragged
                  ? "opacity-30 bg-blue-50 border border-dashed border-blue-300"
                  : "hover:bg-gray-50 cursor-grab active:cursor-grabbing",
              )}
            >
              <GripVertical size={12} className="text-gray-300 shrink-0" />
              <RoleBadge role={t.role} />
              <span className="text-[11px] text-gray-400 font-mono shrink-0 w-8">{t.rank}</span>
              <span className="flex-1 text-xs text-gray-700 truncate min-w-0" data-cabin-id={cabin._id}>{t.name}</span>
              <button type="button"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => onRemoveTrainee(t._id, cabin._id)}
                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 shrink-0 transition-colors">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MSTConfigureDetailList({
  initialBatches, onClose, onSave,
}: {
  initialBatches: RawCabin[][];
  onClose: () => void;
  onSave:  (cabins: EditableCabin[]) => void;
}) {
  const [cabins,         setCabins]         = useState<EditableCabin[]>(() => initEditable(initialBatches));
  const [stagedTrainees, setStagedTrainees] = useState<StagedEntry[]>([]);
  const [activeBatch,    setActiveBatch]    = useState(0);
  const [hasChanges,     setHasChanges]     = useState(false);
  const [drag,           setDrag]           = useState<PointerDrag | null>(null);

  const dragRef   = useRef<PointerDrag | null>(null);
  const cabinsRef = useRef(cabins);
  const stagedRef = useRef(stagedTrainees);
  const batchRef  = useRef(activeBatch);
  useEffect(() => { cabinsRef.current = cabins;         }, [cabins]);
  useEffect(() => { stagedRef.current = stagedTrainees; }, [stagedTrainees]);
  useEffect(() => { batchRef.current  = activeBatch;    }, [activeBatch]);

  const batchCount      = initialBatches.length;
  const totalTrainees   = cabins.reduce((s, c) => s + c.trainees.length, 0) + stagedTrainees.length;
  const batchCabins     = cabins.filter(c => c.batchIdx === activeBatch);
  const pendingForBatch = stagedTrainees.filter(s => s.targetBatchIdx === activeBatch);

  // ── Pointer drag handlers ─────────────────────────────────────────────────

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = { ...dragRef.current, cursorX: e.clientX, cursorY: e.clientY };
    setDrag({ ...dragRef.current });
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;

    let el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    let targetCabinId: string | null = null;
    while (el) {
      if (el.dataset?.cabinId) { targetCabinId = el.dataset.cabinId; break; }
      el = el.parentElement;
    }

    if (d.stagedEntryId) {
      // Staged trainee dropped onto a cabin → assign
      if (targetCabinId) {
        const staged = stagedRef.current.find(s => s._id === d.stagedEntryId);
        if (staged) {
          setCabins(prev => {
            const next = prev.map(c => ({ ...c, trainees: [...c.trainees] }));
            const tgt  = next.find(c => c._id === targetCabinId);
            if (!tgt) return prev;
            tgt.trainees.push(staged.trainee);
            return next;
          });
          setStagedTrainees(prev => prev.filter(s => s._id !== d.stagedEntryId));
          setHasChanges(true);
        }
      }
      // If dropped on nothing → stays in staging
    } else if (targetCabinId && targetCabinId !== d.sourceCabinId) {
      // Same-batch cabin-to-cabin drag
      setCabins(prev => {
        const target = prev.find(c => c._id === targetCabinId);
        if (!target) return prev;
        const next     = prev.map(c => ({ ...c, trainees: [...c.trainees] }));
        const srcCabin = next.find(c => c._id === d.sourceCabinId)!;
        const tgtCabin = next.find(c => c._id === targetCabinId)!;
        const srcIdx   = srcCabin.trainees.findIndex(t => t._id === d.traineeId);
        if (srcIdx === -1) return prev;
        const [trainee] = srcCabin.trainees.splice(srcIdx, 1);
        tgtCabin.trainees.push(trainee);
        return next;
      });
      setHasChanges(true);
    }

    dragRef.current = null;
    setDrag(null);
    document.body.style.cursor     = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (!drag) return;
    window.addEventListener("pointermove",   handlePointerMove);
    window.addEventListener("pointerup",     handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove",   handlePointerMove);
      window.removeEventListener("pointerup",     handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [!!drag, handlePointerMove, handlePointerUp]);

  const startDrag = (e: React.PointerEvent, t: EditableTrainee, cabinId: string) => {
    e.preventDefault();
    const d: PointerDrag = {
      traineeId: t._id, sourceCabinId: cabinId,
      role: t.role, name: t.name, rank: t.rank,
      cursorX: e.clientX, cursorY: e.clientY,
    };
    dragRef.current = d;
    setDrag(d);
    document.body.style.cursor     = "grabbing";
    document.body.style.userSelect = "none";
  };

  const startDragFromStaged = (e: React.PointerEvent, staged: StagedEntry) => {
    e.preventDefault();
    const d: PointerDrag = {
      traineeId:     staged.trainee._id,
      sourceCabinId: "__staged__",
      stagedEntryId: staged._id,
      role:  staged.trainee.role,
      name:  staged.trainee.name,
      rank:  staged.trainee.rank,
      cursorX: e.clientX,
      cursorY: e.clientY,
    };
    dragRef.current = d;
    setDrag(d);
    document.body.style.cursor     = "grabbing";
    document.body.style.userSelect = "none";
  };

  // ── Cross-batch: move trainee to staging tray ─────────────────────────────

  const stageTrainee = (d: PointerDrag, targetBatchIdx: number) => {
    const srcCabin   = cabinsRef.current.find(c => c._id === d.sourceCabinId);
    if (!srcCabin) return;
    const traineeObj = srcCabin.trainees.find(t => t._id === d.traineeId);
    if (!traineeObj) return;

    setCabins(prev => {
      const next = prev.map(c => ({ ...c, trainees: [...c.trainees] }));
      const src  = next.find(c => c._id === d.sourceCabinId)!;
      const idx  = src.trainees.findIndex(t => t._id === d.traineeId);
      if (idx === -1) return prev;
      src.trainees.splice(idx, 1);
      return next;
    });

    setStagedTrainees(prev => [...prev, {
      _id:            uid(),
      trainee:        traineeObj,
      sourceCabinId:  d.sourceCabinId,
      sourceBatchIdx: batchRef.current,
      targetBatchIdx,
    }]);

    setHasChanges(true);
  };

  // ── Mutators ──────────────────────────────────────────────────────────────

  const mutate = (fn: (p: EditableCabin[]) => EditableCabin[]) => {
    setCabins(fn); setHasChanges(true);
  };

  const removeTrainee = (traineeId: string, cabinId: string) =>
    mutate(prev => prev.map(c =>
      c._id !== cabinId ? c : { ...c, trainees: c.trainees.filter(t => t._id !== traineeId) }
    ));

  const removeCabin = (cabinId: string) =>
    mutate(prev => prev.filter(c => c._id !== cabinId));

  const returnToSource = (staged: StagedEntry) => {
    setCabins(prev => {
      const next = prev.map(c => ({ ...c, trainees: [...c.trainees] }));
      const src  = next.find(c => c._id === staged.sourceCabinId);
      if (!src) return prev;
      src.trainees.push(staged.trainee);
      return next;
    });
    setStagedTrainees(prev => prev.filter(s => s._id !== staged._id));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Auto-return any unassigned staged trainees to their source cabins
    let finalCabins = cabins;
    if (stagedTrainees.length > 0) {
      finalCabins = cabins.map(c => ({ ...c, trainees: [...c.trainees] }));
      for (const s of stagedTrainees) {
        const src = finalCabins.find(c => c._id === s.sourceCabinId);
        if (src) src.trainees.push(s.trainee);
      }
    }
    onSave(finalCabins);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const totalPending = stagedTrainees.length;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1200] flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div>
            <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Pencil size={13} className="text-brand-primary" />
              Configure Detail List
            </p>
            <p className="text-xs text-gray-400">
              {cabins.length} Details &bull; {totalTrainees} Trainees
              {totalPending > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  · {totalPending} pending transfer{totalPending > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <Button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
            <Check size={14} /> Save Changes
          </Button>
        </div>
      </div>

      {/* Drag banner */}
      {drag && (
        <div className={cn(
          "flex-shrink-0 text-white text-xs font-medium py-2 text-center",
          drag.stagedEntryId ? "bg-amber-500" : "bg-blue-600",
        )}>
          {drag.stagedEntryId
            ? <>Assigning <span className="font-bold">{drag.name}</span> ({drag.role}) — drop onto a cabin below</>
            : <>Moving <span className="font-bold">{drag.name}</span> ({drag.role}) — drop onto any cabin to reassign</>
          }
        </div>
      )}

      {/* Batch tabs */}
      {batchCount > 1 && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 flex items-center gap-0">
          {Array.from({ length: batchCount }, (_, i) => {
            const cabinTraineeCount = cabins.filter(c => c.batchIdx === i).reduce((s, c) => s + c.trainees.length, 0);
            const pendingCount      = stagedTrainees.filter(s => s.targetBatchIdx === i).length;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveBatch(i)}
                className={cn(
                  "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5",
                  activeBatch === i
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                Batch {i + 1}
                <span className={cn(
                  "text-[11px] font-bold px-1.5 py-0.5 rounded-full",
                  activeBatch === i ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500",
                )}>
                  {cabinTraineeCount}
                </span>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Cross-batch drop zones — only shown for cabin drags (not staged drags) */}
          {drag && !drag.stagedEntryId && (
            <div className="ml-auto flex items-center gap-2 pr-1">
              <span className="text-xs text-gray-400 mr-1">Move to:</span>
              {Array.from({ length: batchCount }, (_, i) => i !== activeBatch && (
                <div
                  key={i}
                  data-batch-drop={i}
                  onPointerUp={() => {
                    const d = dragRef.current;
                    if (!d) return;
                    stageTrainee(d, i);
                    setActiveBatch(i);
                    dragRef.current = null;
                    setDrag(null);
                    document.body.style.cursor     = "";
                    document.body.style.userSelect = "";
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-dashed border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-copy select-none"
                >
                  Batch {i + 1}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">

        {/* Staging / incoming tray */}
        <StagingPanel
          entries={pendingForBatch}
          drag={drag}
          onPointerDownEntry={startDragFromStaged}
          onReturn={returnToSource}
        />

        {batchCabins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-semibold text-gray-500">No details in this batch</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {batchCabins.map(c => (
              <EditableCabinCard
                key={c._id}
                cabin={c}
                drag={drag}
                onPointerDownTrainee={(e, t) => startDrag(e, t, c._id)}
                onRemoveTrainee={removeTrainee}
                onRemoveCabin={removeCabin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag ghost */}
      {drag && (
        <div
          style={{ position: "fixed", left: drag.cursorX + 14, top: drag.cursorY + 8, pointerEvents: "none", zIndex: 9999 }}
          className={cn(
            "border-2 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2",
            drag.stagedEntryId ? "bg-amber-50 border-amber-400" : "bg-white border-blue-400",
          )}
        >
          <GripVertical size={12} className={drag.stagedEntryId ? "text-amber-300" : "text-blue-300"} />
          <RoleBadge role={drag.role} sm />
          <span className="text-[11px] text-gray-400 font-mono">{drag.rank}</span>
          <span className="text-xs font-semibold text-gray-800">{drag.name}</span>
        </div>
      )}
    </div>
  );
}
