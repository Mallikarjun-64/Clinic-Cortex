import { useMemo, useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Phone, Video, MoreHorizontal, 
  Paperclip, Mic, Smile, PhoneOff, Maximize2, Settings, Languages, X, AlertCircle
} from "lucide-react";
import { api } from "../lib/api";

type Message = {
  id: number | string;
  sender: "patient" | "doctor";
  text: string;
  time: string;
};

export function Inbox() {
  const [activeId, setActiveId] = useState<number | string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load threads
  async function loadThreads(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/messages/threads');
      if (res.success && Array.isArray(res.threads)) {
        const mapped = res.threads.map((t: any) => ({
          id: t.id,
          name: t.patient_name || "Patient",
          last: t.last_message || "Start of conversation",
          time: t.last_message_at ? new Date(t.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "09:00 AM",
          online: true,
          avatar: `https://i.pravatar.cc/150?img=${Math.abs(t.id.toString().charCodeAt(0) || 12) % 70}`
        }));
        setThreads(mapped);
        
        // Auto-select first thread if none is selected
        if (mapped.length > 0 && activeId === null) {
          setActiveId(mapped[0].id);
        }
      }
    } catch (err: any) {
      console.warn("API threads load warning", err);
      // Mock fallback
      const mockThreads = [
        { id: 1, name: "John Smith", last: "Looking for medication update", time: "09:00 AM", online: true, avatar: "https://i.pravatar.cc/150?img=12" },
        { id: 2, name: "Emma Wilson", last: "Can we move appointment?", time: "10:30 AM", online: false, avatar: "https://i.pravatar.cc/150?img=32" },
        { id: 3, name: "Michael Brown", last: "Need lab results explanation", time: "11:00 AM", online: true, avatar: "https://i.pravatar.cc/150?img=45" }
      ];
      setThreads(mockThreads);
      if (activeId === null) {
        setActiveId(mockThreads[0].id);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Load messages for active thread
  async function loadMessages(threadId: number | string, silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/messages/threads/${threadId}`);
      if (res.success && Array.isArray(res.messages)) {
        const mapped = res.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender_type === 'doctor' ? ('doctor' as const) : ('patient' as const),
          text: m.content || "",
          time: m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "09:00 AM"
        }));
        setActiveMessages(mapped);
      }
    } catch (err) {
      console.warn("API messages fetch warning, using fallback mock", err);
      const fallbackMock: Record<string | number, Message[]> = {
        1: [
          { id: 1, sender: "patient", text: "Hi Doctor, can I get a quick medication update?", time: "08:58 AM" },
          { id: 2, sender: "doctor", text: "Sure John, your meds are stable; continue as prescribed.", time: "08:59 AM" },
        ],
        2: [
          { id: 1, sender: "patient", text: "I need to move my 10:30 appointment to 11:30.", time: "10:05 AM" },
          { id: 2, sender: "doctor", text: "Yes, I can move you to 11:30. Please confirm.", time: "10:07 AM" },
        ],
        3: [
          { id: 1, sender: "patient", text: "Can you explain my lab results?", time: "10:58 AM" },
          { id: 2, sender: "doctor", text: "Your kidney function is good and cholesterol is lowering.", time: "11:01 AM" },
        ],
      };
      setActiveMessages(fallbackMock[threadId] || []);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Run on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Run when active thread changes + setup polling interval
  useEffect(() => {
    if (activeId === null) return;
    loadMessages(activeId, false);

    const interval = setInterval(() => {
      loadMessages(activeId, true);
      loadThreads(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeId]);

  const activeThread = useMemo(() => threads.find((t) => t.id === activeId), [activeId, threads]);

  const sendMessage = async () => {
    if (!draftMessage.trim() || activeId === null) return;
    const content = draftMessage.trim();
    
    // Optimistic UI updates
    const localNewMessage: Message = {
      id: Date.now().toString(),
      sender: "doctor",
      text: content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setActiveMessages(prev => [...prev, localNewMessage]);
    setDraftMessage("");

    try {
      await api.post(`/messages/threads/${activeId}`, {
        content,
        senderType: "doctor"
      });
      // Fetch fresh threads and messages
      loadMessages(activeId, true);
      loadThreads(true);
    } catch (err) {
      console.error("Failed to send API message", err);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-[calc(100vh-120px)]">
      
      {/* Sidebar - Contacts */}
      <aside className="col-span-3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
        <div className="p-6">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white mb-6">
            <MessageSquare size={22} className="text-[#163CC7]" />
            <h2 className="text-xl font-bold">Chat</h2>
          </div>
          <input type="text" placeholder="Search Contact..." className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#163CC7]/20" />
        </div>
        
        {loading && threads.length === 0 ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#163CC7]" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {threads.map((thread) => (
              <button key={thread.id} onClick={() => setActiveId(thread.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeId === thread.id ? "bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"}`}>
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                  <img src={thread.avatar} alt={`${thread.name} avatar`} className="w-full h-full object-cover" />
                  {thread.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{thread.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{thread.time}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{thread.last}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <section className={`${activeCall ? "col-span-5" : "col-span-9"} flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300`}>
        {activeThread ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={activeThread?.avatar} alt={`${activeThread?.name} avatar`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">{activeThread?.name}</h2>
                  <span className="text-[10px] text-green-500 font-bold">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                <Phone size={18} className="hover:text-[#163CC7] cursor-pointer" onClick={() => setActiveCall("audio")} />
                <Video size={18} className="hover:text-[#163CC7] cursor-pointer" onClick={() => setActiveCall("video")} />
                <MoreHorizontal size={18} className="hover:text-[#163CC7] cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%]">
                    <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.sender === "doctor" ? "bg-[#163CC7] text-white rounded-tr-none font-bold" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-250 border border-slate-100 dark:border-slate-800 rounded-tl-none font-semibold"}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] mt-1.5 text-slate-400 dark:text-slate-500 ${msg.sender === "doctor" ? "text-right" : "text-left"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 px-4 border border-slate-200/50 dark:border-slate-700">
                <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600"><Smile size={20}/></button>
                <input type="text" value={draftMessage} onChange={(e) => setDraftMessage(e.target.value)} placeholder="Type a message here..." className="flex-1 bg-transparent border-none py-2 text-sm outline-none text-slate-700 dark:text-white" onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                <div className="flex items-center gap-3 pr-2 border-r border-slate-350 dark:border-slate-700 mr-2">
                  <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600"><Paperclip size={18}/></button>
                  <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600"><Mic size={18}/></button>
                </div>
                <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-[#163CC7] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-2" />
            <p className="font-bold text-sm">Select a thread to start messaging</p>
          </div>
        )}
      </section>

      {/* Call Sidebar */}
      {activeCall && (
        <aside className="col-span-4 bg-[#F8FAFC] dark:bg-slate-950 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-slate-800 dark:text-white capitalize">{activeCall} Call</h3>
            <button onClick={() => setActiveCall(null)} className="text-slate-400 dark:text-slate-500 hover:text-destructive transition-colors"><X size={20}/></button>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
            {activeCall === "video" ? (
              <div className="w-full h-full space-y-4">
                {/* Doctor View */}
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-300 dark:bg-slate-850 shadow-lg border border-slate-200 dark:border-slate-800">
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Dr. R Choudry
                  </div>
                </div>
                {/* Patient View */}
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-400 dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-850">
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold dark:text-white">Patient</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 border-8 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img src={activeThread?.avatar} className="w-full h-full object-cover" />
                </div>
                <h4 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{activeThread?.name}</h4>
                <p className="text-slate-400 dark:text-slate-550 text-sm animate-pulse mt-2">calling.....</p>
              </div>
            )}

            {/* Floating Call Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 rounded-full p-2 flex items-center gap-3 shadow-2xl">
              <button className="w-10 h-10 rounded-full bg-[#163CC7] text-white flex items-center justify-center hover:scale-115 transition-transform" onClick={() => setActiveCall(null)}><PhoneOff size={18}/></button>
            </div>
          </div>
        </aside>
      )}  
    </div>
  );
}