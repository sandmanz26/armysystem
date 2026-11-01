import { useState } from "react";
import { ArrowLeft, MoreVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { bookings } from "@/data/mock";

function getAssignmentFromUrl() {
  const search = window.location.search || window.location.hash.replace(/^[^?]*/, "");
  const params = new URLSearchParams(search);
  return {
    baseStation: params.get("baseStation") || "TRX-01",
    bookingId: params.get("bookingId") || null,
    operator: params.get("operator") || "Liam Johansson",
    personnel: params.get("personnel") || "Patrick Ta",
    assetsQty: parseInt(params.get("assetsQty") || "1"),
  };
}

function StatusBadge({ status }) {
  const cfg = {
    Issued:   "bg-blue-50 text-blue-700 border-blue-200",
    Upcoming: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Returned: "bg-green-50 text-green-700 border-green-200",
    Overdue:  "bg-red-50 text-red-600 border-red-200",
  }[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold", cfg)}>
      {status}
    </span>
  );
}

export function AssignmentDetail({ onNavigate }) {
  const meta = getAssignmentFromUrl();
  const [activeTab, setActiveTab] = useState("Bookings");
  const [showSuccess, setShowSuccess] = useState(true);

  // Generate assignment ID from today
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yy = String(today.getFullYear()).slice(2);
  const assignmentId = `${yy}${mm}${dd}-AT${String(Math.floor(Math.random() * 900) + 100)}`;

  // Get booking data
  const booking = meta.bookingId
    ? bookings.find(b => b.id === meta.bookingId)
    : bookings.find(b => b.status === "Upcoming");

  const issuedTime = today.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " " +
    today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-white border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          Assignment has been created.
          <button onClick={() => setShowSuccess(false)} className="ml-2 text-gray-400 hover:text-gray-600">×</button>
        </div>
      )}

      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => onNavigate?.("/system-hardware/assignment-list")} className="flex items-center gap-1 hover:text-brand-primary transition-colors">
            <ArrowLeft size={14} /> Assignment List
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-medium">Assignment Detail</span>
        </div>

        {/* Assignment Details card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Assignment Details</h2>
            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Col 1 */}
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignment ID</p>
                <p className="text-sm font-bold text-gray-800 font-mono">{assignmentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <StatusBadge status="Issued" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Issued Date</p>
                <p className="text-sm font-semibold text-gray-800">{issuedTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Issued Reason</p>
                <p className="text-sm text-gray-400">—</p>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignment Type</p>
                <p className="text-sm font-semibold text-gray-800">Single Booking</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Base Station(s)</p>
                <p className="text-sm font-semibold text-gray-800">{meta.baseStation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Returned Date</p>
                <p className="text-sm text-gray-400">—</p>
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Booking(s)</p>
                <p className="text-sm font-semibold text-gray-800">1 Booking(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Assets Qty</p>
                <p className="text-sm font-semibold text-gray-800">{meta.assetsQty} Asset(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {meta.operator.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{meta.operator}</p>
                    <p className="text-xs text-gray-400">Operator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 px-1">
            {["Assets", "Bookings"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3.5 text-sm font-medium transition-colors relative",
                  activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "Bookings" && (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Bookings <span className="text-gray-400 font-normal">(1 Booking)</span>
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50/70">
                      {["No", "Booking ID", "Training Type", "Training Mode", "Booking Time", "Status", "Assignment ID", "Unit Name", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-primary whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {booking && (
                      <tr className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400">1</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 leading-snug">{booking.program}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">Booking ID - {booking.bookingId?.replace("#", "")}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{booking.trainingType || "Group"}</td>
                        <td className="px-4 py-3 text-gray-700">{booking.trainingMode || "Marksmanship"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-pre-line leading-snug">{booking.bookingTime || booking.bookingDate}</td>
                        <td className="px-4 py-3"><StatusBadge status={booking.status || "Upcoming"} /></td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{assignmentId}</td>
                        <td className="px-4 py-3 text-gray-700">{booking.unitName || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}&assetIssued=true`)} className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors" title="View Booking">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "Assets" && (
              <div className="py-8 text-center text-gray-400 text-sm">
                <User size={24} className="mx-auto mb-2 text-gray-200" />
                Asset data will appear here after confirmation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
