import { useState, type KeyboardEvent } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  Video,
  Home,
  Users,
  FileText,
  Clock,
  MessageSquare,
  User,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logoImage from "../../assets/logo.png";
import { getDoctorDisplayName, getDoctorSpecialty, getDoctorInitials } from "../lib/doctorProfile";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const searchItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Appointments", path: "/dashboard/appointments" },
    { label: "Virtual Consultations", path: "/dashboard/virtual-consultation" },
    { label: "Home Visits", path: "/dashboard/home-visits" },
    { label: "Patients", path: "/dashboard/patients" },
    { label: "Patient Records", path: "/dashboard/patient-records" },
    { label: "Schedule", path: "/dashboard/schedule" },
    { label: "Notifications", path: "/dashboard/notifications" },
    { label: "Inbox", path: "/dashboard/inbox" },
  ];

  const filteredSearch = globalSearch.trim()
    ? searchItems.filter((item) => item.label.toLowerCase().includes(globalSearch.trim().toLowerCase()))
    : [];

  const handleHeaderSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSearch.length > 0) {
      navigate(filteredSearch[0].path);
      setGlobalSearch("");
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { path: "/dashboard/virtual-consultation", label: "Virtual Consultations", icon: Video },
    { path: "/dashboard/home-visits", label: "Home Visits", icon: Home },
    { path: "/dashboard/patients", label: "Patients", icon: Users },
    { path: "/dashboard/patient-records", label: "Patient Records", icon: FileText },
    { path: "/dashboard/schedule", label: "Schedule / Calendar", icon: Clock },
    { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { path: "/dashboard/inbox", label: "Inbox", icon: MessageSquare },
    { path: "/dashboard/profile", label: "Doctor Profile", icon: User },
    { path: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* GLASSMORPHIC SIDEBAR 
          - Removed 'overflow-hidden' from this container so the button can show
      */}
      <aside
        className={`relative z-50 h-[calc(100vh-2rem)] m-4 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
        bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2.5rem] 
        ${sidebarCollapsed ? "w-24" : "w-72"}`}
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 shrink-0 relative">
          <div className="flex items-center gap-4">
            <div className={`p-2 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-500 ${sidebarCollapsed ? 'mx-auto' : ''}`}>
              <img src={logoImage} alt="ClinicCortex" className="w-8 h-8 object-contain" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-black text-xl tracking-tight text-[#163CC7] dark:text-blue-400">
                ClinicCortex
              </span>
            )}
          </div>
          
          {/* TOGGLE BUTTON 
              - Increased width/height for better interaction
              - Adjusted positioning to -right-5 to ensure full visibility
          */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-5 top-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center text-slate-400 hover:text-[#163CC7] transition-all z-[60]"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* SCROLLABLE NAVIGATION
            - overflow-y-auto and overflow-hidden are applied here to contain the scrollbar
            - rounded-b-[2.5rem] keeps the glassmorphic shape at the bottom
        */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-4 custom-scrollbar rounded-b-[2.5rem]">
          <ul className="space-y-3 pb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 relative ${
                      active
                        ? "bg-[#163CC7] text-white shadow-lg shadow-blue-500/30 translate-x-1"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-1"
                    } ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
                  >
                    {active && sidebarCollapsed && (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl" />
                    )}
                    
                    <Icon 
                      size={22} 
                      className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400'}`} 
                    />
                    
                    {!sidebarCollapsed && (
                      <span className="relative z-10 font-bold text-[0.95rem] tracking-tight whitespace-nowrap">
                        {item.label}
                      </span>
                    )}

                    {active && !sidebarCollapsed && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-transparent flex items-center justify-between px-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#163CC7] transition-colors" size={18} />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleHeaderSearchKeyDown}
                placeholder="Search patients, appointments..."
                className="w-full pl-12 pr-6 py-3 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#163CC7]/5 shadow-sm transition-all text-sm font-medium"
              />
              {globalSearch.trim() && (
                <div className="absolute left-0 top-full mt-2 w-full rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50 overflow-hidden">
                  {filteredSearch.length > 0 ? (
                    filteredSearch.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setGlobalSearch("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm text-slate-700 dark:text-slate-200"
                      >
                        {item.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500">No results found for "{globalSearch.trim()}"</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/dashboard/notifications")} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button onClick={() => navigate("/dashboard/inbox")} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all relative">
                <MessageSquare size={20} className="text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#163CC7] rounded-full border-2 border-white"></span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("cliniccortex-auth");
                  navigate("/login", { replace: true });
                }}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all"
              >
                <LogOut size={20} className="text-slate-600" />
                <span className="sr-only">Logout</span>
              </button>
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-slate-800 dark:text-white leading-tight">{getDoctorDisplayName()}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{getDoctorSpecialty()}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#163CC7] shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-black text-sm">
                {getDoctorInitials()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}