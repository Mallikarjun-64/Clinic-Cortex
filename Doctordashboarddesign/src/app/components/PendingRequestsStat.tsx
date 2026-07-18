import { useState } from "react";
import { Search, Filter, Clock, AlertCircle, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { addTopAppointment, createAppointmentFromRequest, RequestItem } from "../lib/appointmentData";

export function PendingRequestsStat() {
  const navigate = useNavigate();
  const [selectedReq, setSelectedReq] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const requests: RequestItem[] = [
    { id: 1, patientName: "Ethan Hunt", requestTime: "10 mins ago", type: "Prescription Refill", urgency: "High", notes: "Out of Lisinopril. Need refill ASAP." },
    { id: 2, patientName: "Olivia Brown", requestTime: "1 hour ago", type: "Virtual Consult", urgency: "Medium", notes: "Requesting a quick chat about recent lab results." },
    { id: 3, patientName: "Noah Wilson", requestTime: "3 hours ago", type: "Appointment Change", urgency: "Low", notes: "Wants to reschedule tomorrow's appointment to next week." },
    { id: 4, patientName: "Ava Jones", requestTime: "5 hours ago", type: "Medical Record Request", urgency: "Low", notes: "Needs immunization records for school." },
  ];

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = searchTerm.trim()
      ? [req.patientName, req.type, req.notes, req.urgency]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesUrgency = urgencyFilter === "all" || req.urgency.toLowerCase() === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const selectedReqData = filteredRequests.find((r) => r.id === selectedReq) || filteredRequests[0] || null;

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
            <Clock className="text-orange-500" size={24} />
            Pending Requests
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Review and approve patient requests</p>
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
              placeholder="Search by patient name or request type..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all"
            />
          </div>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-slate-800 dark:text-white transition-all"
          >
            <option value="all">All Urgencies</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedReq(req.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedReq === req.id 
                        ? "bg-orange-50 dark:bg-orange-900/10" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                          {req.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-slate-800 dark:text-white font-medium">{req.patientName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-400">{req.requestTime}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{req.type}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        req.urgency === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                        req.urgency === 'Medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      No requests found matching "{searchTerm.trim()}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Details Panel */}
        {selectedReqData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/20">
                  {selectedReqData.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedReqData.patientName}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={14} /> Requested {selectedReqData.requestTime}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Request Type</div>
                  <div className="text-sm font-medium text-slate-800 dark:text-white">{selectedReqData.type}</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">
                    <FileText size={16} /> Request Notes
                  </div>
                  <p className="text-sm text-orange-700/80 dark:text-orange-300/80 leading-relaxed">
                    {selectedReqData.notes}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                onClick={() => {
                  if (!selectedReqData) return;
                  addTopAppointment(createAppointmentFromRequest(selectedReqData));
                  navigate("/dashboard/appointments");
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/20 flex justify-center items-center gap-2 font-medium"
              >
                  <CheckCircle2 size={18} />
                  Approve Request
                </button>
                <button className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex justify-center items-center gap-2 font-medium">
                  <AlertCircle size={18} />
                  Decline / Contact Patient
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
