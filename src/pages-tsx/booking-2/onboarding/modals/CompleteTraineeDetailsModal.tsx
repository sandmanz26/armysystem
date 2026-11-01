// Booking 2.0 Onboarding — "Complete Trainee Details" modal (F-009, O-5).
//
// Figma `Action - Scan ID` section: `Incomplete Trainee - Empty` (5622:156745),
// `Incomplete Trainee - Empty Error` (5622:159072), `Incomplete Trainee - Filled`
// (5622:159308). 1024px `Modal`: 32px header with a 20/600 title and an 18px `x`,
// a 14px intro line, then a `Section Layout - Table` ("Incomplete Trainee" + count)
// whose rows all carry the 4px `Table - Error Indicator`. Footer: ghost "Close" +
// primary "Confirm Trainees".
//
// "Confirm Trainees" is never disabled in Figma — clicking it while a trainee is
// still incomplete shows the `Empty Error` state (danger Alert above the intro).
//
// Used in two places: from Scan ID's "Finish Scanning" (the original spot) and,
// for a booking with both Flat Screen and C-Shaped, from the Nominal Roll page's
// "Incomplete Trainee" button (5626:196900) / "Review Incomplete Trainees"
// (5626:198154) after the user left Scan ID with walk-ins still incomplete.
import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@/components/icon";
import { Alert } from "@/components/alert";
import { TableCustom } from "@/components/table";
import type { OnboardingTrainee } from "../types";

const columnHelper = createColumnHelper<OnboardingTrainee>();

interface CompleteTraineeDetailsModalProps {
  trainees: OnboardingTrainee[];
  /** Figma `Empty Error` — set after "Confirm Trainees" was clicked with incomplete rows. */
  showError: boolean;
  onCompleteDetails: (t: OnboardingTrainee) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function CompleteTraineeDetailsModal({ trainees, showError, onCompleteDetails, onClose, onConfirm }: CompleteTraineeDetailsModalProps) {
  const columns = useMemo(() => [
    columnHelper.display({ id: "no", width: 56, header: () => "No.", cell: (info: any) => <span className="text-sm text-figma-body">{info.row.index + 1}</span> } as any),
    columnHelper.accessor("name", { width: 200, header: () => "Name", cell: (info: any) => <span className="text-sm font-semibold text-figma-default">{info.getValue()}</span> } as any),
    columnHelper.accessor("svcId", { width: 120, header: () => "Service ID", cell: (info: any) => <span className="text-sm text-figma-default">{info.getValue()}</span> } as any),
    columnHelper.display({ id: "baseStation", width: 120, header: () => "Base Station", cell: () => <span className="text-sm text-figma-body">—</span> } as any),
    columnHelper.display({ id: "lane", width: 120, header: () => "Lane", cell: () => <span className="text-sm text-figma-body">—</span> } as any),
    columnHelper.display({
      id: "registration",
      width: 160,
      header: () => "Registration",
      cell: () => <span className="px-2 py-0.5 rounded-full border text-xs font-semibold bg-figma-infobg border-figma-infoborder text-figma-info">Non-Registered</span>,
    } as any),
    columnHelper.display({
      id: "actions",
      width: 160,
      header: () => <span className="block text-right">Actions</span>,
      cell: (info: any) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onCompleteDetails(info.row.original)}
            className="px-3 py-1.5 text-xs font-semibold text-figma-primary border border-figma-primary rounded-lg hover:bg-figma-primarysoft whitespace-nowrap"
          >
            Complete Details
          </button>
        </div>
      ),
    } as any),
  ], [onCompleteDetails]);

  return (
    <div className="fixed inset-0 z-[2200] bg-black/40 flex items-center justify-center p-6">
      <div role="dialog" aria-modal="true" className="bg-white rounded-2xl shadow-2xl w-[1024px] max-w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-6 p-8">
          <h3 className="text-xl font-semibold text-figma-default">Complete Trainee Details</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-lg text-figma-default hover:bg-figma-soft">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-8 overflow-y-auto flex-1 flex flex-col gap-5">
          {showError && trainees.length > 0 && (
            <Alert status="danger" message={`${trainees.length} trainees are missing required details. Complete each one below before finishing.`} />
          )}
          <p className="text-sm text-figma-default">Fill in the required details for each trainee below, then finish scanning.</p>
          <div className="border border-figma-subtle rounded-xl overflow-hidden">
            <div className="p-5 flex items-center gap-2">
              <p className="text-base font-semibold text-figma-default">Incomplete Trainee</p>
              <span className="text-base font-semibold text-figma-body">{trainees.length}</span>
            </div>
            <TableCustom
              columns={columns}
              data={trainees}
              actionSticky={false}
              classThead="bg-figma-dangersoft/70"
              classTheadTh="text-figma-primary text-xs font-semibold"
              getRowClass={() => "[&>td:first-child]:shadow-[inset_4px_0_0_rgb(var(--color-text-danger))]"}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-8">
          <button type="button" onClick={onClose} className="h-10 px-4 text-sm font-semibold text-figma-default rounded-lg hover:bg-figma-soft bg-white">
            Close
          </button>
          <button type="button" onClick={onConfirm} className="h-10 px-4 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
            Confirm Trainees
          </button>
        </div>
      </div>
    </div>
  );
}
