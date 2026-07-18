import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "patient" | "doctor" | "lab";
export type Lang =
  | "en" | "hi" | "kn" | "bn" | "te" | "mr" | "ur" | "gu" | "ml" | "as" | "sa" | "brx" | "ne";
export type Screen =
  | "home" | "appointments" | "prescription" | "lab-reports" | "my-reports"
  | "bills" | "discharge" | "wallet" | "transactions" | "ai-analyzer"
  | "guidelines" | "about" | "feedback" | "settings" | "location" | "emergency"
  | "search" | "pharmacy" | "profile" | "chat" | "vitals" | "glucose"
  | "doctor-detail" | "booking";

export type Flow =
  | "gateway" | "language" | "identity" | "login" | "signup" | "app";

export const LANGUAGES: { code: Lang; native: string; latin: string }[] = [
  { code: "en", native: "English", latin: "English" },
  { code: "hi", native: "हिन्दी", latin: "Hindi" },
  { code: "kn", native: "ಕನ್ನಡ", latin: "Kannada" },
  { code: "bn", native: "বাংলা", latin: "Bangla" },
  { code: "te", native: "తెలుగు", latin: "Telugu" },
  { code: "mr", native: "मराठी", latin: "Marathi" },
  { code: "ur", native: "اُردُو", latin: "Urdu" },
  { code: "gu", native: "ગુજરાતી", latin: "Gujarati" },
  { code: "ml", native: "മലയാളം", latin: "Malayalam" },
  { code: "as", native: "অসমীয়া", latin: "Assamese" },
  { code: "sa", native: "संस्कृतम्", latin: "Sanskrit" },
  { code: "brx", native: "बड़ो", latin: "Bodo" },
  { code: "ne", native: "नेपाली", latin: "Nepali" },
];

type Dict = Record<string, string>;
const en: Dict = {
  hello: "Hello", welcome: "Welcome to ClinicCortex",
  priority: "YOUR HEALTH IS OUR PRIORITY",
  appointment: "Appointment", search: "Search", pharmacy: "Pharmacy", settings: "Settings",
  home: "Home", book: "Book", reschedule: "Reschedule", cancel: "Cancel", queue: "Generate Queue",
  upcoming: "Upcoming", completed: "Completed", missed: "Cancelled / Missed",
  inClinic: "In-Clinic", tele: "Tele-Consultation", homecare: "Home Care",
  continueBrowser: "Continue in Browser", downloadApp: "Download Mobile App",
  vitals: "Vitals", glucose: "Blood Glucose", normal: "Normal", lower: "Lower",
  signin: "Sign in", signup: "Create account", guest: "Continue as Guest",
  book_now: "Book now", quick_services: "Quick services", ai_analyzer: "AI Analyzer",
  lab_reports: "Lab Reports", schedule_checkup: "Schedule a check-up\nwith top-rated specialists.",
  dark_mode: "Dark mode", light_mode: "Light mode", toggle_theme: "Toggle app theme",
  language: "Language", profile: "Profile & password", update_details: "Update your details",
  preferences: "Preferences", account: "Account", more: "More", about_us: "About us",
  feedback: "Feedback", privacy_policy: "Privacy policy",
  choose_language: "Choose your language", app_switch: "App interface will switch instantly.",
  continue_btn: "Continue", who_are_you: "Who are you?", select_role: "Select the role that best describes you.",
  patient: "Patient", doctor: "Doctor", lab_assist: "Lab Assist",
  book_consults: "Book consults, track vitals", manage_queue: "Manage queue & patients",
  upload_reports: "Upload reports & samples", continue_login: "Continue to Login",
  new_here: "New here? Create an account", welcome_back: "Welcome back",
  sign_in_cc: "Sign in to ClinicCortex",
};
const hi: Dict = {
  hello: "नमस्ते", welcome: "ClinicCortex में आपका स्वागत है",
  priority: "आपका स्वास्थ्य हमारी प्राथमिकता है",
  home: "होम", appointment: "अपॉइंटमेंट", search: "खोज", pharmacy: "फार्मेसी", settings: "सेटिंग्स",
  book_now: "अभी बुक करें", quick_services: "त्वरित सेवाएँ", vitals: "जीवन संकेत",
  glucose: "रक्त शर्करा", ai_analyzer: "AI विश्लेषक", lab_reports: "लैब रिपोर्ट",
  schedule_checkup: "शीर्ष विशेषज्ञों के साथ\nजांच शेड्यूल करें।",
  dark_mode: "डार्क मोड", light_mode: "लाइट मोड", language: "भाषा",
  profile: "प्रोफ़ाइल और पासवर्ड", preferences: "प्राथमिकताएँ", account: "खाता",
  choose_language: "अपनी भाषा चुनें", app_switch: "ऐप इंटरफ़ेस तुरंत बदल जाएगा।",
  continue_btn: "जारी रखें", who_are_you: "आप कौन हैं?", select_role: "अपनी भूमिका चुनें।",
  patient: "मरीज़", doctor: "डॉक्टर", lab_assist: "लैब सहायक",
  continue_login: "लॉगिन जारी रखें", welcome_back: "वापसी पर स्वागत",
  upcoming: "आगामी", completed: "पूर्ण", missed: "रद्द / छूटे",
  about_us: "हमारे बारे में", feedback: "प्रतिक्रिया", more: "और",
};
const bn: Dict = { hello: "নমস্কার", home: "হোম", appointment: "অ্যাপয়েন্টমেন্ট", search: "অনুসন্ধান", pharmacy: "ফার্মেসি", settings: "সেটিংস", choose_language: "আপনার ভাষা নির্বাচন করুন", continue_btn: "চালিয়ে যান", vitals: "জীবনীশক্তি", glucose: "রক্তের গ্লুকোজ" };
const kn: Dict = { hello: "ನಮಸ್ಕಾರ", home: "ಮುಖಪುಟ", appointment: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್", search: "ಹುಡುಕು", pharmacy: "ಔಷಧಾಲಯ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", choose_language: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ", continue_btn: "ಮುಂದುವರಿಸಿ", vitals: "ಜೀವ ಸೂಚಕ", glucose: "ರಕ್ತದ ಗ್ಲೂಕೋಸ್" };
const te: Dict = { hello: "నమస్తే", home: "హోమ్", appointment: "అపాయింట్‌మెంట్", search: "శోధన", pharmacy: "ఫార్మసీ", settings: "సెట్టింగ్‌లు", choose_language: "మీ భాషను ఎంచుకోండి", continue_btn: "కొనసాగించు" };
const mr: Dict = { hello: "नमस्कार", home: "मुख्यपृष्ठ", appointment: "भेट", search: "शोध", pharmacy: "औषधालय", settings: "सेटिंग्ज", choose_language: "तुमची भाषा निवडा", continue_btn: "पुढे चला" };
const ur: Dict = { hello: "سلام", home: "ہوم", appointment: "ملاقات", search: "تلاش", pharmacy: "فارمیسی", settings: "ترتیبات", choose_language: "اپنی زبان منتخب کریں", continue_btn: "جاری رکھیں" };
const gu: Dict = { hello: "નમસ્તે", home: "હોમ", appointment: "એપોઇન્ટમેન્ટ", search: "શોધ", pharmacy: "ફાર્મસી", settings: "સેટિંગ્સ", choose_language: "તમારી ભાષા પસંદ કરો", continue_btn: "ચાલુ રાખો" };
const ml: Dict = { hello: "നമസ്കാരം", home: "ഹോം", appointment: "അപ്പോയിന്റ്മെന്റ്", search: "തിരയൽ", pharmacy: "ഫാർമസി", settings: "ക്രമീകരണങ്ങൾ", choose_language: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക", continue_btn: "തുടരുക" };
const as: Dict = { hello: "নমস্কাৰ", home: "হোম", choose_language: "আপোনাৰ ভাষা বাছনি কৰক", continue_btn: "আগবাঢ়ক" };
const sa: Dict = { hello: "नमो नमः", home: "गृहम्", choose_language: "भवतः भाषां चिनोतु", continue_btn: "अग्रे गच्छतु" };
const brx: Dict = { hello: "खुलुम्बाइ", home: "नो", choose_language: "नोंथांनि रावनाय सायख", continue_btn: "आगान था" };
const ne: Dict = { hello: "नमस्ते", home: "गृह", choose_language: "तपाईंको भाषा छान्नुहोस्", continue_btn: "जारी राख्नुहोस्" };
const DICTS: Record<Lang, Dict> = { en, hi, bn, kn, te, mr, ur, gu, ml, as, sa, brx, ne };

type Ctx = {
  flow: Flow; setFlow: (f: Flow) => void;
  screen: Screen; setScreen: (s: Screen) => void;
  drawer: boolean; setDrawer: (b: boolean) => void;
  dark: boolean; setDark: (b: boolean) => void;
  lang: Lang; setLang: (l: Lang) => void;
  role: Role; setRole: (r: Role) => void;
  t: (k: string) => string;
  selectedDoctorId: number | null; setSelectedDoctorId: (n: number | null) => void;
};

const CCContext = createContext<Ctx | null>(null);

export function CCProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<Flow>("gateway");
  const [screen, setScreen] = useState<Screen>("home");
  const [drawer, setDrawer] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role>("patient");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);

  const t = useMemo(() => (k: string) => DICTS[lang]?.[k] ?? en[k] ?? k, [lang]);

  const value: Ctx = {
    flow, setFlow, screen, setScreen, drawer, setDrawer,
    dark, setDark, lang, setLang, role, setRole, t,
    selectedDoctorId, setSelectedDoctorId,
  };

  return <CCContext.Provider value={value}>{children}</CCContext.Provider>;
}

export function useCC() {
  const ctx = useContext(CCContext);
  if (!ctx) throw new Error("useCC must be used inside CCProvider");
  return ctx;
}
