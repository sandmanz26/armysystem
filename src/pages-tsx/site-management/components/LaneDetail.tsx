import { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { bookings } from "@/data/mock";
import type { BaseStation, Lane, BlackoutDate } from "../types";
import { AddBlackoutDrawer } from "../modals/AddBlackoutDrawer";
import { buildBlackoutRecord, type BlackoutFormValues } from "../blackoutRules";
import { BlackoutDateCell } from "./StationDetail";

/*
 * Lane Details — Figma page `Lane Details` (5115:215602).
 *   Active   · blackout empty/filled  5118:283727 · 283747 · deactivate 5945:18629
 *   Inactive · blackout empty/filled  5945:17848 · 17850
 *              activate (loading)     5945:18630 · toast 19065 ("Lane activated")
 *
 * Header: breadcrumb (Site Management › Base Station Details › Lane Details),
 * the lane name with its status badge, then `Delete Lane` (139x40 outline) and
 * `Delete Lane` — Figma has no activate/deactivate action on this page
 * once the lane is inactive.
 *
 * One card ("Lane Details": Last Updated on · Blackout Dates · Base Station)
 * and one table (Status 120 · Blackout Date 856 · Actions 120, trash only).
 * There is no tab group on this page.
 */

export function LaneDetail({
  station,
  lane,
  onBackToStation,
  onBackToList,
}: {
  station: BaseStation;
  lane: Lane;
  onBackToStation: () => void;
  onBackToList?: () => void;
}) {
  // Read-only now that activate/deactivate is gone; the lane's status still
  // drives the badge beside the title.
  const status = lane.status;
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>(
    (lane.blackoutDates ?? []).map((d) => (typeof d === "string" ? { label: d } : d)),
  );
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [deleteLane, setDeleteLane] = useState(false);
  const [blackoutDelete, setBlackoutDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const upcoming = bookings.filter(
    (b) => b.status === "Upcoming" && (b.assignedStations ?? []).includes(station.name),
  ).length;

  const handleAddBlackout = (v: BlackoutFormValues) => {
    setBlackoutDates((prev) => [...prev, buildBlackoutRecord(v)]);
    setToast("Blackout date added");
    setShowAddBlackout(false);
  };

  const columns = [
    {
      id: "status",
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      header: () => "Status",
      cell: ({ row }: any) => {
        const passed = row.original.status === "Passed";
        return (
          <StatusBadge tone={passed ? "neutral" : "success"}>
            {passed ? "Passed" : "Active"}
          </StatusBadge>
        );
      },
    },
    {
      id: "type",
      width: 140,
      minWidth: 140,
      maxWidth: 140,
      header: () => "Type",
      cell: ({ row }: any) => (
        <span className="text-sm text-default">
          {row.original.recurring ? "Recurring" : "One-time"}
        </span>
      ),
    },
    {
      id: "label",
      header: () => "Blackout Date",
      cell: ({ row }: any) => <BlackoutDateCell row={row.original} />,
    },
    {
      id: "nextDate",
      width: 180,
      minWidth: 180,
      maxWidth: 180,
      header: () => "Next Blackout Date",
      cell: ({ row }: any) => (
        <span className="text-sm text-default">{row.original.nextDate || "\u2014"}</span>
      ),
    },
    {
      id: "actions",
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      header: () => "Actions",
      cell: ({ row }: any) => (
        <button
          onClick={() => setBlackoutDelete(row.index)}
          aria-label="Delete"
          className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-danger hover:bg-primary-invert-soft transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ] as unknown as ColumnDef<BlackoutDate, any>[];

  const deletingRecurring = blackoutDelete !== null && !!blackoutDates[blackoutDelete]?.recurring;

  return (
    /* Was `fixed inset-0 z-[1500]` — an overlay, because this used to render
       stacked ON TOP of StationDetail. It is its own page now, so the overlay
       covered the app sidebar. Same page root as StationList / StationDetail. */
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={onBackToList ?? onBackToStation}
            className="text-body hover:text-primary transition-colors"
          >
            Site Management
          </button>
          <ChevronRight size={14} className="text-body" />
          <button onClick={onBackToStation} className="text-body hover:text-primary transition-colors">
            Base Station Details
          </button>
          <ChevronRight size={14} className="text-body" />
          <span className="font-medium text-primary">Lane Details</span>
        </nav>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-default whitespace-nowrap">{lane.name}</h1>
              <StatusBadge tone={status === "Active" ? "success" : "neutral"}>{status}</StatusBadge>
            </div>
            {/* Figma puts the owning base station directly under the lane name. */}
            <p className="mt-1 text-sm text-body">Base Station: {station.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              onClick={() => setDeleteLane(true)}
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg border border-invert-default bg-surface text-default text-sm font-semibold hover:bg-main-background transition-colors"
            >
              <Trash2 size={16} />
              Delete Lane
            </Button>
            {/*
              No Deactivate / Activate Lane button. Figma's Lane Details page
              (`5115:215602`) carries exactly two buttons — Add Blackout Date
              and Delete Lane — in BOTH its Active and Inactive sections, so
              there is no activate/deactivate action in the design. The button,
              its confirmation dialog and the activating spinner were removed
              on the product owner's instruction to follow Figma.
            */}
          </div>
        </div>

        {/* Section Layout — Lane Details key-value card */}
        <div className="bg-surface rounded-xl border border-invert-default p-5 space-y-4">
          <h2 className="text-base font-semibold text-default">Lane Details</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex min-w-[252px] flex-col gap-1">
              <span className="text-xs text-body">Last Updated on</span>
              <span className="text-sm font-semibold text-default">
                {String(lane.lastUpdatedOn).split("\n").join(" ")}
              </span>
            </div>
            <div className="flex min-w-[252px] flex-col gap-1">
              <span className="text-xs text-body">Blackout Dates</span>
              {/* Figma shows the bare count, not "N days". */}
              <span className="text-sm font-semibold text-default">{blackoutDates.length}</span>
            </div>
            <div className="flex min-w-[252px] flex-col gap-1">
              <span className="text-xs text-body">Base Station</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-default">{station.name}</span>
                <StatusBadge tone={station.status === "Active" ? "success" : "danger"}>
                  {station.status}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Section Layout - Table — Blackout Dates */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-default">Blackout Dates</h2>
              {/* Same "Section Header" component as every other list's card header
                  (5118:283746 — Header > Count) — bare number, not a "(N dates)"
                  parenthetical. Re-verified 29 Sep 2026 alongside the same bug on
                  Site Management's own list page. */}
              <span className="text-base font-semibold text-body">{blackoutDates.length}</span>
            </div>
            <Button
              onClick={() => setShowAddBlackout(true)}
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
            >
              <Plus size={16} />
              Add Blackout Date
            </Button>
          </div>

          <TableCustom columns={columns} data={blackoutDates} autoScrollTable={true} />
        </div>
      </div>

      <AddBlackoutDrawer
        open={showAddBlackout}
        onClose={() => setShowAddBlackout(false)}
        onSubmit={handleAddBlackout}
        stationName={station.name}
      />

      <ConfirmDialog
        open={deleteLane && upcoming === 0}
        tone="warning"
        title={<>Delete &ldquo;{lane.name}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteLane(false)}
        onConfirm={() => {
          setDeleteLane(false);
          onBackToStation();
        }}
      />

      <ConfirmDialog
        open={deleteLane && upcoming > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{lane.name}&rdquo;</>}
        subtitle={`This lane is linked to ${upcoming} upcoming booking${upcoming === 1 ? "" : "s"}. Reassign or cancel these bookings before deleting it.`}
        cancelLabel="Close"
        confirmLabel="View Bookings"
        onCancel={() => setDeleteLane(false)}
        onConfirm={() => {
          setDeleteLane(false);
          window.location.href = "/bookings/list";
        }}
      />

      <ConfirmDialog
        open={blackoutDelete !== null && !deletingRecurring}
        tone="warning"
        title="Delete this blackout date?"
        subtitle="This can't be undone. The base station will be available for booking on this date again."
        confirmLabel="Delete"
        onCancel={() => setBlackoutDelete(null)}
        onConfirm={() => {
          setBlackoutDates((prev) => prev.filter((_, i) => i !== blackoutDelete));
          setBlackoutDelete(null);
          setToast("Blackout date deleted");
        }}
      />

      <ConfirmDialog
        open={blackoutDelete !== null && deletingRecurring}
        tone="warning"
        title="Delete this recurring blackout date?"
        subtitle="This can't be undone. All occurrences of this recurring blackout will be removed, and the base station will be available for booking on those dates again."
        confirmLabel="Delete"
        onCancel={() => setBlackoutDelete(null)}
        onConfirm={() => {
          setBlackoutDates((prev) => prev.filter((_, i) => i !== blackoutDelete));
          setBlackoutDelete(null);
          setToast("Recurring blackout date deleted");
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
