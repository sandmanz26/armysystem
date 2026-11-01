import { Users, CheckCircle, XCircle } from "lucide-react";
import { CoursewareSection } from "./CoursewareSection";
import { DETAIL } from "../constants";
export function DetailListTab({ courseware, setCourseware, onViewDetail }) {
    const passedCount = DETAIL.trainees.filter(t => t.resultLabel !== "FAILED").length;
    const failedCount = DETAIL.trainees.filter(t => t.resultLabel === "FAILED").length;
    return (<div className="p-6 space-y-4">
      <CoursewareSection courseware={courseware} setCourseware={setCourseware}/>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={18} className="text-blue-500"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{DETAIL.totalTrainees}</div>
            <div className="text-xs text-gray-500">Total Trainees</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-500"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{passedCount}</div>
            <div className="text-xs text-gray-500">Passed (incl. Marksman)</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle size={18} className="text-red-500"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{failedCount}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Details <span className="text-gray-400 font-normal ml-1">({DETAIL.details.length * DETAIL.details[0]?.traineesCount ?? 0} Details)</span>
        </h3>
      </div>

      {/* Station group */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm font-semibold text-gray-700">TRX-01</span>
          <span className="text-xs text-gray-400 ml-2">({DETAIL.details.reduce((s, d) => s + d.traineesCount, 0)} details)</span>
        </div>

        <div className="p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {DETAIL.details.map((detail, idx) => (
            Array.from({ length: Math.ceil(detail.traineesCount / 4) }).map((_, subIdx) => {
              const detailNum = DETAIL.details.slice(0, idx).reduce((s, d) => s + Math.ceil(d.traineesCount / 4), 0) + subIdx + 1;
              const traineeCount = Math.min(4, detail.traineesCount - subIdx * 4);
              return (
                <div key={`${detail.id}-${subIdx}`} className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-primary/30 hover:shadow-sm transition-all">
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-700">
                      Detail {detailNum}
                      <span className="text-gray-400 font-normal ml-1 truncate">
                        ({courseware?.substring(0, 20)}...)
                      </span>
                    </p>
                  </div>

                  {/* Card body */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Station Name</span>
                      <span className="text-xs font-semibold text-gray-700">{detail.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Trainee</span>
                      <span className="text-xs font-semibold text-gray-700">{traineeCount} trainee(s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Booking Name</span>
                      <span className="text-xs font-semibold text-gray-700 text-right max-w-[120px] truncate" title={DETAIL.program}>
                        {DETAIL.program}
                      </span>
                    </div>
                  </div>

                  {/* Card button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => onViewDetail?.(idx)}
                      className="w-full py-2 rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors"
                    >
                      View detail list
                    </button>
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>);
}
