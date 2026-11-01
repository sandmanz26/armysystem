import { useMemo, useState } from "react";
import { Search, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPLEX_CASES, type ComplexCase } from "./data";

// QA reference page at /trm-complex-case — a table of complex, cross-module
// test cases (each one only makes sense when 2+ modules are chained
// together). Single-module happy-path cases belong in the regular test plan,
// not here — see COMPLEX_CASES in ./data.ts for the "complex" definition.

function PriorityBadge({ priority }: { priority: ComplexCase["priority"] }) {
  const styles =
    priority === "High" ? "bg-red-50 text-red-600 border-red-200"
    : priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap", styles)}>
      {priority}
    </span>
  );
}

export function TrmComplexCase() {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);

  const allModules = useMemo(
    () => [...new Set(COMPLEX_CASES.flatMap((c) => c.modules))].sort(),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPLEX_CASES.filter((c) => {
      const matchesModule = !moduleFilter || c.modules.includes(moduleFilter);
      const matchesQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.modules.some((m) => m.toLowerCase().includes(q));
      return matchesModule && matchesQuery;
    });
  }, [query, moduleFilter]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-brand-primary" />
            <h1 className="text-xl font-semibold text-brand-primary">Complex Test Cases</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            QA reference for cross-module test cases — each one only exercises real behavior when two or more modules are chained together (e.g. a booking action that then affects asset state, which then shows up in a report).
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, or module…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setModuleFilter(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                moduleFilter === null
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              )}
            >
              All Modules
            </button>
            {allModules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModuleFilter((prev) => (prev === m ? null : m))}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  moduleFilter === m
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {filtered.length} of {COMPLEX_CASES.length} case{COMPLEX_CASES.length === 1 ? "" : "s"}
        </p>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-red-50 border-b border-gray-200">
                {["No", "ID", "Title", "Modules Involved", "Precondition", "Steps", "Expected Result", "Priority"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-brand-primary align-top whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    No test cases match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-b-0 align-top">
                    <td className="px-4 py-4 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-700 whitespace-nowrap">{c.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-800 min-w-[220px]">{c.title}</td>
                    <td className="px-4 py-4 min-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {c.modules.map((m) => (
                          <span key={m} className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 min-w-[200px]">{c.precondition}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 min-w-[260px]">
                      <ol className="list-decimal list-inside space-y-1">
                        {c.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 min-w-[240px]">{c.expected}</td>
                    <td className="px-4 py-4"><PriorityBadge priority={c.priority} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
