// Booking 2.0 — Step 3: Lane Configuration. New design per the screenshots:
// a per-courseware sidebar (Flat Screen / C-Shaped completion counts, green
// check once fully assigned), Flat Screen / C-Shaped tabs, side-by-side
// station cards with role-assigned/weapon-assigned progress, "Copy to" per
// station, and a "Bulk Assign" modal. Flat Screen keeps the existing fixed
// 15-lane layout (lanes 4/11/15 inactive); C-Shaped starts at 1 lane and
// grows via "+ Add Lane" up to 15 (Sec. 3.4.1, v0.24 — already real behavior
// in the current app, reused here as the same underlying rule).
import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS } from "@/pages-tsx/booking/create/constants";
import { LaneTable } from "./LaneTable";
import { CopyToModal } from "../modals/CopyToModal";
import { BulkAssignModal } from "../modals/BulkAssignModal";
import {
  CSHAPED_MAX,
  makeFlatStation, makeCShapedStation, stationProgress, isLaneActive,
  type CoursewareLaneData, type LaneRow, type StationData, type StationRef,
} from "../laneConfigTypes";

interface LaneConfigStepProps {
  trainingMode: string;
  bookingWeapons: string[];
  bookingRoles: string[];
  numBase: number;
  numCShaped: number;
  bookingCourseware: string;
  stationCountsByCourseware?: Record<string, { base: number; cshaped: number }>;
  onAllDataChange?: (data: Record<string, CoursewareLaneData>) => void;
  onAllCompleteChange?: (allComplete: boolean) => void;
  showErrors?: boolean;
}

export function LaneConfigStep({ trainingMode, bookingWeapons, bookingRoles, numBase, numCShaped, bookingCourseware, stationCountsByCourseware, onAllDataChange, onAllCompleteChange, showErrors = false }: LaneConfigStepProps) {
  const isCollective = trainingMode === "Collective";
  const weaponOptions = bookingWeapons.length > 0
    ? bookingWeapons
    : isCollective ? COLLECTIVE_WEAPONS : trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const roleOptions = bookingRoles.length > 0 ? bookingRoles : COLLECTIVE_TEAM_OPTIONS;

  const coursewareList = bookingCourseware ? bookingCourseware.split(",").map((c) => c.trim()).filter(Boolean) : [];

  const countsFor = (cw: string) => stationCountsByCourseware?.[cw] ?? { base: Math.max(1, numBase || 1), cshaped: numCShaped || 0 };

  const [data, setData] = useState<Record<string, CoursewareLaneData>>(() =>
    Object.fromEntries(coursewareList.map((cw) => {
      const c = countsFor(cw);
      return [cw, {
        flat: Array.from({ length: c.base }, () => makeFlatStation()),
        cshaped: Array.from({ length: c.cshaped }, () => makeCShapedStation()),
      }];
    }))
  );

  const [active, setActive] = useState(coursewareList[0] ?? "");
  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");
  const [copySource, setCopySource] = useState<StationRef | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  useEffect(() => {
    onAllDataChange?.(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const activeData = data[active] ?? { flat: [], cshaped: [] };

  const flatLabel = (i: number) => `Flat Screen #${i + 1}`;
  const cshapedLabel = (i: number) => `C-Shaped #${i + 1}`;

  const flatStationsFor = (cw: string): StationRef[] =>
    (data[cw]?.flat ?? []).map((_, i) => ({ courseware: cw, type: "flat" as const, index: i, label: flatLabel(i) }));
  const cshapedStationsFor = (cw: string): StationRef[] =>
    (data[cw]?.cshaped ?? []).map((_, i) => ({ courseware: cw, type: "cshaped" as const, index: i, label: cshapedLabel(i) }));
  const stationsFor = (cw: string): StationRef[] =>
    stationType === "flat" ? flatStationsFor(cw) : cshapedStationsFor(cw);

  const getStation = (ref: { courseware: string; type: "flat" | "cshaped"; index: number }): StationData | undefined =>
    data[ref.courseware]?.[ref.type]?.[ref.index];

  const updateStation = (courseware: string, type: "flat" | "cshaped", index: number, updater: (st: StationData) => StationData) => {
    setData((prev) => {
      const cwData = prev[courseware];
      if (!cwData) return prev;
      const arr = [...cwData[type]];
      arr[index] = updater(arr[index]);
      return { ...prev, [courseware]: { ...cwData, [type]: arr } };
    });
  };

  const updateLane = (courseware: string, type: "flat" | "cshaped", stationIdx: number, laneIdx: number, patch: Partial<LaneRow>) => {
    updateStation(courseware, type, stationIdx, (st) => ({
      lanes: st.lanes.map((l, i) => (i === laneIdx ? { ...l, ...patch } : l)),
    }));
  };

  const addLane = (courseware: string, stationIdx: number) => {
    updateStation(courseware, "cshaped", stationIdx, (st) =>
      st.lanes.length >= CSHAPED_MAX ? st : { lanes: [...st.lanes, { role: "", weapon: [] }] }
    );
  };

  const removeLane = (courseware: string, stationIdx: number, laneIdx: number) => {
    updateStation(courseware, "cshaped", stationIdx, (st) =>
      st.lanes.length <= 1 ? st : { lanes: st.lanes.filter((_, i) => i !== laneIdx) }
    );
  };

  // Per-courseware completion summary
  const coursewareSummary = useMemo(() => {
    return Object.fromEntries(coursewareList.map((cw) => {
      const cwData = data[cw] ?? { flat: [], cshaped: [] };
      const flatDone = cwData.flat.filter((s) => stationProgress(s, true, isCollective).complete).length;
      const cshapedDone = cwData.cshaped.filter((s) => stationProgress(s, false, isCollective).complete).length;
      const complete = flatDone === cwData.flat.length && cshapedDone === cwData.cshaped.length;
      return [cw, { flatDone, flatTotal: cwData.flat.length, cshapedDone, cshapedTotal: cwData.cshaped.length, complete }];
    }));
  }, [data, coursewareList, isCollective]);

  const incompleteCount = coursewareList.filter((cw) => !coursewareSummary[cw]?.complete).length;

  useEffect(() => {
    onAllCompleteChange?.(incompleteCount === 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incompleteCount]);

  const activeStations = stationType === "flat" ? activeData.flat : activeData.cshaped;
  const activeStationRefs = stationsFor(active);
  const hasCShapedTab = countsFor(active).cshaped > 0;

  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      {showErrors && incompleteCount > 0 && coursewareList.length > 1 && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-figma-dangersoft border border-red-100 text-sm text-figma-danger">
          <Icon name="circle-alert" size={16} className="flex-shrink-0" />
          <span>
            {incompleteCount} courseware{incompleteCount > 1 ? "s" : ""} aren't ready to submit.{" "}
            <button type="button" onClick={() => setActive(coursewareList.find((cw) => !coursewareSummary[cw]?.complete) ?? active)} className="font-semibold underline underline-offset-2">
              Review issue
            </button>
          </span>
        </div>
      )}

      <div className="flex gap-6 items-start">
        <div className="w-72 flex-shrink-0 bg-white border border-figma-subtle rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-figma-subtle">
            <h3 className="text-base font-bold text-figma-default">Courseware ({coursewareList.length})</h3>
          </div>
          {coursewareList.map((cw) => {
            const s = coursewareSummary[cw];
            const isActive = cw === active;
            return (
              <button
                key={cw}
                type="button"
                onClick={() => { setActive(cw); setStationType("flat"); }}
                className={cn(
                  "w-full text-left px-4 py-3 border-l-4 transition-colors flex items-start justify-between gap-2",
                  isActive ? "border-figma-primary bg-figma-primarysoft" : "border-transparent hover:bg-figma-soft"
                )}
              >
                <div className="min-w-0">
                  <p className={cn("text-sm truncate", isActive ? "font-bold text-figma-default" : "font-medium text-figma-default")}>{cw}</p>
                  <p className={cn("text-xs mt-0.5", s?.complete ? "text-green-600" : "text-figma-body")}>
                    <span className="font-semibold">{s?.flatDone}/{s?.flatTotal}</span> Flat Screens
                  </p>
                  {s?.cshapedTotal > 0 && (
                    <p className={cn("text-xs", s?.complete ? "text-green-600" : "text-figma-disabled")}>
                      <span className="font-semibold">{s?.cshapedDone}/{s?.cshapedTotal}</span> C-Shaped
                    </p>
                  )}
                </div>
                {s?.complete ? (
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="check" size={12} className="text-white" />
                  </span>
                ) : showErrors ? (
                  <Icon name="circle-alert" size={16} className="text-figma-danger flex-shrink-0 mt-0.5" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-figma-default">{active}</h2>
              <p className="text-xs text-figma-body mt-0.5">Configure this courseware's lanes</p>
            </div>
            <button
              type="button"
              onClick={() => setShowBulkAssign(true)}
              className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-strong rounded-lg hover:bg-figma-soft bg-white"
            >
              Bulk Assign
            </button>
          </div>

          {hasCShapedTab && (
            <div className="flex items-center gap-2 mb-5">
              {(["flat", "cshaped"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStationType(t)}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg border transition-colors",
                    stationType === t ? "border-figma-primary text-figma-primary bg-figma-primarysoft ring-1 ring-figma-primary" : "border-figma-subtle text-figma-caption bg-figma-muted hover:bg-figma-soft"
                  )}
                >
                  {t === "flat" ? "Flat Screen" : "C-Shaped"}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {activeStations.map((st, i) => {
              const isFlat = stationType === "flat";
              const prog = stationProgress(st, isFlat, isCollective);
              const ref = activeStationRefs[i];
              return (
                <div key={i} className={cn("bg-white border rounded-xl overflow-hidden", prog.complete ? "border-green-200" : "border-figma-subtle")}>
                  {prog.complete && <div className="h-1 bg-green-500" />}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-figma-subtle">
                    <div>
                      <h4 className="text-sm font-bold text-figma-default">{ref.label}</h4>
                      <p className="text-xs text-figma-body mt-0.5">
                        <span className="font-semibold text-figma-default">{prog.activeCount}/{isFlat ? 15 : st.lanes.length}</span> lanes active
                        {isCollective && (
                          <> · <span className={cn("font-semibold", prog.roleAssigned === prog.activeCount ? "text-green-600" : "text-figma-danger")}>{prog.roleAssigned}/{prog.activeCount} lanes role-assigned</span></>
                        )}
                        {" "}· <span className={cn("font-semibold", prog.weaponAssigned === prog.activeCount ? "text-green-600" : "text-figma-danger")}>{prog.weaponAssigned}/{prog.activeCount} lanes weapon-assigned</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={prog.weaponAssigned === 0 && prog.roleAssigned === 0}
                      title={prog.weaponAssigned === 0 && prog.roleAssigned === 0 ? "Configure at least one lane before copying" : undefined}
                      onClick={() => setCopySource(ref)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-lg border flex-shrink-0",
                        prog.weaponAssigned === 0 && prog.roleAssigned === 0
                          ? "border-figma-subtle text-figma-disabled cursor-not-allowed"
                          : "border-figma-strong text-figma-default hover:bg-figma-soft"
                      )}
                    >
                      Copy to
                    </button>
                  </div>

                  <LaneTable
                    station={st}
                    isFlat={isFlat}
                    isCollective={isCollective}
                    roleOptions={roleOptions}
                    weaponOptions={weaponOptions}
                    onLaneChange={(li, patch) => updateLane(active, stationType, i, li, patch)}
                    onRemoveLane={isFlat ? undefined : (li) => removeLane(active, i, li)}
                  />

                  {!isFlat && (
                    <div className="px-4 py-3 border-t border-figma-subtle">
                      <button
                        type="button"
                        disabled={st.lanes.length >= CSHAPED_MAX}
                        onClick={() => addLane(active, i)}
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-semibold",
                          st.lanes.length >= CSHAPED_MAX ? "text-figma-disabled cursor-not-allowed" : "text-figma-primary hover:text-figma-primaryhover"
                        )}
                      >
                        <Icon name="plus" size={16} /> Add Lane
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {copySource && (() => {
        const src = getStation(copySource);
        if (!src) return null;
        const isFlatSrc = copySource.type === "flat";
        return (
          <CopyToModal
            source={copySource}
            sourceProgress={stationProgress(src, isFlatSrc, isCollective)}
            stationType={copySource.type}
            coursewareList={coursewareList}
            stationsByCourseware={(cw) => (copySource.type === "flat" ? flatStationsFor(cw) : cshapedStationsFor(cw))}
            onClose={() => setCopySource(null)}
            onConfirm={(targets) => {
              targets.forEach((t) => {
                updateStation(t.courseware, t.type, t.index, () => ({
                  lanes: src.lanes.map((l) => ({ role: l.role, weapon: [...l.weapon], active: l.active })).slice(0, t.type === "flat" ? 15 : undefined),
                }));
              });
              setCopySource(null);
            }}
          />
        );
      })()}

      {showBulkAssign && (
        <BulkAssignModal
          isCollective={isCollective}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          coursewareList={coursewareList}
          flatStationsByCourseware={flatStationsFor}
          cshapedStationsByCourseware={cshapedStationsFor}
          activeLaneCountFor={(s) => {
            const st = getStation(s);
            return st ? stationProgress(st, s.type === "flat", isCollective).activeCount : 0;
          }}
          onClose={() => setShowBulkAssign(false)}
          onConfirm={(role, weapon, targets) => {
            // Partial assign: only touch the field(s) actually filled in the modal —
            // role-only or weapon-only bulk assigns leave the other field alone.
            targets.forEach((t) => {
              updateStation(t.courseware, t.type, t.index, (st) => ({
                lanes: st.lanes.map((l, li) => {
                  // Occupied lanes and lanes switched off via Status are left untouched.
                  if (!isLaneActive(st, t.type === "flat", li)) return l;
                  return {
                    ...l,
                    role: role ? role : l.role,
                    weapon: weapon ? [weapon] : l.weapon,
                  };
                }),
              }));
            });
            setShowBulkAssign(false);
          }}
        />
      )}
    </div>
  );
}
