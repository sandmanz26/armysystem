import { useState, useEffect } from "react";
import { DraggableFloating } from "./DraggableFloating";

const NAV_KEY     = "toms_nav";
const VERSION_KEY = "toms_version";

export type NavVer    = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7";
export type AppVersion = "beta" | "advance";

export function NavSwitcher() {
  const [current, setCurrent] = useState<NavVer>(
    () => (localStorage.getItem(NAV_KEY) as NavVer) ?? "v2"
  );
  const [appVersion, setAppVersion] = useState<AppVersion>(
    () => (localStorage.getItem(VERSION_KEY) as AppVersion) ?? "beta"
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h1 = () => setCurrent((localStorage.getItem(NAV_KEY) as NavVer) ?? "v2");
    const h2 = () => setAppVersion((localStorage.getItem(VERSION_KEY) as AppVersion) ?? "beta");
    window.addEventListener("toms_nav_change",     h1);
    window.addEventListener("toms_version_change", h2);
    return () => {
      window.removeEventListener("toms_nav_change",     h1);
      window.removeEventListener("toms_version_change", h2);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("nav-switcher-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectNav = (v: NavVer) => {
    localStorage.setItem(NAV_KEY, v);
    window.dispatchEvent(new CustomEvent("toms_nav_change"));
    setOpen(false);
  };

  const selectVersion = (v: AppVersion) => {
    localStorage.setItem(VERSION_KEY, v);
    window.dispatchEvent(new CustomEvent("toms_version_change"));
    setOpen(false);
  };

  const navOptions: { value: NavVer; label: string; color: string }[] = [
    { value: "v1", label: "Classic",    color: "bg-gray-400"    },
    { value: "v2", label: "Dark",       color: "bg-[#1C1C2E]"   },
    { value: "v3", label: "Brand Teal",  color: "bg-[#0f4f4b]"   },
    { value: "v4", label: "Brand Navy", color: "bg-[#1A3A6B]"   },
    { value: "v5", label: "Forest",     color: "bg-[#1E4A2E]"   },
    { value: "v6", label: "Slate",      color: "bg-[#334155]"   },
    { value: "v7", label: "Midnight",   color: "bg-[#0F172A]"   },
  ];

  const versionOptions: { value: AppVersion; label: string; desc: string }[] = [
    { value: "beta",    label: "Beta",    desc: "Current stable prototype"         },
    { value: "advance", label: "Advance", desc: "Expanded WPT / MST / TCT menus"   },
  ];

  const defaultTop = Math.max(16, (typeof window !== "undefined" ? window.innerHeight : 900) - 84);
  const versionLabel = appVersion === "advance" ? "ADV" : "BETA";

  return (
    <DraggableFloating storageKey="toms_nav_switcher_position" defaultPosition={{ x: 80, y: defaultTop }}>
      <div id="nav-switcher-root">
        {open && (
          <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-52">

            {/* Navbar Style */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navbar Style</p>
            </div>
            {navOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectNav(opt.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  current === opt.value
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 ${opt.color}`} />
                {opt.label}
                {current === opt.value && (
                  <span className="ml-auto text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded font-bold">ON</span>
                )}
              </button>
            ))}

            {/* App Version */}
            <div className="px-3 py-2 border-t border-gray-100 border-b">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">App Version</p>
            </div>
            {versionOptions.map((opt) => (
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
          </div>
        )}

        <button
          data-drag-handle="true"
          onClick={() => setOpen(v => !v)}
          title="Switch navbar / version (drag to move)"
          className={`cursor-move flex items-center gap-1.5 px-3 py-2 rounded-full shadow-md border text-sm font-semibold transition-all ${
            open
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="18" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="5" rx="1"/>
          </svg>
          <span className="text-xs uppercase">{current}</span>
          <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${
            appVersion === "advance"
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-500"
          }`}>{versionLabel}</span>
        </button>
      </div>
    </DraggableFloating>
  );
}
