// MST Create Booking — Step 4: "Import Nominal Roll List" modal (CM-4, template + error states).
//
// No MST frame (6183:481240 is an WPT clone). Built from the WPT `Action - Import List (Single CW)` frames
// on the same page: Separate 6183:481373 · Separate - Filled 6183:481365 · Error - File Error 6183:481369 ·
// Error - Duplicated Service ID with the Roll List 6183:481371:
//   attachment chip "filename.csv (0.2MB)" + ✕ · "Checking file..." → "18 rows ready to import" ·
//   "Couldn't import, 3 of 18 rows have errors" · "Couldn't import, 2 of 18 rows have SERVICE_IDs already in the list" ·
//   footer "Cancel" / "Import" → "Import 1 File".
// What is MST's own: one file slot per IOS tab (each IOS keeps its own roll) instead of WPT's Flat Screen /
// C-Shaped columns, and one "Nominal Roll Template" button (Figma has "Flat Screen Template" / "C-Shaped Template").
// File upload is a UI-only stub (Browse File attaches a mock "filename.csv"); outcomes rotate ready → row errors →
// duplicate SERVICE_IDs so every Figma state can be reached by clicking.
// It replaces the drag-and-drop "Upload List" modal (`MSTUploadListModal`, still used by Booking Detail).
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/modal-1";
import { cn } from "@/lib/utils";

/** Figma sample: every mock file holds 18 rows. */
export const MST_IMPORT_FILE_ROWS = 18;
const CHECK_MS = 1200;

type FileStatus = "checking" | "ready" | "error" | "duplicate";
const OUTCOMES: Exclude<FileStatus, "checking">[] = ["ready", "error", "duplicate"];

export function MSTImportRollModal({ stations, onClose, onImport }: {
  /** One label per IOS tab. */
  stations: string[];
  onClose: () => void;
  /** Indexes of the tabs whose file passed the check. */
  onImport: (readyStationIdx: number[]) => void;
}) {
  const [files, setFiles] = useState<Record<number, FileStatus>>({});
  const attachCount = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const attach = (idx: number) => {
    const outcome = OUTCOMES[attachCount.current % OUTCOMES.length];
    attachCount.current += 1;
    setFiles((p) => ({ ...p, [idx]: "checking" }));
    timers.current.push(window.setTimeout(() => setFiles((p) => (p[idx] === "checking" ? { ...p, [idx]: outcome } : p)), CHECK_MS));
  };
  const remove = (idx: number) => setFiles((p) => { const n = { ...p }; delete n[idx]; return n; });
  const ready = Object.keys(files).map(Number).filter((i) => files[i] === "ready");

  const slot = (idx: number) => {
    const status = files[idx];
    if (!status) {
      return (
        <button type="button" onClick={() => attach(idx)} className="flex h-9 w-fit items-center gap-2 rounded-lg border border-dashed border-primary px-4 text-sm font-semibold text-primary hover:bg-primary-invert-soft">
          <Icon name="file-up" size={16} />Browse File
        </button>
      );
    }
    return (
      <div className="flex w-[300px] max-w-full flex-col gap-1">
        <div className="flex items-center gap-2 rounded-lg bg-default-soft px-4 py-2.5">
          <Icon name="file" size={18} className="flex-shrink-0 text-default" />
          <span className="min-w-0 flex-1 truncate text-sm text-default">filename.csv <span className="text-body">(0.2MB)</span></span>
          <button type="button" onClick={() => remove(idx)} aria-label="Remove file" className="flex-shrink-0 text-default hover:text-body"><Icon name="x" size={18} /></button>
        </div>
        {status === "checking" && <p className="flex items-center gap-1 text-xs text-caption"><Icon name="loader-circle" size={14} className="animate-spin" />Checking file...</p>}
        {status === "ready" && <p className="flex items-center gap-1 text-xs text-success"><Icon name="circle-check" size={14} />{MST_IMPORT_FILE_ROWS} rows ready to import</p>}
        {status === "error" && <p className="text-xs text-danger">Couldn't import, 3 of {MST_IMPORT_FILE_ROWS} rows have errors</p>}
        {status === "duplicate" && <p className="text-xs text-danger">Couldn't import, 2 of {MST_IMPORT_FILE_ROWS} rows have SERVICE_IDs already in the list</p>}
      </div>
    );
  };

  return (
    <Modal open onClose={onClose} width={720} isUseX={false}>
      <div className="-m-6 flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-6 p-8 pb-4">
          <h3 className="text-xl font-semibold text-default">Import Nominal Roll List</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-default"><Icon name="x" size={18} /></button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-8 py-2">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-invert-default p-4">
            <div>
              <p className="text-sm font-semibold text-default">1. Download the template</p>
              <p className="text-xs text-body">Use these templates with predefined columns, and fill in your nominal roll data.</p>
            </div>
            <button type="button" className="flex h-9 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">
              <Icon name="download" size={16} />Nominal Roll Template
            </button>
          </div>

          <div className="rounded-lg border border-invert-default">
            <div className="p-4">
              <p className="text-sm font-semibold text-default">2. Import Nominal Roll List</p>
              <p className="text-xs text-body">Once you’ve filled out the template, import it.</p>
            </div>
            {stations.map((label, idx) => (
              <div key={idx} className={cn("flex items-start justify-between gap-4 border-t border-invert-default px-4 py-3", stations.length === 1 && "justify-end")}>
                {stations.length > 1 && <span className="py-2 text-sm text-default">{label}</span>}
                {slot(idx)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-8 pt-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft">Cancel</button>
          <button
            type="button" disabled={ready.length === 0} onClick={() => onImport(ready)}
            className={cn("h-10 rounded-lg px-4 text-sm font-semibold text-invert-default", ready.length > 0 ? "bg-primary-default hover:bg-primary-hovered" : "cursor-not-allowed bg-disabled text-disabled")}
          >
            {ready.length > 0 ? `Import ${ready.length} File${ready.length > 1 ? "s" : ""}` : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
