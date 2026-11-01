export function StatusPill({ status }) {
    if (status === "Ongoing")
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">{status}</span>;
    if (status === "In Queue")
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-500">{status}</span>;
    if (status === "Completed")
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{status}</span>;
    if (status === "Ready")
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">{status}</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">{status}</span>;
}
