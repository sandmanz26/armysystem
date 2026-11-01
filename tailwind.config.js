import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // ══ FIGMA 1:1 SCALES ═════════════════════════════════════════════════
      // Class names mirror the Figma variable path after `color/<group>/`:
      //   color/text/default                   → text-default
      //   color/background/primary/invert/soft → bg-primary-invert-soft
      //   color/border/invert/default          → border-invert-default
      // Prefer these on all NEW work. The `colors` block further down holds
      // the app's older semantic names, which now alias the same variables.
      //
      // ONE EXCEPTION: `color/text/base` cannot become `text-base` — that is
      // Tailwind's font-size utility (244 usages), and a same-named color
      // utility would silently force white text on every one of them. Use
      // `text-invert-default` (Figma `color/text/invert/default`, same #ffffff).
      textColor: {
        "default":         "rgb(var(--color-text-default) / <alpha-value>)",
        body:              "rgb(var(--color-text-body) / <alpha-value>)",
        caption:           "rgb(var(--color-text-caption) / <alpha-value>)",
        placeholder:       "rgb(var(--color-text-placeholder) / <alpha-value>)",
        disabled:          "rgb(var(--color-text-disabled) / <alpha-value>)",
        loading:           "rgb(var(--color-text-loading) / <alpha-value>)",
        "invert-default":  "rgb(var(--color-text-invert-default) / <alpha-value>)",
        primary:           "rgb(var(--color-text-primary) / <alpha-value>)",
        danger:            "rgb(var(--color-text-danger) / <alpha-value>)",
        success:           "rgb(var(--color-text-success) / <alpha-value>)",
        warning:           "rgb(var(--color-text-warning) / <alpha-value>)",
        info:              "rgb(var(--color-text-info) / <alpha-value>)",
        // `purple` / `orange` are Tailwind palette FAMILIES. A bare string here
        // would wipe purple-50…950 in this scale, silently breaking every
        // `text-purple-700` in the app. Keep the palette, add the Figma value
        // as DEFAULT so `text-purple` === Figma `color/text/purple`.
        purple:            { DEFAULT: "rgb(var(--color-text-purple) / <alpha-value>)", ...colors.purple },
        orange:            { DEFAULT: "rgb(var(--color-text-orange) / <alpha-value>)", ...colors.orange },
        link:              "rgb(var(--color-text-link) / <alpha-value>)",
      },
      backgroundColor: {
        surface:                    "rgb(var(--color-background-surface) / <alpha-value>)",
        "surface-lv1":              "rgb(var(--color-background-surface-lv1) / <alpha-value>)",
        "surface-lv2":              "rgb(var(--color-background-surface-lv2) / <alpha-value>)",
        "main-background":          "rgb(var(--color-background-main-background) / <alpha-value>)",
        // color/background/default/hovered and color/card/bg-base-1 both resolve
        // to values other tokens already hold (#e5e7eb, #eff6ff). They still get
        // their OWN property — see Pitfall #10: same value today is not the same
        // variable tomorrow.
        "default-hovered":          "rgb(var(--color-background-default-hovered) / <alpha-value>)",
        "card-base-1":              "rgb(var(--color-card-bg-base-1) / <alpha-value>)",
        "default-default":          "rgb(var(--color-background-default-default) / <alpha-value>)",
        "default-soft":             "rgb(var(--color-background-default-soft) / <alpha-value>)",
        "default-invert-default":   "rgb(var(--color-background-default-invert-default) / <alpha-value>)",
        disabled:                   "rgb(var(--color-background-disabled) / <alpha-value>)",
        divider:                    "rgb(var(--color-background-divider) / <alpha-value>)",
        modal:                      "rgb(var(--color-background-modal) / <alpha-value>)",
        "scroll-bar":               "rgb(var(--color-background-scroll-bar) / <alpha-value>)",
        "primary-default":          "rgb(var(--color-background-primary-default) / <alpha-value>)",
        "primary-hovered":          "rgb(var(--color-background-primary-hovered) / <alpha-value>)",
        "primary-invert-soft":      "rgb(var(--color-background-primary-invert-soft) / <alpha-value>)",
        "primary-invert-default":   "rgb(var(--color-background-primary-invert-default) / <alpha-value>)",
        "primary-invert-hovered":   "rgb(var(--color-background-primary-invert-hovered) / <alpha-value>)",
        "primary-invert-focused":   "rgb(var(--color-background-primary-invert-focused) / <alpha-value>)",
        "success-default":          "rgb(var(--color-background-success-default) / <alpha-value>)",
        "success-invert-soft":      "rgb(var(--color-background-success-invert-soft) / <alpha-value>)",
        "success-invert-default":   "rgb(var(--color-background-success-invert-default) / <alpha-value>)",
        "warning-default":          "rgb(var(--color-background-warning-default) / <alpha-value>)",
        "warning-invert-soft":      "rgb(var(--color-background-warning-invert-soft) / <alpha-value>)",
        "warning-invert-default":   "rgb(var(--color-background-warning-invert-default) / <alpha-value>)",
        "danger-invert-soft":       "rgb(var(--color-background-danger-invert-soft) / <alpha-value>)",
        "danger-invert-default":    "rgb(var(--color-background-danger-invert-default) / <alpha-value>)",
        "info-default":             "rgb(var(--color-background-info-default) / <alpha-value>)",
        "info-invert-soft":         "rgb(var(--color-background-info-invert-soft) / <alpha-value>)",
        "info-invert-default":      "rgb(var(--color-background-info-invert-default) / <alpha-value>)",
        "purple-default":           "rgb(var(--color-background-purple-default) / <alpha-value>)",
        "danger-default":           "rgb(var(--color-background-danger-default) / <alpha-value>)",
        "orange-default":           "rgb(var(--color-background-orange-default) / <alpha-value>)",
        "info-pressed":             "rgb(var(--color-background-info-pressed) / <alpha-value>)",
        "purple-invert-default":    "rgb(var(--color-background-purple-invert-default) / <alpha-value>)",
        "purple-invert-soft":       "rgb(var(--color-background-purple-invert-soft) / <alpha-value>)",
        "orange-invert-soft":       "rgb(var(--color-background-orange-invert-soft) / <alpha-value>)",
        "orange-invert-default":    "rgb(var(--color-background-orange-invert-default) / <alpha-value>)",
      },
      borderColor: {
        base:              "rgb(var(--color-border-base) / <alpha-value>)",
        "default":         "rgb(var(--color-border-default) / <alpha-value>)",
        primary:           "rgb(var(--color-border-primary) / <alpha-value>)",
        danger:            "rgb(var(--color-border-danger) / <alpha-value>)",
        success:           "rgb(var(--color-border-success) / <alpha-value>)",
        warning:           "rgb(var(--color-border-warning) / <alpha-value>)",
        info:              "rgb(var(--color-border-info) / <alpha-value>)",
        purple:            { DEFAULT: "rgb(var(--color-border-purple) / <alpha-value>)", ...colors.purple },
        orange:            { DEFAULT: "rgb(var(--color-border-orange) / <alpha-value>)", ...colors.orange },
        disabled:          "rgb(var(--color-border-disabled) / <alpha-value>)",
        "invert-default":  "rgb(var(--color-border-invert-default) / <alpha-value>)",
        "invert-primary":  "rgb(var(--color-border-invert-primary) / <alpha-value>)",
        "invert-info":     "rgb(var(--color-border-invert-info) / <alpha-value>)",
        "invert-success":  "rgb(var(--color-border-invert-success) / <alpha-value>)",
        "invert-warning":  "rgb(var(--color-border-invert-warning) / <alpha-value>)",
        "invert-danger":   "rgb(var(--color-border-invert-danger) / <alpha-value>)",
        "invert-purple":   "rgb(var(--color-border-invert-purple) / <alpha-value>)",
        "invert-orange":   "rgb(var(--color-border-invert-orange) / <alpha-value>)",
        "card-neutral":    "rgb(var(--color-card-border-neutral) / <alpha-value>)",
      },
      ringColor: {
        primary:                  "rgb(var(--color-border-primary) / <alpha-value>)",
        "primary-invert-focused": "rgb(var(--color-background-primary-invert-focused) / <alpha-value>)",
        // `ring-base` dipakai SessionChips untuk cincin putih di sekeliling chip.
        base:                     "rgb(var(--color-border-base) / <alpha-value>)",
      },

      // Ikon SVG yang diwarnai lewat fill, bukan lewat color.
      fill: {
        "success-default":        "rgb(var(--color-background-success-default) / <alpha-value>)",
        // Panah tooltip: satu bentuk SVG dengan fill yang sama persis dengan
        // badan tooltip (Figma komponen "Tooltip" → layer "Arrow").
        "default-invert-default": "rgb(var(--color-background-default-invert-default) / <alpha-value>)",
      },

      // Figma memakai dua drop-shadow bertumpuk; keduanya rgba(0,0,0,0.1).
      //   Tooltip  → 0 4px 10px -2px + 0 4px 4px -1px
      //   Listbox  → identik dengan Tailwind `shadow-lg`, jadi tidak perlu key.
      boxShadow: {
        tooltip: "0 4px 10px -2px rgb(0 0 0 / 0.1), 0 4px 4px -1px rgb(0 0 0 / 0.1)",
      },

      colors: {
        // ── Brand ─────────────────────────────────────────────────────────────
        // Sourced from design-tokens.json → semantic.color.brand
        // Classes: text-brand-primary, bg-brand-primary, border-brand-primary …
        brand: {
          primary:        "rgb(var(--color-brand-primary) / <alpha-value>)",
          "primary-hover":"rgb(var(--color-brand-primary-hover) / <alpha-value>)",
          navy:           "rgb(var(--color-brand-navy) / <alpha-value>)",
          bluesilo:       "rgb(var(--color-brand-bluesilo) / <alpha-value>)",
          subtle:         "rgb(var(--color-fill-brand-subtle) / <alpha-value>)",
        },

        // ── Semantic · Text ────────────────────────────────────────────────────
        // Sourced from design-tokens.json → semantic.color.text
        // Classes: text-content-primary, text-content-muted …
        content: {
          primary:   "rgb(var(--color-content-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-content-secondary) / <alpha-value>)",
          muted:     "rgb(var(--color-content-muted) / <alpha-value>)",
          disabled:  "rgb(var(--color-content-disabled) / <alpha-value>)",
          inverse:   "rgb(var(--color-content-inverse) / <alpha-value>)",
          brand:     "rgb(var(--color-content-brand) / <alpha-value>)",
          error:     "rgb(var(--color-content-error) / <alpha-value>)",
          success:   "rgb(var(--color-content-success) / <alpha-value>)",
          warning:   "rgb(var(--color-content-warning) / <alpha-value>)",
          caption:     "rgb(var(--color-content-caption) / <alpha-value>)",
          placeholder: "rgb(var(--color-content-placeholder) / <alpha-value>)",
        },

        // ── Semantic · Background ──────────────────────────────────────────────
        // Sourced from design-tokens.json → semantic.color.bg
        // Classes: bg-surface, bg-surface-page, bg-fill-brand …
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          page:    "rgb(var(--color-surface-page) / <alpha-value>)",
          subtle:  "rgb(var(--color-surface-subtle) / <alpha-value>)",
          disabled: "rgb(var(--color-surface-disabled) / <alpha-value>)",
          inverse:  "rgb(var(--color-surface-inverse) / <alpha-value>)",
        },
        fill: {
          brand:        "rgb(var(--color-fill-brand) / <alpha-value>)",
          "brand-hover":"rgb(var(--color-fill-brand-hover) / <alpha-value>)",
          "brand-subtle":"rgb(var(--color-fill-brand-subtle) / <alpha-value>)",
          "brand-soft": "rgb(var(--color-fill-brand-soft) / <alpha-value>)",
          "brand-tint":        "rgb(var(--color-fill-brand-tint) / <alpha-value>)",
          "brand-tint-strong": "rgb(var(--color-fill-brand-tint-strong) / <alpha-value>)",
          error:        "rgb(var(--color-fill-error) / <alpha-value>)",
          success:      "rgb(var(--color-fill-success) / <alpha-value>)",
          warning:      "rgb(var(--color-fill-warning) / <alpha-value>)",
          info:         "rgb(var(--color-fill-info) / <alpha-value>)",
        },

        // ── Semantic · Border ──────────────────────────────────────────────────
        // Sourced from design-tokens.json → semantic.color.border
        // Classes: border-line-default, border-line-focus …
        line: {
          default: "rgb(var(--color-line-default) / <alpha-value>)",
          strong:  "rgb(var(--color-line-strong) / <alpha-value>)",
          muted:   "rgb(var(--color-line-muted) / <alpha-value>)",
          focus:   "rgb(var(--color-line-focus) / <alpha-value>)",
          brand:   "rgb(var(--color-line-brand) / <alpha-value>)",
          "brand-soft": "rgb(var(--color-line-brand-soft) / <alpha-value>)",
          // Design-system form-control borders — see ds_engineer.md
          disabled:     "rgb(var(--color-line-disabled) / <alpha-value>)",
          "focus-ring": "rgb(var(--color-line-focus-ring) / <alpha-value>)",
          info:         "rgb(var(--color-line-info) / <alpha-value>)",
          success:      "rgb(var(--color-line-success) / <alpha-value>)",
          warning:      "rgb(var(--color-line-warning) / <alpha-value>)",
          danger:       "rgb(var(--color-line-danger) / <alpha-value>)",
          error:   "rgb(var(--color-line-error) / <alpha-value>)",
          control: "rgb(var(--color-line-control) / <alpha-value>)",
        },

        // ── Semantic · Status ──────────────────────────────────────────────────
        // Sourced from design-tokens.json → semantic.color.status
        // Classes: bg-status-upcoming-bg, text-status-upcoming-text …
        status: {
          "upcoming-bg":      "rgb(var(--color-status-upcoming-bg) / <alpha-value>)",
          "upcoming-text":    "rgb(var(--color-status-upcoming-text) / <alpha-value>)",
          "upcoming-border":  "rgb(var(--color-status-upcoming-border) / <alpha-value>)",
          "ongoing-bg":       "rgb(var(--color-status-ongoing-bg) / <alpha-value>)",
          "ongoing-text":     "rgb(var(--color-status-ongoing-text) / <alpha-value>)",
          "ongoing-border":   "rgb(var(--color-status-ongoing-border) / <alpha-value>)",
          "return-bg":        "rgb(var(--color-status-return-bg) / <alpha-value>)",
          "return-text":      "rgb(var(--color-status-return-text) / <alpha-value>)",
          "return-border":    "rgb(var(--color-status-return-border) / <alpha-value>)",
          "completed-bg":     "rgb(var(--color-status-completed-bg) / <alpha-value>)",
          "completed-text":   "rgb(var(--color-status-completed-text) / <alpha-value>)",
          "completed-border": "rgb(var(--color-status-completed-border) / <alpha-value>)",
          "cancelled-bg":     "rgb(var(--color-status-cancelled-bg) / <alpha-value>)",
          "cancelled-text":   "rgb(var(--color-status-cancelled-text) / <alpha-value>)",
          "cancelled-border": "rgb(var(--color-status-cancelled-border) / <alpha-value>)",
          "overdue-bg":       "rgb(var(--color-status-overdue-bg) / <alpha-value>)",
          "overdue-text":     "rgb(var(--color-status-overdue-text) / <alpha-value>)",
          "overdue-border":   "rgb(var(--color-status-overdue-border) / <alpha-value>)",
        },

        // ── Figma — Booking 2.0 ONLY ────────────────────────────────────────────
        // Names mirror the literal Figma variable path (see tokens.css's
        // --figma-* block for the full mapping + source). Used exclusively by
        // src/pages-tsx/booking-2/** — no other screen references this key.
        //
        // NOTE on "primary": Tailwind generates text-/bg-/border-/ring- utilities
        // from ONE shared value per theme key, so `primary` here only drives
        // `text-figma-primary` directly (pointed at --figma-color-text-primary,
        // the text/primary variable). `bg-figma-primary`, `border-figma-primary`,
        // and `ring-figma-primary` are redirected to their OWN dedicated
        // variables (--figma-color-bg-primary / --figma-color-border-primary)
        // via plain-CSS overrides in tokens.css — see the "Split-role overrides"
        // block there and figma-color-sync SKILL.md Pitfall #10 for why: Figma's
        // text/primary, background/primary/default, and border/primary are 3
        // distinct variables that happen to share a value today, and merging
        // them into one CSS variable made it impossible to change just one role
        // later without re-splitting. All 3 CSS variables currently hold the
        // same #115e59, so nothing renders differently yet.
        figma: {
          default:      "rgb(var(--figma-color-text-default) / <alpha-value>)",      // text/default
          body:          "rgb(var(--figma-color-text-body) / <alpha-value>)",         // text/body
          caption:       "rgb(var(--figma-color-text-caption) / <alpha-value>)",      // text/caption
          placeholder:   "rgb(var(--figma-color-text-placeholder) / <alpha-value>)",  // text/placeholder (dropdown)
          disabled:      "rgb(var(--figma-color-text-disabled) / <alpha-value>)",     // text/disabled (input placeholder + muted icons)
          primary:       "rgb(var(--figma-color-text-primary) / <alpha-value>)",      // text/primary (bg-/border-/ring- overridden separately — see note above)
          primaryhover:  "rgb(var(--figma-color-primary-hovered) / <alpha-value>)",   // background/primary/hovered
          primarysoft:   "rgb(var(--figma-color-primary-soft) / <alpha-value>)",      // background/primary/invert/soft
          danger:        "rgb(var(--figma-color-text-danger) / <alpha-value>)",       // text/danger
          dangersoft:    "rgb(var(--figma-color-danger-soft) / <alpha-value>)",       // background/danger/invert/soft
          base:          "rgb(var(--figma-color-base) / <alpha-value>)",              // text/base, border/base
          muted:         "rgb(var(--figma-color-bg-default) / <alpha-value>)",        // background/default/default
          soft:          "rgb(var(--figma-color-bg-soft) / <alpha-value>)",           // background/default/soft
          line:          "rgb(var(--figma-color-border-default) / <alpha-value>)",    // border/default
          subtle:        "rgb(var(--figma-color-border-subtle) / <alpha-value>)",     // border/invert/default
          strong:        "rgb(var(--figma-color-border-strong) / <alpha-value>)",     // gray-300 primitive (no confirmed +Theme path)
          error:         "rgb(var(--figma-color-border-error) / <alpha-value>)",      // red-500 primitive (no confirmed +Theme path)
          dangerbg:      "rgb(var(--figma-color-bg-danger) / <alpha-value>)",         // background/danger/invert/default (error banner fill)
          // NOTE: border/danger is #b91c1c, identical to text/danger above —
          // reuse the "danger" key rather than adding a second one (a
          // duplicate "danger" key here once silently overwrote the one
          // above; same mistake happened with "disabled" below, which is
          // why it's named "fielddisabled" instead of colliding again).
          fielddisabled: "rgb(var(--figma-color-bg-disabled) / <alpha-value>)",       // background/disabled (disabled field fill)
          link:          "rgb(var(--figma-color-link) / <alpha-value>)",              // text/link
          successbg:     "rgb(var(--figma-color-bg-success) / <alpha-value>)",        // background/success/invert/default
          successborder: "rgb(var(--figma-color-border-success) / <alpha-value>)",    // border/invert/success
          success:       "rgb(var(--figma-color-text-success) / <alpha-value>)",      // text/success
          dangersoft2:   "rgb(var(--figma-color-border-dangersoft) / <alpha-value>)", // border/invert/danger (lighter than "danger")
          infobg:        "rgb(var(--figma-color-bg-info) / <alpha-value>)",           // background/info/invert/default
          infoborder:    "rgb(var(--figma-color-border-info) / <alpha-value>)",       // border/invert/info
          info:          "rgb(var(--figma-color-text-info) / <alpha-value>)",         // text/info
          // Added from Today's Booking frame (node 5176:61802) — the "Total
          // Bookings" summary card's warning/amber icon.
          warningbg:     "rgb(var(--figma-color-bg-warning) / <alpha-value>)",        // background/warning/invert/default
          warning:       "rgb(var(--figma-color-text-warning) / <alpha-value>)",      // text/warning
          // Added from Booking 2.0 Booking Details frame (5093:179277) — the
          // "Issued" Assignment ID badge.
          purplebg:      "rgb(var(--figma-color-bg-purple) / <alpha-value>)",         // background/purple/invert/default
          purple:        "rgb(var(--figma-color-text-purple) / <alpha-value>)",       // text/purple
        },
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
