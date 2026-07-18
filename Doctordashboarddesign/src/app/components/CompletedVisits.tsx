import { useState } from "react";
import { Search, Filter, CheckCircle, Calendar, Clock, User, Activity, ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { getDoctorDisplayName } from "../lib/doctorProfile";
import { Appointment, loadAppointments } from "../lib/appointmentData";

export function CompletedVisits() {
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const doctorName = getDoctorDisplayName();

  const loadedAppointments = loadAppointments();
  const completedVisits = loadedAppointments
    .filter((apt) => apt.status === "Completed")
    .map((apt) => ({
      id: apt.id,
      patientName: apt.patient,
      age: apt.age,
      date: apt.date,
      time: apt.time,
      type: apt.type === "Video" ? "Virtual" : apt.type === "Clinic" ? "In-Person" : apt.type,
      condition: apt.condition,
      doctor: doctorName,
      status: apt.status,
      notes: `Completed appointment for ${apt.condition}.`,
    }));

  const defaultCompletedVisits = [
    { id: 1, patientName: "John Smith", age: 45, date: "May 19, 2026", time: "09:00 AM", type: "In-Person", condition: "Hypertension Follow-up", doctor: doctorName, status: "Completed", notes: "Blood pressure stable. Continued current medication." },
    { id: 2, patientName: "Emma Wilson", age: 32, date: "May 19, 2026", time: "10:30 AM", type: "Virtual", condition: "Diabetes Type 2", doctor: doctorName, status: "Completed", notes: "Reviewed recent blood sugar logs. Adjusted insulin dosage." },
    { id: 3, patientName: "Michael Brown", age: 58, date: "May 18, 2026", time: "02:15 PM", type: "In-Person", condition: "Asthma Assessment", doctor: doctorName, status: "Completed", notes: "Prescribed new inhaler. Scheduled follow-up in 3 months." },
    { id: 4, patientName: "Sarah Davis", age: 41, date: "May 18, 2026", time: "04:00 PM", type: "Virtual", condition: "Migraine Consultation", doctor: doctorName, status: "Completed", notes: "Discussed trigger factors. Recommended lifestyle changes." },
    { id: 5, patientName: "James Miller", age: 36, date: "May 17, 2026", time: "11:00 AM", type: "In-Person", condition: "Annual Physical", doctor: doctorName, status: "Completed", notes: "All vitals normal. Ordered routine blood work." },
  ];

  const displayedVisits = completedVisits.length > 0 ? completedVisits : defaultCompletedVisits;

  const filteredVisits = displayedVisits.filter((visit) => {
    const matchesSearch = searchTerm.trim()
      ? [visit.patientName, visit.condition, visit.type, visit.status]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesDate = dateFilter === "all" || visit.date.toLowerCase().includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const selectedVisitData = filteredVisits.find((v) => v.id === selectedVisit) || null;

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
            <Activity className="text-green-500" size={24} />
            Completed Visits
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Review past patient consultations and visit history</p>
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-500/50 focus:border-green-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Dates</option>
            <option value="may 19">May 19</option>
            <option value="may 18">May 18</option>
            <option value="may 17">May 17</option>
            <option value="april">April</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visit List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Condition</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    onClick={() => setSelectedVisit(visit.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedVisit === visit.id 
                        ? "bg-green-50 dark:bg-green-900/10" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                          {visit.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-slate-800 dark:text-white font-medium">{visit.patientName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{visit.age} years</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 dark:text-white text-sm">{visit.date}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {visit.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{visit.type}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{visit.condition}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs w-fit">
                        <CheckCircle size={14} />
                        <span>Completed</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVisits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      No completed visits found for "{searchTerm.trim()}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visit Details Panel */}
        {selectedVisitData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-green-500/20">
                  {selectedVisitData.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedVisitData.patientName}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <User size={14} /> {selectedVisitData.age} years old
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar size={14} /> Date
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedVisitData.date}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Clock size={14} /> Time
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedVisitData.time}</div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Condition/Reason</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedVisitData.condition}</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                    <FileText size={16} /> Doctor's Notes
                  </div>
                  <p className="text-sm text-green-700/80 dark:text-green-300/80 leading-relaxed">
                    {selectedVisitData.notes}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-md shadow-green-500/20 flex justify-center items-center gap-2 font-medium">
                  <FileText size={18} />
                  View Full Medical Record
                </button>
                <button className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex justify-center items-center gap-2 font-medium">
                  <Download size={18} />
                  Download Visit Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
