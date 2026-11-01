import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import heroImg from "@/assets/hero.png";
import loginTextImg from "@/assets/login-text.png";
import { cn } from "@/lib/utils";

export function Login({ onLogin }) {
  const [svcId, setSvcId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!svcId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Dummy auth — any non-empty credentials work
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Left Panel ───────────────────────────────────────────── */}
      <div className="relative hidden md:flex flex-col flex-[3_3_0%] overflow-hidden">
        {/* Background image */}
        <img
          src={heroImg}
          alt="Armed forces personnel"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Gradient overlay: dark navy top → dark red bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2744]/85 via-[#1a2744]/70 to-[#0b3d3a]/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-10 text-center">
          <img src={loginTextImg} alt="TOMS Login" className="w-[360px]" />
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center pb-6 text-[11px] text-white/30">
          <p>© 2026 Northvale Armed Forces. For authorized personnel only.</p>
          <p className="flex items-center justify-center gap-1 mt-0.5">
            Powered by{" "}
            <span className="inline-flex items-center gap-1">
              <BlueSiloLogo />
              <span className="text-white/50 font-semibold">Blue Silo</span>
            </span>
          </p>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────── */}
      <div className="flex flex-col justify-center flex-[2_2_0%] bg-[#F2F0EC] px-10 md:px-16">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome</h2>
          <p className="text-sm text-gray-500 mb-8">
            Log in with your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service ID */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                Service ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={svcId}
                  onChange={(e) => setSvcId(e.target.value)}
                  placeholder="e.g. A1234567"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary placeholder-gray-300 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary placeholder-gray-300 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-lg text-sm font-bold text-white transition-colors mt-2",
                loading
                  ? "bg-brand-primary/60 cursor-not-allowed"
                  : "bg-brand-primary hover:bg-brand-primary-hover"
              )}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Crest placeholder ─────────────────────────────────────────────────────

function BlueSiloLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#3B82F6" />
      <text x="10" y="14" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
        BS
      </text>
    </svg>
  );
}
