import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Calendar, Award, GraduationCap, 
  Briefcase, Clock, DollarSign, Edit2, TrendingUp, 
  Star, MessageCircle, X, Camera, Save, SlidersHorizontal
} from "lucide-react";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
  PieChart, Pie
} from 'recharts';
import aiAvatarImage from "../../assets/ai-avatar.png";
import { getDoctorDisplayName, getDoctorEmail, getDoctorSpecialty, getDoctorInitials, getStoredDoctorProfile } from "../lib/doctorProfile";

const renderWeeklyBarLabel = (props: any) => {
  const { x, y, width, value, index } = props;
  if (index !== 6) return null; // Sunday
  const formattedValue = `₹${(value / 1000).toFixed(1)}K`;
  return (
    <g>
      <rect x={x + width / 2 - 30} y={y - 38} width={60} height={24} rx={12} fill="#0f172a" />
      <path d={`M ${x + width / 2 - 4} ${y - 14} L ${x + width / 2} ${y - 10} L ${x + width / 2 + 4} ${y - 14} Z`} fill="#0f172a" />
      <text x={x + width / 2} y={y - 22} fill="#ffffff" textAnchor="middle" fontSize={10} fontWeight="800">{formattedValue}</text>
    </g>
  );
};

const renderMonthlyBarLabel = (props: any) => {
  const { x, y, width, value, index } = props;
  if (index !== 5) return null; // June
  const formattedValue = `₹${(value / 1000).toFixed(1)}K`;
  return (
    <g>
      <rect x={x + width / 2 - 30} y={y - 38} width={60} height={24} rx={12} fill="#0f172a" />
      <path d={`M ${x + width / 2 - 4} ${y - 14} L ${x + width / 2} ${y - 10} L ${x + width / 2 + 4} ${y - 14} Z`} fill="#0f172a" />
      <text x={x + width / 2} y={y - 22} fill="#ffffff" textAnchor="middle" fontSize={10} fontWeight="800">{formattedValue}</text>
    </g>
  );
};

const renderYearlyBarLabel = (props: any) => {
  const { x, y, width, value, index } = props;
  if (index !== 5) return null; // 2026
  const formattedValue = `₹${(value / 1000).toFixed(0)}K`;
  return (
    <g>
      <rect x={x + width / 2 - 30} y={y - 38} width={60} height={24} rx={12} fill="#0f172a" />
      <path d={`M ${x + width / 2 - 4} ${y - 14} L ${x + width / 2} ${y - 10} L ${x + width / 2 + 4} ${y - 14} Z`} fill="#0f172a" />
      <text x={x + width / 2} y={y - 22} fill="#ffffff" textAnchor="middle" fontSize={10} fontWeight="800">{formattedValue}</text>
    </g>
  );
};

const getBarColor = (amount: number, prev: number, isFirst: boolean) => {
  if (isFirst) return '#10B981';
  if (amount > prev) return '#10B981';
  if (amount < prev) return '#F43F5E';
  return '#F59E0B';
};

export function DoctorProfile() {
  // --- STATE MANAGEMENT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: getDoctorDisplayName(),
    specialty: getDoctorSpecialty(),
    email: getDoctorEmail(),
    phone: "+1 234-567-8900",
    license: "MC-2015-45678",
    photoUrl: aiAvatarImage
  });

  useEffect(() => {
    const storedProfile = getStoredDoctorProfile();
    if (storedProfile) {
      setProfile((prev) => ({
        ...prev,
        name: getDoctorDisplayName(),
        specialty: getDoctorSpecialty(),
        email: getDoctorEmail(),
        phone: storedProfile.mobile || prev.phone,
      }));
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const weeklyRevenueData = [
    { day: 'Mon', amount: 4200, prev: 4200 },
    { day: 'Tue', amount: 5800, prev: 4200 },
    { day: 'Wed', amount: 5800, prev: 5800 },
    { day: 'Thu', amount: 4500, prev: 5800 },
    { day: 'Fri', amount: 6200, prev: 4500 },
    { day: 'Sat', amount: 3100, prev: 6200 },
    { day: 'Sun', amount: 3100, prev: 3100 },
  ];

  const monthlyRevenueData = [
    { month: 'Jan', amount: 31000, prev: 31000 },
    { month: 'Feb', amount: 28000, prev: 31000 },
    { month: 'Mar', amount: 45280, prev: 28000 },
    { month: 'Apr', amount: 35000, prev: 45280 },
    { month: 'May', amount: 41000, prev: 35000 },
    { month: 'Jun', amount: 41000, prev: 41000 },
  ];

  const yearlyRevenueData = [
    { year: '2021', amount: 320000, prev: 320000 },
    { year: '2022', amount: 380000, prev: 320000 },
    { year: '2023', amount: 350000, prev: 380000 },
    { year: '2024', amount: 420000, prev: 350000 },
    { year: '2025', amount: 420000, prev: 420000 },
    { year: '2026', amount: 480000, prev: 420000 },
  ];

  const satisfactionData = [
    { name: '5 Stars', value: 680 },
    { name: '4 Stars', value: 140 },
    { name: '3 Stars', value: 30 },
    { name: 'Below 3', value: 6 },
  ];
  const COLORS = ['#163CC7', '#4F6FE5', 'var(--muted)', 'var(--border)'];

  return (
    <div className="max-w-[1400px] mx-auto p-8 bg-slate-50 dark:bg-slate-950 space-y-8 relative">
      
      {/* --- EDIT PROFILE MODAL (OVERLAY) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Edit Profile</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              {/* Profile Photo Option */}
              <div className="flex flex-col items-center gap-3">
                <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-850 rounded-full border-4 border-white dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden relative">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-slate-400 dark:text-slate-500" />
                    )}
                    {/* Hover state overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoChange}
                />
                <label htmlFor="avatar-upload" className="text-[10px] font-black text-[#163CC7] dark:text-[#4F6FE5] uppercase tracking-widest cursor-pointer hover:underline">
                  Change Photo
                </label>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Specialty</label>
                  <input 
                    type="text" 
                    value={profile.specialty}
                    onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Phone</label>
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7]/20"
                  />
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-full bg-[#163CC7] hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your professional profile</p>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="text-slate-400 dark:text-slate-500 hover:text-[#163CC7] dark:hover:text-[#4F6FE5] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Edit2 size={16} /> <span className="text-sm font-bold">Edit Profile</span>
        </button>
      </div>

      {/* --- MAIN PROFILE CARD --- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Camera size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                <p className="text-[#163CC7] dark:text-[#4F6FE5] font-semibold">{profile.specialty}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-wider">License: {profile.license}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Mail className="text-slate-400 dark:text-slate-500" size={20} />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Email</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-slate-400 dark:text-slate-500" size={20} />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Phone</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-slate-400 dark:text-slate-500" size={20} />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Location</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ClinicCortex Hospital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                <Briefcase size={18} /> <span className="text-xs font-black uppercase">Experience</span>
              </div>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-300">12 years</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                <Calendar size={18} /> <span className="text-xs font-black uppercase">Total Patients</span>
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-200">1,234</p>
            </div>
            <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-2">
                <Award size={18} /> <span className="text-xs font-black uppercase">Consultations</span>
              </div>
              <p className="text-3xl font-black text-purple-700 dark:text-purple-300">5,678</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS DASHBOARD --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center"><TrendingUp /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Net Revenue</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">₹45,280</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+12.5%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center"><Star /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Satisfaction</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">4.9/5</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-[#163CC7] dark:text-[#4F6FE5] rounded-xl flex items-center justify-center"><MessageCircle /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Remarks</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">856</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDUCATION & CERTIFICATIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="text-[#163CC7] dark:text-[#4F6FE5]" size={24} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Education</h3>
          </div>
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-50 dark:border-slate-805 last:border-0">
              <p className="font-bold text-slate-800 dark:text-slate-200">MD - Doctor of Medicine</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Harvard Medical School</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">2010</p>
            </div>
            <div className="pb-4 border-b border-slate-50 dark:border-slate-805 last:border-0">
              <p className="font-bold text-slate-800 dark:text-slate-200">Cardiology Residency</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Johns Hopkins Hospital</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">2013</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Fellowship in Interventional Cardiology</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Mayo Clinic</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">2015</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <Award className="text-[#163CC7] dark:text-[#4F6FE5]" size={24} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Certifications & Awards</h3>
          </div>
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-50 dark:border-slate-805 last:border-0">
              <p className="font-bold text-slate-800 dark:text-slate-200">Board Certified - American Board of Internal Medicine</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Issued: 2013</p>
            </div>
            <div className="pb-4 border-b border-slate-50 dark:border-slate-805 last:border-0">
              <p className="font-bold text-slate-800 dark:text-slate-200">Advanced Cardiac Life Support (ACLS)</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Issued: 2022</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Echocardiography Certification</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Issued: 2021</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">About</h3>
        <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
          <p>
            Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in cardiovascular medicine. 
            She specializes in interventional cardiology and has performed thousands of successful procedures. 
            Dr. Johnson is passionate about preventive cardiology and patient education, helping patients understand and manage their heart health.
          </p>
          <p>
            She completed her medical degree at Harvard Medical School and her cardiology fellowship at Mayo Clinic. 
            Dr. Johnson is an active member of the American College of Cardiology and regularly contributes to peer-reviewed journals. 
            She is committed to providing compassionate, evidence-based care to all her patients.
          </p>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* --- WEEKLY REVENUE CHART --- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Weekly Revenue</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">Total revenue per day</p>
                <div className="flex gap-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span>Growth</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" /><span>Drop</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /><span>Stable</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span>Weekly</span>
              <SlidersHorizontal size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenueData} barSize={28} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={false} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }} />
                <Bar 
                  dataKey="amount" 
                  background={{ fill: 'var(--muted)', radius: 14 }} 
                  radius={14}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {weeklyRevenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.amount, entry.prev, index === 0)} 
                    />
                  ))}
                  <LabelList dataKey="amount" content={renderWeeklyBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- MONTHLY REVENUE CHART --- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Monthly Revenue</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">Total revenue per month</p>
                <div className="flex gap-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span>Growth</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" /><span>Drop</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /><span>Stable</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span>Monthly</span>
              <SlidersHorizontal size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} barSize={32} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={false} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }} />
                <Bar 
                  dataKey="amount" 
                  background={{ fill: 'var(--muted)', radius: 16 }} 
                  radius={16}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {monthlyRevenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.amount, entry.prev, index === 0)} 
                    />
                  ))}
                  <LabelList dataKey="amount" content={renderMonthlyBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- YEARLY REVENUE CHART --- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Yearly Revenue</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">Total revenue per year</p>
                <div className="flex gap-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span>Growth</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" /><span>Drop</span></div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /><span>Stable</span></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span>Yearly</span>
              <SlidersHorizontal size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyRevenueData} barSize={32} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={false} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }} />
                <Bar 
                  dataKey="amount" 
                  background={{ fill: 'var(--muted)', radius: 16 }} 
                  radius={16}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {yearlyRevenueData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.amount, entry.prev, index === 0)} 
                    />
                  ))}
                  <LabelList dataKey="amount" content={renderYearlyBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- PATIENT SATISFACTION CHART --- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[350px]">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Patient Satisfaction</h3>
          <div className="flex items-center h-full">
            <div className="h-[200px] w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-1/2">
              {satisfactionData.map((entry, index) => (
                <div key={index} className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index] }} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}