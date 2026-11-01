import { useState } from "react";
import { Info, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VersionEntry } from "../types";

interface AddVersionDrawerProps {
  mode: "add" | "edit";
  initial?: VersionEntry;
  /** Used for Figma's "Version already existed" error. */
  existingVersions?: string[];
  onClose: () => void;
  onConfirm: (v: Omit<VersionEntry, "id">) => void;
}

/**
 * Figma `Drawer Right` on the System Version page — sections "Add Version"
 * (`Add - Empty` / `Add - Filled` / `Add - Filled Error` / `Empty Error`) and
 * "Action - Edit Version".
 *
 * Differences this rewrite fixes against the previous vibe-coded drawer:
 *  - width 384, not 480; surface `color/background/modal`
 *  - header is title + close icon only — no coloured status circle and no
 *    "Please fill all the information." subtitle
 *  - 1px rules are `color/background/divider`, not a gray border
 *  - primary action reads **Create Version** (add) / **Confirm** (edit)
 *  - the two error states exist: Figma leaves the primary button enabled and
 *    shows `color/text/danger` captions with `color/border/danger` inputs, so
 *    validation now runs on submit instead of disabling the button
 *  - "Version already existed" is a real duplicate check, hence
 *    `existingVersions`
 */
export function AddVersionDrawer({
  mode,
  initial,
  existingVersions = [],
  onClose,
  onConfirm,
}: AddVersionDrawerProps) {
  const isEdit = mode === "edit";

  const [version, setVersion] = useState(initial?.version ?? "");
  const [notes, setNotes] = useState<string[]>(
    initial?.patchNotes?.length ? initial.patchNotes : [""]
  );
  const [submitted, setSubmitted] = useState(false);

  const addNote = () => setNotes((prev) => [...prev, ""]);
  const removeNote = (i: number) =>
    setNotes((prev) => prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i));
  const updateNote = (i: number, val: string) =>
    setNotes((prev) => prev.map((n, idx) => (idx === i ? val : n)));

  const trimmed = version.trim();
  const duplicate =
    trimmed !== "" &&
    trimmed !== initial?.version &&
    existingVersions.some((v) => v.toLowerCase() === trimmed.toLowerCase());
  const versionError = trimmed === "" ? "Version is required" : duplicate ? "Version already existed" : null;
  const notesError = notes.some((n) => n.trim() !== "")
    ? null
    : "At least 1 patch note is required. Each line is a separate bullet point in the patch notes.";

  const handleConfirm = () => {
    setSubmitted(true);
    if (versionError || notesError) return;
    const now = new Date();
    const date =
      now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      "\n" +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const patchNotes = notes.map((n) => n.trim()).filter(Boolean);
    onConfirm({
      version: trimmed,
      date: isEdit && initial ? initial.date : date,
      patchNotes: patchNotes.length ? patchNotes : ["Release"],
    });
    onClose();
  };

  const inputBase =
    "w-full h-10 px-3 text-sm rounded-lg bg-surface text-default placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[2000] bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[2100] w-96 bg-modal shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">
        {/* Drawer Header — 64 tall */}
        <div className="flex items-center justify-between gap-3 h-16 pl-6 pr-3 flex-shrink-0">
          <h2 className="text-base font-semibold text-default">
            {isEdit ? "Edit Version" : "Add Version"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-default hover:bg-default-hovered transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-px w-full bg-divider flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-default mb-1">
              Version <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Enter Version Name (e.g., 0.1.1)"
              autoFocus
              className={cn(
                inputBase,
                "border",
                submitted && versionError ? "border-danger" : "border-invert-default focus:border-primary",
              )}
            />
            {submitted && versionError && (
              <p className="mt-1 text-xs text-danger">{versionError}</p>
            )}
          </div>

          {/* Patch Notes — repeatable input */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="flex items-center gap-1 text-sm font-medium text-default">
                Patch Notes <span className="text-danger">*</span>
                <Info size={14} className="text-caption" />
              </label>
              <button
                type="button"
                onClick={addNote}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
              >
                <Plus size={14} /> Add Note
              </button>
            </div>

            <div className="rounded-lg bg-default-default p-2 space-y-2">
              {notes.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 flex-shrink-0 text-sm text-body">{i + 1}.</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => updateNote(i, e.target.value)}
                    placeholder={`Patch Note ${i + 1}`}
                    className={cn(
                      inputBase,
                      "flex-1 border",
                      submitted && notesError ? "border-danger" : "border-invert-default focus:border-primary",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeNote(i)}
                    className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-default hover:bg-default-hovered transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <p className={cn("mt-1 text-xs", submitted && notesError ? "text-danger" : "text-caption")}>
              {submitted && notesError
                ? notesError
                : "Each line is a separate bullet point in the patch notes."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-px w-full bg-divider flex-shrink-0" />
        <div className="h-20 px-5 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg bg-surface border border-invert-default text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-5 rounded-lg bg-primary-default hover:bg-primary-hovered text-sm font-semibold text-invert-default transition-colors"
          >
            {isEdit ? "Confirm" : "Create Version"}
          </button>
        </div>
      </div>
    </>
  );
}
