import { TriangleAlert } from "lucide-react";

interface DeleteConfirmDialogProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Dialog heading. Defaults to "Confirm Delete" — pass e.g. "Confirm Archive" to reuse this dialog for other destructive-ish actions. */
  title?: string;
  /** Confirm button label. Defaults to "Delete". */
  confirmLabel?: string;
}

/**
 * Figma `Modal Confirmation - Delete` (read off the System Version page,
 * section "Action - Delete Version"): Modal 384×188, radius 16, fill
 * `color/background/modal`.
 *
 * Every colour here used to be a raw Tailwind shade, and two of them were
 * simply the wrong hue:
 *  - the icon badge is `color/background/warning/invert/default` with a
 *    `color/text/warning` glyph — amber, not `bg-red-100` / `text-red-600`;
 *  - the confirm button is `color/background/primary/default` (brand maroon)
 *    with a `color/text/base` label — **not** `bg-red-600`. Figma uses the
 *    normal primary button for the destructive action in this modal.
 *
 * Title is 20 Semi Bold `color/text/default`; the line under it is 14 Regular
 * `color/text/caption`. Buttons sit right-aligned at their natural widths
 * (Cancel 80, confirm 76) rather than splitting the row.
 */
export function DeleteConfirmDialog({
  message,
  onCancel,
  onConfirm,
  title = "Confirm Delete",
  confirmLabel = "Delete",
}: DeleteConfirmDialogProps) {
  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onCancel} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
        <div className="bg-modal rounded-2xl shadow-xl w-full max-w-96 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-warning-invert-default flex items-center justify-center flex-shrink-0">
              <TriangleAlert size={24} className="text-warning" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-default">{title}</h3>
              <p className="mt-1 text-sm text-caption">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 px-5 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-10 px-5 rounded-lg bg-primary-default hover:bg-primary-hovered text-sm font-semibold text-invert-default transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
