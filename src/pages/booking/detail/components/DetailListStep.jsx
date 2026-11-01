import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { DETAIL_GROUPS } from "../constants";
import { ReviewSummaryModal } from "../modals/ReviewSummaryModal";
import { EditDetailListPage } from "./EditDetailListPage";
export function DetailListStep({ onBack, onConfirm }) {
    const [showReview, setShowReview] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const totalDetails = DETAIL_GROUPS.reduce((s, g) => s + g.details.length, 0);
    const handleEditConfirm = () => {
        setShowEdit(false);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };
    if (showEdit)
        return <EditDetailListPage onBack={() => setShowEdit(false)} onConfirm={handleEditConfirm}/>;
    return (<div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Confirm Detail List</h2>
          <p className="text-xs text-gray-400 mt-0.5">Please confirm the detail list for the training.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="outline" onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200">
            <ArrowLeft size={14}/> Back
          </Button>
          <Button onClick={() => setShowReview(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
            Confirm detail list <ArrowRight size={14}/>
          </Button>
        </div>
      </div>

      {toastVisible && (<div className="fixed top-5 right-6 z-50 flex items-center gap-2 bg-white border border-green-200 shadow-lg rounded-lg px-4 py-3 text-sm font-medium text-green-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Details have been updated.
        </div>)}

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Details <span className="text-gray-400 font-normal">({totalDetails} Details)</span>
            </h3>
            <Button type="outline" onClick={() => setShowEdit(true)} className="px-4 py-2 text-sm font-semibold w-auto border border-brand-primary text-brand-primary hover:bg-red-50">
              Edit detail list
            </Button>
          </div>
          <div className="p-5 space-y-6">
            {DETAIL_GROUPS.map((group) => (<div key={group.station}>
                <div className="text-sm font-bold text-gray-800 mb-3">
                  {group.station}{" "}
                  <span className="text-gray-400 font-normal">({group.details.length} Details)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.details.map((detail, i) => (<div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="text-sm font-semibold text-gray-800">{detail.label}</div>
                      <div className="h-px bg-gray-100"/>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-400 mb-0.5">Station</div>
                          <div className="text-xs font-bold text-gray-800">{detail.assignedStation}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 mb-0.5">Trainees</div>
                          <div className="text-xs font-bold text-gray-800">{detail.trainees} Trainees</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-xs font-medium text-gray-600 bg-gray-50">
                            {detail.status}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full py-2.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover">
                        View Detail List
                      </Button>
                    </div>))}
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {showReview && <ReviewSummaryModal onCancel={() => setShowReview(false)} onConfirm={onConfirm}/>}
    </div>);
}
