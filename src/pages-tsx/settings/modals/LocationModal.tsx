import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import type { RoomEntry } from "../types";

interface LocationModalProps {
  mode: "add" | "edit";
  initial?: RoomEntry;
  onClose: () => void;
  onConfirm: (entry: Omit<RoomEntry, "id">) => void;
}

export function LocationModal({ mode, initial, onClose, onConfirm }: LocationModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initial?.status ?? "Active");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [nameError, setNameError] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleConfirm = () => {
    if (!name.trim()) { setNameError(true); return; }
    onConfirm({ name: name.trim(), status, description });
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} width={448} isUseX={false}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {mode === "add" ? "Add Location" : "Edit Location"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-brand-primary">*</span>
          </label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
            placeholder="Enter location name (e.g, location 1,etc)"
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
              nameError ? "border-red-500" : "border-gray-200"
            )}
          />
          {nameError && <p className="mt-1 text-xs text-red-500">Name is required</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-brand-primary">*</span>
          </label>
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setStatusOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <span className="text-gray-800">{status}</span>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")} />
            </button>
            {statusOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {(["Active", "Inactive"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setStatus(opt); setStatusOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50",
                      status === opt ? "text-brand-primary font-medium" : "text-gray-700"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onClose}
          type="outline"
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
