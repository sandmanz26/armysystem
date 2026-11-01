import { Upload } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
export function UploadListModal({ onClose }) {
    return (<Modal open={true} onClose={onClose} width={512}>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Upload size={24} className="text-brand-primary"/>
        </div>
        <p className="text-base font-semibold text-gray-800 mb-1">Drag and drop to upload file</p>
        <p className="text-sm text-gray-400 mb-4">Your TRX Spreadsheet File (up to 4 mb.)</p>
        <p className="text-sm text-gray-500 mb-4">Or</p>
        <Button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover mb-6">
          <Upload size={14}/> Browse
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">We have prepared the Nominal Roll "Template" for you.</p>
          <p className="text-sm text-gray-400 mb-2">Your TRX Spreadsheet File (up to 4 mb.)</p>
          <Button className="flex items-center gap-1.5 text-sm font-medium w-auto bg-transparent text-brand-primary hover:bg-transparent hover:underline mx-auto px-0">
            <Upload size={13}/> Click here to download
          </Button>
        </div>
      </div>
    </Modal>);
}
