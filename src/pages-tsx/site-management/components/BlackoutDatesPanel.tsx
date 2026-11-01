import { useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Calendar, Plus, Eye, Trash2, CalendarX } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import { TableCustom } from "@/components/table";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { TIME_OPTIONS, DAYS } from "@/pages-tsx/site-management/constants";

export interface BlackoutDate {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurringDays: string[];
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Add Blackout Date modal ───────────────────────────────────────────────────
interface BlackoutFormValues {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  selectedDays: string[];
}

const validationSchema = Yup.object().shape({
  startDate: Yup.string().required("Start date is required"),
});

export function AddBlackoutDateModal({
  onClose, onConfirm,
}: {
  onClose: () => void;
  onConfirm: (data: Omit<BlackoutDate, "id">) => void;
}) {
  const initialValues: BlackoutFormValues = {
    startDate: "", endDate: "", startTime: "", endTime: "",
    recurring: false, selectedDays: [],
  };

  const handleSubmit = (values: BlackoutFormValues) => {
    onConfirm({
      startDate: values.startDate,
      endDate: values.endDate || values.startDate,
      startTime: values.startTime,
      endTime: values.endTime,
      recurringDays: values.recurring ? values.selectedDays : [],
    });
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} width={672}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-warning-invert-default flex items-center justify-center flex-shrink-0">
          <Calendar size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-default">Add Blackout Date</h3>
          <p className="text-sm text-body mt-0.5">Please fill all the information.</p>
        </div>
      </div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-default mb-1.5">
                  Start &amp; End Date <span className="text-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <Field name="startDate" type="date"
                    className="flex-1 px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <Field name="endDate" type="date" min={values.startDate}
                    className="flex-1 px-3 py-2.5 text-sm border border-invert-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <ErrorMessage name="startDate" component="p" className="mt-1 text-xs text-danger" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-default mb-1.5">
                  Start &amp; End Time <span className="text-danger">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-body font-medium">Start</span>
                  <Field name="startTime" as="select"
                    className="flex-1 px-3 py-2.5 text-sm border border-invert-default rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="">Select time</option>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Field>
                  <span className="text-xs text-body font-medium">End</span>
                  <Field name="endTime" as="select"
                    className="flex-1 px-3 py-2.5 text-sm border border-invert-default rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    <option value="">Select time</option>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFieldValue("recurring", !values.recurring)}
                className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
                  values.recurring ? "bg-primary-default" : "bg-disabled")}>
                <span className={cn("inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform",
                  values.recurring ? "translate-x-6" : "translate-x-1")} />
              </button>
              <span className="text-sm font-semibold text-default">Use recurring date</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-default mb-2">Select Days Recurring</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const selected = values.selectedDays.includes(day);
                  return (
                    <button key={day} type="button" disabled={!values.recurring}
                      onClick={() => setFieldValue("selectedDays",
                        selected ? values.selectedDays.filter((d) => d !== day) : [...values.selectedDays, day]
                      )}
                      className={cn("px-4 py-2 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                        selected ? "bg-primary-default text-invert-default border-primary" : "text-body border-invert-default hover:border-primary hover:text-primary"
                      )}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 -mx-6 -mb-6 px-6 pb-6 pt-2 border-t border-invert-default">
              <Button type="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-body border-invert-default justify-center">
                Cancel
              </Button>
              <Button type="submit" disabled={!values.startDate.trim()}
                className="flex-1 py-2.5 text-sm font-semibold bg-primary-default text-invert-default hover:bg-primary-hovered justify-center disabled:opacity-40">
                Confirm
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

// ── Blackout Dates tab (table + toolbar) ──────────────────────────────────────
export function BlackoutDatesTab({
  dates, onChange,
}: {
  dates: BlackoutDate[];
  onChange: (next: BlackoutDate[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState<BlackoutDate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (data: Omit<BlackoutDate, "id">) => {
    onChange([...dates, { id: `bo-${Date.now()}`, ...data }]);
  };

  const handleDelete = (id: string) => onChange(dates.filter((d) => d.id !== id));

  const columns = useMemo<ColumnDef<BlackoutDate, any>[]>(() => [
    {
      id: "startDate", header: () => "Start Date",
      cell: ({ row }: any) => <span className="text-sm text-default">{formatDate(row.original.startDate)}</span>,
    },
    {
      id: "endDate", header: () => "End Date",
      cell: ({ row }: any) => <span className="text-sm text-default">{formatDate(row.original.endDate)}</span>,
    },
    {
      id: "startTime", header: () => "Start Time",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.original.startTime || "-"}</span>,
    },
    {
      id: "endTime", header: () => "End Time",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.original.endTime || "-"}</span>,
    },
    {
      id: "type", header: () => "Blackout Type",
      cell: ({ row }: any) => (
        <span className={cn(
          "inline-flex items-center rounded-full border text-xs font-semibold px-2.5 py-0.5",
          row.original.recurringDays.length > 0
            ? "bg-purple-50 text-purple-600 border-purple-200"
            : "bg-default-default text-body border-invert-default"
        )}>
          {row.original.recurringDays.length > 0 ? "Recurring" : "One-Time"}
        </span>
      ),
    },
    {
      id: "actions", header: () => "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewing(row.original)}
            className="p-1.5 rounded-lg text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors">
            <Eye size={15} />
          </button>
          <button onClick={() => setDeleteId(row.original.id)}
            className="p-1.5 rounded-lg text-caption hover:text-danger hover:bg-danger-invert-soft transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-invert-default">
        <h2 className="text-sm font-bold text-default">
          Blackout Date <span className="text-body font-normal">({dates.length})</span>
        </h2>
        <Button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-primary-default text-invert-default hover:bg-primary-hovered font-semibold w-auto"
        >
          <Plus size={13} /> Add Blackout Date
        </Button>
      </div>

      {dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-default-default flex items-center justify-center mb-3">
            <CalendarX size={22} className="text-disabled" />
          </div>
          <p className="text-sm font-semibold text-default mb-1">No data to show right now!</p>
          <p className="text-xs text-disabled">This table will be automatically updated once users take action.</p>
        </div>
      ) : (
        <TableCustom columns={columns} data={dates} autoScrollTable={true} />
      )}

      {showAdd && (
        <AddBlackoutDateModal onClose={() => setShowAdd(false)} onConfirm={handleAdd} />
      )}

      {viewing && (
        <Modal open={true} onClose={() => setViewing(null)} width={420} title="Blackout Date">
          <div className="space-y-3">
            {[
              ["Start Date", formatDate(viewing.startDate)],
              ["End Date", formatDate(viewing.endDate)],
              ["Start Time", viewing.startTime || "-"],
              ["End Time", viewing.endTime || "-"],
              ["Recurring Days", viewing.recurringDays.length > 0 ? viewing.recurringDays.join(", ") : "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-invert-default pb-2">
                <span className="text-xs text-body">{label}</span>
                <span className="text-sm font-semibold text-default">{value}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {deleteId && (
        <DeleteConfirmDialog
          message="Are you sure you want to delete this blackout date?"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { handleDelete(deleteId); setDeleteId(null); }}
        />
      )}
    </div>
  );
}
