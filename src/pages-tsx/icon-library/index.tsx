import { useMemo, useState } from "react";
import { Icon, ICON_NAMES, type IconName } from "@/components/icon";

/** /icon-library — every icon in the library, searchable. Click one to copy its `<Icon name="…" />`. */
export function IconLibrary() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<IconName | null>(null);
  const shown = useMemo(() => ICON_NAMES.filter((n) => n.includes(query.trim().toLowerCase())), [query]);

  const copy = (name: IconName) => {
    void navigator.clipboard?.writeText(`<Icon name="${name}" />`);
    setCopied(name);
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-default">Icon Library</h1>
          <p className="text-sm text-body">
            {shown.length} of {ICON_NAMES.length} icons. The only icons Figma slices may use — if one is missing, ask; do not substitute.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search, e.g. arrow"
          className="h-10 w-64 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-primary"
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
        {shown.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => copy(name)}
            title={`<Icon name="${name}" />`}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-3 text-default hover:border-brand-primary"
          >
            <Icon name={name} size={24} />
            <span className="w-full truncate text-center text-[10px] text-body">{copied === name ? "copied" : name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
