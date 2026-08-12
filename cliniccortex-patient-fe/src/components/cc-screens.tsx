import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar, Clock, Star, MapPin, Video, Phone, Send, Paperclip,
  Heart, Activity, Droplet, Moon, Thermometer, Wind, ChevronRight,
  Pill, Upload, Plus, Minus, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight,
  Sparkles, Search, Mic, ChevronDown, ChevronUp, Sun, MoonStar, Languages,
  Shield, FileText, Pencil, Stethoscope, Home as HomeIcon, MessageSquare,
  Siren, MapPinned, CheckCircle2, XCircle, RotateCcw, Bot,
  MicOff, VideoOff, MessageCircle, PhoneOff, Bell,
  CreditCard, X, ShieldCheck,
} from "lucide-react";
import { useCC, LANGUAGES, type Screen } from "@/lib/cc-state";
import { api } from "@/lib/api";

/* ---------------- Helpers ---------------- */
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Badge({ tone, children }: { tone: "normal" | "lower"; children: React.ReactNode }) {
  const cls =
    tone === "normal"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
      : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{children}</span>;
}

/* ---------------- Home ---------------- */
export function HomeScreen() {
  const { setScreen, t } = useCC();
  const [upcoming, setUpcoming] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);

  useEffect(() => {
    api.get('/appointments?tab=upcoming')
      .then((res) => {
        if (res.success && Array.isArray(res.appointments) && res.appointments.length > 0) {
          setUpcoming(res.appointments[0]);
        } else {
          setUpcoming(null);
        }
      })
      .catch(() => setUpcoming(null));

    api.get('/patients/me/vitals-history')
      .then((res) => {
        if (res.success && Array.isArray(res.vitals) && res.vitals.length > 0) {
          setLatestVitals(res.vitals[0]);
        } else {
          setLatestVitals(null);
        }
      })
      .catch(() => setLatestVitals(null));
  }, []);

  const services = [
    { id: "appointments" as Screen, label: t("appointment"), icon: Calendar, color: "from-blue-500 to-indigo-600" },
    { id: "vitals" as Screen, label: t("vitals"), icon: Heart, color: "from-rose-500 to-pink-600" },
    { id: "glucose" as Screen, label: t("glucose"), icon: Droplet, color: "from-cyan-500 to-sky-600" },
    { id: "pharmacy" as Screen, label: t("pharmacy"), icon: Pill, color: "from-emerald-500 to-teal-600" },
    { id: "ai-analyzer" as Screen, label: t("ai_analyzer"), icon: Sparkles, color: "from-violet-500 to-fuchsia-600" },
    { id: "lab-reports" as Screen, label: t("lab_reports"), icon: FileText, color: "from-amber-500 to-orange-600" },
  ];
  return (
    <div>
      <div className="px-5 pt-4">
        <div className="cc-grad rounded-3xl p-5 text-white relative overflow-hidden cc-shadow">
          <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative">
            <p className="text-[10px] tracking-[0.3em] font-bold text-white/90">{t("priority")}</p>
            <h2 className="text-xl font-bold mt-2 leading-snug whitespace-pre-line">{t("schedule_checkup")}</h2>
            <button onClick={() => setScreen("appointments")} className="mt-4 inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-2xl px-4 py-2 text-sm active:scale-95 transition-transform">
              {t("book_now")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Section title={t("quick_services")}>
        <div className="grid grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setScreen(s.id)} className="bg-card border rounded-2xl p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-center">{s.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Upcoming Appointment" action={<button onClick={() => setScreen("appointments")} className="text-xs text-primary font-semibold">See all</button>}>
        {upcoming ? (
          <div className="bg-card border rounded-3xl p-4 cc-shadow">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl cc-grad-deep text-white flex items-center justify-center text-lg font-bold">
                {upcoming.doctor_name ? (upcoming.doctor_name.split(" ")[1]?.[0] || upcoming.doctor_name[0]) : 'D'}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{upcoming.doctor_name || 'Dr. Specialist'}</div>
                <div className="text-xs text-muted-foreground">{upcoming.doctor_specialization || upcoming.condition || 'General Consult'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {new Date(upcoming.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit' })}
                </div>
                <div className="text-sm font-semibold text-primary">{upcoming.appointment_time}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold py-2 active:scale-95">Queue</button>
              <button className="rounded-xl border text-xs font-semibold py-2 active:scale-95">Reschedule</button>
              <button className="rounded-xl border text-xs font-semibold py-2 text-red-500 active:scale-95">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-3xl p-6 text-center cc-shadow">
            <p className="text-xs text-muted-foreground">No upcoming appointments scheduled</p>
            <button onClick={() => setScreen("appointments")} className="mt-3 px-4 py-2 rounded-xl cc-grad-deep text-white text-xs font-semibold">
              Book Appointment
            </button>
          </div>
        )}
      </Section>

      <Section title="Health snapshot" action={<button onClick={() => setScreen("vitals")} className="text-xs text-primary font-semibold">All vitals</button>}>
        <div className="grid grid-cols-2 gap-3">
          <MiniVital icon={Heart} label="Heart" value={latestVitals?.rhr != null ? String(latestVitals.rhr) : "Not recorded"} unit={latestVitals?.rhr != null ? "bpm" : ""} tone="lower" />
          <MiniVital icon={Activity} label="HRV" value={latestVitals?.hrv != null ? String(latestVitals.hrv) : "Not recorded"} unit={latestVitals?.hrv != null ? "ms" : ""} tone="normal" />
          <MiniVital icon={Droplet} label="SpO₂" value={latestVitals?.spo2 != null ? String(latestVitals.spo2) : "Not recorded"} unit={latestVitals?.spo2 != null ? "%" : ""} tone="normal" />
          <MiniVital icon={Moon} label="Sleep" value={latestVitals?.sleep != null ? String(latestVitals.sleep) : "Not recorded"} unit="" tone="lower" />
        </div>
      </Section>
    </div>
  );
}

function MiniVital({ icon: Icon, label, value, unit, tone }: { icon: any; label: string; value: string; unit: string; tone: "normal" | "lower" }) {
  return (
    <div className="bg-card border rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <Badge tone={tone}>{tone === "normal" ? "Normal" : "Lower"}</Badge>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold leading-tight">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></div>
    </div>
  );
}

/* ---------------- Appointments ---------------- */
export function AppointmentsScreen() {
  const { setScreen, setSelectedDoctorId } = useCC();
  const [tab, setTab] = useState<"upcoming" | "book" | "missed" | "completed">("upcoming");
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    api.get('/doctors-directory').then((res) => {
      const list = res.doctors || [];
      if (Array.isArray(list)) {
        setTopDoctors(list.map((d: any) => ({
          id: d.id,
          name: `${d.salutation || 'Dr.'} ${d.first_name} ${d.last_name}`.trim(),
          spec: d.pg_specialization || 'General Medicine',
          rating: 4.8,
          exp: `${d.experience_years || 5}+`,
          patients: '3.5K+',
          reviews: '1.2K+',
          langs: d.consult_languages || ["English", "Hindi"],
          fee: d.clinic_fee || 1000
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== "book") {
      api.get(`/appointments?tab=${tab}`)
        .then((res) => {
          if (res.success && Array.isArray(res.appointments)) {
            setAppointments(res.appointments);
          } else {
            setAppointments([]);
          }
        })
        .catch(() => setAppointments([]));
    }
  }, [tab]);

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your consultations</p>
      </div>
      <div className="px-5 mt-4 overflow-x-auto cc-scroll">
        <div className="flex gap-2 min-w-max">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "book", label: "Book New" },
            { id: "missed", label: "Cancelled / Missed" },
            { id: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? "cc-grad-deep text-white cc-shadow" : "bg-muted text-muted-foreground"
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 grid gap-3 cc-fade-up" key={tab}>
        {tab === "upcoming" && (
          appointments.length === 0 ? (
            <div className="bg-card border rounded-3xl p-6 text-center text-sm text-muted-foreground">
              No upcoming appointments
            </div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="bg-card border rounded-3xl p-4 cc-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl cc-grad-deep text-white flex items-center justify-center font-bold text-lg">
                    {a.doctor_name ? (a.doctor_name.split(" ")[1]?.[0] || a.doctor_name[0]) : 'D'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{a.doctor_name || 'Dr. Specialist'}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.doctor_specialization || a.condition || 'General Medicine'} • {new Date(a.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit' })} • {a.appointment_time}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => alert(`Queue position #3 generated for ${a.patient_name || 'you'}.`)} className="rounded-xl cc-grad-deep text-white text-xs font-semibold py-2">Generate Queue</button>
                  <button onClick={() => { setSelectedDoctorId(a.doctor_id); setScreen("booking"); }} className="rounded-xl border text-xs font-semibold py-2"><RotateCcw className="w-3 h-3 inline mr-1" />Reschedule</button>
                  <button
                    onClick={async () => {
                      if (!confirm("Are you sure you want to cancel this appointment?")) return;
                      try {
                        await api.patch(`/appointments/${a.id}/status`, { status: "Cancelled" });
                        alert("Appointment cancelled successfully.");
                        setAppointments(prev => prev.filter(item => item.id !== a.id));
                      } catch (err: any) {
                        alert(err.message || "Failed to cancel appointment");
                      }
                    }}
                    className="rounded-xl border text-xs font-semibold py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <XCircle className="w-3 h-3 inline mr-1" />Cancel
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {tab === "book" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "clinic", label: "In-Clinic", icon: Stethoscope, color: "from-blue-500 to-indigo-600" },
                { id: "tele", label: "Tele-Consult", icon: Video, color: "from-emerald-500 to-teal-600" },
                { id: "home", label: "Home Care", icon: HomeIcon, color: "from-amber-500 to-orange-600" },
              ].map((c) => {
                const I = c.icon;
                return (
                  <button key={c.id} className="bg-card border rounded-3xl p-4 flex flex-col items-center gap-2 active:scale-95">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}>
                      <I className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold">{c.label}</span>
                  </button>
                );
              })}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-3">Top doctors</h3>
            {topDoctors.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedDoctorId(d.id); setScreen("doctor-detail"); }}
                className="bg-card border rounded-3xl p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl cc-grad-deep text-white flex items-center justify-center font-bold text-lg">
                    {d.name.split(" ")[1] ? d.name.split(" ")[1][0] : 'D'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.spec}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{d.rating}</span>
                      <span className="text-xs text-muted-foreground">· {d.patients} patients</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </>
        )}

        {tab === "missed" && (
          appointments.length === 0 ? (
            <div className="bg-card border rounded-3xl p-6 text-center text-sm text-muted-foreground">
              No cancelled or missed appointments
            </div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="bg-card border rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-500 flex items-center justify-center"><XCircle className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="font-semibold">{a.doctor_name || 'Dr. Specialist'}</div>
                    <div className="text-xs text-muted-foreground">{a.doctor_specialization || 'Consultation'} · {new Date(a.appointment_date).toLocaleDateString()} · {a.status}</div>
                  </div>
                  <button onClick={() => { setSelectedDoctorId(a.doctor_id); setScreen("booking"); }} className="px-3 py-2 rounded-xl cc-grad-deep text-white text-xs font-semibold">Rebook</button>
                </div>
              </div>
            ))
          )
        )}

        {tab === "completed" && (
          appointments.length === 0 ? (
            <div className="bg-card border rounded-3xl p-6 text-center text-sm text-muted-foreground">
              No completed appointments
            </div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="bg-card border rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="font-semibold">{a.doctor_name || 'Dr. Specialist'}</div>
                    <div className="text-xs text-muted-foreground">{a.doctor_specialization || 'Consultation'} · {new Date(a.appointment_date).toLocaleDateString()} · Completed</div>
                  </div>
                  <button className="px-3 py-2 rounded-xl border text-xs font-semibold">View</button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export function DoctorDetail() {
  const { selectedDoctorId, setScreen } = useCC();
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await api.get('/doctors-directory');
        if (res.success && Array.isArray(res.doctors) && res.doctors.length > 0) {
          const mapped = res.doctors.map((d: any) => ({
            id: d.id,
            name: `${d.salutation || 'Dr.'} ${d.first_name} ${d.last_name}`.trim(),
            spec: d.pg_specialization || 'General Medicine',
            rating: 4.8,
            exp: `${d.experience_years || 5}+`,
            patients: '3.5K+',
            reviews: '1.2K+',
            langs: d.consult_languages || ["English", "Hindi"],
            fee: d.clinic_fee || 1000
          }));
          setDoctorsList(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch doctors directory", err);
      }
    }
    loadDoctors();
  }, []);

  const d = doctorsList.find((x) => x.id === selectedDoctorId) ?? doctorsList[0] ?? {
    name: "Doctor Specialist", spec: "General Medicine", rating: 4.8, exp: "5+", patients: "1K+", reviews: "500+", langs: ["English"], fee: 1000
  };
  return (
    <div>
      <div className="cc-grad-deep px-5 pt-6 pb-10 rounded-b-[2.5rem] text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl font-bold">{d.name.split(" ")[1] ? d.name.split(" ")[1][0] : 'D'}</div>
          <div>
            <div className="text-xl font-bold">{d.name}</div>
            <div className="text-cyan-100 text-sm">{d.spec}</div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> <span className="text-sm font-semibold">{d.rating}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 -mt-6">
        <div className="bg-card border rounded-3xl p-4 grid grid-cols-3 gap-2 cc-shadow">
          {[
            { v: d.exp, l: "Years Exp" },
            { v: d.patients, l: "Patients" },
            { v: d.reviews, l: "Reviews" },
          ].map((m) => (
            <div key={m.l} className="text-center">
              <div className="font-bold">{m.v}</div>
              <div className="text-[10px] text-muted-foreground">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
      <Section title="Languages">
        <div className="flex flex-wrap gap-2">
          {d.langs.map((l: string) => <span key={l} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{l}</span>)}
        </div>
      </Section>
      <Section title="Consultation fee">
        {[
          { l: "Clinic Appointment", v: `₹${d.fee || 1000}` },
          { l: "Tele-appointment", v: `₹${d.fee || 800}` },
          { l: "Home-appointment", v: `₹${(d.fee || 1000) + 500}` },
        ].map((f) => (
          <div key={f.l} className="bg-card border rounded-2xl p-3 flex items-center justify-between mb-2">
            <span className="text-sm">{f.l}</span>
            <span className="font-bold text-primary">{f.v}</span>
          </div>
        ))}
      </Section>
      <div className="px-5 mt-6">
        <button onClick={() => setScreen("booking")} className="w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 active:scale-[0.98]">
          Book appointment
        </button>
      </div>
    </div>
  );
}

export function BookingScreen() {
  const { selectedDoctorId, setSelectedDoctorId, setScreen, user } = useCC();

  // Helper to format Date -> YYYY-MM-DD
  const formatIsoDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Auto-fetch Today's real date on mount
  const [selectedDate, setSelectedDate] = useState(() => formatIsoDate(new Date()));
  const [slot, setSlot] = useState("10:30 AM");
  const [visitType, setVisitType] = useState<"Clinic" | "Video" | "Home">("Clinic");
  const [patientName, setPatientName] = useState(user?.name || "Akku K");
  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "28");
  const [condition, setCondition] = useState("General Consult");
  const [notes, setNotes] = useState("");
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState(selectedDoctorId || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await api.get('/doctors-directory');
        if (res.success && Array.isArray(res.doctors) && res.doctors.length > 0) {
          setDoctorsList(res.doctors);
          if (!doctorId) {
            setDoctorId(res.doctors[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch doctors directory for booking", err);
      }
    }
    loadDoctors();
  }, []);

  const generateUpcomingDays = (startDateStr: string) => {
    const daysArr = [];
    const baseDate = new Date((startDateStr || formatIsoDate(new Date())) + 'T00:00:00');
    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoString = `${yyyy}-${mm}-${dd}`;
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = String(d.getDate()).padStart(2, '0');
      daysArr.push({ isoString, weekday, monthName, dayNum });
    }
    return daysArr;
  };

  const slots = {
    Morning: ["08:00 AM", "09:00 AM", "10:30 AM", "11:00 AM"],
    Afternoon: ["12:00 PM", "01:30 PM", "02:00 PM"],
    Evening: ["05:00 PM", "06:30 PM", "07:00 PM"],
  };

  const selectedDoc = doctorsList.find((d: any) => d.id === doctorId) || doctorsList[0];
  const fee = visitType === "Video" ? 800 : visitType === "Home" ? 1500 : (selectedDoc?.clinic_fee || 1000);

  const handleConfirmBooking = async () => {
    if (!patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    setLoading(true);
    try {
      const targetDoctorId = doctorId || (selectedDoc ? selectedDoc.id : (selectedDoctorId || "8ee16766-3d23-4c91-91a5-e1ab8529f8f2"));

      const res = await api.post('/appointments', {
        doctorId: targetDoctorId,
        patientName: patientName.trim(),
        patientAge: age ? parseInt(age, 10) : undefined,
        visitType: visitType,
        date: selectedDate,
        time: slot,
        condition: condition.trim() || "General Consult",
        notes: notes.trim() ? `${notes.trim()}${phone ? ' (Phone: ' + phone + ')' : ''}` : (phone ? `Phone: ${phone}` : "Booked via Patient Portal")
      });

      if (res.success) {
        alert("Appointment booked successfully! Your details have been sent to the Doctor Panel.");
        setScreen("appointments");
      } else {
        alert(res.message || "Failed to book appointment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8 max-w-xl mx-auto">
      <div className="px-5 pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Book Appointment</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Customize your booking details below</p>
        </div>
        <button onClick={() => setScreen("appointments")} className="px-3 py-1.5 rounded-xl border text-xs font-semibold">Cancel</button>
      </div>

      {/* Visit Type Selector */}
      <Section title="Select Consultation Mode">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "Clinic", label: "In-Clinic", icon: Stethoscope, color: "from-blue-500 to-indigo-600", desc: "Physical Visit" },
            { id: "Video", label: "Tele-Consult", icon: Video, color: "from-emerald-500 to-teal-600", desc: "Online Call" },
            { id: "Home", label: "Home Care", icon: HomeIcon, color: "from-amber-500 to-orange-600", desc: "Doctor at Home" },
          ].map((typeItem) => {
            const IconComp = typeItem.icon;
            const isSelected = visitType === typeItem.id;
            return (
              <button
                key={typeItem.id}
                type="button"
                onClick={() => setVisitType(typeItem.id as any)}
                className={`border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all ${
                  isSelected ? "bg-primary/10 border-primary ring-2 ring-primary/20 scale-[1.02]" : "bg-card hover:bg-muted/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeItem.color} text-white flex items-center justify-center`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">{typeItem.label}</span>
                <span className="text-[9px] text-muted-foreground">{typeItem.desc}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Select Doctor */}
      <Section title="Select Doctor">
        <select
          value={doctorId}
          onChange={(e) => {
            setDoctorId(e.target.value);
            setSelectedDoctorId(e.target.value);
          }}
          className="w-full p-3 rounded-2xl bg-card border text-sm font-semibold outline-none"
        >
          {doctorsList.length > 0 ? (
            doctorsList.map((doc: any) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.first_name} {doc.last_name} ({doc.pg_specialization || 'General Specialist'})
              </option>
            ))
          ) : (
            <option value="">Dr. Specialist (General Medicine)</option>
          )}
        </select>
      </Section>

      {/* Editable Patient Info */}
      <Section title="Patient Details (Editable)">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Patient Full Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient full name..."
              className="w-full p-3 rounded-2xl bg-card border text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="w-full p-3 rounded-2xl bg-card border text-sm font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full p-3 rounded-2xl bg-card border text-sm font-semibold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Condition / Reason for Visit</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Fever & Cough, Hypertension Checkup"
              className="w-full p-3 rounded-2xl bg-card border text-sm font-semibold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Consultation Notes for Doctor</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional notes or symptoms for the doctor..."
              className="w-full p-3 rounded-2xl bg-card border text-sm outline-none h-20 resize-none"
            />
          </div>
        </div>
      </Section>

      {/* Dynamic Date Picker & Selector */}
      <Section title="Choose Appointment Date">
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-card border p-3 rounded-2xl">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Selected Date</div>
              <div className="text-sm font-bold text-primary">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Pick Month/Date:</span>
              <input
                type="date"
                value={selectedDate}
                min={formatIsoDate(new Date())}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 rounded-xl bg-background border text-xs font-bold outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto cc-scroll pb-2">
            {generateUpcomingDays(selectedDate).map((dObj) => {
              const active = dObj.isoString === selectedDate;
              return (
                <button
                  key={dObj.isoString}
                  type="button"
                  onClick={() => setSelectedDate(dObj.isoString)}
                  className={`min-w-[62px] py-3 rounded-2xl flex flex-col items-center transition-all ${
                    active ? "cc-grad-deep text-white cc-shadow scale-105" : "bg-card border hover:bg-muted/30"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold">{dObj.weekday}</span>
                  <span className="text-lg font-bold">{dObj.dayNum}</span>
                  <span className="text-[9px] opacity-80">{dObj.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Time Slot Selector */}
      {Object.entries(slots).map(([k, vals]) => (
        <Section key={k} title={k}>
          <div className="flex flex-wrap gap-2">
            {vals.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                  slot === s ? "cc-grad-deep text-white cc-shadow" : "bg-card border text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      ))}

      {/* Confirm Booking Button */}
      <div className="px-5 mt-8">
        <button
          type="button"
          onClick={handleConfirmBooking}
          disabled={loading}
          className="w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 flex justify-center items-center active:scale-[0.98] transition-transform"
        >
          {loading ? <span className="animate-pulse">Booking & Syncing to Doctor Panel…</span> : `Confirm booking · ₹${fee}`}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Chat ---------------- */
export function ChatScreen() {
  const { setScreen, selectedDoctorId } = useCC();
  const [activeDoctor, setActiveDoctor] = useState<any>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ me: boolean; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Doctor and find-or-create message thread
  useEffect(() => {
    async function initChat() {
      try {
        const dirRes = await api.get('/doctors-directory');
        const list = dirRes.doctors || [];
        if (Array.isArray(list) && list.length > 0) {
          const doc = list.find((d: any) => d.id === selectedDoctorId) || list[0];
          setActiveDoctor(doc);

          const threadRes = await api.post('/messages/threads', { doctorId: doc.id });
          if (threadRes.success && threadRes.thread) {
            setThreadId(threadRes.thread.id);
          }
        }
      } catch (err) {
        console.warn("Init chat error", err);
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, [selectedDoctorId]);

  // 2. Poll message thread every 4s
  useEffect(() => {
    if (!threadId) return;

    async function loadMessages() {
      try {
        const res = await api.get(`/messages/threads/${threadId}`);
        if (res.success && Array.isArray(res.messages)) {
          const mapped = res.messages.map((m: any) => ({
            me: m.sender_type === 'patient',
            text: m.content
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.warn("Fetch messages error", err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [threadId]);

  const send = async () => {
    if (!input.trim() || !threadId) return;
    const textToSend = input.trim();
    setInput("");
    
    setMessages((m) => [...m, { me: true, text: textToSend }]);

    try {
      await api.post(`/messages/threads/${threadId}`, {
        content: textToSend,
        senderType: 'patient'
      });
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  const docName = activeDoctor ? `${activeDoctor.salutation || 'Dr.'} ${activeDoctor.first_name} ${activeDoctor.last_name}`.trim() : "Doctor Consultation";
  const docInitial = activeDoctor ? (activeDoctor.last_name?.[0] || activeDoctor.first_name?.[0] || "D") : "D";

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="border-b px-4 py-3 flex items-center gap-3 bg-card">
        <button onClick={() => setScreen("home")} className="text-muted-foreground text-sm">←</button>
        <div className="w-10 h-10 rounded-2xl cc-grad-deep text-white flex items-center justify-center font-bold">{docInitial}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{docName}</div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Online</div>
        </div>
        <button className="p-2 rounded-xl hover:bg-muted"><Phone className="w-5 h-5 text-primary" /></button>
        <button className="p-2 rounded-xl hover:bg-muted"><Video className="w-5 h-5 text-primary" /></button>
      </div>
      <div className="flex-1 overflow-auto cc-scroll p-4 space-y-2">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium">
            Start a consultation with {docName}.
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"} cc-fade-up`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                m.me ? "cc-grad-deep text-white rounded-br-md" : "bg-card border rounded-bl-md"
              }`}>{m.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="border-t p-3 flex items-center gap-2 bg-card">
        <button className="p-2 rounded-xl hover:bg-muted"><Paperclip className="w-5 h-5" /></button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-2xl border bg-background px-4 py-2.5 outline-none focus:border-primary"
        />
        <button onClick={send} className="p-2.5 rounded-2xl cc-grad-deep text-white"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ---------------- Glucose ---------------- */
export function GlucoseScreen() {
  const [glucose, setGlucose] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGlucose() {
      try {
        const res = await api.get('/patients/me/vitals-history');
        if (res.success && Array.isArray(res.vitals) && res.vitals.length > 0) {
          const val = res.vitals[0].blood_glucose;
          if (val !== null && val !== undefined && val !== "") {
            const parsed = typeof val === 'number' ? val : parseFloat(val);
            setGlucose(!isNaN(parsed) ? parsed : null);
          } else {
            setGlucose(null);
          }
        } else {
          setGlucose(null);
        }
      } catch (err) {
        console.warn("Fetch glucose error", err);
        setGlucose(null);
      } finally {
        setLoading(false);
      }
    }
    loadGlucose();
  }, []);

  const arc = glucose !== null ? (glucose / 200) * 100 : 0;

  return (
    <div className="pb-8">
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Blood Glucose</h1>
        <p className="text-sm text-muted-foreground">Historical biometric monitor</p>
      </div>
      <div className="px-5 mt-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : glucose !== null ? (
          <div className="bg-card border rounded-3xl p-6 cc-shadow flex flex-col items-center">
            <RadialArc value={arc} />
            <div className="-mt-24 text-center">
              <div className="text-4xl font-bold text-primary">{glucose}</div>
              <div className="text-xs text-muted-foreground">mmol/L</div>
              <Badge tone="normal">Normal</Badge>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-3xl p-8 text-center text-sm font-medium text-muted-foreground">
            No blood glucose records on file yet.
          </div>
        )}
      </div>
    </div>
  );
}

function RadialArc({ value }: { value: number }) {
  const r = 80;
  const c = Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="220" height="140" viewBox="0 0 200 130">
      <path d={`M 20 110 A 80 80 0 0 1 180 110`} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round" className="opacity-30" />
      <path
        d={`M 20 110 A 80 80 0 0 1 180 110`}
        fill="none"
        stroke="url(#gradArc)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <defs>
        <linearGradient id="gradArc" x1="0" x2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#1A41CD" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------------- Vitals ---------------- */
export function VitalsScreen() {
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVitals() {
      try {
        const res = await api.get('/patients/me/vitals-history');
        if (res.success && Array.isArray(res.vitals) && res.vitals.length > 0) {
          setLatestVitals(res.vitals[0]);
        }
      } catch (err) {
        console.warn("Fetch vitals error", err);
      } finally {
        setLoading(false);
      }
    }
    loadVitals();
  }, []);

  const vitalsList = [
    { icon: Heart, label: "Resting Heart Rate", rawVal: latestVitals?.rhr, u: "bpm", tone: "lower" as const, fill: 30 },
    { icon: Activity, label: "Heart Rate Variability", rawVal: latestVitals?.hrv, u: "ms", tone: "normal" as const, fill: 70 },
    { icon: Droplet, label: "Blood Oxygen (SpO₂)", rawVal: latestVitals?.spo2, u: "%", tone: "normal" as const, fill: 85 },
    { icon: Thermometer, label: "Temperature", rawVal: latestVitals?.temp, u: "°C", tone: "normal" as const, fill: 55 },
    { icon: Moon, label: "Sleep Monitor", rawVal: latestVitals?.sleep, u: "", tone: "lower" as const, fill: 35 },
  ];

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Vitals Dashboard</h1>
        <p className="text-sm text-muted-foreground">Recorded biometric history</p>
      </div>
      <div className="px-5 mt-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {vitalsList.map((vi) => {
              const I = vi.icon;
              const isRecorded = vi.rawVal !== null && vi.rawVal !== undefined && vi.rawVal !== "";
              const displayVal = isRecorded ? String(vi.rawVal) : "Not recorded";
              return (
                <div key={vi.label} className="bg-card border rounded-3xl p-4 cc-shadow">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><I className="w-5 h-5" /></div>
                    <Badge tone={isRecorded ? vi.tone : "normal"}>{isRecorded ? (vi.tone === "normal" ? "Normal" : "Lower") : "N/A"}</Badge>
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <div className="flex-1">
                      <div className="text-[10px] text-muted-foreground leading-none">{vi.label}</div>
                      <div className={`text-xl font-bold mt-1 leading-none ${!isRecorded ? "text-xs text-muted-foreground italic font-normal" : ""}`}>
                        {displayVal} {isRecorded && <span className="text-xs font-normal text-muted-foreground">{vi.u}</span>}
                      </div>
                    </div>
                    {isRecorded && (
                      <div className="w-2.5 h-16 rounded-full bg-muted relative overflow-hidden">
                        <div className={`absolute bottom-0 inset-x-0 rounded-full transition-all ${vi.tone === "normal" ? "bg-emerald-500" : "bg-red-500"}`} style={{ height: `${vi.fill}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Search ---------------- */
export function SearchScreen() {
  const { setSelectedDoctorId, setScreen } = useCC();
  const [q, setQ] = useState("");
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await api.get('/doctors-directory');
        if (res.success && Array.isArray(res.doctors)) {
          const mapped = res.doctors.map((d: any) => ({
            id: d.id,
            name: `${d.salutation || 'Dr.'} ${d.first_name} ${d.last_name}`.trim(),
            spec: d.pg_specialization || 'General Medicine',
            rating: 4.8,
            exp: `${d.experience_years || 5}+`,
            patients: '3.5K+',
            reviews: '1.2K+',
            langs: d.consult_languages || ["English", "Hindi"],
            fee: d.clinic_fee || 1000
          }));
          setDoctorsList(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch doctors directory", err);
      }
    }
    loadDoctors();
  }, []);

  return (
    <div>
      <div className="px-5 pt-4">
        <div className="bg-card border rounded-2xl flex items-center gap-2 px-3 py-2.5">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors, medicines, labs…" className="flex-1 bg-transparent outline-none text-sm" />
          <button className="p-1 rounded-lg hover:bg-muted"><Mic className="w-4 h-4 text-primary" /></button>
        </div>
      </div>
      <Section title="Trending">
        <div className="flex flex-wrap gap-2">
          {["Cardiologist", "Diabetes", "Vitamin D", "Skin care", "Paediatric"].map((t) => (
            <button key={t} onClick={() => setQ(t)} className="px-3 py-1.5 rounded-full bg-card border text-xs font-medium hover:border-primary/40">{t}</button>
          ))}
        </div>
      </Section>
      <Section title="Results">
        {doctorsList.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.spec.toLowerCase().includes(q.toLowerCase())).map((d) => (
          <button
            key={d.id}
            onClick={() => { setSelectedDoctorId(d.id); setScreen("doctor-detail"); }}
            className="w-full bg-card border rounded-3xl p-4 mb-3 flex items-center gap-3 text-left hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl cc-grad-deep text-white flex items-center justify-center font-bold">
              {d.name.split(" ")[1] ? d.name.split(" ")[1][0] : 'D'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.spec}</div>
            </div>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold">{d.rating}</span>
          </button>
        ))}
      </Section>
    </div>
  );
}

/* ---------------- Pharmacy ---------------- */
export function PharmacyScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get('/pharmacy/products');
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn("Failed to load pharmacy products", err);
      }
    }
    loadProducts();
  }, []);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: string) => setCart((c) => {
    const n = (c[id] ?? 0) - 1;
    const cp = { ...c };
    if (n <= 0) delete cp[id]; else cp[id] = n;
    return cp;
  });

  const total = useMemo(() => Object.entries(cart).reduce((s, [id, qty]) => {
    const item = products.find((m) => m.id === id);
    return s + (item ? parseFloat(item.price) : 0) * qty;
  }, 0), [cart, products]);

  const handleCheckout = async () => {
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) return;
    setLoading(true);
    try {
      await api.post('/pharmacy/orders', {
        items,
        deliveryAddress: "123 Main Street, New Delhi",
        prescriptionUrl: "https://cliniccortex.app/prescriptions/sample.pdf"
      });
      alert("Pharmacy order placed successfully!");
      setCart({});
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Pharmacy Store</h1>
        <p className="text-sm text-muted-foreground">Medicines delivered to your door</p>
      </div>
      <Section title="Categories">
        <div className="flex gap-2 overflow-x-auto cc-scroll pb-1">
          {["All", "Prescription", "Over-the-counter", "Vitamins", "Wellness"].map((c, i) => (
            <button key={c} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${i === 0 ? "cc-grad-deep text-white" : "bg-muted"}`}>{c}</button>
          ))}
        </div>
      </Section>
      <Section title="Upload prescription" action={<Upload className="w-4 h-4 text-primary" />}>
        <button className="w-full bg-card border-2 border-dashed rounded-3xl p-5 flex items-center gap-3 hover:border-primary/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Upload className="w-5 h-5" /></div>
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Upload Prescription</div>
            <div className="text-xs text-muted-foreground">PDF or photo, we'll handle the rest</div>
          </div>
        </button>
      </Section>
      <Section title="Featured medicines">
        <div className="grid gap-3">
          {products.map((m) => (
            <div key={m.id} className="bg-card border rounded-3xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center"><Pill className="w-6 h-6" /></div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.category || 'Medicine'} • {m.requires_rx ? 'Rx Required' : 'OTC'}</div>
                <div className="text-sm font-bold text-primary mt-1">₹{m.price}</div>
              </div>
              {cart[m.id] ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => sub(m.id)} className="w-7 h-7 rounded-full border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-semibold w-4 text-center">{cart[m.id]}</span>
                  <button onClick={() => add(m.id)} className="w-7 h-7 rounded-full cc-grad-deep text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => add(m.id)} className="px-3 py-2 rounded-xl cc-grad-deep text-white text-xs font-semibold"><Plus className="w-3 h-3 inline mr-1" />Add</button>
              )}
            </div>
          ))}
        </div>
      </Section>
      {total > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 max-w-[440px] w-[92%] cc-grad-deep text-white rounded-2xl px-5 py-3 flex items-center justify-between cc-shadow cc-pop">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-cyan-100">Cart total</div>
            <div className="text-lg font-bold">₹{total.toFixed(2)}</div>
          </div>
          <button onClick={handleCheckout} disabled={loading} className="bg-white text-primary px-4 py-2 rounded-xl font-semibold text-sm">
            {loading ? 'Processing…' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Wallet ---------------- */
export function WalletScreen() {
  const [wallet, setWallet] = useState<any>({ balance: 0.00, subscription_status: 'Free' });
  const [plans, setPlans] = useState<any[]>([]);
  const { setScreen } = useCC();

  const fetchWallet = async () => {
    try {
      const res = await api.get('/payments/wallet');
      if (res.success && res.wallet) setWallet(res.wallet);

      const plansRes = await api.get('/wallet/plans');
      if (plansRes.success && Array.isArray(plansRes.plans)) setPlans(plansRes.plans);
    } catch (err) {
      console.warn("Error fetching wallet details", err);
    }
  };

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState("500");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRazorpayRecharge = async () => {
    const numericAmt = parseFloat(rechargeAmt);
    if (!numericAmt || numericAmt < 10) {
      alert("Please enter a valid amount (minimum ₹10).");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Request Payment Order from Express Backend
      const orderRes = await api.post('/payments/create-order', { amount: numericAmt });
      if (!orderRes.success || !orderRes.order) {
        alert("Failed to initiate payment order.");
        setIsProcessing(false);
        return;
      }

      // 2. If live Razorpay Key exists, launch Razorpay Checkout Modal
      if (typeof window !== 'undefined' && (window as any).Razorpay && orderRes.keyId && orderRes.keyId !== 'rzp_test_demo_key') {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.order.amount,
          currency: orderRes.order.currency || 'INR',
          name: 'ClinicCortex Health',
          description: 'Digital Wallet Recharge',
          order_id: orderRes.order.id,
          handler: async function (response: any) {
            const verifyRes = await api.post('/payments/verify-recharge', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: numericAmt
            });

            if (verifyRes.success) {
              alert(verifyRes.message || "Wallet recharged successfully!");
              setShowRechargeModal(false);
              fetchWallet();
            } else {
              alert(verifyRes.message || "Payment verification failed.");
            }
          },
          theme: { color: '#163CC7' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct Verification Mode (Instant Test Top-Up)
        const verifyRes = await api.post('/payments/verify-recharge', {
          razorpay_order_id: orderRes.order.id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          amount: numericAmt,
          isTestMode: true
        });

        if (verifyRes.success) {
          alert(verifyRes.message || `Successfully credited ₹${numericAmt} to your wallet!`);
          setShowRechargeModal(false);
          fetchWallet();
        } else {
          alert(verifyRes.message || "Failed to process wallet top-up.");
        }
      }
    } catch (err: any) {
      alert(err.message || "Payment processing error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const res = await api.post('/wallet/subscribe', { planId });
      if (res.success) {
        alert(res.message);
        fetchWallet();
      }
    } catch (err: any) {
      alert(err.message || "Subscription failed");
    }
  };

  return (
    <div>
      <div className="px-5 pt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Digital Wallet</h1>
        <button
          onClick={() => setScreen("transactions")}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>View Ledger</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-5 mt-5">
        <div className="cc-grad-deep rounded-3xl p-6 text-white relative overflow-hidden cc-shadow">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">Available Balance</div>
            <div className="text-3xl font-bold mt-2">₹ {parseFloat(wallet.balance || 0).toFixed(2)}</div>
            <div className="text-xs text-cyan-100 mt-1">Status: {wallet.subscription_status || 'Free Member'}</div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-cyan-50 transition-all active:scale-95 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Add Money / Recharge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal Portal */}
      {showRechargeModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-6 my-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">Recharge Wallet Balance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Add funds to your digital healthcare wallet</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors -mr-1 -mt-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2.5 text-left">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Preset Amount
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["500", "1000", "2000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRechargeAmt(preset)}
                    className={`py-3.5 rounded-2xl text-xs font-bold border transition-all ${
                      rechargeAmt === preset
                        ? "bg-[#163CC7] text-white border-[#163CC7] shadow-lg shadow-blue-500/20 scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    + ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Or Enter Custom Amount (₹)
              </label>
              <input
                type="number"
                value={rechargeAmt}
                onChange={(e) => setRechargeAmt(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-center text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#163CC7]/30 focus:border-[#163CC7] transition-all"
              />
            </div>

            {/* Security Badge */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-[#163CC7] dark:text-blue-400 font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Secured by Razorpay • UPI, GPay, Cards & NetBanking</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRazorpayRecharge}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-[#163CC7] hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isProcessing ? "Initiating..." : `Pay ₹${rechargeAmt || 0}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Section title="Subscription Plans">
        <div className="grid grid-cols-2 gap-3">
          {plans.map((p) => (
            <div key={p.id} className="bg-card border rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm font-semibold text-primary mt-1">₹{p.price}/{p.period || 'Mo'}</div>
              </div>
              <button onClick={() => handleSubscribe(p.id)} className="mt-3 w-full cc-grad-deep text-white text-xs font-semibold py-2 rounded-xl">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------------- Transactions ---------------- */
export function TransactionsScreen() {
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
    async function loadTx() {
      try {
        const res = await api.get('/wallet/transactions');
        if (res.success && Array.isArray(res.transactions)) {
          setTx(res.transactions);
        }
      } catch (err) {
        console.warn("Failed to load transactions", err);
      }
    }
    loadTx();
  }, []);

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">CC Transactions</h1>
      </div>
      <div className="px-5 mt-5 grid gap-2">
        {tx.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">No transactions yet</div>
        ) : (
          tx.map((t) => {
            const isPos = parseFloat(t.amount) > 0 && t.type === 'Top-up';
            return (
              <div key={t.id} className="bg-card border rounded-2xl p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPos ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" : "bg-red-100 dark:bg-red-950/40 text-red-500"}`}>
                  {isPos ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t.description || t.type}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <div className={`text-sm font-bold ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                  {isPos ? "+" : "-"}₹{parseFloat(t.amount).toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------- AI Analyzer ---------------- */
export function AIAnalyzerScreen() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function runAnalysis() {
      try {
        const res = await api.post('/ai-analyzer/analyze', {
          vitals: {
            blood_glucose: 110,
            spo2: 98,
            rhr: 65,
            hrv: 75,
            temp: 98.4,
            sleep: 7.5
          }
        });
        if (res.success && res.result) {
          setResult(res.result);
        }
      } catch (err) {
        console.warn("AI Analysis error", err);
      }
    }
    runAnalysis();
  }, []);

  const findings = result?.findings ? (typeof result.findings === 'string' ? JSON.parse(result.findings) : result.findings) : [];

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">AI Analyzer</h1>
        <p className="text-sm text-muted-foreground">Smart insights from your health records</p>
      </div>
      <div className="px-5 mt-5">
        <div className="cc-grad rounded-3xl p-5 text-white flex items-center gap-4 cc-shadow">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"><Bot className="w-7 h-7" /></div>
          <div className="flex-1">
            <div className="font-bold">Risk Status</div>
            <div className="text-2xl font-bold">{result?.overall_level || "Optimal"}</div>
          </div>
          <div className="text-3xl font-bold">94</div>
        </div>
      </div>
      <Section title="Vitals Evaluation Summary">
        <div className="bg-card border rounded-2xl p-4 mb-3 text-xs text-muted-foreground leading-relaxed">
          {result?.summary || "Vitals within normal range."}
        </div>
      </Section>
      <Section title="Detailed Findings">
        {findings.map((x: any, i: number) => (
          <div key={i} className="bg-card border rounded-2xl p-4 mb-2">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm">{x.vital}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${x.status === 'Normal' || x.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {x.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{x.message}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ---------------- Settings ---------------- */
export function SettingsScreen() {
  const { dark, setDark, lang, setLang, setScreen, t } = useCC();
  const [openLang, setOpenLang] = useState(false);
  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
      </div>
      <Section title={t("account")}>
        <button onClick={() => setScreen("profile")} className="w-full bg-card border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Shield className="w-5 h-5" /></div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">{t("profile")}</div>
            <div className="text-xs text-muted-foreground">{t("update_details")}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Section>
      <Section title={t("preferences")}>
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{dark ? <MoonStar className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{dark ? t("dark_mode") : t("light_mode")}</div>
            <div className="text-xs text-muted-foreground">{t("toggle_theme")}</div>
          </div>
          <button onClick={() => setDark(!dark)} className={`relative w-12 h-7 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${dark ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <button onClick={() => setOpenLang(!openLang)} className="mt-2 w-full bg-card border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Languages className="w-5 h-5" /></div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">{t("language")}</div>
            <div className="text-xs text-muted-foreground">{LANGUAGES.find((l) => l.code === lang)?.native}</div>
          </div>
          {openLang ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openLang && (
          <div className="mt-2 bg-card border rounded-2xl p-2 grid grid-cols-3 gap-2 cc-fade-up">
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`p-2 rounded-xl text-xs ${lang === l.code ? "cc-grad-deep text-white" : "hover:bg-muted"}`}>
                {l.native}
              </button>
            ))}
          </div>
        )}
      </Section>
      <Section title={t("more")}>
        {[
          { l: t("about_us"), s: "about" as Screen },
          { l: t("feedback"), s: "feedback" as Screen },
          { l: t("privacy_policy"), s: "about" as Screen },
        ].map((m) => (
          <button key={m.l} onClick={() => setScreen(m.s)} className="w-full bg-card border rounded-2xl p-4 flex items-center gap-3 mb-2">
            <div className="flex-1 text-left text-sm font-medium">{m.l}</div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </Section>
    </div>
  );
}

/* ---------------- Profile ---------------- */
export function ProfileScreen() {
  const { user, setUser } = useCC();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [address, setAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAge(user.age ? String(user.age) : "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put("/patient-auth/me", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age) : null,
        address: address.trim()
      });

      if (res.success && res.patient) {
        setUser(res.patient);
        setMsg({ text: "Profile details updated successfully!", type: "success" });
        setIsEditing(false);
      } else {
        setMsg({ text: res.message || "Failed to update profile", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Server error updating profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="cc-grad-deep px-5 pt-6 pb-12 rounded-b-[2.5rem] text-white relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold shadow-inner">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center cc-shadow hover:scale-110 active:scale-95 transition-all"
              title="Edit Profile"
            >
              <Pencil className="w-4 h-4 text-[#163CC7]" />
            </button>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">{user?.name || "Guest"}</div>
            <div className="text-cyan-100 text-sm">{user?.email || "Not provided"}</div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold transition-all border border-white/20"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6">
        {msg && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold mb-4 shadow-sm ${
            msg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}>
            {msg.text}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="bg-card border rounded-3xl p-5 cc-shadow space-y-4">
            <h3 className="text-sm font-bold text-foreground mb-1">Edit Profile Details</h3>
            
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 32"
                className="w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground">Residence / Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter city / address"
                className="w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl border text-xs font-bold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl cc-grad-deep text-white text-xs font-bold shadow-lg disabled:opacity-50 hover:opacity-95 transition-all"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-card border rounded-3xl p-5 cc-shadow grid gap-3.5">
            {[
              { l: "Age", v: user?.age ? `${user.age} Years` : "Not provided" },
              { l: "Email", v: user?.email || "Not provided" },
              { l: "Phone number", v: user?.phone || "Not provided" },
              { l: "ID", v: user?.id ? `CC-${user.id.slice(0, 8).toUpperCase()}` : "Not provided" },
              { l: "Policy", v: "Coming soon" },
              { l: "Residence", v: user?.address || "Not provided" },
            ].map((f) => (
              <div key={f.l} className="flex items-center justify-between text-sm border-b last:border-0 pb-2.5 last:pb-0">
                <span className="text-muted-foreground">{f.l}</span>
                <span className="font-semibold text-foreground">{f.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- About / FAQ ---------------- */
export function AboutScreen() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "What is ClinicCortex?", a: "ClinicCortex is an end-to-end health platform connecting patients, doctors and labs." },
    { q: "Is my data secure?", a: "Yes. We follow HIPAA-grade encryption and never share data without consent." },
    { q: "Can I book home visits?", a: "Yes, choose Home Care while booking your appointment." },
    { q: "How are payments processed?", a: "Via secure gateways with full receipts in your CC Transactions log." },
  ];
  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">About ClinicCortex</h1>
        <p className="text-sm text-muted-foreground mt-1">Health optimization, on your terms.</p>
      </div>
      <Section title="FAQ">
        <div className="grid gap-2">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card border rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                <span className="text-sm font-semibold">{f.q}</span>
                {open === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {open === i && <div className="px-4 pb-4 text-xs text-muted-foreground cc-fade-up">{f.a}</div>}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Privacy policy">
        <div className="bg-card border rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
          We respect your privacy. All medical information is encrypted end-to-end and never shared with third parties without your explicit consent. You may request deletion of your data at any time.
        </div>
      </Section>
    </div>
  );
}

export function FeedbackScreen() {
  const [r, setR] = useState(0);
  const [comments, setComments] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (r < 1) {
      setError("Please select a star rating first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/patient-auth/feedback', {
        rating: r,
        comments
      });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || "Failed to submit feedback.");
      }
    } catch (err: any) {
      setError(err.message || "Error submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-bold">Feedback</h1>
      <p className="text-sm text-muted-foreground mt-1">We'd love to hear your thoughts about ClinicCortex.</p>
      <div className="mt-6 bg-card border rounded-3xl p-5 cc-shadow">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setR(i)} className="transition-transform active:scale-90">
              <Star className={`w-9 h-9 ${i <= r ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Tell us more about your experience…"
          rows={4}
          className="mt-4 w-full rounded-2xl border bg-background p-3 outline-none focus:border-primary text-sm"
        />
        {error && <div className="mt-2 text-xs text-rose-500 font-semibold">{error}</div>}
        <button
          disabled={submitting || sent}
          onClick={handleSubmit}
          className="mt-4 w-full cc-grad-deep text-white font-semibold rounded-2xl py-3 disabled:opacity-50"
        >
          {sent ? "Thank you! ✓" : submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}

export function LocationScreen() {
  const [locationStatus, setLocationStatus] = useState("Detecting nearby location...");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus(`Lat: ${pos.coords.latitude.toFixed(3)}, Lng: ${pos.coords.longitude.toFixed(3)}`);
        },
        () => {
          setLocationStatus("GPS Location service active");
        }
      );
    } else {
      setLocationStatus("GPS Location service active");
    }
  }, []);

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Location</h1>
        <p className="text-sm text-muted-foreground mt-1">Nearby clinic detector</p>
      </div>
      <div className="px-5 mt-5">
        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
          <MapPinned className="w-16 h-16 text-primary cc-pulse-ring rounded-full p-3" />
          <div className="absolute bottom-3 left-3 right-3 bg-card border rounded-2xl p-3 text-sm">
            <div className="font-semibold">{locationStatus}</div>
            <div className="text-xs text-muted-foreground">Connected to ClinicCortex GPS network</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmergencyScreen() {
  const handleEmergencyCall = () => {
    window.location.href = 'tel:112';
  };

  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-bold text-red-500">Emergency SOS</h1>
      <p className="text-sm text-muted-foreground mt-1">Tap to dial local emergency services immediately.</p>
      <div className="mt-10 flex flex-col items-center">
        <button 
          onClick={handleEmergencyCall}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex flex-col items-center justify-center cc-pulse-ring active:scale-95 transition-transform cursor-pointer shadow-xl shadow-red-500/20"
        >
          <Siren className="w-16 h-16" />
          <span className="font-bold mt-2">HOLD TO CALL</span>
        </button>
        <div className="mt-10 grid grid-cols-2 gap-3 w-full">
          <button onClick={() => window.location.href = 'tel:102'} className="bg-card border rounded-2xl p-4 text-sm font-semibold hover:border-red-400 transition-colors">Ambulance (102)</button>
          <button onClick={() => window.location.href = 'tel:112'} className="bg-card border rounded-2xl p-4 text-sm font-semibold font-bold text-red-500 hover:bg-red-50 transition-colors">Emergency (112)</button>
        </div>
      </div>
    </div>
  );
}

export function SimpleListScreen({ title }: { title: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (title.toLowerCase().includes("prescription")) {
          const res = await api.get('/patients/me/prescriptions');
          if (res.success && Array.isArray(res.prescriptions)) {
            setItems(res.prescriptions.map((p: any) => ({
              id: p.id,
              title: p.medication || "Prescription",
              sub: `Dosage: ${p.dosage || 'As directed'} • ${p.instructions || ''}`,
              date: p.prescribed_date ? new Date(p.prescribed_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"
            })));
          }
        } else if (title.toLowerCase().includes("report") || title.toLowerCase().includes("record") || title.toLowerCase().includes("discharge")) {
          const res = await api.get('/patients/me/records');
          if (res.success && Array.isArray(res.records)) {
            setItems(res.records.map((r: any) => ({
              id: r.id,
              title: r.diagnosis || "Medical Record",
              sub: r.notes || r.treatment || "Clinical notes archived.",
              date: r.record_date ? new Date(r.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"
            })));
          }
        } else {
          // Categories with no backend tables (Bills & Memos, Guidelines)
          setItems([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [title]);

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">All records archived securely.</p>
      </div>
      <div className="px-5 mt-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card border rounded-3xl p-8 text-center text-sm font-medium text-muted-foreground">
            No {title.toLowerCase()} recorded on file.
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => (
              <div key={item.id} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.sub} • {item.date}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Live Video Call Modal ---------------- */
export function VideoCallModal({ appointmentId, onClose }: { appointmentId?: string; onClose: () => void }) {
  const { setScreen, user } = useCC();
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(callSeconds / 60);
  const secs = callSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const userName = user?.name || "Patient";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-3xl p-4 max-w-2xl w-full text-center space-y-4 relative cc-pop shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
          <span className="flex items-center gap-1.5 font-bold text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE HD CALL • {timeStr}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); setScreen("chat"); }} className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-semibold">
              Open Chat
            </button>
            <button onClick={onClose} className="px-3 py-1 rounded-xl border text-xs font-semibold">
              Close / End
            </button>
          </div>
        </div>

        {/* Real HD WebRTC Video Stream for Patient */}
        <div className="h-[440px] rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
          <iframe
            src={`https://meet.jit.si/ClinicCortex_Consultation_${appointmentId || 'live'}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(userName)}`}
            allow="camera; microphone; display-capture; autoplay; clipboard-write; gUM"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Notifications Screen ---------------- */
export function NotificationsScreen() {
  const { setScreen } = useCC();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.warn("Mark read error", err);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.warn("Delete notif error", err);
    }
  };

  return (
    <div className="pb-8 max-w-xl mx-auto">
      <div className="px-5 pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stay updated on call alerts & medical updates</p>
        </div>
        <button onClick={() => loadNotifications()} className="px-3 py-1.5 rounded-xl border text-xs font-semibold">
          Refresh
        </button>
      </div>

      <div className="px-5 mt-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card border rounded-3xl p-8 text-center text-sm font-medium text-muted-foreground">
            No notifications at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const isCallNotif = item.notification_type === 'video_call' || item.category === 'Urgent' || (item.title && item.title.includes('Call'));
              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl p-4 transition-all ${
                    item.is_read ? "bg-card/60 opacity-80" : "bg-card border-primary/30 shadow-md ring-1 ring-primary/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        isCallNotif ? "bg-emerald-500 animate-pulse" : "cc-grad-deep"
                      }`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{item.title || "Notification"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.body || item.message}</div>
                        <div className="text-[10px] text-muted-foreground mt-2">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : "Just now"}
                        </div>
                      </div>
                    </div>

                    <button onClick={() => deleteNotif(item.id)} className="text-xs text-muted-foreground hover:text-red-500">
                      ×
                    </button>
                  </div>

                  {isCallNotif && (
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <button
                        onClick={() => {
                          markAsRead(item.id);
                          setScreen("chat");
                        }}
                        className="px-4 py-2 rounded-xl cc-grad-deep text-white text-xs font-bold shadow-md"
                      >
                        Join Call / Chat with Doctor
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}