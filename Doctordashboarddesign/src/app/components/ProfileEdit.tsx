import { FormEvent, useState, useEffect } from "react";
import { getDoctorDisplayName, getDoctorEmail, getDoctorSpecialty, getStoredDoctorProfile } from "../lib/doctorProfile";
import { api } from "../lib/api";

export function ProfileEdit() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(getDoctorEmail());
  const [specialty, setSpecialty] = useState(getDoctorSpecialty());
  const [bio, setBio] = useState("Clinical experience with heart failure and interventional cardiology.");
  const [certifications, setCertifications] = useState("ACLS, BLS, PALS");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.get('/doctors/profile');
        if (res.success && res.profile) {
          const d = res.profile;
          setFirstName(d.first_name || "");
          setLastName(d.last_name || "");
          setEmail(d.personal_email || d.email || "");
          setSpecialty(d.pg_specialization || "");
          setBio(d.bio || "");
          setCertifications(d.additional_certs || "");
        }
      } catch (err) {
        console.warn("Could not load doctor profile from API", err);
        const stored = getStoredDoctorProfile();
        if (stored) {
          setFirstName(stored.firstName || "");
          setLastName(stored.lastName || "");
          setEmail(stored.profEmail || "");
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/doctors/profile', {
        firstName,
        lastName,
        personalEmail: email,
        pgSpecialization: specialty,
        additionalCerts: certifications,
        bio
      });
      if (res.success) {
        alert("Profile saved successfully.");
        // Sync local storage so header layout updates instantly
        const stored = localStorage.getItem("clinic_cortex_verified_doctor");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem("clinic_cortex_verified_doctor", JSON.stringify({
          ...parsed,
          firstName,
          lastName,
          profEmail: email
        }));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mt-8">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Edit Doctor Profile</h2>
      {loading && (
        <div className="py-2 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#163CC7]" />
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Specialty</label>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-400">Certifications</label>
          <input
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="ACLS, BLS, PALS"
            className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-400">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#163CC7]" rows={4} />
        </div>
        <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#163CC7] to-[#4F6FE5] text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700 font-bold">
          Save Changes
        </button>
      </form>
    </div>
  );
}