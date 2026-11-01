// Booking 2.0 Onboarding — Step 3: Confirm Detail List, per the reference
// screenshots. Splits each station's Present trainees into "Details" — firing
// rounds that cycle everyone through the station's active lanes when there
// are more trainees than lanes — and lets the user move a trainee to a
// different Base Station/Detail/Lane via "Edit Detail List".
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { TableCustom } from "@/components/table";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { activeLaneNumbers, stationLabel, OCCUPIED_LANES, type OnbStationData } from "../laneConfigTypes";
import type { OnboardingTrainee } from "../types";
import { MoveTraineeModal, type DestinationLaneRow } from "../modals/MoveTraineeModal";
import type { ReviewStationRow } from "../modals/ReviewBookingModal";
import type { SeedDetail, SeedStation } from "@/pages-tsx/booking-2/ongoing-session/session";

export interface DetailListSeed {
  stations: SeedStation[];
  details: SeedDetail[];
}

interface Position {
  type: "flat" | "cshaped";
  stationIndex: number;
  detail: number;
  lane: number;
}

function fallbackStations(count: number): OnbStationData[] {
  return Array.from({ length: Math.max(1, count) }, () => ({
    lanes: Array.from({ length: 15 }, (_, i) => ({ role: "", weapon: [], active: ![4, 11, 15].includes(i + 1) })),
  }));
}

export interface DetailListStepHandle {
  requestConfirm: () => void;
}

interface DetailListStepProps {
  flatRoll: OnboardingTrainee[];
  cshapedRoll: OnboardingTrainee[];
  laneConfig: { flat: OnbStationData[]; cshaped: OnbStationData[] } | null;
  hasCShaped: boolean;
  bookingId: string;
  bookingName: string;
  courseware: string;
  onConfirm: (stationRows: ReviewStationRow[], seed: DetailListSeed) => void;
}

export const DetailListStep = forwardRef<DetailListStepHandle, DetailListStepProps>(function DetailListStep(
  { flatRoll, cshapedRoll, laneConfig, hasCShaped, bookingId, bookingName, courseware, onConfirm },
  ref
) {
  const stationsByType = useMemo(() => ({
    flat: laneConfig?.flat ?? fallbackStations(1),
    cshaped: laneConfig?.cshaped ?? (hasCShaped ? fallbackStations(1) : []),
  }), [laneConfig, hasCShaped]);

  const rollByType = { flat: flatRoll, cshaped: cshapedRoll };
  const allTrainees = useMemo(() => [...flatRoll, ...cshapedRoll], [flatRoll, cshapedRoll]);
  const traineeById = useMemo(() => new Map(allTrainees.map((t) => [t.id, t])), [allTrainees]);

  const initial = useMemo(() => {
    const positions: Record<string, Position> = {};
    const detailsCount: Record<string, number> = {};
    (["flat", "cshaped"] as const).forEach((type) => {
      stationsByType[type].forEach((st, stationIndex) => {
        const label = stationLabel(stationIndex);
        const lanes = activeLaneNumbers(st);
        const laneCount = lanes.length || 1;
        const present = rollByType[type].filter((t) => t.attendance === "Present" && t.baseStation === label);
        present.forEach((t, idx) => {
          const detail = Math.floor(idx / laneCount) + 1;
          const lane = lanes[idx % laneCount] ?? idx + 1;
          positions[t.id] = { type, stationIndex, detail, lane };
        });
        detailsCount[`${type}|${stationIndex}`] = laneCount > 0 ? Math.max(1, Math.ceil(present.length / laneCount)) : 0;
      });
    });
    return { positions, detailsCount };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [positions, setPositions] = useState<Record<string, Position>>(initial.positions);
  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");
  // Figma 5361:7745 — every Detail card starts closed ("View Details ⌄");
  // 5363:55941 shows the opened state ("Hide Details ⌃" + roster table).
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [moveTarget, setMoveTarget] = useState<OnboardingTrainee | null>(null);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [dirtyDetails, setDirtyDetails] = useState<Set<string>>(new Set());

  const stations = stationsByType[stationType];

  const laneNumbersFor = (type: "flat" | "cshaped", stationIndex: number) => activeLaneNumbers(stationsByType[type][stationIndex]);

  const occupantAt = (type: "flat" | "cshaped", stationIndex: number, detail: number, lane: number): OnboardingTrainee | undefined => {
    const id = Object.entries(positions).find(([, p]) => p.type === type && p.stationIndex === stationIndex && p.detail === detail && p.lane === lane)?.[0];
    return id ? traineeById.get(id) : undefined;
  };

  const traineesInDetail = (type: "flat" | "cshaped", stationIndex: number, detail: number): { trainee: OnboardingTrainee; lane: number }[] => {
    return Object.entries(positions)
      .filter(([, p]) => p.type === type && p.stationIndex === stationIndex && p.detail === detail)
      .map(([id, p]) => ({ trainee: traineeById.get(id)!, lane: p.lane }))
      .filter((r) => r.trainee)
      .sort((a, b) => a.lane - b.lane);
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const openMove = (trainee: OnboardingTrainee) => setMoveTarget(trainee);

  const applyMove = (station: string, detail: number, lane: number) => {
    if (!moveTarget) return;
    const pos = positions[moveTarget.id];
    if (!pos) return;
    const targetIndex = Array.from({ length: stationsByType[pos.type].length }, (_, i) => i).find((i) => stationLabel(i) === station);
    if (targetIndex === undefined) return;

    // "New" if nobody occupied that exact slot at the initial snapshot; "Updated" otherwise.
    const slotWasFilledInitially = Object.entries(initial.positions).some(
      ([, p]) => p.type === pos.type && p.stationIndex === targetIndex && p.detail === detail && p.lane === lane
    );

    setPositions((prev) => ({ ...prev, [moveTarget.id]: { type: pos.type, stationIndex: targetIndex, detail, lane } }));
    setDirtyDetails((prev) => new Set(prev).add(`${pos.type}|${pos.stationIndex}|${pos.detail}`).add(`${pos.type}|${targetIndex}|${detail}`));
    if (slotWasFilledInitially) {
      setUpdatedIds((prev) => new Set(prev).add(moveTarget.id));
    } else {
      setNewIds((prev) => new Set(prev).add(moveTarget.id));
    }
    setMoveTarget(null);
  };

  // Drag-and-drop swap — Figma's `Icon / grip-vertical` on each occupied lane
  // row in the full-screen Edit Detail List view (5366:141010). Dropping one
  // occupied lane onto another swaps their trainees, same effect as Move
  // Trainee, just via direct manipulation instead of the modal.
  const dragSource = useRef<Position | null>(null);
  const findIdAt = (pos: Position) =>
    Object.entries(positions).find(
      ([, p]) => p.type === pos.type && p.stationIndex === pos.stationIndex && p.detail === pos.detail && p.lane === pos.lane
    )?.[0];
  const handleLaneDragStart = (pos: Position) => { dragSource.current = pos; };
  const handleLaneDrop = (targetPos: Position) => {
    const src = dragSource.current;
    dragSource.current = null;
    if (!src) return;
    const srcId = findIdAt(src);
    const targetId = findIdAt(targetPos);
    if (!srcId || !targetId || srcId === targetId) return;
    setPositions((prev) => ({ ...prev, [srcId]: targetPos, [targetId]: src }));
    setUpdatedIds((prev) => new Set(prev).add(srcId).add(targetId));
    setDirtyDetails((prev) => new Set(prev)
      .add(`${src.type}|${src.stationIndex}|${src.detail}`)
      .add(`${targetPos.type}|${targetPos.stationIndex}|${targetPos.detail}`));
  };

  // Review Booking's Session Details table (Figma `5348:23581`) numbers
  // C-Shaped stations continuing on from Flat Screen's count (Flat 01-03,
  // then C-Shaped 04-05) rather than each type restarting at 01 — display
  // only, doesn't touch `stationLabel`'s per-type indexing used for actual
  // trainee/lane matching elsewhere in this step.
  const buildStationRows = (): ReviewStationRow[] => {
    const rows: ReviewStationRow[] = [];
    (["flat", "cshaped"] as const).forEach((type) => {
      stationsByType[type].forEach((_, stationIndex) => {
        const labelIndex = type === "flat" ? stationIndex : stationsByType.flat.length + stationIndex;
        const totalTrainees = Object.values(positions).filter((p) => p.type === type && p.stationIndex === stationIndex).length;
        rows.push({
          label: stationLabel(labelIndex),
          type,
          totalDetails: initial.detailsCount[`${type}|${stationIndex}`] ?? 0,
          totalTrainees,
        });
      });
    });
    return rows;
  };

  // What Begin Session hands to Ongoing Session: the details exactly as the
  // user left them here, labelled the same way Review Booking numbers them.
  const buildSeed = (): DetailListSeed => {
    const labelOf = (type: "flat" | "cshaped", stationIndex: number) =>
      stationLabel(type === "flat" ? stationIndex : stationsByType.flat.length + stationIndex);
    const stations: SeedStation[] = (["flat", "cshaped"] as const).flatMap((type) =>
      stationsByType[type].map((st, i) => ({ type, label: labelOf(type, i), laneCount: st.lanes.length, activeLanes: activeLaneNumbers(st), lanes: st.lanes.map((l) => ({ role: l.role, weapon: [...l.weapon], active: l.active })) })),
    );
    const groups = new Map<string, SeedDetail>();
    Object.entries(positions).forEach(([id, p]) => {
      const t = traineeById.get(id);
      if (!t) return;
      const key = `${p.type}|${p.stationIndex}|${p.detail}`;
      if (!groups.has(key)) groups.set(key, { type: p.type, station: labelOf(p.type, p.stationIndex), number: p.detail, assignments: [] });
      groups.get(key)!.assignments.push({ lane: p.lane, trainee: { id: t.id, rank: t.rank, name: t.name, svcId: t.svcId, weapon: t.weapon } });
    });
    const details = [...groups.values()].sort((a, b) => a.station.localeCompare(b.station) || a.number - b.number);
    details.forEach((d) => d.assignments.sort((a, b) => a.lane - b.lane));
    return { stations, details };
  };

  const handleRequestConfirm = () => onConfirm(buildStationRows(), buildSeed());

  useImperativeHandle(ref, () => ({ requestConfirm: handleRequestConfirm }));

  const hasCShapedTab = stationsByType.cshaped.length > 0;

  const moveModal = moveTarget && (() => {
    const pos = positions[moveTarget.id];
    if (!pos) return null;
    const stationOptions = stations.map((_, i) => stationLabel(i));
    return (
      <MoveTraineeModal
        trainee={moveTarget}
        currentStation={stationLabel(pos.stationIndex)}
        currentDetail={pos.detail}
        currentLane={pos.lane}
        stationOptions={stationOptions}
        detailOptionsFor={(station) => {
          const idx = stationOptions.indexOf(station);
          const count = initial.detailsCount[`${pos.type}|${idx}`] ?? 1;
          return Array.from({ length: count }, (_, i) => i + 1);
        }}
        destinationRowsFor={(station, detail): DestinationLaneRow[] => {
          const idx = stationOptions.indexOf(station);
          return laneNumbersFor(pos.type, idx).map((lane) => {
            const occ = occupantAt(pos.type, idx, detail, lane);
            return { lane, occupant: occ ? { name: occ.name, svcId: occ.svcId } : undefined };
          });
        }}
        onClose={() => setMoveTarget(null)}
        onConfirm={applyMove}
      />
    );
  })();

  // Figma `Edit Detail List` (5366:141010): a separate full-screen view, not
  // an inline toggle on this same page — its own Header Nav (X close, title +
  // booking subtitle, Confirm) and one card per (station, detail), each
  // listing EVERY lane (including inactive ones as "Off"), not just occupied
  // ones. Per user direction, drag-and-drop (Icon / grip-vertical) is a real,
  // functional swap here, not just a visual — dropping one occupied lane row
  // onto another swaps their trainees; Icon / arrow-right-left still opens
  // the existing Move Trainee modal for a move to any station/detail/lane.
  if (editMode) {
    return (
      <div className="fixed inset-0 z-[1500] bg-white flex flex-col">
        {/* Figma `Edit Detail List` (5366:141010): X left, title + booking info centred in the bar, Confirm right. */}
        <div className="relative flex items-center justify-between gap-3 px-6 h-[60px] border-b border-figma-subtle flex-shrink-0">
          <button type="button" onClick={() => setEditMode(false)} className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full text-figma-body hover:bg-figma-soft flex-shrink-0 z-10">
            <Icon name="x" size={18} />
          </button>
          <div className="absolute inset-x-24 top-0 h-full flex flex-col items-center justify-center text-center min-w-0 pointer-events-none">
            <p className="text-base font-bold text-figma-default leading-tight">Edit Detail List</p>
            <p className="text-xs text-figma-body truncate max-w-full">{bookingId} · {bookingName} · {courseware}</p>
          </div>
          <button type="button" onClick={() => setEditMode(false)} className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg z-10">
            Confirm
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-figma-default">Edit Detail List</h2>
              <p className="text-sm text-figma-body mt-0.5">Update the detail list</p>
            </div>

            {/* Dev feedback #14: Flat Screen / C-Shaped tabs always drawn (Figma has no count badge). */}
            <div className="flex items-center gap-2">
              {(["flat", "cshaped"] as const).map((t) => {
                const disabled = t === "cshaped" && !hasCShapedTab;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => setStationType(t)}
                    className={cn(
                      "h-9 px-3 text-sm font-medium rounded-lg border transition-colors",
                      stationType === t ? "border-figma-primary text-figma-primary bg-figma-primarysoft" : "border-figma-subtle text-figma-body bg-figma-muted hover:bg-gray-50",
                      disabled && "cursor-not-allowed text-figma-disabled hover:bg-figma-muted"
                    )}
                  >
                    {t === "flat" ? "Flat Screen" : "C-Shaped"}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stations.flatMap((st, stationIndex) => {
                const label = stationLabel(stationIndex);
                const detailsCount = initial.detailsCount[`${stationType}|${stationIndex}`] ?? 0;
                const totalLanes = st.lanes.length;
                return Array.from({ length: detailsCount }, (_, i) => i + 1).map((detail) => {
                  const key = `${stationType}|${stationIndex}|${detail}`;
                  const isDirty = dirtyDetails.has(key);
                  return (
                    <div key={key} className="min-w-0 border border-figma-subtle rounded-lg overflow-hidden bg-white flex flex-col">
                      <div className="px-4 py-3 border-b border-figma-subtle">
                        <p className="text-sm font-bold text-figma-default">{label}</p>
                        <p className="text-xs text-figma-body flex items-center gap-1.5 mt-0.5">
                          Detail {detail}
                          {isDirty && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-figma-warningbg text-figma-warning border border-figma-warning">Updated</span>}
                        </p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-figma-dangersoft/70 text-figma-primary text-xs">
                            <th className="text-left font-semibold px-3 py-2 w-20 whitespace-nowrap">Lane</th>
                            <th className="text-left font-semibold px-3 py-2">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: totalLanes }, (_, i) => i + 1).map((lane) => {
                            const laneActive = st.lanes[lane - 1]?.active;
                            if (!laneActive) {
                              // Lane Config: a lane the user switched off (red toggle) is "Closed for
                              // maintenance"; a lane that was never configured (grey toggle) is "Off".
                              const closed = !(stationType === "flat" && OCCUPIED_LANES.includes(lane));
                              return (
                                <tr key={lane} className={cn("border-t border-figma-subtle", closed ? "bg-figma-dangerbg" : "bg-figma-muted")}>
                                  <td className="px-3 py-2 text-figma-body whitespace-nowrap">Lane {lane}</td>
                                  <td className={cn("px-3 py-2", closed ? "text-figma-danger font-medium" : "text-figma-disabled")}>{closed ? "Closed for maintenance" : "Off"}</td>
                                </tr>
                              );
                            }
                            const occ = occupantAt(stationType, stationIndex, detail, lane);
                            if (!occ) {
                              return (
                                <tr key={lane} className="border-t border-figma-subtle bg-figma-successbg">
                                  <td className="px-3 py-2 text-figma-body whitespace-nowrap">Lane {lane}</td>
                                  <td className="px-3 py-2 text-figma-success font-medium">Available</td>
                                </tr>
                              );
                            }
                            const pos: Position = { type: stationType, stationIndex, detail, lane };
                            return (
                              <tr
                                key={lane}
                                draggable
                                onDragStart={() => handleLaneDragStart(pos)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleLaneDrop(pos)}
                                className="border-t border-figma-subtle cursor-grab active:cursor-grabbing hover:bg-figma-soft"
                              >
                                <td className="px-3 py-2 text-figma-body align-top whitespace-nowrap">Lane {lane}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Icon name="grip-vertical" size={14} className="text-figma-disabled flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-figma-default truncate flex items-center gap-1.5">
                                        {occ.name}
                                        {newIds.has(occ.id) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-figma-warningbg text-figma-warning border border-figma-warning">New</span>}
                                        {updatedIds.has(occ.id) && !newIds.has(occ.id) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-figma-warningbg text-figma-warning border border-figma-warning">Updated</span>}
                                      </p>
                                      <p className="text-xs font-mono text-figma-body">{occ.svcId}</p>
                                    </div>
                                    <button type="button" onClick={() => openMove(occ)} className="p-1.5 rounded-md text-figma-disabled hover:text-figma-primary hover:bg-figma-dangersoft flex-shrink-0" title="Move Trainee">
                                      <Icon name="arrow-right-left" size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>

        {moveModal}
      </div>
    );
  }

  // Figma `Detail List - FS` (5361:7745) / `- CS` (5361:7766) / `- Expand
  // Roster` (5363:55941) / "If Has Any Changes" (5440:169859): page header
  // with only "Edit Detail List" (the step's Confirm lives in the wizard bar),
  // Box Tab Flat Screen / C-Shaped, then one Section card per station —
  // "WPT-01" + detail count — whose Detail cards sit three per row (443px
  // each at 1440, 12px gap; a short row keeps the empty slots). Each card is
  // closed by default; "View Details ⌄" opens the No./Name/Service ID/Lane table
  // and the link becomes "Hide Details ⌃". Cards align to the top, so an
  // opened card doesn't stretch its closed neighbours.
  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex flex-col gap-1">
            <h2 className="text-xl leading-7 font-semibold text-figma-default">Confirm Detail List</h2>
            <p className="text-xs leading-4 text-figma-body">Please confirm the detail list of the training</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 h-10 px-4 text-sm font-semibold text-figma-default bg-white border border-figma-subtle rounded-lg hover:bg-figma-soft"
            >
              <Icon name="pencil" size={18} /> Edit Detail List
            </button>
            {/* Dev feedback #13: Figma has ONE Confirm Detail List (wizard header). This second one is hidden. */}
            {HIDDEN_FEATURES.detailListInlineConfirm && (
              <button type="button" onClick={handleRequestConfirm} className="h-10 px-4 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
                Confirm Detail List
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Dev feedback #13: tabs always drawn; C-Shaped is disabled when the booking has none. */}
          <div className="flex items-center gap-3">
            {(["flat", "cshaped"] as const).map((t) => {
              const disabled = t === "cshaped" && !hasCShapedTab;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => setStationType(t)}
                  className={cn(
                    "h-9 px-3 text-sm font-medium rounded-lg border transition-colors",
                    stationType === t ? "border-figma-primary text-figma-primary bg-figma-primarysoft" : "border-figma-subtle text-figma-body bg-figma-muted hover:bg-figma-soft",
                    disabled && "cursor-not-allowed text-figma-disabled hover:bg-figma-muted"
                  )}
                >
                  {t === "flat" ? "Flat Screen" : "C-Shaped"}
                </button>
              );
            })}
          </div>

          {stations.map((_, stationIndex) => {
            const label = stationLabel(stationIndex);
            const detailsCount = initial.detailsCount[`${stationType}|${stationIndex}`] ?? 0;
            if (detailsCount === 0) return null;
            const details = Array.from({ length: detailsCount }, (_, i) => i + 1);
            const rowsOfThree = Array.from({ length: Math.ceil(details.length / 3) }, (_, r) => details.slice(r * 3, r * 3 + 3));
            return (
              <div key={stationIndex} className="bg-white border border-figma-subtle rounded-xl">
                <div className="p-5 flex items-center gap-2">
                  <h3 className="text-base leading-6 font-semibold text-figma-default">{label}</h3>
                  <span className="text-base leading-6 font-semibold text-figma-body">{detailsCount}</span>
                </div>
                <div className="px-5 pb-5 flex flex-col gap-5">
                  {rowsOfThree.map((row, r) => (
                    <div key={r} className="grid grid-cols-3 gap-3 items-start">
                      {row.map((detail) => {
                        const rows = traineesInDetail(stationType, stationIndex, detail);
                        const key = `${stationType}|${stationIndex}|${detail}`;
                        const isOpen = expanded.has(key);
                        const isDirty = dirtyDetails.has(key);
                        return (
                          <div key={detail} className="min-w-0 bg-white border border-figma-subtle rounded-lg overflow-hidden">
                            <div className="p-4 flex items-center gap-4">
                              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm leading-5 font-semibold text-figma-default">Detail {detail}</p>
                                  {isDirty && <StatusBadge tone="warning" className="h-5 py-0">Updated</StatusBadge>}
                                </div>
                                <p className="text-xs leading-4 text-figma-body">{rows.length} trainees</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpanded(key)}
                                aria-expanded={isOpen}
                                className="flex-shrink-0 flex items-center gap-1.5 text-xs leading-4 font-medium text-figma-primary hover:underline"
                              >
                                {isOpen ? "Hide Details" : "View Details"}
                                <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} />
                              </button>
                            </div>
                            {isOpen && (
                              <TableCustom<DetailRosterRow>
                                columns={DETAIL_ROSTER_COLUMNS}
                                data={rows.map(({ trainee, lane }, i) => ({ no: i + 1, trainee, lane }))}
                                autoScrollTable={false}
                                actionSticky={false}
                                tableFixed
                                classThead="static"
                                classTheadTh="px-4 py-2.5 text-xs leading-4"
                                classTBodyTd="h-auto px-4 py-2.5 text-xs leading-4"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {moveModal}
    </div>
  );
});

interface DetailRosterRow {
  no: number;
  trainee: OnboardingTrainee;
  lane: number;
}

// Figma `Table - Onboarding - Detail List - Read`: No. 48 · Name fill · Service ID 96 · Lane 80,
// header 12 Semi Bold text/primary on background/danger/invert/soft, body 12/16 —
// No. in text/body, Name Semi Bold, Service ID/Lane Regular text/default.
const DETAIL_ROSTER_COLUMNS: ColumnDef<DetailRosterRow, unknown>[] = [
  { id: "no", width: 48, minWidth: 48, header: () => "No.", cell: ({ row }) => <span className="text-figma-body">{row.original.no}</span> } as ColumnDef<DetailRosterRow, unknown>,
  { id: "name", minWidth: 0, header: () => "Name", cell: ({ row }) => <span className="block truncate font-semibold text-figma-default">{row.original.trainee.name}</span> } as ColumnDef<DetailRosterRow, unknown>,
  { id: "svcId", width: 96, minWidth: 96, header: () => "Service ID", cell: ({ row }) => <span className="text-figma-default">{row.original.trainee.svcId}</span> } as ColumnDef<DetailRosterRow, unknown>,
  { id: "lane", width: 80, minWidth: 80, header: () => "Lane", cell: ({ row }) => <span className="text-figma-default">Lane {row.original.lane}</span> } as ColumnDef<DetailRosterRow, unknown>,
];
