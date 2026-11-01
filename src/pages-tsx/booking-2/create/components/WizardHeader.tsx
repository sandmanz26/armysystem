// Booking 2.0 — Create Booking wizard header, per the reference screenshots.
// New component (not a restyle of the old create flow's TopBar/Stepper):
// circular "X" close button + centered title/subtitle in one row, then a
// numbered-circle stepper (with a "Back" pill on the left and the primary
// action on the right) in a second row — replacing the old back-arrow +
// dashed-pill stepper look. Local to booking-2/create; the old booking
// module's create-flow header is untouched.
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardHeaderProps {
  title: string;
  subtitle: string;
  steps: string[];
  current: number;
  onClose: () => void;
  onBack?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}

export function WizardHeader({ title, subtitle, steps, current, onClose, onBack, primaryLabel, onPrimary, primaryDisabled }: WizardHeaderProps) {
  return (
    <div className="bg-white border-b border-figma-subtle flex-shrink-0">
      <div className="h-16 flex items-center justify-center relative px-6">
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="absolute left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-figma-subtle flex items-center justify-center text-figma-body hover:bg-figma-soft hover:text-figma-default transition-colors"
        >
          <X size={16} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-figma-default leading-tight">{title}</span>
          <span className="text-xs text-figma-body mt-0.5">{subtitle}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-figma-subtle">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-figma-default border border-figma-strong rounded-full hover:bg-figma-soft bg-white flex-shrink-0"
          >
            <ArrowLeft size={14} /> Back
          </button>
        ) : (
          <div className="w-[92px] flex-shrink-0" />
        )}

        <div className="flex items-center overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = idx === current;
            const isDone = idx < current;
            return (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                      isActive ? "bg-figma-primary text-white" : isDone ? "bg-figma-dangersoft text-figma-primary" : "bg-figma-muted text-figma-body"
                    )}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </span>
                  <span className={cn("text-sm whitespace-nowrap", isActive ? "font-bold text-figma-default" : "text-figma-body")}>
                    {step}
                  </span>
                </div>
                {idx < steps.length - 1 && <div className="w-10 h-px bg-gray-200 mx-3 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className={cn(
            "flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg flex-shrink-0 transition-colors",
            primaryDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-figma-primary hover:bg-figma-primaryhover"
          )}
        >
          {primaryLabel} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
