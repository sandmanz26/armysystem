import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Upload, Plus, Trash2, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { UploadListModal } from "../modals/UploadListModal";
import { TraineeFormModal, type TraineeFormValues } from "../modals/TraineeFormModal";
import { NOMINAL_ROLL_DATA, PER_PAGE } from "../constants";

type Trainee = typeof NOMINAL_ROLL_DATA[number] & { role?: string };

const WEAPON_OPTS = ["SAR21", "LMG", "M203", "GPMG", "M110", "P30"];

function WeaponPickerCell({
  svcId, weapons, onChange,
}: {
  svcId: string;
  weapons: string[];
  onChange: (svcId: string, weapons: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (w: string) => {
    if (weapons.includes(w)) {
      onChange(svcId, weapons.filter(x => x !== w));
    } else if (weapons.length < 2) {
      onChange(svcId, [...weapons, w]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1 flex-wrap cursor-pointer" onClick={() => setOpen(v => !v)}>
        {weapons.length === 0 && (
          <span className="text-xs text-gray-400">Select weapon type(s)</span>
        )}
        {weapons.map(w => (
          <span key={w} className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
            {w}
          </span>
        ))}
      </div>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px]">
          <div className="text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wide px-1">
            Select up to 2 weapon types
          </div>
          {WEAPON_OPTS.map(w => {
            const checked = weapons.includes(w);
            const disabled = !checked && weapons.length >= 2;
            return (
              <button
                key={w}
                type="button"
                disabled={disabled}
                onClick={() => toggle(w)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors",
                  disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : checked
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className={cn(
                  "w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center",
                  checked ? "bg-brand-primary border-brand-primary" : disabled ? "border-gray-200" : "border-gray-300"
                )}>
                  {checked && <Check size={8} className="text-white" strokeWidth={3} />}
                </span>
                {w}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-1.5 py-1 text-xs text-gray-500 hover:text-gray-700 text-center border-t border-gray-100"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function NominalRollStep({ onNext, bookingCourseware, stationCountsByCourseware, trainingMode }: {
  onNext: () => void;
  bookingCourseware?: string;
  stationCountsByCourseware?: Record<string, { base: number; cshaped: number }>;
  trainingMode?: string;
}) {
  const showRoleColumn = trainingMode === "Collective";
  const coursewareList = bookingCourseware
    ? bookingCourseware.split(", ").map((c) => c.trim()).filter(Boolean)
    : [];
  const [activeCourseware, setActiveCourseware] = useState(() => coursewareList[0] ?? "");
  const [activeStationType, setActiveStationType] = useState<"Flat Screen" | "C-Shaped">("Flat Screen");

  useEffect(() => {
    setActiveStationType("Flat Screen");
    setCurrentPage(1);
  }, [activeCourseware]);

  const activeCourseCounts = stationCountsByCourseware
    ? (coursewareList.length > 1
        ? stationCountsByCourseware[activeCourseware]
        : Object.values(stationCountsByCourseware)[0])
    : undefined;
  const showCShapedTab = (activeCourseCounts?.cshaped ?? 0) > 0;

  const [trainees, setTrainees] = useState<Trainee[]>(NOMINAL_ROLL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddTrainee, setShowAddTrainee] = useState(false);
  const [editTrainee, setEditTrainee] = useState<{ svcId: string; values: TraineeFormValues } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Per-row weapon selections (up to 2 per trainee); pre-populate with mixed demo data
  const [weaponsByRow, setWeaponsByRow] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    NOMINAL_ROLL_DATA.forEach((t, i) => {
      if (i === 1) map[t.svcId] = ["SAR21", "LMG"];
      else if (i === 4) map[t.svcId] = ["SAR21", "M203"];
      else if (i === 7) map[t.svcId] = ["LMG", "GPMG"];
      else map[t.svcId] = ["SAR21"];
    });
    return map;
  });

  const updateWeapons = (svcId: string, weapons: string[]) =>
    setWeaponsByRow(prev => ({ ...prev, [svcId]: weapons }));

  const filtered = useMemo(
    () => trainees.filter(
      (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.svcId.includes(searchQuery)
    ),
    [trainees, searchQuery]
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = useMemo<ColumnDef<Trainee, any>[]>(() => [
    { id: "select", header: () => <Checkbox size={16} />, cell: () => <Checkbox size={16} />, width: "40px", minWidth: "40px" } as any,
    { id: "no", header: () => "No", cell: ({ row }: any) => <span className="text-sm text-gray-700">{(currentPage - 1) * PER_PAGE + row.index + 1}</span>, width: "56px", minWidth: "56px" } as any,
    { accessorKey: "rank", header: () => "Rank", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>, width: "80px", minWidth: "80px" } as any,
    { accessorKey: "name", header: () => "Name", cell: ({ getValue }: any) => <span className="text-sm font-medium text-gray-800">{getValue()}</span>, minWidth: "180px" } as any,
    { accessorKey: "svcId", header: () => "Service ID", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>, width: "120px", minWidth: "120px" } as any,
    { accessorKey: "platoon", header: () => "Platoon Number", cell: ({ getValue }: any) => <span className="text-sm text-gray-700">{getValue()}</span>, width: "130px", minWidth: "130px" } as any,
    {
      accessorKey: "weapon",
      header: () => "Weapon Type(s)",
      cell: ({ row }: any) => (
        <WeaponPickerCell
          svcId={row.original.svcId}
          weapons={weaponsByRow[row.original.svcId] ?? ["SAR21"]}
          onChange={updateWeapons}
        />
      ),
      width: "220px", minWidth: "220px",
    } as any,
    ...(showRoleColumn ? [{
      accessorKey: "role",
      header: () => "Role",
      cell: ({ getValue }: any) => (
        getValue()
          ? <span className="text-sm text-gray-700">{getValue()}</span>
          : <span className="text-sm text-gray-400">Not filled</span>
      ),
      width: "170px", minWidth: "170px",
    } as any] : []),
    {
      id: "lastUpdated",
      header: () => "Last Updated On",
      cell: () => (
        <span className="text-sm text-gray-500">
          17 January 2025<br /><span className="text-xs">09.29.33 AM</span>
        </span>
      ),
      width: "150px", minWidth: "150px",
    } as any,
    {
      id: "actions",
      header: () => "",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditTrainee({
              svcId: row.original.svcId,
              values: {
                rank: row.original.rank, name: row.original.name,
                svcId: row.original.svcId, platoon: row.original.platoon,
                role: row.original.role ?? "",
              },
            })}
            className="text-gray-400 hover:text-brand-primary"
          >
            <Pencil size={14} />
          </button>
          <button type="button" onClick={() => setDeleteTarget(row.original.svcId)} className="text-gray-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      width: "80px", minWidth: "80px",
    } as any,
  ], [currentPage, weaponsByRow, showRoleColumn]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {/* Courseware tabs — only when booking has multiple coursewares */}
      {coursewareList.length > 1 && (
        <div className="flex items-center gap-2 mb-3">
          {coursewareList.map((cw) => (
            <button
              key={cw}
              type="button"
              onClick={() => setActiveCourseware(cw)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                activeCourseware === cw
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
              )}
            >
              {cw}
            </button>
          ))}
        </div>
      )}
      {/* Station type sub-tabs — shown when active courseware has both station types */}
      {showCShapedTab && (
        <div className="flex items-center gap-2 mb-4">
          {(["Flat Screen", "C-Shaped"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setActiveStationType(type); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                activeStationType === type
                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">
          Nominal Roll List
          {activeCourseware && coursewareList.length > 0 && (
            <span className="text-xs font-normal text-brand-primary ml-2">— {activeCourseware}</span>
          )}
          {showCShapedTab && (
            <span className="text-xs font-normal text-gray-500 ml-1">— {activeStationType}</span>
          )}
          <span className="font-normal text-gray-500 text-sm"> ( {trainees.length} Trainee(s) )</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <InputCustom
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <Button
            type="outline"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center p-2 text-gray-500 w-auto border border-gray-200 hover:text-gray-700"
            title="Upload List"
          >
            <Upload size={16} />
          </Button>
          <Button
            onClick={() => setShowAddTrainee(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <Plus size={14} /> Add Trainee
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
        <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage} />
      </div>

      {showUploadModal && <UploadListModal onClose={() => setShowUploadModal(false)} />}

      {showAddTrainee && (
        <TraineeFormModal
          mode="add"
          showRole={showRoleColumn}
          onClose={() => setShowAddTrainee(false)}
          onSubmit={(values) => {
            setTrainees((prev) => [...prev, { ...values } as Trainee]);
            updateWeapons(values.svcId, ["SAR21"]);
          }}
        />
      )}

      {editTrainee && (
        <TraineeFormModal
          mode="edit"
          showRole={showRoleColumn}
          initialValues={editTrainee.values}
          onClose={() => setEditTrainee(null)}
          onSubmit={(values) => {
            setTrainees((prev) => prev.map((t) => (t.svcId === editTrainee.svcId ? { ...t, ...values } as Trainee : t)));
            setEditTrainee(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          message="Are you sure you want to delete this trainee?"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            setTrainees((prev) => prev.filter((t) => t.svcId !== deleteTarget));
            setDeleteTarget(null);
          }}
        />
      )}

      {/* Hidden trigger used by BookingForm to programmatically advance this step */}
      <button id="nominal-next-trigger" type="button" className="hidden" onClick={onNext} />
    </div>
  );
}
