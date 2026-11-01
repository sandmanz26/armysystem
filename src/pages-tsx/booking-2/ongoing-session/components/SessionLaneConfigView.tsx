import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { COLLECTIVE_TEAM_OPTIONS, COLLECTIVE_WEAPONS } from "@/pages-tsx/booking/create/constants";
import { InlineMultiAssign, InlineSingleAssign } from "@/pages-tsx/booking-2/create/components/InlineAssign";
import { BulkAssignModal } from "@/pages-tsx/booking-2/create/modals/BulkAssignModal";
import { lanesOf, weaponsOf, type OngoingSession, type SessionLane, type StationType } from "../session";
import { PrimaryButton, SecondaryButton } from "./SessionHeader";

// Ongoing Session → "Lane Configuration". NOT in Figma yet — built from the product owner's reference
// screenshot (3 Oct 2026): "Re-set the lanes for the running training. On submit, only trainees in queue
// or pending are recalculated." One card per station with Lane / Roles / Controlled Item-Weapon / Status.

function OnOff({ checked, disabled, title, onChange }: { checked: boolean; disabled?: boolean; title?: string; onChange: () => void }) {
  return (
    <span className="inline-flex items-center gap-2" title={title}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={cn(
          "flex h-5 w-9 flex-shrink-0 items-center rounded-full px-0.5 transition-colors",
          checked ? "justify-end bg-success-default" : "justify-start bg-danger-default",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="h-4 w-4 rounded-full bg-white" />
      </button>
      <span className={cn("text-sm font-medium", checked ? "text-success" : "text-danger")}>{checked ? "On" : "Off"}</span>
    </span>
  );
}

export function SessionLaneConfigView({
  session,
  onBack,
  onApply,
}: {
  session: OngoingSession;
  onBack: () => void;
  onApply: (lanesByStation: Record<string, SessionLane[]>, changedLanes: number) => void;
}) {
  const original = useMemo(() => Object.fromEntries(session.stations.map((s) => [s.label, lanesOf(s)])), [session]);
  const [data, setData] = useState<Record<string, SessionLane[]>>(() => JSON.parse(JSON.stringify(original)));
  const hasCShaped = session.stations.some((s) => s.type === "cshaped");
  const [tab, setTab] = useState<StationType>("flat");
  const [bulk, setBulk] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // a lane that a Ready detail is standing on can't be switched off mid-run
  const lockedLanes = useMemo(() => {
    const m = new Map<string, Set<number>>();
    session.details.filter((d) => d.status === "Ready").forEach((d) => {
      const set = m.get(d.station) ?? new Set<number>();
      d.assignments.forEach((a) => set.add(a.lane));
      m.set(d.station, set);
    });
    return m;
  }, [session]);

  const weaponOptions = useMemo(
    () => [...new Set([...session.trainees.flatMap((t) => weaponsOf(t.weapon)), ...Object.values(original).flatMap((ls) => ls.flatMap((l) => weaponsOf(l.weapon))), ...COLLECTIVE_WEAPONS])],
    [session, original],
  );
  const roleOptions = COLLECTIVE_TEAM_OPTIONS;

  const stations = session.stations.filter((s) => s.type === tab);
  const patch = (station: string, laneIdx: number, p: Partial<SessionLane>) =>
    setData((prev) => ({ ...prev, [station]: prev[station].map((l, i) => (i === laneIdx ? { ...l, ...p } : l)) }));

  const changedLanes = useMemo(
    () => Object.keys(data).reduce((n, st) => n + data[st].filter((l, i) => JSON.stringify(l) !== JSON.stringify(original[st]?.[i])).length, 0),
    [data, original],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-[72px] flex-shrink-0 items-center justify-between gap-4 bg-surface px-6">
        <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-default">Lane Configuration</h2>
          <p className="text-xs text-body">Re-set the lanes for the running training. On submit, only trainees in queue or pending are recalculated.</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <SecondaryButton onClick={onBack}><Icon name="arrow-left" size={16} />Back</SecondaryButton>
          <PrimaryButton onClick={() => (changedLanes > 0 ? setConfirm(true) : onBack())}>
            Confirm &amp; recalculate <Icon name="arrow-right" size={16} />
          </PrimaryButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-body">Courseware: <span className="font-semibold text-primary">{session.courseware}</span></p>
          <button type="button" onClick={() => setBulk(true)} className="flex h-8 items-center gap-1 rounded-lg border border-primary bg-surface px-3 text-xs font-semibold text-primary hover:bg-primary-invert-soft">
            <Icon name="plus" size={12} /> Mass Assign
          </button>
        </div>

        <div className="mb-5 flex items-center gap-2">
          {([["flat", "Flat Screen"], ["cshaped", "C-Shaped Station"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={key === "cshaped" && !hasCShaped}
              onClick={() => setTab(key)}
              className={cn(
                "h-8 rounded-lg border px-3 text-xs font-semibold transition-colors",
                tab === key ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-surface text-default",
                key === "cshaped" && !hasCShaped && "cursor-not-allowed opacity-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {stations.map((st) => {
            const lanes = data[st.label] ?? [];
            const active = lanes.filter((l) => l.active);
            const rolesDone = lanes.filter((l) => l.active && l.role).length;
            const weaponsDone = active.filter((l) => l.weapon.length > 0).length;
            return (
              <div key={st.label} className="overflow-hidden rounded-xl border border-invert-default bg-surface">
                <div className="flex items-center justify-between px-5 py-3">
                  <h3 className="text-sm font-semibold text-default">{st.label}</h3>
                  <p className="text-xs text-body">
                    <span>{rolesDone}/{lanes.length} roles</span>
                    <span className="mx-2 text-divider">|</span>
                    <span className={cn("font-semibold", weaponsDone === active.length ? "text-success" : "text-danger")}>{weaponsDone}/{active.length} weapons</span>
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary-invert-soft text-xs text-primary">
                      <th className="px-5 py-2 text-left font-semibold">Lane</th>
                      <th className="px-3 py-2 text-left font-semibold">Roles</th>
                      <th className="px-3 py-2 text-left font-semibold">Controlled Item / Weapon</th>
                      <th className="px-5 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lanes.map((lane, li) => {
                      const pinned = lockedLanes.get(st.label)?.has(li + 1) ?? false;
                      return (
                        <tr key={li} className="border-t border-invert-default">
                          <td className="px-5 py-2 text-default">Lane {li + 1}</td>
                          <td className="px-3 py-2">
                            {lane.active ? <InlineSingleAssign value={lane.role} onChange={(v) => patch(st.label, li, { role: v })} options={roleOptions} /> : <span className="text-body">—</span>}
                          </td>
                          <td className="px-3 py-2">
                            {lane.active ? <InlineMultiAssign value={lane.weapon} onChange={(v) => patch(st.label, li, { weapon: v })} options={weaponOptions} /> : <span className="font-semibold text-primary">—</span>}
                          </td>
                          <td className="px-5 py-2">
                            <OnOff
                              checked={lane.active}
                              disabled={pinned && lane.active}
                              title={pinned && lane.active ? "A Ready detail is standing on this lane" : undefined}
                              onChange={() => patch(st.label, li, { active: !lane.active })}
                            />
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

      {bulk && (
        <BulkAssignModal
          isCollective
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          coursewareList={[session.courseware]}
          flatStationsByCourseware={(cw) => session.stations.filter((s) => s.type === "flat").map((s, i) => ({ courseware: cw, type: "flat" as const, index: i, label: s.label }))}
          cshapedStationsByCourseware={(cw) => session.stations.filter((s) => s.type === "cshaped").map((s, i) => ({ courseware: cw, type: "cshaped" as const, index: i, label: s.label }))}
          activeLaneCountFor={(ref) => (data[ref.label] ?? []).filter((l) => l.active).length}
          onClose={() => setBulk(false)}
          onConfirm={(role, weapon, targets) => {
            setData((prev) => {
              const next = { ...prev };
              targets.forEach((t) => {
                next[t.label] = (next[t.label] ?? []).map((l) => (l.active ? { ...l, role: role || l.role, weapon: weapon ? [weapon] : l.weapon } : l));
              });
              return next;
            });
            setBulk(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirm}
        tone="warning"
        title="Confirm lane configuration"
        subtitle="Only trainees in queue or pending are recalculated onto the new lanes. Details that are Ready or Completed stay as they are. Continue?"
        confirmLabel="Confirm & recalculate"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); onApply(data, changedLanes); }}
      />
    </div>
  );
}
