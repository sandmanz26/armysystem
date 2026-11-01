// ─────────────────────────────────────────────────────────────────────────
// Annotation Tool — one self-contained, portable review tool.
//
// Drop this ONE file into any React project and mount <AnnotationTool /> once
// near the root. No dependencies beyond React, no app-specific imports.
//
//  - A floating, draggable toolbar (position is remembered).
//  - "Add" mode: hover to see which element you are about to mark, click to
//    drop a numbered pin and type a message.
//  - Pins are anchored to the ELEMENT you clicked (a CSS path + the click's
//    position inside it), not to the screen — so they follow the page when it
//    scrolls (including scrolling inside panels and tables) and are hidden
//    while their element is scrolled out of view.
//  - A list of every annotation. Clicking one scrolls to it and pulses the pin;
//    if it lives on another page it navigates there first.
//  - Export / Import as a plain .txt file: readable on top, a JSON block at the
//    bottom. Importing only ever reads text fields, never runs anything.
//  - Delete all (two clicks).
//
// Storage — shared online (Supabase REST, table `annotations`, SQL in
// docs/annotations-supabase.sql) so every user sees the same annotations, with a
// localStorage copy ("annotation-tool:v1") as cache and as the fallback when the server
// can't be reached. Anything made offline is pushed on the next successful sync.
// Config: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, defaulting to the QA tracker's project.
// Messages are always rendered as text, never as HTML.
// ─────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

// ── Types ─────────────────────────────────────────────────────────────────

interface Annotation {
  id:        string;
  n:         number;   // running number, never reused
  path:      string;   // location.pathname the pin belongs to
  selector:  string;   // CSS path of the anchor element
  ox:        number;   // click position inside the element, 0..1
  oy:        number;
  text:      string;
  author:    string;
  createdAt: string;   // ISO
}

interface PinPos { x: number; y: number; visible: boolean }

interface Draft { selector: string; ox: number; oy: number; text: string }

const STORE_KEY   = "annotation-tool:v1";
const TOOLBAR_KEY = "annotation-tool:toolbar";
const PENDING_KEY = "annotation-tool:pending";
const AUTHOR_KEY  = "annotation-tool:author";
const DATA_MARK   = "=== DATA — do not edit below this line ===";
const UI_ATTR     = "data-ann-ui";
const MAX_TEXT    = 2000;

// ── Storage ───────────────────────────────────────────────────────────────

interface Store { nextN: number; items: Annotation[] }

function isAnnotation(v: unknown): v is Annotation {
  if (!v || typeof v !== "object") return false;
  const a = v as Record<string, unknown>;
  return typeof a.id === "string" && typeof a.n === "number" && typeof a.path === "string"
    && typeof a.selector === "string" && typeof a.ox === "number" && typeof a.oy === "number"
    && typeof a.text === "string" && typeof a.author === "string" && typeof a.createdAt === "string";
}

function clean(a: Annotation): Annotation {
  return {
    id: a.id.slice(0, 64), n: Math.max(1, Math.floor(a.n)), path: a.path.slice(0, 300),
    selector: a.selector.slice(0, 1000),
    ox: Math.min(1, Math.max(0, a.ox)), oy: Math.min(1, Math.max(0, a.oy)),
    text: a.text.slice(0, MAX_TEXT), author: a.author.slice(0, 80), createdAt: a.createdAt.slice(0, 40),
  };
}

function loadStore(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
    if (raw && Array.isArray(raw.items)) {
      const items = (raw.items as unknown[]).filter(isAnnotation).map(clean);
      return { nextN: Math.max(Number(raw.nextN) || 1, ...items.map(i => i.n + 1), 1), items };
    }
  } catch { /* ignore */ }
  return { nextN: 1, items: [] };
}

function saveStore(s: Store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── Element anchoring ─────────────────────────────────────────────────────

const inUI = (el: Element | null) => !!el?.closest(`[${UI_ATTR}]`);

/** A CSS path that survives reloads: nearest unique #id, else tag:nth-of-type down from <body>. */
function selectorFor(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    if (cur.id && document.querySelectorAll(`#${CSS.escape(cur.id)}`).length === 1) {
      parts.unshift(`#${CSS.escape(cur.id)}`);
      return parts.join(" > ");
    }
    const parent: Element | null = cur.parentElement;
    const tag = cur.tagName.toLowerCase();
    if (!parent) { parts.unshift(tag); break; }
    const same = Array.from(parent.children).filter(c => c.tagName === cur!.tagName);
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(cur) + 1})` : tag);
    cur = parent;
  }
  return `body > ${parts.join(" > ")}`;
}

function findEl(selector: string): Element | null {
  try { return document.querySelector(selector); } catch { return null; }
}

/** Is the point (x, y) actually showing, i.e. not clipped by a scrolling/hidden ancestor? */
function pointVisible(el: Element, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
  let p = el.parentElement;
  while (p && p !== document.body) {
    const cs = getComputedStyle(p);
    if (/(auto|scroll|hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
      const r = p.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
    }
    p = p.parentElement;
  }
  return true;
}

function posFor(a: { selector: string; ox: number; oy: number }): PinPos {
  const el = findEl(a.selector);
  if (!el) return { x: 0, y: 0, visible: false };
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return { x: 0, y: 0, visible: false };
  const x = r.left + a.ox * r.width;
  const y = r.top + a.oy * r.height;
  return { x, y, visible: pointVisible(el, x, y) };
}

// ── Text export / import ──────────────────────────────────────────────────

function toTxt(items: Annotation[]): string {
  const lines = [
    "ANNOTATIONS",
    `Exported: ${new Date().toLocaleString()}`,
    `Site: ${location.origin}`,
    `Total: ${items.length}`,
    "",
  ];
  [...items].sort((a, b) => a.n - b.n).forEach(a => {
    lines.push("----------------------------------------");
    lines.push(`#${a.n}   ${a.path}`);
    if (a.author) lines.push(`By: ${a.author}`);
    lines.push(`On: ${new Date(a.createdAt).toLocaleString()}`);
    lines.push("");
    lines.push(a.text);
    lines.push("");
  });
  lines.push("----------------------------------------", DATA_MARK);
  lines.push(JSON.stringify({ app: "annotation-tool", version: 1, items }));
  return lines.join("\n");
}

function fromTxt(txt: string): Annotation[] | null {
  const i = txt.indexOf(DATA_MARK);
  if (i < 0) return null;
  try {
    const data = JSON.parse(txt.slice(i + DATA_MARK.length).trim());
    if (!data || data.app !== "annotation-tool" || !Array.isArray(data.items)) return null;
    return (data.items as unknown[]).filter(isAnnotation).map(clean);
  } catch {
    return null;
  }
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const uid = () => `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// ── Shared storage (Supabase REST) ────────────────────────────────────────
// The anon key is meant to be public (it ships to every browser); what protects the data is the
// table's row-level-security policy, not the key.

const ENV = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const SB_URL = (ENV.VITE_SUPABASE_URL ?? "https://ubkqfhhdfesltgdgxvho.supabase.co").replace(/\/$/, "");
const SB_KEY = ENV.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVia3FmaGhkZmVzbHRnZGd4dmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNzUyMjksImV4cCI6MjA5Nzg1MTIyOX0.v8-7ADw2yOWRUkbOi3l9FToxdofPUv9hV_Q_p1dZIYE";
const REMOTE = !!(SB_URL && SB_KEY);
const PUSH_KEY = "annotation-tool:unsynced";
const POLL_MS = 8000;

async function sb(path: string, init: RequestInit & { prefer?: string } = {}): Promise<unknown> {
  const { prefer, ...rest } = init;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.status === 204 ? null : res.json();
}

interface Row { id: string; n: number; path: string; selector: string; ox: number; oy: number; text: string; author: string; created_at: string }
const fromRow = (r: Row): Annotation => clean({
  id: r.id, n: r.n, path: r.path, selector: r.selector, ox: r.ox, oy: r.oy, text: r.text, author: r.author ?? "", createdAt: r.created_at,
});
/** `n` is assigned by the database, so it is never sent. */
const toRow = (a: Annotation) => ({
  id: a.id, path: a.path, selector: a.selector, ox: a.ox, oy: a.oy, text: a.text, author: a.author, created_at: a.createdAt,
});

const loadUnsynced = (): string[] => { try { return JSON.parse(localStorage.getItem(PUSH_KEY) ?? "[]"); } catch { return []; } };
const saveUnsynced = (ids: string[]) => { try { localStorage.setItem(PUSH_KEY, JSON.stringify(ids)); } catch { /* ignore */ } };


// ── Styles (injected once, everything prefixed `ann-`) ────────────────────

const TOOL_CSS = `
.ann-root, .ann-root * { box-sizing: border-box; font-family: inherit; }
.ann-bar { position: fixed; z-index: 99990; display: flex; align-items: center; gap: 2px; padding: 4px;
  background: #1f2430; color: #fff; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.28); user-select: none; touch-action: none; }
.ann-grip { width: 18px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: grab; opacity: .55; }
.ann-grip:active { cursor: grabbing; }
.ann-btn { position: relative; width: 34px; height: 34px; border: 0; border-radius: 8px; background: transparent; color: inherit;
  display: flex; align-items: center; justify-content: center; cursor: pointer; }
.ann-btn:hover { background: rgba(255,255,255,.12); }
.ann-btn[data-on="true"] { background: #f59e0b; color: #1f2430; }
.ann-badge { position: absolute; top: 1px; right: 0; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ann-panel { position: absolute; width: 340px; max-height: 70vh; display: flex; flex-direction: column; background: #fff; color: #1f2430;
  border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.22); overflow: hidden; user-select: text; }
.ann-ph { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #eef0f3; font-size: 13px; font-weight: 700; }
.ann-author { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 8px; font-size: 12px; margin: 8px 12px 0; width: calc(100% - 24px); }
.ann-status { padding: 6px 12px 0; font-size: 11px; font-weight: 600; color: #8b93a1; }
.ann-status[data-s="ok"] { color: #15803d; }
.ann-status[data-s="offline"] { color: #b45309; }
.ann-list { overflow: auto; padding: 6px; flex: 1; min-height: 60px; }
.ann-empty { padding: 24px 12px; text-align: center; font-size: 12px; color: #8b93a1; }
.ann-item { display: flex; gap: 8px; align-items: flex-start; width: 100%; text-align: left; border: 0; background: transparent; padding: 8px; border-radius: 8px; cursor: pointer; color: inherit; }
.ann-item:hover { background: #f4f5f7; }
.ann-num { flex: none; width: 22px; height: 22px; border-radius: 50%; background: #f59e0b; color: #1f2430; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ann-item-main { flex: 1; min-width: 0; }
.ann-item-path { font-size: 10px; color: #8b93a1; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ann-item-text { font-size: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; word-break: break-word; }
.ann-x { flex: none; border: 0; background: transparent; color: #8b93a1; cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 14px; line-height: 1; }
.ann-x:hover { color: #ef4444; background: #fee2e2; }
.ann-foot { display: flex; gap: 6px; padding: 8px 12px; border-top: 1px solid #eef0f3; }
.ann-fbtn { flex: 1; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 7px 4px; font-size: 12px; font-weight: 600; cursor: pointer; color: #1f2430; }
.ann-fbtn:hover { background: #f4f5f7; }
.ann-fbtn[data-danger="true"] { color: #b91c1c; border-color: #fecaca; }
.ann-fbtn[data-danger="true"]:hover { background: #fee2e2; }
.ann-fbtn[data-armed="true"] { background: #dc2626; color: #fff; border-color: #dc2626; }
.ann-fbtn:disabled { opacity: .45; cursor: default; }
.ann-msg { margin: 0 12px 8px; padding: 6px 8px; font-size: 11px; border-radius: 6px; background: #fef3c7; color: #78350f; }
.ann-layer { position: fixed; inset: 0; z-index: 99985; pointer-events: none; }
.ann-pin { position: absolute; width: 26px; height: 26px; margin: -26px 0 0 -13px; border-radius: 13px 13px 13px 2px; background: #f59e0b; color: #1f2430;
  border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.35); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  cursor: pointer; pointer-events: auto; transform-origin: 13px 26px; }
.ann-pin[data-draft="true"] { background: #fff; border-color: #f59e0b; }
.ann-pin[data-pulse="true"] { animation: ann-pulse 0.7s ease-in-out 3; }
@keyframes ann-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.5); } }
.ann-hover { position: fixed; z-index: 99984; pointer-events: none; border: 2px solid #f59e0b; background: rgba(245,158,11,.12); border-radius: 3px; }
.ann-pop { position: fixed; z-index: 99991; width: 280px; background: #fff; color: #1f2430; border: 1px solid #e5e7eb; border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,.22); padding: 10px; user-select: text; }
.ann-ta { width: 100%; min-height: 84px; resize: vertical; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; font-size: 13px; line-height: 1.4; outline: none; }
.ann-ta:focus { border-color: #f59e0b; }
.ann-pop-row { display: flex; gap: 6px; justify-content: flex-end; margin-top: 8px; }
.ann-pbtn { border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; color: #1f2430; }
.ann-pbtn[data-primary="true"] { background: #1f2430; color: #fff; border-color: #1f2430; }
.ann-pbtn[data-danger="true"] { color: #b91c1c; border-color: #fecaca; }
.ann-pbtn:disabled { opacity: .45; cursor: default; }
.ann-meta { font-size: 10px; color: #8b93a1; margin-bottom: 6px; }
.ann-body { font-size: 13px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
body.ann-adding, body.ann-adding * { cursor: crosshair !important; }
`;

// ── Icons ─────────────────────────────────────────────────────────────────

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const PinIcon  = () => <Icon><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Icon>;
const ListIcon = () => <Icon><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Icon>;
const EyeIcon  = ({ off }: { off?: boolean }) => (
  <Icon>{off ? <><path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2" /><path d="M1 1l22 22" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}</Icon>
);

// ── Component ─────────────────────────────────────────────────────────────

export function AnnotationTool() {
  const [store, setStore]       = useState<Store>(loadStore);
  const [adding, setAdding]     = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [panelOpen, setPanel]   = useState(false);
  const [draft, setDraft]       = useState<Draft | null>(null);
  const [openId, setOpenId]     = useState<string | null>(null);
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState("");
  const [pulseId, setPulseId]   = useState<string | null>(null);
  const [path, setPath]         = useState(location.pathname);
  const [positions, setPos]     = useState<Record<string, PinPos>>({});
  const [hoverBox, setHoverBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [armed, setArmed]       = useState(false);
  const [sync, setSync]         = useState<"local" | "ok" | "offline">(REMOTE ? "offline" : "local");
  const [note, setNote]         = useState("");
  const [author, setAuthor]     = useState(() => { try { return localStorage.getItem(AUTHOR_KEY) ?? ""; } catch { return ""; } });
  const [bar, setBar]           = useState<{ x: number; y: number }>(() => {
    try {
      const p = JSON.parse(localStorage.getItem(TOOLBAR_KEY) ?? "null");
      if (p && typeof p.x === "number" && typeof p.y === "number") return p;
    } catch { /* ignore */ }
    return { x: Math.max(8, window.innerWidth - 190), y: Math.max(8, window.innerHeight - 100) };
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const barRef  = useRef<HTMLDivElement>(null);

  // one-time style injection
  useLayoutEffect(() => {
    const el = document.createElement("style");
    el.setAttribute(UI_ATTR, "");
    el.textContent = TOOL_CSS;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);

  useEffect(() => { saveStore(store); }, [store]);
  useEffect(() => { try { localStorage.setItem(AUTHOR_KEY, author); } catch { /* ignore */ } }, [author]);
  useEffect(() => { document.body.classList.toggle("ann-adding", adding); return () => document.body.classList.remove("ann-adding"); }, [adding]);

  const here = useMemo(() => store.items.filter(a => a.path === path), [store.items, path]);

  // ── follow the page: re-read every anchor's screen position each frame ──
  const hereRef  = useRef(here);  hereRef.current = here;
  const draftRef = useRef(draft); draftRef.current = draft;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (location.pathname !== path) setPath(location.pathname);
      const next: Record<string, PinPos> = {};
      for (const a of hereRef.current) next[a.id] = posFor(a);
      if (draftRef.current) next.draft = posFor(draftRef.current);
      setPos(prev => {
        const keys = Object.keys(next);
        if (keys.length === Object.keys(prev).length && keys.every(k => {
          const p = prev[k], n = next[k];
          return p && p.visible === n.visible && Math.abs(p.x - n.x) < 0.5 && Math.abs(p.y - n.y) < 0.5;
        })) return prev;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [path]);

  // ── jump to an annotation ──────────────────────────────────────────────
  const focusAnnotation = useCallback((a: Annotation) => {
    const el = findEl(a.selector);
    if (el) el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    setPulseId(a.id);
    setOpenId(a.id);
    setTimeout(() => setPulseId(p => (p === a.id ? null : p)), 2300);
  }, []);

  const goTo = (a: Annotation) => {
    if (a.path === location.pathname) { focusAnnotation(a); return; }
    try { sessionStorage.setItem(PENDING_KEY, a.id); } catch { /* ignore */ }
    location.assign(a.path);
  };

  // arrived from another page: wait for the anchor to render, then focus it
  useEffect(() => {
    let id: string | null = null;
    try { id = sessionStorage.getItem(PENDING_KEY); } catch { /* ignore */ }
    if (!id) return;
    const target = loadStore().items.find(a => a.id === id);
    try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
    if (!target) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (findEl(target.selector) || tries > 40) { clearInterval(timer); focusAnnotation(target); }
    }, 150);
    return () => clearInterval(timer);
  }, [focusAnnotation]);

  // ── add mode: hover highlight + click to place ─────────────────────────
  useEffect(() => {
    if (!adding) { setHoverBox(null); return; }
    const targetAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      return el && !inUI(el) && el !== document.documentElement ? el : null;
    };
    const onMove = (e: PointerEvent) => {
      const el = targetAt(e.clientX, e.clientY);
      if (!el) { setHoverBox(null); return; }
      const r = el.getBoundingClientRect();
      setHoverBox({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    const swallow = (e: Event) => {
      if (inUI(e.target as Element)) return;
      e.preventDefault(); e.stopPropagation();
    };
    const onClick = (e: MouseEvent) => {
      if (inUI(e.target as Element)) return;
      e.preventDefault(); e.stopPropagation();
      const el = targetAt(e.clientX, e.clientY);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setOpenId(null);
      setDraft({
        selector: selectorFor(el),
        ox: r.width ? (e.clientX - r.left) / r.width : 0.5,
        oy: r.height ? (e.clientY - r.top) / r.height : 0.5,
        text: "",
      });
      setAdding(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAdding(false); };
    document.addEventListener("pointermove", onMove, true);
    for (const t of ["pointerdown", "mousedown", "mouseup", "pointerup"]) document.addEventListener(t, swallow, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      for (const t of ["pointerdown", "mousedown", "mouseup", "pointerup"]) document.removeEventListener(t, swallow, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [adding]);

  // ── shared storage: pull everything, push what was made offline ────────
  const storeRef = useRef(store); storeRef.current = store;
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(""), 3500); };

  const refresh = useCallback(async () => {
    if (!REMOTE) return;
    try {
      const pending = loadUnsynced();
      if (pending.length > 0) {
        const mine = storeRef.current.items.filter(a => pending.includes(a.id));
        if (mine.length > 0) await sb("annotations?on_conflict=id", { method: "POST", prefer: "resolution=merge-duplicates", body: JSON.stringify(mine.map(toRow)) });
        saveUnsynced([]);
      }
      const rows = (await sb("annotations?select=*&order=n.asc")) as Row[];
      const items = rows.map(fromRow);
      setStore(s => ({ nextN: Math.max(s.nextN, ...items.map(i => i.n + 1), 1), items }));
      setSync("ok");
    } catch {
      setSync("offline");
    }
  }, []);

  useEffect(() => {
    if (!REMOTE) return;
    void refresh();
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, POLL_MS);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onVisible); };
  }, [refresh]);

  const markUnsynced = (id: string) => { saveUnsynced([...new Set([...loadUnsynced(), id])]); setSync("offline"); };

  // ── mutations ──────────────────────────────────────────────────────────
  const saveDraft = () => {
    if (!draft || !draft.text.trim()) return;
    const a: Annotation = {
      id: uid(), n: storeRef.current.nextN, path: location.pathname, selector: draft.selector, ox: draft.ox, oy: draft.oy,
      text: draft.text.trim().slice(0, MAX_TEXT), author: author.trim(), createdAt: new Date().toISOString(),
    };
    setStore(s => ({ nextN: s.nextN + 1, items: [...s.items, a] }));
    setDraft(null);
    if (!REMOTE) return;
    sb("annotations", { method: "POST", prefer: "return=representation", body: JSON.stringify(toRow(a)) })
      .then(r => {
        const saved = (r as Row[])[0];
        if (saved) setStore(s => ({ ...s, items: s.items.map(x => (x.id === a.id ? fromRow(saved) : x)) }));
        setSync("ok");
      })
      .catch(() => { markUnsynced(a.id); flash("Server not reachable — saved on this browser, will sync later."); });
  };
  const removeOne = (id: string) => {
    setStore(s => ({ ...s, items: s.items.filter(a => a.id !== id) }));
    setOpenId(o => (o === id ? null : o));
    if (!REMOTE) return;
    sb(`annotations?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" })
      .then(() => setSync("ok"))
      .catch(() => { setSync("offline"); flash("Couldn't delete on the server — it may reappear."); });
  };
  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    const text = editText.trim().slice(0, MAX_TEXT);
    setStore(s => ({ ...s, items: s.items.map(a => (a.id === id ? { ...a, text } : a)) }));
    setEditing(false);
    if (!REMOTE) return;
    sb(`annotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ text, updated_at: new Date().toISOString() }) })
      .then(() => setSync("ok"))
      .catch(() => { markUnsynced(id); flash("Server not reachable — edit kept on this browser, will sync later."); });
  };
  const deleteAll = () => {
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
    setStore(s => ({ ...s, items: [] }));
    setOpenId(null); setDraft(null); setArmed(false);
    if (!REMOTE) return;
    sb("annotations?id=not.is.null", { method: "DELETE" })
      .then(() => setSync("ok"))
      .catch(() => { setSync("offline"); flash("Couldn't clear the server — annotations may reappear."); });
  };

  const doExport = () => {
    if (store.items.length === 0) return;
    const d = new Date(), p = (n: number) => String(n).padStart(2, "0");
    download(`annotations-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.txt`, toTxt(store.items));
  };
  const doImport = async (file: File) => {
    const items = fromTxt(await file.text());
    if (!items) { flash("That file is not an annotation export."); return; }
    let added = 0;
    setStore(s => {
      const have = new Set(s.items.map(i => i.id));
      const fresh = items.filter(i => !have.has(i.id));
      added = fresh.length;
      const nextN = Math.max(s.nextN, ...fresh.map(i => i.n + 1));
      return { nextN, items: [...s.items, ...fresh] };
    });
    if (REMOTE && items.length > 0) {
      sb("annotations?on_conflict=id", { method: "POST", prefer: "resolution=ignore-duplicates", body: JSON.stringify(items.map(toRow)) })
        .then(() => refresh())
        .catch(() => { saveUnsynced([...new Set([...loadUnsynced(), ...items.map(i => i.id)])]); setSync("offline"); });
    }
    setTimeout(() => flash(added > 0 ? `Imported ${added} annotation${added > 1 ? "s" : ""}.` : "Nothing new — all of them were already here."), 0);
  };

  // ── draggable toolbar ──────────────────────────────────────────────────
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const clampBar = useCallback((x: number, y: number) => {
    const w = barRef.current?.offsetWidth ?? 170, h = barRef.current?.offsetHeight ?? 44;
    return { x: Math.min(Math.max(4, x), window.innerWidth - w - 4), y: Math.min(Math.max(4, y), window.innerHeight - h - 4) };
  }, []);
  const onGripDown = (e: ReactPointerEvent) => {
    drag.current = { dx: e.clientX - bar.x, dy: e.clientY - bar.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onGripMove = (e: ReactPointerEvent) => { if (drag.current) setBar(clampBar(e.clientX - drag.current.dx, e.clientY - drag.current.dy)); };
  const onGripUp = () => {
    if (!drag.current) return;
    drag.current = null;
    try { localStorage.setItem(TOOLBAR_KEY, JSON.stringify(bar)); } catch { /* ignore */ }
  };
  useEffect(() => {
    const onResize = () => setBar(b => clampBar(b.x, b.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampBar]);

  // ── popover placement (flip near screen edges) ─────────────────────────
  const popStyle = (p: PinPos): CSSProperties => {
    const left = Math.min(Math.max(8, p.x - 140), window.innerWidth - 288);
    const below = p.y < window.innerHeight / 2;
    return below ? { left, top: Math.min(p.y + 12, window.innerHeight - 180) } : { left, bottom: Math.max(8, window.innerHeight - p.y + 34) };
  };

  const open = openId ? store.items.find(a => a.id === openId) ?? null : null;
  const openPos = open ? positions[open.id] : undefined;
  const draftPos = draft ? positions.draft : undefined;

  const panelStyle: CSSProperties = {
    [bar.y > window.innerHeight / 2 ? "bottom" : "top"]: "calc(100% + 8px)",
    [bar.x > window.innerWidth / 2 ? "right" : "left"]: 0,
  };

  return createPortal(
    <div className="ann-root" {...{ [UI_ATTR]: "" }}>
      {/* pins */}
      {showPins && (
        <div className="ann-layer" {...{ [UI_ATTR]: "" }}>
          {here.map(a => {
            const p = positions[a.id];
            if (!p?.visible) return null;
            return (
              <div
                key={a.id} className="ann-pin" data-pulse={pulseId === a.id} title={a.text}
                style={{ left: p.x, top: p.y }}
                onClick={() => { setOpenId(o => (o === a.id ? null : a.id)); setEditing(false); setDraft(null); }}
              >{a.n}</div>
            );
          })}
          {draft && draftPos?.visible && <div className="ann-pin" data-draft="true" style={{ left: draftPos.x, top: draftPos.y }}>+</div>}
        </div>
      )}

      {adding && hoverBox && <div className="ann-hover" style={{ left: hoverBox.x, top: hoverBox.y, width: hoverBox.w, height: hoverBox.h }} />}

      {/* composer for a new annotation */}
      {draft && draftPos?.visible && (
        <div className="ann-pop" style={popStyle(draftPos)}>
          <textarea
            className="ann-ta" autoFocus placeholder="What should change here?" maxLength={MAX_TEXT}
            value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveDraft(); if (e.key === "Escape") setDraft(null); }}
          />
          <div className="ann-pop-row">
            <button className="ann-pbtn" onClick={() => setDraft(null)}>Cancel</button>
            <button className="ann-pbtn" data-primary="true" disabled={!draft.text.trim()} onClick={saveDraft}>Save</button>
          </div>
        </div>
      )}

      {/* an existing annotation */}
      {open && openPos?.visible && !draft && (
        <div className="ann-pop" style={popStyle(openPos)}>
          <div className="ann-meta">#{open.n}{open.author ? ` · ${open.author}` : ""} · {new Date(open.createdAt).toLocaleString()}</div>
          {editing ? (
            <>
              <textarea className="ann-ta" autoFocus maxLength={MAX_TEXT} value={editText} onChange={e => setEditText(e.target.value)} />
              <div className="ann-pop-row">
                <button className="ann-pbtn" onClick={() => setEditing(false)}>Cancel</button>
                <button className="ann-pbtn" data-primary="true" disabled={!editText.trim()} onClick={() => saveEdit(open.id)}>Save</button>
              </div>
            </>
          ) : (
            <>
              <div className="ann-body">{open.text}</div>
              <div className="ann-pop-row">
                <button className="ann-pbtn" data-danger="true" onClick={() => removeOne(open.id)}>Delete</button>
                <button className="ann-pbtn" onClick={() => { setEditText(open.text); setEditing(true); }}>Edit</button>
                <button className="ann-pbtn" data-primary="true" onClick={() => setOpenId(null)}>Close</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* floating toolbar */}
      <div ref={barRef} className="ann-bar" style={{ left: bar.x, top: bar.y }}>
        <div className="ann-grip" title="Drag to move" onPointerDown={onGripDown} onPointerMove={onGripMove} onPointerUp={onGripUp} onPointerCancel={onGripUp}>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><circle cx="2" cy="3" r="1.3" /><circle cx="8" cy="3" r="1.3" /><circle cx="2" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="2" cy="13" r="1.3" /><circle cx="8" cy="13" r="1.3" /></svg>
        </div>
        <button className="ann-btn" data-on={adding} title={adding ? "Cancel (Esc)" : "Add annotation — then click anything on the page"}
          onClick={() => { setAdding(a => !a); setDraft(null); setOpenId(null); }}><PinIcon /></button>
        <button className="ann-btn" data-on={panelOpen} title="Annotation list" onClick={() => setPanel(o => !o)}>
          <ListIcon />{store.items.length > 0 && <span className="ann-badge">{store.items.length}</span>}
        </button>
        <button className="ann-btn" title={showPins ? "Hide pins" : "Show pins"} onClick={() => setShowPins(s => !s)}><EyeIcon off={!showPins} /></button>

        {panelOpen && (
          <div className="ann-panel" style={panelStyle}>
            <div className="ann-ph">
              <span>Annotations ({store.items.length})</span>
              <button className="ann-x" title="Close" onClick={() => setPanel(false)}>✕</button>
            </div>
            <div className="ann-status" data-s={sync}>
              {sync === "ok" ? "● Shared online — everyone sees these" : sync === "local" ? "○ This browser only" : "⚠ Server not reachable — saved on this browser"}
            </div>
            <input className="ann-author" placeholder="Your name (saved with each note)" value={author} maxLength={80} onChange={e => setAuthor(e.target.value)} />
            <div className="ann-list">
              {store.items.length === 0 && <div className="ann-empty">No annotations yet.<br />Press the pin button, then click anything on the page.</div>}
              {[...store.items].sort((a, b) => a.n - b.n).map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "flex-start" }}>
                  <button className="ann-item" onClick={() => goTo(a)} title="Go to this annotation">
                    <span className="ann-num">{a.n}</span>
                    <span className="ann-item-main">
                      <div className="ann-item-path">{a.path}{a.path !== path ? " ↗" : ""}{a.author ? ` · ${a.author}` : ""}</div>
                      <div className="ann-item-text">{a.text}</div>
                    </span>
                  </button>
                  <button className="ann-x" style={{ marginTop: 8 }} title="Delete" onClick={() => removeOne(a.id)}>✕</button>
                </div>
              ))}
            </div>
            {note && <div className="ann-msg">{note}</div>}
            <div className="ann-foot">
              <button className="ann-fbtn" disabled={store.items.length === 0} onClick={doExport} title="Save every annotation to a .txt file">Export .txt</button>
              <button className="ann-fbtn" onClick={() => fileRef.current?.click()} title="Load annotations from a .txt export">Import .txt</button>
              <button className="ann-fbtn" data-danger="true" data-armed={armed} disabled={store.items.length === 0} onClick={deleteAll}>
                {armed ? "Sure? Click again" : "Delete all"}
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".txt,text/plain" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
