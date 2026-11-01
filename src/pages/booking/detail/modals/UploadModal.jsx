import { Modal } from "@/components/modal-1";
import { Upload } from "lucide-react";
import { Button } from "@/components/button";
export function UploadModal({ open, onClose, onUpload }) {
    return (<Modal open={open} onClose={onClose} width="500px">
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center mt-2">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Upload size={24} className="text-brand-primary"/>
        </div>
        <p className="text-base font-semibold text-gray-800 mb-1">Drag and drop to upload file</p>
        <p className="text-sm text-gray-400 mb-4">Your TRX Spreadsheet File (up to 4 mb.)</p>
        <p className="text-sm text-gray-500 mb-4">Or</p>
        <Button className="mb-6 px-6 justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onUpload}>
          <Upload size={14} className="mr-2"/> Browse
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">We have prepared the Nominal Roll "Template" for you.</p>
          <p className="text-sm text-gray-400 mb-2">Your TRX Spreadsheet File (up to 4 mb.)</p>
          <button type="button" className="flex items-center gap-1.5 text-sm text-brand-primary font-medium hover:underline mx-auto">
            <Upload size={13}/> Click here to download
          </button>
        </div>
      </div>
    </Modal>);
}
