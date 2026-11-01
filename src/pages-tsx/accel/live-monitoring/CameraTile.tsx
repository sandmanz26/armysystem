import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/checkbox";
import { cn } from "@/lib/utils";
import { toneColor, severityTone } from "../shared";
import type { Camera } from "./data";
import { isLive, type Playback } from "./playback";

/*
 * One online camera tile. Redesigned after the first build:
 *  · "LIVE" is the normal state, so it is now a quiet dark chip with a green dot. It used to be a
 *    solid red chip on every tile — eight reds that shouted louder than an actual critical alert.
 *    A tile that is NOT live (paused / behind) is the exception, and now it is the one that stands out.
 *  · The detection badge is coloured by the worst open detection (red / amber / blue) and is a button
 *    (opens that camera's detections). It was one yellow circle with an unexplained number.
 *  · Controls show on hover AND on keyboard focus; before, they were unreachable without a mouse.
 *  · Playback state is owned by the page so a selection of cameras can be paused or rewound together.
 * No real video: the controls drive state only, and what they do to a live stream is ASSUMED.
 */

const SPEEDS = ["0.25", "0.5", "1", "1.5", "2", "4", "8"];

interface Props {
  camera: Camera;
  playback: Playback;
  onPlayback: (patch: Partial<Playback>) => void;
  selected: boolean;
  onSelect: () => void;
  highlighted: boolean;
  onOpenDetections: () => void;
}

export function CameraTile({ camera, playback, onPlayback, selected, onSelect, highlighted, onOpenDetections }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [speedOpen, setSpeedOpen] = useState(false);
  const live = isLive(playback);
  const { paused, behind, muted, speed } = playback;

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-md text-invert-default transition-colors hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40";
  const badge = camera.top ?? "low";

  return (
    <div
      ref={ref}
      id={`cam-tile-${camera.id}`}
      className={cn(
        "group relative aspect-video overflow-visible rounded-lg border bg-default-default transition-shadow",
        selected || highlighted ? "border-primary" : "border-invert-default hover:border-primary",
        highlighted && "ring-4 ring-primary-invert-focused",
      )}
      onMouseLeave={() => setSpeedOpen(false)}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <img src={camera.feed} alt={`${camera.id} feed${live ? ", live" : paused ? ", paused" : `, ${behind} seconds behind`}`} className={cn("h-full w-full object-cover", paused && "grayscale")} />
      </div>

      <span className="absolute left-3 top-3 flex items-center gap-2">
        <span className={cn("rounded bg-surface", selected ? "block" : "hidden group-focus-within:block group-hover:block")}>
          <Checkbox id={`cam-${camera.id}`} name={`cam-${camera.id}`} size={18} checked={selected} onChange={onSelect} />
        </span>
        {live ? (
          <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-invert-default">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor("success") }} />
            LIVE
          </span>
        ) : (
          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide text-default" style={{ background: toneColor("warning") }}>
            {paused ? "PAUSED" : `${behind}s BEHIND`}
          </span>
        )}
      </span>

      {camera.detections > 0 && (
        <button
          type="button"
          onClick={onOpenDetections}
          title={`${camera.detections} open detections · highest: ${badge}. Click to review`}
          aria-label={`${camera.detections} open detections on ${camera.id}, highest ${badge}`}
          className={cn(
            "absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-sm font-semibold text-invert-default transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            badge === "critical" && "animate-pulse motion-reduce:animate-none",
            badge === "medium" && "text-default",
          )}
          style={{ background: toneColor(severityTone(badge)) }}
        >
          {camera.detections}
        </button>
      )}

      <span className="absolute bottom-3 left-3 rounded-md bg-default-invert-default px-2 py-1 font-mono text-xs text-invert-default group-focus-within:hidden group-hover:hidden">
        {camera.id}
      </span>

      <div className="absolute inset-x-0 bottom-0 hidden rounded-b-lg bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 group-focus-within:block group-hover:block">
        <div className="mb-2 h-1 rounded-full bg-white/30">
          <div className="h-full rounded-full" style={{ width: `${Math.max(4, 100 - behind)}%`, background: toneColor("danger") }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button type="button" className={btn} title="Back 10s" aria-label="Back 10 seconds" onClick={() => onPlayback({ behind: behind + 10 })}>
              <Icon name="rotate-ccw" size={16} />
            </button>
            <button type="button" className={btn} title={paused ? "Play" : "Pause"} aria-label={paused ? "Play" : "Pause"} onClick={() => onPlayback({ paused: !paused })}>
              <Icon name={paused ? "play" : "pause"} size={16} />
            </button>
            <button type="button" className={btn} title="Forward 10s" aria-label="Forward 10 seconds" disabled={behind === 0} onClick={() => onPlayback({ behind: Math.max(0, behind - 10) })}>
              <Icon name="rotate-cw" size={16} />
            </button>
            <button type="button" className={btn} title={muted ? "Unmute" : "Mute"} aria-label={muted ? "Unmute" : "Mute"} onClick={() => onPlayback({ muted: !muted })}>
              <Icon name={muted ? "volume-x" : "volume-2"} size={16} />
            </button>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onPlayback({ paused: false, behind: 0 })}
              disabled={live}
              className="flex items-center gap-1.5 rounded px-1 font-mono text-xs text-invert-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default"
              title={live ? "Watching live" : "Jump back to live"}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: live ? toneColor("success") : "rgb(var(--color-text-disabled))" }} />
              {live ? "LIVE" : "GO LIVE"}
            </button>
            <button type="button" className={btn} title="Fullscreen" aria-label="Fullscreen" onClick={() => ref.current?.requestFullscreen?.()}>
              <Icon name="maximize" size={16} />
            </button>
            <button type="button" className={cn(btn, speedOpen && "bg-black/40")} title="Playback speed" aria-label="Playback speed" aria-expanded={speedOpen} onClick={() => setSpeedOpen((o) => !o)}>
              <Icon name="settings" size={16} />
            </button>
          </div>
        </div>

        {speedOpen && (
          <div className="absolute bottom-full right-0 z-10 mb-2 w-[300px] rounded-lg border border-invert-default bg-surface p-4 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-body">Playback speed</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPlayback({ speed: s })}
                  aria-pressed={speed === s}
                  className={cn(
                    "h-8 rounded-md border px-3 font-mono text-sm transition-colors",
                    speed === s ? "border-primary bg-primary-invert-soft text-primary" : "border-invert-default bg-surface text-default hover:bg-main-background",
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Offline cameras do not deserve a full 16:9 slot of prime screen — a third of the wall was empty
 * dark squares. They are a compact row with the facts you need: since when, and what is still open. */
export function OfflineCard({ camera, onOpenDetections }: { camera: Camera; onOpenDetections: () => void }) {
  const badge = camera.top ?? "low";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-invert-default bg-main-background px-4 py-3">
      <Icon name="video-off" size={20} className="shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm text-default">{camera.id}</p>
        <p className="truncate text-xs text-body">
          Offline since {camera.lastSeen} · {camera.site}
        </p>
      </div>
      {camera.detections > 0 && (
        <button
          type="button"
          onClick={onOpenDetections}
          title={`${camera.detections} open detections from before it went offline`}
          className={cn("flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-sm font-semibold text-invert-default", badge === "medium" && "text-default")}
          style={{ background: toneColor(severityTone(badge)) }}
        >
          {camera.detections}
        </button>
      )}
    </div>
  );
}
