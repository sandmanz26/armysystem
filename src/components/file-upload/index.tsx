import { useRef, useState } from "react";
import { File as FileIcon, LoaderCircle, CircleCheck, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * File upload — design-system components.
 *
 * Figma `Input-Attachment`, `Attachment Item`, `Dropzone` and
 * `Dropzone Attachment Item`, measured on Data Import
 * (`Action - Import (Booking Details)` 6046:35382… and
 *  `Action - Import (Leaderboard)` 6046:33925…).
 *
 * `AttachmentField`  label + an empty-state "Browse File" button; once a file
 *                    is picked the row becomes name · size · status.
 * `Dropzone`         the bordered drop area — "Drag and drop to upload file",
 *                    "Max file size is 4 MB", then the same "Browse File"
 *                    button and the same picked-file row.
 *
 * Re-read against the frames on 23 Sep 2026 — three real mismatches fixed:
 *   · The empty state was a full-width bordered row with "No file selected"
 *     text and the button pushed to the right. Figma has neither the row nor
 *     the text — just the dashed "Browse File" button on its own (136×40,
 *     `border/primary` DASHED [4,4], `bg/surface`, `text/primary`, and a small
 *     upload-icon prefix this file had dropped entirely).
 *   · The picked-file row (`Attachment Item`) carried a border and sat on
 *     `bg-surface`. Figma's box has NO stroke at all and fills
 *     `background/default/soft` — a flat, borderless chip.
 *   · The status caption sat INSIDE that bordered box. In Figma `Caption` is
 *     a separate line below the (unbordered) row, not nested inside it.
 *
 * Both share `AttachmentStatus`, which carries Figma's three post-pick states:
 *   checking → `Icon / loader-circle` + "Checking file..."       (text/caption)
 *   ready    → `Icon / circle-check`  + "N rows ready to import" (text/success)
 *   error    → the danger message, NO icon, e.g.
 *              "Couldn't import, 3 of 18 rows have errors"       (text/danger)
 */

export type AttachmentState = "empty" | "checking" | "ready" | "error";

export interface AttachmentStatus {
  state: AttachmentState;
  /** Status line under the file name. Figma words it per state. */
  message?: string;
}

export interface PickedFile {
  name: string;
  /** Pre-formatted, e.g. "0.2MB" — Figma shows it beside the name. */
  size: string;
}

function StatusLine({ status }: { status: AttachmentStatus }) {
  if (status.state === "empty" || !status.message) return null;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        status.state === "error" ? "text-danger" : status.state === "ready" ? "text-success" : "text-caption",
      )}
    >
      {status.state === "checking" && <LoaderCircle size={14} className="animate-spin" />}
      {status.state === "ready" && <CircleCheck size={14} />}
      {status.message}
    </span>
  );
}

/** Figma's dashed, primary-coloured "Browse File" affordance — the ENTIRE
 *  empty state, not a row with a button in it. Shared by `AttachmentField`
 *  and `Dropzone`, which both fall back to it. */
function BrowseFileButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-dashed border-primary bg-surface px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft transition-colors"
    >
      <Upload size={18} />
      Browse File
    </button>
  );
}

function AttachmentRow({
  file,
  status,
  onRemove,
}: {
  file: PickedFile;
  status: AttachmentStatus;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-10 items-center gap-2 rounded-lg bg-default-soft px-4">
        <FileIcon size={18} className="shrink-0 text-body" />
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="truncate text-sm text-default">{file.name}</span>
          <span className="shrink-0 text-xs text-body">({file.size})</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="shrink-0 text-default hover:opacity-70 transition-opacity"
        >
          <X size={18} />
        </button>
      </div>
      <StatusLine status={status} />
    </div>
  );
}

export interface AttachmentFieldProps {
  label: React.ReactNode;
  required?: boolean;
  file: PickedFile | null;
  status: AttachmentStatus;
  onPick: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  id?: string;
}

export function AttachmentField({
  label,
  required,
  file,
  status,
  onPick,
  onRemove,
  accept = ".csv",
  id,
}: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-0.5 text-sm font-medium text-default">
        {label}
        {required && <span className="text-danger">*</span>}
      </span>

      {file ? (
        <AttachmentRow file={file} status={status} onRemove={onRemove} />
      ) : (
        <BrowseFileButton onClick={() => inputRef.current?.click()} />
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export interface DropzoneProps {
  file: PickedFile | null;
  status: AttachmentStatus;
  onPick: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  /** Figma: "Max file size is 4 MB". */
  hint?: string;
  id?: string;
}

export function Dropzone({
  file,
  status,
  onPick,
  onRemove,
  accept = ".csv",
  hint = "Max file size is 4 MB",
  id,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  if (file) return <AttachmentRow file={file} status={status} onRemove={onRemove} />;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onPick(f);
      }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed bg-default-soft px-6 py-8 transition-colors",
        over ? "border-primary bg-primary-invert-soft" : "border-invert-default",
      )}
    >
      <Upload size={24} className="text-primary" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-medium text-default">Drag and drop to upload file</span>
        <span className="text-xs text-body">{hint}</span>
      </div>
      <BrowseFileButton onClick={() => inputRef.current?.click()} />
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
