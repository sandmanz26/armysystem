// MST Create Booking — wizard header, from Figma `Header Nav - Create Booking` (Program=MST) +
// `Wizard - Create Booking` (6068:92702): two stacked 60px rows on white.
//   row 1  44px round outlined ✕ at the left; centred title "Create Booking" (16 SemiBold) over the
//          programme "MST" (12 Regular `text/body`)
//   row 2  Back (104×44 outlined, arrow-left) · four `Progress Wizard Item`s joined by 64px lines ·
//          primary button (arrow-right) — "Next", and "Confirm Booking" on the last step
//   item   active = filled primary number badge + `text/default` label; done = soft badge with a check
//          + `text/body` label; upcoming = grey badge + `text/body` label
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function MSTWizardHeader({ title = "Create Booking", subtitle = "MST", steps, current, onClose, onBack, primaryLabel, onPrimary }: {
  title?: string;
  subtitle?: string;
  steps: string[];
  current: number;
  onClose: () => void;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <div className="flex-shrink-0 bg-surface">
      <div className="relative flex h-[60px] items-center justify-center border-b border-invert-default px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-soft"
        >
          <Icon name="x" size={18} />
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-semibold leading-6 text-default">{title}</span>
          <span className="text-xs leading-4 text-body">{subtitle}</span>
        </div>
      </div>

      <div className="flex h-[60px] items-center justify-between gap-4 border-b border-invert-default px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-[104px] flex-shrink-0 items-center justify-center gap-3 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-soft"
        >
          <Icon name="arrow-left" size={18} />
          Back
        </button>

        <ol className="flex items-center overflow-x-auto" aria-label="Create booking steps">
          {steps.map((label, idx) => {
            const active = idx === current;
            const done = idx < current;
            return (
              <li key={label} className="flex flex-shrink-0 items-center" aria-current={active ? "step" : undefined}>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                  {done ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-invert-default text-primary">
                      <Icon name="check" size={12} />
                    </span>
                  ) : (
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-primary-default text-invert-default" : "bg-default-default text-body")}>
                      {idx + 1}
                    </span>
                  )}
                  <span className={cn("whitespace-nowrap text-sm font-medium", active ? "text-default" : "text-body")}>{label}</span>
                </div>
                {idx < steps.length - 1 && <span className="h-px w-16 bg-divider" aria-hidden />}
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={onPrimary}
          className="flex h-11 flex-shrink-0 items-center justify-center gap-3 rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default hover:bg-primary-hovered"
        >
          {primaryLabel}
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  );
}
