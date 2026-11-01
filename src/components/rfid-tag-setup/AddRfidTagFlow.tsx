import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RfidTagSetup } from "./RfidTagSetup";

/*
 * Add RFID Tag flow — Figma `Action - Add Asset` › `Modal - Connect RFID` (8002:46853) and
 * `Action - Add RFID Tag` (8002:43594 … 8028:55968), on Asset List (5133:42393). The same RFID Set Up
 * page is also what Asset Details › `Add Tag` opens (`Action - Add Tag`, 8004:26876).
 *
 *   prompt   "Would you like to add an RFID tag to this asset?"   Not Now · Add Tag     (Create Asset only)
 *   setup 1  RFID Set Up → Connect
 *   prompt 2 "Add RFID Tag 2?"                                    Not Now · Add Tag 2  (Create Asset only)
 *   setup 2  RFID Set Up → Connect
 *
 * The flow only reports what happened; the page owns the data and the toast:
 *   - `onTagConnected(tag, id)` after every Connect;
 *   - `onFinish(tagsAdded)` once, when the flow ends (Not Now, ✕, or the last Connect).
 * Figma's toasts: 0 → "{Asset Name} added", 1 → "{Asset Name} added with RFID Tag 1",
 * 2 → "2 RFID tags added to {Asset Name}" (Create Asset); "RFID tag added to {Asset Name}" (Asset Details).
 */

type Step = { kind: "prompt" } | { kind: "setup"; tag: 1 | 2 } | { kind: "prompt2" };

export interface AddRfidTagFlowProps {
  assetName: string;
  /** Create Asset starts on the "Would you like to add an RFID tag?" prompt; Asset Details › Add Tag goes straight to the set-up page. */
  startWith?: "prompt" | "setup";
  /** Tag slot the set-up page fills first. */
  tag?: 1 | 2;
  /** After Tag 1, offer "Add RFID Tag 2?" (Create Asset only). */
  offerSecondTag?: boolean;
  onTagConnected: (tag: 1 | 2, rfidTagId: string) => void;
  onFinish: (tagsAdded: number) => void;
}

export function AddRfidTagFlow({
  assetName,
  startWith = "prompt",
  tag = 1,
  offerSecondTag = true,
  onTagConnected,
  onFinish,
}: AddRfidTagFlowProps) {
  const [step, setStep] = useState<Step>(startWith === "prompt" ? { kind: "prompt" } : { kind: "setup", tag });
  const [added, setAdded] = useState(0);

  return (
    <>
      {step.kind === "setup" && (
        <RfidTagSetup
          key={step.tag}
          tagNumber={step.tag}
          onClose={() => onFinish(added)}
          onConnect={(id) => {
            onTagConnected(step.tag, id);
            const next = added + 1;
            setAdded(next);
            if (offerSecondTag && step.tag === 1) setStep({ kind: "prompt2" });
            else onFinish(next);
          }}
        />
      )}

      {/* Figma `Modal - Connect RFID` (8002:46853): Neutral `Modal Confirmation`, info icon. */}
      <ConfirmDialog
        open={step.kind === "prompt"}
        tone="neutral"
        title="Would you like to add an RFID tag to this asset?"
        subtitle={
          <>
            Assets without an RFID tag will be set to <b>No RFID</b>. You can add one later from Asset Details.
          </>
        }
        cancelLabel="Not Now"
        confirmLabel="Add Tag"
        onCancel={() => onFinish(0)}
        onConfirm={() => setStep({ kind: "setup", tag: 1 })}
      />

      {/* Figma `Modal - Connect RFID 2` (8028:55968). */}
      <ConfirmDialog
        open={step.kind === "prompt2"}
        tone="neutral"
        title="Add RFID Tag 2?"
        subtitle={`RFID Tag 1 has been added to ${assetName}. You can add a second tag now or later from Asset Details.`}
        cancelLabel="Not Now"
        confirmLabel="Add Tag 2"
        onCancel={() => onFinish(added)}
        onConfirm={() => setStep({ kind: "setup", tag: 2 })}
      />
    </>
  );
}
