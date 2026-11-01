export function RightPanel({ bookingData, extractTimeStr }) {
  const bd = bookingData;
  if (!bd) return null;

  const weapons = bd.weaponList || bd.weapons || [];
  const weaponTypeStr = bd.weaponTypes
    ? bd.weaponTypes.join(", ")
    : weapons.length > 0
    ? weapons.map(w => w.type).join(", ")
    : bd.weapon || "—";

  const totalUnits = weapons.reduce((s, w) => s + (w.quantity || w.units || 0), 0);
  const weaponWithdrawStr = weapons.length > 0
    ? `${totalUnits} weapons (${weapons.map(w => `${w.type} – ${w.quantity || w.units} weapons`).join(", ")})`
    : "—";

  const timeStr = extractTimeStr ? extractTimeStr(bd.bookingTime) : bd.bookingDate ?? "";

  return (
    <div className="w-1/2 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <p className="text-sm font-bold text-gray-800">Booking ID(s)</p>
          <p className="text-xs text-gray-400 mt-0.5">Summary of the selected booking</p>
        </div>

        {/* Booking card */}
        <div className="p-4">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Card header */}
            <div className="px-4 py-3.5 bg-gray-50/60 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800 leading-snug">{bd.program}</p>
              <p className="text-xs text-gray-400 mt-1">
                Booking ID - {bd.bookingId?.replace("#", "")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{bd.bookingDate} {timeStr}</p>
            </div>

            {/* Card details */}
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-400 w-44 flex-shrink-0">Weapon Type(s)</span>
                <span className="text-xs font-semibold text-gray-700">– {weaponTypeStr}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-400 w-44 flex-shrink-0">Trainee(s)</span>
                <span className="text-xs font-semibold text-gray-700">
                  – {bd.traineesCount ?? bd.trainees?.length ?? 0} Trainees
                </span>
              </div>
              {weapons.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 w-44 flex-shrink-0 flex-shrink-0">Weapon(s) needed to withdraw</span>
                  <span className="text-xs font-semibold text-gray-700">– {weaponWithdrawStr}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
