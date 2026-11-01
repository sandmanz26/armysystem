import { useState } from "react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function MaskServiceId() {
  const [value, setValue] = useState("enable");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Mask Service ID</h2>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Mask Service ID</p>
          <p className="text-xs text-gray-400 mb-4">
            When enabled, Service ID numbers will be partially masked (e.g. ****567A) across the system.
          </p>

          <div className="flex items-center gap-6">
            {["disable", "enable"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setValue(opt)}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    value === opt ? "border-brand-primary" : "border-gray-300 group-hover:border-brand-primary"
                  )}
                >
                  {value === opt && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                </div>
                <span className="text-sm text-gray-700 capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {value === "enable" && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">Original:</span>
              <code className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono text-gray-700">A1234567</code>
              <span className="text-gray-400">→</span>
              <span className="text-gray-400">Masked:</span>
              <code className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono text-brand-primary">****567A</code>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 w-fit bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Save Changes
        </Button>
        {saved && <span className="text-xs text-green-600 font-medium">✓ Saved successfully</span>}
      </div>
    </div>
  );
}
