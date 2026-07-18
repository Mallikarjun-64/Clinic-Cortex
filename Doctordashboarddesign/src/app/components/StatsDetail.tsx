import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

const StatsDetail = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  // Mapping the URL to a readable title
  const titleMap = {
    'total-patients': 'Total Patients Directory',
    'pending': 'Pending Consultation Requests',
    'today': "Today's Appointment Schedule",
    'completed': 'Completed Visit History'
  };

  return (
    <div className="p-8 text-white">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{titleMap[type] || 'Statistics'}</h1>
      </div>

      {/* Reusable Data Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4">Patient Name</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* Map your patient data here based on the 'type' */}
            <tr className="hover:bg-white/5 transition">
              <td className="p-4 font-medium">John Smith <span className="block text-xs text-gray-500">45 years</span></td>
              <td className="p-4 text-gray-300">Follow-up</td>
              <td className="p-4 text-gray-300">Apr 2, 2026 - 09:00 AM</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs ${type === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                  {type === 'pending' ? 'Waiting' : 'Confirmed'}
                </span>
              </td>
              <td className="p-4 flex justify-center gap-2">
                {type === 'pending' ? (
                   <>
                    <button className="px-3 py-1 bg-blue-600 rounded-md text-sm">Approve</button>
                    <button className="px-3 py-1 bg-white/10 rounded-md text-sm">Reschedule</button>
                   </>
                ) : (
                   <button className="p-2 hover:bg-white/10 rounded-lg"><MoreHorizontal size={18}/></button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsDetail;