import { useState, useMemo, useEffect } from "react";
import { TCT_MAX_TRAINEES } from "../tctZones";
import { Search, Upload, Plus, Pencil, Trash2, Filter, ClipboardList } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { MSTTCTUploadListModal } from "../modals/MSTTCTUploadListModal";
import { MSTTCTReviewModal } from "../modals/MSTTCTReviewModal";
import { TCTReviewModal } from "../modals/TCTReviewModal";
import type { TCTBookingDetailsValues } from "./TCTBookingDetailsStep";
import { TCTAddTraineeModal, type TCTTraineeValues } from "../modals/TCTAddTraineeModal";
import type { MSTTCTBookingDetailsValues } from "./MSTTCTBookingDetailsStep";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MSTTCT_TRAINEES = [
  { rank: "REC", name: "Roger Botosh",     svcId: "*****212A", platoon: "Platoon 1", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Davis Culhane",    svcId: "*****212A", platoon: "Platoon 1", roles: "Vehicle Commander (VC)"   },
  { rank: "REC", name: "Kadin Torff",      svcId: "*****212A", platoon: "Platoon 1", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Craig Septimus",   svcId: "*****212A", platoon: "Platoon 1", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Roger Septimus",   svcId: "*****212A", platoon: "Platoon 1", roles: "Section Commander (SC)"   },
  { rank: "REC", name: "Jaxson Donin",     svcId: "*****212A", platoon: "Platoon 1", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "James Lubin",      svcId: "*****212A", platoon: "Platoon 1", roles: "Sensor Operator (SO)"     },
  { rank: "REC", name: "Jakob Vaccaro",    svcId: "*****212A", platoon: "Platoon 1", roles: "Section Commander (SC)"   },
  { rank: "REC", name: "Ruben Calzoni",    svcId: "*****212A", platoon: "Platoon 1", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Tyrone Whitfield", svcId: "*****212B", platoon: "Platoon 2", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Marcus Chen",      svcId: "*****212B", platoon: "Platoon 2", roles: "Vehicle Commander (VC)"   },
  { rank: "REC", name: "Alvin Tan",        svcId: "*****212B", platoon: "Platoon 2", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Wei Ming Lim",     svcId: "*****212B", platoon: "Platoon 2", roles: "Section Commander (SC)"   },
  { rank: "REC", name: "Iskandar Shah",    svcId: "*****212B", platoon: "Platoon 2", roles: "Sensor Operator (SO)"     },
  { rank: "REC", name: "Rahul Patel",      svcId: "*****212B", platoon: "Platoon 2", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Dylan Ong",        svcId: "*****212C", platoon: "Platoon 3", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Brandon Lee",      svcId: "*****212C", platoon: "Platoon 3", roles: "Vehicle Commander (VC)"   },
  { rank: "REC", name: "Justin Koh",       svcId: "*****212C", platoon: "Platoon 3", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Nathan Yeo",       svcId: "*****212C", platoon: "Platoon 3", roles: "Section Commander (SC)"   },
  { rank: "REC", name: "Ethan Ho",         svcId: "*****212C", platoon: "Platoon 3", roles: "Sensor Operator (SO)"     },
  { rank: "REC", name: "Samuel Ng",        svcId: "*****212D", platoon: "Platoon 4", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Aaron Lim",        svcId: "*****212D", platoon: "Platoon 4", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Zachary Tan",      svcId: "*****212D", platoon: "Platoon 4", roles: "Vehicle Commander (VC)"   },
  { rank: "REC", name: "Gabriel Wong",     svcId: "*****212D", platoon: "Platoon 4", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Caleb Chan",       svcId: "*****212D", platoon: "Platoon 4", roles: "Section Commander (SC)"   },
  { rank: "REC", name: "Fariz Hassan",     svcId: "*****212E", platoon: "Platoon 1", roles: "Sensor Operator (SO)"     },
  { rank: "REC", name: "Lim Wei Jie",      svcId: "*****212E", platoon: "Platoon 1", roles: "Vehicle Operator (VO)"    },
  { rank: "REC", name: "Mohd Rizal",       svcId: "*****212E", platoon: "Platoon 2", roles: "Vehicle Commander (VC)"   },
  { rank: "REC", name: "Tan Boon Kiat",    svcId: "*****212E", platoon: "Platoon 2", roles: "Troop Commander (TC)"     },
  { rank: "REC", name: "Kevin Teo",        svcId: "*****212E", platoon: "Platoon 3", roles: "Section Commander (SC)"   },
];

const PER_PAGE = 10;

type Trainee = typeof MSTTCT_TRAINEES[number];

// ── Component ─────────────────────────────────────────────────────────────────

export function MSTTCTNominalRollStep({
  bookingDetails,
  onNext,
  onTraineeCountChange,
}: {
  bookingDetails?: MSTTCTBookingDetailsValues | null;
  onNext: () => void;
  /** Reports the roll size so a TCT booking can be saved with its trainee count. */
  onTraineeCountChange?: (count: number) => void;
}) {
  // Standalone TCT hands this step its own booking-details shape (it has `clusterAmount`, MST+TCT has `tctClusterAmount`)
  const isStandaloneTCT = !!bookingDetails && "clusterAmount" in (bookingDetails as object);
  const [trainees, setTrainees]           = useState<Trainee[]>(MSTTCT_TRAINEES);
  const [showAdd, setShowAdd]             = useState(false);
  // A booking holds at most TCT_MAX_TRAINEES trainees — enforced here, where the roll is built
  const atCap = trainees.length >= TCT_MAX_TRAINEES;
  const addTrainee = (v: TCTTraineeValues) => {
    if (atCap) return;
    setTrainees(prev => [...prev, { rank: v.rank, name: v.name.trim(), svcId: v.svcId.trim(), platoon: v.platoon.trim(), roles: v.roles }]);
    setSearchQuery("");
    setCurrentPage(Math.ceil((trainees.length + 1) / PER_PAGE));
  };
  useEffect(() => { onTraineeCountChange?.(trainees.length); }, [trainees.length, onTraineeCountChange]);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [showUpload,   setShowUpload]   = useState(false);
  const [showReview,   setShowReview]   = useState(false);

  // ── Filtering & pagination ────────────────────────────────────────────────
  const filtered = useMemo(
    () => trainees.filter(t =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.svcId.includes(searchQuery)
    ),
    [trainees, searchQuery],
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Trainee, any>[]>(() => [
    {
      id:     "select",
      header: () => <Checkbox size={16} />,
      cell:   () => <Checkbox size={16} />,
    },
    {
      id:     "no",
      header: () => "No",
      cell:   ({ row }: any) => (
        <span className="text-sm text-gray-700">
          {(currentPage - 1) * PER_PAGE + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "rank",
      header:      () => "Rank",
      cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
    },
    {
      accessorKey: "name",
      header:      () => "Name",
      cell:        ({ getValue }: any) => (
        <span className="text-sm font-medium text-gray-800">{getValue()}</span>
      ),
    },
    {
      accessorKey: "svcId",
      header:      () => "Service ID",
      cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
    },
    {
      accessorKey: "platoon",
      header:      () => "Platoon Number",
      cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
    },
    {
      accessorKey: "roles",
      header:      () => "Roles",
      cell:        ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>,
    },
    {
      id:     "lastUpdated",
      header: () => "Last Updated On",
      cell:   () => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          17 January 2025
          <br />
          <span className="text-xs">09.29.33 AM</span>
        </span>
      ),
    },
    {
      id:     "actions",
      header: () => "",
      cell:   () => (
        <div className="flex items-center gap-2">
          <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button type="button" className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [currentPage]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">

      {/* Header bar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">
          Nominal Roll{" "}
          <span className="font-normal text-gray-500">({trainees.length} Trainees)</span>{" "}
          <span className="font-normal text-gray-400 text-xs">· {trainees.length}/{TCT_MAX_TRAINEES} max</span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <InputCustom
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Filter */}
          <Button
            type="outline"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <Filter size={14} /> Filter
          </Button>

          {/* Upload List */}
          <Button
            type="outline"
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <Upload size={14} /> Upload List
          </Button>

          {/* Add Trainee */}
          <Button
            onClick={() => !atCap && setShowAdd(true)}
            disabled={atCap}
            title={atCap ? `This booking is full — ${TCT_MAX_TRAINEES} trainees is the limit` : undefined}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Add Trainee
          </Button>
        </div>
      </div>

      {/* Table (or empty state) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {trainees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No Trainee  to show right now!</p>
            <p className="text-sm text-gray-400 mb-5">
              Clicks on &quot; Upload List &quot; or &quot; Add Trainee &quot; to create a nominal roll list in the system.
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
              <Plus size={14} /> Add Trainee
            </button>
          </div>
        ) : (
          <>
            <TableCustom<Trainee>
              columns={columns}
              data={paginated}
              autoScrollTable={true}
            />
            <Pagination
              currentPage={currentPage}
              itemsPerPage={PER_PAGE}
              totalItems={filtered.length}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Hidden trigger — called by MSTTCTBookingForm's "Next" button on step 3 */}
      <button
        id="msttct-nominal-next-trigger"
        type="button"
        className="hidden"
        onClick={() => setShowReview(true)}
      />

      <TCTAddTraineeModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={addTrainee}
        remaining={TCT_MAX_TRAINEES - trainees.length}
      />

      {/* Upload modal */}
      {showUpload && <MSTTCTUploadListModal onClose={() => setShowUpload(false)} />}

      {/* Review modal */}
      {showReview && isStandaloneTCT && (
        <TCTReviewModal
          totalTrainees={trainees.length}
          bookingDetails={bookingDetails as unknown as TCTBookingDetailsValues}
          onCancel={() => setShowReview(false)}
          onConfirm={() => { setShowReview(false); onNext(); }}
        />
      )}
      {showReview && !isStandaloneTCT && (
        <MSTTCTReviewModal
          totalTrainees={trainees.length}
          bookingDetails={bookingDetails}
          onCancel={() => setShowReview(false)}
          onConfirm={() => { setShowReview(false); onNext(); }}
        />
      )}

    </div>
  );
}
