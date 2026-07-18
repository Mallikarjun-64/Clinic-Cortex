export type DoctorProfileRecord = Partial<{
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  profilePhoto: string;
  aadhar: string;
  pan: string;
  passport: string;
  mobile: string;
  whatsapp: string;
  profEmail: string;
  clinicAddress: string;
  homeAddress: string;
  city: string;
  state: string;
  pincode: string;
  regNo: string;
  smcName: string;
  mbbsUni: string;
  mbbsYear: string;
  pgDegree: string;
  pgSpecialization: string;
  expYears: number;
  bio: string;
  password: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}>;

const DOCTOR_STORAGE_KEY = "clinic_cortex_verified_doctor";

export function getStoredDoctorProfile(): DoctorProfileRecord | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DOCTOR_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DoctorProfileRecord;
  } catch (err) {
    console.error("Failed to parse stored doctor profile", err);
    return null;
  }
}

export function getDoctorDisplayName(): string {
  const profile = getStoredDoctorProfile();
  if (!profile) return "Dr. Sarah Johnson";
  if (profile.firstName || profile.lastName) {
    const name = [profile.salutation || "Dr.", profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    return name || "Dr. Sarah Johnson";
  }
  if (profile.profEmail) {
    const username = profile.profEmail.split("@")[0];
    return `Dr. ${username}`;
  }
  return "Dr. Sarah Johnson";
}

export function getDoctorInitials(): string {
  const displayName = getDoctorDisplayName().replace(/^Dr\.\s*/i, "").trim();
  const parts = displayName.split(" ").filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getDoctorEmail(): string {
  const profile = getStoredDoctorProfile();
  return profile?.profEmail || "doctor@cliniccortex.com";
}

export function getDoctorSpecialty(): string {
  const profile = getStoredDoctorProfile();
  return profile?.pgSpecialization || profile?.specialty || "General Practitioner";
}
