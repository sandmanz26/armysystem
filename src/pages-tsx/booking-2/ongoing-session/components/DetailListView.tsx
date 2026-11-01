import Dropdown from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import {
  canCutQueue, detailResults, detailsOf, stationsOf,
  type DraftDetail, type OngoingSession, type SessionDetail, type StationType,
} from "../session";
import { STATUS_TONE } from "../statusTone";

export function BoxTabs({ value, onChange, hasCShaped }: { value: StationType; onChange: (v: StationType) => void; hasCShaped: boolean }) {
  const tabs: { key: StationType; label: string }[] = [
    { key: "flat", label: "Flat Screen" },
    { key: "cshaped", label: "C-Shaped" },
  ];
  return (
    <div className="flex items-center gap-3">
      {tabs.map((t) => {
        const active = value === t.key;
        const disabled = t.key === "cshaped" && !hasCShaped;
        return (
          <button
            key={t.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.key)}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm font-medium transition-colors",
              active ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-default-default text-body",
              disabled && "cursor-not-allowed",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-invert-default bg-surface-lv1">
      <div className="flex items-center gap-2 p-5">
        <span className="text-base font-semibold text-default">{title}</span>
        <span className="text-base font-semibold text-body">{count}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-x-3 gap-y-5 px-5 pb-5">{children}</div>
    </div>
  );
}

// Figma `Result Group` (5520:437962): three equal cells split by 1px dividers —
// icon + label (14 Regular) over the count (18 Semi Bold); Failed turns red
// when above 0. Without any attempt yet: one grey cell, "No result yet".
function ResultGroup({ results }: { results: ReturnType<typeof detailResults> }) {
  if (!results) {
    return (
      <div className="overflow-hidden rounded-lg border border-invert-default">
        <div className="flex h-[52px] items-center justify-center bg-default-soft text-sm text-body">No result yet</div>
      </div>
    );
  }
  const cells = [
    { label: "Marksman", icon: "target", iconClass: "text-info", value: results.Marksman, red: false },
    { label: "Passed", icon: "circle-check-big", iconClass: "text-success", value: results.Passed, red: false },
    { label: "Failed", icon: "circle-x", iconClass: "text-danger", value: results.Failed, red: results.Failed > 0 },
  ] as const;
  return (
    <div className="flex divide-x divide-invert-default rounded-lg border border-invert-default">
      {cells.map((c) => (
        <div key={c.label} className="flex h-[52px] flex-1 flex-col items-center justify-center">
          <span className="flex items-center gap-2 text-sm text-default">
            <Icon name={c.icon} size={16} className={c.iconClass} />
            {c.label}
          </span>
          <span className={cn("text-lg font-semibold", c.red ? "text-danger" : "text-default")}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}

function DetailCard({
  detail,
  results,
  cutEnabled,
  onCut,
  onView,
}: {
  detail: SessionDetail;
  results: ReturnType<typeof detailResults>;
  cutEnabled: boolean;
  onCut: () => void;
  onView: () => void;
}) {
  const n = detail.assignments.length;
  return (
    <div className="min-w-0 rounded-lg border border-invert-default bg-surface-lv1">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold text-default">Detail {detail.number}</span>
          <span className="text-xs text-body">{n} trainee{n === 1 ? "" : "s"}</span>
        </div>
        <StatusBadge tone={STATUS_TONE[detail.status]}>{detail.status}</StatusBadge>
      </div>
      <div className="flex flex-col gap-4 px-4 pb-4">
      <ResultGroup results={results} />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!cutEnabled}
          onClick={onCut}
          className={cn(
            "flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold transition-colors",
            cutEnabled ? "text-default hover:bg-default-soft" : "cursor-not-allowed text-disabled",
          )}
        >
          <Icon name="list-start" size={16} />
          Manage Queue
        </button>
        <button
          type="button"
          onClick={onView}
          className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft transition-colors"
        >
          View Details
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
      </div>
    </div>
  );
}

function DraftCard({ draft, seats, onDelete, onEdit }: { draft: DraftDetail; seats: number; onDelete: () => void; onEdit: () => void }) {
  const free = seats - draft.assignments.length;
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-invert-default bg-surface-lv1">
      <div className="flex flex-col gap-0.5 p-4">
        <span className="text-sm font-semibold text-default">New Detail — {draft.station}</span>
        <span className="text-xs text-body">{free}/{seats} seat{free === 1 ? "" : "s"} available</span>
      </div>
      <div className="flex gap-3 px-4 pb-4">
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors"
        >
          <Icon name="trash-2" size={16} />
          Delete Detail
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft transition-colors"
        >
          <Icon name="pencil" size={16} />
          Edit Detail
        </button>
      </div>
    </div>
  );
}

// Figma `Listbox Item/Single Item New`: 12/8 padding, 20px icon in
// `text/body`, 10px gap, title 14 Medium over subtitle 12 Regular; both turn
// `text/disabled` when there is nothing to pick.
function CreateMenuItem({
  icon, title, subtitle, disabled, onClick,
}: {
  icon: "table-2" | "user-round-x";
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 bg-surface px-3 py-2 text-left transition-colors",
        disabled ? "cursor-not-allowed" : "hover:bg-default-soft",
      )}
    >
      <Icon name={icon} size={20} className="flex-shrink-0 text-body" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("text-sm font-medium", disabled ? "text-disabled" : "text-default")}>{title}</span>
        <span className={cn("text-xs", disabled ? "text-disabled" : "text-body")}>{subtitle}</span>
      </span>
    </button>
  );
}

export function LaneDownBanner({ station, lane }: { station: string; lane: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-danger bg-danger-invert-default px-4 py-3 text-sm text-danger">
      <Icon name="circle-alert" size={16} />
      Lane down: {station}, Lane {lane}
    </div>
  );
}

export function DetailListView({
  session,
  tab,
  onTabChange,
  onCreateDetail,
  reshootCount,
  onReshoot,
  onLiveResults,
  onCut,
  onView,
  onDeleteDraft,
  onEditDraft,
}: {
  session: OngoingSession;
  tab: StationType;
  onTabChange: (t: StationType) => void;
  onCreateDetail: () => void;
  /** Failed trainees still to reshoot — 0 disables the dropdown's second item. */
  reshootCount: number;
  onReshoot: () => void;
  onLiveResults: () => void;
  onCut: (d: SessionDetail) => void;
  onView: (d: SessionDetail) => void;
  onDeleteDraft: (d: DraftDetail) => void;
  onEditDraft: (d: DraftDetail) => void;
}) {
  const stations = stationsOf(session, tab);
  const hasCShaped = stationsOf(session, "cshaped").length > 0;
  const seatsOf = (station: string) => session.stations.find((s) => s.label === station)?.activeLanes.length ?? 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-xl font-semibold text-default">Detail List</h2>
        <div className="flex items-center gap-3">
          {/* Figma `Dropdown - Create New Detail` (7759:37039, 5516:411670): a
              384px Listbox, right-aligned under the button, 4px below it. */}
          <Dropdown
            buttonClassName="h-10 w-auto gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft active:bg-gray-300"
            className="mt-1 w-[384px] border-0 py-1"
            Icon={
              <span className="flex items-center gap-2">
                <Icon name="plus" size={16} />
                Create New Detail
              </span>
            }
          >
            <CreateMenuItem icon="table-2" title="New Detail" subtitle="Choose a base station and add trainees yourself." onClick={onCreateDetail} />
            <CreateMenuItem
              icon="user-round-x"
              title={`Reshoot Failed Trainees (${reshootCount})`}
              subtitle={reshootCount > 0 ? "Create details for trainees who failed." : "No failed trainees right now"}
              disabled={reshootCount === 0}
              onClick={onReshoot}
            />
          </Dropdown>
          <button
            type="button"
            onClick={onLiveResults}
            className="flex h-10 items-center rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Live Results
          </button>
        </div>
      </div>

      {session.drafts.length > 0 && (
        <SectionCard title="Drafts" count={session.drafts.length}>
          {session.drafts.map((d) => (
            <DraftCard key={d.id} draft={d} seats={seatsOf(d.station)} onDelete={() => onDeleteDraft(d)} onEdit={() => onEditDraft(d)} />
          ))}
        </SectionCard>
      )}

      <BoxTabs value={tab} onChange={onTabChange} hasCShaped={hasCShaped} />

      {stations.map((st) => {
        const details = detailsOf(session, st.label);
        return (
          <SectionCard key={st.label} title={st.label} count={details.length}>
            {details.map((d) => (
              <DetailCard
                key={d.id}
                detail={d}
                results={detailResults(session, d)}
                cutEnabled={canCutQueue(session, d)}
                onCut={() => onCut(d)}
                onView={() => onView(d)}
              />
            ))}
          </SectionCard>
        );
      })}
    </div>
  );
}
