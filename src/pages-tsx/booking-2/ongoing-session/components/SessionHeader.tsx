import { ArrowLeft, X } from "lucide-react";

// Figma `Header Nav - Ongoing Session` / `Header Nav - Create Detail`: 60px,
// `background/surface`, 24px side padding, a 44px round X, centred title
// (16 Semi Bold) over a 12px subtitle line, actions on the right.
export function SessionHeader({
  title,
  subtitle,
  onClose,
  right,
}: {
  title: string;
  subtitle: React.ReactNode;
  onClose?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="relative grid h-[60px] flex-shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 bg-surface px-6">
      <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
      <div className="flex items-center">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
        <h1 className="text-base font-semibold text-default">{title}</h1>
        <div className="flex items-center gap-1 text-xs">{subtitle}</div>
      </div>
      <div className="flex items-center justify-end gap-3">{right}</div>
    </div>
  );
}

/** `#code · booking name · courseware` — the last segment is `text/body`. */
export function SessionSubtitle({ code, name, courseware }: { code: string; name: string; courseware: string }) {
  return (
    <>
      <span className="text-default">#{code}</span>
      <span className="text-body">·</span>
      <span className="text-default">{name}</span>
      <span className="text-body">·</span>
      <span className="text-body">{courseware}</span>
    </>
  );
}

// Figma `Header Nav - Ongoing Session Lv 2`: 60px, Back on the left, the
// sub-page title centred.
export function SessionSubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="relative flex h-[60px] flex-shrink-0 items-center bg-surface px-6">
      <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
      <button
        type="button"
        onClick={onBack}
        className="flex h-11 items-center gap-3 rounded-lg border border-invert-default bg-surface px-5 text-sm font-semibold text-default hover:bg-default-soft transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <h2 className="pointer-events-none absolute inset-x-0 text-center text-base font-semibold text-default">{title}</h2>
    </div>
  );
}

export function PrimaryButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 flex-shrink-0 items-center gap-3 whitespace-nowrap rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 flex-shrink-0 items-center gap-3 whitespace-nowrap rounded-lg border border-invert-default bg-surface px-5 text-sm font-semibold text-default hover:bg-default-soft transition-colors ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
