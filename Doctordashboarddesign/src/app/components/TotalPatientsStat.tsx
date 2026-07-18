import { useState } from "react";
import { Search, Filter, Users, Calendar, Clock, User, ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router";

export function TotalPatientsStat() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const patients = [
    { id: 1, patientName: "Alice Johnson", age: 34, gender: "Female", lastVisit: "May 10, 2026", condition: "Routine Checkup", status: "Active", notes: "Patient is healthy. Next checkup in 12 months." },
    { id: 2, patientName: "Robert Taylor", age: 52, gender: "Male", lastVisit: "May 12, 2026", condition: "Hypertension", status: "Active", notes: "Blood pressure is well controlled with medication." },
    { id: 3, patientName: "Maria Garcia", age: 29, gender: "Female", lastVisit: "May 15, 2026", condition: "Pregnancy", status: "Active", notes: "Second trimester going smoothly. Prescribed vitamins." },
    { id: 4, patientName: "David Lee", age: 45, gender: "Male", lastVisit: "May 01, 2026", condition: "Diabetes Type 2", status: "Active", notes: "Needs to improve diet. Scheduled nutritional counseling." },
    { id: 5, patientName: "Sarah Connor", age: 61, gender: "Female", lastVisit: "Apr 28, 2026", condition: "Arthritis", status: "Active", notes: "Joint pain managed. Recommended physical therapy." },
  ];

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
    <div className="max-w-[1400px] mx-auto space-y-6">
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
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Patient Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Age / Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Last Visit</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedPatient === patient.id 
                        ? "bg-blue-50 dark:bg-blue-900/10" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                          {patient.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-slate-800 dark:text-white font-medium">{patient.patientName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 dark:text-white text-sm">{patient.age} yrs</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{patient.lastVisit}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{patient.condition}</span>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                  {selectedPatientData.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedPatientData.patientName}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <User size={14} /> {selectedPatientData.age} years old
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar size={14} /> Last Visit
                  </div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedPatientData.lastVisit}</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Condition</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedPatientData.condition}</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                    <FileText size={16} /> Patient Summary
                  </div>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                    {selectedPatientData.notes}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2 font-medium">
                  <FileText size={18} />
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
