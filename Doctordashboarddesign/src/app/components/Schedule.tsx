import { useState } from "react";
import { Calendar, Clock, Plus, Edit2, Trash2, Copy } from "lucide-react";

export function Schedule() {
  const today = new Date();
  const weekdayIds = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayId = weekdayIds[today.getDay()];
  const [selectedDay, setSelectedDay] = useState(currentDayId);

  const weekStart = new Date(today);
  const mondayOffset = (today.getDay() + 6) % 7; // move Sunday(0) to end and align Monday as start
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

  const timeSlots = [
    { id: 1, time: "09:00 AM - 10:00 AM", type: "Clinic", available: true },
    { id: 2, time: "10:00 AM - 11:00 AM", type: "Clinic", available: true },
    { id: 3, time: "11:00 AM - 12:00 PM", type: "Video", available: true },
    { id: 4, time: "12:00 PM - 01:00 PM", type: "Break", available: false },
    { id: 5, time: "01:00 PM - 02:00 PM", type: "Break", available: false },
    { id: 6, time: "02:00 PM - 03:00 PM", type: "Clinic", available: true },
    { id: 7, time: "03:00 PM - 04:00 PM", type: "Video", available: true },
    { id: 8, time: "04:00 PM - 05:00 PM", type: "Home Visit", available: true },
    { id: 9, time: "05:00 PM - 06:00 PM", type: "Clinic", available: true },
  ];

  const availability = [
    { day: "Monday", slots: "8 slots", hours: "9:00 AM - 6:00 PM", status: "Active" },
    { day: "Tuesday", slots: "8 slots", hours: "9:00 AM - 6:00 PM", status: "Active" },
    { day: "Wednesday", slots: "8 slots", hours: "9:00 AM - 6:00 PM", status: "Active" },
    { day: "Thursday", slots: "8 slots", hours: "9:00 AM - 6:00 PM", status: "Active" },
    { day: "Friday", slots: "8 slots", hours: "9:00 AM - 6:00 PM", status: "Active" },
    { day: "Saturday", slots: "4 slots", hours: "9:00 AM - 1:00 PM", status: "Active" },
    { day: "Sunday", slots: "0 slots", hours: "Closed", status: "Inactive" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 dark:text-white mb-1">Schedule & Availability</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your weekly schedule and time slots</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Copy size={20} />
            <span>Copy Week</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
        <h3 className="text-slate-800 dark:text-white mb-4">Weekly Calendar</h3>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDay === day.id
                  ? "border-[#163CC7] dark:border-[#4F6FE5] bg-[#163CC7]-50 dark:bg-[#163CC7]-900/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            >
              <div className={`text-sm mb-1 ${selectedDay === day.id ? "text-[#163CC7] dark:text-[#4F6FE5]" : "text-slate-500 dark:text-slate-400"}`}>
                {day.label}
              </div>
              <div className={`text-xl ${selectedDay === day.id ? "text-[#163CC7] dark:text-[#4F6FE5]" : "text-slate-800 dark:text-white"}`}>
                {day.date.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Time Slots */}
        <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 dark:text-white">Time Slots - {weekDays.find(d => d.id === selectedDay)?.label}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar size={16} />
              <span>{selectedDayData?.fullDate}</span>
            </div>
          </div>
          <div className="space-y-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  slot.type === 'Break'
                    ? 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
                    : slot.available
                    ? 'border-[#163CC7]-200 dark:border-[#4F6FE5]-800 bg-[#163CC7]-50/30 dark:bg-[#163CC7]-900/20 hover:bg-[#163CC7]-50 dark:hover:bg-[#163CC7]-900/30 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                } transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <Clock className={slot.type === 'Break' ? 'text-slate-400 dark:text-slate-500' : 'text-[#163CC7] dark:text-[#4F6FE5]'} size={20} />
                  <div>
                    <div className="text-slate-800 dark:text-white">{slot.time}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{slot.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {slot.type !== 'Break' && (
                    <>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        slot.available
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      }`}>
                        {slot.available ? 'Available' : 'Booked'}
                      </span>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
            <h3 className="text-slate-800 dark:text-white mb-4">This Week</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Slots</span>
                <span className="text-2xl text-slate-800 dark:text-white">52</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Available</span>
                <span className="text-2xl text-green-600 dark:text-green-400">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Booked</span>
                <span className="text-2xl text-blue-600 dark:text-blue-400">24</span>
              </div>
            </div>
          </div>

          {/* Consultation Types */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
            <h3 className="text-slate-800 dark:text-white mb-4">Slot Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">Clinic</span>
                </div>
                <span className="text-slate-800 dark:text-white">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#163CC7]"></div>
                  <span className="text-slate-700 dark:text-slate-300">Video</span>
                </div>
                <span className="text-slate-800 dark:text-white">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">Home Visit</span>
                </div>
                <span className="text-slate-800 dark:text-white">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Availability Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-6">
        <h3 className="text-slate-800 dark:text-white mb-6">Weekly Availability Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400">Day</th>
                <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400">Total Slots</th>
                <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400">Working Hours</th>
                <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-600">
              {availability.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 text-slate-800 dark:text-white">{item.day}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.slots}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.hours}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      item.status === 'Active'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-[#163CC7]-50 dark:bg-[#163CC7]-900/20 text-[#163CC7] dark:text-[#4F6FE5] hover:bg-[#163CC7]-100 dark:hover:bg-[#163CC7]-900/30 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        {item.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
