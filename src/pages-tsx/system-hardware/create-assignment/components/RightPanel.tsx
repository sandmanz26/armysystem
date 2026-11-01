// "Assets to Withdraw" — Figma `Table - Today's Booking - Assignment`-style
// table (No | Asset | Type | Quantity + Total), matching the same shape
// booking-2/create-assignment uses. Replaced the old "Weapons to Withdraw"
// card-grid (no Type column, no Total row) 30 Sep 2026 — see
// docs/FIGMA-MAP.md, page "↪ Action - Issue Asset (Booking)" (5869:43219).
import { assetTypeLabel } from "../constants";

interface Weapon {
  type: string;
  quantity: number;
}

interface RightPanelProps {
  weapons: Weapon[];
  /** Adds the Type (Controlled Item / Weapon) column — Figma shows it only
   *  when at least one involved booking is Collective training mode. */
  isCollective: boolean;
  hasBooking: boolean;
}

export function RightPanel({ weapons, isCollective, hasBooking }: RightPanelProps) {
  const totalUnits = weapons.reduce((s, w) => s + w.quantity, 0);

  return (
    <div className="w-1/2 flex-shrink-0">
      <div className="bg-surface rounded-xl border border-invert-default shadow-sm sticky top-6 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-default">Assets to Withdraw</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-danger-invert-soft text-primary text-xs">
              <th className="text-left font-semibold px-5 py-2.5 w-14">No</th>
              <th className="text-left font-semibold px-3 py-2.5">Asset</th>
              {isCollective && <th className="text-left font-semibold px-3 py-2.5">Type</th>}
              <th className="text-left font-semibold px-3 py-2.5">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {weapons.map((w, i) => (
              <tr key={w.type} className="border-t border-invert-default">
                <td className="px-5 py-2.5 text-body">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold text-default">{w.type}</td>
                {isCollective && <td className="px-3 py-2.5 text-default">{assetTypeLabel(w.type)}</td>}
                <td className="px-3 py-2.5 text-default">{w.quantity}</td>
              </tr>
            ))}
            {weapons.length === 0 && (
              <tr>
                <td colSpan={isCollective ? 4 : 3} className="px-5 py-8 text-center text-body">
                  {hasBooking ? "No weapon data for this booking." : "Select a booking to see the assets to withdraw."}
                </td>
              </tr>
            )}
          </tbody>
          {weapons.length > 0 && (
            <tfoot>
              <tr className="border-t border-invert-default">
                <td className="px-5 py-2.5 text-default" colSpan={isCollective ? 2 : 1}>Total</td>
                {isCollective && <td />}
                <td className="px-3 py-2.5 font-semibold text-default">{totalUnits} Assets</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
