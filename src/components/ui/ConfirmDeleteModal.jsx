import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmDeleteModal({ open, title, description, count, onClose, onConfirm }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1200] bg-black/40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 z-[1210] w-full max-w-sm bg-white rounded-2xl shadow-2xl transition-all duration-200",
          open ? "-translate-y-1/2 opacity-100" : "-translate-y-[45%] opacity-0 pointer-events-none"
        )}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Text */}
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {title ?? "Delete Confirmation"}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description ?? (count > 1
              ? `Are you sure you want to delete ${count} selected items? This action cannot be undone.`
              : "Are you sure you want to delete this item? This action cannot be undone."
            )}
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Delete{count > 1 ? ` (${count})` : ""}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
