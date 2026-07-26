import { useState, useEffect } from "react";
import { Home, MapPin, Clock, Phone, CheckCircle, XCircle, Calendar, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export function HomeVisits() {
  const [requests, setRequests] = useState<any[]>([]);
  const [scheduledVisits, setScheduledVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeVisits() {
    setLoading(true);
    setError(null);
    try {
      // API expects type = Home
      const res = await api.get('/appointments?type=Home');
      if (res.success && Array.isArray(res.appointments)) {
        // Map list items
        const mapped = res.appointments.map((a: any) => ({
          id: a.id,
          patient: a.patient_name || a.patient || "Patient",
          age: a.patient_age || 65,
          address: a.address || "123 Patient Address",
          symptoms: a.condition || "General checkup required",
          requestedTime: a.appointment_date ? `${new Date(a.appointment_date).toLocaleDateString()} ${a.appointment_time || ''}` : "Today",
          distance: "3.2 km",
          priority: "Medium",
          phone: a.patient_phone || "+1 234-567-8900",
          notes: a.notes || "No extra instructions",
          status: a.status || "Scheduled"
        }));
        
        // Split into pending requests and confirmed visits
        setRequests(mapped.filter((a: any) => ['Scheduled', 'Waiting', 'Requested'].includes(a.status)));
        setScheduledVisits(mapped.filter((a: any) => ['Confirmed', 'En Route', 'In Progress'].includes(a.status)));
      }
    } catch (err: any) {
      console.error("API home visits fetch error", err);
      setError("Failed to load — please check your connection and try again.");
      setRequests([]);
      setScheduledVisits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeVisits();
  }, []);

  const handleUpdateStatus = async (id: number | string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      loadHomeVisits();
    } catch (err: any) {
      alert(err.message || "Failed to update home visit status");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">Home Visits</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and schedule home care visits</p>
        </div>
      </div>

      {loading && requests.length === 0 && scheduledVisits.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={loadHomeVisits} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-slate-800 dark:text-white font-black text-xl">Pending Requests</h3>
            {requests.length === 0 ? (
              <p className="text-slate-400 font-bold text-sm text-center py-6">No pending home visit requests.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((request) => (
                  <div key={request.id} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-md transition-all bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                          {request.patient.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-slate-850 dark:text-white font-black text-base">{request.patient}</div>
                          <div className="text-xs text-slate-400 font-bold">{request.age} years</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700">
                        {request.priority || "Medium"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-bold text-slate-500">
                      <div className="flex items-start gap-2">
                        <MapPin className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <div className="text-slate-700 dark:text-slate-350">{request.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-slate-400 flex-shrink-0" size={16} />
                        <div className="text-slate-700 dark:text-slate-350">{request.requestedTime}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="text-slate-400 flex-shrink-0" size={16} />
                        <div className="text-slate-700 dark:text-slate-350">{request.phone}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Symptoms</div>
                      <div className="text-slate-700 dark:text-slate-300 text-xs font-semibold">{request.symptoms}</div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(request.id, 'Confirmed')} className="flex-1 px-4 py-2.5 rounded-xl bg-[#163CC7] text-white hover:opacity-95 transition-colors flex items-center justify-center gap-2 text-xs font-bold">
                        <CheckCircle size={16} />
                        <span>Accept & Confirm</span>
                      </button>
                      <button onClick={() => handleUpdateStatus(request.id, 'Cancelled')} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed / Scheduled Visits */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-slate-800 dark:text-white font-black text-xl">Scheduled / Active Visits</h3>
            {scheduledVisits.length === 0 ? (
              <p className="text-slate-400 font-bold text-sm text-center py-6">No scheduled home visits for today.</p>
            ) : (
              <div className="space-y-3">
                {scheduledVisits.map((visit) => (
                  <div key={visit.id} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white">
                      <Home size={20} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-slate-850 dark:text-white font-black text-sm">{visit.patient}</div>
                      <div className="text-xs text-slate-400 font-bold">{visit.address}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-500">{visit.requestedTime}</div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                      {visit.status}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(visit.id, 'Completed')} className="px-4 py-2 rounded-xl bg-green-650 hover:bg-green-700 text-white text-xs font-bold transition-all">
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
