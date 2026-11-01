import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function LocationModal({ open, mode, initial, onClose, onConfirm }) {
    const [name, setName] = useState(initial?.name ?? "");
    const [status, setStatus] = useState(initial?.status ?? "Active");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [nameError, setNameError] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef(null);

    useEffect(() => {
        if (open) { setName(initial?.name ?? ""); setStatus(initial?.status ?? "Active"); setDescription(initial?.description ?? ""); setNameError(false); }
    }, [open, initial]);

    useEffect(() => {
        const h = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const handleConfirm = () => {
        if (!name.trim()) { setNameError(true); return; }
        onConfirm({ name: name.trim(), status, description });
        onClose();
    };

    const isEdit = mode === "edit";

    return (
        <>
            <div className={cn("fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />
            <div className={cn("fixed inset-y-0 right-0 z-[1110] w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full")}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit Location" : "Add Location"}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{isEdit ? initial?.name : "Fill in the location information below."}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-brand-primary">*</span></label>
                        <input type="text" value={name} autoFocus onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                            placeholder="Enter location name (e.g, location 1,etc)"
                            className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary", nameError ? "border-red-500" : "border-gray-200")} />
                        {nameError && <p className="mt-1 text-xs text-red-500">Name is required</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-brand-primary">*</span></label>
                        <div className="relative" ref={statusRef}>
                            <button type="button" onClick={() => setStatusOpen((o) => !o)} className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary">
                                <span className="text-gray-800">{status}</span>
                                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", statusOpen && "rotate-180")} />
                            </button>
                            {statusOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {["Active", "Inactive"].map((opt) => (
                                        <button key={opt} type="button" onClick={() => { setStatus(opt); setStatusOpen(false); }}
                                            className={cn("w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50", status === opt ? "text-brand-primary font-medium" : "text-gray-700")}>{opt}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary resize-none" />
                    </div>
                </div>

                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <Button type="button" onClick={handleConfirm} className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent">
                        {isEdit ? "Save Changes" : "Add Location"}
                    </Button>
                </div>
            </div>
        </>
    );
}
