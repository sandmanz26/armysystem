// Booking 2.0 Nominal Roll — "Import Nominal Roll List" modal, per the
// screenshot. New file, local to booking-2. File upload is a UI-only stub
// (clicking "Browse File" attaches a mock "filename.csv") — there's no backend to parse
// spreadsheets against in this mock app, same as the existing app's Upload
// List modal.
//
// File states (C-22) — Figma Create Booking › Nominal Roll (5313:13115), `Action - Import List`:
//   Filled 5328:233763 / 5601:323371: attachment chip "filename.csv (0.2MB)" + ✕, caption
//     "Checking file..." (loader-circle) → "18 rows ready to import" (circle-check, success)
//   Error - File Error 5427:167399: "Couldn't import, 3 of 18 rows have errors" (danger)
//   Error - Duplicated Service ID 5427:167634: "Couldn't import, 2 of 18 rows have SERVICE_IDs already in the list"
//   Footer button "Import 1 File" = number of files that passed the check.
// The mock has no real file to check, so outcomes rotate per attached file: 1st ready, 2nd row
// errors, 3rd duplicated SERVICE_IDs, then again — the only way to reach Figma's error frames by clicking.
// Also used read-only by Booking Details › Nominal Roll (detail/components/NominalRollTab.tsx).
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/** Figma sample: every mock file holds 18 rows. */
export const IMPORT_FILE_ROWS = 18;
const CHECK_MS = 1200;

type FileStatus = "checking" | "ready" | "error" | "duplicate";
const OUTCOMES: Exclude<FileStatus, "checking">[] = ["ready", "error", "duplicate"];

interface ImportNominalRollModalProps {
  coursewareList: string[];
  hasCShaped: (cw: string) => boolean;
  onClose: () => void;
  /** Called with the cells ("{courseware}::{flat|cshaped}") whose file passed the check, and the upload method. */
  onImport: (readyCells: string[], method: "separated" | "shared") => void;
}

export function ImportNominalRollModal({ coursewareList, hasCShaped, onClose, onImport }: ImportNominalRollModalProps) {
  // A single-courseware booking has no ambiguity to resolve (there's only one
  // courseware to upload against either way), so the method-selection step
  // is skipped entirely and the remaining steps renumber down by one.
  const isSingleCourseware = coursewareList.length <= 1;
  const [method, setMethod] = useState<"separated" | "shared">("separated");
  const [files, setFiles] = useState<Record<string, FileStatus>>({});
  const attachCount = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const attach = (key: string) => {
    const outcome = OUTCOMES[attachCount.current % OUTCOMES.length];
    attachCount.current += 1;
    setFiles((prev) => ({ ...prev, [key]: "checking" }));
    timers.current.push(window.setTimeout(() => {
      setFiles((prev) => (prev[key] === "checking" ? { ...prev, [key]: outcome } : prev));
    }, CHECK_MS));
  };
  const remove = (key: string) => setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const readyCells = Object.keys(files).filter((k) => files[k] === "ready");

  const renderCell = (key: string) => {
    const status = files[key];
    if (!status) {
      return (
        <button
          type="button"
          onClick={() => attach(key)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed w-fit border-figma-primary/40 text-figma-primary hover:bg-figma-dangersoft"
        >
          <Icon name="upload" size={13} />
          Browse File
        </button>
      );
    }
    return (
      <div className="flex w-[280px] max-w-full flex-col gap-1">
        <div className="flex items-center gap-2 rounded-lg bg-default-soft px-4 py-2.5">
          <Icon name="file" size={18} className="flex-shrink-0 text-default" />
          <span className="min-w-0 flex-1 truncate text-sm text-default">
            filename.csv <span className="text-body">(0.2MB)</span>
          </span>
          <button type="button" onClick={() => remove(key)} aria-label="Remove file" className="flex-shrink-0 text-default hover:text-body">
            <Icon name="x" size={18} />
          </button>
        </div>
        {status === "checking" && (
          <p className="flex items-center gap-1 text-xs text-caption"><Icon name="loader-circle" size={14} className="animate-spin" />Checking file...</p>
        )}
        {status === "ready" && (
          <p className="flex items-center gap-1 text-xs text-success"><Icon name="circle-check" size={14} />{IMPORT_FILE_ROWS} rows ready to import</p>
        )}
        {status === "error" && (
          <p className="text-xs text-danger">Couldn't import, 3 of {IMPORT_FILE_ROWS} rows have errors</p>
        )}
        {status === "duplicate" && (
          <p className="text-xs text-danger">Couldn't import, 2 of {IMPORT_FILE_ROWS} rows have SERVICE_IDs already in the list</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[820px] max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-figma-subtle flex-shrink-0">
            <h3 className="text-lg font-bold text-figma-default">Import Nominal Roll List</h3>
            <button type="button" onClick={onClose} className="text-figma-disabled hover:text-figma-caption"><Icon name="x" size={18} /></button>
          </div>

          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5">
            {!isSingleCourseware && (
              <div className="border border-figma-subtle rounded-lg p-4">
                <p className="text-sm font-bold text-figma-default">1. Select your upload method</p>
                <p className="text-xs text-figma-body mb-3">Choose how you'd like to fill in this booking's nominal roll.</p>
                <div className="space-y-3">
                  {[
                    { id: "separated" as const, label: "Separated", desc: "Upload a different file for each courseware's Flat Screen and C-Shaped lists." },
                    { id: "shared" as const, label: "Shared", desc: "Upload one file for Flat Screens and one for C-Shaped, applied to every courseware." },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                      <span
                        onClick={() => setMethod(opt.id)}
                        className={cn("w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center", method === opt.id ? "border-figma-primary" : "border-figma-strong")}
                      >
                        {method === opt.id && <span className="w-2 h-2 rounded-full bg-figma-primary" />}
                      </span>
                      <span onClick={() => setMethod(opt.id)}>
                        <span className="block text-sm font-semibold text-figma-default">{opt.label}</span>
                        <span className="block text-xs text-figma-body">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-figma-subtle rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-figma-default">{isSingleCourseware ? "1" : "2"}. Download the template</p>
                <p className="text-xs text-figma-body">Use these templates with predefined columns, and fill in your nominal roll data.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white whitespace-nowrap">
                  <Icon name="download" size={13} /> Flat Screen Template
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white whitespace-nowrap">
                  <Icon name="download" size={13} /> C-Shaped Template
                </button>
              </div>
            </div>

            <div className="border border-figma-subtle rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-figma-subtle">
                <p className="text-sm font-bold text-figma-default">{isSingleCourseware ? "2" : "3"}. Import Nominal Roll List</p>
                <p className="text-xs text-figma-body">Once you've filled out the template, import it.</p>
              </div>
              <div className="grid grid-cols-3 bg-figma-dangersoft/70 text-xs font-bold text-figma-primary px-4 py-2.5">
                <span>Courseware</span>
                <span>Flat Screens</span>
                <span>C-Shaped</span>
              </div>
              {coursewareList.map((cw, idx) => {
                const flatKey = `${cw}::flat`;
                const cshapedKey = `${cw}::cshaped`;
                const showCShaped = method === "separated" ? hasCShaped(cw) : idx === 0;
                return (
                  <div key={cw} className="grid grid-cols-3 items-start gap-4 px-4 py-3 border-t border-gray-50">
                    <span className="py-2.5 text-sm text-figma-default">{cw}</span>
                    <div>{renderCell(flatKey)}</div>
                    {showCShaped ? <div>{renderCell(cshapedKey)}</div> : <span />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-figma-subtle flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Cancel
            </button>
            <button
              type="button"
              disabled={readyCells.length === 0}
              onClick={() => onImport(readyCells, method)}
              className={cn("px-4 py-2 text-sm font-semibold text-white rounded-lg", readyCells.length > 0 ? "bg-figma-primary hover:bg-figma-primaryhover" : "bg-gray-300 cursor-not-allowed")}
            >
              {readyCells.length > 0 ? `Import ${readyCells.length} File${readyCells.length > 1 ? "s" : ""}` : "Import"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
