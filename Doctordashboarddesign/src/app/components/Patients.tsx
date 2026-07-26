import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, UserPlus, Phone, Mail, MapPin, Calendar, FileText, Activity } from "lucide-react";
import { api } from "../lib/api";

export function Patients() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<number | string | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");

  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    async function loadPatients() {
      try {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (conditionFilter && conditionFilter !== 'all') queryParams.append('condition', conditionFilter);

        const res = await api.get(`/patients?${queryParams.toString()}`);
        if (res.success && Array.isArray(res.patients) && res.patients.length > 0) {
          const mapped = res.patients.map((p: any) => ({
            id: p.id,
            name: p.name,
            age: p.age || 30,
            gender: p.gender || "Male",
            lastVisit: p.last_visit ? new Date(p.last_visit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 2, 2026",
            condition: p.condition || "General",
            phone: p.phone || "+1 234-567-8900",
            email: p.email || "patient@clinic.com",
            address: p.address || "Main Street"
          }));
          setPatients(mapped);
          if (mapped.length > 0) {
            setSelectedPatient(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn("API patients fetch warning", err);
      }
    }
    loadPatients();
  }, [searchTerm, conditionFilter]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = searchTerm.trim()
      ? [patient.name, patient.condition, patient.gender, patient.phone, patient.email]
        .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesCondition = conditionFilter === "all" || patient.condition.toLowerCase().includes(conditionFilter);
    return matchesSearch && matchesCondition;
  });

  const selectedPatientData = filteredPatients.find((p) => p.id === selectedPatient) || null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 dark:text-white mb-1">Patients</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage patient records and information</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center gap-2">
          <UserPlus size={20} />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name, ID, or condition..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 dark:focus:ring-[#4F6FE5] focus:border-transparent text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 dark:focus:ring-[#4F6FE5] focus:border-transparent text-slate-800 dark:text-white"
          >
            <option value="all">All Conditions</option>
            <option value="hypertension">Hypertension</option>
            <option value="diabetes">Diabetes</option>
            <option value="asthma">Asthma</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Patient Name</th>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Age</th>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Gender</th>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Last Visit</th>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Condition</th>
                  <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`cursor-pointer transition-colors ${selectedPatient === patient.id ? "bg-blue-50/50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700">
                          {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="text-slate-800 dark:text-white font-semibold">{patient.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{patient.age}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{patient.gender}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{patient.lastVisit}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#163CC7] dark:text-[#4F6FE5] hover:bg-blue-100 dark:hover:bg-blue-950/60 font-semibold transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
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
            {/* Patient Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#163CC7]-500 to-[#4F6FE5]-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedPatientData.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-white font-bold">{selectedPatientData.name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Patient ID: PT-2024-{selectedPatientData.id.toString().padStart(4, '0')}</div>
                </div>
              </div>

              <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-slate-400 dark:text-slate-500" size={16} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedPatientData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="text-slate-400 dark:text-slate-500" size={16} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedPatientData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-slate-400 dark:text-slate-500" size={16} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedPatientData.address}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Age</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedPatientData.age} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Gender</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedPatientData.gender}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Last Visit</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedPatientData.lastVisit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Condition</span>
                  <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    {selectedPatientData.condition}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button 
                  onClick={() => navigate('/dashboard/appointments')}
                  className="w-full px-4 py-2 rounded-lg bg-[#163CC7] hover:bg-blue-700 text-white transition-colors font-bold text-sm"
                >
                  Book Appointment
                </button>
                <button 
                  onClick={() => navigate('/dashboard/patient-records')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
                >
                  View Full Records
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h4 className="text-slate-800 dark:text-white font-bold mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Visits</div>
                    <div className="text-slate-800 dark:text-white font-bold">24</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <FileText className="text-green-600 dark:text-emerald-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prescriptions</div>
                    <div className="text-slate-800 dark:text-white font-bold">8</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <Activity className="text-amber-600 dark:text-amber-400" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lab Reports</div>
                    <div className="text-slate-800 dark:text-white font-bold">12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
