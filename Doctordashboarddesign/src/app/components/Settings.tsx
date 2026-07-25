import { ChangeEvent, useEffect, useState } from "react";
import { getDoctorDisplayName, getDoctorEmail, getStoredDoctorProfile } from "../lib/doctorProfile";
import { api } from "../lib/api";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  zip: string;
};

export function Settings() {
  const [activeTab, setActiveTab] = useState("editProfile");
  const [profile, setProfile] = useState<Profile>({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@clinic.com",
    phone: "+1 234 567 890",
    country: "USA",
    city: "San Francisco",
    address: "123 Healthcare Ave",
    zip: "94107",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [preference, setPreference] = useState({ language: "English", timezone: "UTC-7", darkMode: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.get('/doctors/profile');
        if (res.success && res.profile) {
          const d = res.profile;
          setProfile({
            firstName: d.first_name || "",
            lastName: d.last_name || "",
            email: d.personal_email || d.email || "",
            phone: d.mobile || "",
            country: d.nationality || "India",
            city: d.city || "",
            address: d.clinic_address || "",
            zip: d.pincode || "",
          });
        }
      } catch (err) {
        console.warn("Could not load doctor profile from API, fallback to local storage", err);
        const stored = getStoredDoctorProfile();
        if (stored) {
          setProfile((prev) => ({
            ...prev,
            firstName: stored.firstName || prev.firstName,
            lastName: stored.lastName || prev.lastName,
            email: stored.profEmail || prev.email,
            phone: stored.mobile || prev.phone,
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);
  const [privacySettings, setPrivacySettings] = useState({ analytics: true, recommendations: false, dataShare: false });

  useEffect(() => {
    if (preference.darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [preference.darkMode]);

  // Initialize darkMode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setPreference((prev) => ({ ...prev, darkMode: savedDarkMode }));
  }, []);

  // Apply dark mode and persist to localStorage
  useEffect(() => {
    if (preference.darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", preference.darkMode.toString());
  }, [preference.darkMode]);

  const updateProfile = (key: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updatePassword = (key: keyof typeof passwords, value: string) => {
    setPasswords((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/doctors/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        personalEmail: profile.email,
        mobile: profile.phone,
        nationality: profile.country,
        city: profile.city,
        clinicAddress: profile.address,
        pincode: profile.zip
      });
      if (res.success) {
        alert("Profile saved successfully.");
        // Sync local storage so header layout updates instantly
        const stored = localStorage.getItem("clinic_cortex_verified_doctor");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem("clinic_cortex_verified_doctor", JSON.stringify({
          ...parsed,
          firstName: profile.firstName,
          lastName: profile.lastName,
          profEmail: profile.email,
          mobile: profile.phone
        }));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.newPass || passwords.newPass.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/doctors/password', {
        oldPassword: passwords.current,
        newPassword: passwords.newPass
      });
      if (res.success) {
        alert("Password updated successfully.");
        setPasswords({ current: "", newPass: "", confirm: "" });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`Uploaded: ${file.name}`);
    }
  };

  const toggleDarkMode = () => {
    setPreference((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <div className="max-w-[1200px] mx-auto mt-8 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>

        <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 flex-wrap">
          {[
            { id: "editProfile", label: "Edit Profile" },
            { id: "preferences", label: "Preferences" },
            { id: "security", label: "Security" },
            { id: "dataPrivacy", label: "Data Privacy" },
            { id: "aboutUs", label: "About Us" },
            { id: "faq", label: "FAQ" },
            { id: "privacyPolicy", label: "Privacy Policy" },
            { id: "logout", label: "Logout" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-[#4F6FE5] text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 p-8">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-6 text-center">
              <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#163CC7] to-[#4F6FE5] flex items-center justify-center text-white text-2xl font-bold">{getDoctorDisplayName().replace(/^Dr\.\s*/i, "").split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{getDoctorDisplayName()}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Medical Practitioner</p>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-[#163CC7] dark:text-[#4F6FE5] cursor-pointer">
                <input type="file" className="hidden" onChange={handleFile} />
                <span className="px-3 py-1 bg-white dark:bg-slate-600 border border-[#163CC7] dark:border-[#4F6FE5] rounded-full">Upload profile</span>
              </label>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            {activeTab === "editProfile" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">First Name</label>
                    <input
                      value={profile.firstName}
                      onChange={(e) => updateProfile("firstName", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Last Name</label>
                    <input
                      value={profile.lastName}
                      onChange={(e) => updateProfile("lastName", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Email Address</label>
                    <input
                      value={profile.email}
                      onChange={(e) => updateProfile("email", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Phone Number</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Personal Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Country</label>
                    <input
                      value={profile.country}
                      onChange={(e) => updateProfile("country", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">City</label>
                    <input
                      value={profile.city}
                      onChange={(e) => updateProfile("city", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Address</label>
                    <input
                      value={profile.address}
                      onChange={(e) => updateProfile("address", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Zip Code</label>
                    <input
                      value={profile.zip}
                      onChange={(e) => updateProfile("zip", e.target.value)}
                      className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                    />
                  </div>
                </div>

                <button onClick={handleSaveProfile} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#163CC7] to-[#4F6FE5] text-white font-semibold">Save Changes</button>
              </div>
            )}

            {activeTab === "preferences" && (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h3>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Language</label>
        <select
          value={preference.language}
          onChange={(e) => setPreference((prev) => ({ ...prev, language: e.target.value }))}
          className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#163CC7]"
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Timezone</label>
        <select
          value={preference.timezone}
          onChange={(e) => setPreference((prev) => ({ ...prev, timezone: e.target.value }))}
          className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#163CC7]"
        >
          <option>UTC-7</option>
          <option>UTC-5</option>
          <option>UTC+0</option>
        </select>
      </div>
    </div>

    {/* THE ADVANCED TOGGLE */}
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:border-[#163CC7]/30">
      <div>
        <p className="text-lg font-bold text-slate-800 dark:text-white">Dark Mode</p>
        <p className="text-sm text-slate-500">Switch between light and dark themes</p>
      </div>

      <div 
        onClick={toggleDarkMode}
        className={`theme-toggle-track ${preference.darkMode ? 'track-dark' : 'track-light'}`}
      >
        {/* Background Decorations (Clouds/Stars) */}
        <div className={`bg-deco transition-all duration-500 ${preference.darkMode ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
           <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-pulse" />
           <div className="absolute top-5 left-8 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
           <div className="absolute top-2 left-10 w-0.5 h-0.5 bg-white rounded-full" />
        </div>

        <div className={`bg-deco transition-all duration-500 ${!preference.darkMode ? 'translate-y-0' : 'translate-y-[-20px] opacity-0'}`}>
           <div className="absolute bottom-1 left-2 w-8 h-3 bg-white/40 rounded-full blur-[1px]" />
           <div className="absolute bottom-2 right-2 w-6 h-2 bg-white/60 rounded-full blur-[1px]" />
        </div>

        {/* The Orb */}
        <div className={`orb ${preference.darkMode ? 'orb-moon' : 'orb-sun'}`}>
          {preference.darkMode && (
            <>
              <div className="crater top-[20%] left-[20%] w-1.5 h-1.5" />
              <div className="crater top-[50%] left-[40%] w-2.5 h-2.5" />
              <div className="crater top-[30%] right-[20%] w-1 h-1" />
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}

            {activeTab === "security" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Security</h3>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => updatePassword("current", e.target.value)}
                  placeholder="Current password"
                  className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="password"
                    value={passwords.newPass}
                    onChange={(e) => updatePassword("newPass", e.target.value)}
                    placeholder="New password"
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                  />
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => updatePassword("confirm", e.target.value)}
                    placeholder="Confirm password"
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#163CC7] dark:focus:ring-[#4F6FE5]"
                  />
                </div>
                <button onClick={handleUpdatePassword} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#163CC7] to-[#4F6FE5] text-white font-semibold">Update Security</button>
              </div>
            )}

            {activeTab === "dataPrivacy" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Data Privacy</h3>
                <label className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Analytics</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Allow usage data collection</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.analytics}
                    onChange={(e) => setPrivacySettings((prev) => ({ ...prev, analytics: e.target.checked }))}
                    className="h-5 w-5 text-[#163CC7] dark:text-[#4F6FE5]"
                  />
                </label>
                <label className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Personalized recommendations</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Use personal data for better content</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.recommendations}
                    onChange={(e) => setPrivacySettings((prev) => ({ ...prev, recommendations: e.target.checked }))}
                    className="h-5 w-5 text-[#163CC7] dark:text-[#4F6FE5]"
                  />
                </label>
                <label className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">Data sharing</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Share anonymized data with partners</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.dataShare}
                    onChange={(e) => setPrivacySettings((prev) => ({ ...prev, dataShare: e.target.checked }))}
                    className="h-5 w-5 text-[#163CC7] dark:text-[#4F6FE5]"
                  />
                </label>
                <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#163CC7] to-[#4F6FE5] text-white font-semibold">Save Privacy Preferences</button>
              </div>
            )}

            {activeTab === "aboutUs" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">About Us</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  ClinicCortex is a cutting-edge doctor dashboard designed to streamline healthcare management. Our platform empowers medical professionals with intuitive tools for patient care, telemedicine, scheduling, and data analytics. Founded in 2023, we are committed to improving healthcare outcomes through technology.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Mission</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">To revolutionize healthcare delivery with innovative digital solutions.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Vision</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">A world where healthcare is accessible, efficient, and patient-centered.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white">How do I start a virtual consultation?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Navigate to the Virtual Consultations page and click "Start Consultation" to initiate a video call with your patient.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white">How can I update patient records?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Go to the Patient Records section, select a patient, and use the edit options to update their information.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Is my data secure?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Yes, we use industry-standard encryption and comply with HIPAA regulations to ensure your data is protected.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacyPolicy" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information. We comply with all relevant data protection laws and ensure that your medical data is handled with the utmost confidentiality.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Data Collection</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">We collect information you provide directly, such as profile details and usage data to improve our services.</p>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Data Usage</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your data is used to provide our services, improve user experience, and comply with legal requirements.</p>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Contact Us</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">For privacy concerns, email us at privacy@cliniccortex.com.</p>
                </div>
              </div>
            )}

            {activeTab === "logout" && (
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Logout</h3>
                <p className="text-slate-600 dark:text-slate-400">Are you sure you want to log out? This will end your current session.</p>
                <button className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
