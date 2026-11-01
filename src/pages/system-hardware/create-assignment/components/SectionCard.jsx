export function SectionCard({ title, children }) {
    return (<div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>);
}
