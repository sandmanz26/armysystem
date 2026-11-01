import { useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/modal-1";
import {
  AttachmentField,
  Dropzone,
  type AttachmentStatus,
  type PickedFile,
} from "@/components/file-upload";

/*
 * Import modal — Figma `Action - Import (Booking Details)` (6046:35382 …35426)
 * and `Action - Import (Leaderboard)` (6046:33925 …33933).
 *
 * Both share the same shell:
 *   header   "Import Booking"  (Figma uses this title on BOTH tabs)
 *   §1       "1. Download the template" / "Use this template with predefined
 *            columns, and fill in your data." + one outline download button per
 *            template
 *   §2       "2. Import File" / "Once you've filled out the template, import it."
 *   footer   Cancel · Import
 *
 * The "1./2." aren't literal characters on the heading text node — Figma
 * applies them as native ORDERED-LIST paragraph styling
 * (`getStyledTextSegments(['listOptions'])` → `{ type: "ORDERED" }`), so a
 * plain read of `node.characters` returns "Download the template " with no
 * numeral at all. Only a rendered screenshot of the frame shows them. See
 * figma-slicing PITFALLS.md #6.
 *
 * They differ only in the pick UI:
 *   Booking Details → two `Input-Attachment` fields, "Booking File *" and
 *                     "Nominal Roll List *", each with a Browse File button
 *   Leaderboard     → one `Dropzone` ("Drag and drop to upload file")
 *
 * Per-file states, verbatim from the frames:
 *   "Checking file..."
 *   "18 rows ready to import"
 *   "Couldn't import, 3 of 18 rows have errors"
 *   "Couldn't import, 2 of 18 rows have SERVICE_IDs already in the list"
 */

const TOTAL_ROWS = 18;

/** Figma's states in order; cycled here so every one is reachable in the demo. */
const OUTCOMES: AttachmentStatus[] = [
  { state: "ready", message: `${TOTAL_ROWS} rows ready to import` },
  { state: "error", message: `Couldn't import, 3 of ${TOTAL_ROWS} rows have errors` },
  {
    state: "error",
    message: `Couldn't import, 2 of ${TOTAL_ROWS} rows have SERVICE_IDs already in the list`,
  },
];

const EMPTY: AttachmentStatus = { state: "empty" };

function useAttachment(outcomeIndex: () => number) {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [status, setStatus] = useState<AttachmentStatus>(EMPTY);

  const pick = (f: File) => {
    setFile({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)}MB` });
    setStatus({ state: "checking", message: "Checking file..." });
    // Figma has a "Checking file..." frame before the result — keep the beat.
    window.setTimeout(() => setStatus(OUTCOMES[outcomeIndex() % OUTCOMES.length]), 900);
  };

  const remove = () => {
    setFile(null);
    setStatus(EMPTY);
  };

  const reset = remove;

  return { file, status, pick, remove, reset };
}

export interface ImportModalProps {
  open: boolean;
  variant: "booking" | "leaderboard";
  onClose: () => void;
  onImport: (fileName: string) => void;
}

export function ImportModal({ open, variant, onClose, onImport }: ImportModalProps) {
  const [picks, setPicks] = useState(0);

  const primary = useAttachment(() => picks);
  const secondary = useAttachment(() => picks + 1);

  const isBooking = variant === "booking";

  const bump = () => setPicks((p) => p + 1);

  const ready = isBooking
    ? primary.status.state === "ready" && secondary.status.state === "ready"
    : primary.status.state === "ready";

  const clear = () => {
    primary.reset();
    secondary.reset();
  };

  /** Cancel / X — the caller decides whether that needs a discard confirmation. */
  const close = () => {
    clear();
    onClose();
  };

  /** Import — hands the file up. It must NOT run `onClose`: on the Leaderboard
   *  tab that is wired to the discard confirmation, so a successful import used
   *  to pop "Discard this import?" on top of itself. */
  const submit = () => {
    onImport(primary.file?.name ?? "filename.csv");
    clear();
  };

  return (
    <Modal open={open} onClose={close} title="Import Booking" width={768}>
      <div className="flex flex-col gap-5 pt-2">
        {/*
         * §1 Download the template — Figma's `Section Layout` puts the title/
         * subtitle and the download button(s) in ONE row (Section Header's
         * Left Content + Right Content), not stacked. The previous pass put
         * the buttons on their own line below.
         */}
        <section className="flex items-center justify-between gap-4 rounded-xl border border-invert-default bg-surface p-5">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-default">1. Download the template</h3>
            <p className="text-sm text-body">
              Use this template with predefined columns, and fill in your data.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-3">
            {(isBooking
              ? ["Booking Template", "Nominal Roll Template"]
              : ["Leaderboard Template"]
            ).map((t) => (
              <button
                key={t}
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
              >
                <Download size={16} />
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* §2 Import File — no Right Content here, so title/subtitle stay stacked */}
        <section className="flex flex-col gap-5 rounded-xl border border-invert-default bg-surface p-5">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-default">2. Import File</h3>
            <p className="text-sm text-body">
              Once you&rsquo;ve filled out the template, import it.
            </p>
          </div>

          {isBooking ? (
            <div className="flex flex-col gap-5">
              <AttachmentField
                id="import-booking-file"
                label="Booking File"
                required
                file={primary.file}
                status={primary.status}
                onPick={(f) => {
                  bump();
                  primary.pick(f);
                }}
                onRemove={primary.remove}
              />
              <AttachmentField
                id="import-nominal-roll"
                label="Nominal Roll List"
                required
                file={secondary.file}
                status={secondary.status}
                onPick={(f) => {
                  bump();
                  secondary.pick(f);
                }}
                onRemove={secondary.remove}
              />
            </div>
          ) : (
            <Dropzone
              id="import-leaderboard-file"
              file={primary.file}
              status={primary.status}
              onPick={(f) => {
                bump();
                primary.pick(f);
              }}
              onRemove={primary.remove}
            />
          )}
        </section>

        {/* Footer — Figma carries no divider above it, just the modal's own spacing */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={submit}
            className={
              ready
                ? "h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                : "h-10 cursor-not-allowed rounded-lg bg-disabled px-4 text-sm font-semibold text-body"
            }
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  );
}
