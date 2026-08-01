import { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, FileText, Calendar, Activity, Upload, AlertCircle, X, Pill, CheckCircle2 } from "lucide-react";
import { getDoctorDisplayName } from "../lib/doctorProfile";
import { api } from "../lib/api";

export function PatientRecords() {
  const doctorName = getDoctorDisplayName();
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");
  
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | number>("");
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Record Modal States
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [addRecordType, setAddRecordType] = useState<"Prescription" | "Record">("Prescription");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [savingRecord, setSavingRecord] = useState(false);

  // Load patients list on mount
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await api.get('/patients');
        if (res.success && Array.isArray(res.patients) && res.patients.length > 0) {
          setPatients(res.patients);
          setSelectedPatientId(res.patients[0].id);
        }
      } catch (err) {
        console.warn("API patients load error", err);
      }
    }
    loadPatients();
  }, []);

  // Load records and prescriptions when patient changes
  async function loadPatientDetails() {
    if (!selectedPatientId) return;
    setLoading(true);
    setError(null);
    try {
      const recRes = await api.get(`/patients/${selectedPatientId}/records`);
      const prescRes = await api.get(`/patients/${selectedPatientId}/prescriptions`);
      
      if (recRes.success && Array.isArray(recRes.records)) {
        setMedicalRecords(recRes.records);
      }
      if (prescRes.success && Array.isArray(prescRes.prescriptions)) {
        setPrescriptions(prescRes.prescriptions);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load clinical records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatientDetails();
  }, [selectedPatientId]);

  const handleCreateRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSavingRecord(true);

    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      const patientName = selectedPatient ? selectedPatient.name : "Patient";

      if (addRecordType === "Prescription") {
        if (!medication.trim()) return;
        await api.post(`/patients/${selectedPatientId}/prescriptions`, {
          medication,
          dosage,
          instructions,
          patientName
        });
      } else {
        await api.post(`/patients/${selectedPatientId}/records`, {
          diagnosis: diagnosis || 'Clinical Consult',
          notes,
          patientName
        });
      }

      setIsAddRecordOpen(false);
      setMedication("");
      setDosage("");
      setInstructions("");
      setDiagnosis("");
      setNotes("");
      await loadPatientDetails();
    } catch (err: any) {
      console.error("Create Record/Prescription Error", err);
    } finally {
      setSavingRecord(false);
    }
  };

  // Combine records and prescriptions into unified timeline items
  const unifiedItems = [
    ...medicalRecords.map((r: any) => ({
      id: `rec-${r.id}`,
      patient: patients.find(p => p.id === selectedPatientId)?.name || "Selected Patient",
      date: r.record_date ? new Date(r.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
      type: "Consultation",
      diagnosis: r.diagnosis || "General Consultation",
      doctor: doctorName,
      notes: r.notes || r.treatment || "No notes recorded."
    })),
    ...prescriptions.map((p: any) => ({
      id: `presc-${p.id}`,
      patient: patients.find(p => p.id === selectedPatientId)?.name || "Selected Patient",
      date: p.prescribed_date ? new Date(p.prescribed_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
      type: "Prescription",
      diagnosis: p.medication || "Prescribed Item",
      doctor: doctorName,
      notes: `Dosage: ${p.dosage || 'N/A'}, Duration: ${p.duration || 'N/A'}. Instructions: ${p.instructions || 'N/A'}`
    }))
  ];

  const filteredItems = unifiedItems.filter((item) => {
    const matchesSearch = searchTerm.trim()
      ? [item.patient, item.diagnosis, item.type, item.notes]
        .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesType = recordTypeFilter === "all" || item.type.toLowerCase() === recordTypeFilter;
    return matchesSearch && matchesType;
  });

  const timeline = filteredItems.map(item => ({
    date: item.date,
    event: item.type === "Consultation" ? "Consultation Checkup" : "Prescription Issued",
    details: item.diagnosis
  }));

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Patient Records</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">View and manage medical records</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsAddRecordOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#163CC7] text-white hover:bg-blue-700 font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={18} />
            <span>Add Record / Prescription</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records by diagnosis or treatment notes..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/10"
            />
          </div>
          <select
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/10"
          >
            <option value="all">All Record Types</option>
            <option value="consultation">Consultations</option>
            <option value="prescription">Prescriptions</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredItems.map((record) => (
              <div key={record.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:border-[#163CC7]-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.type === 'Consultation' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-purple-50 dark:bg-purple-950/40'}`}>
                      {record.type === 'Consultation' ? <Activity className="text-blue-600 dark:text-blue-400" size={20} /> : <FileText className="text-purple-600 dark:text-purple-400" size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-800 dark:text-white font-bold text-base">{record.patient}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${record.type === 'Consultation' ? 'bg-blue-550/10 text-blue-600' : 'bg-purple-550/10 text-purple-600'}`}>
                          {record.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                        <Calendar size={14} />
                        <span>{record.date}</span>
                        <span>•</span>
                        <span>{record.doctor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-slate-800 dark:text-slate-200 font-black mb-2 text-sm">{record.diagnosis}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-semibold">{record.notes}</div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-12 text-center text-slate-500 dark:text-slate-400 font-bold">
                No clinical history recorded for this patient.
              </div>
            )}
          </div>

          {/* Timeline View */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-slate-800 dark:text-white font-bold mb-6 text-lg">Clinical Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-slate-400 text-xs font-bold text-center py-6">Empty timeline</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>
                    )}
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#163CC7] to-indigo-650 mt-1 relative z-10"></div>
                      <div className="flex-1 pb-4">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">{item.date}</div>
                        <div className="text-slate-800 dark:text-slate-250 font-bold text-xs mb-1">{item.event}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{item.details}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Record / Prescription Modal */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateRecordSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Add Patient Entry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issue prescription or add medical record for selected patient</p>
              </div>
              <button type="button" onClick={() => setIsAddRecordOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-800 dark:text-slate-300 transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Entry Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRecordType("Prescription")}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${addRecordType === "Prescription" ? "bg-[#163CC7] text-white border-[#163CC7]" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                  >
                    Prescription
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRecordType("Record")}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${addRecordType === "Record" ? "bg-[#163CC7] text-white border-[#163CC7]" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                  >
                    Medical Record
                  </button>
                </div>
              </div>

              {addRecordType === "Prescription" ? (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Medication Name *</label>
                    <input
                      type="text"
                      required
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      placeholder="e.g. Paracetamol 500mg"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 1 tab thrice daily"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Take after food for 3 days"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none h-20 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Diagnosis / Title</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Routine Consultation"
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Notes / Clinical Findings</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter clinical assessment and notes..."
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm outline-none h-24 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              type="submit"
              disabled={savingRecord}
              className="w-full mt-6 bg-[#163CC7] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 transition-all text-sm disabled:opacity-50"
            >
              {savingRecord ? "Saving..." : addRecordType === "Prescription" ? "Issue Prescription" : "Save Medical Record"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
