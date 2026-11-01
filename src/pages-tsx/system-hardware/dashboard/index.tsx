import { notifications } from "@/data/systemHardware";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { STAT_CARDS } from "./constants";
import { DonutChart } from "./components/DonutChart";

export function SHMDashboard() {
  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6">
        {/* Figma `Page Header`: title in color/text/default with the primary
            action beside it, not on a row of its own below the tiles. */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <h1 className="text-xl font-semibold text-default">Asset Statistics</h1>
          <Button className="w-auto shrink-0 inline-flex items-center justify-center h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors">
            View All Assets
          </Button>
        </div>

        {/* Figma `Data Display` tiles — 262x84, a 48x48 `surface lv1` icon well,
            then the label (color/text/body, 12) above the value (Bold 24). The
            tiles used to be arbitrary hex pairs with the number on top and no
            icon at all. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className={cn(
                "rounded-xl border p-4 flex items-center gap-4 min-h-[84px]",
                card.tone,
              )}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-lv1">
                {card.icon}
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-body leading-4">{card.label}</span>
                <span className="text-2xl font-bold leading-8 text-default">{card.value}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Figma `Row`: the chart card is 320 wide and the notifications card
            760 — not two equal halves. */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
          {/* Assets by Category */}
          <div className="bg-surface-lv1 rounded-xl border border-invert-default p-5">
            <h2 className="text-base font-semibold text-default mb-4">
              Assets by Category
            </h2>
            <DonutChart />
          </div>

          {/* Notifications */}
          <div className="bg-surface-lv1 rounded-xl border border-invert-default p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-default">
                Notifications (Assets)
              </h2>
              {/* Figma `Button Primary (Section Header - Right Content)`, 177
                  wide — this was a plain text link. */}
              <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors whitespace-nowrap">
                View All Notifications
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    n.isRead
                      ? "bg-surface border-invert-default"
                      : "bg-danger-invert-soft border-invert-danger",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                      n.isRead ? "bg-default-default" : "bg-primary-default",
                    )}
                  >
                    <Bell
                      size={14}
                      className={n.isRead ? "text-disabled" : "text-invert-default"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-default">
                      {n.title}
                    </div>
                    <div className="text-xs text-body mt-0.5 leading-relaxed">
                      {n.description}
                    </div>
                    <div className="text-xs text-disabled mt-1">
                      {n.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
