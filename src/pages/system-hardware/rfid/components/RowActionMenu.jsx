import { Pencil, Trash2, MoreVertical } from "lucide-react";
import Dropdown from "@/components/dropdown";
export function RowActionMenu({ onEdit, onDelete }) {
    return (<Dropdown Icon={<MoreVertical size={16} className="text-gray-400"/>} positionType="bottom-right" className="w-44">
      <button onClick={onEdit} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
        <Pencil size={14} className="text-gray-400"/>
        Edit Reader
      </button>
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={14} className="text-red-400"/>
        Delete Reader
      </button>
    </Dropdown>);
}
