import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Copy, AlertCircle, X } from "lucide-react";
import { api } from "../lib/api";

export function Schedule() {
  const today = new Date();
  const weekdayIds = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayId = weekdayIds[today.getDay()];
  
  const [selectedDay, setSelectedDay] = useState(currentDayId);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for adding slot
  const [showAddModal, setShowAddModal] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [slotType, setSlotType] = useState("Clinic");

  const weekdayLabels: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };

  const weekStart = new Date(today);
  const mondayOffset = (today.getDay() + 6) % 7; 
  weekStart.setDate(today.getDate() - mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      id: weekdayIds[date.getDay()],
      label: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  });

  const selectedDayData = weekDays.find((day) => day.id === selectedDay);

  // Load slots for selected day
  async function loadSlots() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/schedule/slots?day=${selectedDay}`);
      if (data.success) {
        setTimeSlots(data.slots || []);
      } else {
        setError(data.message || "Failed to load slots");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to slot manager API");
    } finally {
      setLoading(false);
    }
  }

  // Load weekly overview
  async function loadAvailability() {
    try {
      const data = await api.get("/schedule/availability");
      if (data.success && data.availability) {
        setAvailability(data.availability);
      }
    } catch (err) {
      console.error("Failed to load availability settings:", err);
    }
  }

  useEffect(() => {
    loadSlots();
  }, [selectedDay]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/schedule/slots", {
        dayOfWeek: selectedDay,
        startTime,
        endTime,
        slotType,
        isAvailable: true
      });
      if (res.success) {
        setShowAddModal(false);
        loadSlots();
        loadAvailability();
      } else {
        alert(res.message || "Error adding schedule slot");
      }
    } catch (err: any) {
      alert(err.message || "Failed to add slot");
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule slot?")) return;
    try {
      const res = await api.delete(`/schedule/slots/${id}`);
      if (res.success) {
        loadSlots();
        loadAvailability();
      } else {
        alert(res.message || "Failed to delete slot");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting slot");
    }
  };

  const handleToggleDay = async (dayName: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await api.put(`/schedule/availability/${dayName.toLowerCase()}`, {
        status: nextStatus
      });
      if (res.success) {
        loadAvailability();
      } else {
        alert(res.message || "Failed to toggle status");
      }
    } catch (err: any) {
      alert(err.message || "Error updating day status");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Schedule & Availability</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your weekly schedule and time slots</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="px-5 py-3 rounded-2xl bg-[#163CC7] text-white hover:opacity-95 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 font-black text-sm">
            <Plus size={20} />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-slate-800 dark:text-white mb-4 font-bold text-lg">Weekly Calendar</h3>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedDay === day.id
                  ? "border-[#163CC7] dark:border-[#4F6FE5] bg-blue-50/50 dark:bg-blue-950/20 font-semibold"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className={`text-xs mb-1 font-bold ${selectedDay === day.id ? "text-[#163CC7] dark:text-[#4F6FE5]" : "text-slate-400 dark:text-slate-500"}`}>
                {day.label.slice(0, 3)}
              </div>
              <div className={`text-xl font-black ${selectedDay === day.id ? "text-[#163CC7] dark:text-[#4F6FE5]" : "text-slate-800 dark:text-white"}`}>
                {day.date.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Slots */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 dark:text-white font-bold text-lg">Time Slots - {weekdayLabels[selectedDay]}</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Calendar size={16} />
              <span>{selectedDayData?.fullDate}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163CC7]" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-sm font-semibold">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-bold text-sm">
              No time slots configured for this day. Click "Add Time Slot" to start.
            </div>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    slot.slot_type === 'Break'
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                      : slot.is_available
                      ? 'border-blue-100 dark:border-blue-950/40 bg-blue-50/20 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Clock className={slot.slot_type === 'Break' ? 'text-slate-400' : 'text-[#163CC7]'} size={20} />
                    <div>
                      <div className="text-slate-800 dark:text-white font-black text-sm">{slot.start_time} - {slot.end_time}</div>
                      <div className="text-[11px] text-slate-400 font-bold">{slot.slot_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.slot_type !== 'Break' && (
                      <>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          slot.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {slot.is_available ? 'Available' : 'Booked'}
                        </span>
                        <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Overview */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-slate-800 dark:text-white mb-4 font-bold text-lg">Weekly Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-slate-500">Total Configured Days</span>
                <span className="text-slate-800 dark:text-white font-black">{availability.filter(a => a.status === 'Active').length} Days</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-slate-500">Default Slots Limit</span>
                <span className="text-slate-800 dark:text-white font-black">
                  {availability.reduce((sum, item) => sum + (parseInt(item.total_slots) || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Availability Overview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-slate-800 dark:text-white mb-6 font-bold text-lg">Weekly Availability Rules</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-slate-550 font-black uppercase text-[10px] tracking-wider">Day</th>
                <th className="px-6 py-4 text-left text-slate-550 font-black uppercase text-[10px] tracking-wider">Default Capacity</th>
                <th className="px-6 py-4 text-left text-slate-550 font-black uppercase text-[10px] tracking-wider">Working Hours</th>
                <th className="px-6 py-4 text-left text-slate-550 font-black uppercase text-[10px] tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-slate-550 font-black uppercase text-[10px] tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {availability.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                  <td className="px-6 py-4 text-slate-800 dark:text-white font-black text-sm">{item.day_name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold text-sm">{item.total_slots || 0} slots</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold text-sm">{item.working_hours || "09:00 AM - 05:00 PM"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(item.day_name, item.status)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
                    >
                      {item.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddSlotSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Add Time Slot</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Day of Week</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-black capitalize text-sm">
                  {weekdayLabels[selectedDay]}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Slot Type</label>
                <select
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white font-black text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Clinic</option>
                  <option>Video</option>
                  <option>Home Visit</option>
                  <option>Break</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-[#163CC7] text-white py-4 rounded-xl font-black shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all text-sm"
            >
              Add Time Slot
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
