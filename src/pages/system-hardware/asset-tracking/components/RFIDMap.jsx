import { rooms, rfidMarkers, alertMarkers } from "../constants";
export function RFIDMap() {
    return (<div className="w-full overflow-auto bg-gray-100 rounded-lg border border-gray-200" style={{ minHeight: 480 }}>
      <svg viewBox="300 280 1120 540" width="100%" style={{ minWidth: 800 }}>
        {/* Background */}
        <rect x="300" y="280" width="1120" height="540" fill="#f3f4f6"/>

        {/* Corridor label */}
        <text x="750" y="552" fontSize="11" fill="#9ca3af" fontWeight="500" textAnchor="middle" letterSpacing="3">CORRIDOR</text>
        <line x1="300" y1="560" x2="1420" y2="560" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4"/>

        {/* Outdoor staircase labels */}
        <text x="360" y="310" fontSize="9" fill="#9ca3af" letterSpacing="2">OUTDOOR STAIRCASE</text>
        <text x="1300" y="310" fontSize="9" fill="#9ca3af" letterSpacing="2">OUTDOOR STAIRCASE</text>

        {/* Rooms */}
        {rooms.map((r) => (<g key={r.label}>
            {/* Green grid fill */}
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#86efac" stroke="#4ade80" strokeWidth="1"/>
            {/* Grid lines horizontal */}
            {Array.from({ length: Math.floor(r.h / 20) - 1 }, (_, i) => (<line key={`h${i}`} x1={r.x} y1={r.y + (i + 1) * 20} x2={r.x + r.w} y2={r.y + (i + 1) * 20} stroke="#4ade80" strokeWidth="0.4"/>))}
            {/* Grid lines vertical */}
            {Array.from({ length: Math.floor(r.w / 20) - 1 }, (_, i) => (<line key={`v${i}`} x1={r.x + (i + 1) * 20} y1={r.y} x2={r.x + (i + 1) * 20} y2={r.y + r.h} stroke="#4ade80" strokeWidth="0.4"/>))}
            {/* Room border */}
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#1a3a6b" strokeWidth="1.5"/>
            {/* Room label */}
            <text x={r.x + r.w / 2} y={r.y - 8} fontSize="11" fill="#374151" fontWeight="600" textAnchor="middle">{r.label}</text>
          </g>))}

        {/* RFID Reader markers (pink/magenta squares) */}
        {rfidMarkers.map((m, i) => (<rect key={i} x={m.x - 6} y={m.y - 6} width="12" height="12" fill="#e879f9" stroke="#a21caf" strokeWidth="1" rx="1"/>))}

        {/* Alert markers (red circles with wifi icon) */}
        {alertMarkers.map((m, i) => (<g key={i}>
            <circle cx={m.x} cy={m.y} r="14" fill="#ef4444"/>
            <text x={m.x} y={m.y + 5} fontSize="14" fill="white" textAnchor="middle">&#x2299;</text>
          </g>))}

        {/* STO labels */}
        <text x="870" y="355" fontSize="9" fill="#6b7280">STO</text>
        <text x="1130" y="355" fontSize="9" fill="#6b7280">STO</text>

        {/* Structural walls top */}
        <rect x="300" y="280" width="1120" height="30" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>

        {/* Bottom structural band */}
        <rect x="300" y="784" width="1120" height="36" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5"/>
      </svg>
    </div>);
}
