// Booking 2.0 Onboarding — Step 2: Confirm Lane Configuration, per the
// reference screenshots. Distinct from booking-2/create's Lane Configuration
// step: lanes come in pre-seeded (as if already configured at booking time),
// each active lane has a Status toggle to mark it on/off for this session,
// and "Confirm Lane Configuration" opens a changes-summary modal before
// committing (instead of just moving to the next wizard step).
import { useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { COLLECTIVE_WEAPONS, JUDGEMENTAL_WEAPONS, COLLECTIVE_TEAM_OPTIONS } from "@/pages-tsx/booking/create/constants";
import { InlineSingleAssign, InlineMultiAssign } from "@/pages-tsx/booking-2/create/components/InlineAssign";
import { CopyToModal } from "@/pages-tsx/booking-2/create/modals/CopyToModal";
import { BulkAssignModal } from "@/pages-tsx/booking-2/create/modals/BulkAssignModal";
import {
  seedFlatStation, seedCShapedStation, stationProgress, laneDiffText, OCCUPIED_LANES, stationLabel,
  type OnbStationData, type OnbLaneRow,
} from "../laneConfigTypes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert } from "@/components/alert";

interface StationChangeGroup {
  label: string;
  changes: string[];
}

function Switch({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "w-9 h-5 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0",
        disabled ? "bg-figma-fielddisabled cursor-not-allowed justify-start" : checked ? "bg-figma-success justify-end" : "bg-figma-danger justify-start"
      )}
    >
      <span className="w-4 h-4 rounded-full bg-white" />
    </button>
  );
}

interface OnboardingLaneConfigStepProps {
  trainingMode: string;
  bookingWeapons: string[];
  bookingRoles: string[];
  numBase: number;
  numCShaped: number;
  courseware: string;
  onConfirm: (data: { flat: OnbStationData[]; cshaped: OnbStationData[] }) => void;
}

export interface OnboardingLaneConfigStepHandle {
  requestConfirm: () => void;
}

export const OnboardingLaneConfigStep = forwardRef<OnboardingLaneConfigStepHandle, OnboardingLaneConfigStepProps>(function OnboardingLaneConfigStep({ trainingMode, bookingWeapons, bookingRoles, numBase, numCShaped, courseware, onConfirm }, ref) {
  const isCollective = trainingMode === "Collective";
  const weaponOptions = bookingWeapons.length > 0
    ? bookingWeapons
    : isCollective ? COLLECTIVE_WEAPONS : trainingMode === "Judgemental" ? JUDGEMENTAL_WEAPONS : ["SAR21", "LMG", "M203", "GPMG", "M110"];
  const roleOptions = bookingRoles.length > 0 ? bookingRoles : COLLECTIVE_TEAM_OPTIONS;

  const [seed] = useState<{ flat: OnbStationData[]; cshaped: OnbStationData[] }>(() => ({
    flat: Array.from({ length: Math.max(1, numBase) }, (_, i) => seedFlatStation(roleOptions, weaponOptions, isCollective, i * 13 + 1)),
    cshaped: numCShaped > 0 ? Array.from({ length: numCShaped }, (_, i) => seedCShapedStation(roleOptions, weaponOptions, isCollective, 1, i * 17 + 3)) : [],
  }));
  const [data, setData] = useState<{ flat: OnbStationData[]; cshaped: OnbStationData[] }>(() => JSON.parse(JSON.stringify(seed)));

  const [stationType, setStationType] = useState<"flat" | "cshaped">("flat");
  const [copySource, setCopySource] = useState<{ courseware: string; type: "flat" | "cshaped"; index: number; label: string } | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showConfirmChanges, setShowConfirmChanges] = useState(false);
  // F-009 (O-7): Figma `Lane Config - Error` (5358:92633 Collective / 5411:13038 J&M) — the
  // section's sticker says "Error State" on Confirm; set by a Confirm click with issues.
  const [showErrors, setShowErrors] = useState(false);

  const stations = data[stationType];

  const updateStation = (type: "flat" | "cshaped", index: number, updater: (st: OnbStationData) => OnbStationData) => {
    setData((prev) => {
      const arr = [...prev[type]];
      arr[index] = updater(arr[index]);
      return { ...prev, [type]: arr };
    });
  };

  const updateLane = (type: "flat" | "cshaped", stationIdx: number, laneIdx: number, patch: Partial<OnbLaneRow>) => {
    updateStation(type, stationIdx, (st) => ({ lanes: st.lanes.map((l, i) => (i === laneIdx ? { ...l, ...patch } : l)) }));
  };

  const allStationRefs = useMemo(() => {
    const flatRefs = data.flat.map((_, i) => ({ type: "flat" as const, index: i, label: stationLabel(i) }));
    const cshapedRefs = data.cshaped.map((_, i) => ({ type: "cshaped" as const, index: i, label: stationLabel(i) }));
    return [...flatRefs, ...cshapedRefs];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // An active lane is an issue when it has no weapon, or (Collective) no role.
  const laneHasIssue = (l: OnbLaneRow) => l.active && (l.weapon.length === 0 || (isCollective && !l.role));
  const issueLaneCount = useMemo(() => {
    return allStationRefs.reduce((sum, ref) => sum + data[ref.type][ref.index].lanes.filter(laneHasIssue).length, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStationRefs, data, isCollective]);

  // "Review issue": open the tab holding the first station with an issue and scroll to it.
  const reviewIssue = () => {
    const first = allStationRefs.find((r) => data[r.type][r.index].lanes.some(laneHasIssue));
    if (!first) return;
    setStationType(first.type);
    setTimeout(() => document.getElementById(`onb-lane-station-${first.type}-${first.index}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const activeLaneCountFor = (type: "flat" | "cshaped", index: number) => data[type][index]?.lanes.filter((l) => l.active).length ?? 0;

  const buildChangeGroups = (): { groups: StationChangeGroup[]; laneCount: number; stationCount: number } => {
    const groups: StationChangeGroup[] = [];
    let laneCount = 0;
    let stationCount = 0;
    (["flat", "cshaped"] as const).forEach((type) => {
      data[type].forEach((st, i) => {
        const seedSt = seed[type][i];
        const changes: string[] = [];
        st.lanes.forEach((lane, li) => {
          const text = laneDiffText(seedSt.lanes[li], lane, isCollective);
          if (text) {
            changes.push(`Lane ${li + 1}: ${text}`);
            laneCount += 1;
          }
        });
        if (changes.length > 0) {
          groups.push({ label: stationLabel(i), changes });
          stationCount += 1;
        }
      });
    });
    return { groups, laneCount, stationCount };
  };

  const changeSummary = useMemo(buildChangeGroups, [data, seed, isCollective]);

  // Figma (5628:40744, section "Confirmation if Any Changes"): the warning
  // only appears when something was actually changed — no changes skips
  // straight through.
  const handleConfirmClick = () => {
    if (issueLaneCount > 0) { setShowErrors(true); return; }
    if (changeSummary.groups.length > 0) setShowConfirmChanges(true);
    else onConfirm(data);
  };

  useImperativeHandle(ref, () => ({
    requestConfirm: handleConfirmClick,
  }));

  const activeStations = stations;
  const hasCShapedTab = numCShaped > 0;

  return (
    <div className="flex-1 overflow-auto bg-figma-soft p-6">
      <div>
        {showErrors && issueLaneCount > 0 && (
          <Alert
            status="danger"
            className="mb-6"
            message={
              <>
                {issueLaneCount} {issueLaneCount === 1 ? "lane doesn't" : "lanes don't"}{" "}
                {isCollective ? "have a controlled item/weapon and/or role assigned yet." : "have a weapon assigned yet."}{" "}
                <button type="button" onClick={reviewIssue} className="text-link">Review issue</button>
              </>
            }
          />
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-figma-default">Confirm Lane Configuration</h2>
            <p className="text-sm text-figma-body mt-0.5">Please confirm the lanes before start of the training</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => setShowBulkAssign(true)} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Bulk Assign
            </button>
          </div>
        </div>

        {/* Dev feedback #12: tabs always drawn; C-Shaped is disabled when the booking has none. */}
        <div className="flex items-center gap-2 mb-5">
          {(["flat", "cshaped"] as const).map((t) => {
            const disabled = t === "cshaped" && !hasCShapedTab;
            return (
              <button
                key={t}
                type="button"
                disabled={disabled}
                onClick={() => setStationType(t)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg border transition-colors",
                  stationType === t ? "border-figma-primary text-figma-primary bg-figma-primarysoft ring-1 ring-figma-primary" : "border-figma-subtle text-figma-body bg-figma-muted hover:bg-figma-soft",
                  disabled && "cursor-not-allowed text-figma-disabled hover:bg-figma-muted"
                )}
              >
                {t === "flat" ? "Flat Screen" : "C-Shaped"}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeStations.map((st, i) => {
            const prog = stationProgress(st);
            const label = stationLabel(i);
            return (
              <div key={i} id={`onb-lane-station-${stationType}-${i}`} className="bg-white border border-figma-subtle rounded-xl overflow-hidden scroll-mt-6">
                <div className="h-1 bg-figma-success" />
                <div className="flex items-center justify-between px-5 py-4 border-b border-figma-subtle">
                  <div>
                    <h4 className="text-sm font-bold text-figma-default">{label}</h4>
                    <p className="text-xs text-figma-body mt-0.5">
                      <span className="font-semibold text-figma-default">{prog.activeCount}/{st.lanes.length}</span> lanes active
                      {isCollective && (
                        <> · <span className={cn("font-semibold", prog.roleAssigned === prog.activeCount ? "text-figma-success" : "text-figma-danger")}>{prog.roleAssigned}/{prog.activeCount} lanes role-assigned</span></>
                      )}
                      {" "}· <span className={cn("font-semibold", prog.weaponAssigned === prog.activeCount ? "text-figma-success" : "text-figma-danger")}>{prog.weaponAssigned}/{prog.activeCount} lanes weapon-assigned</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCopySource({ courseware, type: stationType, index: i, label })}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-figma-subtle text-figma-default hover:bg-figma-soft flex-shrink-0"
                  >
                    Copy to
                  </button>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-figma-dangersoft/70 text-figma-primary text-xs">
                      <th className="text-left font-semibold px-4 py-2">Lane</th>
                      {isCollective && <th className="text-left font-semibold px-4 py-2">Role</th>}
                      {/* Figma: Collective frames (5358:92564) say "Controlled Item/Weapon"; Judgemental/Marksmanship (5411:13034) say "Weapon". */}
                      <th className="text-left font-semibold px-4 py-2">{isCollective ? "Controlled Item/Weapon" : "Weapon"}</th>
                      <th className="text-left font-semibold px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.lanes.map((lane, li) => {
                      const structurallyInactive = stationType === "flat" && OCCUPIED_LANES.includes(li + 1);
                      return (
                        <tr key={li} className={cn("border-t border-figma-subtle", showErrors && isCollective && laneHasIssue(lane) && "[&>td:first-child]:shadow-[inset_4px_0_0_rgb(var(--color-text-danger))]")}>
                          <td className={cn("px-4 py-2.5", structurallyInactive ? "text-figma-body" : "text-figma-default")}>Lane {li + 1}</td>
                          {isCollective && (
                            <td className="px-4 py-2.5">
                              {lane.active ? (
                                <InlineSingleAssign value={lane.role} onChange={(v) => updateLane(stationType, i, li, { role: v })} options={roleOptions} error={showErrors} />
                              ) : (
                                <span className="text-figma-body">—</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-2.5">
                            {lane.active ? (
                              <InlineMultiAssign value={lane.weapon} onChange={(v) => updateLane(stationType, i, li, { weapon: v })} options={weaponOptions} error={showErrors && isCollective} />
                            ) : (
                              <span className="text-figma-body">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {structurallyInactive ? (
                              <Switch checked={false} disabled onChange={() => {}} />
                            ) : (
                              <Switch checked={lane.active} onChange={() => updateLane(stationType, i, li, { active: !lane.active })} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {copySource && (
        <CopyToModal
          source={copySource}
          sourceProgress={{ activeCount: activeLaneCountFor(copySource.type, copySource.index), roleAssigned: 0, weaponAssigned: 0, complete: false }}
          stationType={copySource.type}
          coursewareList={[courseware]}
          stationsByCourseware={(cw) => allStationRefs.map((r) => ({ courseware: cw, ...r }))}
          onClose={() => setCopySource(null)}
          onConfirm={(targets) => {
            const src = data[copySource.type][copySource.index];
            setData((prev) => {
              const next = { ...prev };
              targets.forEach((t) => {
                if (t.type !== copySource.type) return;
                const arr = [...next[t.type]];
                arr[t.index] = JSON.parse(JSON.stringify(src));
                next[t.type] = arr;
              });
              return next;
            });
            setCopySource(null);
          }}
        />
      )}

      {showBulkAssign && (
        <BulkAssignModal
          isCollective={isCollective}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          coursewareList={[courseware]}
          flatStationsByCourseware={(cw) => data.flat.map((_, i) => ({ courseware: cw, type: "flat" as const, index: i, label: stationLabel(i) }))}
          cshapedStationsByCourseware={(cw) => data.cshaped.map((_, i) => ({ courseware: cw, type: "cshaped" as const, index: i, label: stationLabel(i) }))}
          activeLaneCountFor={(ref) => activeLaneCountFor(ref.type, ref.index)}
          onClose={() => setShowBulkAssign(false)}
          onConfirm={(role, weapon, targets) => {
            setData((prev) => {
              const next = { flat: [...prev.flat], cshaped: [...prev.cshaped] };
              targets.forEach((t) => {
                const st = next[t.type][t.index];
                next[t.type][t.index] = {
                  lanes: st.lanes.map((l) => (l.active ? { ...l, role: role || l.role, weapon: weapon ? [weapon] : l.weapon } : l)),
                };
              });
              return next;
            });
            setShowBulkAssign(false);
          }}
        />
      )}

      {/* Figma `Confirm Lane Configuration - Confirmation if Any Changes` (5628:40744):
          a plain warning, not a per-station changes list. */}
      <ConfirmDialog
        open={showConfirmChanges}
        tone="warning"
        title="Confirm lane configuration"
        subtitle="This will update the Lane Configuration and regenerate the affected parts of the Detail List. Continue?"
        confirmLabel="Confirm"
        onCancel={() => setShowConfirmChanges(false)}
        onConfirm={() => { setShowConfirmChanges(false); onConfirm(data); }}
      />
    </div>
  );
});
