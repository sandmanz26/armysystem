import { Pencil } from "lucide-react";

export function RowMenu({ onEdit }) {
  return (
    <button
      onClick={onEdit}
      className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
      title="Edit"
    >
      <Pencil size={14} />
    </button>
  );
}
