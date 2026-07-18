import { useState } from "react";
import { Search, Filter, Download, Plus, FileText, Calendar, Activity, Upload } from "lucide-react";
import { getDoctorDisplayName } from "../lib/doctorProfile";

export function PatientRecords() {
  const doctorName = getDoctorDisplayName();
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  const records = [
    {
      id: 1,
      patient: "Meghna k Gunaga",
      date: "Mar 28, 2026",
      type: "Consultation",
      diagnosis: "Hypertension follow-up",
      doctor: doctorName,
      notes: "Blood pressure: 140/90. Adjusted medication dosage. Schedule follow-up in 2 weeks.",
    },
    {
      id: 2,
      patient: "Emma Wilson",
      date: "Mar 30, 2026",
      type: "Lab Report",
      diagnosis: "HbA1c Test",
      doctor: doctorName,
      notes: "HbA1c level: 6.8%. Continue current diabetes management plan.",
    },
    {
      id: 3,
      patient: "Michael Brown",
      date: "Apr 1, 2026",
      type: "Prescription",
      diagnosis: "Asthma Management",
      doctor: doctorName,
      notes: "Prescribed: Albuterol inhaler 90mcg, 2 puffs as needed for shortness of breath.",
    },
    {
      id: 4,
      patient: "Sarah Davis",
      date: "Mar 25, 2026",
      type: "Consultation",
      diagnosis: "Migraine",
      doctor: doctorName,
      notes: "Severe headache with aura. Prescribed sumatriptan. Advised to keep headache diary.",
    },
  ];

  const filteredRecords = records.filter((record) => {
    const matchesSearch = searchTerm.trim()
      ? [record.patient, record.diagnosis, record.type, record.notes]
        .some((field) => field.toLowerCase().includes(searchTerm.trim().toLowerCase()))
      : true;
    const matchesType = recordTypeFilter === "all" || record.type.toLowerCase() === recordTypeFilter;
    return matchesSearch && matchesType;
  });

  const timeline = [
    { date: "Apr 2, 2026", event: "Prescription issued", details: "Lisinopril 10mg" },
    { date: "Mar 28, 2026", event: "Consultation", details: "Blood pressure check" },
    { date: "Feb 15, 2026", event: "Lab Test", details: "Complete Blood Count" },
    { date: "Jan 10, 2026", event: "Follow-up", details: "Medication adjustment" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 dark:text-white mb-1">Patient Records</h1>
          <p className="text-slate-600 dark:text-slate-400">View and manage medical records</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Upload size={20} />
            <span>Upload Report</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#163CC7]-500 to-[#4F6FE5]-600 text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>Add New Record</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records by patient name or diagnosis..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 focus:border-transparent"
            />
          </div>
          <select
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]-500 focus:border-transparent"
          >
            <option value="all">All Record Types</option>
            <option value="consultation">Consultation</option>
            <option value="lab report">Lab Report</option>
            <option value="prescription">Prescription</option>
            <option value="diagnosis">Diagnosis</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Records List */}
        <div className="col-span-2 space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:border-[#163CC7]-200 dark:hover:border-[#4F6FE5]/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${record.type === 'Consultation' ? 'bg-blue-50 dark:bg-blue-950/40' :
                      record.type === 'Lab Report' ? 'bg-green-50 dark:bg-emerald-950/40' :
                        record.type === 'Prescription' ? 'bg-purple-50 dark:bg-purple-950/40' :
                          'bg-amber-50 dark:bg-amber-950/40'
                    }`}>
                    {record.type === 'Consultation' ? <Activity className="text-blue-600 dark:text-blue-400" size={20} /> :
                      record.type === 'Lab Report' ? <FileText className="text-green-600 dark:text-emerald-400" size={20} /> :
                        record.type === 'Prescription' ? <FileText className="text-purple-600 dark:text-purple-400" size={20} /> :
                          <FileText className="text-amber-600 dark:text-amber-400" size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-slate-800 dark:text-white font-bold">{record.patient}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${record.type === 'Consultation' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                          record.type === 'Lab Report' ? 'bg-green-50 dark:bg-emerald-950/40 text-green-600 dark:text-emerald-400' :
                            record.type === 'Prescription' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' :
                              'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                        {record.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar size={14} />
                      <span>{record.date}</span>
                      <span>•</span>
                      <span>{record.doctor}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Download size={18} />
                </button>
              </div>

              <div className="mb-3">
                <div className="text-slate-800 dark:text-slate-200 font-bold mb-2">{record.diagnosis}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{record.notes}</div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="px-4 py-2 rounded-lg bg-[#163CC7]-50 dark:bg-blue-950/30 text-[#163CC7]-600 dark:text-[#4F6FE5] hover:bg-[#163CC7]-100 dark:hover:bg-blue-950/50 transition-colors font-semibold">
                  View Full Record
                </button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
                  Edit
                </button>
                <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
                  Print
                </button>
              </div>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-12 text-center text-slate-500 dark:text-slate-400">
              No records found for "{searchTerm.trim()}". Try another name or diagnosis.
            </div>
          )}
        </div>

        {/* Timeline View */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-slate-800 dark:text-white font-bold mb-6">Recent Activity Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="relative">
                {index !== timeline.length - 1 && (
                  <div className="absolute left-2 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>
                )}
                <div className="flex gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#163CC7]-500 to-[#4F6FE5]-600 mt-1 relative z-10"></div>
                  <div className="flex-1 pb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.date}</div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium mb-1">{item.event}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{item.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
            View Full Timeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <FileText className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">156</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">Total Records</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <Activity className="text-green-600 dark:text-emerald-400" size={20} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">42</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">Lab Reports</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
              <FileText className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">68</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">Prescriptions</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
              <Calendar className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">46</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">Consultations</div>
        </div>
      </div>
    </div>
  );
}
