import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/*
 * BulkActionBar — design-system component.
 *
 * Figma `Table - Bulk Action Bar` (Antenna Listing → `Action - Bulk Select`,
 * 5337:490380). A floating card that appears over the table once at least one
 * row is checked:
 *
 *   surface   `background/surface` (#ffffff), radius 8,
 *             1px `border/invert/default` (#e5e7eb),
 *             shadow 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px …
 *   dismiss   28px `Button Icon` with a 16px `Icon / x`
 *   count     "N selected" — 14 Semi Bold `text/default`
 *   actions   36px outline buttons, radius 8, 14 Semi Bold
 *
 * The "Select All 15 Antennas" button is the neutral outline
 * (`border/invert/default` + `text/default`); "Delete" is the danger outline
 * (`border/danger` + `text/danger` + a 16px `Icon / trash-2`) — both are passed
 * in as `actions` so each screen can name its own.
 */

export interface BulkActionBarProps {
  open: boolean;
  /** Rendered verbatim before the word "selected" — Figma: "2 selected". */
  count: number;
  /** Buttons on the right; use `BulkActionButton` for Figma-correct styling. */
  actions?: React.ReactNode;
  onDismiss: () => void;
  /**
   * Figma's bar is three `Table - Body Cell` instances in a row (6957:83158, 5337:490380):
   * dismiss cell 48 (20 left, 28 icon), count cell 111 (20 either side of the 71px text),
   * actions cell (20 either side of the buttons, 12 between them). That is 40px wider than the
   * compact spacing below, which is what every caller drew before. Optional and off by default
   * so existing bars are untouched; Site Management → Lanes uses it.
   */
  cells?: boolean;
  className?: string;
}

export function BulkActionBar({
  open,
  count,
  actions,
  onDismiss,
  cells = false,
  className,
}: BulkActionBarProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        // `sticky` only pins within the nearest scrolling ancestor's own
        // content height — with a short table (few rows) that's shorter
        // than the viewport, so the bar rendered inline right after the
        // last row instead of floating at the actual bottom of the screen.
        // `fixed` + viewport centering is the same pattern every other
        // floating bottom bar in this app already uses (Toast, the demo
        // switchers, NominalRollStep's own floating bar).
        "fixed bottom-6 left-1/2 z-50 flex w-fit -translate-x-1/2 items-center rounded-lg border border-invert-default bg-surface py-3",
        cells ? "pl-5 pr-5" : "gap-3 pl-3 pr-4",
        "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
        className,
      )}
      role="region"
      aria-label="Bulk actions"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Clear selection"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-caption hover:bg-main-background transition-colors"
      >
        <Icon name="x" size={16} />
      </button>

      <span className={cn("whitespace-nowrap text-sm font-semibold text-default", cells ? "px-5" : "px-1")}>
        {count} selected
      </span>

      <div className={cn("flex items-center gap-3", cells && "pl-5")}>{actions}</div>
    </div>
  );
}

export interface BulkActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "danger" | "primary";
}

/**
 * 36px button used inside the bar — Figma `Button`.
 *
 * `neutral` and `danger` are the outline forms. `primary` is the filled
 * `background/primary/default` form: RFID Reader Listing's bar (5337:382978)
 * puts Alarm On / Alarm Off in it, alongside a danger-outlined Delete.
 */
export function BulkActionButton({
  tone = "neutral",
  className,
  children,
  ...rest
}: BulkActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold transition-colors",
        tone === "danger"
          ? "bg-surface border-danger text-danger hover:bg-danger-invert-soft"
          : tone === "primary"
            ? "bg-primary-default border-transparent text-invert-default hover:bg-primary-hovered"
            : "bg-surface border-invert-default text-default hover:bg-main-background",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
