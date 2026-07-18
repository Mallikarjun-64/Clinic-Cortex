import { createBrowserRouter, Navigate, useRouteError } from "react-router";
import type { ReactNode } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { VirtualConsultation } from "./components/VirtualConsultation";
import { HomeVisits } from "./components/HomeVisits";
import { Patients } from "./components/Patients";
import { PatientRecords } from "./components/PatientRecords";
import { Schedule } from "./components/Schedule";
import { Inbox } from "./components/Inbox";
import { Notifications } from "./components/Notifications";
import { DoctorProfile } from "./components/DoctorProfile";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { ProfileEdit } from "./components/ProfileEdit";
import { CompletedVisits } from "./components/CompletedVisits";
import { TotalPatientsStat } from "./components/TotalPatientsStat";
import { TodayAppointmentsStat } from "./components/TodayAppointmentsStat";
import { PendingRequestsStat } from "./components/PendingRequestsStat";

const AUTH_KEY = "cliniccortex-auth";

const isAuthenticated = () => typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "true";

function RequireAuth({ children }: { children: ReactNode }) {
  if (typeof window === "undefined") {
    return null;
  }
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function HomeRedirect() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function FallbackRedirect() {
  return <Navigate to="/login" replace />;
}

function RouteError() {
  const error = useRouteError();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-3xl border border-slate-200 p-10 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Something went wrong</h1>
        <p className="text-slate-600 mb-6">An unexpected error occurred while loading this page.</p>
        <pre className="text-left text-xs text-slate-500 bg-slate-100 rounded-2xl p-4 overflow-x-auto">{String(error)}</pre>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/login" className="px-5 py-3 rounded-2xl bg-[#163CC7] text-white font-semibold">Go to Login</a>
          <button onClick={() => window.location.reload()} className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700">Reload</button>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  { path: "/profile-edit", Component: ProfileEdit },
  {
    path: "/dashboard",
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: Dashboard },
      { path: "appointments", Component: Appointments },
      { path: "virtual-consultation", Component: VirtualConsultation },
      { path: "home-visits", Component: HomeVisits },
      { path: "patients", Component: Patients },
      { path: "patient-records", Component: PatientRecords },
      { path: "schedule", Component: Schedule },
      { path: "notifications", Component: Notifications },
      { path: "messages", Component: Inbox },
      { path: "inbox", Component: Inbox },
      { path: "profile", Component: DoctorProfile },
      { path: "settings", Component: Settings },
      {
        path: "stats",
        children: [
          { path: "total-patients", Component: TotalPatientsStat },
          { path: "today", Component: TodayAppointmentsStat },
          { path: "pending", Component: PendingRequestsStat },
          { path: "completed", Component: CompletedVisits },
        ]
      },
    ],
  },
  { path: "*", element: <FallbackRedirect /> },
]);
