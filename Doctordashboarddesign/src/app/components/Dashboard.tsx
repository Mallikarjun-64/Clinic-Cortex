import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router"; // Using "react-router" as requested
import {
  Calendar, Video, Users, Clock, Activity, Bot,
  TrendingUp, ShieldCheck, X, Image as ImageIcon, 
  Lightbulb, CheckSquare, Languages, Mic, Send,
  Sparkles, RefreshCcw
} from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "./ui/chart";
import aiAvatarImage from "../../assets/ai-avatar.png";
import { getDoctorDisplayName } from "../lib/doctorProfile";
import { api } from "../lib/api";

export function Dashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // --- STATE DATA FROM BACKEND ---
  const [liveStats, setLiveStats] = useState({
    totalPatients: 1234,
    todayAppointments: 18,
    pendingRequests: 7,
    completedVisits: 45
  });

  const [consultationRequests, setConsultationRequests] = useState([
    { id: "e6d5e744-42b7-4a0b-8d76-bc34407b8b20", patient: "Lisa Anderson", time: "Requested 10 min ago", type: "Virtual", priority: "High" },
    { id: "e6d5e744-42b7-4a0b-8d76-bc34407b8b21", patient: "Robert Taylor", time: "Requested 25 min ago", type: "Virtual", priority: "Medium" },
    { id: "e6d5e744-42b7-4a0b-8d76-bc34407b8b22", patient: "Maria Garcia", time: "Requested 1 hr ago", type: "Virtual", priority: "Low" },
  ]);

  const [appointmentStats, setAppointmentStats] = useState([
    { day: "Mon", Success: 18 },
    { day: "Tue", Success: 22 },
    { day: "Wed", Success: 19 },
    { day: "Thu", Success: 24 },
    { day: "Fri", Success: 28 },
    { day: "Sat", Success: 14 },
    { day: "Sun", Success: 16 },
  ]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await api.get('/dashboard/stats');
        if (statsRes.success && statsRes.stats) {
          setLiveStats(statsRes.stats);
        }

        const chartRes = await api.get('/dashboard/chart');
        if (chartRes.success && Array.isArray(chartRes.chartData) && chartRes.chartData.length > 0) {
          setAppointmentStats(chartRes.chartData.map((d: any) => ({ day: d.name, Success: d.Completed })));
        }

        const consultRes = await api.get('/consultations');
        if (consultRes.success && Array.isArray(consultRes.requests) && consultRes.requests.length > 0) {
          setConsultationRequests(consultRes.requests.map((r: any) => ({
            id: r.id,
            patient: r.patient_name,
            time: r.request_time || "Just now",
            type: r.request_type || "Virtual",
            priority: r.priority || "Medium"
          })));
        }
      } catch (err) {
        console.warn("API load error for dashboard stats", err);
      }
    }
    loadDashboardData();
  }, []);

  const stats = [
    { label: "Total Patients", value: liveStats.totalPatients.toLocaleString(), icon: Users, color: "from-blue-500 to-blue-600", path: "/dashboard/stats/total-patients", change: "+12%" },
    { label: "Today's Appointments", value: liveStats.todayAppointments.toString(), icon: Calendar, color: "from-[#163CC7] to-[#4F6FE5]", path: "/dashboard/stats/today", change: "+3" },
    { label: "Pending Requests", value: liveStats.pendingRequests.toString(), icon: Clock, color: "from-amber-500 to-orange-600", path: "/dashboard/stats/pending", change: "+2" },
    { label: "Completed Visits", value: liveStats.completedVisits.toString(), icon: Activity, color: "from-green-500 to-emerald-600", path: "/dashboard/stats/completed", change: "+8" },
  ];

  // --- HANDLERS ---
  const handleAccept = async (id: number | string) => {
    try {
      await api.patch(`/consultations/${id}/accept`, {});
      setConsultationRequests(prev => prev.filter(r => r.id !== id));
      setToastMessage("Consultation request accepted and scheduled!");
    } catch (err) {
      console.warn("API accept consultation error", err);
      setToastMessage("Appointment accepted");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage("");
    setIsThinking(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsThinking(false);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: "I'm a demo AI. I can help you analyze patient data, draft emails, or summarize medical records." 
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back, {getDoctorDisplayName()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                onClick={() => navigate(stat.path)}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                <div className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Appointment Performance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Appointment Performance</h3>
          <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
              <AreaChart data={appointmentStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="Success"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Virtual Consultation Requests */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Virtual Consultation Requests</h3>
              <span className="px-2 py-1 rounded-full bg-[#163CC7] text-white text-xs">3 New</span>
            </div>
            <div className="space-y-4">
              {consultationRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Video className="text-blue-600" size={18} />
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{req.patient}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{req.time}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${req.priority === "High" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 bg-[#163CC7] text-white py-1.5 rounded-lg text-sm hover:bg-[#1340a2] transition-colors">Accept</button>
                    <button className="flex-1 bg-slate-100 dark:bg-slate-700 dark:text-white py-1.5 rounded-lg text-sm hover:bg-slate-200 transition-colors">Reschedule</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div 
              onClick={() => navigate("/dashboard/profile")}
              className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl border border-blue-500/20 p-6 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm group-hover:text-blue-500 transition-colors">Monthly Revenue</p>
                  <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">₹1,20,840.00</h3>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 group-hover:bg-[#163CC7] group-hover:text-white transition-all duration-300">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clinic Visits</p>
                  <p className="text-lg font-semibold text-green-600">₹8,200</p>
                </div>
                <div className="flex-1 bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-white/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Virtual Cons.</p>
                  <p className="text-lg font-semibold text-indigo-600">₹4,640</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-orange-500" size={20} />
                <h3 className="font-semibold text-slate-800 dark:text-white">Doctor's Scrutiny</h3>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100">
                <span className="text-sm dark:text-slate-300">Patient Record Updates</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 ml-2 rounded">12 Pending</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100">
                <span className="text-sm dark:text-slate-300">Insurence claims</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 ml-2 rounded">4 Pending</span>
              </div>  
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100">
                <span className="text-sm dark:text-slate-300">Patient Record Updates</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 ml-2 rounded">12 Pending</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100">
                <span className="text-sm dark:text-slate-300">Patient Record Updates</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 ml-2 rounded">12 Pending</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100">
                <span className="text-sm dark:text-slate-300">Patient Record Updates</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 ml-2 rounded">12 Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING AI LAYER */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
        
        {/* The Chat Window */}
        <div className={`pointer-events-auto w-[380px] h-[580px] rounded-[2.5rem] border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${
            assistantOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        }`}>
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            {chatHistory.length > 0 ? (
              <button 
                onClick={() => setChatHistory([])} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Back to home"
              >
                <RefreshCcw size={14} />
              </button>
            ) : (
              <button 
                onClick={() => setAssistantOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Minimize"
              >
                <div className="w-3 h-0.5 bg-slate-500 rounded-full" />
              </button>
            )}
            <button onClick={() => setAssistantOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
              <X size={18}/>
            </button>
          </div>

          {/* Assistant Body */}
          <style>{`
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-message {
              animation: slideUpFade 0.3s ease-out forwards;
            }
          `}</style>
          
          <div className="flex-1 px-4 overflow-y-auto flex flex-col pt-4 pb-2 scrollbar-hide">
            {chatHistory.length === 0 ? (
              <div className="flex-1 text-center flex flex-col items-center justify-center">
                <p className="text-slate-500 text-lg">Hello, {getDoctorDisplayName()}!</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How can I help you today?</h2>
                
                {/* Animated Healthcare AI Avatar */}
                <div className="relative mb-10 flex items-center justify-center w-full mt-4">
                  {/* Healthcare Pulse/Tech Background Animation */}
                  <div className="absolute w-40 h-40 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                  
                  {/* Rotating Tech Rings */}
                  <div className="absolute w-44 h-44 border border-[#163CC7]/10 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-52 h-52 border border-blue-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute w-44 h-44 border-t-2 border-[#163CC7]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                  
                  {/* Cross/Medical Accent Dots */}
                  <div className="absolute w-44 h-44 animate-[spin_20s_linear_infinite]">
                     <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                     <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full" />
                  </div>

                  {/* Avatar Image */}
                  <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-blue-400 via-[#163CC7] to-indigo-600 relative z-10 shadow-2xl shadow-blue-500/20 flex items-center justify-center overflow-hidden group">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white/10 relative">
                      <img src={aiAvatarImage} alt="Healthcare AI Assistant" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 w-full px-4 mt-auto">
                  {[
                    { label: "Create an image", icon: ImageIcon },
                    { label: "Give me ideas", icon: Lightbulb },
                    { label: "Do the task", icon: CheckSquare },
                    { label: "Translate the text", icon: Languages },
                  ].map((item) => (
                    <button key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium hover:shadow-md transition-shadow">
                      <item.icon size={14} className="text-blue-500" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full px-2">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex w-full animate-message ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3.5 text-sm shadow-sm ${
                      chat.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl rounded-bl-sm'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start animate-message">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input Pill */}
          <div className="p-4 pt-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 pl-4 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
              <span className="text-slate-400 text-xl font-light">+</span>
              <input 
                className="flex-1 bg-transparent border-none text-sm outline-none text-slate-800 dark:text-white" 
                placeholder="Ask me anything..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={message.trim() ? handleSendMessage : undefined}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className={`absolute transition-all duration-300 ${message.trim() ? 'scale-0 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'}`}>
                    <Mic size={18} />
                  </div>
                  <div className={`absolute transition-all duration-300 ${message.trim() ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-90'}`}>
                    <Send size={18} className="ml-0.5" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* The Trigger Button */}
        {!assistantOpen && (
          <div className="relative pointer-events-auto group w-16 h-16">
            {/* Expanding Ping Ring */}
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDuration: '2.5s' }} />
            
            {/* Rotating Glowing Halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-[#163CC7] to-purple-500 rounded-full blur-md animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
            
            {/* Actual Button */}
            <button
              onClick={() => setAssistantOpen(true)}
              className="relative w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform duration-300 z-10"
            >
              {/* AI Image */}
              <img src={aiAvatarImage} alt="AI Assistant" className="w-full h-full rounded-full object-cover" />
              
              {/* Subtle pulsing light overlay on image */}
              <div className="absolute inset-0 bg-blue-400/20 mix-blend-color-dodge animate-pulse" style={{ animationDuration: '2s' }} />
            </button>
            
            {/* Online Status Dot */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full z-20 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"}`}>
        {toastMessage}
      </div>

    </div>
  );
}