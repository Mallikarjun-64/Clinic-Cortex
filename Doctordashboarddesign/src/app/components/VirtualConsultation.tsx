import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Maximize2, FileText, Upload, Send, MoreVertical } from "lucide-react";
import { useState } from "react";

export function VirtualConsultation() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");

  const patientInfo = {
    name: "Emma Wilson",
    age: 32,
    gender: "Female",
    id: "PT-2024-0456",
    symptoms: "Persistent headache, fatigue",
    duration: "5 days",
    temperature: "98.6°F",
    bp: "120/80",
    heartRate: "72 bpm",
  };

  const chatMessages = [
    { id: 1, sender: "patient", text: "Hello Doctor, I've been having headaches for the past 5 days", time: "10:30 AM" },
    { id: 2, sender: "doctor", text: "Hello Emma, I understand. Can you describe the pain?", time: "10:31 AM" },
    { id: 3, sender: "patient", text: "It's a throbbing pain, mostly on the right side", time: "10:31 AM" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)]">
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* Main Video Area */}
        <div className="col-span-2 space-y-6">
          {/* Video Section */}
          <div className="bg-slate-900 rounded-xl overflow-hidden h-[500px] relative">
            {/* Patient Video (Main) */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#163CC7]-500 to-[#4F6FE5]-600 flex items-center justify-center text-white text-4xl mb-4 mx-auto">
                  EW
                </div>
                <div className="text-white text-xl">Emma Wilson</div>
                <div className="text-slate-400">Patient</div>
              </div>
            </div>

            {/* Doctor Video (Picture in Picture) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg mx-auto">
                    SJ
                  </div>
                </div>
              </div>
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-colors ${
                    isMuted ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {isMuted ? <MicOff className="text-white" size={20} /> : <Mic className="text-white" size={20} />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="text-white" size={20} /> : <Video className="text-white" size={20} />}
                </button>
                <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                  <MonitorUp className="text-white" size={20} />
                </button>
                <button className="px-6 py-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2">
                  <PhoneOff className="text-white" size={20} />
                  <span className="text-white">End Call</span>
                </button>
                <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
                  <Maximize2 className="text-white" size={20} />
                </button>
              </div>
            </div>

            {/* Timer */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>12:45</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 dark:text-white">Consultation Notes</h3>
              <button className="text-[#163CC7]-600 dark:text-[#4F6FE5] hover:text-[#163CC7]-700 dark:hover:text-[#4F6FE5]-700 flex items-center gap-2">
                <FileText size={18} />
                <span>View Templates</span>
              </button>
            </div>
            <textarea
              placeholder="Type your consultation notes here..."
              className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 dark:focus:ring-[#4F6FE5] focus:border-transparent resize-none text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
            <h3 className="text-slate-800 dark:text-white mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#163CC7]-500 to-[#4F6FE5]-600 flex items-center justify-center text-white text-xl">
                  EW
                </div>
                <div>
                  <div className="text-slate-800 dark:text-white">{patientInfo.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{patientInfo.id}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-600 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Age</span>
                  <span className="text-slate-800 dark:text-white">{patientInfo.age} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Gender</span>
                  <span className="text-slate-800 dark:text-white">{patientInfo.gender}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Temperature</span>
                  <span className="text-slate-800 dark:text-white">{patientInfo.temperature}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Blood Pressure</span>
                  <span className="text-slate-800 dark:text-white">{patientInfo.bp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Heart Rate</span>
                  <span className="text-slate-800 dark:text-white">{patientInfo.heartRate}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-600">
                <div className="text-slate-500 dark:text-slate-400 text-sm mb-2">Current Symptoms</div>
                <div className="text-slate-800 dark:text-white text-sm">{patientInfo.symptoms}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Duration: {patientInfo.duration}</div>
              </div>
            </div>
          </div>

          {/* Prescription Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
            <h3 className="text-slate-800 dark:text-white mb-4">Prescription</h3>
            <div className="space-y-3 mb-4">
              <button className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left">
                + Add Medication
              </button>
              <button className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left">
                + Add Lab Test
              </button>
            </div>
            <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center justify-center gap-2">
              <Upload size={18} />
              <span>Upload Report</span>
            </button>
          </div>

          {/* Chat Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 flex flex-col h-[300px]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-slate-800 dark:text-white">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.sender === 'doctor'
                      ? 'bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}>
                    <div className="text-sm">{msg.text}</div>
                    <div className={`text-xs mt-1 ${msg.sender === 'doctor' ? 'text-[#163CC7]-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 dark:focus:ring-[#4F6FE5] focus:border-transparent text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
                <button className="p-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
