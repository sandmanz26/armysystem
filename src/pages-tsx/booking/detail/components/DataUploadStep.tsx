import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { UploadModal } from "../modals/UploadModal";

export function DataUploadStep({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleUpload = () => { setIsUploaded(true); setShowUpload(false); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Upload Training Data</h2>
          <p className="text-xs text-gray-400 mt-0.5">Upload the integrated training data from the connected system</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!isUploaded}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto",
              isUploaded ? "bg-brand-primary text-white hover:bg-brand-primary-hover" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            Continue to Details <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!isUploaded ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Upload size={28} className="text-brand-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Training Data</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                Upload the training data file from the integrated system (MST, TCT, or MIOS) to proceed with the training session.
              </p>
              <Button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                <Upload size={16} /> Choose File to Upload
              </Button>
              {showUpload && (
                <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUpload={handleUpload} />
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={20} className="text-green-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Data Successfully Uploaded</p>
                  <p className="text-xs text-gray-500">Training data is ready for the session</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  The integrated training data has been successfully loaded into the system. Click "Continue to Details" to proceed with the training session setup.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
