import { useState, useEffect } from "react";
import { DraggableFloating } from "./DraggableFloating";

// ── Keys ─────────────────────────────────────────────────────────────────────
const ZOOM_KEY      = "toms_zoom";
const NAV_KEY       = "toms_nav";
const VERSION_KEY   = "toms_version";
const STRUCTURE_KEY = "toms_structure";
const DESIGN_TOKENS_KEY = "toms_design_tokens";

export type NavVer       = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
export type AppVersion   = "beta" | "advance";
export type NavStructure = "default" | "super";

// ── Zoom ─────────────────────────────────────────────────────────────────────
const ZOOM_LEVELS = [
  { value: 1,    label: "1×",    desc: "Normal"      },
  { value: 1.25, label: "1.25×", desc: "Large"       },
  { value: 1.5,  label: "1.5×",  desc: "Larger"      },
  { value: 2,    label: "2×",    desc: "Extra Large"  },
] as const;
type ZoomValue = (typeof ZOOM_LEVELS)[number]["value"];

// ── Nav options ───────────────────────────────────────────────────────────────
const NAV_OPTIONS: { value: NavVer; label: string; color: string }[] = [
  { value: "v1", label: "Classic",    color: "bg-gray-400"                       },
  { value: "v2", label: "Dark",       color: "bg-[#1C1C2E]"                      },
  { value: "v3", label: "Brand Teal",  color: "bg-[#0f4f4b]"                      },
  { value: "v4", label: "Brand Navy", color: "bg-[#1A3A6B]"                      },
  { value: "v5", label: "Forest",     color: "bg-[#1E4A2E]"                      },
  { value: "v6", label: "Slate",      color: "bg-[#334155]"                      },
  { value: "v7", label: "Midnight",   color: "bg-[#0F172A]"                      },
  { value: "v8", label: "Light",      color: "bg-[#EAECF0] border border-gray-300" },
];

// ── Version options ───────────────────────────────────────────────────────────
const VERSION_OPTIONS: { value: AppVersion; label: string; desc: string }[] = [
  { value: "beta",    label: "Beta",    desc: "Current stable prototype"       },
  { value: "advance", label: "Advance", desc: "Expanded WPT / MST / TCT menus" },
];

// ── Navbar structure options ────────────────────────────────────────────────
const STRUCTURE_OPTIONS: { value: NavStructure; label: string; desc: string }[] = [
  { value: "default", label: "Default", desc: "Current single sidebar"               },
  { value: "super",   label: "Super",   desc: "Slack-style programme rail + sidebar" },
];

// ── Section divider ───────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function DevToolbar() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);

  const [zoom, setZoomState] = useState<ZoomValue>(() => {
    const saved = parseFloat(localStorage.getItem(ZOOM_KEY) ?? "1");
    return (ZOOM_LEVELS.find(z => z.value === saved)?.value ?? 1) as ZoomValue;
  });

  const [navVersion, setNavVersion] = useState<NavVer>(
    () => (localStorage.getItem(NAV_KEY) as NavVer) ?? "v2"
  );

  const [appVersion, setAppVersion] = useState<AppVersion>(
    () => (localStorage.getItem(VERSION_KEY) as AppVersion) ?? "beta"
  );

  const [structure, setStructureState] = useState<NavStructure>(
    () => (localStorage.getItem(STRUCTURE_KEY) as NavStructure) ?? "super"
  );

  const [designTokensOn, setDesignTokensOnState] = useState<boolean>(
    () => localStorage.getItem(DESIGN_TOKENS_KEY) === "on"
  );

  // ── Sync from external events ─────────────────────────────────────────────
  useEffect(() => {
    const h1 = () => setNavVersion((localStorage.getItem(NAV_KEY)       as NavVer)       ?? "v2");
    const h2 = () => setAppVersion((localStorage.getItem(VERSION_KEY)   as AppVersion)   ?? "beta");
    const h3 = () => setStructureState((localStorage.getItem(STRUCTURE_KEY) as NavStructure) ?? "super");
    window.addEventListener("toms_nav_change",       h1);
    window.addEventListener("toms_version_change",   h2);
    window.addEventListener("toms_structure_change", h3);
    return () => {
      window.removeEventListener("toms_nav_change",       h1);
      window.removeEventListener("toms_version_change",   h2);
      window.removeEventListener("toms_structure_change", h3);
    };
  }, []);

  // ── Apply zoom to document ────────────────────────────────────────────────
  useEffect(() => {
    (document.documentElement.style as unknown as Record<string, string>).zoom = String(zoom);
    localStorage.setItem(ZOOM_KEY, String(zoom));
  }, [zoom]);

  // ── Apply Design Tokens (Figma) switch to document ────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-design-tokens", designTokensOn ? "on" : "off");
    localStorage.setItem(DESIGN_TOKENS_KEY, designTokensOn ? "on" : "off");
  }, [designTokensOn]);

  // ── Click-outside to close ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("dev-toolbar-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Setters with persistence ──────────────────────────────────────────────
  const selectZoom = (v: ZoomValue) => { setZoomState(v); setOpen(false); };

  const selectNav = (v: NavVer) => {
    localStorage.setItem(NAV_KEY, v);
    window.dispatchEvent(new CustomEvent("toms_nav_change"));
    setNavVersion(v);
    setOpen(false);
  };

  const selectVersion = (v: AppVersion) => {
    localStorage.setItem(VERSION_KEY, v);
    window.dispatchEvent(new CustomEvent("toms_version_change"));
    setAppVersion(v);
    setOpen(false);
  };

  const selectStructure = (v: NavStructure) => {
    localStorage.setItem(STRUCTURE_KEY, v);
    window.dispatchEvent(new CustomEvent("toms_structure_change"));
    setStructureState(v);
    setOpen(false);
  };

  const toggleDesignTokens = () => setDesignTokensOnState((v) => !v);

  // ── Derived display values ────────────────────────────────────────────────
  const currentZoom    = ZOOM_LEVELS.find(z => z.value === zoom)!;
  const versionBadge   = appVersion === "advance" ? "ADV" : "BETA";
  // x: 304 — clear of the sidebar (56px rail + 232px panel). At x: 16 the pill sat on top of the
  // rail's Log out button at 1440×900 and swallowed its clicks.
  const defaultTop     = Math.max(16, (typeof window !== "undefined" ? window.innerHeight : 900) - 84);

  return (
    <DraggableFloating storageKey="toms_toolbar_position_v2" defaultPosition={{ x: 304, y: defaultTop }}>
      {/* Undo zoom so the toolbar always renders at 1× */}
      <div id="dev-toolbar-root" style={{ zoom: String(1 / zoom) }}>

        {/* ── Popup panel ─────────────────────────────────────────────────── */}
        {open && (
          <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-xl w-52 max-h-[80vh] overflow-y-auto overflow-x-hidden">

            {/* TEXT SIZE */}
            <SectionLabel label="Text Size" />
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => selectZoom(level.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                  zoom === level.value
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{level.desc}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  zoom === level.value ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500"
                }`}>{level.label}</span>
              </button>
            ))}

            {/* NAVBAR STRUCTURE */}
            <SectionLabel label="Navbar Structure" />
            {STRUCTURE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectStructure(opt.value)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  structure === opt.value
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                  structure === opt.value ? "border-brand-primary bg-brand-primary" : "border-gray-300"
                }`} />
                <div className="text-left">
                  <div className="leading-tight">{opt.label}</div>
                  <div className="text-[10px] font-normal text-gray-400 mt-0.5">{opt.desc}</div>
                </div>
                {structure === opt.value && (
                  <span className="ml-auto text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded font-bold self-start mt-0.5">ON</span>
                )}
              </button>
            ))}

            {/* SIDEBAR STYLE */}
            <SectionLabel label="Sidebar Style" />
            <div className="px-3 py-2.5">
              <div className="relative">
                <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                  <span className={`w-3 h-3 rounded flex-shrink-0 ${NAV_OPTIONS.find(o => o.value === navVersion)?.color ?? ""}`} />
                </div>
                <select
                  value={navVersion}
                  onChange={(e) => selectNav(e.target.value as NavVer)}
                  className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 appearance-none cursor-pointer focus:outline-none focus:border-brand-primary"
                >
                  {NAV_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* APP VERSION */}
            <SectionLabel label="App Version" />
            {VERSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectVersion(opt.value)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  appVersion === opt.value
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                  appVersion === opt.value ? "border-brand-primary bg-brand-primary" : "border-gray-300"
                }`} />
                <div className="text-left">
                  <div className="leading-tight">{opt.label}</div>
                  <div className="text-[10px] font-normal text-gray-400 mt-0.5">{opt.desc}</div>
                </div>
                {appVersion === opt.value && (
                  <span className="ml-auto text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded font-bold self-start mt-0.5">ON</span>
                )}
              </button>
            ))}

            {/* DESIGN TOKENS (FIGMA) */}
            <SectionLabel label="Design Tokens (Figma)" />
            <button
              onClick={toggleDesignTokens}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                designTokensOn
                  ? "bg-brand-primary/10 text-brand-primary font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                designTokensOn ? "border-brand-primary bg-brand-primary" : "border-gray-300"
              }`} />
              <div className="text-left">
                <div className="leading-tight">Use Figma tokens</div>
                <div className="text-[10px] font-normal text-gray-400 mt-0.5">Booking List 2.0 colors only (test)</div>
              </div>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold self-start mt-0.5 ${
                designTokensOn ? "bg-brand-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>{designTokensOn ? "ON" : "OFF"}</span>
            </button>
          </div>
        )}

        {/* ── Trigger button ───────────────────────────────────────────────── */}
        <button
          data-drag-handle="true"
          onClick={() => setOpen(v => !v)}
          title="Dev toolbar — drag to move"
          className={`cursor-move flex items-center gap-1 px-3 py-2 rounded-full shadow-md border text-sm font-semibold transition-all ${
            open
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
          }`}
        >
          {/* Zoom indicator */}
          <span className="text-base leading-none font-bold">A</span>
          <span className="text-xs">{currentZoom.label}</span>

          {/* Divider */}
          <span className={`mx-1 text-xs ${open ? "text-white/40" : "text-gray-300"}`}>|</span>

          {/* Nav style indicator */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <rect x="3" y="3" width="7" height="18" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="5" rx="1"/>
          </svg>
          <span className="text-xs uppercase">{structure === "super" ? "super" : navVersion}</span>

          {/* Version badge */}
          <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${
            open
              ? "bg-white/20 text-white"
              : appVersion === "advance"
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-500"
          }`}>{versionBadge}</span>
        </button>
      </div>
    </DraggableFloating>
  );
}
