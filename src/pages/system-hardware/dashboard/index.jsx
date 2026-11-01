import { notifications } from "@/data/systemHardware";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { STAT_CARDS } from "./constants";
import { DonutChart } from "./components/DonutChart";
export function SHMDashboard() {
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-brand-primary mb-5">
          Asset Statistics
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((card) => (<div key={card.label} className={cn("rounded-lg px-5 py-4 flex flex-col gap-1", card.color)}>
              <span className="text-3xl font-bold leading-none">
                {card.value}
              </span>
              <span className="text-sm opacity-90">{card.label}</span>
            </div>))}
        </div>

        {/* View All Assets */}
        <div className="flex justify-end mb-6">
          <Button className="px-4 py-2 w-fit text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover font-medium">
            View All Assets
          </Button>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assets by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Assets by Category
            </h2>
            <DonutChart />
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Notifications (Assets)
              </h2>
              {/* Row-level action — stays raw button per rule */}
              <button className="text-xs text-brand-primary font-medium hover:underline">
                View All Notifications
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (<div key={n.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", n.isRead
                ? "bg-white border-gray-100"
                : "bg-red-50 border-red-100")}>
                  <div className={cn("mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center", n.isRead ? "bg-gray-100" : "bg-brand-primary")}>
                    <Bell size={14} className={n.isRead ? "text-gray-400" : "text-white"}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {n.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {n.timestamp}
                    </div>
                  </div>
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
