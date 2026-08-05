import { useState, useEffect, type ReactNode } from "react";
import {
  Menu, MapPin, Bell, MessageCircle, Home, Search, Calendar, ShoppingCart,
  Settings as Cog, X, FileText, FlaskConical, ClipboardList, Receipt, LogOut,
  Wallet, ArrowRightLeft, Sparkles, BookOpen, Info, MessageSquareHeart,
  Map, Siren, Stethoscope, Pill, ChevronLeft, Video
} from "lucide-react";
import { useCC, type Screen } from "@/lib/cc-state";
import { api } from "@/lib/api";
import * as Screens from "./cc-screens";

const TAB_KEYS: { id: Screen; key: string; icon: React.ElementType }[] = [
  { id: "home", key: "home", icon: Home },
  { id: "search", key: "search", icon: Search },
  { id: "appointments", key: "appointment", icon: Calendar },
  { id: "pharmacy", key: "pharmacy", icon: ShoppingCart },
  { id: "settings", key: "settings", icon: Cog },
];

const DRAWER: { id: Screen; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "appointments", label: "Appointment", icon: Calendar },
  { id: "prescription", label: "Prescription", icon: Pill },
  { id: "lab-reports", label: "Lab wise report", icon: FlaskConical },
  { id: "my-reports", label: "My reports", icon: FileText },
  { id: "bills", label: "Bills & Memos", icon: Receipt },
  { id: "discharge", label: "Discharge Details", icon: ClipboardList },
  { id: "wallet", label: "Digital Wallet", icon: Wallet },
  { id: "transactions", label: "CC Transactions", icon: ArrowRightLeft },
  { id: "ai-analyzer", label: "AI Analyzer", icon: Sparkles },
  { id: "guidelines", label: "Guidelines for patients", icon: BookOpen },
  { id: "about", label: "About us", icon: Info },
  { id: "feedback", label: "Feedback", icon: MessageSquareHeart },
  { id: "settings", label: "Settings", icon: Cog },
  { id: "location", label: "Location", icon: Map },
  { id: "emergency", label: "Emergency (SOS)", icon: Siren, danger: true },
];

export function AppShell() {
  const { screen, setScreen, drawer, setDrawer, setFlow, t, user } = useCC();
  const [notif, setNotif] = useState(3);
  const [activeCallNotification, setActiveCallNotification] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => {
    async function checkNotifications() {
      try {
        const res = await api.get('/notifications');
        if (res.success && Array.isArray(res.notifications)) {
          setNotif(res.notifications.length);
          const callNotif = res.notifications.find((n: any) =>
            !n.is_read && (n.notification_type === 'video_call' || n.category === 'Urgent' || (n.title && n.title.includes('Call')))
          );
          if (callNotif) {
            setActiveCallNotification(callNotif);
          }
        }
      } catch (err) {
        // silent catch
      }
    }

    checkNotifications();
    const interval = setInterval(checkNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const render = (): ReactNode => {
    switch (screen) {
      case "home": return <Screens.HomeScreen />;
      case "appointments": return <Screens.AppointmentsScreen />;
      case "doctor-detail": return <Screens.DoctorDetail />;
      case "booking": return <Screens.BookingScreen />;
      case "chat": return <Screens.ChatScreen />;
      case "vitals": return <Screens.VitalsScreen />;
      case "glucose": return <Screens.GlucoseScreen />;
      case "search": return <Screens.SearchScreen />;
      case "pharmacy": return <Screens.PharmacyScreen />;
      case "wallet": return <Screens.WalletScreen />;
      case "transactions": return <Screens.TransactionsScreen />;
      case "ai-analyzer": return <Screens.AIAnalyzerScreen />;
      case "settings": return <Screens.SettingsScreen />;
      case "profile": return <Screens.ProfileScreen />;
      case "about": return <Screens.AboutScreen />;
      case "prescription": return <Screens.SimpleListScreen title="Prescriptions" />;
      case "lab-reports": return <Screens.SimpleListScreen title="Lab Reports" />;
      case "my-reports": return <Screens.SimpleListScreen title="My Reports" />;
      case "bills": return <Screens.SimpleListScreen title="Bills & Memos" />;
      case "discharge": return <Screens.SimpleListScreen title="Discharge Details" />;
      case "guidelines": return <Screens.SimpleListScreen title="Guidelines for Patients" />;
      case "feedback": return <Screens.FeedbackScreen />;
      case "location": return <Screens.LocationScreen />;
      case "emergency": return <Screens.EmergencyScreen />;
      case "notifications": return <Screens.NotificationsScreen />;
      default: return <Screens.HomeScreen />;
    }
  };

  const hideTabs = screen === "chat";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] md:max-w-[1200px] md:grid md:grid-cols-[280px_1fr] md:gap-0 relative">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col border-r bg-card sticky top-0 h-screen p-4">
          <DrawerContent inline />
        </aside>

        <div className="flex flex-col min-h-screen">
          {/* Call Alert Banner */}
          {activeCallNotification && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between shadow-lg z-40 animate-bounce">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Video className="w-4 h-4 animate-pulse" />
                <span>{activeCallNotification.title || "Doctor is calling you for Video Consultation!"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowCallModal(true);
                    if (activeCallNotification.id) {
                      api.patch(`/notifications/${activeCallNotification.id}/read`, {});
                    }
                  }}
                  className="px-3 py-1 bg-white text-emerald-700 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50"
                >
                  Join Call
                </button>
                <button onClick={() => setActiveCallNotification(null)} className="p-1 hover:bg-white/20 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {showCallModal && (
            <Screens.VideoCallModal
              appointmentId={activeCallNotification?.appointment_id || activeCallNotification?.appointmentId}
              onClose={() => setShowCallModal(false)}
            />
          )}

          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setDrawer(true)}
                className="md:hidden p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {screen !== "home" && (
                <button onClick={() => setScreen("home")} className="hidden md:flex p-2 rounded-xl hover:bg-muted">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" /> Mumbai
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold leading-none">{t("hello")} {user?.name?.split(" ")[0] || "there"}!</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Stay on top of your health</div>
              </div>
              <button onClick={() => setScreen("notifications")} className="relative p-2 rounded-xl hover:bg-muted active:scale-95 transition-transform">
                <Bell className="w-5 h-5" />
                {notif > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{notif}</span>
                )}
              </button>
              <button onClick={() => setScreen("chat")} className="p-2 rounded-xl hover:bg-muted">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button onClick={() => setScreen("profile")} className="w-9 h-9 rounded-full cc-grad-deep text-white flex items-center justify-center text-sm font-semibold cc-shadow">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </button>
            </div>
          </header>

          <main className={`flex-1 ${hideTabs ? "" : "pb-24 md:pb-8"} cc-scroll`}>
            <div key={screen} className="cc-fade-up">{render()}</div>
          </main>

          {/* Bottom tabs */}
          {!hideTabs && (
            <nav className="md:hidden fixed bottom-0 inset-x-0 max-w-[480px] mx-auto bg-card/95 backdrop-blur border-t z-30">
              <div className="grid grid-cols-5">
                {TAB_KEYS.map((tab) => {
                  const Icon = tab.icon;
                  const active = screen === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setScreen(tab.id)}
                      className="flex flex-col items-center gap-1 py-2.5 active:scale-95 transition-transform"
                    >
                      <div className={`w-10 h-9 rounded-2xl flex items-center justify-center transition-all ${active ? "cc-grad-deep text-white cc-shadow" : "text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{t(tab.key)}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Drawer */}
          {drawer && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40 cc-fade-up" onClick={() => setDrawer(false)} />
              <aside className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-card flex flex-col cc-pop">
                <DrawerContent
                  onPick={(id) => { if (id === "logout") setFlow("gateway"); else setScreen(id); setDrawer(false); }}
                  onClose={() => setDrawer(false)}
                />
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerContent({
  inline = false,
  onPick,
  onClose,
}: { inline?: boolean; onPick?: (id: Screen | "logout") => void; onClose?: () => void }) {
  const { screen, setScreen, setFlow, user, logout } = useCC();
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="cc-grad-deep p-5 text-white relative">
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-semibold">{user?.name || "Guest"}</div>
            <div className="text-xs text-cyan-100">{user?.email || user?.phone || ""}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto cc-scroll p-2">
        {DRAWER.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => (inline ? setScreen(item.id) : onPick?.(item.id))}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                item.danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" :
                active ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => { logout(); if (inline) setFlow("gateway"); else onPick?.("logout"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}