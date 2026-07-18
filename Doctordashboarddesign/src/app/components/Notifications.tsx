import { useState } from "react";
import { 
  Bell, 
  X, 
  Reply, 
  Calendar, 
  MessageSquare, 
  ClipboardCheck, 
  AlertCircle,
  Eye
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
  type: "success" | "info" | "warning" | "danger";
  patient: string;
  category: string;
}

const notifications: Notification[] = [
  { id: 1, title: "Appointment Confirmed", body: "Consultation for John Smith at 09:00 AM is confirmed.", time: "5m ago", type: "success", patient: "John Smith", category: "Appointment" },
  { id: 2, title: "New Message", body: "Emma Wilson sent a message regarding her recent prescription.", time: "12m ago", type: "info", patient: "Emma Wilson", category: "Inbox" },
  { id: 3, title: "Prescription Review", body: "Dr. Lee requested a secondary review for Maria Garcia's medication.", time: "30m ago", type: "warning", patient: "Maria Garcia", category: "Review" },
  { id: 4, title: "Overdue Follow-up", body: "James Miller has missed his post-surgery follow-up by 2 days.", time: "1h ago", type: "danger", patient: "James Miller", category: "Urgent" },
];

export function Notifications() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const activeNotification = notifications.find(n => n.id === selectedId);

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
          {notifications.length} New Alerts
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((item) => (
          <div key={item.id} className="group transition-all duration-300">
            {/* Main List Item - Reference Design Style */}
            <div
              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
              className={`flex flex-wrap items-center justify-between p-5 bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-sm
                ${selectedId === item.id ? "rounded-t-3xl border-[#163CC7] ring-1 ring-[#163CC7]/20" : "rounded-[2rem] border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:shadow-md"}`}
            >
              <div className="flex items-center gap-6 flex-1">
                {/* Dynamic Icon based on type */}
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

                {/* Patient metadata */}
                <div className="hidden lg:block border-l border-slate-100 px-8">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.patient}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{item.time}</span>
                <button className={`p-2 rounded-xl transition-colors ${selectedId === item.id ? 'bg-[#163CC7] text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                  <Eye size={20} />
                </button>
              </div>
            </div>

            {/* EXPANDED INTERACTIVE CARD - Medical Context */}
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
                         <button className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Mark as Resolved</button>
                         <button className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">Forward to Lab</button>
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
    </div>
  );
}