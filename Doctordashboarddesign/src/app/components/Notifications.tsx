import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  Reply, 
  Calendar, 
  MessageSquare, 
  ClipboardCheck, 
  AlertCircle,
  Eye,
  Trash2
} from "lucide-react";
import { api } from "../lib/api";

export function Notifications() {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      if (res.success && Array.isArray(res.notifications)) {
        const mapped = res.notifications.map((n: any) => ({
          id: n.id,
          title: n.title || "Notification",
          body: n.message || "",
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
          type: n.type === 'Appointment' ? 'success' : n.type === 'Message' ? 'info' : 'warning',
          patient: n.title.includes("for") ? n.title.split("for")[1].trim() : "Patient",
          category: n.type || "System",
          is_read: n.is_read
        }));
        setNotifications(mapped);
      }
    } catch (err: any) {
      console.error("API notifications load error", err);
      setError("Failed to load — please check your connection and try again.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSelect = async (id: number | string) => {
    setSelectedId(selectedId === id ? null : id);
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.warn("Failed to mark notification read", err);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <Bell size={28} className="text-[#163CC7]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Notifications</h1>
        </div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
          {notifications.filter(n => !n.is_read).length} New Alerts
        </div>
      </div>

      {error && notifications.length === 0 ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={loadNotifications} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">
            Retry
          </button>
        </div>
      ) : loading && notifications.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((item) => (
            <div key={item.id} className="group transition-all duration-300">
              <div
                onClick={() => handleSelect(item.id)}
                className={`flex flex-wrap items-center justify-between p-5 bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-sm
                  ${selectedId === item.id ? "rounded-t-3xl border-[#163CC7] ring-1 ring-[#163CC7]/20" : "rounded-[2rem] border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:shadow-md"}
                  ${item.is_read ? 'opacity-75' : 'font-bold'}`}
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 
                    ${item.type === 'success' ? 'bg-green-50 text-green-600' : 
                      item.type === 'info' ? 'bg-blue-50 text-blue-600' : 
                      item.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {item.category === "Appointment" && <Calendar size={22} />}
                    {item.category === "Inbox" && <MessageSquare size={22} />}
                    {item.category === "Review" && <ClipboardCheck size={22} />}
                    {item.category === "Urgent" && <AlertCircle size={22} />}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{item.title}</p>
                      <span className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full 
                        ${item.type === 'success' ? 'bg-green-100 text-green-700' : 
                          item.type === 'info' ? 'bg-blue-100 text-[#163CC7]' : 
                          item.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.body}</p>
                  </div>

                  <div className="hidden lg:block border-l border-slate-100 px-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.patient}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{item.time}</span>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-xl transition-colors ${selectedId === item.id ? 'bg-[#163CC7] text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {selectedId === item.id && (
                <div className="bg-slate-50/50 dark:bg-slate-800/30 border-x border-b border-[#163CC7]/20 rounded-b-3xl p-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-6">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <label className="block text-[10px] font-black text-[#163CC7] uppercase tracking-[0.2em] mb-3">Quick Response to {item.patient}</label>
                      <div className="flex gap-3">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type clinical instructions or response..." 
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#163CC7]/20 outline-none resize-none h-24"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                           <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Mark as Resolved</button>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setSelectedId(null)}
                            className="flex items-center gap-2 px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all"
                          >
                            <X size={18} /> Close
                          </button>
                          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#163CC7] text-white font-bold text-sm rounded-xl hover:shadow-lg shadow-blue-500/20 transition-all">
                            <Reply size={18} /> Send Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}