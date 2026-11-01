import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

export function StationRowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-1.5 rounded-lg text-caption hover:text-default hover:bg-default-default transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-invert-default rounded-xl shadow-lg z-20 py-1">
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-default hover:bg-default-hovered">
              <Pencil size={13} className="text-caption" /> Edit Details
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-invert-soft">
              <Trash2 size={13} /> Delete Base Station
            </button>
          </div>
        </>
      )}
    </div>
  );
}
