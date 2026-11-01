// ─────────────────────────────────────────────────────────────────────────
// Design Token Inspector — a single self-contained, portable dev tool.
//
// Drop this ONE file into any React project and mount <DesignTokenInspector />
// once near the root (e.g. in App.tsx). It has no dependencies beyond React
// and no app-specific imports — copy the file as-is into another codebase
// and it works unchanged.
//
// What it does:
//  - A draggable floating button. Click to toggle "inspect mode".
//  - While active, hovering any element shows its resolved text/background/
//    border color and (for text elements) typography, and reports whether
//    each resolves to a real design token or is a raw/unmapped value.
//  - A "Token Coverage" card summarizes the whole current screen: how many
//    checkable properties use a token vs. don't. Click either number to
//    flag every matching/non-matching element on the page with a persistent
//    outline so they're easy to spot without hovering one at a time.
//
// Token source — no hardcoded token list. Two modes, chosen via the gear
// icon in the coverage card:
//  1. "Auto-detect" (default): reads every custom property declared on
//     `:root`/`html` from the page's own stylesheets. Works out of the box
//     on any project that uses CSS custom properties for its palette.
//  2. "Design token JSON": paste or upload a JSON token file. Supports a
//     flat map ({ "color.primary": "#115e59" }) and Tokens Studio's nested
///    { "value": "#115e59" } leaf shape — both are flattened automatically.
//     This is the reference the tool checks elements against when a
//     project doesn't expose its tokens as CSS custom properties.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";

const STORAGE_KEY = "design-token-inspector:source";

type TokenSource =
  | { type: "auto" }
  | { type: "json"; raw: string; tokens: Record<string, string> };

// Generic type-scale steps (common Tailwind text-* sizes at common weights)
// used only as a reasonable default for the typography "in scale" check —
// not tied to any specific project's design system.
const TYPE_SCALE: { size: number; weight: number }[] = [
  { size: 30, weight: 700 }, { size: 30, weight: 800 }, { size: 28, weight: 700 },
  { size: 28, weight: 800 }, { size: 24, weight: 600 }, { size: 24, weight: 700 },
  { size: 24, weight: 800 }, { size: 20, weight: 600 }, { size: 20, weight: 700 },
  { size: 18, weight: 400 }, { size: 18, weight: 600 }, { size: 18, weight: 700 },
  { size: 16, weight: 400 }, { size: 16, weight: 500 }, { size: 16, weight: 600 },
  { size: 16, weight: 700 }, { size: 14, weight: 400 }, { size: 14, weight: 500 },
  { size: 14, weight: 600 }, { size: 14, weight: 700 }, { size: 13.5, weight: 400 },
  { size: 13.5, weight: 600 }, { size: 13, weight: 400 }, { size: 13, weight: 600 },
  { size: 12.5, weight: 400 }, { size: 12.5, weight: 600 }, { size: 12.5, weight: 700 },
  { size: 12, weight: 400 }, { size: 12, weight: 500 }, { size: 12, weight: 600 },
  { size: 11.5, weight: 600 }, { size: 11.5, weight: 700 }, { size: 11, weight: 500 },
  { size: 11, weight: 600 }, { size: 10, weight: 500 }, { size: 10, weight: 600 },
];
const FONT_TOLERANCE = 0.4;
const COLOR_LIKE = /^#([0-9a-f]{3,8})$|^rgba?\(|^hsla?\(/i;

export function DesignTokenInspector() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const btn = btnRef.current!;
    const outline = outlineRef.current!;
    const tooltip = tooltipRef.current!;
    const toast = toastRef.current!;
    const summaryCard = summaryCardRef.current!;

    let active = false;
    let collapsed = false;
    let settingsOpen = false;
    let settingsMode: "auto" | "json" = "auto"; // transient — which panel is shown, independent of the applied source until "Apply" is clicked
    let currentTarget: Element | null = null;
    let tokenMap: Record<string, string> = {};
    let source: TokenSource = loadSource();
    let lastMatchedEls: Element[] = [];
    let lastUnmatchedEls: Element[] = [];
    let highlightMode: "matched" | "unmatched" | null = null;
    let tryOpen = false;
    // Temporary token overrides, applied as INLINE custom properties on <html>
    // so they beat any stylesheet (including layered ones) without editing it.
    // name -> the hex the user picked, purely so the panel can show it back.
    let tryOverrides: Record<string, string> = {};
    let trySearch = "";

    function loadSource(): TokenSource {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { type: "auto" };
        const parsed = JSON.parse(raw);
        if (parsed && parsed.type === "json" && parsed.raw) {
          return { type: "json", raw: parsed.raw, tokens: flattenTokenJson(JSON.parse(parsed.raw)) };
        }
        return { type: "auto" };
      } catch {
        return { type: "auto" };
      }
    }

    function persistSource(s: TokenSource) {
      try {
        if (s.type === "auto") localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: "auto" }));
        else localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: "json", raw: s.raw }));
      } catch {
        /* ignore quota/private-mode errors */
      }
    }

    // Flattens either a flat map ({ "a.b": "#fff" }) or a Tokens-Studio-style
    // nested object ({ a: { b: { value: "#fff" } } }) into { path: value }.
    function flattenTokenJson(obj: unknown, prefix = ""): Record<string, string> {
      const out: Record<string, string> = {};
      if (!obj || typeof obj !== "object") return out;
      const entries = Object.entries(obj as Record<string, unknown>);
      for (const [key, val] of entries) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof val === "string") {
          out[path] = val;
        } else if (val && typeof val === "object") {
          const v = val as Record<string, unknown>;
          if (typeof v.value === "string") {
            out[path] = v.value;
          } else {
            Object.assign(out, flattenTokenJson(val, path));
          }
        }
      }
      return out;
    }

    // Reads every custom property declared under `:root`/`html` across the
    // page's own stylesheets — no hardcoded variable names. Cross-origin
    // stylesheets throw on `.cssRules` access; those are silently skipped.
    function getRootCustomProperties(): string[] {
      const names = new Set<string>();
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        if (!rules) continue;
        walkRules(rules, names);
      }
      return Array.from(names);
    }

    function walkRules(rules: CSSRuleList, names: Set<string>) {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && /(^|,)\s*(:root|html)\s*(,|$)/i.test(rule.selectorText || "")) {
          for (const prop of Array.from(rule.style)) {
            if (prop.startsWith("--")) names.add(prop);
          }
        } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
          walkRules(rule.cssRules, names);
        }
      }
    }

    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:-9999px;left:-9999px;pointer-events:none;";
    document.body.appendChild(probe);

    /** Channel triplet, e.g. "17 94 89" — how tokens.css stores colours since
        the move to `rgb(var(--x) / <alpha-value>)`. Not a valid colour on its
        own, so wrap it before probing or every token reads as unsupported. */
    const TRIPLET = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;

    function toRgbString(color: string): string | null {
      const value = TRIPLET.test(color.trim()) ? `rgb(${color.trim()})` : color;
      probe.style.color = "";
      probe.style.color = value;
      if (!probe.style.color) return null; // browser rejected the value
      return getComputedStyle(probe).color;
    }

    function buildTokenMap(): Record<string, string> {
      const map: Record<string, string> = {};
      if (source.type === "auto") {
        const rootStyle = getComputedStyle(document.documentElement);
        getRootCustomProperties().forEach((name) => {
          const raw = rootStyle.getPropertyValue(name).trim();
          if (!raw) return;
          const rgb = toRgbString(raw);
          if (rgb) map[rgb] = name;
        });
        buildVarRuleCache();
      } else {
        Object.entries(source.tokens).forEach(([name, value]) => {
          if (!COLOR_LIKE.test(value.trim())) return;
          const rgb = toRgbString(value.trim());
          if (rgb) map[rgb] = name;
        });
        varRulesByProp = {};
      }
      return map;
    }

    // ── Try a colour ────────────────────────────────────────────────────
    // Lets a designer test "what if primary were red?" without touching any
    // file. Nothing is persisted: overrides live on the <html> inline style
    // and die with the page, exactly like editing a value in DevTools.

    /** Every :root custom property whose value resolves to a colour. */
    function listColorTokens(): { name: string; hex: string }[] {
      const rootStyle = getComputedStyle(document.documentElement);
      const out: { name: string; hex: string }[] = [];
      getRootCustomProperties().forEach((name) => {
        const raw = rootStyle.getPropertyValue(name).trim();
        if (!raw) return;
        const rgb = toRgbString(raw);
        if (!rgb) return;
        out.push({ name, hex: rgbToHex(rgb) });
      });
      out.sort((a, b) => a.name.localeCompare(b.name));
      return out;
    }

    function hexToTriplet(hex: string): string | null {
      const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
    }

    /** The value a token is declared with in the SHEET, not the inline
        override — so we can tell whether this project stores colours as
        channel triplets ("17 94 89") or as ordinary colours ("#115e59"). */
    function declaredValue(name: string): string {
      const inline = document.documentElement.style.getPropertyValue(name);
      if (!inline) return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      // temporarily lift the override to read what the stylesheet says
      document.documentElement.style.removeProperty(name);
      const sheetValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      document.documentElement.style.setProperty(name, inline);
      return sheetValue;
    }

    /** Writes the override in the SAME shape the token is declared in.
        Getting this wrong is the whole trap: these tokens are consumed as
        `rgb(var(--x) / <alpha-value>)`, so putting a hex into one produces
        `rgb(#ff0000 / 1)` — an invalid colour, and the element silently
        falls back instead of turning red. */
    function applyOverride(name: string, hex: string) {
      const declared = declaredValue(name);
      const value = TRIPLET.test(declared) ? hexToTriplet(hex) : hex;
      if (!value) return;
      document.documentElement.style.setProperty(name, value);
      tryOverrides[name] = hex;
      tokenMap = buildTokenMap(); // keep coverage honest about the new value
    }

    function resetOverride(name: string) {
      document.documentElement.style.removeProperty(name);
      delete tryOverrides[name];
      tokenMap = buildTokenMap();
    }

    function resetAllOverrides() {
      Object.keys(tryOverrides).forEach((n) => document.documentElement.style.removeProperty(n));
      tryOverrides = {};
      tokenMap = buildTokenMap();
    }

    function formatTokenRef(name: string): string {
      return source.type === "auto" ? `var(${name})` : name;
    }

    // ── Direct CSS-rule lookup (disambiguates same-hex tokens) ───────────
    // Two different token names can resolve to the identical color (by
    // design — e.g. "text/body" and "text/placeholder" are both #6b7280
    // but mean different things). A pure value->name reverse map can't
    // tell those apart: whichever name was inserted last silently wins for
    // every element sharing that value. Instead, read which `var(--name)`
    // was actually written into the matched CSS rule for THIS element's
    // property — that's unambiguous. Falls back to the reverse map only
    // when no matching rule/var() reference is found (e.g. inline styles).
    let varRulesByProp: Record<string, { selector: string; varName: string }[]> = {};
    /* Selectors that set a property AT ALL — var-backed or hardcoded. Needed to
       know WHICH ancestor actually supplies an inherited value. */
    let anyRulesByProp: Record<string, string[]> = {};
    const RELEVANT_PROPS = [
      "color", "background-color", "background",
      "border-color", "border-top-color", "border", "border-top",
    ];

    function buildVarRuleCache() {
      varRulesByProp = {};
      anyRulesByProp = {};
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        if (!rules) continue;
        collectVarRules(rules);
      }
    }

    function collectVarRules(rules: CSSRuleList) {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          for (const prop of RELEVANT_PROPS) {
            const val = rule.style.getPropertyValue(prop);
            if (!val) continue;
            (anyRulesByProp[prop] ||= []).push(rule.selectorText);
            const m = val.match(/var\((--[\w-]+)/);
            if (m) {
              (varRulesByProp[prop] ||= []).push({ selector: rule.selectorText, varName: m[1] });
            }
          }
        } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
          collectVarRules(rule.cssRules);
        }
      }
    }

    function findVarNameOn(el: Element, props: string[]): string | null {
      let found: string | null = null;
      for (const prop of props) {
        const candidates = varRulesByProp[prop];
        if (!candidates) continue;
        for (const c of candidates) {
          try {
            if (el.matches(c.selector)) found = c.varName;
          } catch {
            /* invalid/unsupported selector for .matches() — skip */
          }
        }
      }
      return found;
    }

    /*
     * `color` INHERITS. Clicking the <button> inside a table header finds no
     * colour rule on the button itself — it is painted by the <th>'s
     * `.text-primary`. Without walking up, the lookup returns null and we fall
     * through to the value→name map, which cannot tell same-hex tokens apart:
     * eight tokens in this file resolve to #115e59, and the map reports
     * whichever was declared last (`--color-brand-primary`), not the one the
     * element actually uses (`--color-text-primary`). That is Pitfall #9, and
     * it is what made this tool claim a header was using a *border* token.
     */
    const INHERITED_PROPS = new Set(["color"]);

    /** Does any matched rule — or an inline style — set this property here? */
    function declaresProp(el: Element, props: string[]): boolean {
      const inline = (el as HTMLElement).style;
      for (const prop of props) {
        if (inline && inline.getPropertyValue(prop)) return true;
        for (const sel of anyRulesByProp[prop] || []) {
          try {
            if (el.matches(sel)) return true;
          } catch {
            /* unsupported selector — skip */
          }
        }
      }
      return false;
    }

    function findVarNameForProperty(el: Element, props: string[]): string | null {
      const direct = findVarNameOn(el, props);
      if (direct) return direct;
      // Only `color` reaches an element by inheritance; background and border
      // never do, so a miss there is a genuine "no token".
      if (!props.some((p) => INHERITED_PROPS.has(p))) return null;
      // The element sets the property itself without a var() — a hardcoded
      // colour. Crediting an ancestor's token here would be a lie.
      if (declaresProp(el, props)) return null;

      const target = getComputedStyle(el).getPropertyValue(props[0]);
      let node: Element | null = el.parentElement;
      while (node && node !== document.documentElement) {
        // A different computed value upstream means the value did NOT come
        // from here (something in between overrode it) — stop rather than
        // credit an unrelated token.
        if (getComputedStyle(node).getPropertyValue(props[0]) !== target) return null;
        const inherited = findVarNameOn(node, props);
        if (inherited) return inherited;
        // This ancestor supplies the value but with a hardcoded colour.
        if (declaresProp(node, props)) return null;
        node = node.parentElement;
      }
      return null;
    }

    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    function showToast(msg: string) {
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
    }

    function placeButtonDefault() {
      btn.style.right = "28px";
      btn.style.bottom = "96px";
      btn.style.left = "";
      btn.style.top = "";
    }
    placeButtonDefault();

    let dragging = false;
    let moved = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      moved = false;
      const rect = btn.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      btn.setPointerCapture(e.pointerId);
      btn.classList.add("dti-dragging");
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      let nx = origX + dx;
      let ny = origY + dy;
      nx = Math.max(4, Math.min(window.innerWidth - btn.offsetWidth - 4, nx));
      ny = Math.max(4, Math.min(window.innerHeight - btn.offsetHeight - 4, ny));
      btn.style.left = nx + "px";
      btn.style.top = ny + "px";
      btn.style.right = "";
      btn.style.bottom = "";
      if (active) positionSummaryCard();
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove("dti-dragging");
      if (!moved) toggleActive();
    }

    function toggleActive() {
      active = !active;
      btn.classList.toggle("dti-active", active);
      document.body.style.cursor = active ? "crosshair" : "";
      if (!active) {
        outline.style.display = "none";
        tooltip.style.display = "none";
        summaryCard.style.display = "none";
        currentTarget = null;
        clearHighlights();
      } else {
        tokenMap = buildTokenMap();
        settingsOpen = false;
        renderSummaryCard();
        summaryCard.style.display = "block";
        positionSummaryCard();
        showToast("Inspect mode on — hover any element (Esc to exit)");
      }
    }

    function isInspectorUI(el: Element | null): boolean {
      return !!(el && el.closest && el.closest(".dti-ui"));
    }

    function rgbToHex(rgb: string): string {
      const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return rgb;
      return "#" + m.slice(1, 4).map((n) => (+n).toString(16).padStart(2, "0")).join("");
    }

    /** Every root token whose resolved value equals `cssValue`. */
    function tokensSharingValue(cssValue: string): string[] {
      const out: string[] = [];
      if (source.type !== "auto") return out;
      const rootStyle = getComputedStyle(document.documentElement);
      for (const name of getRootCustomProperties()) {
        const raw = rootStyle.getPropertyValue(name).trim();
        if (!raw) continue;
        if (toRgbString(raw) === cssValue) out.push(name);
      }
      return out;
    }

    function fmtColor(
      el: Element,
      cssValue: string,
      props: string[],
    ): {
      rgb: string;
      hex: string;
      varName: string | null;
      guessed: boolean;
      ambiguous: boolean;
      sharers: string[];
    } | null {
      if (!cssValue || cssValue === "rgba(0, 0, 0, 0)" || cssValue === "transparent") return null;
      const directVarName = source.type === "auto" ? findVarNameForProperty(el, props) : null;
      // A reverse-map hit is a GUESS whenever several tokens share the value.
      // Marked so the reading is never mistaken for a resolved binding.
      const guess = directVarName ? null : tokenMap[cssValue] || null;
      const sharers = guess ? tokensSharingValue(cssValue) : [];
      const varName = directVarName || guess;
      return {
        rgb: cssValue,
        hex: rgbToHex(cssValue),
        varName,
        guessed: !directVarName && !!guess,
        ambiguous: sharers.length > 1,
        sharers,
      };
    }

    function hasDirectText(el: Element): boolean {
      return Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0
      );
    }

    function matchTypeScale(fontSizePx: string, fontWeight: string): boolean {
      const size = parseFloat(fontSizePx);
      const weight = parseInt(fontWeight, 10);
      return TYPE_SCALE.some((t) => Math.abs(t.size - size) <= FONT_TOLERANCE && t.weight === weight);
    }

    function statusPill(isMatch: boolean, matchLabel: string, noMatchLabel: string): string {
      const cls = isMatch ? "matched" : "unmatched";
      const icon = isMatch ? "✓" : "✕";
      const text = isMatch ? matchLabel : noMatchLabel;
      return `<span class="dti-status ${cls}">${icon} ${text}</span>`;
    }

    function colorRow(label: string, fmt: ReturnType<typeof fmtColor>): { html: string; applicable: boolean; matched: boolean | null } {
      if (!fmt) {
        return {
          html: `<div class="dti-row"><span class="dti-k">${label}</span><span class="dti-v">—</span></div>`,
          applicable: false,
          matched: null,
        };
      }
      const cls = fmt.varName ? "matched" : "unmatched";
      const guessMark = fmt.guessed ? "≈ " : "";
      const val = fmt.varName ? guessMark + formatTokenRef(fmt.varName) : fmt.hex;
      const title = fmt.guessed
        ? ` title="Guessed from the colour value — no CSS rule binds this property on this element${
            fmt.ambiguous ? `. ${fmt.sharers.length} tokens share this value: ${fmt.sharers.join(", ")}` : ""
          }"`
        : "";
      const pill = fmt.guessed
        ? statusPill(false, "Token", "Guess")
        : statusPill(!!fmt.varName, "Token", "No token");
      const html = `<div class="dti-row"><span class="dti-k">${label}</span><span class="dti-v ${cls}"${title}><span class="dti-swatch" style="background:${fmt.hex}"></span>${val}</span>${pill}</div>`;
      return { html, applicable: true, matched: !!fmt.varName && !fmt.guessed };
    }

    function buildTooltip(el: Element): string {
      const cs = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const clsAttr = typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className.trim() : "";
      const clsLabel = clsAttr ? "." + clsAttr.split(/\s+/).slice(0, 2).join(".") : "";

      const checks: boolean[] = [];
      let html = `<div class="dti-tag">${tag}<span class="dti-cls">${clsLabel}</span></div>`;

      html += '<div class="dti-section-label">Color</div>';
      const color = fmtColor(el, cs.color, ["color"]);
      const bg = fmtColor(el, cs.backgroundColor, ["background-color", "background"]);
      const borderColor = fmtColor(el, cs.borderTopColor, ["border-color", "border-top-color", "border", "border-top"]);
      const border = parseFloat(cs.borderTopWidth) > 0 ? borderColor : null;

      const colorResult = colorRow("text", color);
      html += colorResult.html;
      if (colorResult.applicable) checks.push(!!colorResult.matched);

      const bgResult = colorRow("background", bg);
      html += bgResult.html;
      if (bgResult.applicable) checks.push(!!bgResult.matched);

      if (border) {
        const borderResult = colorRow("border", border);
        html += borderResult.html;
        if (borderResult.applicable) checks.push(!!borderResult.matched);
      }

      if (hasDirectText(el)) {
        const typeMatch = matchTypeScale(cs.fontSize, cs.fontWeight);
        checks.push(typeMatch);
        html += '<div class="dti-section-label">Typography</div>';
        html += `<div class="dti-row"><span class="dti-k">font</span><span class="dti-v">${cs.fontSize} / ${cs.fontWeight}</span>${statusPill(typeMatch, "In scale", "Off-scale")}</div>`;
        html += `<div class="dti-row"><span class="dti-k">line-height</span><span class="dti-v">${cs.lineHeight}</span></div>`;
        html += `<div class="dti-row"><span class="dti-k">family</span><span class="dti-v dti-ellipsis">${cs.fontFamily.split(",")[0].replace(/["']/g, "")}</span></div>`;
      }

      const allMatch = checks.length > 0 && checks.every(Boolean);
      const someMatch = checks.some(Boolean);
      const summaryCls = checks.length === 0 ? "neutral" : allMatch ? "matched" : someMatch ? "partial" : "unmatched";
      const summaryText =
        checks.length === 0
          ? "No color/text to check"
          : allMatch
          ? "✓ Fully matches design tokens"
          : someMatch
          ? "△ Partially matches design tokens"
          : "✕ Does not match design tokens";
      const summary = `<div class="dti-summary ${summaryCls}">${summaryText}</div>`;

      return summary + html;
    }

    function positionTooltip(x: number, y: number) {
      const pad = 16;
      let left = x + pad;
      let top = y + pad;
      const rect = tooltip.getBoundingClientRect();
      if (left + rect.width > window.innerWidth - 8) left = x - rect.width - pad;
      if (top + rect.height > window.innerHeight - 8) top = y - rect.height - pad;
      tooltip.style.left = Math.max(8, left) + "px";
      tooltip.style.top = Math.max(8, top) + "px";
    }

    function onDocPointerMove(e: PointerEvent) {
      if (!active || settingsOpen) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || isInspectorUI(el)) {
        outline.style.display = "none";
        tooltip.style.display = "none";
        currentTarget = null;
        return;
      }
      if (el !== currentTarget) {
        currentTarget = el;
        const rect = el.getBoundingClientRect();
        outline.style.display = "block";
        outline.style.left = rect.left + "px";
        outline.style.top = rect.top + "px";
        outline.style.width = rect.width + "px";
        outline.style.height = rect.height + "px";
        tooltip.innerHTML = buildTooltip(el);
        tooltip.style.display = "block";
      }
      positionTooltip(e.clientX, e.clientY);
    }

    // ── Whole-page coverage scan ─────────────────────────────────────────
    // Aggregates the same per-property checks as the hover tooltip across
    // every visible element, and keeps references to which elements landed
    // in which bucket so the coverage numbers can be clicked to flag them.
    function scanPage(): { matched: number; unmatched: number; elements: number } {
      lastMatchedEls = [];
      lastUnmatchedEls = [];
      let elements = 0;
      const all = document.body.querySelectorAll("*");
      all.forEach((el) => {
        if (isInspectorUI(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const cs = getComputedStyle(el);
        let hasCheck = false;
        let elMatched = false;
        let elUnmatched = false;

        const color = fmtColor(el, cs.color, ["color"]);
        const bg = fmtColor(el, cs.backgroundColor, ["background-color", "background"]);
        const borderColor = fmtColor(el, cs.borderTopColor, ["border-color", "border-top-color", "border", "border-top"]);
        const border = parseFloat(cs.borderTopWidth) > 0 ? borderColor : null;

        [color, bg, border].forEach((fmt) => {
          if (!fmt) return;
          hasCheck = true;
          if (fmt.varName) elMatched = true;
          else elUnmatched = true;
        });

        if (hasDirectText(el)) {
          hasCheck = true;
          if (matchTypeScale(cs.fontSize, cs.fontWeight)) elMatched = true;
          else elUnmatched = true;
        }

        if (hasCheck) {
          elements++;
          if (elMatched) lastMatchedEls.push(el);
          if (elUnmatched) lastUnmatchedEls.push(el);
        }
      });
      // Count PROPERTIES, not elements, for the headline numbers (an element
      // can contribute to both buckets, e.g. token background + raw color).
      let matched = 0;
      let unmatched = 0;
      all.forEach((el) => {
        if (isInspectorUI(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const cs = getComputedStyle(el);
        [
          fmtColor(el, cs.color, ["color"]),
          fmtColor(el, cs.backgroundColor, ["background-color", "background"]),
          parseFloat(cs.borderTopWidth) > 0
            ? fmtColor(el, cs.borderTopColor, ["border-color", "border-top-color", "border", "border-top"])
            : null,
        ].forEach((fmt) => {
          if (!fmt) return;
          if (fmt.varName) matched++;
          else unmatched++;
        });
        if (hasDirectText(el)) {
          if (matchTypeScale(cs.fontSize, cs.fontWeight)) matched++;
          else unmatched++;
        }
      });
      return { matched, unmatched, elements };
    }

    function clearHighlights() {
      lastMatchedEls.forEach((el) => el.classList.remove("dti-flag-matched"));
      lastUnmatchedEls.forEach((el) => el.classList.remove("dti-flag-unmatched"));
      highlightMode = null;
    }

    function toggleHighlight(mode: "matched" | "unmatched") {
      const wasSameMode = highlightMode === mode;
      clearHighlights();
      if (wasSameMode) {
        renderSummaryCard();
        return;
      }
      const cls = mode === "matched" ? "dti-flag-matched" : "dti-flag-unmatched";
      const els = mode === "matched" ? lastMatchedEls : lastUnmatchedEls;
      els.forEach((el) => el.classList.add(cls));
      highlightMode = mode;
      renderSummaryCard();
      showToast(
        mode === "matched"
          ? `Highlighted ${els.length} element${els.length === 1 ? "" : "s"} using a token`
          : `Highlighted ${els.length} element${els.length === 1 ? "" : "s"} NOT using a token`
      );
    }

    function renderSettingsPanel(): string {
      const isAuto = settingsMode === "auto";
      const currentJson = source.type === "json" ? source.raw : "";
      const tokenCount = source.type === "json" ? Object.keys(source.tokens).length : Object.keys(tokenMap).length;
      return `
        <div class="dti-sum-body">
          <div class="dti-settings-label">Token reference</div>
          <div class="dti-settings-options">
            <button type="button" class="dti-settings-opt ${isAuto ? "active" : ""}" data-src="auto">
              Auto-detect from CSS<br/><span>Reads --custom-properties on :root</span>
            </button>
            <button type="button" class="dti-settings-opt ${!isAuto ? "active" : ""}" data-src="json">
              Design token JSON<br/><span>Paste or upload a token file</span>
            </button>
          </div>
          ${
            !isAuto
              ? `<textarea class="dti-settings-textarea" placeholder='{ "color.primary": "#115e59", "color.body": "#6b7280" }'>${escapeHtml(currentJson)}</textarea>
                 <input type="file" accept="application/json,.json" class="dti-settings-file" />
                 <div class="dti-settings-row">
                   <button type="button" class="dti-settings-apply">Apply &amp; Rescan</button>
                 </div>`
              : ""
          }
          <div class="dti-settings-count">${source.type === "auto" && isAuto ? tokenCount + " token" + (tokenCount === 1 ? "" : "s") + " currently active" : source.type === "json" ? Object.keys(source.tokens).length + " tokens currently active" : "No tokens applied yet"}</div>
        </div>
      `;
    }

    function renderTryPanel(): string {
      const all = listColorTokens();
      const q = trySearch.trim().toLowerCase();
      const hits = q ? all.filter((t) => t.name.toLowerCase().includes(q)) : all;
      const LIMIT = 80;
      const shown = hits.slice(0, LIMIT);
      const overridden = Object.keys(tryOverrides).length;

      const rows = shown.length
        ? shown
            .map((t) => {
              const isOn = Object.prototype.hasOwnProperty.call(tryOverrides, t.name);
              return `
                <div class="dti-try-row ${isOn ? "changed" : ""}">
                  <input type="color" class="dti-try-color" value="${t.hex}" data-token="${escapeHtml(t.name)}" title="Pick a colour" />
                  <span class="dti-try-name" title="${escapeHtml(t.name)}">${escapeHtml(t.name.replace(/^--/, ""))}</span>
                  <span class="dti-try-hex">${t.hex}</span>
                  ${isOn ? `<button type="button" class="dti-try-undo" data-reset="${escapeHtml(t.name)}" title="Restore original">↺</button>` : `<span class="dti-try-undo-spacer"></span>`}
                </div>`;
            })
            .join("")
        : `<div class="dti-try-empty">No colour token matches “${escapeHtml(trySearch)}”</div>`;

      return `
        <div class="dti-sum-body">
          <div class="dti-settings-label">Try a colour — nothing is saved</div>
          <input type="search" class="dti-try-search" placeholder="Filter tokens, e.g. primary" value="${escapeHtml(trySearch)}" />
          <div class="dti-try-list">${rows}</div>
          ${hits.length > LIMIT ? `<div class="dti-try-more">Showing ${LIMIT} of ${hits.length} — refine the filter to see the rest</div>` : ""}
          <div class="dti-try-foot">
            <span>${overridden ? `${overridden} token${overridden === 1 ? "" : "s"} overridden` : `${all.length} colour tokens`}</span>
            ${overridden ? `<button type="button" class="dti-try-resetall">Reset all</button>` : ""}
          </div>
          <div class="dti-sum-hint">Changes apply live to this tab only and vanish on reload.</div>
        </div>
      `;
    }

    function escapeHtml(s: string): string {
      return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
    }

    function renderSummaryCard() {
      if (tryOpen) {
        summaryCard.innerHTML = `
          <div class="dti-sum-header">
            <div class="dti-sum-title"><span class="dti-sum-dot"></span>Try a Colour</div>
            <div class="dti-sum-actions">
              <button type="button" class="dti-sum-iconbtn" data-action="close-try" title="Back">✕</button>
            </div>
          </div>
          ${renderTryPanel()}
        `;
        wireTryEvents();
        return;
      }
      if (settingsOpen) {
        summaryCard.innerHTML = `
          <div class="dti-sum-header">
            <div class="dti-sum-title"><span class="dti-sum-dot"></span>Token Settings</div>
            <div class="dti-sum-actions">
              <button type="button" class="dti-sum-iconbtn" data-action="close-settings" title="Back">✕</button>
            </div>
          </div>
          ${renderSettingsPanel()}
        `;
        wireSettingsEvents();
        return;
      }

      const { matched, unmatched, elements } = scanPage();
      const total = matched + unmatched;
      const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
      const path = window.location.pathname;
      summaryCard.innerHTML = `
        <div class="dti-sum-header">
          <div class="dti-sum-title">
            <span class="dti-sum-dot"></span>
            Token Coverage
          </div>
          <div class="dti-sum-actions">
            <button type="button" class="dti-sum-iconbtn ${Object.keys(tryOverrides).length ? "dti-has-overrides" : ""}" data-action="try" title="Try a colour — temporary, not saved">◑</button>
            <button type="button" class="dti-sum-iconbtn" data-action="settings" title="Token source settings">⚙</button>
            <button type="button" class="dti-sum-iconbtn" data-action="rescan" title="Rescan this screen">↻</button>
            <button type="button" class="dti-sum-iconbtn" data-action="collapse" title="${collapsed ? "Expand" : "Collapse"}">${collapsed ? "▾" : "▴"}</button>
          </div>
        </div>
        <div class="dti-sum-body" style="${collapsed ? "display:none;" : ""}">
          <div class="dti-sum-path">${path}</div>
          <div class="dti-sum-bar"><div class="dti-sum-bar-fill" style="width:${pct}%"></div></div>
          <div class="dti-sum-stats">
            <button type="button" class="dti-sum-stat ${highlightMode === "matched" ? "active" : ""}" data-action="highlight-matched">
              <span class="dti-sum-stat-num matched">${matched}</span>
              <span class="dti-sum-stat-label">✓ Using token</span>
            </button>
            <button type="button" class="dti-sum-stat ${highlightMode === "unmatched" ? "active" : ""}" data-action="highlight-unmatched">
              <span class="dti-sum-stat-num unmatched">${unmatched}</span>
              <span class="dti-sum-stat-label">✕ Not using token</span>
            </button>
          </div>
          <div class="dti-sum-foot">${pct}% token coverage · ${elements} elements checked</div>
          <div class="dti-sum-hint">Click a number to flag those elements on the page</div>
        </div>
      `;
      wireSummaryEvents();
    }

    function wireSummaryEvents() {
      summaryCard.querySelector('[data-action="rescan"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        tokenMap = buildTokenMap();
        clearHighlights();
        renderSummaryCard();
      });
      summaryCard.querySelector('[data-action="collapse"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        collapsed = !collapsed;
        renderSummaryCard();
      });
      summaryCard.querySelector('[data-action="try"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        tryOpen = true;
        renderSummaryCard();
      });
      summaryCard.querySelector('[data-action="settings"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsOpen = true;
        settingsMode = source.type;
        renderSummaryCard();
      });
      summaryCard.querySelector('[data-action="highlight-matched"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleHighlight("matched");
      });
      summaryCard.querySelector('[data-action="highlight-unmatched"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleHighlight("unmatched");
      });
    }

    function wireTryEvents() {
      summaryCard.querySelector('[data-action="close-try"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        tryOpen = false;
        renderSummaryCard();
      });

      const search = summaryCard.querySelector<HTMLInputElement>(".dti-try-search");
      search?.addEventListener("click", (e) => e.stopPropagation());
      search?.addEventListener("input", () => {
        trySearch = search.value;
        const list = summaryCard.querySelector(".dti-try-list");
        // re-render only the list so the search box keeps focus and caret
        const fresh = document.createElement("div");
        fresh.innerHTML = renderTryPanel();
        const freshList = fresh.querySelector(".dti-try-list");
        if (list && freshList) {
          list.innerHTML = freshList.innerHTML;
          wireTryRows();
        }
      });

      wireTryRows();

      summaryCard.querySelector<HTMLButtonElement>(".dti-try-resetall")?.addEventListener("click", (e) => {
        e.stopPropagation();
        resetAllOverrides();
        renderSummaryCard();
        showToast("All token overrides reset");
      });
    }

    function wireTryRows() {
      summaryCard.querySelectorAll<HTMLInputElement>(".dti-try-color").forEach((input) => {
        input.addEventListener("click", (e) => e.stopPropagation());
        input.addEventListener("input", () => {
          const name = input.dataset.token;
          if (!name) return;
          applyOverride(name, input.value);
          const row = input.closest(".dti-try-row");
          row?.classList.add("changed");
          const hexLabel = row?.querySelector(".dti-try-hex");
          if (hexLabel) hexLabel.textContent = input.value;
        });
        // only re-render (to show the undo button) once the picker closes
        input.addEventListener("change", () => renderSummaryCard());
      });
      summaryCard.querySelectorAll<HTMLButtonElement>(".dti-try-undo").forEach((btnEl) => {
        btnEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const name = btnEl.dataset.reset;
          if (!name) return;
          resetOverride(name);
          renderSummaryCard();
        });
      });
    }

    function wireSettingsEvents() {
      summaryCard.querySelector('[data-action="close-settings"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsOpen = false;
        renderSummaryCard();
      });
      summaryCard.querySelectorAll<HTMLButtonElement>(".dti-settings-opt").forEach((optBtn) => {
        optBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const kind = optBtn.dataset.src as "auto" | "json";
          settingsMode = kind;
          if (kind === "auto") {
            source = { type: "auto" };
            persistSource(source);
            tokenMap = buildTokenMap();
          }
          renderSummaryCard();
        });
      });
      const textarea = summaryCard.querySelector<HTMLTextAreaElement>(".dti-settings-textarea");
      const fileInput = summaryCard.querySelector<HTMLInputElement>(".dti-settings-file");
      const applyBtn = summaryCard.querySelector<HTMLButtonElement>(".dti-settings-apply");

      fileInput?.addEventListener("click", (e) => e.stopPropagation());
      fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (textarea) textarea.value = String(reader.result || "");
        };
        reader.readAsText(file);
      });

      applyBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const raw = textarea?.value.trim() || "";
        try {
          const parsed = JSON.parse(raw);
          const tokens = flattenTokenJson(parsed);
          if (Object.keys(tokens).length === 0) {
            showToast("No tokens found in that JSON");
            return;
          }
          source = { type: "json", raw, tokens };
          persistSource(source);
          tokenMap = buildTokenMap();
          settingsOpen = false;
          clearHighlights();
          renderSummaryCard();
          showToast(`Loaded ${Object.keys(tokens).length} tokens from JSON`);
        } catch {
          showToast("Invalid JSON — check the syntax and try again");
        }
      });
    }

    function positionSummaryCard() {
      const btnRect = btn.getBoundingClientRect();
      const cardRect = summaryCard.getBoundingClientRect();
      let left = btnRect.right - cardRect.width;
      let top = btnRect.top - cardRect.height - 12;
      if (top < 8) top = btnRect.bottom + 12;
      left = Math.max(8, Math.min(window.innerWidth - cardRect.width - 8, left));
      summaryCard.style.left = left + "px";
      summaryCard.style.top = top + "px";
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && active) toggleActive();
    }

    function onResize() {
      const rect = btn.getBoundingClientRect();
      if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) placeButtonDefault();
      if (active) positionSummaryCard();
    }

    btn.addEventListener("pointerdown", onPointerDown);
    btn.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerup", endDrag);
    btn.addEventListener("pointercancel", endDrag);
    document.addEventListener("pointermove", onDocPointerMove);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      btn.removeEventListener("pointerdown", onPointerDown);
      btn.removeEventListener("pointermove", onPointerMove);
      btn.removeEventListener("pointerup", endDrag);
      btn.removeEventListener("pointercancel", endDrag);
      document.removeEventListener("pointermove", onDocPointerMove);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      clearHighlights();
      resetAllOverrides();
      probe.remove();
      clearTimeout(toastTimer);
    };
  }, []);

  return (
    <>
      <style>{INSPECTOR_CSS}</style>
      <button ref={btnRef} type="button" className="dti-btn dti-ui" title="Drag to move · click to toggle inspect mode">
        <span className="dti-pip" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <div ref={outlineRef} className="dti-outline dti-ui" />
      <div ref={tooltipRef} className="dti-tooltip dti-ui" />
      <div ref={toastRef} className="dti-toast dti-ui" />
      <div ref={summaryCardRef} className="dti-summary-card dti-ui" />
    </>
  );
}

const INSPECTOR_CSS = `
.dti-btn {
  position: fixed; width: 52px; height: 52px; border-radius: 50%;
  background: #1a1c23; color: #fff; border: none; cursor: grab;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(3,7,18,0.28), 0 2px 6px rgba(3,7,18,0.2);
  z-index: 100000; user-select: none; touch-action: none;
  transition: background .15s, box-shadow .15s, transform .1s;
}
.dti-btn svg { width: 22px; height: 22px; pointer-events: none; }
.dti-btn:hover { transform: scale(1.05); }
.dti-btn.dti-dragging { cursor: grabbing; transition: none; }
.dti-btn.dti-active {
  background: #115e59;
  box-shadow: 0 0 0 5px #f0fdfa, 0 8px 24px rgba(17,94,89,0.35);
}
.dti-pip {
  position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%;
  background: #d1d5db; border: 2px solid #fff;
}
.dti-btn.dti-active .dti-pip { background: #22c55e; }

.dti-outline {
  position: fixed; pointer-events: none; z-index: 99998;
  border: 2px solid #115e59; background: rgba(17,94,89,0.07);
  border-radius: 3px; display: none; transition: all .06s ease-out;
}

/* Persistent flags applied directly to elements after clicking a coverage
   number — real CSS outline so it tracks the element through scroll/resize
   without needing a separate overlay layer. */
.dti-flag-matched { outline: 2px solid #22c55e !important; outline-offset: 1px !important; }
.dti-flag-unmatched { outline: 2px solid #ef4444 !important; outline-offset: 1px !important; }

.dti-tooltip {
  position: fixed; pointer-events: none; z-index: 99999; display: none;
  background: #16171d; color: #e4e4e7; border-radius: 10px;
  padding: 10px 12px; font-family: Inter, system-ui, sans-serif; font-size: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.35); max-width: 300px;
  border: 1px solid rgba(255,255,255,0.08);
}
.dti-tooltip .dti-tag {
  display: inline-flex; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px; font-weight: 700; color: #f9a8d4; margin-bottom: 6px;
  text-transform: lowercase;
}
.dti-tooltip .dti-cls { color: #93c5fd; font-weight: 500; }
.dti-tooltip .dti-row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: nowrap;
  padding: 4px 0; border-top: 1px solid rgba(255,255,255,0.08);
}
.dti-tooltip .dti-row:first-of-type { border-top: none; }
.dti-tooltip .dti-k { color: #9ca3af; font-size: 11px; flex-shrink: 0; }
.dti-tooltip .dti-v { font-family: 'JetBrains Mono', monospace; font-size: 11px; text-align: right; }
.dti-tooltip .dti-v.matched { color: #86efac; }
.dti-tooltip .dti-v.unmatched { color: #fca5a5; }
.dti-tooltip .dti-swatch {
  display: inline-block; width: 9px; height: 9px; border-radius: 50%;
  margin-right: 5px; vertical-align: middle; border: 1px solid rgba(255,255,255,0.25);
}
.dti-tooltip .dti-ellipsis { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dti-tooltip .dti-section-label {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: #6b7280; margin: 8px 0 2px;
}
.dti-tooltip .dti-section-label:first-child { margin-top: 0; }
.dti-tooltip .dti-status {
  flex-shrink: 0; font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
  display: inline-flex; align-items: center; gap: 3px; margin-left: 8px; white-space: nowrap;
}
.dti-tooltip .dti-status.matched { background: rgba(34,197,94,0.16); color: #86efac; }
.dti-tooltip .dti-status.unmatched { background: rgba(239,68,68,0.16); color: #fca5a5; }
.dti-tooltip .dti-summary {
  display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700;
  padding: 7px 9px; border-radius: 8px; margin-bottom: 8px;
}
.dti-tooltip .dti-summary.matched { background: rgba(34,197,94,0.14); color: #86efac; }
.dti-tooltip .dti-summary.partial { background: rgba(245,158,11,0.16); color: #fcd34d; }
.dti-tooltip .dti-summary.unmatched { background: rgba(239,68,68,0.16); color: #fca5a5; }
.dti-tooltip .dti-summary.neutral { background: rgba(255,255,255,0.06); color: #9ca3af; }

.dti-toast {
  position: fixed; bottom: 158px; left: 50%; transform: translateX(-50%) translateY(10px);
  background: #16171d; color: #e4e4e7; padding: 9px 16px; border-radius: 999px;
  font-size: 12.5px; font-weight: 500; z-index: 99999; opacity: 0; pointer-events: none;
  transition: opacity .2s, transform .2s; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.dti-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

.dti-summary-card {
  position: fixed; z-index: 99999; display: none; width: 250px;
  background: #16171d; color: #e4e4e7; border-radius: 12px;
  font-family: Inter, system-ui, sans-serif;
  box-shadow: 0 16px 40px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);
  overflow: hidden;
}
.dti-summary-card .dti-sum-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; cursor: default;
}
.dti-summary-card .dti-sum-title {
  display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #f4f4f5;
}
.dti-summary-card .dti-sum-dot { width: 7px; height: 7px; border-radius: 50%; background: #115e59; flex-shrink: 0; }
.dti-summary-card .dti-sum-actions { display: flex; align-items: center; gap: 4px; }
.dti-summary-card .dti-sum-iconbtn {
  width: 22px; height: 22px; border-radius: 6px; border: none; background: rgba(255,255,255,0.06);
  color: #9ca3af; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s;
}
.dti-summary-card .dti-sum-iconbtn:hover { background: rgba(255,255,255,0.12); color: #e4e4e7; }
.dti-summary-card .dti-sum-body { padding: 0 12px 12px; }
.dti-summary-card .dti-sum-path {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b7280;
  margin-bottom: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dti-summary-card .dti-sum-bar {
  height: 6px; border-radius: 999px; background: rgba(239,68,68,0.25); overflow: hidden; margin-bottom: 10px;
}
.dti-summary-card .dti-sum-bar-fill { height: 100%; background: #22c55e; border-radius: 999px; transition: width .3s ease; }
.dti-summary-card .dti-sum-stats { display: flex; gap: 8px; margin-bottom: 8px; }
.dti-summary-card .dti-sum-stat {
  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid transparent; border-radius: 8px; padding: 8px 10px;
  display: flex; flex-direction: column; gap: 2px; align-items: flex-start; cursor: pointer;
  font-family: inherit; transition: background .12s, border-color .12s;
}
.dti-summary-card .dti-sum-stat:hover { background: rgba(255,255,255,0.09); }
.dti-summary-card .dti-sum-stat.active { border-color: currentColor; background: rgba(255,255,255,0.1); }
.dti-summary-card .dti-sum-stat-num { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; line-height: 1.1; }
.dti-summary-card .dti-sum-stat-num.matched { color: #86efac; }
.dti-summary-card .dti-sum-stat-num.unmatched { color: #fca5a5; }
.dti-summary-card .dti-sum-stat-label { font-size: 10px; color: #9ca3af; font-weight: 600; }
.dti-summary-card .dti-sum-foot { font-size: 10.5px; color: #6b7280; text-align: center; }
.dti-summary-card .dti-sum-hint { font-size: 9.5px; color: #52525b; text-align: center; margin-top: 6px; }

.dti-summary-card .dti-sum-iconbtn.dti-has-overrides { color: #fca5a5; background: rgba(220,38,38,0.22); }
.dti-summary-card .dti-try-search {
  width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 6px 8px;
  border: 1px solid rgba(255,255,255,0.14); border-radius: 6px;
  background: rgba(255,255,255,0.05); color: #e4e4e7; font-size: 11px; font-family: inherit;
}
.dti-summary-card .dti-try-search:focus { outline: none; border-color: #115e59; }
.dti-summary-card .dti-try-list { max-height: 240px; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
.dti-summary-card .dti-try-row {
  display: flex; align-items: center; gap: 8px; padding: 3px 4px; border-radius: 5px;
}
.dti-summary-card .dti-try-row:hover { background: rgba(255,255,255,0.06); }
.dti-summary-card .dti-try-row.changed { background: rgba(220,38,38,0.16); }
.dti-summary-card .dti-try-color {
  flex: 0 0 auto; width: 20px; height: 20px; padding: 0; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.22); border-radius: 4px; background: none;
}
.dti-summary-card .dti-try-color::-webkit-color-swatch-wrapper { padding: 2px; }
.dti-summary-card .dti-try-color::-webkit-color-swatch { border: none; border-radius: 2px; }
.dti-summary-card .dti-try-name {
  flex: 1 1 auto; min-width: 0; font-size: 10.5px; color: #d4d4d8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dti-summary-card .dti-try-hex {
  flex: 0 0 auto; font-size: 10px; color: #9ca3af; font-variant-numeric: tabular-nums;
}
.dti-summary-card .dti-try-undo {
  flex: 0 0 auto; width: 18px; height: 18px; padding: 0; cursor: pointer; font-size: 11px;
  border: 0; border-radius: 4px; background: rgba(255,255,255,0.14); color: #e4e4e7;
}
.dti-summary-card .dti-try-undo:hover { background: rgba(255,255,255,0.26); }
.dti-summary-card .dti-try-undo-spacer { flex: 0 0 auto; width: 18px; }
.dti-summary-card .dti-try-empty { padding: 14px 4px; font-size: 11px; color: #9ca3af; text-align: center; }
.dti-summary-card .dti-try-more { margin-top: 6px; font-size: 10px; color: #9ca3af; }
.dti-summary-card .dti-try-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-top: 8px; font-size: 10.5px; color: #9ca3af;
}
.dti-summary-card .dti-try-resetall {
  padding: 3px 8px; cursor: pointer; font-size: 10px; font-family: inherit;
  border: 1px solid rgba(255,255,255,0.18); border-radius: 5px;
  background: rgba(255,255,255,0.06); color: #e4e4e7;
}
.dti-summary-card .dti-try-resetall:hover { background: rgba(255,255,255,0.14); }
.dti-summary-card .dti-settings-label {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: #6b7280; margin: 4px 0 8px;
}
.dti-summary-card .dti-settings-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.dti-summary-card .dti-settings-opt {
  text-align: left; background: rgba(255,255,255,0.05); border: 1px solid transparent; border-radius: 8px;
  padding: 8px 10px; color: #e4e4e7; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.dti-summary-card .dti-settings-opt span { display: block; font-size: 10px; font-weight: 400; color: #9ca3af; margin-top: 2px; }
.dti-summary-card .dti-settings-opt.active { border-color: #115e59; background: rgba(17,94,89,0.18); }
.dti-summary-card .dti-settings-textarea {
  width: 100%; min-height: 90px; resize: vertical; background: #0f1015; color: #d4d4d8;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px; margin-bottom: 8px; box-sizing: border-box;
}
.dti-summary-card .dti-settings-file {
  width: 100%; font-size: 10.5px; color: #9ca3af; margin-bottom: 8px;
}
.dti-summary-card .dti-settings-row { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.dti-summary-card .dti-settings-apply {
  background: #115e59; color: #fff; border: none; border-radius: 7px; padding: 7px 12px;
  font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.dti-summary-card .dti-settings-apply:hover { background: #a51d47; }
.dti-summary-card .dti-settings-count { font-size: 10px; color: #6b7280; text-align: center; }
`;
