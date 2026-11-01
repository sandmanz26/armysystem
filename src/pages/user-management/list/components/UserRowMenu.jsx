import { useState } from "react";
import { MoreVertical, Pencil, Archive, KeyRound } from "lucide-react";
export function UserRowMenu({ onEdit, onArchive, onResetPassword }) {
    const [open, setOpen] = useState(false);
    return (<div className="relative">
      <button onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
        }} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <MoreVertical size={16}/>
      </button>
      {open && (<>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button onClick={() => {
                setOpen(false);
                onEdit();
            }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Pencil size={14} className="text-gray-400"/> Edit User
            </button>
            <button onClick={() => {
                setOpen(false);
                onArchive();
            }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Archive size={14} className="text-gray-400"/> Move to Archive
            </button>
            <button onClick={() => {
                setOpen(false);
                onResetPassword();
            }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <KeyRound size={14} className="text-gray-400"/> Reset Password
            </button>
          </div>
        </>)}
    </div>);
}
