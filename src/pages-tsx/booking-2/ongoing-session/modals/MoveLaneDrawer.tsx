import { Formik } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Radio } from "@/components/radio";
import { cn } from "@/lib/utils";
import type { SessionTrainee } from "../session";

export interface DestinationLane {
  lane: number;
  occupant: SessionTrainee | null;
}

const schema = Yup.object({ lane: Yup.number().nullable().required("Lane is required") });

// Figma `Move Trainee` / `Move Trainee - Empty Error` (6765:241757/241773),
// the "click & move" flow inside Create New Detail. Picking an occupied lane
// swaps the two trainees; an Available lane just moves this one.
export function MoveLaneDrawer({
  trainee,
  currentPosition,
  destinations,
  onClose,
  onConfirm,
}: {
  trainee: SessionTrainee | null;
  currentPosition: string;
  destinations: DestinationLane[];
  onClose: () => void;
  onConfirm: (lane: number) => void;
}) {
  if (!trainee) return null;
  return (
    <Formik initialValues={{ lane: null as number | null }} validationSchema={schema} onSubmit={(v) => { if (v.lane != null) onConfirm(v.lane); }}>
      {({ values, errors, submitCount, setFieldValue, submitForm }) => (
        <Drawer
          open
          onClose={onClose}
          title="Move Trainee"
          footer={
            <>
              <button type="button" onClick={onClose} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
                Cancel
              </button>
              <button type="button" onClick={submitForm} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors">
                Confirm
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-default">Trainee to Move</span>
            <div className="flex flex-col gap-4 rounded-lg bg-default-default p-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-body">Trainee</span>
                <span className="text-sm font-semibold text-default">{trainee.rank} {trainee.name}</span>
                <span className="text-xs text-body">{trainee.svcId}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-body">Current Position</span>
                <span className="text-sm font-semibold text-default">{currentPosition}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-0.5 text-sm font-medium text-default">
              Destination Lane <span className="text-danger">*</span>
            </span>
            <div className={cn("overflow-hidden rounded-lg border", submitCount > 0 && errors.lane ? "border-danger" : "border-invert-default")}>
              <div className="grid grid-cols-[48px_80px_1fr] bg-primary-invert-soft text-xs font-semibold text-primary">
                <span />
                <span className="py-2">Lane</span>
                <span className="py-2">Name</span>
              </div>
              {destinations.map((d) => (
                <div
                  key={d.lane}
                  onClick={() => setFieldValue("lane", d.lane)}
                  className={cn(
                    "grid cursor-pointer grid-cols-[48px_80px_1fr] items-center border-t border-invert-default",
                    d.occupant ? "bg-surface" : "bg-success-invert-default",
                  )}
                >
                  <span className="flex justify-center">
                    <Radio name="dest-lane" value={String(d.lane)} checked={values.lane === d.lane} onChange={() => setFieldValue("lane", d.lane)} label="" />
                  </span>
                  <span className="py-2 text-sm text-default">Lane {d.lane}</span>
                  {d.occupant ? (
                    <span className="flex flex-col py-2">
                      <span className="text-sm font-semibold text-default">{d.occupant.name}</span>
                      <span className="text-xs text-body">{d.occupant.svcId}</span>
                    </span>
                  ) : (
                    <span className="py-2 text-sm text-success">Available</span>
                  )}
                </div>
              ))}
            </div>
            {submitCount > 0 && errors.lane && <p className="text-xs text-danger">{errors.lane}</p>}
          </div>
        </Drawer>
      )}
    </Formik>
  );
}
