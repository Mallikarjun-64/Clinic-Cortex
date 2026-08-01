import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle, Calendar, Clock, User, Activity, ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { getDoctorDisplayName } from "../lib/doctorProfile";
import { api } from "../lib/api";

export function CompletedVisits() {
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const doctorName = getDoctorDisplayName();

  async function loadCompletedVisits() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/appointments?tab=completed');
      if (res.success && Array.isArray(res.appointments)) {
        const mapped = res.appointments.map((apt: any) => ({
          id: apt.id,
          patientName: apt.patient_name || apt.patient || "Patient",
          age: apt.patient_age || 30,
          date: apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
          time: apt.appointment_time || "10:00 AM",
          type: apt.visit_type === "Video" ? "Virtual" : apt.visit_type === "Clinic" ? "In-Person" : apt.visit_type || "Clinic",
          condition: apt.condition || "General",
          doctor: doctorName,
          status: apt.status || "Completed",
          notes: apt.notes || `Completed appointment for ${apt.condition || 'checkup'}.`
        }));
        setVisits(mapped);
        if (mapped.length > 0) {
          setSelectedVisit(mapped[0].id);
        }
      }
    } catch (err: any) {
      console.error("API completed appointments fetch error", err);
      setError("Failed to load — please check your connection and try again.");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompletedVisits();
  }, []);

  const filteredVisits = visits.filter((visit) => {
    const matchesSearch = searchTerm.trim()
      ? [visit.patientName, visit.condition, visit.type, visit.status]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesDate = dateFilter === "all" || visit.date.toLowerCase().includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const selectedVisitData = filteredVisits.find((v) => v.id === selectedVisit) || null;

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Completed Visits</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">History of all finalized consultations</p>
        </div>
      </div>

      {error && visits.length === 0 ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={loadCompletedVisits} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">
            Retry
          </button>
        </div>
      ) : loading && visits.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by patient name, condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#163CC7]/10"
                />
              </div>
            </div>

            {filteredVisits.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedVisit(item.id)}
                className={`p-6 bg-white dark:bg-slate-900 border rounded-3xl cursor-pointer hover:shadow-md transition-all ${
                  selectedVisit === item.id ? "border-[#163CC7] ring-1 ring-[#163CC7]/20" : "border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-lg">{item.patientName}</h3>
                    <p className="text-xs text-slate-400 font-bold">{item.age} years</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700">
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> {item.time}</span>
                  <span className="flex items-center gap-1"><Activity size={14}/> {item.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Details column */}
          <div>
            {selectedVisitData ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
                <h3 className="text-slate-800 dark:text-white font-black text-xl mb-4">Consultation Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name</label>
                    <p className="font-bold text-slate-850 dark:text-white text-sm">{selectedVisitData.patientName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Condition</label>
                    <p className="font-bold text-slate-850 dark:text-white text-sm">{selectedVisitData.condition}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Doctor Assigned</label>
                    <p className="font-bold text-slate-850 dark:text-white text-sm">{selectedVisitData.doctor}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Clinical Notes</label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed italic">
                      "{selectedVisitData.notes}"
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-dashed p-10 text-center text-slate-400 font-bold">
                Select a completed visit to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
