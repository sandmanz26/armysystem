import { Download, Upload } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";

export function MSTTCTUploadListModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} width={512}>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center">

        {/* Upload icon */}
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary/30 flex items-center justify-center">
              <Upload size={16} className="text-brand-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <span className="text-[8px] text-brand-primary font-bold">↑</span>
            </div>
          </div>
        </div>

        <p className="text-base font-semibold text-gray-800 mb-1">Drag and drop to upload file</p>
        <p className="text-sm text-gray-400 mb-4">Your MST/TCT Spreadsheet File (up to 4 mb.)</p>
        <p className="text-sm text-gray-400 mb-4">Or</p>

        <Button className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover mb-6 rounded-lg">
          <Upload size={14} /> Browse
        </Button>

        {/* Template download */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            We have prepared the Nominal Roll &quot;Template&quot; for you.
          </p>
          <p className="text-sm text-gray-400 mb-2">Your MST TCT Spreadsheet File (up to 4 mb.)</p>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline mx-auto"
          >
            <Download size={13} /> Click here to download
          </button>
        </div>

      </div>
    </Modal>
  );
}
