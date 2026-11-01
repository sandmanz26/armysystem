// Booking 2.0 — Booking Details › tab "Lane Configuration" (BD-1, F-006).
//
// Figma section `Tab - Lane Config` on Booking Details (page 5029:40418):
//   Flat Screen, filled   5511:46139  — white Section Layout: underline tabs Flat Screen / C-Shaped,
//                                       "Lane Configuration" header + primary "Edit Lane
//                                       Configuration" (pencil), then one card per station
//                                       (2 per row): title "WPT-01" + read-only table
//                                       Lane · Role · Controlled Item/Weapon · Status (On/Off badge)
//   Flat Screen, empty    5511:46141  — same, every active lane "Not Assigned"
//   C-Shaped              5512:153375 / 5512:153377 — same layout, C-Shaped stations
//   Edit                  5512:166256 — full-screen EditLaneConfigView
//   Toast                 5513:180809 — "Lane configuration updated", top-right
// The "Configure lanes in Lane Configuration before the booking time…" banner of the empty frames
// sits in the page header, outside this tab (see `hasLaneConfig` in laneConfigStore).
import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, type CellContext } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { StatusBadge } from "@/components/status-badge";
import { Toast } from "@/components/toast";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  getLaneConfig, saveLaneConfig, isOccupiedLane,
  type DetailLane, type DetailLaneConfig, type DetailStation,
} from "./laneConfigStore";
import { EditLaneConfigView } from "./EditLaneConfigView";

type StationType = "flat" | "cshaped";

interface Props {
  /** Mock booking `id` (URL `?id=`). */
  id: string;
  /** Display booking id, e.g. "#260423-PTC001". */
  bookingId: string;
  program: string;
  /** The courseware this lane configuration belongs to (one per courseware). */
  courseware: string;
  /** Current station names of the booking (after Reassign). Empty → seed / quantity fallback. */
  flatStations: string[];
  cShapedStations: string[];
  /** Station quantity used only when the booking carries no station names. */
  flatQty?: number;
  cShapedQty?: number;
}

type Row = DetailLane & { laneNo: number; type: StationType };

const col = createColumnHelper<Row>();

const dash = <span className="text-xs leading-4 text-body">—</span>;
const notAssigned = <span className="text-xs font-medium leading-4 text-body">Not Assigned</span>;

/** Figma `Table - Lane Configuration Read`: Lane 96 · Role 171 · Controlled Item/Weapon 171 · Status 80. */
const columns = [
  col.accessor("laneNo", {
    header: () => "Lane",
    width: "96px",
    cell: ({ row }: CellContext<Row, unknown>) => {
      const off = !row.original.active;
      return <span className={cn("text-xs leading-4", off ? "text-body" : "text-default")}>Lane {row.original.laneNo}</span>;
    },
  } as any),
  col.accessor("role", {
    header: () => "Role",
    width: "171px",
    cell: ({ row }: CellContext<Row, unknown>) => {
      const l = row.original;
      if (!l.active) return dash;
      return l.role ? <span className="text-xs font-medium leading-4 text-default">{l.role}</span> : notAssigned;
    },
  } as any),
  col.accessor("weapon", {
    header: () => "Controlled Item/Weapon",
    width: "171px",
    normalWhitespace: "true",
    cell: ({ row }: CellContext<Row, unknown>) => {
      const l = row.original;
      if (!l.active) return dash;
      return l.weapon.length
        ? <span className="text-xs font-medium leading-[18px] text-default">{l.weapon.join(", ")}</span>
        : notAssigned;
    },
  } as any),
  col.accessor("active", {
    header: () => "Status",
    width: "80px",
    cell: ({ row }: CellContext<Row, unknown>) => (
      <StatusBadge tone={row.original.active ? "success" : "neutral"} className="py-px leading-4">
        {row.original.active ? "On" : "Off"}
      </StatusBadge>
    ),
  } as any),
];

function StationCard({ station, type }: { station: DetailStation; type: StationType }) {
  const rows = useMemo<Row[]>(
    () => station.lanes.map((l, i) => ({
      ...l,
      // Occupied Flat Screen lanes are always Off, whatever was stored.
      active: l.active && !isOccupiedLane(type, i + 1),
      laneNo: i + 1,
      type,
    })),
    [station, type],
  );
  return (
    // Figma `SubSection Layout - Table`: white, 1px border/invert/default, radius 12.
    <div className="overflow-hidden rounded-xl border border-invert-default bg-surface">
      <div className="flex h-[52px] items-center px-4">
        <h4 className="text-sm font-semibold leading-5 text-default">{station.name}</h4>
      </div>
      <TableCustom<Row>
        data={rows}
        columns={columns}
        tableFixed
        autoScrollTable={false}
        actionSticky={false}
        classTheadTh="px-4 py-2.5 text-xs leading-4 font-semibold"
        classTBody="hover:bg-surface [&:last-child>td]:border-b-0"
        classTBodyTd="h-9 px-4 py-2 align-middle"
      />
    </div>
  );
}

export function LaneConfigurationTab({
  id, bookingId, program, courseware, flatStations, cShapedStations, flatQty = 0, cShapedQty = 0,
}: Props) {
  const fallback = useMemo(() => ({
    flat: flatStations.length
      ? flatStations
      : Array.from({ length: cShapedStations.length || cShapedQty ? flatQty : Math.max(1, flatQty) }, (_, i) => `Flat Screen #${i + 1}`),
    cshaped: cShapedStations.length
      ? cShapedStations
      : Array.from({ length: cShapedQty }, (_, i) => `C-Shaped #${i + 1}`),
  }), [flatStations, cShapedStations, flatQty, cShapedQty]);

  const [config, setConfig] = useState<DetailLaneConfig>(() =>
    getLaneConfig(id, courseware, { flat: flatStations, cshaped: cShapedStations }, fallback));
  const types = (["flat", "cshaped"] as const).filter((t) => config[t].length > 0);
  const [type, setType] = useState<StationType>(types[0] ?? "flat");
  // The multi-courseware layout swaps `courseware` on the same mounted tab — reload its config.
  useEffect(() => {
    const next = getLaneConfig(id, courseware, { flat: flatStations, cshaped: cShapedStations }, fallback);
    setConfig(next);
    setType((t) => (next[t].length ? t : next.flat.length ? "flat" : "cshaped"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, courseware, flatStations.join(), cShapedStations.join()]);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stations = config[type];
  const rows: DetailStation[][] = [];
  for (let i = 0; i < stations.length; i += 2) rows.push(stations.slice(i, i + 2));

  return (
    <>
      {/* Figma `Section Layout`: white card, 1px border, radius 12. */}
      <div className="rounded-xl border border-invert-default bg-surface">
        {/* `Tab Group v2` (44px, 20px side padding, divider under). */}
        <div className="flex border-b border-invert-default px-5">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "relative -mb-px h-11 px-4 text-sm font-medium leading-5 transition-colors",
                type === t ? "text-primary" : "text-body hover:text-default",
              )}
            >
              {t === "flat" ? "Flat Screen" : "C-Shaped"}
              {type === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />}
            </button>
          ))}
        </div>

        {/* `Section Header` (76px, 20px padding). */}
        <div className="flex h-[76px] items-center justify-between gap-5 px-5">
          <h3 className="text-base font-semibold leading-6 text-default">Lane Configuration</h3>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold leading-5 text-invert-default transition-colors hover:bg-primary-hovered"
          >
            <Icon name="pencil" size={16} />
            Edit Lane Configuration
          </button>
        </div>

        {/* `Content`: 20px side/bottom padding, rows of two station cards, 20px gaps. */}
        <div className="flex flex-col gap-5 px-5 pb-5">
          {rows.map((pair, ri) => (
            <div key={ri} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {pair.map((st, si) => (
                <StationCard key={`${type}-${ri * 2 + si}`} station={st} type={type} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <EditLaneConfigView
          bookingId={bookingId}
          program={program}
          courseware={courseware}
          initial={config}
          onClose={() => setEditing(false)}
          onConfirm={(next) => {
            saveLaneConfig(id, courseware, next);
            setConfig(next);
            setEditing(false);
            setToast("Lane configuration updated");
          }}
        />
      )}

      {/* Figma `Toast - Success` (5513:180809): top-right, 12px under the 60px header. */}
      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} placement="top-right" />
    </>
  );
}
