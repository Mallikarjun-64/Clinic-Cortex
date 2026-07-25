import { useState, useEffect } from "react";
import { Search, Filter, Clock, AlertCircle, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

export function PendingRequestsStat() {
  const navigate = useNavigate();
  const [selectedReq, setSelectedReq] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPendingRequests() {
    setLoading(true);
    try {
      const res = await api.get('/consultations');
      if (res.success && Array.isArray(res.requests)) {
        const mapped = res.requests.map((r: any) => ({
          id: r.id,
          patientName: r.patient_name || "Patient",
          requestTime: r.request_time || "Just now",
          type: r.request_type || "Virtual Consult",
          urgency: r.priority || "Medium",
          notes: r.notes || "Wants consultation slot approved."
        }));
        setRequests(mapped);
        if (mapped.length > 0) {
          setSelectedReq(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn("API load consultation requests warning, using mock fallback", err);
      const mockReqs = [
        { id: "e6d5e744-42b7-4a0b-8d76-bc34407b8b23", patientName: "Ethan Hunt", requestTime: "10 mins ago", type: "Prescription Refill", urgency: "High", notes: "Out of Lisinopril. Need refill ASAP." },
        { id: "e6d5e744-42b7-4a0b-8d76-bc34407b8b24", patientName: "Olivia Brown", requestTime: "1 hour ago", type: "Virtual Consult", urgency: "Medium", notes: "Requesting a quick chat about recent lab results." }
      ];
      setRequests(mockReqs);
      setSelectedReq(mockReqs[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleAccept = async (id: number | string) => {
    try {
      await api.patch(`/consultations/${id}/accept`, {});
      alert("Consultation request accepted!");
      loadPendingRequests();
    } catch (err: any) {
      alert(err.message || "Failed to accept consultation request");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = searchTerm.trim()
      ? [req.patientName, req.type, req.notes, req.urgency]
          .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesUrgency = urgencyFilter === "all" || req.urgency.toLowerCase() === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const selectedReqData = filteredRequests.find((r) => r.id === selectedReq) || null;

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
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading && requests.length === 0 ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedReq(req.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedReq === req.id ? "bg-blue-50/50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{req.patientName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-650 dark:text-slate-350">{req.type}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">{req.requestTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          req.urgency === 'High' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">
                        No pending requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details */}
          {selectedReqData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850 p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-black text-slate-850 dark:text-white border-b pb-2">Request Details</h3>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient</label>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedReqData.patientName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Requested Action</label>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedReqData.type}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Details / Note</label>
                  <p className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs font-semibold text-slate-650 dark:text-slate-350 leading-relaxed italic">
                    "{selectedReqData.notes}"
                  </p>
                </div>
                <div className="pt-4 flex gap-2">
                  <button onClick={() => handleAccept(selectedReqData.id)} className="flex-1 px-4 py-2.5 rounded-xl bg-[#163CC7] text-white hover:opacity-95 transition-colors flex justify-center items-center gap-2 font-bold text-xs shadow-md shadow-blue-500/20">
                    <CheckCircle2 size={16} />
                    <span>Approve Request</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
