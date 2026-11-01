import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

function Field({ label, required, value, onChange, placeholder, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-brand-primary">*</span>}
            </label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
        </div>
    );
}

export function IPSidebar({ open, mode, ip, onClose, onSave }) {
    const isEdit = mode === "edit";
    const [name, setName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [startIp, setStartIp] = useState("");
    const [endIp, setEndIp] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            setName(ip?.name ?? "");
            setIpAddress(ip?.ipAddress ?? "");
            setStartIp(ip?.startIp ?? "");
            setEndIp(ip?.endIp ?? "");
            setDescription(ip?.description ?? "");
        }
    }, [open, ip]);

    const handleSave = () => {
        if (!name.trim() || !ipAddress.trim() || !startIp.trim() || !endIp.trim()) return;
        onSave({ ...ip, id: ip?.id ?? `ip-${Date.now()}`, name: name.trim(), ipAddress: ipAddress.trim(), startIp: startIp.trim(), endIp: endIp.trim(), description });
        onClose();
    };

    const canSave = name.trim() && ipAddress.trim() && startIp.trim() && endIp.trim();

    return (
        <>
            <div className={cn("fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />
            <div className={cn("fixed inset-y-0 right-0 z-[1110] w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full")}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit IP" : "Add IP"}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{isEdit ? ip?.name : "Fill in the IP whitelisting information below."}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <Field label="Name" required value={name} onChange={setName} placeholder="Enter IP name (e.g, IP 1,etc)" />
                    <Field label="IP Address" required value={ipAddress} onChange={setIpAddress} placeholder="Enter IP address (e.g, 123.322.2.2,etc)" />
                    <Field label="Start IP" required value={startIp} onChange={setStartIp} placeholder="Enter IP address (e.g, 123.322.2.2,etc)" />
                    <Field label="End IP" required value={endIp} onChange={setEndIp} placeholder="Enter IP address (e.g, 123.322.2.2,etc)" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary resize-none" />
                    </div>
                </div>

                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <Button type="button" onClick={handleSave} disabled={!canSave} className={cn("flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent", !canSave && "opacity-40 cursor-not-allowed")}>
                        {isEdit ? "Save Changes" : "Add IP"}
                    </Button>
                </div>
            </div>
        </>
    );
}
