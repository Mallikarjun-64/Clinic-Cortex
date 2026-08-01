import { useState, useEffect } from "react";
import { Search, Filter, Users, Calendar, Clock, User, ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

export function TotalPatientsStat() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPatients() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/patients/my-patients');
      if (res.success && Array.isArray(res.patients)) {
        const mapped = res.patients.map((p: any) => ({
          id: p.id,
          patientName: p.name,
          age: p.age || 30,
          gender: p.gender || "Male",
          lastVisit: p.last_visit ? new Date(p.last_visit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
          condition: p.condition || "General Consultation",
          status: "Active",
          notes: p.notes || "No extra medical alert summary logged."
        }));
        setPatients(mapped);
        if (mapped.length > 0) {
          setSelectedPatient(mapped[0].id);
        }
      }
    } catch (err: any) {
      console.error("API load patients error in Stats", err);
      setError("Failed to load — please check your connection and try again.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = searchTerm.trim()
      ? [patient.patientName, patient.condition, patient.gender]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesStatus = statusFilter === "all" || patient.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedPatientData = filteredPatients.find((p) => p.id === selectedPatient) || null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-8">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
            <Users className="text-blue-500" size={24} />
            Total Patients
          </h1>
          <p className="text-slate-600 dark:text-slate-400">View and manage all registered patients</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name or condition..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && patients.length === 0 ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={loadPatients} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">
            Retry
          </button>
        </div>
      ) : loading && patients.length === 0 ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-850">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Patient Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Age / Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Last Visit</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedPatient === patient.id 
                          ? "bg-blue-50/50 dark:bg-blue-950/20" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-350 font-bold">
                            {patient.patientName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="text-slate-800 dark:text-white font-bold">{patient.patientName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 dark:text-white text-sm font-bold">{patient.age} yrs</div>
                        <div className="text-xs text-slate-400 font-semibold">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-bold">{patient.lastVisit}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold line-clamp-1">{patient.condition}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-bold">
                        No patients found matching "{searchTerm.trim()}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient Details Panel */}
          {selectedPatientData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-850 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedPatientData.patientName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{selectedPatientData.patientName}</h3>
                    <div className="text-sm text-slate-400 flex items-center gap-2 mt-1 font-bold">
                      <User size={14} /> {selectedPatientData.age} years old
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-bold">
                      <Calendar size={14} /> Last Visit
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{selectedPatientData.lastVisit}</div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1 font-bold">Condition</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{selectedPatientData.condition}</div>
                  </div>
                  
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-black text-blue-800 dark:text-blue-450 mb-2">
                      <FileText size={16} /> Patient Summary
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-350 leading-relaxed font-semibold">
                      {selectedPatientData.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
