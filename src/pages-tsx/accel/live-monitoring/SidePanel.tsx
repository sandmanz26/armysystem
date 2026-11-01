import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { SEVERITY_EDGE, SeverityChip } from "../shared";
import { useAccel } from "../store";
import type { Camera } from "./data";

type Tab = "cameras" | "detections";
const RANK = { critical: 0, medium: 1, low: 2 } as const;

/*
 * The "Cameras & Detections" side panel, now wired to the same events as the Detection Feed (it used
 * to carry its own separate list, so the two pages disagreed). Clicking a detection finds its camera
 * on the wall — the reason for having detections beside the video at all. The Cameras tab is still
 * ASSUMED (the screenshots never show it): the cameras in view with their state.
 */
export function SidePanel({
  cameras,
  cameraFilter,
  onClearCameraFilter,
  onFocusCamera,
}: {
  cameras: Camera[];
  cameraFilter: string | null;
  onClearCameraFilter: () => void;
  onFocusCamera: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("detections");
  const events = useAccel((s) => s.events);
  const open = events
    .filter((e) => e.status !== "dismissed" && (!cameraFilter || e.camera === cameraFilter))
    .sort((a, b) => RANK[a.severity] - RANK[b.severity] || (b.day + b.time).localeCompare(a.day + a.time));
  const critical = open.filter((e) => e.severity === "critical" && e.status === "pending").length;

  return (
    <aside className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border border-invert-default bg-surface">
      <div className="flex border-b border-invert-default" role="tablist">
        {(
          [
            { id: "cameras", label: "Cameras" },
            { id: "detections", label: "Detections" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px flex h-11 flex-1 items-center justify-center gap-2 border-b-2 text-sm font-medium transition-colors",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-body hover:text-default",
            )}
          >
            {t.id === "detections" && <Icon name="radar" size={16} />}
            {t.label}
            {t.id === "detections" && (
              <span className="rounded-full bg-warning-invert-default px-2 text-xs font-semibold text-warning">{open.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "detections" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 border-b border-invert-default p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-default">Live detections</span>
              <span className="text-sm text-body">
                <span className="font-semibold text-default">{open.length}</span> ·{" "}
                <span className={cn("font-semibold", critical ? "text-danger" : "text-body")}>{critical}</span> critical pending
              </span>
            </div>
            {cameraFilter ? (
              <button
                type="button"
                onClick={onClearCameraFilter}
                className="flex w-fit items-center gap-1.5 rounded-full border border-primary bg-primary-invert-soft px-3 py-0.5 text-xs font-semibold text-primary"
              >
                {cameraFilter}
                <Icon name="x" size={12} />
              </button>
            ) : (
              <p className="text-sm text-body">Critical first. Click one to find its camera on the wall.</p>
            )}
          </div>
          {open.length === 0 ? (
            <p className="p-6 text-center text-sm text-body">No open detections{cameraFilter ? ` on ${cameraFilter}` : ""}.</p>
          ) : (
            <ul className="flex flex-col gap-3 overflow-y-auto p-4">
              {open.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onFocusCamera(e.camera)}
                    className={cn(
                      "w-full rounded-lg border border-l-4 border-invert-default bg-surface p-4 text-left transition-colors hover:bg-main-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-invert-focused",
                      SEVERITY_EDGE[e.severity],
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <SeverityChip severity={e.severity} />
                      <span className="font-mono text-xs text-body">{e.time}</span>
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-default">{e.title}</span>
                    <span className="mt-1 block text-xs text-caption">
                      <span className="font-mono">{e.camera}</span> · {e.zone} · {e.site}
                      {e.status === "escalated" && " · escalated"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/accel/detection-feed"
            className="mt-auto flex items-center justify-center gap-1.5 border-t border-invert-default py-3 text-sm font-medium text-default hover:text-primary"
          >
            Triage in Detection Feed
            <Icon name="arrow-up-right" size={14} />
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-invert-default overflow-y-auto">
          {cameras.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onFocusCamera(c.id)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-main-background">
                <span className="flex flex-col">
                  <span className="font-mono text-sm text-default">{c.id}</span>
                  <span className="text-xs text-body">{c.site}</span>
                </span>
                <span className={cn("text-xs font-semibold", c.online ? "text-success" : "text-danger")}>{c.online ? "Online" : "Offline"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
