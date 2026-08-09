import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router";
import { 
  Calendar, Search, Filter, Video, Home as HomeIcon, 
  Building2, MoreVertical, X, CheckCircle2, 
  Droplets, Heart, Activity, Thermometer, Moon,
  Pill, Plus, Trash2, Edit, FileText, PhoneCall
} from "lucide-react";
import { Appointment, loadAppointments, saveAppointments } from "../lib/appointmentData";
import { api } from "../lib/api";

export function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Modal, Toast, and Expansion States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState<number | string | null>(null);

  // Consultation & Prescriptions Modal States
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("Completed");
  const [editCondition, setEditCondition] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  // Vitals states
  const [editGlucose, setEditGlucose] = useState("");
  const [editRhr, setEditRhr] = useState("");
  const [editHrv, setEditHrv] = useState("");
  const [editSpo2, setEditSpo2] = useState("");
  const [editTemp, setEditTemp] = useState("");
  const [editSleep, setEditSleep] = useState("");

  // Prescriptions list state
  const [prescriptionsList, setPrescriptionsList] = useState<{ medication: string; dosage: string; instructions: string }[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [savingConsultation, setSavingConsultation] = useState(false);

  // New Appointment Modal States
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newVisitType, setNewVisitType] = useState("Clinic");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newCondition, setNewCondition] = useState("");
  const [newNotes, setNewNotes] = useState("");
  
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [openOptionsId, setOpenOptionsId] = useState<number | string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());

  async function fetchAppointments() {
    try {
      const queryParams = new URLSearchParams();
      if (activeTab) queryParams.append('tab', activeTab);
      if (filterType && filterType !== 'all') queryParams.append('type', filterType);

      const res = await api.get(`/appointments?${queryParams.toString()}`);
      if (res.success && Array.isArray(res.appointments)) {
        const mapped = res.appointments.map((item: any) => ({
          id: item.id,
          patient_id: item.patient_id,
          patient: item.patient_name || item.patient || "Patient",
          age: item.patient_age || 30,
          type: item.visit_type || "Clinic",
          date: item.appointment_date ? new Date(item.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
          time: item.appointment_time || "10:00 AM",
          status: item.status || "Scheduled",
          condition: item.condition || "Consultation",
          notes: item.notes || "",
          vitals: typeof item.vitals === 'string' ? JSON.parse(item.vitals) : item.vitals
        }));
        setAppointments(mapped);
        saveAppointments(mapped);
      }
    } catch (err) {
      console.warn("API appointments fetch warning, using stored cache", err);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, filterType]);

  const handleStartSession = (apt: any) => {
    if (apt.type === "Video" || apt.visit_type === "Video" || apt.visitType === "Video") {
      navigate(`/dashboard/virtual-consultation?appointmentId=${apt.id}`, { state: { appointment: apt } });
      return;
    }

    setEditingAppt(apt);
    setEditStatus("Completed");
    setEditCondition(apt.condition || "");
    setEditNotes(apt.notes || "");
    
    const v = apt.vitals || {};
    setEditGlucose(v.blood_glucose ?? v.bloodGlucose ?? "");
    setEditRhr(v.rhr ?? "");
    setEditHrv(v.hrv ?? "");
    setEditSpo2(v.spo2 ?? "");
    setEditTemp(v.temp ?? "");
    setEditSleep(v.sleep ?? "");

    setPrescriptionsList([]);
    setNewMedication("");
    setNewDosage("");
    setNewInstructions("");
    
    setIsConsultationOpen(true);
  };

  const handleAddPrescriptionItem = () => {
    if (!newMedication.trim()) {
      triggerToast("Medication name is required.");
      return;
    }
    setPrescriptionsList((prev) => [
      ...prev,
      {
        medication: newMedication.trim(),
        dosage: newDosage.trim(),
        instructions: newInstructions.trim()
      }
    ]);
    setNewMedication("");
    setNewDosage("");
    setNewInstructions("");
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async () => {
    if (!editingAppt) return;
    setSavingConsultation(true);

    try {
      const vitalsObj = {
        blood_glucose: editGlucose ? parseFloat(editGlucose) : null,
        rhr: editRhr ? parseFloat(editRhr) : null,
        hrv: editHrv ? parseFloat(editHrv) : null,
        spo2: editSpo2 ? parseFloat(editSpo2) : null,
        temp: editTemp ? parseFloat(editTemp) : null,
        sleep: editSleep || null
      };

      // 1. Update appointment details
      await api.put(`/appointments/${editingAppt.id}`, {
        condition: editCondition,
        notes: editNotes,
        status: editStatus,
        vitals: vitalsObj
      });

      const patientId = editingAppt.patient_id || editingAppt.patientId || editingAppt.id;

      // 2. Create Medical Record
      await api.post(`/patients/${patientId}/records`, {
        diagnosis: editCondition || 'Consultation Record',
        notes: editNotes,
        vitals: vitalsObj,
        patientName: editingAppt.patient
      }).catch((err) => console.warn("Record creation warning", err));

      // 3. Issue Prescriptions
      for (const item of prescriptionsList) {
        await api.post(`/patients/${patientId}/prescriptions`, {
          medication: item.medication,
          dosage: item.dosage,
          instructions: item.instructions,
          patientName: editingAppt.patient
        }).catch((err) => console.warn("Prescription creation warning", err));
      }

      triggerToast("Consultation saved & prescriptions issued successfully!");
      setIsConsultationOpen(false);
      await fetchAppointments();
    } catch (err: any) {
      triggerToast(err.message || "Failed to save consultation details.");
    } finally {
      setSavingConsultation(false);
    }
  };

  const handleCancelAppointment = async (id: number | string) => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: "Cancelled" });
      if (res.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === id ? { ...apt, status: "Cancelled" } : apt
          )
        );
        triggerToast("Appointment cancelled and moved to Cancelled.");
        fetchAppointments();
      } else {
        triggerToast(res.message || "Failed to cancel appointment.");
      }
    } catch (err: any) {
      triggerToast(err.message || "API status update error");
    }
    setOpenOptionsId(null);
  };

  const handleDeleteAppointment = async (id: number | string) => {
    try {
      const res = await api.delete(`/appointments/${id}`);
      if (res.success) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
        triggerToast("Appointment deleted successfully.");
        fetchAppointments();
      } else {
        triggerToast(res.message || "Failed to delete appointment.");
      }
    } catch (err: any) {
      triggerToast(err.message || "API delete appointment error");
    }
    setOpenOptionsId(null);
  };

  const handleRecallPatient = async (apt: any) => {
    setOpenOptionsId(null);
    try {
      // 1. Update status to In-Progress in PostgreSQL
      await api.patch(`/appointments/${apt.id}/status`, { status: "In-Progress" });

      // 2. Send real-time recall notification to Patient Portal
      const patId = apt.patient_id || apt.patientId;
      await api.post('/notifications', {
        patientId: patId,
        doctorId: apt.doctor_id || apt.doctorId,
        appointmentId: apt.id,
        patientName: apt.patient_name || apt.patient,
        title: "Doctor Recalled Your Video Call",
        body: "Dr. Mallikarjun is recalling you to rejoin your video consultation call. Click to join now!",
        category: "Urgent",
        notificationType: "video_call"
      }).catch((err) => console.warn("Recall notification error", err));

      triggerToast(`Recalling patient ${apt.patient || apt.patient_name || ''}... Launching video call room.`);

      // 3. Navigate doctor directly to Virtual Consultation room
      navigate(`/dashboard/virtual-consultation?appointmentId=${apt.id}`, { state: { appointment: apt } });
    } catch (err: any) {
      triggerToast(err.message || "Failed to recall patient for video call");
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointmentId) return;
    if (!rescheduleDate) {
      triggerToast("Please select a new date and time.");
      return;
    }

    const parts = rescheduleDate.split('T');
    const dateStr = parts[0];
    const timeStr = parts[1] || "10:00";

    try {
      const res = await api.put(`/appointments/${selectedAppointmentId}`, {
        date: dateStr,
        time: timeStr,
        notes: rescheduleReason || undefined
      });

      if (res.success) {
        setIsRescheduleOpen(false);
        triggerToast("Appointment successfully rescheduled!");
        await fetchAppointments();
      } else {
        triggerToast(res.message || "Failed to reschedule appointment.");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to reschedule appointment.");
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newDate || !newTime) {
      triggerToast("Please fill in patient name, date, and time.");
      return;
    }

    try {
      const res = await api.post('/appointments', {
        patientName: newPatientName,
        visitType: newVisitType,
        date: newDate,
        time: newTime,
        condition: newCondition || "General Consult",
        notes: newNotes || undefined
      });

      if (res.success) {
        setIsNewApptOpen(false);
        triggerToast("Appointment scheduled successfully!");
        await fetchAppointments();
      } else {
        triggerToast(res.message || "Failed to schedule appointment.");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error scheduling appointment.");
    }
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
                <Fragment key={apt.id}>
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
                        <button onClick={() => handleStartSession(apt)} className="px-4 py-1.5 rounded-lg font-black text-[11px] bg-[#163CC7] text-white hover:shadow-lg transition-all">Start</button>
                        <button onClick={() => { setSelectedPatient(apt.patient); setSelectedAppointmentId(apt.id); setRescheduleDate(""); setRescheduleReason(""); setIsRescheduleOpen(true); }} className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-[11px] text-slate-600 dark:text-slate-350 hover:border-[#163CC7] dark:hover:border-[#4F6FE5] transition-colors">Reschedule</button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenOptionsId(openOptionsId === apt.id ? null : apt.id)}
                            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openOptionsId === apt.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 overflow-hidden">
                              {(apt.type === "Video" || apt.visit_type === "Video" || apt.visitType === "Video") && (
                                <button
                                  onClick={() => handleRecallPatient(apt)}
                                  className="w-full text-left px-4 py-3 text-xs font-bold text-[#163CC7] dark:text-[#4F6FE5] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"
                                >
                                  <PhoneCall size={14} className="animate-pulse" />
                                  <span>Recall Patient</span>
                                </button>
                              )}
                              {activeTab === "upcoming" && (
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="w-full text-left px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
                                >
                                  Cancel Appointment
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                              {(() => {
                                const v = (apt as any).vitals || {};
                                return [
                                  { label: "Blood Glucose", raw: v.blood_glucose ?? v.bloodGlucose, unit: "mmol/L", icon: Droplets, color: "text-red-500" },
                                  { label: "HRV", raw: v.hrv, unit: "ms", icon: Activity, color: "text-green-500" },
                                  { label: "SpO2", raw: v.spo2, unit: "%", icon: Heart, color: "text-blue-500" },
                                  { label: "Temp", raw: v.temp, unit: "°C", icon: Thermometer, color: "text-orange-500" },
                                  { label: "Sleep", raw: v.sleep, unit: "", icon: Moon, color: "text-indigo-500" },
                                  { label: "RHR", raw: v.rhr, unit: "bpm", icon: Heart, color: "text-pink-500" },
                                ].map((stat, i) => {
                                  const isRec = stat.raw !== null && stat.raw !== undefined && stat.raw !== "";
                                  return (
                                    <div key={i} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
                                      <div className="flex justify-between items-center">
                                        <stat.icon size={18} className={stat.color} />
                                        <div className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isRec ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                          {isRec ? "RECORDED" : "N/A"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`text-xl font-black ${isRec ? "text-slate-900 dark:text-white" : "text-xs text-slate-400 italic font-normal"}`}>
                                          {isRec ? String(stat.raw) : "Not recorded"}
                                          {isRec && <span className="text-[10px] ml-1 text-slate-400 dark:text-slate-500 font-medium">{stat.unit}</span>}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{stat.label}</div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Care Summary & Medical Assessment */}
                          <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-6">
                                <h3 className="text-blue-600 dark:text-blue-400 font-black text-2xl">Care Summary</h3>
                                <div className="space-y-4">
                                  {[
                                    { l: "Diagnosis", v: apt.condition || "General Consult" },
                                    { l: "Appointment Date", v: apt.date },
                                    { l: "Visit Type", v: apt.type },
                                    { l: "Status", v: apt.status }
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
                                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Condition Details</div>
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed italic">
                                    "{apt.condition} — consultation recorded for patient {apt.patient}."
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleStartSession(apt)}
                                  className="w-full mt-4 py-3 rounded-xl bg-[#163CC7] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                  <Edit size={14} />
                                  <span>Edit Consultation, Vitals & Issue Prescriptions</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
                <input 
                  type="datetime-local" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-4 ring-blue-500/5 transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">Reason / Notes</label>
                <textarea 
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Specify reason..." 
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-4 ring-blue-500/5 h-24 resize-none transition-all" 
                />
              </div>
            </div>
            <button 
              onClick={handleConfirmReschedule}
              className="w-full mt-10 bg-[#163CC7] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isNewApptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateAppointment} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">New Appointment</h3>
              <button type="button" onClick={() => setIsNewApptOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-300 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Patient Name</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Enter patient full name..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Visit Type</label>
                  <select
                    value={newVisitType}
                    onChange={(e) => setNewVisitType(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold"
                  >
                    <option value="Clinic">Clinic</option>
                    <option value="Video">Video</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Condition / Reason</label>
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. General Consult, Hypertension"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional consultation notes..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none focus:ring-4 ring-blue-500/5 h-20 resize-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-6 bg-[#163CC7] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 transition-all text-sm"
            >
              Schedule Appointment
            </button>
          </form>
        </div>
      )}

      {/* Start Consultation / Edit Session Modal */}
      {isConsultationOpen && editingAppt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl my-8 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <FileText className="text-[#163CC7] dark:text-[#4F6FE5]" size={28} />
                  <span>Start Consultation & Medical Assessment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Patient: <span className="font-bold text-[#163CC7] dark:text-[#4F6FE5]">{editingAppt.patient}</span> • Age: {editingAppt.age} • Visit: {editingAppt.type}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsConsultationOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-300 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Diagnosis */}
              <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Appointment Status & Clinical Diagnosis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Diagnosis / Condition</label>
                    <input
                      type="text"
                      value={editCondition}
                      onChange={(e) => setEditCondition(e.target.value)}
                      placeholder="e.g. Hypertension, Viral Fever"
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Treatment Plan & Clinical Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter detailed consultation notes and treatment recommendations..."
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm h-24 resize-none outline-none"
                  />
                </div>
              </div>

              {/* Vitals Section */}
              <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Update Patient Biometric Vitals</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">Blood Glucose (mmol/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editGlucose}
                      onChange={(e) => setEditGlucose(e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">Resting HR (bpm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editRhr}
                      onChange={(e) => setEditRhr(e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">HRV (ms)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editHrv}
                      onChange={(e) => setEditHrv(e.target.value)}
                      placeholder="e.g. 68"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">SpO2 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editSpo2}
                      onChange={(e) => setEditSpo2(e.target.value)}
                      placeholder="e.g. 98"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editTemp}
                      onChange={(e) => setEditTemp(e.target.value)}
                      placeholder="e.g. 36.8"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">Sleep Duration</label>
                    <input
                      type="text"
                      value={editSleep}
                      onChange={(e) => setEditSleep(e.target.value)}
                      placeholder="e.g. 7h 30m"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Prescriptions Section */}
              <div className="bg-[#163CC7]/5 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-4">
                <h4 className="text-xs font-black text-[#163CC7] dark:text-[#4F6FE5] uppercase tracking-widest flex items-center gap-2">
                  <Pill size={16} />
                  <span>Issue Prescriptions</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">Medication Name *</label>
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="e.g. Amoxicillin 500mg"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">Dosage</label>
                    <input
                      type="text"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="e.g. 1 tab twice daily"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">Instructions</label>
                    <input
                      type="text"
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      placeholder="e.g. Take after meals for 5 days"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddPrescriptionItem}
                  className="px-4 py-2 bg-[#163CC7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Medication to Prescription</span>
                </button>

                {prescriptionsList.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prescribed Items ({prescriptionsList.length})</div>
                    {prescriptionsList.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{item.medication}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.dosage && `Dosage: ${item.dosage}`} {item.instructions && `• ${item.instructions}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescriptionItem(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConsultationOpen(false)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={savingConsultation}
                onClick={handleSaveConsultation}
                className="flex-1 py-3.5 rounded-2xl bg-[#163CC7] text-white font-black shadow-xl shadow-blue-500/30 hover:opacity-90 transition-all text-sm disabled:opacity-50"
              >
                {savingConsultation ? "Saving Consultation..." : "Save Consultation & Issue Prescriptions"}
              </button>
            </div>
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