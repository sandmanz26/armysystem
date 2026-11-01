import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BaseStationCard } from "./BaseStationCard";
import { MassAssignModal } from "../modals/MassAssignModal";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS, LANE_COUNT, OCCUPIED_LANES } from "../constants";
import type { StationType, LaneState } from "../types";

type StationEntry = { id: string; label: string; type: "base" | "cshaped"; idx: number };

export function LaneConfigStep({
  trainingMode, bookingWeapons, bookingRoles, numBase, numCShaped, bookingCourseware, stationCountsByCourseware,
}: {
  trainingMode: string;
  bookingWeapons: string[];
  bookingRoles: string[];
  numBase: number;
  numCShaped: number;
  bookingCourseware: string;
  stationCountsByCourseware?: Record<string, { base: number; cshaped: number }>;
}) {
  const [stationType, setStationType] = useState<StationType>("Flat Screen");
  const [showMassAssign, setShowMassAssign] = useState(false);
  const [laneVariant, setLaneVariant] = useState<"v1" | "v2">("v1");
  const [togglePos, setTogglePos] = useState({ x: 24, y: 24 });
  const [v2FocusIdx, setV2FocusIdx] = useState(-1);
  const dragging = useRef(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const isCollective = trainingMode === "Collective";

  // ── Multi-courseware tabs ─────────────────────────────────────────────────────
  const coursewareList = bookingCourseware
    ? bookingCourseware.split(", ").map((c) => c.trim()).filter(Boolean)
    : [];
  const isMultiCourseware = coursewareList.length > 1;
  const [activeCourseware, setActiveCourseware] = useState(() => coursewareList[0] ?? "");

  const weaponOptions = bookingWeapons.length > 0
    ? bookingWeapons
    : isCollective ? COLLECTIVE_WEAPONS : trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const teamOptions = bookingRoles.length > 0 ? bookingRoles : COLLECTIVE_TEAM_OPTIONS;

  // Global max from booking details
  const maxBaseCount = Math.min(5, Math.max(1, numBase || 1));
  const supportsCShape = trainingMode === "Collective" || trainingMode === "Judgemental" || trainingMode === "Marksmanship";
  const maxCShapedCount = supportsCShape ? Math.min(2, Math.max(0, numCShaped || 0)) : 0;

  // Per-courseware station counts — sourced from Step 1 (BookingDetailsStep)
  const activeCounts = (() => {
    if (stationCountsByCourseware) {
      const key = isMultiCourseware ? activeCourseware : Object.keys(stationCountsByCourseware)[0];
      const fromProp = key ? stationCountsByCourseware[key] : undefined;
      if (fromProp) return fromProp;
    }
    return { base: maxBaseCount, cshaped: maxCShapedCount };
  })();
  const baseCount = activeCounts.base;
  const cShapedCount = Math.min(activeCounts.cshaped, maxCShapedCount);

  const makeDefaultLanes = (): LaneState[] =>
    Array.from({ length: LANE_COUNT }, (_, i) => ({ on: !OCCUPIED_LANES.includes(i + 1), weaponType: [], team: "" }));
  const makeDefaultCShapedLanes = (): LaneState[][] =>
    Array.from({ length: 2 }, () => [{ on: true, weaponType: [], team: "" }]);

  type LanesEntry = { base: LaneState[][]; cshaped: LaneState[][] };
  const initLanesMap = (): Record<string, LanesEntry> => {
    const keys = isMultiCourseware ? coursewareList : ["default"];
    const map: Record<string, LanesEntry> = {};
    keys.forEach((k) => { map[k] = { base: Array.from({ length: 5 }, () => makeDefaultLanes()), cshaped: makeDefaultCShapedLanes() }; });
    return map;
  };
  const [lanesMap, setLanesMap] = useState<Record<string, LanesEntry>>(initLanesMap);

  const laneKey = isMultiCourseware ? activeCourseware : "default";
  const baseLanes = lanesMap[laneKey]?.base ?? Array.from({ length: 5 }, () => makeDefaultLanes());
  const cShapedLanes = lanesMap[laneKey]?.cshaped ?? makeDefaultCShapedLanes();

  const activeCount = (lanes: LaneState[]) =>
    isCollective ? lanes.filter((l) => l.team !== "").length : lanes.filter((l, i) => !OCCUPIED_LANES.includes(i + 1) && l.on).length;
  const totalCount = isCollective ? LANE_COUNT : LANE_COUNT - OCCUPIED_LANES.length;

  const makeSetLanes = (type: "base" | "cshaped", i: number): React.Dispatch<React.SetStateAction<LaneState[]>> =>
    ((fn: any) => {
      setLanesMap((prev) => {
        const keyData = prev[laneKey] ?? { base: Array.from({ length: 5 }, () => makeDefaultLanes()), cshaped: makeDefaultCShapedLanes() };
        const arr = [...(type === "base" ? keyData.base : keyData.cshaped)];
        arr[i] = typeof fn === "function" ? fn(arr[i]) : fn;
        return { ...prev, [laneKey]: { ...keyData, [type]: arr } };
      });
    }) as React.Dispatch<React.SetStateAction<LaneState[]>>;

  const allStations: StationEntry[] = [
    ...Array.from({ length: baseCount }, (_, i) => ({ id: `base-${i}`, label: `Flat Screen ${String(i + 1).padStart(2, "0")}`, type: "base" as const, idx: i })),
    ...(cShapedCount > 0
      ? Array.from({ length: cShapedCount }, (_, i) => ({ id: `cshaped-${i}`, label: `C-Shaped WPT ${4 + i}`, type: "cshaped" as const, idx: i }))
      : []),
  ];

  const isAllView = v2FocusIdx === -1;
  const safeFocusIdx = isAllView ? -1 : Math.min(v2FocusIdx, allStations.length - 1);
  const focusedStation = isAllView ? null : allStations[safeFocusIdx];

  const stationProgress = allStations.map((s) => {
    const lanes = s.type === "base" ? baseLanes[s.idx] : cShapedLanes[s.idx];
    const available = s.type === "base" ? LANE_COUNT - OCCUPIED_LANES.length : lanes.length;
    const configured = lanes.filter((l) => l.weaponType.length > 0).length;
    return { configured, available };
  });

  const showCShapedTab = cShapedCount > 0;
  const stationTabs: StationType[] = showCShapedTab ? ["Flat Screen", "C-Shaped Station"] : ["Flat Screen"];

  const onToggleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: togglePos.x, py: togglePos.y };
    const onMove = (me: MouseEvent) => {
      if (!dragging.current) return;
      setTogglePos({ x: Math.max(0, dragOrigin.current.px + me.clientX - dragOrigin.current.mx), y: Math.max(0, dragOrigin.current.py + me.clientY - dragOrigin.current.my) });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  const baseStationLabels = Array.from({ length: baseCount }, (_, i) => `Flat Screen ${String(i + 1).padStart(2, "0")}`);
  const cShapedStationLabels = Array.from({ length: cShapedCount }, (_, i) => `C-Shaped WPT ${4 + i}`);
  const cShapedLaneCounts = Array.from({ length: cShapedCount }, (_, i) => cShapedLanes[i]?.length ?? 1);

  const hasExistingAssignments = Object.values(lanesMap).some((entry) =>
    entry.base.some((ls) => ls.some((l) => l.weaponType.length > 0)) ||
    entry.cshaped.some((ls) => ls.some((l) => l.weaponType.length > 0))
  );

  const headerLeft = bookingCourseware && !isMultiCourseware ? (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">Courseware:</span>
      <span className="text-xs font-semibold text-brand-primary">{bookingCourseware}</span>
    </div>
  ) : null;

  const FloatingToggle = (
    <div
      className="fixed z-50 select-none"
      style={{ bottom: `${togglePos.y}px`, right: `${togglePos.x}px`, cursor: dragging.current ? "grabbing" : "grab" }}
      onMouseDown={onToggleMouseDown}
    >
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg px-1 py-1 gap-0.5">
        <span className="text-[10px] text-gray-400 font-semibold px-2 select-none">Layout</span>
        <button type="button" onMouseDown={(e) => e.stopPropagation()} onClick={() => setLaneVariant("v1")}
          className={cn("px-2.5 py-1 rounded-full text-xs font-semibold transition-colors", laneVariant === "v1" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-100")}>
          Classic
        </button>
        <button type="button" onMouseDown={(e) => e.stopPropagation()} onClick={() => setLaneVariant("v2")}
          className={cn("px-2.5 py-1 rounded-full text-xs font-semibold transition-colors", laneVariant === "v2" ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-gray-100")}>
          Quick ✦
        </button>
      </div>
    </div>
  );

  const cardProps = { isCollective, trainingMode, weaponOptions, teamOptions, activeCount, totalCount };

  // ── V1 Layout ────────────────────────────────────────────────────────────────
  if (laneVariant === "v1") return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {FloatingToggle}
      {/* Layer 1: courseware tabs + Bulk Assign */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isMultiCourseware ? (
            coursewareList.map((cw) => (
              <button key={cw} type="button" onClick={() => setActiveCourseware(cw)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                  activeCourseware === cw
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary")}>
                {cw}
              </button>
            ))
          ) : headerLeft}
        </div>
        <Button type="outline" onClick={() => setShowMassAssign(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium w-auto border border-brand-primary text-brand-primary hover:bg-red-50 flex-shrink-0">
          + Bulk Assign
        </Button>
      </div>

      {isMultiCourseware && (
        <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Each courseware requires its own lane configuration. Switch tabs to configure each one.
        </p>
      )}

      {/* Layer 2: station type tabs */}
      {showCShapedTab && (
        <div className="flex items-center gap-2 mb-5">
          {stationTabs.map((t) => (
            <button key={t} type="button" onClick={() => setStationType(t as StationType)}
              className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                stationType === t ? "border-brand-primary text-brand-primary bg-red-50" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {t}
            </button>
          ))}
        </div>
      )}
      {!showCShapedTab && <div className="mb-5" />}

      {stationType === "Flat Screen" && (
        <div className={cn("grid gap-5", baseCount === 1 ? "grid-cols-1 max-w-2xl" : "grid-cols-2")}>
          {Array.from({ length: baseCount }, (_, i) => (
            <BaseStationCard key={i} label={`Flat Screen ${String(i + 1).padStart(2, "0")}`} lanes={baseLanes[i]} setLanes={makeSetLanes("base", i)} {...cardProps} />
          ))}
        </div>
      )}
      {stationType === "C-Shaped Station" && showCShapedTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: cShapedCount }, (_, i) => (
            <BaseStationCard key={i} label={`C-Shaped Station WPT ${4 + i}`} lanes={cShapedLanes[i]} setLanes={makeSetLanes("cshaped", i)} {...cardProps} isCshaped />
          ))}
        </div>
      )}
      {showMassAssign && (
        <MassAssignModal
          onClose={() => setShowMassAssign(false)}
          coursewareList={coursewareList}
          baseStationLabels={baseStationLabels}
          cShapedStationLabels={cShapedStationLabels}
          cShapedLaneCounts={cShapedLaneCounts}
          weaponOptions={weaponOptions}
          hasExistingAssignments={hasExistingAssignments}
        />
      )}
    </div>
  );

  // ── V2 Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {FloatingToggle}

      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {isMultiCourseware ? (
            coursewareList.map((cw) => (
              <button key={cw} type="button" onClick={() => { setActiveCourseware(cw); setV2FocusIdx(-1); }}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                  activeCourseware === cw
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary")}>
                {cw}
              </button>
            ))
          ) : headerLeft}
        </div>
        <Button type="outline" onClick={() => setShowMassAssign(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto border border-brand-primary text-brand-primary hover:bg-red-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Bulk Assign
        </Button>
      </div>

      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
          {/* All card */}
          {(() => {
            const totalConfigured = stationProgress.reduce((s, p) => s + p.configured, 0);
            const totalAvailable = stationProgress.reduce((s, p) => s + p.available, 0);
            const pct = totalAvailable > 0 ? (totalConfigured / totalAvailable) * 100 : 0;
            const isDone = totalConfigured === totalAvailable && totalAvailable > 0;
            return (
              <button type="button" onClick={() => setV2FocusIdx(-1)}
                className={cn("flex-shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border-2 min-w-[120px] transition-all text-left",
                  isAllView ? "border-gray-800 bg-gray-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm")}>
                <div className={cn("text-[9px] font-bold uppercase tracking-wider mb-0.5", isAllView ? "text-white/50" : "text-gray-400")}>All</div>
                <div className={cn("text-xl font-bold leading-none", isAllView ? "text-white" : "text-gray-700")}>
                  {allStations.length}<span className={cn("text-xs font-medium ml-1", isAllView ? "text-white/50" : "text-gray-400")}>stations</span>
                </div>
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-[10px] font-medium", isAllView ? "text-white/60" : "text-gray-400")}>{totalConfigured}/{totalAvailable} lanes</span>
                    {isDone && <span className="text-[9px] font-bold text-green-400 flex items-center gap-0.5"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Done</span>}
                  </div>
                  <div className={cn("h-1.5 rounded-full overflow-hidden", isAllView ? "bg-white/20" : "bg-gray-100")}>
                    <div className={cn("h-full rounded-full transition-all duration-300", isDone ? "bg-green-400" : isAllView ? "bg-white/60" : "bg-gray-300")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })()}

          <div className="flex items-center flex-shrink-0"><div className="h-full w-px bg-gray-100 min-h-[80px]" /></div>

          {/* Base station navigator cards */}
          {Array.from({ length: baseCount }, (_, i) => {
            const isActive = safeFocusIdx === i;
            const prog = stationProgress[i];
            const pct = prog.available > 0 ? (prog.configured / prog.available) * 100 : 0;
            const isDone = prog.configured === prog.available && prog.available > 0;
            return (
              <button key={i} type="button" onClick={() => setV2FocusIdx(i)}
                className={cn("flex-shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border-2 min-w-[148px] transition-all text-left",
                  isActive ? "border-brand-primary bg-red-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm")}>
                <div className={cn("text-[9px] font-bold uppercase tracking-wider mb-0.5", isActive ? "text-brand-primary/70" : "text-gray-400")}>Flat Screen</div>
                <div className={cn("text-xl font-bold leading-none", isActive ? "text-brand-primary" : "text-gray-700")}>{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-[10px] font-medium", isActive ? "text-brand-primary/80" : "text-gray-400")}>{prog.configured}/{prog.available} lanes</span>
                    {isDone && <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Done</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-300", isDone ? "bg-green-500" : isActive ? "bg-brand-primary" : "bg-gray-300")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}

          {cShapedCount > 0 && <div className="flex items-center flex-shrink-0 px-1"><div className="h-full w-px bg-gray-200 min-h-[80px]" /></div>}

          {/* C-Shaped navigator cards */}
          {cShapedCount > 0 && Array.from({ length: cShapedCount }, (_, i) => {
            const flatIdx = baseCount + i;
            const isActive = safeFocusIdx === flatIdx;
            const prog = stationProgress[flatIdx];
            const pct = prog?.available > 0 ? (prog.configured / prog.available) * 100 : 0;
            const isDone = prog?.configured === prog?.available && (prog?.available ?? 0) > 0;
            return (
              <button key={i} type="button" onClick={() => setV2FocusIdx(flatIdx)}
                className={cn("flex-shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border-2 min-w-[148px] transition-all text-left",
                  isActive ? "border-purple-500 bg-purple-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm")}>
                <div className={cn("text-[9px] font-bold uppercase tracking-wider mb-0.5", isActive ? "text-purple-600" : "text-gray-400")}>C-Shaped</div>
                <div className={cn("text-xl font-bold leading-none", isActive ? "text-purple-700" : "text-gray-700")}>WPT {4 + i}</div>
                <div className="mt-3 w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-[10px] font-medium", isActive ? "text-purple-600" : "text-gray-400")}>{prog?.configured ?? 0}/{prog?.available ?? 0} lanes</span>
                    {isDone && <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Done</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-300", isDone ? "bg-green-500" : isActive ? "bg-purple-500" : "bg-gray-300")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}

        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isAllView ? (
          <div className={cn("grid gap-5", allStations.length === 1 ? "grid-cols-1 max-w-2xl" : "grid-cols-2")}>
            {allStations.map((s, flatIdx) => (
              <div key={s.id} className="relative group">
                <div onClick={() => setV2FocusIdx(flatIdx)} className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-2 py-1 bg-gray-800/80 text-white text-[10px] font-medium rounded-md cursor-pointer whitespace-nowrap">Focus station →</span>
                </div>
                <BaseStationCard label={s.label} lanes={s.type === "base" ? baseLanes[s.idx] : cShapedLanes[s.idx]} setLanes={makeSetLanes(s.type, s.idx)} {...cardProps} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {focusedStation && (
              <BaseStationCard label={focusedStation.label} lanes={focusedStation.type === "base" ? baseLanes[focusedStation.idx] : cShapedLanes[focusedStation.idx]} setLanes={makeSetLanes(focusedStation.type, focusedStation.idx)} {...cardProps} />
            )}
            {allStations.length > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button type="outline" onClick={() => setV2FocusIdx(safeFocusIdx === 0 ? -1 : safeFocusIdx - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200">
                  <ChevronLeft size={15} /> {safeFocusIdx === 0 ? "All Stations" : "Previous Station"}
                </Button>
                <span className="text-xs text-gray-400 font-medium">{safeFocusIdx + 1} / {allStations.length}</span>
                <Button type="outline"
                  onClick={() => setV2FocusIdx(Math.min(allStations.length - 1, safeFocusIdx + 1))}
                  disabled={safeFocusIdx === allStations.length - 1}
                  className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium w-auto border",
                    safeFocusIdx === allStations.length - 1 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-600")}>
                  Next Station <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showMassAssign && (
        <MassAssignModal
          onClose={() => setShowMassAssign(false)}
          coursewareList={coursewareList}
          baseStationLabels={baseStationLabels}
          cShapedStationLabels={cShapedStationLabels}
          cShapedLaneCounts={cShapedLaneCounts}
          weaponOptions={weaponOptions}
          hasExistingAssignments={hasExistingAssignments}
        />
      )}
    </div>
  );
}
