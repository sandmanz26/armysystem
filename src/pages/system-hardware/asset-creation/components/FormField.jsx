import { AlertCircle } from "lucide-react";
export function FormField({ label, required: req, error, children }) {
    return (<div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {req && <span className="text-brand-primary ml-0.5">*</span>}
      </label>
      {children}
      {error && (<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11}/> {error}
        </p>)}
    </div>);
}
