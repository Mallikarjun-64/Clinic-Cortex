import { Home, MapPin, Clock, Phone, CheckCircle, XCircle, Calendar } from "lucide-react";

export function HomeVisits() {
  const requests = [
    {
      id: 1,
      patient: "David Martinez",
      age: 67,
      address: "123 Oak Street, Downtown",
      symptoms: "Chest pain, shortness of breath",
      requestedTime: "Today, 4:00 PM",
      distance: "2.3 km",
      priority: "High",
      phone: "+1 234-567-8901",
      notes: "Patient has history of cardiac issues",
    },
    {
      id: 2,
      patient: "Jennifer Lee",
      age: 54,
      address: "456 Maple Avenue, Suburbs",
      symptoms: "High fever, body aches",
      requestedTime: "Tomorrow, 10:00 AM",
      distance: "5.1 km",
      priority: "Medium",
      phone: "+1 234-567-8902",
      notes: "Flu-like symptoms for 2 days",
    },
    {
      id: 3,
      patient: "Thomas Anderson",
      age: 71,
      address: "789 Pine Road, Eastside",
      symptoms: "Difficulty walking, leg swelling",
      requestedTime: "Today, 6:00 PM",
      distance: "3.8 km",
      priority: "Medium",
      phone: "+1 234-567-8903",
      notes: "Diabetic patient, regular check-up needed",
    },
    {
      id: 4,
      patient: "Margaret Wilson",
      age: 82,
      address: "321 Elm Street, Northside",
      symptoms: "Post-surgery follow-up",
      requestedTime: "Apr 3, 2026, 2:00 PM",
      distance: "4.2 km",
      priority: "Low",
      phone: "+1 234-567-8904",
      notes: "Hip replacement surgery 2 weeks ago",
    },
  ];

  const scheduledVisits = [
    { id: 1, patient: "Robert Smith", address: "555 Birch Lane", time: "Today, 2:00 PM", status: "En Route" },
    { id: 2, patient: "Linda Brown", address: "888 Cedar Ave", time: "Tomorrow, 9:00 AM", status: "Scheduled" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 dark:text-white mb-1">Home Visit Requests</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and schedule home visits</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center gap-2">
          <Calendar size={20} />
          <span>View Schedule</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <span className="text-2xl text-slate-800 dark:text-white">4</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">Pending Requests</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <span className="text-2xl text-slate-800 dark:text-white">2</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">Scheduled Today</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <span className="text-2xl text-slate-800 dark:text-white">12</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">Completed This Week</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#163CC7]-50 dark:bg-[#163CC7]-900/20 flex items-center justify-center">
              <MapPin className="text-[#163CC7] dark:text-[#4F6FE5]" size={20} />
            </div>
            <span className="text-2xl text-slate-800 dark:text-white">3.8 km</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">Avg. Distance</div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
        <h3 className="text-slate-800 dark:text-white mb-6">Pending Requests</h3>
        <div className="grid grid-cols-2 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-6 hover:border-[#163CC7] dark:hover:border-[#4F6FE5] hover:shadow-md transition-all bg-white dark:bg-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    {request.patient.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-slate-800 dark:text-white mb-1">{request.patient}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{request.age} years</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  request.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                }`}>
                  {request.priority}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="text-slate-400 dark:text-slate-500 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm">{request.address}</div>
                    <div className="text-xs text-[#163CC7] dark:text-[#4F6FE5]">{request.distance} away</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={16} />
                  <div className="text-slate-700 dark:text-slate-300 text-sm">{request.requestedTime}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-slate-400 dark:text-slate-500 flex-shrink-0" size={16} />
                  <div className="text-slate-700 dark:text-slate-300 text-sm">{request.phone}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Symptoms</div>
                <div className="text-slate-700 dark:text-slate-300 text-sm">{request.symptoms}</div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4">
                <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">Notes</div>
                <div className="text-amber-700 dark:text-amber-300 text-sm">{request.notes}</div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  <span>Accept</span>
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  <span>Schedule</span>
                </button>
                <button className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Visits */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
        <h3 className="text-slate-800 dark:text-white mb-4">Scheduled Visits</h3>
        <div className="space-y-3">
          {scheduledVisits.map((visit) => (
            <div key={visit.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-600 hover:border-[#163CC7] dark:hover:border-[#4F6FE5] hover:bg-[#163CC7]-50/30 dark:hover:bg-[#163CC7]-900/20 transition-colors bg-white dark:bg-slate-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#163CC7]-500 to-[#4F6FE5]-600 flex items-center justify-center text-white">
                <Home size={20} />
              </div>
              <div className="flex-1">
                <div className="text-slate-800 dark:text-white">{visit.patient}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{visit.address}</div>
              </div>
              <div className="text-slate-600 dark:text-slate-400">{visit.time}</div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                visit.status === 'En Route' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}>
                {visit.status}
              </span>
              <button className="px-4 py-2 rounded-lg bg-[#163CC7]-50 dark:bg-[#163CC7]-900/20 text-[#163CC7] dark:text-[#4F6FE5] hover:bg-[#163CC7]-100 dark:hover:bg-[#163CC7]-900/30 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
