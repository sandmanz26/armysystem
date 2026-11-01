import { useState, useEffect } from "react";
import { DraggableFloating } from "./DraggableFloating";

const ZOOM_LEVELS = [
  { value: 1,    label: "1×",     desc: "Normal" },
  { value: 1.25, label: "1.25×",  desc: "Large" },
  { value: 1.5,  label: "1.5×",   desc: "Larger" },
  { value: 2,    label: "2×",     desc: "Extra Large" },
] as const;

type ZoomValue = (typeof ZOOM_LEVELS)[number]["value"];
const ZOOM_KEY = "toms_zoom";

export function ZoomControl() {
  const [zoom, setZoom] = useState<ZoomValue>(() => {
    const saved = parseFloat(localStorage.getItem(ZOOM_KEY) ?? "1");
    return (ZOOM_LEVELS.find(z => z.value === saved)?.value ?? 1) as ZoomValue;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (document.documentElement.style as any).zoom = String(zoom);
    localStorage.setItem(ZOOM_KEY, String(zoom));
  }, [zoom]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("zoom-control-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = ZOOM_LEVELS.find(z => z.value === zoom)!;
  const defaultTop = Math.max(16, (typeof window !== "undefined" ? window.innerHeight : 900) - 84);

  return (
    <DraggableFloating storageKey="toms_zoom_position" defaultPosition={{ x: 16, y: defaultTop }}>
      <div id="zoom-control-root" style={{ zoom: String(1 / zoom) }}>
        {open && (
          <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-44">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text Size</p>
            </div>
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => { setZoom(level.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                  zoom === level.value
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{level.desc}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  zoom === level.value
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-500"
                }`}>{level.label}</span>
              </button>
            ))}
          </div>
        )}
        <button
          data-drag-handle="true"
          onClick={() => setOpen(v => !v)}
          title="Text size (drag to move)"
          className={`cursor-move flex items-center gap-1.5 px-3 py-2 rounded-full shadow-md border text-sm font-semibold transition-all ${
            open
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
          }`}
        >
          <span className="text-base leading-none font-bold">A</span>
          <span className="text-xs">{current.label}</span>
        </button>
      </div>
    </DraggableFloating>
  );
}
