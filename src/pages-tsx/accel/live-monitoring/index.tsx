import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Select } from "@/components/select";
import { cn } from "@/lib/utils";
import { selectPendingCritical, useAccel } from "../store";
import { CAMERAS, SITES } from "./data";
import { CameraTile, OfflineCard } from "./CameraTile";
import { SidePanel } from "./SidePanel";
import { AlertBanner } from "./AlertBanner";
import { GroupBar } from "./GroupBar";
import { LIVE_PLAYBACK, type Playback } from "./playback";

/*
 * Accel → Live Monitoring. Built from the reference screenshots (6 Oct 2026), then redesigned as a
 * second pass for the operator's job: spot what is wrong, find its camera, review it, act. What
 * changed and why is in each component's header; in short:
 *   · LIVE is quiet, exceptions (paused / behind / critical) are loud
 *   · detection badges carry severity and open that camera's detections
 *   · offline cameras are compact, not a third of the wall
 *   · selected cameras can be scrubbed together (the subtitle's promise)
 *   · a critical alert is pinned until acknowledged, with its next steps, instead of a toast on the tiles
 *   · detections and the wall point at each other
 * "N×N" is still read as N columns; "Auto" lets the grid pick its own count.
 */

const ALL_SITES = "All Sites";
const LAYOUTS = [
  { value: "auto", label: "Auto · fit to width" },
  { value: "1", label: "1×1" },
  { value: "2", label: "2×2" },
  { value: "3", label: "3×3" },
  { value: "4", label: "4×4" },
];

export function LiveMonitoring() {
  const events = useAccel((s) => s.events);
  const pendingCritical = useAccel(selectPendingCritical);

  const [site, setSite] = useState(ALL_SITES);
  const [layout, setLayout] = useState("auto");
  const [query, setQuery] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cameraFilter, setCameraFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [pb, setPb] = useState<Record<string, Playback>>({});
  const [highlight, setHighlight] = useState<string | null>(null);
  const [acked, setAcked] = useState<string[]>([]);

  const playbackOf = (id: string) => pb[id] ?? LIVE_PLAYBACK;
  const patch = (id: string, p: Partial<Playback>) => setPb((s) => ({ ...s, [id]: { ...playbackOf(id), ...p } }));
  const applyToSelected = (fn: (p: Playback) => Partial<Playback>) =>
    setPb((s) => {
      const next = { ...s };
      for (const id of selected) next[id] = { ...playbackOf(id), ...fn(playbackOf(id)) };
      return next;
    });

  const inSite = useMemo(() => CAMERAS.filter((c) => site === ALL_SITES || c.site === site), [site]);
  const matching = useMemo(
    () =>
      inSite
        .filter((c) => c.id.toLowerCase().includes(query.trim().toLowerCase()))
        .filter((c) => !onlyAlerts || c.detections > 0),
    [inSite, query, onlyAlerts],
  );
  const live = matching.filter((c) => c.online);
  const offline = matching.filter((c) => !c.online);
  const onlineCount = inSite.filter((c) => c.online).length;
  const withAlerts = inSite.filter((c) => c.detections > 0).length;

  // The newest pending critical event nobody has acknowledged yet.
  const waiting = events
    .filter((e) => e.status === "pending" && e.severity === "critical" && !acked.includes(e.id))
    .sort((a, b) => (b.day + b.time).localeCompare(a.day + a.time));
  const alert = waiting[0];

  // Bring a camera into view and ring it for a moment — the link between a detection and the wall.
  const focusCamera = (id: string) => {
    if (!CAMERAS.find((c) => c.id === id)) return;
    setSite(ALL_SITES);
    setQuery("");
    setOnlyAlerts(false);
    setHighlight(id);
  };
  useEffect(() => {
    if (!highlight) return;
    document.getElementById(`cam-tile-${highlight}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = window.setTimeout(() => setHighlight(null), 2500);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const columns = layout === "auto" ? "repeat(auto-fill, minmax(260px, 1fr))" : `repeat(${layout}, minmax(0, 1fr))`;
  const openDetections = (id: string) => {
    setCameraFilter(id);
    setPanelOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-default">Live Monitoring</h1>
          <p className="text-sm text-body">
            Real-time camera feeds across all sites — select cameras and scrub them back together while the feed keeps running.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-pressed={panelOpen}
          className={cn(
            "flex h-9 shrink-0 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
            panelOpen ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
          )}
        >
          <Icon name="panel-right" size={16} />
          Cameras &amp; Detections
          {pendingCritical > 0 && !panelOpen && (
            <span className="rounded-full bg-[rgb(var(--color-text-danger))] px-1.5 text-[11px] leading-5 text-invert-default">{pendingCritical}</span>
          )}
        </button>
      </div>

      {alert && (
        <AlertBanner
          event={alert}
          more={waiting.length - 1}
          onShowCamera={() => focusCamera(alert.camera)}
          onAcknowledge={() => setAcked((a) => [...a, alert.id])}
        />
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-invert-default bg-surface p-4">
        <Select options={[ALL_SITES, ...SITES]} value={site} onChange={setSite} wrapperClassName="w-[200px] shrink-0" />
        <Select
          options={LAYOUTS}
          value={layout}
          onChange={setLayout}
          prefixIcon={<Icon name="grid-2x2" size={18} />}
          wrapperClassName="w-[220px] shrink-0"
        />
        <div className="relative min-w-[200px] flex-1">
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${inSite.length} cameras...`}
            aria-label="Search cameras"
            className="h-10 w-full rounded-lg border border-invert-default bg-surface pl-10 pr-3 text-sm text-default placeholder:text-placeholder transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused"
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyAlerts((o) => !o)}
          aria-pressed={onlyAlerts}
          className={cn(
            "flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            onlyAlerts ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-surface text-default hover:bg-main-background",
          )}
        >
          <Icon name="triangle-alert" size={16} />
          With alerts ({withAlerts})
        </button>
      </div>

      <p className="text-sm text-body">
        <span className="font-semibold text-default">{site === ALL_SITES ? "All sites" : site}</span>
        {" · "}
        {inSite.length} cameras total · {onlineCount} online
        {inSite.length - onlineCount > 0 && <span className="text-danger"> · {inSite.length - onlineCount} offline</span>}
      </p>

      {selected.length > 0 && <GroupBar count={selected.length} onApply={applyToSelected} onClear={() => setSelected([])} />}

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-invert-default bg-surface p-4">
          {live.length > 0 && (
            <div className="grid gap-4" style={{ gridTemplateColumns: columns }}>
              {live.map((c) => (
                <CameraTile
                  key={c.id}
                  camera={c}
                  playback={playbackOf(c.id)}
                  onPlayback={(p) => patch(c.id, p)}
                  selected={selected.includes(c.id)}
                  onSelect={() => setSelected((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                  highlighted={highlight === c.id}
                  onOpenDetections={() => openDetections(c.id)}
                />
              ))}
            </div>
          )}

          {offline.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-body">Offline · {offline.length}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {offline.map((c) => (
                  <OfflineCard key={c.id} camera={c} onOpenDetections={() => openDetections(c.id)} />
                ))}
              </div>
            </div>
          )}

          {matching.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-body">No camera matches</p>
              <button
                type="button"
                className="mt-2 text-sm text-default underline hover:text-primary"
                onClick={() => {
                  setQuery("");
                  setOnlyAlerts(false);
                  setSite(ALL_SITES);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        {panelOpen && (
          <SidePanel
            cameras={inSite}
            cameraFilter={cameraFilter}
            onClearCameraFilter={() => setCameraFilter(null)}
            onFocusCamera={focusCamera}
          />
        )}
      </div>

    </div>
  );
}
