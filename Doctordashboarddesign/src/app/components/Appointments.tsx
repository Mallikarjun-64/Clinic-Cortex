import { useState, useEffect } from "react"; // Removed 'React' reference to fix ReferenceError
import { 
  Calendar, Search, Filter, Video, Home as HomeIcon, 
  Building2, MoreVertical, X, CheckCircle2, 
  Droplets, Heart, Activity, Thermometer, Moon 
} from "lucide-react";
import { Appointment, loadAppointments, saveAppointments } from "../lib/appointmentData";
import { api } from "../lib/api";

export function Appointments() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Modal, Toast, and Expansion States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null); 
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [openOptionsId, setOpenOptionsId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const queryParams = new URLSearchParams();
        if (activeTab) queryParams.append('tab', activeTab);
        if (filterType && filterType !== 'all') queryParams.append('type', filterType);

        const res = await api.get(`/appointments?${queryParams.toString()}`);
        if (res.success && Array.isArray(res.appointments) && res.appointments.length > 0) {
          const mapped = res.appointments.map((item: any) => ({
            id: item.id,
            patient: item.patient_name || item.patient || "Patient",
            age: item.patient_age || 30,
            type: item.visit_type || "Clinic",
            date: item.appointment_date ? new Date(item.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
            time: item.appointment_time || "10:00 AM",
            status: item.status || "Scheduled",
            condition: item.condition || "Consultation"
          }));
          setAppointments(mapped);
          saveAppointments(mapped);
        }
      } catch (err) {
        console.warn("API appointments fetch warning, using stored cache", err);
      }
    }
    fetchAppointments();
  }, [activeTab, filterType]);

  const handleCancelAppointment = async (id: number | string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: "Cancelled" });
    } catch (err) {
      console.warn("API status update error", err);
    }
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "Cancelled" } : apt
      )
    );
    triggerToast("Appointment cancelled and moved to Cancelled.");
    setOpenOptionsId(null);
  };

  const handleDeleteAppointment = async (id: number | string) => {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (err) {
      console.warn("API delete appointment error", err);
    }
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    triggerToast("Appointment deleted successfully.");
    setOpenOptionsId(null);
  };

  const tabCounts = appointments.reduce(
    (acc, apt) => {
      if (["Confirmed", "Waiting", "Scheduled"].includes(apt.status)) acc.upcoming += 1;
      if (apt.status === "Completed") acc.completed += 1;
      if (apt.status === "Cancelled") acc.cancelled += 1;
      if (apt.status === "Missed") acc.missed += 1;
      return acc;
    },
    { upcoming: 0, completed: 0, cancelled: 0, missed: 0 }
  );

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: tabCounts.upcoming },
    { id: "completed", label: "Completed", count: tabCounts.completed },
    { id: "cancelled", label: "Cancelled", count: tabCounts.cancelled },
    { id: "missed", label: "Missed", count: tabCounts.missed },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video size={16} className="text-blue-600" />;
      case "Home": return <HomeIcon size={16} className="text-amber-600" />;
      default: return <Building2 size={16} className="text-[#163CC7]" />;
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab =
      activeTab === "upcoming"
        ? ["Confirmed", "Waiting", "Scheduled"].includes(apt.status)
        : activeTab === "completed"
        ? apt.status === "Completed"
        : activeTab === "cancelled"
        ? apt.status === "Cancelled"
        : activeTab === "missed"
        ? apt.status === "Missed"
        : true;

    const matchesSearch = searchTerm.trim()
      ? [apt.patient, apt.condition, apt.type, apt.status]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;

    const matchesType = filterType === "all" || apt.type.toLowerCase() === filterType;

    return matchesTab && matchesSearch && matchesType;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 relative p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track all appointments</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-[#163CC7] text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20">
          <Calendar size={20} />
          <span className="font-bold">New Appointment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient, type, or condition..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/10"
            />
          </div>
          <div>
            <input type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/10" />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/10"
            >
              <option value="all">All Types</option>
              <option value="clinic">Clinic</option>
              <option value="video">Video</option>
              <option value="home">Home</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-5 border-b-4 transition-all font-bold text-sm relative ${
                  activeTab === tab.id ? "border-[#163CC7] text-[#163CC7] dark:text-[#4F6FE5]" : "border-transparent text-slate-400 dark:text-slate-500"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-blue-50 dark:bg-blue-950/40 text-[#163CC7] dark:text-[#4F6FE5]" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Patient Name</th>
                <th className="px-6 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Visit Type</th>
                <th className="px-6 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Condition</th>
                <th className="px-6 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="contents"> {/* Replaced React.Fragment with div contents for better compatibility */}
                  <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${expandedPatientId === apt.id ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#163CC7] dark:text-[#4F6FE5] font-bold text-xs border border-blue-100 dark:border-blue-900/30">
                          {apt.patient.split(' ').map(n => n[0]).join('')}
                        </div>
                        <button 
                          onClick={() => setExpandedPatientId(expandedPatientId === apt.id ? null : apt.id)}
                          className="text-left group"
                        >
                          <div className="text-slate-900 dark:text-white font-bold group-hover:text-[#163CC7] dark:group-hover:text-[#4F6FE5] transition-colors">{apt.patient}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{apt.age} years</div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {getTypeIcon(apt.type)} {apt.type}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{apt.date}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{apt.time}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">{apt.condition}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        apt.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' :
                        apt.status === 'Waiting' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                        apt.status === 'Scheduled' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
                        apt.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                        apt.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                        apt.status === 'Missed' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                        'bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-400'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => triggerToast(`Starting session for ${apt.patient}...`)} className="px-4 py-1.5 rounded-lg font-black text-[11px] bg-[#163CC7] text-white hover:shadow-lg transition-all">Start</button>
                        <button onClick={() => { setSelectedPatient(apt.patient); setIsRescheduleOpen(true); }} className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-[11px] text-slate-600 dark:text-slate-350 hover:border-[#163CC7] dark:hover:border-[#4F6FE5] transition-colors">Reschedule</button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenOptionsId(openOptionsId === apt.id ? null : apt.id)}
                            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openOptionsId === apt.id && (
                            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl z-30 overflow-hidden">
                              {activeTab === "upcoming" && (
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  Cancel Appointment
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                Delete Appointment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {expandedPatientId === apt.id && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 dark:bg-slate-900/40 px-8 py-10 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
                          
                          {/* Vital Monitors */}
                          <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">Live Vital Signs</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Blood Glucose", val: "80", unit: "mmol/L", icon: Droplets, color: "text-red-500" },
                                { label: "HRV", val: "74.4", unit: "ms", icon: Activity, color: "text-green-500" },
                                { label: "SpO2", val: "95.6", unit: "%", icon: Heart, color: "text-blue-500" },
                                { label: "Temp", val: "34.3", unit: "°C", icon: Thermometer, color: "text-orange-500" },
                                { label: "Sleep", val: "4h 50m", unit: "", icon: Moon, color: "text-indigo-500" },
                                { label: "RHR", val: "53.5", unit: "bpm", icon: Heart, color: "text-pink-500" },
                              ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
                                  <div className="flex justify-between items-center">
                                    <stat.icon size={18} className={stat.color} />
                                    <div className="text-[9px] font-black bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">NORMAL</div>
                                  </div>
                                  <div>
                                    <div className="text-xl font-black text-slate-900 dark:text-white">{stat.val}<span className="text-[10px] ml-1 text-slate-400 dark:text-slate-500 font-medium">{stat.unit}</span></div>
                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{stat.label}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Care Summary & Medical Assessment */}
                          <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-6">
                                <h3 className="text-blue-600 dark:text-blue-400 font-black text-2xl">Care Summary</h3>
                                <div className="space-y-4">
                                  {[
                                    { l: "Diagnosis", v: "A-90 Dengue Fever" },
                                    { l: "Admission Date", v: "23/11/2024" },
                                    { l: "Nursing Plan", v: "Monitor Vital Signs" },
                                    { l: "Status", v: "Referred to Polyclinic" }
                                  ].map((row, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800/40">
                                      <span className="text-blue-600 dark:text-blue-400 font-bold">{row.l}</span>
                                      <span className="font-black text-slate-800 dark:text-slate-200">{row.v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h3 className="text-blue-600 dark:text-blue-400 font-black text-2xl">Medical Assessment</h3>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-center">
                                    <div className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase">Weight</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white">65 kg</div>
                                  </div>
                                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-center">
                                    <div className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase">Height</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white">170 cm</div>
                                  </div>
                                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl text-center">
                                    <div className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase">BMI</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white">22.5</div>
                                  </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Main Complaint</div>
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed italic">
                                    "Patient reports recurring chronic acute pain and respiratory difficulties. Vital signs monitoring required."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <td colSpan={6} className="px-8 py-14 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No appointments found for "{searchTerm.trim()}". Try a different patient name, type, or condition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Reschedule</h3>
              <button onClick={() => setIsRescheduleOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-300 transition-colors"><X size={20}/></button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Rescheduling for <span className="text-[#163CC7] dark:text-[#4F6FE5] font-black">{selectedPatient}</span></p>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">New Date & Time</label>
                <input type="datetime-local" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-4 ring-blue-500/5 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">Reason</label>
                <textarea placeholder="Specify reason..." className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-4 ring-blue-500/5 h-24 resize-none transition-all" />
              </div>
            </div>
            <button 
              onClick={() => { setIsRescheduleOpen(false); triggerToast("Appointment successfully rescheduled!"); }}
              className="w-full mt-10 bg-[#163CC7] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-green-500 rounded-full p-1.5"><CheckCircle2 size={16} className="text-white" /></div>
          <span className="font-bold text-sm tracking-tight">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}