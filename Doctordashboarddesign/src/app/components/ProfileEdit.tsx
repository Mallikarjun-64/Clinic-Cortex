import { FormEvent, useState, useEffect } from "react";
import { getDoctorDisplayName, getDoctorEmail, getDoctorSpecialty, getStoredDoctorProfile } from "../lib/doctorProfile";

export function ProfileEdit() {
  const [name, setName] = useState(getDoctorDisplayName());
  const [email, setEmail] = useState(getDoctorEmail());
  const [specialty, setSpecialty] = useState(getDoctorSpecialty());
  const [bio, setBio] = useState("Clinical experience with heart failure and interventional cardiology.");
  const [certifications, setCertifications] = useState("ACLS, BLS, PALS");
  const [profileFile, setProfileFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = getStoredDoctorProfile();
    if (stored) {
      setName(getDoctorDisplayName());
      setEmail(getDoctorEmail());
      setSpecialty(getDoctorSpecialty());
    }
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    alert("Profile saved successfully.");
  };

  return (
    <div className="max-w-[900px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Edit Doctor Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Specialty</label>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#163CC7]" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Certification</label>
            <input
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="ACLS, BLS, PALS"
              className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#163CC7]"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-600">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#163CC7]" rows={4} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Upload credentials</label>
          <input type="file" onChange={(e) => setProfileFile(e.target.files ? e.target.files[0] : null)} className="w-full mt-1" />
          {profileFile && <span className="text-xs text-slate-500">Uploaded: {profileFile.name}</span>}
        </div>
        <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#163CC7] to-[#4F6FE5] text-white hover:from-[#163CC7]-600 hover:to-[#4F6FE5]-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}