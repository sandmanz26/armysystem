import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANKS } from "@/pages-tsx/user-management/list/constants";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-base font-semibold text-gray-800 mb-3">
        {label} {required && <span className="text-brand-primary">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all bg-white";

interface TraineeData {
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
}

export function IndividualTraineeStep({ onUpdate }: { onUpdate?: (data: TraineeData) => void }) {
  const [rank, setRank] = useState("REC");
  const [name, setName] = useState("");
  const [svcId, setSvcId] = useState("");
  const [platoon, setPlatoon] = useState("");
  const [rankOpen, setRankOpen] = useState(false);

  const notify = (patch: Partial<TraineeData>) => {
    onUpdate?.({ rank, name, svcId, platoon, ...patch });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 py-8 px-6">
      <h2 className="text-center text-base font-semibold text-gray-800 mb-6">Trainee information</h2>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            <Field label="Rank" required>
              <div className="relative">
                <button type="button" onClick={() => setRankOpen(o => !o)}
                  className={cn(inputCls, "flex items-center justify-between")}>
                  <span className="text-gray-800">{rank}</span>
                  <ChevronDown size={16} className={cn("text-gray-400 transition-transform", rankOpen && "rotate-180")} />
                </button>
                {rankOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                    {RANKS.map((r) => (
                      <button key={r} type="button"
                        onClick={() => { setRank(r); setRankOpen(false); notify({ rank: r }); }}
                        className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                          rank === r ? "text-brand-primary font-medium" : "text-gray-700")}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field label="Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => notify({ name })}
                placeholder="Enter trainee full name"
                className={inputCls}
              />
            </Field>

            <Field label="Service ID" required>
              <input
                type="text"
                value={svcId}
                onChange={(e) => setSvcId(e.target.value)}
                onBlur={() => notify({ svcId })}
                placeholder="e.g. A1234567"
                className={inputCls}
              />
            </Field>

            <Field label="Platoon Number" required>
              <input
                type="text"
                value={platoon}
                onChange={(e) => setPlatoon(e.target.value)}
                onBlur={() => notify({ platoon })}
                placeholder="e.g. Platoon 1"
                className={inputCls}
              />
            </Field>

          </div>
        </div>
      </div>
    </div>
  );
}
