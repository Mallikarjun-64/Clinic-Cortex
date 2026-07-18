import { useState } from "react";
import { Search, Filter, Calendar, Clock, User, ArrowLeft, FileText, UserCheck } from "lucide-react";
import { useNavigate } from "react-router";

export function TodayAppointmentsStat() {
  const navigate = useNavigate();
  const [selectedApt, setSelectedApt] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const appointments = [
    { id: 1, patientName: "William Turner", time: "09:00 AM", type: "Virtual", condition: "Dermatology Consult", status: "Upcoming", notes: "Review skin rash progression." },
    { id: 2, patientName: "Sophia Martinez", time: "10:30 AM", type: "In-Person", condition: "Pediatric Checkup", status: "Upcoming", notes: "Annual physical for school." },
    { id: 3, patientName: "Liam Johnson", time: "01:00 PM", type: "Virtual", condition: "Therapy Session", status: "Upcoming", notes: "Weekly CBT session." },
    { id: 4, patientName: "Isabella Davis", time: "03:15 PM", type: "In-Person", condition: "Orthopedic Eval", status: "Upcoming", notes: "Post-surgery knee evaluation." },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = searchTerm.trim()
      ? [apt.patientName, apt.condition, apt.type, apt.status]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesType = typeFilter === "all" || apt.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  const selectedAptData = filteredAppointments.find((a) => a.id === selectedApt) || null;

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
            <Calendar className="text-indigo-500" size={24} />
            Today's Appointments
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your schedule for the day</p>
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
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="virtual">Virtual</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appt List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelectedApt(apt.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedApt === apt.id 
                        ? "bg-indigo-50 dark:bg-indigo-900/10" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                          {apt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-slate-800 dark:text-white font-medium">{apt.patientName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                        <Clock size={14} className="text-slate-400"/> {apt.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{apt.type}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{apt.condition}</span>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      No appointments found matching "{searchTerm.trim()}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appt Details Panel */}
        {selectedAptData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
                  {selectedAptData.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedAptData.patientName}</h3>
                  <div className="text-sm text-indigo-500 flex items-center gap-2 mt-1 font-medium">
                    <Clock size={14} /> {selectedAptData.time}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedAptData.type}</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason for Visit</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedAptData.condition}</div>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-indigo-400 mb-2">
                    <FileText size={16} /> Preparatory Notes
                  </div>
                  <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                    {selectedAptData.notes}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md shadow-indigo-500/20 flex justify-center items-center gap-2 font-medium">
                  <UserCheck size={18} />
                  Start Consultation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
