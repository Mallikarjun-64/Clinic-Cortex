import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Maximize2, FileText, Upload, Send, MoreVertical, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function VirtualConsultation() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "patient", text: "Hello Doctor, I've been having headaches for the past 5 days", time: "10:30 AM" },
    { id: 2, sender: "doctor", text: "Hello, I understand. Can you describe the pain?", time: "10:31 AM" },
    { id: 3, sender: "patient", text: "It's a throbbing pain, mostly on the right side", time: "10:31 AM" },
  ]);

  async function loadVideoAppointment() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/appointments?type=Video');
      if (res.success && Array.isArray(res.appointments) && res.appointments.length > 0) {
        const active = res.appointments[0];
        setActiveAppointment(active);
        setNotes(active.notes || "");
      } else {
        setActiveAppointment(null);
      }
    } catch (err: any) {
      console.error("API virtual consultation fetch error", err);
      setError("Unable to load consultation details — do not proceed until this loads.");
      setActiveAppointment(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideoAppointment();
  }, []);

  const handleEndCall = async () => {
    if (!activeAppointment) return;
    try {
      await api.patch(`/appointments/${activeAppointment.id}/status`, { status: "Completed" });
      await api.put(`/appointments/${activeAppointment.id}`, { notes });
      alert("Consultation call finalized and marked as Completed!");
      loadVideoAppointment();
    } catch (err: any) {
      alert(err.message || "Failed to finalize appointment call");
    }
  };

  const handleSaveNotes = async () => {
    if (!activeAppointment) return;
    try {
      await api.put(`/appointments/${activeAppointment.id}`, { notes });
      alert("Consultation notes updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save notes");
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "doctor",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const vitalsObj = activeAppointment?.vitals ? (typeof activeAppointment.vitals === 'string' ? JSON.parse(activeAppointment.vitals) : activeAppointment.vitals) : {};

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] p-8">
      {loading ? (
        <div className="py-12 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-lg">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-black text-red-600 dark:text-red-400 mb-2">Consultation Load Error</h2>
          <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-6">{error}</p>
          <button onClick={loadVideoAppointment} className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-md">
            Retry Loading Consultation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            {/* Video Section */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden h-[500px] relative shadow-lg border border-slate-850 flex-grow flex items-center justify-center">
              {/* Patient Video (Main) */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white text-3xl font-black mb-4 mx-auto shadow-lg shadow-blue-500/20">
                  {activeAppointment?.patient_name ? activeAppointment.patient_name.split(' ').map((n: string) => n[0]).join('') : 'PT'}
                </div>
                <div className="text-white text-lg font-bold">{activeAppointment?.patient_name || "Patient"}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Patient Connection Established</div>
              </div>

              {/* Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-colors ${
                      isMuted ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-650"
                    }`}
                  >
                    {isMuted ? <MicOff className="text-white" size={20} /> : <Mic className="text-white" size={20} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full transition-colors ${
                      isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-650"
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="text-white" size={20} /> : <Video className="text-white" size={20} />}
                  </button>
                  <button onClick={handleEndCall} className="px-6 py-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-red-550/20">
                    <PhoneOff className="text-white" size={20} />
                    <span className="text-white">End Call</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-850 dark:text-white font-black text-lg">Consultation Notes</h3>
                <button onClick={handleSaveNotes} className="text-[#163CC7] font-bold text-sm hover:underline flex items-center gap-2">
                  <FileText size={18} />
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your consultation notes here..."
                className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-800 dark:text-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Patient Info Card */}
            {activeAppointment && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h3 className="text-slate-800 dark:text-white font-black text-lg">Patient Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white text-xl font-bold">
                      {activeAppointment.patient_name ? activeAppointment.patient_name.split(' ').map((n: string) => n[0]).join('') : 'PT'}
                    </div>
                    <div>
                      <div className="text-slate-850 dark:text-white font-black text-sm">{activeAppointment.patient_name}</div>
                      <div className="text-xs text-slate-400 font-bold">Age: {activeAppointment.patient_age || 30} years</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Diagnosis / Reason</span>
                      <span className="font-bold text-slate-800 dark:text-white">{activeAppointment.condition || "General visit"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Temperature</span>
                      <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.temp || "98.6°F"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blood Pressure</span>
                      <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.bp || "120/80"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Heart Rate</span>
                      <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.hr || "72 bpm"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[280px]">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-slate-850 dark:text-white font-black text-base">Call Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.sender === 'doctor'
                        ? 'bg-[#163CC7] text-white rounded-tr-none font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-tl-none font-semibold'
                    }`}>
                      <div className="text-xs">{msg.text}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                  <button onClick={handleSendMessage} className="p-2 rounded-xl bg-[#163CC7] text-white hover:opacity-95">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
