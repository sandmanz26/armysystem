import { useState } from "react";
import heroImg from "@/assets/hero.png";
import loginTextImg from "@/assets/login-text.png";
import { Input } from "@/components/input";
import { Icon } from "@/components/icon";
import { Toast } from "@/components/toast";
import { cn } from "@/lib/utils";
import { LOGIN_TOAST_KEY } from "@/pages-tsx/dashboard/constants";

/**
 * Dummy auth — there is no backend yet, so ANY non-empty Service ID + password logs
 * in (A1234567 / test1234 and every other demo account keep working), EXCEPT
 * this one reserved password, which simulates a rejected login so the
 * "Login failed. Invalid credentials" state (Figma 5161:185968) can be shown:
 * type any Service ID + password `wrongpass`.
 */
const INVALID_DEMO_PASSWORD = "wrongpass";

// Figma 5029:123620 placeholders: {user_name} = sidebar user card, {platform_name} = brand name.
const LOGIN_USER_NAME = "Olivia Carter";
const LOGIN_PLATFORM_NAME = "TOMS";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [svcId, setSvcId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Figma's Login frame validates per field (Status=danger + a caption on the
  // field itself), not with one form-level error line.
  const [errors, setErrors] = useState<{ svcId?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: { svcId?: string; password?: string } = {};
    if (!svcId) next.svcId = "Service ID is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    setLoginFailed(false);
    if (next.svcId || next.password) return;

    setLoading(true);
    // Dummy auth — see INVALID_DEMO_PASSWORD. On failure Figma keeps both
    // fields filled and un-flagged (no red border); only the toast reports it.
    setTimeout(() => {
      setLoading(false);
      if (password === INVALID_DEMO_PASSWORD) {
        setLoginFailed(true);
        return;
      }
      try {
        sessionStorage.setItem(
          LOGIN_TOAST_KEY,
          `Login successfully by ${LOGIN_USER_NAME}. Welcome to ${LOGIN_PLATFORM_NAME}!`,
        );
      } catch {
        // sessionStorage unavailable — the toast is skipped, login still proceeds.
      }
      onLogin();
    }, 800);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Login failed toast — Figma 5161:185968, top-right 24/24. */}
      <Toast
        tone="danger"
        open={loginFailed}
        message="Login failed. Invalid credentials"
        onDismiss={() => setLoginFailed(false)}
        placement="top-right"
        offsetTop={24}
        duration={5000}
      />
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
        <div className="relative z-10 text-center pb-6 text-[11px] text-invert-default/30">
          <p>© 2026 Northvale Armed Forces. For authorized personnel only.</p>
          <p className="flex items-center justify-center gap-1 mt-0.5">
            Powered by{" "}
            <span className="inline-flex items-center gap-1">
              <BlueSiloLogo />
              <span className="text-invert-default/50 font-semibold">Blue Silo</span>
            </span>
          </p>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────── */}
      <div className="flex flex-col justify-center flex-[2_2_0%] bg-default-soft px-10 md:px-16">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold text-default mb-1">Welcome</h2>
          <p className="text-sm text-body mb-8">
            Log in with your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service ID — DS Input, Size md*, Required, Prefix Icon, Clearable */}
            <Input
              label="Service ID"
              required
              value={svcId}
              onChange={(e) => setSvcId(e.target.value)}
              placeholder="Enter Service ID (e.g., A1234567)"
              prefixIcon={<Icon name="user" size={18} />}
              clearable
              onClear={() => setSvcId("")}
              status={errors.svcId ? "danger" : "default"}
              caption={errors.svcId}
              autoComplete="username"
            />

            {/* Password — DS Input, Size md*, Required, Prefix + Suffix Icon */}
            <Input
              label="Password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              prefixIcon={<Icon name="lock" size={18} />}
              suffixIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-caption hover:text-default transition-colors"
                >
                  {/* Figma: hidden password shows `eye-off`, revealed shows `eye`. */}
                  <Icon name={showPassword ? "eye" : "eye-off"} size={18} />
                </button>
              }
              status={errors.password ? "danger" : "default"}
              caption={errors.password}
              autoComplete="current-password"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-lg text-sm font-bold text-invert-default transition-colors mt-2",
                loading
                  ? "bg-primary-default/60 cursor-not-allowed"
                  : "bg-primary-default hover:bg-primary-hovered"
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
