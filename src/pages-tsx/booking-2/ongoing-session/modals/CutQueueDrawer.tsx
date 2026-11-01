import { Formik } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Radio } from "@/components/radio";
import { StatusBadge } from "@/components/status-badge";
import { cutBeforeOptions, type OngoingSession, type SessionDetail } from "../session";
import { STATUS_TONE } from "../statusTone";

// Figma `Action: Manage Queue` (5552:212745 Empty · 5552:215848 Filled ·
// 5552:214366 Empty Error): the detail card's "Manage Queue" button opens this
// drawer, titled "Manage Queue"; its one action is still the cut-before move.
const schema = Yup.object({ before: Yup.string().required("Cut before is required") });

export function CutQueueDrawer({
  session,
  detail,
  onClose,
  onConfirm,
}: {
  session: OngoingSession;
  detail: SessionDetail | null;
  onClose: () => void;
  onConfirm: (beforeId: string) => void;
}) {
  if (!detail) return null;
  const options = cutBeforeOptions(session, detail);

  return (
    <Formik initialValues={{ before: "" }} validationSchema={schema} onSubmit={(v) => onConfirm(v.before)}>
      {({ values, errors, submitCount, setFieldValue, submitForm }) => (
        <Drawer
          open
          onClose={onClose}
          title="Manage Queue"
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
            <span className="text-sm font-medium text-default">Cutting</span>
            <div className="flex flex-col gap-4 rounded-lg border border-invert-default bg-surface-lv1 p-4">
              <KeyValue label="Base Station" value={detail.station} />
              <KeyValue label="Detail" value={`Detail ${detail.number}`} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-body">Status</span>
                <span><StatusBadge tone={STATUS_TONE[detail.status]}>{detail.status}</StatusBadge></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-0.5 text-sm font-medium text-default">
              Cut before <span className="text-danger">*</span>
            </span>
            <div className="flex flex-col">
              {options.map((o) => (
                <Radio
                  key={o.id}
                  name="cut-before"
                  value={o.id}
                  checked={values.before === o.id}
                  onChange={(v) => setFieldValue("before", v)}
                  className="h-auto items-start py-1.5"
                  label={
                    <span className="flex flex-col">
                      <span className="text-sm text-default">Detail {o.number}</span>
                      <span className="text-xs text-body">{o.assignments.length} trainees · {o.status}</span>
                    </span>
                  }
                />
              ))}
            </div>
            {submitCount > 0 && errors.before && <p className="text-xs text-danger">{errors.before}</p>}
          </div>
        </Drawer>
      )}
    </Formik>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-body">{label}</span>
      <span className="text-sm font-semibold text-default">{value}</span>
    </div>
  );
}
