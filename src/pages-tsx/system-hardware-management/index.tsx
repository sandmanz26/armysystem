import { Tag, Layers, ScanLine, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuCard {
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const MENU_CARDS: MenuCard[] = [
  {
    label: "Asset Type",
    description: "Manage the asset type master list (e.g. SAR21, M16, Lenovo Laptop).",
    path: "/system-hardware-management/asset-type",
    icon: <Tag size={20} />,
  },
  {
    label: "Asset Category",
    description: "Manage the broader category each asset type rolls up to (e.g. Weapon, Laptop Computer Device).",
    path: "/system-hardware-management/asset-category",
    icon: <Layers size={20} />,
  },
  {
    label: "Asset Tracking",
    description: "Manage RFID/tracking configuration for individual assets.",
    path: "/system-hardware-management/asset-tracking",
    icon: <ScanLine size={20} />,
  },
];

export function SystemHardwareManagementHome({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">System Hardware Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage master data for system hardware assets.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MENU_CARDS.map((card) => (
            <button
              key={card.path}
              type="button"
              onClick={() => onNavigate?.(card.path)}
              className={cn(
                "text-left bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3",
                "hover:shadow-md hover:border-brand-primary/40 transition-all",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-brand-primary flex items-center justify-center">
                  {card.icon}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{card.label}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
