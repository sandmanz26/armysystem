import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";

const THEMES = [
  {
    key: "modern",
    label: "Modern",
    description: "Dark sidebar with a sleek, contemporary look.",
    preview: "bg-[#1C1C2E]",
    accent: "bg-[#115e59]",
  },
  {
    key: "classic",
    label: "Classic",
    description: "Light sidebar with a clean, traditional layout.",
    preview: "bg-white border border-gray-200",
    accent: "bg-[#115e59]",
  },
];

function ThemeSection({ title, description, icon: Icon, children }) {
  return (
    <div className="pb-6 mb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className="text-gray-400 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4 ml-[23px]">{description}</p>
      {children}
    </div>
  );
}

export function PreferenceSetting() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Appearance</h2>
        <p className="text-sm text-gray-500">
          Customize the visual style of the application. Settings here apply to specific UI sections — not the entire app.
        </p>
      </div>

      {/* Sidebar Theme */}
      <ThemeSection
        title="Sidebar"
        description="Controls the sidebar navigation style only. Other areas of the app are not affected."
        icon={PanelLeft}
      >
        <div className="flex gap-4">
          {THEMES.map(({ key, label, description, preview, accent }) => (
            <div
              key={key}
              className={cn(
                "flex-1 max-w-[220px] rounded-xl border-2 p-4 text-left",
                "border-gray-200"
              )}
            >
              {/* Mini sidebar preview */}
              <div className={cn("w-full h-28 rounded-lg mb-3 overflow-hidden flex flex-col", preview)}>
                {/* fake logo bar */}
                <div className={cn("h-8 flex items-center px-3 gap-2", key === "modern" ? "border-b border-white/10" : "border-b border-gray-200")}>
                  {key === "modern" ? (
                    <>
                      <div className="w-4 h-4 rounded bg-white/20" />
                      <div className="h-2 w-12 rounded bg-white/20" />
                    </>
                  ) : (
                    <div className="h-3 w-20 rounded bg-gray-300" />
                  )}
                </div>
                {/* fake nav items */}
                <div className="flex-1 px-2 py-2 space-y-1">
                  {key === "modern" && (
                    <div className="px-2 mb-0.5">
                      <div className="h-1 w-8 rounded bg-white/20" />
                    </div>
                  )}
                  <div className={cn("h-5 rounded flex items-center px-2", accent)}>
                    <div className="h-1.5 w-10 rounded bg-white/80" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-5 rounded flex items-center px-2", key === "modern" ? "bg-white/5" : "bg-gray-50")}>
                      <div className={cn("h-1.5 rounded", key === "modern" ? "bg-white/20" : "bg-gray-200", i === 1 ? "w-14" : i === 2 ? "w-10" : "w-12")} />
                    </div>
                  ))}
                  {key === "classic" && (
                    <>
                      {[4, 5].map((i) => (
                        <div key={i} className="h-5 rounded flex items-center px-2 bg-gray-50">
                          <div className={cn("h-1.5 rounded bg-gray-200", i === 4 ? "w-9" : "w-11")} />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 ml-3 border-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </ThemeSection>

      {/* Future sections (e.g. Navbar, Page background) go here as more <ThemeSection> blocks */}
    </div>
  );
}
