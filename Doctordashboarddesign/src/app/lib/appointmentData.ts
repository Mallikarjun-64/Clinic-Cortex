export const APPOINTMENTS_STORAGE_KEY = "cliniccortex-appointments";

export type Appointment = {
  id: number;
  patient: string;
  age: number;
  type: string;
  date: string;
  time: string;
  status: string;
  condition: string;
};

export type RequestItem = {
  id: number;
  patientName: string;
  requestTime: string;
  type: string;
  urgency: string;
  notes: string;
};

export const defaultAppointments: Appointment[] = [
  { id: 1, patient: "John Smith", age: 45, type: "Clinic", date: "Apr 2, 2026", time: "09:00 AM", status: "Confirmed", condition: "Follow-up" },
  { id: 2, patient: "Emma Wilson", age: 32, type: "Video", date: "Apr 2, 2026", time: "10:30 AM", status: "Confirmed", condition: "Consultation" },
  { id: 3, patient: "Michael Brown", age: 58, type: "Clinic", date: "Apr 2, 2026", time: "11:00 AM", status: "Waiting", condition: "Check-up" },
  { id: 4, patient: "Sarah Davis", age: 41, type: "Home", date: "Apr 2, 2026", time: "02:00 PM", status: "Scheduled", condition: "Home Visit" },
  { id: 5, patient: "James Miller", age: 36, type: "Clinic", date: "Apr 2, 2026", time: "03:30 PM", status: "Confirmed", condition: "New Patient" },
  { id: 6, patient: "Olivia Taylor", age: 29, type: "Video", date: "Mar 30, 2026", time: "01:00 PM", status: "Completed", condition: "Diet Consultation" },
  { id: 7, patient: "Ethan Carter", age: 51, type: "Clinic", date: "Mar 29, 2026", time: "04:15 PM", status: "Completed", condition: "Hypertension Review" },
  { id: 8, patient: "Mia Patel", age: 38, type: "Home", date: "Mar 28, 2026", time: "11:45 AM", status: "Cancelled", condition: "Physiotherapy" },
  { id: 9, patient: "Noah Lee", age: 44, type: "Video", date: "Mar 27, 2026", time: "09:30 AM", status: "Cancelled", condition: "Mental Health" },
  { id: 10, patient: "Ava Roberts", age: 47, type: "Clinic", date: "Mar 26, 2026", time: "03:00 PM", status: "Missed", condition: "Cardiology Follow-up" },
  { id: 11, patient: "Lucas Green", age: 33, type: "Clinic", date: "Mar 25, 2026", time: "10:00 AM", status: "Missed", condition: "Orthopedic" },
];

export function loadAppointments(): Appointment[] {
  if (typeof window === "undefined") return defaultAppointments;

  try {
    const stored = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!stored) return defaultAppointments;
    const parsed = JSON.parse(stored) as Appointment[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAppointments;
  } catch {
    return defaultAppointments;
  }
}

export function saveAppointments(appointments: Appointment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
}

export function addTopAppointment(appointment: Omit<Appointment, "id">) {
  const current = loadAppointments();
  const nextId = current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const nextAppointments = [{ ...appointment, id: nextId }, ...current];
  saveAppointments(nextAppointments);
  return nextAppointments;
}

export function createAppointmentFromRequest(req: RequestItem): Omit<Appointment, "id"> {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const mapping: Record<string, { type: string; condition: string; time: string; age: number }> = {
    "Prescription Refill": { type: "Clinic", condition: "Prescription Refill", time: "09:00 AM", age: 42 },
    "Virtual Consult": { type: "Video", condition: "Virtual Consultation", time: "10:00 AM", age: 36 },
    "Appointment Change": { type: "Clinic", condition: "Rescheduled Appointment", time: "11:00 AM", age: 39 },
    "Medical Record Request": { type: "Clinic", condition: "Records Review", time: "11:30 AM", age: 34 },
  };

  const selected = mapping[req.type] ?? { type: "Clinic", condition: req.type, time: "09:00 AM", age: 40 };

  return {
    patient: req.patientName,
    age: selected.age,
    type: selected.type,
    date,
    time: selected.time,
    status: "Confirmed",
    condition: selected.condition,
  };
}
