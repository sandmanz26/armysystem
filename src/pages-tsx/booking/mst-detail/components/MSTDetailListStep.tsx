import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Search, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { MSTIOSReviewModal } from "../modals/MSTIOSReviewModal";

// ── Mock data ─────────────────────────────────────────────────────────────────

interface MSTDetail {
  label:         string;
  cabin:         string;
  trainees:      number;
  weaponVariant: string;
  roles:         number;
  status:        string;
}

interface MSTDetailGroup {
  mios:    string;
  details: MSTDetail[];
}

const MST_DETAIL_GROUPS: MSTDetailGroup[] = [
  {
    mios: "MST_MIOS_01",
    details: [
      { label: "Detail 1", cabin: "MST_CABIN_01", trainees: 5, weaponVariant: "40AGL", roles: 5, status: "Pending" },
      { label: "Detail 2", cabin: "MST_CABIN_02", trainees: 5, weaponVariant: "40AGL", roles: 5, status: "Pending" },
      { label: "Detail 3", cabin: "MST_CABIN_03", trainees: 5, weaponVariant: "40AGL", roles: 5, status: "Pending" },
      { label: "Detail 4", cabin: "MST_CABIN_04", trainees: 5, weaponVariant: "40AGL", roles: 5, status: "Pending" },
      { label: "Detail 5", cabin: "MST_CABIN_05", trainees: 5, weaponVariant: "40AGL", roles: 5, status: "Pending" },
    ],
  },
];

// ── Detail Card ───────────────────────────────────────────────────────────────

function DetailCard({ detail }: { detail: MSTDetail }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      {/* Title + status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{detail.label}</span>
        <span className="px-2.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
          {detail.status}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Cabin</p>
          <p className="text-xs font-bold text-gray-800">{detail.cabin}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Trainees</p>
          <p className="text-xs font-bold text-gray-800">{detail.trainees} Trainees</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Weapon Variant</p>
          <p className="text-xs font-bold text-gray-800">{detail.weaponVariant}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Roles</p>
          <p className="text-xs font-bold text-gray-800">{detail.roles} Roles</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* CTA */}
      <Button className="w-full py-2.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">
        View Detail List
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MSTDetailListStep({
  onBack,
  onConfirm,
}: {
  onBack:    () => void;
  onConfirm: () => void;
}) {
  const [showReview,    setShowReview]    = useState(false);
  const [toastVisible,  setToastVisible]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");

  const handleEditDetailList = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return MST_DETAIL_GROUPS;
    const q = searchQuery.toLowerCase();
    return MST_DETAIL_GROUPS.map(g => ({
      ...g,
      details: g.details.filter(d =>
        d.label.toLowerCase().includes(q) ||
        d.cabin.toLowerCase().includes(q) ||
        d.weaponVariant.toLowerCase().includes(q)
      ),
    })).filter(g => g.details.length > 0);
  }, [searchQuery]);

  const visibleCount = filteredGroups.reduce((s, g) => s + g.details.length, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Confirm Detail List</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the detail list for training</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={() => setShowReview(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Confirm detail list <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2 bg-white border border-green-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium text-green-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Details have been updated.
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Card toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Details{" "}
              <span className="font-normal text-gray-400">({visibleCount} Details)</span>
            </h3>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputCustom
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              {/* Switch View */}
              <Button
                type="outline"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium w-auto border border-gray-200 text-gray-600"
                )}
              >
                <LayoutGrid size={14} /> Switch View
              </Button>
              {/* Edit Detail List */}
              <Button
                type="outline"
                onClick={handleEditDetailList}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold w-auto border border-brand-primary text-brand-primary hover:bg-red-50"
              >
                Edit Detail List
              </Button>
            </div>
          </div>

          {/* Detail groups */}
          <div className="p-5 space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.mios}>
                <div className="text-sm font-bold text-gray-800 mb-3">
                  {group.mios}{" "}
                  <span className="text-gray-400 font-normal">({group.details.length} Details)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.details.map((detail) => (
                    <DetailCard key={detail.label} detail={detail} />
                  ))}
                </div>
              </div>
            ))}

            {visibleCount === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-500">No details match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <MSTIOSReviewModal
          onCancel={() => setShowReview(false)}
          onConfirm={() => { setShowReview(false); onConfirm(); }}
        />
      )}
    </div>
  );
}
