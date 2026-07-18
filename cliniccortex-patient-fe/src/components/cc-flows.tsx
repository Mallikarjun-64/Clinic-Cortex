import { useEffect, useState } from "react";
import {
  Activity, Smartphone, Globe, Fingerprint, ArrowRight, Check,
  Stethoscope, UserRound, FlaskConical, ShieldCheck, X,
} from "lucide-react";
import { LANGUAGES, useCC, type Role } from "@/lib/cc-state";

/* ---------------- Gateway Splash ---------------- */
export function Gateway() {
  const { setFlow } = useCC();
  const [show, setShow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShow(true), 700); return () => clearTimeout(id); }, []);
  return (
    <div className="min-h-screen w-full cc-grad-deep relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/40 blur-3xl animate-pulse" />
      </div>
      <div className="relative z-10 text-center text-white max-w-md cc-pop">
        <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-xl flex items-center justify-center cc-pulse-ring">
          <Activity className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">ClinicCortex</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-cyan-200">Health Intelligence</p>
        {show && (
          <div className="mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 cc-fade-up">
            <p className="text-sm leading-relaxed">
              Welcome to ClinicCortex. Experience seamless health optimization.
              Would you like to download our dedicated Mobile App for real-time monitoring,
              or continue in your browser?
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setFlow("language")}
                className="group flex items-center justify-center gap-2 w-full rounded-2xl bg-white text-[#0F2DA1] font-semibold py-3.5 transition-all hover:scale-[1.02] active:scale-[0.98] cc-shadow"
              >
                <Smartphone className="w-5 h-5" />
                Download Mobile App
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setFlow("language")}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border border-white/40 text-white font-medium py-3.5 transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <Globe className="w-5 h-5" />
                Continue in Browser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Language ---------------- */
export function LanguageSheet() {
  const { setFlow, lang, setLang, t } = useCC();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="cc-grad-deep px-6 pt-10 pb-12 rounded-b-[2.5rem] text-white">
        <h2 className="text-2xl font-bold">{t("choose_language")}</h2>
        <p className="text-cyan-100 text-sm mt-1">{t("app_switch")}</p>
      </div>
      <div className="flex-1 px-5 -mt-6 pb-28">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 cc-fade-up">
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-2xl px-3 py-3 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-primary-foreground cc-shadow scale-[1.03]"
                    : "bg-card border text-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-bold leading-tight">{l.native}</span>
                <span className={`text-[10px] leading-none ${active ? "text-cyan-100" : "text-muted-foreground"}`}>{l.latin}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 p-5 bg-background/90 backdrop-blur border-t">
        <button
          onClick={() => setFlow("identity")}
          className="w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
        >
          {t("continue_btn")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Identity ---------------- */
export function Identity() {
  const { setFlow, role, setRole, t } = useCC();
  const roles: { id: Role; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "patient", label: t("patient"), icon: UserRound, desc: t("book_consults") },
    { id: "doctor", label: t("doctor"), icon: Stethoscope, desc: t("manage_queue") },
    { id: "lab", label: t("lab_assist"), icon: FlaskConical, desc: t("upload_reports") },
  ];
  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure identity
        </div>
        <h2 className="text-2xl font-bold mt-4">{t("who_are_you")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("select_role")}</p>
      </div>
      <div className="mt-8 grid gap-4 cc-fade-up">
        {roles.map((r) => {
          const Icon = r.icon;
          const active = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`w-full rounded-3xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] text-left ${
                active ? "bg-primary text-primary-foreground cc-shadow" : "bg-card border hover:border-primary/40"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{r.label}</div>
                <div className={`text-xs ${active ? "text-cyan-100" : "text-muted-foreground"}`}>{r.desc}</div>
              </div>
              {active && <Check className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      <div className="mt-auto pt-8 grid gap-3">
        <button onClick={() => setFlow("login")} className="w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5">{t("continue_login")}</button>
        <button onClick={() => setFlow("signup")} className="w-full border rounded-2xl py-3 text-sm">{t("new_here")}</button>
      </div>
    </div>
  );
}

/* ---------------- Login ---------------- */
export function Login() {
  const { setFlow, t } = useCC();
  const [otp, setOtp] = useState(true);
  const [scanning, setScanning] = useState(false);

  const runBiometric = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setFlow("app"); }, 1600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="cc-grad-deep px-6 pt-12 pb-16 rounded-b-[2.5rem] text-white">
        <h1 className="text-3xl font-bold">{t("welcome_back")}</h1>
        <p className="text-cyan-100 text-sm mt-2">{t("sign_in_cc")}</p>
      </div>
      <div className="px-6 -mt-8 flex-1">
        <div className="bg-card border rounded-3xl p-6 cc-shadow cc-fade-up">
          <label className="text-xs font-medium text-muted-foreground">Mobile number / CID</label>
          <input className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:border-primary transition-colors" placeholder="+91 9876543210" />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">Login with OTP</span>
            <button onClick={() => setOtp(!otp)} className={`relative w-12 h-7 rounded-full transition-colors ${otp ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${otp ? "translate-x-5" : ""}`} />
            </button>
          </div>
          {!otp && (
            <div className="mt-4 cc-fade-up">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input type="password" className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="••••••••" />
            </div>
          )}
          <button onClick={() => setFlow("app")} className="mt-5 w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 active:scale-[0.98] transition-transform">
            {otp ? "Send OTP" : "Sign in"}
          </button>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <button
            onClick={runBiometric}
            className="mt-6 w-full flex flex-col items-center gap-2 group"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              scanning ? "bg-primary text-white cc-pulse-ring" : "bg-primary/10 text-primary group-hover:bg-primary/20"
            }`}>
              <Fingerprint className="w-10 h-10" />
            </div>
            <span className="text-xs text-muted-foreground">{scanning ? "Scanning fingerprint…" : "Touch to use biometric"}</span>
          </button>
        </div>
        <button onClick={() => setFlow("app")} className="mt-6 w-full text-center text-sm text-primary font-medium underline-offset-4 hover:underline">
          {t("guest")}
        </button>
        <p className="mt-6 text-center text-sm">
          New user?{" "}
          <button onClick={() => setFlow("signup")} className="text-primary font-semibold">{t("signup")}</button>
        </p>
      </div>
    </div>
  );
}

/* ---------------- Signup ---------------- */
export function Signup() {
  const { setFlow } = useCC();
  const [form, setForm] = useState({
    name: "", age: "", gender: "", email: "", phone: "",
    password: "", confirm: "", dessie: "", income: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Required";
    if (!form.age || +form.age < 1) e.age = "Invalid";
    if (!form.gender) e.gender = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!/^\+?\d{7,15}$/.test(form.phone)) e.phone = "Invalid phone";
    if (form.password.length < 6) e.password = "Min 6 chars";
    if (form.password !== form.confirm) e.confirm = "Mismatch";
    if (!form.income) e.income = "Required";
    setErrors(e);
    if (Object.keys(e).length === 0) setFlow("app");
  };

  const F = (label: string, k: string, type = "text", opts?: string[]) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {opts ? (
        <select
          value={(form as any)[k]}
          onChange={(ev) => set(k, ev.target.value)}
          className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:border-primary"
        >
          <option value="">Select…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={(form as any)[k]}
          onChange={(ev) => set(k, ev.target.value)}
          className="mt-1 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:border-primary"
        />
      )}
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="cc-grad-deep px-6 pt-12 pb-10 rounded-b-[2.5rem] text-white flex items-center gap-3">
        <button onClick={() => setFlow("identity")} className="p-2 -ml-2"><X className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-cyan-100 text-sm">Takes less than a minute.</p>
        </div>
      </div>
      <div className="px-5 -mt-4">
        <div className="bg-card border rounded-3xl p-5 cc-shadow grid gap-4 cc-fade-up">
          {F("Full Name", "name")}
          <div className="grid grid-cols-2 gap-3">
            {F("Age", "age", "number")}
            {F("Gender", "gender", "text", ["Male", "Female", "Other"])}
          </div>
          {F("Email", "email", "email")}
          {F("Mobile Number", "phone")}
          {F("Create Password", "password", "password")}
          {F("Confirm Password", "confirm", "password")}
          {F("Dessie (Designation / Medical Bio)", "dessie")}
          {F("Annual Income", "income", "text", ["< ₹3L", "₹3L – ₹6L", "₹6L – ₹12L", "₹12L – ₹25L", "₹25L+"])}
          <button onClick={submit} className="mt-2 w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 active:scale-[0.98] transition-transform">
            Create account
          </button>
          <button onClick={() => setFlow("login")} className="text-sm text-muted-foreground">
            Already have an account? <span className="text-primary font-semibold">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}