import { useMemo, useState } from "react";
import { 
  MessageSquare, Send, Phone, Video, MoreHorizontal, 
  Paperclip, Mic, Smile, MicOff, VideoOff, PhoneOff, 
  Maximize2, Settings, Languages, X 
} from "lucide-react";

const threads = [
  { id: 1, name: "John Smith", last: "Looking for medication update", time: "09:00 AM", online: true, avatar: "https://i.pravatar.cc/150?img=12" },
  { id: 2, name: "Emma Wilson", last: "Can we move appointment?", time: "10:30 AM", online: false, avatar: "https://i.pravatar.cc/150?img=32" },
  { id: 3, name: "Michael Brown", last: "Need lab results explanation", time: "11:00 AM", online: true, avatar: "https://i.pravatar.cc/150?img=45" },
];

type Message = {
  id: number;
  sender: "patient" | "doctor";
  text: string;
  time: string;
};

const messages: Record<number, Message[]> = {
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

export function Inbox() {
  const [activeId, setActiveId] = useState(1);
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [threadMessages, setThreadMessages] = useState(messages);

  const activeThread = useMemo(() => threads.find((t) => t.id === activeId), [activeId]);
  const activeMessages = useMemo(() => threadMessages[activeId] || [], [activeId, threadMessages]);

  const sendMessage = () => {
    if (!draftMessage.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: "doctor",
      text: draftMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setThreadMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMessage],
    }));
    setDraftMessage("");
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
      </aside>

      {/* Main Chat Area */}
      <section className={`${activeCall ? "col-span-5" : "col-span-9"} flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300`}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img src={activeThread?.avatar} alt={`${activeThread?.name} avatar`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">{activeThread?.name}</h2>
              <span className="text-xs text-green-500 font-medium">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <Phone size={20} className="hover:text-[#163CC7] dark:hover:text-[#4F6FE5] cursor-pointer transition-colors" onClick={() => setActiveCall("audio")} />
            <Video size={20} className="hover:text-[#163CC7] dark:hover:text-[#4F6FE5] cursor-pointer transition-colors" onClick={() => setActiveCall("video")} />
            <MoreHorizontal size={20} className="hover:text-[#163CC7] dark:hover:text-[#4F6FE5] cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
          {activeMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%]">
                <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.sender === "doctor" ? "bg-[#163CC7] text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-250 border border-slate-100 dark:border-slate-800 rounded-tl-none"}`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] mt-1.5 text-slate-400 dark:text-slate-500 ${msg.sender === "doctor" ? "text-right" : "text-left"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 px-4 border border-slate-200/50 dark:border-slate-700">
             <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><Smile size={20}/></button>
            <input type="text" value={draftMessage} onChange={(e) => setDraftMessage(e.target.value)} placeholder="Type a message here..." className="flex-1 bg-transparent border-none py-2 text-sm outline-none text-slate-700 dark:text-white" onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
            <div className="flex items-center gap-3 pr-2 border-r border-slate-300 dark:border-slate-700 mr-2">
               <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><Paperclip size={18}/></button>
               <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><Mic size={18}/></button>
            </div>
            <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-[#163CC7] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"><Send size={18} /></button>
          </div>
        </div>
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
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] bg-white dark:bg-slate-900 rounded-full py-2 px-4 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-2 text-[#163CC7] dark:text-[#4F6FE5] font-bold text-xs"><Languages size={14}/> Live translation</div>
                    <Settings size={14} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:rotate-90 transition-transform"/>
                  </div>
                </div>
                {/* Patient View */}
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-400 dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-850">
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold dark:text-white">Patient_01</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="mb-4 flex justify-end w-full px-4">
                   <Maximize2 size={20} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-[#163CC7] dark:hover:text-[#4F6FE5]"/>
                </div>
                <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-800 border-8 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-850" />
                </div>
                <h4 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{activeThread?.name}</h4>
                <p className="text-slate-400 dark:text-slate-500 text-sm animate-pulse">calling.....</p>
              </div>
            )}

            {/* Floating Call Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 rounded-full p-2 flex items-center gap-3 shadow-2xl">
              <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><Mic size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><VideoOff size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><Languages size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-[#163CC7] text-white flex items-center justify-center hover:scale-110 transition-transform"><MoreHorizontal size={18}/></button>
              <button onClick={() => setActiveCall(null)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"><PhoneOff size={18}/></button>
            </div>
          </div>
        </aside>
      )}  
    </div>
  );
}