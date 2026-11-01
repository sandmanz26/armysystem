import { useEffect, useState } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";

/*
 * RFID Set Up — Figma section `Action - Add RFID Tag` (Asset List page 5133:42393, 9 frames):
 *
 *   Add Tag          8002:43594 (Tag 1) · 8028:64578 (Tag 2)   Header "Disconnected", Connect disabled,
 *                                                              body = empty state "Place your asset on the RFID reader"
 *   ID Tag - Filled  8002:43616 (Tag 1) · 8028:64580 (Tag 2)   Header "Connected", Connect enabled,
 *                                                              body = field "RFID ID Tag N *" holding the tag that was read
 *
 * Page layout template (1440 × 900, `background/default/soft`): a 60px `Header Nav - Add Asset Tag`
 * — 44px round outlined ✕ on the left, "RFID Set Up" (16 Semi Bold) over the connection state (12; danger
 * while Disconnected, success once Connected) centred, a primary 44px `Connect` button on the right —
 * then a 640px column, 24px from the header, holding one `Section Layout` card (radius 12, 1px border):
 * a 20px-padded header ("Place your asset on the RFID reader" 16 Semi Bold + "Please make sure to put
 * only one asset when putting on the reader." 12 body) and 20px of content. Figma strokes sit inside the
 * frame, so every 20px padding is 19px + the 1px CSS border (the card is 286 / 166 tall, as drawn).
 *
 * The reader is simulated like the Scan & Return page: Disconnected for `CONNECT_MS`, then Connected
 * with the tag it read already in the field (Figma's own sample ids). The field stays editable, so a tag
 * id can still be typed by hand — the old two-step "Next → type the id" flow allowed that too.
 */

const CONNECT_MS = 2000;

/** Sample reads, straight from Figma's `ID Tag - Filled` frames. */
const SIMULATED_READ: Record<1 | 2, string> = {
  1: "260427-RFI002",
  2: "260427-RFI004",
};

const schema = Yup.object().shape({
  rfidTagId: Yup.string().trim().required(),
});

interface FormValues {
  rfidTagId: string;
}

export interface RfidTagSetupProps {
  /** Which tag slot is being set up — drives the field label "RFID ID Tag N". */
  tagNumber: 1 | 2;
  /** Connect pressed with a tag id in the field. */
  onConnect: (rfidTagId: string) => void;
  /** ✕ pressed. */
  onClose: () => void;
}

function SetupScreen({ tagNumber, onClose }: Pick<RfidTagSetupProps, "tagNumber" | "onClose">) {
  const { values, handleChange, handleBlur, setFieldValue, submitForm } = useFormikContext<FormValues>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setConnected(true);
      setFieldValue("rfidTagId", SIMULATED_READ[tagNumber]);
    }, CONNECT_MS);
    return () => clearTimeout(t);
  }, [tagNumber, setFieldValue]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const canConnect = connected && values.rfidTagId.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col bg-default-soft">
      {/* ── Header Nav - Add Asset Tag (60px) ── */}
      <div className="relative flex h-[60px] flex-shrink-0 items-center justify-between border-b border-invert-default bg-surface px-6">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-invert-default bg-surface text-default hover:bg-default-hovered transition-colors"
        >
          <Icon name="x" size={18} />
        </button>
        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5">
          <p className="text-base font-semibold text-default">RFID Set Up</p>
          <p className={cn("text-xs", connected ? "text-success" : "text-danger")}>
            {connected ? "Connected" : "Disconnected"}
          </p>
        </div>
        <button
          type="button"
          disabled={!canConnect}
          onClick={submitForm}
          className={cn(
            "flex h-11 items-center rounded-lg px-5 text-sm font-semibold transition-colors",
            canConnect
              ? "bg-primary-default text-invert-default hover:bg-primary-hovered"
              : "cursor-not-allowed bg-disabled text-disabled",
          )}
        >
          Connect
        </button>
      </div>

      {/* ── Page body ── */}
      <div className="flex flex-1 justify-center overflow-auto p-6">
        <div className="w-[640px] max-w-full">
          <section className="rounded-xl border border-invert-default bg-surface">
            <header className="flex flex-col gap-0.5 px-[19px] pb-5 pt-[19px]">
              <h2 className="text-base font-semibold leading-6 text-default">Place your asset on the RFID reader</h2>
              <p className="text-xs leading-4 text-body">
                Please make sure to put only one asset when putting on the reader.
              </p>
            </header>
            <div className={cn("px-[19px]", connected && "pb-[19px]")}>
              {connected ? (
                <Input
                  name="rfidTagId"
                  label={`RFID ID Tag ${tagNumber}`}
                  required
                  value={values.rfidTagId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              ) : (
                /* Figma `Empty State - Instruction - Button` (What = RFID): 80px `background/default/default`
                   circle holding Figma's RFID reader illustration, then a 14 Semi Bold title and a centred
                   14 body subtitle. The illustration is NOT in the icon library (drawn vectors in
                   Figma) — the slot is left empty rather than substituted. */
                <div className="flex flex-col items-center gap-3 pb-[23px] pt-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-default-default" />
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold leading-5 text-default">Place your asset on the RFID reader</p>
                    <p className="pt-1 text-center text-sm text-body">
                      Please make sure to place one asset on the RFID Reader at a time, wait for it to be scanned, and
                      then place the next one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function RfidTagSetup({ tagNumber, onConnect, onClose }: RfidTagSetupProps) {
  return (
    <Formik<FormValues>
      initialValues={{ rfidTagId: "" }}
      validationSchema={schema}
      onSubmit={(values) => onConnect(values.rfidTagId.trim())}
    >
      <SetupScreen tagNumber={tagNumber} onClose={onClose} />
    </Formik>
  );
}
