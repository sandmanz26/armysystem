import { useState } from "react";
import { MoreVertical } from "lucide-react";
export function LaneRowMenu({ onToggle, onDelete }) {
    const [open, setOpen] = useState(false);
    return (<div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <MoreVertical size={15}/>
      </button>
      {open && (<>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
            <button onClick={() => { setOpen(false); onToggle(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Toggle Status</button>
            <button onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Delete</button>
          </div>
        </>)}
    </div>);
}
