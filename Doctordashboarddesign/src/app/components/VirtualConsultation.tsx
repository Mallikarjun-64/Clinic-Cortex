import { Video, VideoOff, Mic, MicOff, PhoneCall, PhoneOff, FileText, Send, AlertCircle, Clock, CheckCircle2, ArrowLeft, Video as VideoIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { api } from "../lib/api";

export function VirtualConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const appointmentIdFromUrl = searchParams.get("appointmentId");

  const [activeAppointment, setActiveAppointment] = useState<any>(location.state?.appointment || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call States: "idle" | "calling" | "active" | "ended"
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "active" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  // Notes & Chat States
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);

  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);

  // 1. Fetch Active Appointment Details
  async function loadVideoAppointment() {
    setLoading(true);
    setError(null);
    try {
      let active = null;
      if (appointmentIdFromUrl) {
        const res = await api.get(`/appointments/${appointmentIdFromUrl}`);
        if (res.success && res.appointment) {
          active = res.appointment;
        }
      }

      if (!active || active.status === "Completed" || active.status === "Cancelled") {
        const listRes = await api.get('/appointments?type=Video');
        if (listRes.success && Array.isArray(listRes.appointments) && listRes.appointments.length > 0) {
          active = listRes.appointments.find((a: any) => a.status !== "Completed" && a.status !== "Cancelled");
        }
      }

      if (active && active.status !== "Completed" && active.status !== "Cancelled") {
        setActiveAppointment(active);
        setNotes(active.notes || "");
        if (active.status === "In-Progress") {
          setCallStatus("active");
        }

        // Initialize Messaging Thread with Patient
        const patId = active.patient_id || active.patientId || active.id;
        const docId = active.doctor_id || active.doctorId;
        if (patId) {
          initMessagingThread(docId, patId);
        }
      } else {
        // No active video call, show clean empty state on this page
        setActiveAppointment(null);
      }
    } catch (err: any) {
      console.error("API virtual consultation fetch error", err);
      setError("Unable to load consultation details.");
    } finally {
      setLoading(false);
    }
  }

  // 2. Initialize Real Messaging Thread
  async function initMessagingThread(docId: string | undefined, patId: string) {
    try {
      const threadRes = await api.post('/messages/threads', {
        doctorId: docId,
        patientId: patId
      });
      if (threadRes.success && threadRes.thread) {
        const tId = threadRes.thread.id;
        setThreadId(tId);
        fetchMessages(tId);
      }
    } catch (err) {
      console.warn("Could not initialize message thread", err);
    }
  }

  // 3. Fetch Messages inside thread
  async function fetchMessages(tId: string) {
    try {
      const res = await api.get(`/messages/threads/${tId}`);
      if (res.success && Array.isArray(res.messages)) {
        const mapped = res.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender_type,
          text: m.content,
          time: new Date(m.sent_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setChatMessages(mapped);
      }
    } catch (err) {
      console.warn("Error fetching chat messages", err);
    }
  }

  useEffect(() => {
    loadVideoAppointment();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [appointmentIdFromUrl]);

  // Message Auto-polling every 3s
  useEffect(() => {
    if (threadId) {
      pollRef.current = setInterval(() => {
        fetchMessages(threadId);
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [threadId]);

  // Call Timer Effect
  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Format call seconds to MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Doctor Action: START CALL
  const handleStartCall = async () => {
    if (!activeAppointment) return;

    setCallStatus("calling");
    try {
      // 1. Update appointment status to In-Progress
      await api.patch(`/appointments/${activeAppointment.id}/status`, { status: "In-Progress" });

      // 2. Send real-time call notification to patient
      const patId = activeAppointment.patient_id || activeAppointment.patientId;
      await api.post('/notifications', {
        patientId: patId,
        doctorId: activeAppointment.doctor_id,
        patientName: activeAppointment.patient_name || activeAppointment.patient,
        title: "Doctor Started Your Video Call",
        body: "Dr. Mallikarjun has started your video consultation call. Click to join now!",
        category: "Urgent",
        notificationType: "video_call"
      }).catch((err) => console.warn("Call notification send error", err));

      setCallStatus("active");
      setCallSeconds(0);
    } catch (err: any) {
      alert(err.message || "Failed to start call");
      setCallStatus("idle");
    }
  };

  // Doctor Action: END CALL
  const handleEndCall = async () => {
    if (!activeAppointment) return;
    try {
      await api.patch(`/appointments/${activeAppointment.id}/status`, { status: "Completed" });
      if (notes.trim()) {
        await api.put(`/appointments/${activeAppointment.id}`, { notes });
      }

      // Mark call notifications as read
      api.get('/notifications').then(res => {
        if (res.success && Array.isArray(res.notifications)) {
          res.notifications.forEach((n: any) => {
            if (n.notification_type === 'video_call' || (n.title && n.title.includes('Call'))) {
              api.patch(`/notifications/${n.id}/read`, {});
            }
          });
        }
      }).catch(() => {});

      // Set active appointment to null so page stays on Virtual Consultation as a clean empty room
      setActiveAppointment(null);
      setCallStatus("idle");
    } catch (err: any) {
      alert(err.message || "Failed to finalize call");
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!activeAppointment) return;
    try {
      await api.put(`/appointments/${activeAppointment.id}`, { notes });
      alert("Consultation notes saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save notes");
    }
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    if (!message.trim() || !threadId) return;
    const txt = message.trim();
    setMessage("");
    setSendingMsg(true);

    try {
      await api.post(`/messages/threads/${threadId}`, {
        content: txt,
        senderType: 'doctor'
      });
      fetchMessages(threadId);
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const vitalsObj = activeAppointment?.vitals ? (typeof activeAppointment.vitals === 'string' ? JSON.parse(activeAppointment.vitals) : activeAppointment.vitals) : {};
  const patientInitials = activeAppointment?.patient_name ? activeAppointment.patient_name.split(' ').map((n: string) => n[0]).join('') : (activeAppointment?.patient ? activeAppointment.patient.split(' ').map((n: string) => n[0]).join('') : 'AK');
  const patientDisplayName = activeAppointment?.patient_name || activeAppointment?.patient || "Akku K";

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {loading ? (
        <div className="py-24 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#163CC7]" />
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
      ) : !activeAppointment ? (
        /* CLEAN EMPTY STANDBY STATE ON VIRTUAL CONSULTATION PAGE */
        <div className="min-h-[600px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-[#163CC7] dark:text-[#4F6FE5] flex items-center justify-center mb-6 shadow-inner border border-blue-100 dark:border-blue-900">
            <VideoIcon size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Virtual Consultation Room</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
            No active video consultation in progress. Launch a video appointment from your Appointments list to connect with a patient.
          </p>
          <button
            onClick={() => navigate('/dashboard/appointments')}
            className="px-8 py-4 rounded-2xl bg-[#163CC7] hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
            <span>Go to Appointments List</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Container */}
            <div className="bg-slate-950 rounded-3xl overflow-hidden h-[520px] relative shadow-xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center">
              {/* Call Timer Overlay when Active */}
              {callStatus === "active" && (
                <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur border border-slate-750 px-4 py-2 rounded-2xl flex items-center gap-2 text-white font-mono text-xs font-bold shadow-md z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE • {formatTimer(callSeconds)}</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  callStatus === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  callStatus === "calling" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" :
                  "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}>
                  {callStatus === "active" ? "Call Active" : callStatus === "calling" ? "Calling Patient…" : "Ready to Start Call"}
                </span>
              </div>

              {/* Real 2-Way HD WebRTC Video Stream when Call Active */}
              {callStatus === "active" ? (
                <iframe
                  src={`https://meet.jit.si/ClinicCortex_Consultation_${activeAppointment?.id || 'live'}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent("Dr. Mallikarjun Kadagoudra")}`}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write; gUM"
                  className="w-full h-full border-0 rounded-3xl z-10"
                />
              ) : (
                /* Main Avatar / Connection View */
                <div className="text-center z-10">
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white text-4xl font-black mb-4 mx-auto shadow-2xl shadow-blue-500/30 transition-all ${
                    callStatus === "calling" ? "animate-bounce" : ""
                  }`}>
                    {patientInitials}
                  </div>
                  <div className="text-white text-2xl font-black">{patientDisplayName}</div>
                  <div className="text-slate-400 text-xs font-bold tracking-wider mt-1.5">
                    {callStatus === "calling" ? "Sending call invite & notifying patient portal…" :
                     "Patient waiting for doctor to start call"}
                  </div>
                </div>
              )}

              {/* Action Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-6 z-20">
                <div className="flex items-center justify-center gap-4">
                  {callStatus === "idle" ? (
                    <button
                      onClick={handleStartCall}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
                    >
                      <PhoneCall size={22} className="animate-pulse" />
                      <span>START CALL NOW</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-2xl transition-all ${
                          isMuted ? "bg-red-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        }`}
                      >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>

                      <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-2xl transition-all ${
                          isVideoOff ? "bg-red-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        }`}
                      >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                      </button>

                      <button
                        onClick={handleEndCall}
                        className="px-7 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
                      >
                        <PhoneOff size={20} />
                        <span>End Call</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Notes Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-black text-base">Consultation Notes</h3>
                <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#163CC7] dark:text-[#4F6FE5] font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-2">
                  <FileText size={16} />
                  <span>Save Notes</span>
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type clinical diagnosis, symptoms, and prescribed treatment notes here..."
                className="w-full h-28 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#163CC7]/20 resize-none text-slate-800 dark:text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Right Sidebar: Patient Info & Live Chat */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Patient Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-slate-900 dark:text-white font-black text-base">Patient Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white text-lg font-bold">
                    {patientInitials}
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{patientDisplayName}</div>
                    <div className="text-xs text-slate-400 font-medium">Age: {activeAppointment?.patient_age || 32} years</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Reason / Diagnosis:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{activeAppointment?.condition || "General Consult"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Temperature:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.temp || "98.6°F"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Blood Pressure:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.bp || "120/80"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Heart Rate:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{vitalsObj.hr || "72 bpm"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Chat Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[340px]">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-black text-base">Call Chat</h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Live Sync</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8">
                    No chat messages yet. Type below to message the patient.
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isDoc = msg.sender === 'doctor';
                    return (
                      <div key={msg.id} className={`flex ${isDoc ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          isDoc
                            ? 'bg-[#163CC7] text-white rounded-tr-none font-medium'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none font-medium'
                        }`}>
                          <div className="text-xs">{msg.text}</div>
                          <div className={`text-[9px] mt-1 text-right ${isDoc ? 'text-blue-200' : 'text-slate-400'}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#163CC7]/20 text-slate-800 dark:text-white font-medium"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMsg}
                    className="p-2.5 rounded-xl bg-[#163CC7] text-white hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} />
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
