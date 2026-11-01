import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icon";
import { Chip } from "@/components/chip";
import { Tooltip } from "@/components/tooltip";
import { GroupDetailPage } from "./GroupDetailPage";
import type { Courseware, Trainee } from "../types";

/*
 * Figma `Training Result Details - Tab - Detail List` (5834:189828):
 * three summary tiles (Total Trainees · Passed (incl. Marksman) · Failed),
 * then one card per base station — Active Lanes, Weapons (n) chips with a
 * "+n" overflow tooltip, Avg Score, Total Detail, a tiered Pass Rate bar
 * and a full-width "View Details" button that opens the station's trainee
 * table (GroupDetailPage — Figma 5834:189830).
 */

interface DetailListTabProps {
  /** The active courseware. Everything on this tab is scoped to it. */
  courseware: Courseware;
}

/** Mock: lanes per base station (the courseware model has no lane capacity yet). */
const LANES_PER_STATION = 15;
const TRAINEES_PER_STATION = 10;
const VISIBLE_WEAPON_CHIPS = 2;

/*
 * Pass Rate colour. Figma draws 80% green (#15803d), 60% amber (bar #eab308,
 * label #a16207) and 30% red (#b91c1c) but does not state the cut-offs;
 * ≥70 / ≥50 is our assumption (reported as an open question).
 */
function passTone(pct: number) {
  if (pct >= 70) return { text: "text-success", bar: "bg-success-default" };
  if (pct >= 50) return { text: "text-warning", bar: "bg-warning-default" };
  return { text: "text-danger", bar: "bg-danger-default" };
}

function SummaryTile({ icon, iconBox, iconColor, label, value }: {
  icon: IconName; iconBox: string; iconColor: string; label: string; value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-invert-default bg-surface p-4">
      <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg", iconBox)}>
        <Icon name={icon} size={24} className={iconColor} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-body">{label}</span>
        <span className="text-2xl font-semibold text-default">{value}</span>
      </div>
    </div>
  );
}

function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-body">{label}</span>
      {children}
    </div>
  );
}

function WeaponChips({ weapons }: { weapons: string[] }) {
  const [hover, setHover] = useState(false);
  const shown = weapons.slice(0, VISIBLE_WEAPON_CHIPS);
  const rest = weapons.length - shown.length;
  const chip = "h-5 rounded-full px-1.5 py-0.5 text-xs";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((w) => <Chip key={w} kind="filled" className={chip}>{w}</Chip>)}
      {rest > 0 && (
        <span className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Chip kind="filled" className={cn(chip, "cursor-default")}>+{rest}</Chip>
          <Tooltip visible={hover} width={160} lines={[weapons.join(", ")]} className="mt-1" />
        </span>
      )}
    </div>
  );
}

export function DetailListTab({ courseware }: DetailListTabProps) {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);
  const passedCount = courseware.trainees.filter(t => t.resultLabel !== "FAILED").length;
  const failedCount = courseware.trainees.filter(t => t.resultLabel === "FAILED").length;

  if (selectedGroupIdx !== null) {
    return (
      <GroupDetailPage
        groups={courseware.details}
        initialGroupIndex={selectedGroupIdx}
        courseware={courseware.name}
        onBack={() => setSelectedGroupIdx(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <SummaryTile icon="users" iconBox="bg-info-invert-default" iconColor="text-info" label="Total Trainees" value={courseware.totalTrainees} />
        <SummaryTile icon="circle-check-big" iconBox="bg-success-invert-default" iconColor="text-success" label="Passed (incl. Marksman)" value={passedCount} />
        <SummaryTile icon="circle-x" iconBox="bg-danger-invert-default" iconColor="text-danger" label="Failed" value={failedCount} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {courseware.details.map((detail, idx) => {
          const st: Trainee[] = courseware.trainees.filter((_, i) => Math.floor(i / TRAINEES_PER_STATION) === idx);
          const passed = st.filter(t => t.resultLabel !== "FAILED").length;
          const passPct = st.length ? Math.round((passed / st.length) * 100) : 0;
          const tone = passTone(passPct);
          const lanes = new Set(st.map(t => t.lane)).size;
          const weapons = [...new Set([detail.weapon, ...st.map(t => t.weapon)])].sort();
          const totalDetail = new Set(st.map(t => t.detail)).size;

          return (
            <div key={detail.id} className="flex flex-col rounded-xl border border-invert-default bg-surface">
              {/* Section Header — padding 20: 16/600 station id, 12 body subtitle */}
              <div className="flex flex-col gap-0.5 p-5">
                <span className="text-base font-semibold text-default">{detail.id}</span>
                <span className="text-xs text-body">{detail.traineesCount} trainees</span>
              </div>

              <div className="flex flex-col gap-5 px-5 pb-5">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <KeyValue label="Active Lanes">
                      <span className="text-sm font-semibold text-default">{lanes}/{LANES_PER_STATION}</span>
                    </KeyValue>
                    <KeyValue label={`Weapons (${weapons.length})`}>
                      <WeaponChips weapons={weapons} />
                    </KeyValue>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <KeyValue label="Avg Score">
                      <span className="text-sm font-semibold text-default">{detail.avgScore.replace(/\s/g, "")}</span>
                    </KeyValue>
                    <KeyValue label="Total Detail">
                      <span className="text-sm font-semibold text-default">{totalDetail}</span>
                    </KeyValue>
                  </div>

                  {/* Figma `Progress`: label row (14/500) + 10px bar on border-grey track */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-default">Pass Rate</span>
                      <span className={tone.text}>{passPct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-divider">
                      <div className={cn("h-full rounded-full transition-all", tone.bar)} style={{ width: `${passPct}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGroupIdx(idx)}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-hovered transition-colors"
                >
                  View Details
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
