import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function RoleModal({ mode, role, onClose, onConfirm }) {
  const [name, setName] = useState(role?.name ?? "");
  const [status, setStatus] = useState(role?.status ?? "Active");
  const open = true;

  useEffect(() => {
    setName(role?.name ?? "");
    setStatus(role?.status ?? "Active");
  }, [role]);

  const isEdit = mode === "edit";
  const canSubmit = name.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1110] w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit User Role" : "Add User Role"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? `Editing: ${role?.name}` : "Fill in the role information below."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* User Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              User Role <span className="text-red-500">*</span>
            </label>
            <InputCustom
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              placeholder="Enter user role name"
              autoFocus
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all cursor-pointer pr-8"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={() => { if (canSubmit) onConfirm(name.trim(), status); }}
            disabled={!canSubmit}
            className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent disabled:opacity-40"
          >
            {isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </div>
    </>
  );
}
