import { useEffect, useMemo, useState } from "react";
import {
  Calendar, Clock, Star, MapPin, Video, Phone, Send, Paperclip,
  Heart, Activity, Droplet, Moon, Thermometer, Wind, ChevronRight,
  Pill, Upload, Plus, Minus, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight,
  Sparkles, Search, Mic, ChevronDown, ChevronUp, Sun, MoonStar, Languages,
  Shield, FileText, Pencil, Stethoscope, Home as HomeIcon, MessageSquare,
  Siren, MapPinned, CheckCircle2, XCircle, RotateCcw, Bot,
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
          <MiniVital icon={Heart} label="Heart" value="53.5" unit="bpm" tone="lower" />
          <MiniVital icon={Activity} label="HRV" value="74.4" unit="ms" tone="normal" />
          <MiniVital icon={Wind} label="SpO₂" value="95.6" unit="%" tone="normal" />
          <MiniVital icon={Moon} label="Sleep" value="4h 50m" unit="" tone="lower" />
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
                  <button className="rounded-xl cc-grad-deep text-white text-xs font-semibold py-2">Generate Queue</button>
                  <button className="rounded-xl border text-xs font-semibold py-2"><RotateCcw className="w-3 h-3 inline mr-1" />Reschedule</button>
                  <button className="rounded-xl border text-xs font-semibold py-2 text-red-500"><XCircle className="w-3 h-3 inline mr-1" />Cancel</button>
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
  const { selectedDoctorId, setScreen, user } = useCC();
  const [day, setDay] = useState(4);
  const [slot, setSlot] = useState("10:30 AM");
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  const slots = {
    Morning: ["08:00 AM", "09:00 AM", "10:30 AM", "11:00 AM"],
    Afternoon: ["12:00 PM", "01:30 PM", "02:00 PM"],
    Evening: ["05:00 PM", "06:30 PM", "07:00 PM"],
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctorId || "8ee16766-3d23-4c91-91a5-e1ab8529f8f2",
        patientName: user?.name || "Patient",
        visitType: "Clinic",
        date: `2026-11-${String(day).padStart(2, '0')}`,
        time: slot === "10:30 AM" ? "10:30:00" : "12:00:00",
        condition: "General Consult",
        notes: "Booked via Patient Portal app"
      });
      alert("Appointment booked successfully!");
      setScreen("appointments");
    } catch (err: any) {
      alert(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8">
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Choose date & time</h1>
      </div>
      <Section title="< November 2026 >">
        <div className="flex gap-2 overflow-x-auto cc-scroll pb-2">
          {days.map((dy) => {
            const active = dy === day;
            const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(dy + 6) % 7];
            return (
              <button key={dy} onClick={() => setDay(dy)} className={`min-w-[58px] py-3 rounded-2xl flex flex-col items-center transition-all ${
                active ? "cc-grad-deep text-white cc-shadow scale-105" : "bg-card border"
              }`}>
                <span className="text-[10px] uppercase">{wd}</span>
                <span className="text-lg font-bold">{String(dy).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </Section>
      {Object.entries(slots).map(([k, vals]) => (
        <Section key={k} title={k}>
          <div className="flex flex-wrap gap-2">
            {vals.map((s) => (
              <button key={s} onClick={() => setSlot(s)} className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                slot === s ? "cc-grad-deep text-white cc-shadow" : "bg-card border text-foreground"
              }`}>{s}</button>
            ))}
          </div>
        </Section>
      ))}
      <div className="px-5 mt-8">
        <button onClick={handleConfirmBooking} disabled={loading} className="w-full cc-grad-deep text-white font-semibold rounded-2xl py-3.5 flex justify-center items-center">
          {loading ? <span className="animate-pulse">Booking…</span> : "Confirm booking · ₹1000"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Chat ---------------- */
export function ChatScreen() {
  const { setScreen, selectedDoctorId } = useCC();
  const [activeDoctor, setActiveDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: "Hi! How are you feeling today?" },
    { me: true, text: "Slight headache since morning." },
    { me: false, text: "Got it. Sharing a quick assessment chart 📎" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    api.get('/doctors-directory').then((res) => {
      const list = res.doctors || [];
      if (Array.isArray(list) && list.length > 0) {
        const found = list.find((d: any) => d.id === selectedDoctorId) || list[0];
        setActiveDoctor(found);
      }
    }).catch(() => {});
  }, [selectedDoctorId]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { me: true, text: input }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { me: false, text: "Thanks for sharing. I'll review and revert shortly." }]);
    }, 1400);
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
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"} cc-fade-up`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              m.me ? "cc-grad-deep text-white rounded-br-md" : "bg-card border rounded-bl-md"
            }`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-card border flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:.3s]" />
            </div>
          </div>
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
  const value = 80;
  const arc = (value / 200) * 100;
  return (
    <div className="pb-8">
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Blood Glucose</h1>
        <p className="text-sm text-muted-foreground">Today, real-time monitor</p>
      </div>
      <div className="px-5 mt-6">
        <div className="bg-card border rounded-3xl p-6 cc-shadow flex flex-col items-center">
          <RadialArc value={arc} />
          <div className="-mt-24 text-center">
            <div className="text-4xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground">mmol/L</div>
            <Badge tone="normal">Normal</Badge>
          </div>
        </div>
      </div>
      <Section title="Today's tracking">
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Food", v: 65, color: "bg-amber-500" },
            { l: "Water", v: 80, color: "bg-sky-500" },
            { l: "Supplements", v: 40, color: "bg-violet-500" },
          ].map((c) => (
            <div key={c.l} className="bg-card border rounded-2xl p-3 flex flex-col items-center">
              <div className="h-32 w-3 rounded-full bg-muted relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 right-0 ${c.color} rounded-full transition-all`} style={{ height: `${c.v}%` }} />
              </div>
              <div className="text-xs font-semibold mt-2">{c.l}</div>
              <div className="text-[10px] text-muted-foreground">{c.v}%</div>
            </div>
          ))}
        </div>
      </Section>
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
  const vitals = [
    { icon: Wind, label: "Respiratory Rate", v: "15.2", u: "rpm", tone: "normal" as const, fill: 60 },
    { icon: Heart, label: "Resting Heart Rate", v: "53.5", u: "bpm", tone: "lower" as const, fill: 30 },
    { icon: Activity, label: "Heart Rate Variability", v: "74.4", u: "ms", tone: "normal" as const, fill: 70 },
    { icon: Droplet, label: "Blood Oxygen (SpO₂)", v: "95.6", u: "%", tone: "normal" as const, fill: 85 },
    { icon: Thermometer, label: "Temperature", v: "34.3", u: "°C", tone: "normal" as const, fill: 55 },
    { icon: Moon, label: "Sleep Monitor", v: "4h 50m", u: "", tone: "lower" as const, fill: 35 },
  ];
  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Vitals Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live biometric monitor</p>
      </div>
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {vitals.map((vi) => {
          const I = vi.icon;
          return (
            <div key={vi.label} className="bg-card border rounded-3xl p-4 cc-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><I className="w-5 h-5" /></div>
                <Badge tone={vi.tone}>{vi.tone === "normal" ? "Normal" : "Lower"}</Badge>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-muted-foreground leading-none">{vi.label}</div>
                  <div className="text-xl font-bold mt-1 leading-none">{vi.v} <span className="text-xs font-normal text-muted-foreground">{vi.u}</span></div>
                </div>
                <div className="w-2.5 h-16 rounded-full bg-muted relative overflow-hidden">
                  <div className={`absolute bottom-0 inset-x-0 rounded-full transition-all ${vi.tone === "normal" ? "bg-emerald-500" : "bg-red-500"}`} style={{ height: `${vi.fill}%` }} />
                </div>
              </div>
            </div>
          );
        })}
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

  async function fetchWallet() {
    try {
      const res = await api.get('/wallet');
      if (res.success && res.wallet) setWallet(res.wallet);

      const plansRes = await api.get('/wallet/plans');
      if (plansRes.success && Array.isArray(plansRes.plans)) setPlans(plansRes.plans);
    } catch (err) {
      console.warn("Error fetching wallet details", err);
    }
  }

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopUp = async () => {
    const amt = prompt("Enter amount to add to wallet (₹):", "500");
    if (!amt) return;
    try {
      const res = await api.post('/wallet/topup', { amount: parseFloat(amt) });
      if (res.success) {
        alert(res.message);
        fetchWallet();
      }
    } catch (err: any) {
      alert(err.message || "Top-up failed");
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
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Digital Wallet</h1>
      </div>
      <div className="px-5 mt-5">
        <div className="cc-grad-deep rounded-3xl p-6 text-white relative overflow-hidden cc-shadow">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-200">Available Balance</div>
            <div className="text-3xl font-bold mt-2">₹ {parseFloat(wallet.balance || 0).toFixed(2)}</div>
            <div className="text-xs text-cyan-100 mt-1">Status: {wallet.subscription_status || 'Free'}</div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleTopUp} className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-semibold">Add money</button>
            </div>
          </div>
        </div>
      </div>
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
  const { user } = useCC();
  return (
    <div>
      <div className="cc-grad-deep px-5 pt-6 pb-12 rounded-b-[2.5rem] text-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center cc-shadow"><Pencil className="w-3.5 h-3.5" /></button>
          </div>
          <div>
            <div className="text-xl font-bold">{user?.name || "Guest"}</div>
            <div className="text-cyan-100 text-sm">{user?.email || "Not provided"}</div>
          </div>
        </div>
      </div>
      <div className="px-5 -mt-6">
        <div className="bg-card border rounded-3xl p-4 cc-shadow grid gap-3">
          {[
            { l: "Age", v: user?.age ? `${user.age} Years` : "Not provided" },
            { l: "Email", v: user?.email || "Not provided" },
            { l: "Phone number", v: user?.phone || "Not provided" },
            { l: "ID", v: user?.id ? `CC-${user.id.slice(0, 8).toUpperCase()}` : "Not provided" },
            { l: "Policy", v: "Coming soon" },
            { l: "Residence", v: user?.address || "Not provided" },
          ].map((f) => (
            <div key={f.l} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
              <span className="text-muted-foreground">{f.l}</span>
              <span className="font-semibold">{f.v}</span>
            </div>
          ))}
        </div>
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
  const [sent, setSent] = useState(false);
  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-bold">Feedback</h1>
      <p className="text-sm text-muted-foreground mt-1">We'd love to hear from you.</p>
      <div className="mt-6 bg-card border rounded-3xl p-5 cc-shadow">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setR(i)} className="transition-transform active:scale-90">
              <Star className={`w-9 h-9 ${i <= r ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea placeholder="Tell us more…" rows={4} className="mt-4 w-full rounded-2xl border bg-background p-3 outline-none focus:border-primary" />
        <button onClick={() => setSent(true)} className="mt-4 w-full cc-grad-deep text-white font-semibold rounded-2xl py-3">
          {sent ? "Thank you! ✓" : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}

export function LocationScreen() {
  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">Location</h1>
      </div>
      <div className="px-5 mt-5">
        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
          <MapPinned className="w-16 h-16 text-primary cc-pulse-ring rounded-full p-3" />
          <div className="absolute bottom-3 left-3 right-3 bg-card border rounded-2xl p-3 text-sm">
            <div className="font-semibold">Bandra West, Mumbai</div>
            <div className="text-xs text-muted-foreground">3 nearby clinics</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmergencyScreen() {
  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-bold text-red-500">Emergency SOS</h1>
      <p className="text-sm text-muted-foreground mt-1">Tap to alert emergency contacts and nearest hospital.</p>
      <div className="mt-10 flex flex-col items-center">
        <button className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex flex-col items-center justify-center cc-pulse-ring active:scale-95 transition-transform">
          <Siren className="w-16 h-16" />
          <span className="font-bold mt-2">HOLD TO CALL</span>
        </button>
        <div className="mt-10 grid grid-cols-2 gap-3 w-full">
          <button className="bg-card border rounded-2xl p-4 text-sm font-semibold">Ambulance</button>
          <button className="bg-card border rounded-2xl p-4 text-sm font-semibold">Family</button>
        </div>
      </div>
    </div>
  );
}

export function SimpleListScreen({ title }: { title: string }) {
  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">All records archived securely.</p>
      </div>
      <div className="px-5 mt-5 grid gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><FileText className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{title} #{1000 + i}</div>
              <div className="text-xs text-muted-foreground">Updated Oct {20 - i}, 2026</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}