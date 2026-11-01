import { useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export const EXPORT_SCOPES = ["Booking Details", "Nominal Roll", "Cabin Configuration", "All"] as const;
export type ExportScope = typeof EXPORT_SCOPES[number];

export const EXPORT_FORMATS = ["Excel", "PDF"] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

export function ExportBookingModal({
  onClose, onExport,
}: {
  onClose: () => void;
  onExport: (scope: ExportScope, format: ExportFormat) => void;
}) {
  const [scope, setScope]   = useState<ExportScope>("All");
  const [format, setFormat] = useState<ExportFormat>("Excel");

  const showSheetNote = scope === "All" && format === "Excel";

  return (
    <Modal open={true} onClose={onClose} width={480}>
      <div className="flex items-center gap-4 mb-6 -mt-2">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Download size={22} className="text-brand-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Export Booking Data</h3>
          <p className="text-sm text-gray-500 mt-0.5">Choose what to export and in which format.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            What to export <span className="text-brand-primary">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPORT_SCOPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors",
                  scope === s
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Format <span className="text-brand-primary">*</span>
          </label>
          <div className="flex gap-2">
            {EXPORT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                  format === f
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {showSheetNote && (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
            Booking Details, Nominal Roll, and Cabin Configuration will each be exported as a separate sheet tab in the Excel file.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
        <Button
          className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent flex items-center gap-2"
          onClick={() => onExport(scope, format)}
        >
          <Download size={14} /> Export
        </Button>
      </div>
    </Modal>
  );
}
