import { useState } from "react";
import { Check, ChevronRight, Home, MoreVertical, Plus, CalendarX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { StatusBadge } from "./StatusBadge";
import { AddBlackoutModal } from "../modals/AddBlackoutModal";
export function LaneDetail({ station, lane, onBackToList, onBackToStation, }) {
    const [activeTab, setActiveTab] = useState("details");
    const [blackoutDates, setBlackoutDates] = useState(lane.blackoutDates);
    const [showAddBlackout, setShowAddBlackout] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };
    const lastUpdatedDate = lane.lastUpdatedOn.split("\n")[0];
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {successMsg && (<div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
            <Check size={16}/>{successMsg}
          </div>)}

        <nav className="flex items-center gap-1.5 text-sm mb-5">
          <button onClick={onBackToList} className="text-gray-400 hover:text-brand-primary transition-colors">
            <Home size={14}/>
          </button>
          <ChevronRight size={14} className="text-gray-400"/>
          <button onClick={onBackToList} className="text-gray-500 hover:text-brand-primary transition-colors">
            Site Management
          </button>
          <ChevronRight size={14} className="text-gray-400"/>
          <button onClick={onBackToStation} className="text-gray-500 hover:text-brand-primary transition-colors">
            Base Station Details
          </button>
          <ChevronRight size={14} className="text-gray-400"/>
          <span className="text-brand-primary font-medium">Lane Details</span>
        </nav>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-6 pt-5 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-gray-900">{lane.name}</h1>
                <StatusBadge status={lane.status}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">Last updated on: {lastUpdatedDate}</p>
            </div>
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5">
              <MoreVertical size={16}/>
            </button>
          </div>

          <div className="flex border-b border-gray-200 px-6">
            {([
            { key: "details", label: "Lane Details" },
            { key: "blackout", label: "Blackout Dates" },
        ]).map(({ key, label }) => (<button key={key} onClick={() => setActiveTab(key)} className={cn("px-1 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors -mb-px", activeTab === key ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-gray-600")}>
                {label}
              </button>))}
          </div>

          {activeTab === "details" && (<div className="px-6 py-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Lane Details</h2>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="pr-6">
                  <p className="text-xs text-gray-400">Lane</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{lane.name}</p>
                  <p className="text-xs text-gray-400 mt-3">Lane status</p>
                  <div className="mt-1"><StatusBadge status={lane.status}/></div>
                </div>
                <div className="px-6">
                  <p className="text-xs text-gray-400">Base Station</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{station.name}</p>
                  <p className="text-xs text-gray-400 mt-3">Station status</p>
                  <div className="mt-1"><StatusBadge status={station.status}/></div>
                </div>
                <div className="pl-6">
                  <p className="text-xs text-gray-400">Blackout Dates</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {blackoutDates.length} {blackoutDates.length === 1 ? "Day" : "Day"}
                  </p>
                </div>
              </div>
            </div>)}

          {activeTab === "blackout" && (<div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">
                  Blackout Dates <span className="text-gray-400 font-normal ml-1">({blackoutDates.length})</span>
                </h2>
                <Button onClick={() => setShowAddBlackout(true)} className="flex items-center gap-2 px-3.5 py-2 text-sm bg-brand-primary text-white hover:bg-brand-primary-hover font-semibold w-auto">
                  <Plus size={13}/> Add Date
                </Button>
              </div>
              {blackoutDates.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CalendarX size={36} className="mb-3 opacity-30"/>
                  <p className="text-sm font-medium">No blackout dates configured</p>
                  <p className="text-xs mt-1">Add dates when this lane is unavailable</p>
                </div>) : (<div className="divide-y divide-gray-50">
                  {blackoutDates.map((d, i) => (<div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                          <CalendarX size={15} className="text-orange-500"/>
                        </div>
                        <span className="text-sm text-gray-800 font-medium">{d}</span>
                      </div>
                      <button onClick={() => setBlackoutDates(prev => prev.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={14}/>
                      </button>
                    </div>))}
                </div>)}
            </div>)}
        </div>
      </div>

      {showAddBlackout && (<AddBlackoutModal onClose={() => setShowAddBlackout(false)} onConfirm={label => {
                setBlackoutDates(prev => [...prev, label]);
                showSuccess("Blackout date added successfully.");
            }}/>)}
    </div>);
}
