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

export const defaultAppointments: Appointment[] = [];

export function loadAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Appointment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
