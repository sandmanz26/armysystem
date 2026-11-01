import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function RankModal({ mode, rank, onClose, onConfirm }) {
  const [rankName, setRankName] = useState(rank?.rank ?? "");
  const [sequence, setSequence] = useState(rank ? String(rank.sequence) : "");
  const [status, setStatus] = useState(rank?.status ?? "Active");

  useEffect(() => {
    setRankName(rank?.rank ?? "");
    setSequence(rank ? String(rank.sequence) : "");
    setStatus(rank?.status ?? "Active");
  }, [rank]);

  const isEdit = mode === "edit";
  const isValid = rankName.trim() !== "" && sequence !== "" && !isNaN(Number(sequence));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-[1110] w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Rank" : "Add Rank"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? `Editing: ${rank?.rank}` : "Fill in the rank information below."}
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
          {/* Rank */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Rank <span className="text-red-500">*</span>
            </label>
            <InputCustom
              type="text"
              value={rankName}
              onChange={(e) => setRankName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              placeholder="Enter rank (e.g. CPT)"
              autoFocus
            />
          </div>

          {/* Sequence */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Sequence <span className="text-red-500">*</span>
            </label>
            <InputCustom
              type="number"
              min={1}
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
              placeholder="Enter sequence number"
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
            onClick={() => { if (isValid) onConfirm(rankName.trim(), Number(sequence), status); }}
            disabled={!isValid}
            className={cn("flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent", !isValid && "opacity-40 cursor-not-allowed")}
          >
            {isEdit ? "Save Changes" : "Create Rank"}
          </Button>
        </div>
      </div>
    </>
  );
}
