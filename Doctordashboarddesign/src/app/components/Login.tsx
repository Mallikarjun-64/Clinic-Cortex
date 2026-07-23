import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { api } from "../lib/api";

const AUTH_KEY = "cliniccortex-auth";
const ACCOUNT_KEY = "cliniccortex-account";

const isAuthenticated = () => typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "true";

const getStoredAccount = () => {
  if (typeof window === "undefined") return null;
  const account = localStorage.getItem(ACCOUNT_KEY);
  return account ? JSON.parse(account) as { email: string; password: string } : null;
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [account, setAccount] = useState<{ email: string; password: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const registered = new URLSearchParams(location.search).get("registered");

  useEffect(() => {
    setAccount(getStoredAccount());
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    
    try {
      setError("");
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success && response.token) {
        localStorage.setItem("cliniccortex-token", response.token);
        localStorage.setItem(AUTH_KEY, "true");
        // Save doctor metadata locally for display fallback
        localStorage.setItem("clinic_cortex_verified_doctor", JSON.stringify({
          firstName: response.doctor.firstName,
          lastName: response.doctor.lastName,
          profEmail: response.doctor.email
        }));
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.message || "Failed to log in.");
      }
    } catch (err: any) {
      console.error("Login call failed:", err);
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.3),_transparent_25%)]" />
      <div className="pointer-events-none absolute -left-28 top-1/4 h-72 w-72 rounded-full bg-slate-800/70 blur-3xl animate-blob-slow" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-br-[5rem] bg-slate-950/80 opacity-30 blur-3xl animate-blob-slow" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-slate-700/20 blur-3xl animate-blob-slow" style={{ animationDelay: '1.8s' }} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-900/95 shadow-2xl shadow-slate-950/30 backdrop-blur-xl border border-slate-800">
            <div className="flex h-full flex-col lg:flex-row">
              <div className="w-full p-10 lg:w-[55%]">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-950/20">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-950 font-semibold">D</span>
                  <span className="text-sm font-medium">Doctor Portal</span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Doctor Login</h1>
                <p className="mt-3 text-sm text-slate-400">Please enter your doctor credentials to access your dashboard.</p>

                {registered === "true" && (
                  <p className="mt-6 rounded-3xl border border-emerald-700/60 bg-emerald-900/80 px-4 py-3 text-sm text-emerald-200">
                    Signup completed successfully. Please login with your registered email and password.
                  </p>
                )}
                {error && (
                  <p className="mt-6 rounded-3xl border border-red-700/60 bg-red-900/80 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M2.25 4.5A2.25 2.25 0 0 1 4.5 2.25h15a2.25 2.25 0 0 1 2.25 2.25v15a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 19.5v-15ZM12 12.751l8.18-5.336a.75.75 0 1 0-.76-1.286L12 10.67 4.33 6.129a.75.75 0 1 0-.76 1.286L12 12.75Zm8.25 1.69V6.87l-7.744 5.046a.75.75 0 0 1-.512.185.75.75 0 0 1-.512-.185L3.75 6.87v7.57c0 .414.336.75.75.75h15c.414 0 .75-.336.75-.75Z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M16.5 10.5H15V8.25A3.75 3.75 0 0 0 11.25 4.5h-.75A3.75 3.75 0 0 0 6.75 8.25V10.5H5.25A2.25 2.25 0 0 0 3 12.75v6.75A2.25 2.25 0 0 0 5.25 21.75h11.25A2.25 2.25 0 0 0 18.75 19.5v-6.75a2.25 2.25 0 0 0-2.25-2.25Zm-5.25 5.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-2.25-5.25V8.25c0-.966.784-1.75 1.75-1.75h.75c.966 0 1.75.784 1.75 1.75V10.5H9Zm6.75 2.25H7.5v-1.5h7.5v1.5Z" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                        placeholder="********"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/40 transition hover:brightness-110"
                  >
                    Sign in
                  </button>
                </form>

                <p className="mt-6 text-sm text-slate-400">
                  New here? <Link to="/signup" className="font-semibold text-sky-400 underline">Create an account</Link>
                </p>
              </div>

              <div className="hidden lg:flex w-[45%] flex-col justify-between bg-slate-950 p-10 text-white">
                <div>
                  <div className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</div>
                  <h2 className="text-2xl font-semibold">Continue your care journey</h2>
                </div>
                <div className="rounded-[1.8rem] bg-slate-900/80 p-5 text-sm leading-6 text-slate-300 shadow-inner shadow-slate-900/20 animate-pulse-slow">
                  Your login portal is designed for quick access and secure dashboard entry. Use your registered credentials to proceed.
                </div>
                <div className="relative mt-8 overflow-hidden rounded-[1.8rem] border border-slate-800/70 bg-slate-900/90 p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_40%)]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25Zm.75 13.5h-1.5v2.25h-1.5v-2.25H8.25v-1.5h1.5V11.25h1.5v2.25h1.5v1.5Zm3.75-8.25h-1.5V6.75h-1.5v1.5h-1.5v1.5h1.5v1.5h1.5V9h1.5V7.5Z" />
                        </svg>
                      </div>
                      <div>
                        <div className="h-2.5 w-24 rounded-full bg-slate-700/70" />
                        <div className="mt-2 h-2 w-16 rounded-full bg-slate-700/60" />
                      </div>
                    </div>
                    <div className="mt-6 h-24 overflow-hidden rounded-[1.5rem] bg-slate-950/90 p-4">
                      <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-slate-800/70 bg-slate-900/90">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.14),transparent_40%)]" />
                        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.18),transparent)] animate-health-wave" />
                        <div className="relative z-10 flex h-full items-center justify-between gap-2 px-4">
                          <span className="block h-2 w-10 rounded-full bg-slate-700/80" />
                          <span className="block h-2 w-2 rounded-full bg-sky-400/80 animate-pulse-slow" />
                          <span className="block h-2 w-8 rounded-full bg-slate-700/80" />
                          <span className="block h-2 w-3 rounded-full bg-sky-400/80 animate-pulse-slow" />
                          <span className="block h-2 w-14 rounded-full bg-slate-700/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 shadow-2xl shadow-slate-950/20">
            <div className="h-full w-full rounded-[1.8rem] bg-[radial-gradient(circle_at_top_right,_rgba(192,230,255,0.12),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.1),_transparent_30%)] p-6 text-white">
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded-full bg-white/10" />
                    <div className="h-3 w-24 rounded-full bg-white/8" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 rounded-[1.5rem] bg-white/10" />
                  <div className="h-4 w-36 rounded-full bg-white/8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
