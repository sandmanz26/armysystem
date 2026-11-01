import { useState } from "react";
import { Formik, Form } from "formik";
import { cn } from "@/lib/utils";
import { Radio } from "@/components/radio";
import { Toast } from "@/components/toast";
import { BOOKING_OPTIONS, ASSET_NOTIF_OPTIONS, TRAINING_NOTIF_OPTIONS, USER_NOTIF_OPTIONS } from "../constants";
import type { NotifTab, NotificationValues } from "../types";
import { SettingsPanel, SaveChangesButton } from "./SettingsPanel";

const TABS: NotifTab[] = ["Booking", "Asset", "Training", "User"];

/** Figma section heading + option list per tab — same Enabled/Disabled radio pattern throughout. */
const TAB_CONTENT: Record<NotifTab, { heading: string; options: string[] }> = {
  Booking: { heading: "Booking", options: BOOKING_OPTIONS },
  Asset: { heading: "Assets", options: ASSET_NOTIF_OPTIONS },
  Training: { heading: "Training", options: TRAINING_NOTIF_OPTIONS },
  User: { heading: "User", options: USER_NOTIF_OPTIONS },
};

const ALL_OPTIONS = TABS.flatMap((tab) => TAB_CONTENT[tab].options);

export const NOTIFICATION_DEFAULTS: NotificationValues = ALL_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option]: true }),
  {} as NotificationValues,
);

/**
 * Figma `Notification` page (`7033:691122`) — menu item "Notification",
 * page header **"Notification Settings"** (plural). Frames: Booking
 * `5029:6197`, Asset `7035:703862`, Training `7035:704535`, User `7035:705120`.
 *
 * - Tab Group v2 flush at the card top (active `text/primary` + 2px
 *   `background/primary/default`, inactive `text/body`, `background/divider` rule).
 * - Section Header per tab: "Booking" / "Assets" / "Training" / "User".
 * - Save is the Page Header's **Save Changes** (disabled while nothing changed),
 *   not a Cancel / Save row inside the card. After saving, the same
 *   "Changes updated" toast as General Settings (`5029:6237`) — Figma has no
 *   separate toast frame for this page.
 *
 * Saved values are owned by the Settings page so they survive switching menus.
 */
export function NotificationSetting({
  saved,
  onSave,
}: {
  saved: NotificationValues;
  onSave: (values: NotificationValues) => void;
}) {
  const [activeTab, setActiveTab] = useState<NotifTab>("Booking");
  const [toast, setToast] = useState<string | null>(null);
  const { heading, options } = TAB_CONTENT[activeTab];

  return (
    <>
      <Formik<NotificationValues>
        initialValues={saved}
        onSubmit={(values, { resetForm }) => {
          onSave(values);
          resetForm({ values });
          setToast("Changes updated");
        }}
      >
        {({ values, dirty, setFieldValue }) => (
          <Form>
            <SettingsPanel
              title="Notification Settings"
              sectionTitle={heading}
              headerAction={<SaveChangesButton type="submit" disabled={!dirty} />}
              topSlot={
                /* Tab Group v2 — flush at the card's top edge, 20px side padding. */
                <div className="relative bg-surface px-5">
                  <div className="flex">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative z-10 px-4 h-11 text-sm font-medium transition-colors",
                          activeTab === tab ? "text-primary" : "text-body hover:text-default",
                        )}
                      >
                        {tab}
                        {activeTab === tab && (
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary-default" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
                </div>
              }
            >
              <div className="space-y-5">
                {options.map((option) => (
                  <div key={option} role="radiogroup" aria-label={option} className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-default">{option}</span>
                    <div className="flex items-center gap-5">
                      <Radio
                        name={option}
                        value="enabled"
                        checked={values[option] === true}
                        onChange={() => setFieldValue(option, true)}
                        label="Enabled"
                      />
                      <Radio
                        name={option}
                        value="disabled"
                        checked={values[option] === false}
                        onChange={() => setFieldValue(option, false)}
                        label="Disabled"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SettingsPanel>
          </Form>
        )}
      </Formik>
      <Toast
        message={toast ?? ""}
        open={!!toast}
        onDismiss={() => setToast(null)}
        placement="top-right"
      />
    </>
  );
}
