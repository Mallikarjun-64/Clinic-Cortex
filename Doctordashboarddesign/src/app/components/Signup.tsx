import { FormEvent, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api";
import { 
  User, Mail, Lock, Shield, Activity, Check, AlertCircle, Calendar, 
  MapPin, Upload, Plus, Trash, PlusCircle, Search, Award, BookOpen, 
  Heart, Info, Sparkles, Smartphone, CheckCircle2, Map, Globe, X
} from "lucide-react";

type SpecialtyData = Record<string, any>;

const defaultSpecialtyData: SpecialtyData = {
  subType: "",
  clinicalFocus: [] as string[],
  procedureExperience: [] as string[],
  deviceExperience: [] as string[],
  certifications: [] as string[],
  boardRegistrationNo: "",
  stateCouncil: "",
  icuExperience: "",
  otExperience: "",
  labAccreditations: [] as string[],
  anesthesiaCertified: false,
  telemedicineModes: [] as string[]
};

const createEmptyFormData = () => ({
  salutation: "Dr.",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "Indian",
  profilePhoto: "",
  aadhar: "",
  pan: "",
  passport: "",
  mobile: "",
  whatsapp: "",
  sameAsMobile: false,
  profEmail: "",
  personalEmail: "",
  clinicAddress: "",
  homeAddress: "",
  city: "",
  state: "Delhi",
  pincode: "",
  gpsPin: "",
  regNo: "",
  smcName: "Delhi Medical Council",
  regType: "Permanent",
  regYear: "",
  regExpiry: "",
  lifetimeExpiry: false,
  mbbsUni: "",
  mbbsYear: "",
  pgDegree: "",
  pgSpecialization: "None",
  superSpecialization: "",
  additionalCerts: "",
  nmcUid: "",
  expYears: 5,
  employmentTypes: [] as string[],
  primaryHospital: "",
  secondaryClinics: [] as string[],
  telemedicineOnly: false,
  consultLanguages: [] as string[],
  clinicFee: "500",
  onlineFee: "300",
  consultDuration: "15 min",
  availDays: [] as string[],
  availTimeStart: "09:00",
  availTimeEnd: "17:00",
  bio: "",
  researchInterests: "",
  publicationsCount: "0",
  pubmedId: "",
  awards: [] as string[],
  password: "",
  totpKey: "JBSWY3DPEHPK3PXP",
  totpCode: "",
  totpVerified: false,
  biometricConsent: false,
  consentDpdp: false,
  consentTelemedicine: false,
  consentTnc: false,
  consentDrugDispense: "No",
  consentCriminal: false,
  indemnityToggle: false,
  bankName: "",
  bankAccountNo: "",
  bankIfsc: "",
  gstNo: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  cardioSpecialty: {
    subType: "Clinical Cardiology",
    cathLabExp: "0",
    interventional: false,
    echoCompetencies: [] as string[],
    deviceExp: [] as string[],
    focus: "Adult"
  },
  dermaSpecialty: {
    cosmeticPractice: false,
    trichology: false,
    dermoscopy: false,
    paediatric: false,
    skinBiopsy: false,
    phototherapy: false,
    lasers: [] as string[],
    peels: [] as string[]
  },
  psychSpecialty: {
    modalities: [] as string[],
    childPsych: false,
    substanceUse: false,
    forensic: false,
    mhaConsent: false
  },
  dentalSpecialty: {
    dciRegNo: "",
    stateDentalCouncil: "",
    dciVerified: false,
    practiceFocus: [] as string[],
    sedationCertified: false
  },
  specialtyData: { ...defaultSpecialtyData } as SpecialtyData
});

// 9 Indian languages Support Definitions
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" }
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "ClinicCortex Registration",
    subtitle: "AI-Augmented Clinical Intelligence Platform for India",
    stage: "Stage",
    next: "Next Step",
    prev: "Previous",
    finish: "Submit Application",
    autoSaveMsg: "Draft auto-saved successfully",
    resumeMsg: "Resumed from your saved draft!",
    personalIdentity: "Personal Identity",
    contactLocation: "Contact & Location",
    medicalCredentials: "Medical Credentials",
    professionalProfile: "Professional Profile",
    complianceSecurity: "Compliance & Security",
    salutation: "Salutation",
    firstName: "First Name",
    lastName: "Last Name",
    dob: "Date of Birth",
    gender: "Gender",
    nationality: "Nationality",
    profilePhoto: "Profile Photo",
    aadhar: "Aadhar Number",
    pan: "PAN Number",
    passport: "Passport Number",
    mobile: "Mobile Number",
    whatsapp: "WhatsApp Number",
    profEmail: "Professional Email",
    clinicAddress: "Clinic/Hospital Address",
    pincode: "Pincode",
    regNo: "NMC Registration No.",
    smcName: "State Medical Council",
    mbbsUni: "MBBS University",
    mbbsYear: "MBBS Graduation Year",
    pgDegree: "Postgraduate Degree",
    pgSpecialization: "PG Specialization",
    expYears: "Years of Experience",
    consultFee: "Consultation Fee",
    availability: "Availability",
    bio: "Short Bio",
    password: "Password",
    granularConsent: "Granular Consent Acknowledgements",
    ekycVerified: "Verified via eKYC",
    nmcVerified: "Cleared (NMC API Verified)"
  },
  hi: {
    title: "क्लिनिककॉर्टेक्स पंजीकरण",
    subtitle: "भारत के लिए एआई-संवर्धित नैदानिक खुफिया मंच",
    stage: "चरण",
    next: "अगला चरण",
    prev: "पिछला",
    finish: "आवेदन जमा करें",
    autoSaveMsg: "प्रारूप सफलतापूर्वक सहेजा गया",
    resumeMsg: "सहेजे गए प्रारूप से पुनरारंभ किया गया!",
    personalIdentity: "व्यक्तिगत पहचान",
    contactLocation: "संपर्क और स्थान",
    medicalCredentials: "चिकित्सीय क्रेडेंशियल",
    professionalProfile: "पेशेवर प्रोफ़ाइल",
    complianceSecurity: "अनुपालन और सुरक्षा",
    salutation: "अभिवादन",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    dob: "जन्म तिथि",
    gender: "लिंग",
    nationality: "राष्ट्रीयता",
    profilePhoto: "प्रोफ़ाइल फोटो",
    aadhar: "आधार संख्या",
    pan: "पैन संख्या",
    passport: "पासपोर्ट संख्या",
    mobile: "मोबाइल नंबर",
    whatsapp: "व्हाट्सएप नंबर",
    profEmail: "पेशेवर ईमेल",
    clinicAddress: "क्लिनिक/अस्पताल का पता",
    pincode: "पिनकोड",
    regNo: "एनएमसी पंजीकरण संख्या",
    smcName: "राज्य चिकित्सा परिषद",
    mbbsUni: "एमबीबीएस विश्वविद्यालय",
    mbbsYear: "एमबीबीएस स्नातक वर्ष",
    pgDegree: "स्नातकोत्तर डिग्री",
    pgSpecialization: "पीजी विशेषज्ञता",
    expYears: "अनुभव के वर्ष",
    consultFee: "परामर्श शुल्क",
    availability: "उपलब्धता",
    bio: "संक्षिप्त जीवनी",
    password: "पासवर्ड",
    granularConsent: "विस्तृत सहमति पावती",
    ekycVerified: "ई-केवाईसी द्वारा सत्यापित",
    nmcVerified: "स्वीकृत (एनएमसी एपीआई सत्यापित)"
  },
  ta: {
    title: "கிளினிக்கோர்டெக்ஸ் பதிவு",
    subtitle: "இந்தியாவிற்கான AI-மேம்படுத்தப்பட்ட மருத்துவ நுண்ணறிவு தளம்",
    stage: "நிலை",
    next: "அடுத்த படி",
    prev: "முந்தைய",
    finish: "விண்ணப்பத்தை சமர்ப்பிக்கவும்",
    autoSaveMsg: "வரைவு வெற்றிகரமாக சேமிக்கப்பட்டது",
    resumeMsg: "சேமிக்கப்பட்ட வரைவிலிருந்து மீண்டும் தொடங்கப்பட்டது!",
    personalIdentity: "தனிப்பட்ட அடையாளம்",
    contactLocation: "தொடர்பு மற்றும் இருப்பிடம்",
    medicalCredentials: "மருத்துவ சான்றுகள்",
    professionalProfile: "தொழில்முறை சுயவிவரம்",
    complianceSecurity: "இணக்கம் மற்றும் பாதுகாப்பு",
    salutation: "வாழ்த்துரை",
    firstName: "முதல் பெயர்",
    lastName: "கடைசி பெயர்",
    dob: "பிறந்த தேதி",
    gender: "பாலினம்",
    nationality: "தேசிய இனம்",
    profilePhoto: "சுயவிவர புகைப்படம்",
    aadhar: "ஆதார் எண்",
    pan: "பான் எண்",
    passport: "கடவுச்சீட்டு எண்",
    mobile: "கைபேசி எண்",
    whatsapp: "வாட்ஸ்அப் எண்",
    profEmail: "தொழில்முறை மின்னஞ்சல்",
    clinicAddress: "கிளினிக்/மருத்துவமனை முகவரி",
    pincode: "அஞ்சல் குறியீடு",
    regNo: "NMC பதிவு எண்",
    smcName: "மாநில மருத்துவக் குழு",
    mbbsUni: "MBBS பல்கலைக்கழகம்",
    mbbsYear: "MBBS பட்டமளிப்பு ஆண்டு",
    pgDegree: "முதுகலை பட்டம்",
    pgSpecialization: "PG சிறப்புத் துறை",
    expYears: "அனுபவ ஆண்டுகள்",
    consultFee: "ஆலோசனைக் கட்டணம்",
    availability: "கிடைக்கும் நாட்கள்",
    bio: "சுயசரிதை",
    password: "கடவுச்சொல்",
    granularConsent: "விரிவான ஒப்புதல்கள்",
    ekycVerified: "eKYC மூலம் சரிபார்க்கப்பட்டது",
    nmcVerified: "அங்கீகரிக்கப்பட்டது (NMC API சரிபார்க்கப்பட்டது)"
  }
};

// Fallback utility for missing translations
const getTranslation = (lang: string, key: string) => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"][key] || key;
};

const PG_SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology & Venereology",
  "Psychiatry",
  "Dental & Oral Medicine",
  "General Medicine",
  "General Surgery",
  "Obstetrics & Gynecology",
  "Pediatrics",
  "Orthopedics",
  "ENT",
  "Ophthalmology",
  "Anesthesiology",
  "Radiology",
  "Radiation Oncology",
  "Neurology",
  "Neurosurgery",
  "Urology",
  "Nephrology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Emergency Medicine",
  "Pathology"
];

export function Signup() {
  const navigate = useNavigate();
  
  // Multilingual State
  const [currentLang, setCurrentLang] = useState("en");

  // Step Stepper State
  const [activeStep, setActiveStep] = useState(1);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [toastText, setToastText] = useState("");

  // OTP & API simulated status states
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const [aadharEkycSent, setAadharEkycSent] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [aadharOtpInput, setAadharOtpInput] = useState("");

  const [nmcChecking, setNmcChecking] = useState(false);
  const [nmcApiStatus, setNmcApiStatus] = useState<"unverified" | "matching" | "cleared" | "failed" | "disqualified">("unverified");
  const [nmcMatchScore, setNmcMatchScore] = useState<number | null>(null);

  // Form Field States
  const [formData, setFormData] = useState(createEmptyFormData);
  const [savedDraftExists, setSavedDraftExists] = useState(false);

  const clearSignupForm = () => {
    setFormData(createEmptyFormData());
    setToastText("Signup form cleared. Start fresh.");
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 2000);
  };

  const resumeSignupDraft = () => {
    const savedDraft = localStorage.getItem("clinic_cortex_signup_draft");
    if (!savedDraft) return;
    try {
      const parsed = JSON.parse(savedDraft);
      setFormData({
        ...createEmptyFormData(),
        ...parsed,
        specialtyData: {
          ...defaultSpecialtyData,
          ...(parsed.specialtyData || {})
        }
      });
      setToastText(getTranslation(currentLang, "resumeMsg"));
      setShowDraftToast(true);
      setTimeout(() => setShowDraftToast(false), 4000);
    } catch (err) {
      console.error("Failed to load draft", err);
    }
  };


  // Face Detection simulation active state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);

  // Dynamic Awards Repeatable
  const [newAward, setNewAward] = useState("");
  const [newSecondaryClinic, setNewSecondaryClinic] = useState("");

  // Auto-Save Draft logic (local storage on blur)
  const handleBlurSave = () => {
    localStorage.setItem("clinic_cortex_signup_draft", JSON.stringify(formData));
    setToastText(getTranslation(currentLang, "autoSaveMsg"));
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 2000);
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem("clinic_cortex_signup_draft");
    setSavedDraftExists(Boolean(savedDraft));
  }, []);

  const handleInputChange = (field: string, val: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === "mobile" && prev.sameAsMobile) {
        updated.whatsapp = val;
      }
      return updated;
    });
  };

  // Simulating eKYC Verification via SMS OTP
  const triggerAadharEkyc = () => {
    if (!formData.aadhar || formData.aadhar.length < 12) {
      alert("Please enter a valid 12-digit Aadhar number first.");
      return;
    }
    setAadharEkycSent(true);
    alert("Simulated DigiLocker SMS OTP sent to registered mobile number associated with UIDAI Aadhar.");
  };

  const verifyAadharOtp = () => {
    if (aadharOtpInput === "123456" || aadharOtpInput === "1234") {
      setAadharVerified(true);
      setAadharEkycSent(false);
      alert("Aadhar eKYC completed successfully. Demographics verified via UIDAI database!");
    } else {
      alert("Invalid verification code. Please use simulated OTP: '123456'");
    }
  };

  // Simulating NMC ORS API Name matching algorithm
  const triggerNmcApiVerify = () => {
    if (!formData.regNo || !formData.firstName) {
      alert("Registration Number and First Name are required to query NMC.");
      return;
    }
    setNmcChecking(true);
    setTimeout(() => {
      setNmcChecking(false);
      const docName = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase();
      
      if (docName.includes("suspended") || docName.includes("disciplinary") || docName.includes("criminal")) {
        setNmcApiStatus("disqualified");
        setNmcMatchScore(0);
        alert("CRITICAL WARNING: This credential registration is flagged with active disciplinary actions on NMC database. Account flagged.");
      } else if (docName.includes("sarah") || docName.includes("john") || docName.includes("vaibhav") || docName.length > 5) {
        setNmcApiStatus("cleared");
        setNmcMatchScore(96);
        alert("NMC API Cleared! Name match returned 96% confidence score. Demographics mapped.");
      } else {
        setNmcApiStatus("matching");
        setNmcMatchScore(62);
        alert("Name Matching Confidence: 62% (Threshold < 80%). Registration routed to manual clinical queue.");
      }
    }, 1500);
  };

  // AI-assist generation for Short Bio
  const triggerAiBioGen = () => {
    setFormData(prev => ({
      ...prev,
      bio: `Dr. ${prev.firstName} ${prev.lastName} is an esteemed medical practitioner specializing in ${prev.pgSpecialization !== "None" ? prev.pgSpecialization : "General Medicine"}. Armed with over ${prev.expYears} years of clinical expertise, they excel in patient-centric diagnostic algorithms, telemedicine delivery, and comprehensive medical governance.`
    }));
  };

  // Mock face upload & detection visualizer
  const handlePhotoUpload = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
      setFaceScanning(true);
      setTimeout(() => {
        setFaceScanning(false);
        setFaceScanSuccess(true);
      }, 2000);
    }
  };

  const updateSpecialtyData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specialtyData: { ...prev.specialtyData, [field]: value }
    }));
  };

  const toggleSpecialtyDataArray = (field: string, value: string) => {
    setFormData(prev => {
      const current = (prev.specialtyData?.[field] as string[]) ?? [];
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return {
        ...prev,
        specialtyData: { ...prev.specialtyData, [field]: next }
      };
    });
  };

  const renderSpecialtyPanel = () => {
    const specialtyData = formData.specialtyData ?? defaultSpecialtyData;

    const renderCheckboxList = (items: string[], selected: string[] = [], field: string) => {
      const selectedArray = selected || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={selectedArray.includes(item)}
                onChange={() => toggleSpecialtyDataArray(field, item)}
              />
              {item}
            </label>
          ))}
        </div>
      );
    };

    const renderCommonPanel = (title: string, fields: Array<{ label: string; field: string; placeholder?: string; type?: string; options?: string[]; checkboxList?: string[] }>) => {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-slate-200 pb-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{title}</h4>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {fields.map((item) => {
              if (item.checkboxList) {
                return (
                  <div key={item.field}>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">{item.label}</label>
                    {renderCheckboxList(item.checkboxList, (specialtyData[item.field] as string[]) ?? [], item.field)}
                  </div>
                );
              }

              if (item.options) {
                return (
                  <div key={item.field}>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">{item.label}</label>
                    <select
                      value={(specialtyData[item.field] as string) ?? ""}
                      onChange={(e) => updateSpecialtyData(item.field, e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    >
                      <option value="">Select</option>
                      {item.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={item.field}>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">{item.label}</label>
                  <input
                    type={item.type || "text"}
                    value={(specialtyData[item.field] as string) ?? ""}
                    onChange={(e) => updateSpecialtyData(item.field, e.target.value)}
                    placeholder={item.placeholder || "Enter details"}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    switch (formData.pgSpecialization) {
      case "Cardiology":
        return (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Cardiology Focus Group</label>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: "Adult Cardiology", value: "Adult" },
                    { label: "Paediatric Cardiology", value: "Paediatric" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="cardioFocus"
                        checked={formData.cardioSpecialty.focus === option.value}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          cardioSpecialty: { ...prev.cardioSpecialty, focus: option.value }
                        }))}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs font-bold">Interventional Capability?</span>
                <input
                  type="checkbox"
                  checked={formData.cardioSpecialty.interventional}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cardioSpecialty: { ...prev.cardioSpecialty, interventional: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Cath Lab Experience (Years)</label>
                <input
                  type="number"
                  value={formData.cardioSpecialty.cathLabExp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cardioSpecialty: { ...prev.cardioSpecialty, cathLabExp: e.target.value }
                  }))}
                  placeholder="e.g. 3"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Primary Cardiology Subtype</label>
                <select
                  value={formData.cardioSpecialty.subType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cardioSpecialty: { ...prev.cardioSpecialty, subType: e.target.value }
                  }))}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                >
                  <option>Clinical Cardiology</option>
                  <option>Interventional Cardiology</option>
                  <option>Electrophysiology</option>
                  <option>Heart Failure & Transplant</option>
                  <option>Imaging & Non-invasive Cardiology</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Echo Competencies</label>
              {renderCheckboxList([
                "2D Echo",
                "Stress Echo",
                "Transoesophageal Echo",
                "Doppler Imaging",
                "Strain Imaging"
              ], formData.cardioSpecialty.echoCompetencies, "echoCompetencies")}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Device / Interventional Tools Experience</label>
              {renderCheckboxList([
                "Pacemaker",
                "ICD",
                "CRT",
                "Angioplasty",
                "TAVR"
              ], formData.cardioSpecialty.deviceExp, "deviceExp")}
            </div>
          </div>
        );

      case "Dermatology & Venereology":
        return renderCommonPanel("Dermatology & Venereology Extended Signup Fields", [
          { label: "Select Capabilities", field: "clinicalFocus", checkboxList: [
            "Cosmetic Practice",
            "Trichology",
            "Dermoscopy",
            "Paediatric Dermatology",
            "Skin Biopsy",
            "Phototherapy"
          ] },
          { label: "Laser Systems / Devices", field: "deviceExperience", placeholder: "e.g. IPL, Q-switched Nd:YAG, CO2" },
          { label: "Chemical Peels / Skin Rejuvenation", field: "procedureExperience", placeholder: "e.g. TCA, Glycolic, Salicylic" },
          { label: "Clinical Certifications", field: "certifications", placeholder: "e.g. AAD, IADVL" },
        ]);

      case "Psychiatry":
        return renderCommonPanel("Psychiatry Extended Signup Fields", [
          { label: "Psychiatry Subspecialty Areas", field: "clinicalFocus", checkboxList: [
            "Child Psychiatry",
            "Substance Use Disorder",
            "Forensic Psychiatry"
          ] },
          { label: "Therapy Modalities", field: "procedureExperience", checkboxList: [
            "Cognitive Behavioral Therapy",
            "Psychopharmacology",
            "Telepsychiatry",
            "Addiction Therapy",
            "Child/Adolescent Therapy"
          ] },
          { label: "Mental Health Act Compliance Acknowledgement", field: "boardRegistrationNo", placeholder: "Confirm MHA compliance record" }
        ]);

      case "Dental & Oral Medicine":
        return renderCommonPanel("Dental & Oral Medicine Extended Signup Fields", [
          { label: "Dental Council of India Reg. Number", field: "boardRegistrationNo", placeholder: "DCI-1234" },
          { label: "State Dental Council", field: "stateCouncil", placeholder: "State council name" },
          { label: "Sedation / Anesthesia Certified", field: "anesthesiaCertified" },
          { label: "Dental Practice Focus Areas", field: "clinicalFocus", checkboxList: [
            "Implantology",
            "Endodontics",
            "Orthodontics",
            "Prosthodontics",
            "Oral Surgery"
          ] }
        ]);

      case "General Medicine":
        return renderCommonPanel("General Medicine Extended Signup Fields", [
          { label: "Clinical Focus Areas", field: "clinicalFocus", checkboxList: [
            "Diabetes",
            "Hypertension",
            "Infectious Diseases",
            "Critical Care"
          ] },
          { label: "ICU / CCU Experience (Years)", field: "icuExperience", placeholder: "e.g. 4" },
          { label: "Telemedicine Services", field: "telemedicineModes", checkboxList: [
            "Video Consultation",
            "E-prescription",
            "Remote Monitoring"
          ] },
          { label: "Clinical Certifications", field: "certifications", placeholder: "e.g. ACLS, BLS" }
        ]);

      case "General Surgery":
        return renderCommonPanel("General Surgery Extended Signup Fields", [
          { label: "Operating Theatre Experience (Years)", field: "otExperience", placeholder: "e.g. 6" },
          { label: "Key Surgical Procedures", field: "procedureExperience", checkboxList: [
            "Laparoscopic Surgery",
            "Hernia Repair",
            "Appendectomy",
            "Trauma Surgery"
          ] },
          { label: "Minimally Invasive Skills", field: "deviceExperience", checkboxList: [
            "Laparoendoscopic",
            "Robotic Assistance",
            "Endoscopic Techniques"
          ] },
          { label: "Board Certifications", field: "certifications", placeholder: "e.g. FACS, HRC" }
        ]);

      case "Obstetrics & Gynecology":
        return renderCommonPanel("Obstetrics & Gynecology Extended Signup Fields", [
          { label: "High Risk Obstetrics Experience", field: "clinicalFocus", checkboxList: [
            "High-Risk Pregnancy",
            "Fetal Medicine",
            "Maternal-Fetal Care"
          ] },
          { label: "Birthing Center / Labour Room Experience", field: "otExperience", placeholder: "e.g. 5" },
          { label: "Ultrasound / Doppler Experience", field: "deviceExperience", checkboxList: [
            "Antenatal Ultrasound",
            "Doppler Monitoring",
            "3D/4D Imaging"
          ] },
          { label: "Family Planning Services", field: "procedureExperience", checkboxList: [
            "Contraceptive Counseling",
            "Sterilization Procedures",
            "IUD Insertion"
          ] }
        ]);

      case "Pediatrics":
        return renderCommonPanel("Pediatrics Extended Signup Fields", [
          { label: "Neonatal & Child Care Focus", field: "clinicalFocus", checkboxList: [
            "Neonatal Intensive Care",
            "Immunization",
            "Developmental Pediatrics"
          ] },
          { label: "Pediatric Emergency & Critical Care", field: "icuExperience", placeholder: "e.g. 4" },
          { label: "Pediatric Procedures", field: "procedureExperience", checkboxList: [
            "Lumbar Puncture",
            "Central Line Insertion",
            "Pediatric Resuscitation"
          ] },
          { label: "Telehealth for Children", field: "telemedicineModes", checkboxList: [
            "Video Follow-Ups",
            "Remote Monitoring",
            "Health Education"
          ] }
        ]);

      case "Orthopedics":
        return renderCommonPanel("Orthopedics Extended Signup Fields", [
          { label: "Orthopedic Focus Areas", field: "clinicalFocus", checkboxList: [
            "Joint Replacement",
            "Spine Surgery",
            "Trauma Fixation",
            "Sports Medicine"
          ] },
          { label: "Arthroscopy Skills", field: "procedureExperience", checkboxList: [
            "Knee Arthroscopy",
            "Shoulder Arthroscopy",
            "Wrist Arthroscopy"
          ] },
          { label: "Implant / Device Experience", field: "deviceExperience", checkboxList: [
            "Joint Prosthesis",
            "External Fixators",
            "Spinal Implants"
          ] },
          { label: "ICU / Post-Op Care", field: "icuExperience", placeholder: "e.g. 3" }
        ]);

      case "ENT":
        return renderCommonPanel("ENT Extended Signup Fields", [
          { label: "ENT Clinical Focus", field: "clinicalFocus", checkboxList: [
            "Sinus Surgery",
            "Audiology",
            "Head & Neck Surgery",
            "Voice Clinic"
          ] },
          { label: "Endoscopic / Microsurgery", field: "procedureExperience", checkboxList: [
            "Endoscopic Sinus Surgery",
            "Microsurgical Ear Procedures",
            "Transoral Surgery"
          ] },
          { label: "Hearing Rehabilitation", field: "deviceExperience", checkboxList: [
            "Hearing Aids",
            "Cochlear Implants",
            "Bone Anchored Hearing Systems"
          ] },
          { label: "State Council / Board Number", field: "boardRegistrationNo", placeholder: "Enter registration number" }
        ]);

      case "Ophthalmology":
        return renderCommonPanel("Ophthalmology Extended Signup Fields", [
          { label: "Ophthalmology Focus Areas", field: "clinicalFocus", checkboxList: [
            "Cataract Surgery",
            "Glaucoma Care",
            "Retina / Vitreous",
            "Cornea & Refractive"
          ] },
          { label: "Laser & Surgical Experience", field: "deviceExperience", checkboxList: [
            "YAG Laser",
            "Retinal Laser",
            "Phacoemulsification"
          ] },
          { label: "Ocular Imaging / Diagnostics", field: "procedureExperience", checkboxList: [
            "OCT",
            "Fundus Photography",
            "Visual Field Testing"
          ] },
          { label: "Corneal / Refractive Procedures", field: "telemedicineModes", checkboxList: [
            "Post-op Teleconsult",
            "Remote Screening",
            "Glaucoma Monitoring"
          ] }
        ]);

      case "Anesthesiology":
        return renderCommonPanel("Anesthesiology Extended Signup Fields", [
          { label: "Anesthesia Practice Areas", field: "clinicalFocus", checkboxList: [
            "Regional Anesthesia",
            "General Anesthesia",
            "Pain Management",
            "ICU Sedation"
          ] },
          { label: "Critical Care / Rapid Response", field: "icuExperience", placeholder: "e.g. 5" },
          { label: "Procedural Skill Set", field: "procedureExperience", checkboxList: [
            "Epidural",
            "Spinal Anesthesia",
            "Airway Management"
          ] },
          { label: "Sedation Certification", field: "anesthesiaCertified" }
        ]);

      case "Radiology":
        return renderCommonPanel("Radiology Extended Signup Fields", [
          { label: "Imaging Modalities", field: "clinicalFocus", checkboxList: [
            "CT",
            "MRI",
            "Ultrasound",
            "X-ray"
          ] },
          { label: "Interventional Radiology Skills", field: "procedureExperience", checkboxList: [
            "Angiography",
            "Biopsy Guidance",
            "Drainage Procedures"
          ] },
          { label: "PACS / Reporting Experience", field: "deviceExperience", placeholder: "e.g. 5 years of PACS reporting" },
          { label: "Lab Accreditation / Quality", field: "labAccreditations", placeholder: "e.g. NABL" }
        ]);

      case "Radiation Oncology":
        return renderCommonPanel("Radiation Oncology Extended Signup Fields", [
          { label: "Radiation Treatment Modalities", field: "clinicalFocus", checkboxList: [
            "Brachytherapy",
            "IMRT/VMAT",
            "Stereotactic Radiotherapy"
          ] },
          { label: "Treatment Planning / Dosimetry", field: "procedureExperience", placeholder: "e.g. Planning experience" },
          { label: "Tumor Board Participation", field: "telemedicineModes", checkboxList: [
            "Multidisciplinary Tumor Board",
            "Virtual Tumor Review"
          ] },
          { label: "Quality & Safety Accreditation", field: "labAccreditations", placeholder: "e.g. ISO 9001" }
        ]);

      case "Neurology":
        return renderCommonPanel("Neurology Extended Signup Fields", [
          { label: "Neurology Focus Areas", field: "clinicalFocus", checkboxList: [
            "Stroke Care",
            "Epilepsy",
            "Dementia",
            "Neurocritical Care"
          ] },
          { label: "Neurodiagnostic Skills", field: "deviceExperience", checkboxList: [
            "EEG",
            "EMG",
            "Nerve Conduction Studies"
          ] },
          { label: "Therapeutic Procedures", field: "procedureExperience", checkboxList: [
            "Infusion Therapies",
            "Botulinum Injections"
          ] },
          { label: "ICU / Acute Neurology", field: "icuExperience", placeholder: "e.g. 3" }
        ]);

      case "Neurosurgery":
        return renderCommonPanel("Neurosurgery Extended Signup Fields", [
          { label: "Neurosurgery Focus Areas", field: "clinicalFocus", checkboxList: [
            "Spine Surgery",
            "Cranial Surgery",
            "Neurotrauma",
            "Functional Neurosurgery"
          ] },
          { label: "Surgical Procedure Experience", field: "procedureExperience", checkboxList: [
            "Decompressions",
            "Tumor Resections",
            "Vascular Neurosurgery"
          ] },
          { label: "Device / Implant Experience", field: "deviceExperience", checkboxList: [
            "Spinal Fixation",
            "Deep Brain Stimulation"
          ] },
          { label: "OT / Critical Care Exposure", field: "otExperience", placeholder: "e.g. 6" }
        ]);

      case "Urology":
        return renderCommonPanel("Urology Extended Signup Fields", [
          { label: "Urology Subspecialties", field: "clinicalFocus", checkboxList: [
            "Endourology",
            "Stone Disease",
            "Uro-Oncology",
            "Robotic Urology"
          ] },
          { label: "Procedural Skills", field: "procedureExperience", checkboxList: [
            "Cystoscopy",
            "PCNL",
            "Prostate Procedures"
          ] },
          { label: "Device Experience", field: "deviceExperience", checkboxList: [
            "Stents",
            "Nephrostomy",
            "Laser Lithotripsy"
          ] },
          { label: "Dialysis / Renal Support", field: "icuExperience", placeholder: "e.g. 2" }
        ]);

      case "Nephrology":
        return renderCommonPanel("Nephrology Extended Signup Fields", [
          { label: "Renal Care Focus", field: "clinicalFocus", checkboxList: [
            "Dialysis",
            "Transplant Support",
            "Hypertension",
            "Electrolyte Disorders"
          ] },
          { label: "Dialysis Program Experience", field: "procedureExperience", placeholder: "e.g. 5 years" },
          { label: "Lab / Quality Accreditation", field: "labAccreditations", placeholder: "e.g. NABL" },
          { label: "Tele-Renal Clinic Modes", field: "telemedicineModes", checkboxList: [
            "Remote Monitoring",
            "Video Consult",
            "Dietary Management"
          ] }
        ]);

      case "Gastroenterology":
        return renderCommonPanel("Gastroenterology Extended Signup Fields", [
          { label: "GI / Hepatology Focus", field: "clinicalFocus", checkboxList: [
            "Endoscopy",
            "Liver Disease",
            "IBD Care",
            "Pancreatobiliary"
          ] },
          { label: "Endoscopic Skills", field: "procedureExperience", checkboxList: [
            "Upper GI Endoscopy",
            "Colonoscopy",
            "ERCP"
          ] },
          { label: "Clinical Devices", field: "deviceExperience", checkboxList: [
            "Enteroscopy",
            "Capsule Endoscopy"
          ] },
          { label: "Clinical Certifications", field: "certifications", placeholder: "e.g. FNB Gastroenterology" }
        ]);

      case "Pulmonology":
        return renderCommonPanel("Pulmonology Extended Signup Fields", [
          { label: "Pulmonary Care Focus", field: "clinicalFocus", checkboxList: [
            "Critical Care Ventilation",
            "Sleep Medicine",
            "Bronchoscopy",
            "TB / Pulmonary Rehab"
          ] },
          { label: "Procedural Skills", field: "procedureExperience", checkboxList: [
            "Bronchoscopy",
            "Pleural Procedures"
          ] },
          { label: "Imaging & Diagnostics", field: "deviceExperience", checkboxList: [
            "Spirometry",
            "Sleep Study"
          ] },
          { label: "ICU Ventilation Experience", field: "icuExperience", placeholder: "e.g. 4" }
        ]);

      case "Endocrinology":
        return renderCommonPanel("Endocrinology Extended Signup Fields", [
          { label: "Endocrine Focus Areas", field: "clinicalFocus", checkboxList: [
            "Diabetes",
            "Thyroid Disorders",
            "Pituitary / Metabolic",
            "Osteoporosis"
          ] },
          { label: "Therapeutic Procedures", field: "procedureExperience", checkboxList: [
            "Insulin Pump Management",
            "Thyroid Biopsy"
          ] },
          { label: "Device / Monitoring", field: "deviceExperience", checkboxList: [
            "Glucometer",
            "Continuous Glucose Monitor"
          ] },
          { label: "Patient Education Programs", field: "telemedicineModes", checkboxList: [
            "Diabetes Education",
            "Weight Management"
          ] }
        ]);

      case "Rheumatology":
        return renderCommonPanel("Rheumatology Extended Signup Fields", [
          { label: "Rheumatology Focus Areas", field: "clinicalFocus", checkboxList: [
            "Autoimmune Disorders",
            "Biologics Management",
            "Joint Injection Therapy",
            "Vasculitis"
          ] },
          { label: "Procedural Skills", field: "procedureExperience", checkboxList: [
            "Joint Injection",
            "Musculoskeletal Ultrasound"
          ] },
          { label: "Advanced Medications", field: "certifications", placeholder: "e.g. Biologics certification" },
          { label: "Clinic Program Experience", field: "telemedicineModes", checkboxList: [
            "Virtual Follow-up",
            "Remote Disease Monitoring"
          ] }
        ]);

      case "Emergency Medicine":
        return renderCommonPanel("Emergency Medicine Extended Signup Fields", [
          { label: "Emergency Focus Areas", field: "clinicalFocus", checkboxList: [
            "Trauma Resuscitation",
            "Poisoning Care",
            "Prehospital Coordination",
            "Fast Track Services"
          ] },
          { label: "Procedures / Emergency Skills", field: "procedureExperience", checkboxList: [
            "Airway Management",
            "Chest Tube",
            "Point-of-Care Ultrasound"
          ] },
          { label: "Critical Care / Stabilization", field: "icuExperience", placeholder: "e.g. 5" },
          { label: "Certification Programs", field: "certifications", placeholder: "e.g. ACLS, ATLS" }
        ]);

      case "Pathology":
        return renderCommonPanel("Pathology Extended Signup Fields", [
          { label: "Pathology Focus Areas", field: "clinicalFocus", checkboxList: [
            "Histopathology",
            "Cytology",
            "Haematology",
            "Immunohistochemistry"
          ] },
          { label: "Laboratory Accreditation / Quality", field: "labAccreditations", placeholder: "e.g. NABL" },
          { label: "Reporting / Diagnostic Skills", field: "procedureExperience", placeholder: "e.g. Digital pathology, PCR" },
          { label: "Equipment / Technologies", field: "deviceExperience", checkboxList: [
            "Automated Stainers",
            "Flow Cytometry",
            "Molecular Diagnostics"
          ] }
        ]);

      default:
        return null;
    }
  };

  const handleSignupSubmit = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      { field: "firstName", label: getTranslation(currentLang, "firstName") },
      { field: "lastName", label: getTranslation(currentLang, "lastName") },
      { field: "dob", label: getTranslation(currentLang, "dob") },
      { field: "profEmail", label: getTranslation(currentLang, "profEmail") },
      { field: "clinicAddress", label: getTranslation(currentLang, "clinicAddress") },
      { field: "pincode", label: getTranslation(currentLang, "pincode") },
      { field: "regNo", label: getTranslation(currentLang, "regNo") },
      { field: "mbbsUni", label: getTranslation(currentLang, "mbbsUni") },
      { field: "mbbsYear", label: getTranslation(currentLang, "mbbsYear") },
      { field: "password", label: getTranslation(currentLang, "password") },
    ];

    for (const required of requiredFields) {
      if (!formData[required.field as keyof typeof formData]) {
        alert(`Please enter ${required.label} before continuing.`);
        return;
      }
    }

    if (formData.nationality !== "Foreign National" && formData.aadhar.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (formData.nationality === "Foreign National" && !formData.passport) {
      alert("Please enter your passport number for foreign national registration.");
      return;
    }

    if (!mobileVerified) {
      alert("Please verify your mobile number using OTP before submitting the application.");
      return;
    }

    if (!formData.consentDpdp || !formData.consentTnc) {
      alert("Please accept all mandatory legal consents under the DPDP Act 2023 to proceed.");
      return;
    }

    // API logic integration
    api.post('/auth/signup', {
      email: formData.profEmail,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    })
    .then(async (response) => {
      if (response.success && response.token) {
        // Write active token temporarily to submit the profile fields
        localStorage.setItem("cliniccortex-token", response.token);
        
        // Map UI form keys to backend DB columns inside PUT request
        await api.put('/doctors/profile', {
          salutation: formData.salutation,
          middleName: formData.middleName,
          dob: formData.dob,
          gender: formData.gender,
          nationality: formData.nationality,
          mobile: formData.mobile,
          whatsapp: formData.whatsapp,
          personalEmail: formData.personalEmail,
          clinicAddress: formData.clinicAddress,
          homeAddress: formData.homeAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gpsPin: formData.gpsPin,
          nmcRegNo: formData.regNo,
          smcName: formData.smcName,
          regType: "Permanent",
          regYear: formData.mbbsYear,
          mbbsUniversity: formData.mbbsUni,
          mbbsYear: formData.mbbsYear,
          pgDegree: formData.pgDegree,
          pgSpecialization: formData.pgSpecialization,
          experienceYears: formData.expYears ? parseInt(formData.expYears.toString()) : 0,
          clinicFee: formData.clinicFee ? parseFloat(formData.clinicFee.toString()) : 500.00,
          onlineFee: formData.onlineFee ? parseFloat(formData.onlineFee.toString()) : 300.00,
          bio: formData.bio,
          bankName: formData.bankName,
          bankAccountNo: formData.bankAccountNo,
          bankIfsc: formData.bankIfsc,
          emergencyName: formData.emergencyName,
          emergencyRelation: formData.emergencyRelation,
          emergencyPhone: formData.emergencyPhone
        });

        // Clear temporary token so doctor must perform clean login
        localStorage.removeItem("cliniccortex-token");
        localStorage.removeItem("clinic_cortex_signup_draft");

        alert("Signup completed successfully. Please login to continue.");
        navigate("/login?registered=true", { replace: true });
      } else {
        alert(response.message || "Failed to create doctor account.");
      }
    })
    .catch((err) => {
      console.error("Signup call failed:", err);
      alert(err.message || "Email address is already registered or server is down.");
    });
  };

  return (
    <div id="signup-light" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-white via-white/80 to-transparent" />

      {/* Top Header & Localization Selector */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl px-6 py-4 flex items-center justify-between shadow-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/90 border border-slate-200 shadow-lg shadow-slate-200/40">
            <Activity className="text-sky-500 animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              ClinicCortex <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">India</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Clinical Registry Core v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Globe size={18} className="text-slate-500" />
          <select 
            value={currentLang} 
            onChange={(e) => setCurrentLang(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold py-1.5 px-3 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Progressive Stepper Navigation Indicator */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-col gap-1 mb-8 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-900">{getTranslation(currentLang, "title")}</h2>
          <p className="text-sm text-slate-500">{getTranslation(currentLang, "subtitle")}</p>
        </div>

        {savedDraftExists && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-bold">Saved signup draft found.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your previous signup draft is preserved in local storage. You can resume it or start a fresh signup page without deleting the saved draft.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resumeSignupDraft}
                className="px-5 py-3 rounded-2xl bg-[#163CC7] text-white text-xs font-black transition hover:bg-[#0f2f9b]"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={clearSignupForm}
                className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Indicator */}
        <div className="grid grid-cols-5 gap-2 border-b border-slate-200 pb-4">
          {[
            { step: 1, label: getTranslation(currentLang, "personalIdentity") },
            { step: 2, label: getTranslation(currentLang, "contactLocation") },
            { step: 3, label: getTranslation(currentLang, "medicalCredentials") },
            { step: 4, label: getTranslation(currentLang, "professionalProfile") },
            { step: 5, label: getTranslation(currentLang, "complianceSecurity") }
          ].map(s => (
            <button 
              key={s.step} 
              onClick={() => setActiveStep(s.step)}
              className={`flex flex-col gap-1 text-left pb-2 transition-all ${activeStep === s.step ? 'border-b-4 border-sky-400 text-sky-400' : 'text-slate-500'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">{getTranslation(currentLang, "stage")} {s.step}</span>
              <span className="text-xs font-bold truncate hidden md:block">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form container */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <form onSubmit={handleSignupSubmit} onBlur={handleBlurSave} className="relative overflow-hidden bg-white/75 border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-300/30 backdrop-blur-xl space-y-10">
          <div className="pointer-events-none absolute -top-10 right-8 h-32 w-32 rounded-full bg-sky-100 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-slate-100/80 blur-3xl" />
          
          {/* STEP 1: PERSONAL IDENTITY */}
          {activeStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <User size={20} className="text-blue-500" />
                  1. Personal Identity & National KYC
                </h3>
                <p className="text-xs text-slate-500 mt-1">Provide your legal registration names and link national biometric credentials for verification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 mb-2 block">{getTranslation(currentLang, "salutation")}</label>
                  <select 
                    value={formData.salutation} 
                    onChange={(e) => handleInputChange("salutation", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>Dr.</option>
                    <option>Prof. Dr.</option>
                    <option>Asst. Prof. Dr.</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "firstName")} *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "lastName")} *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Middle Name (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    placeholder="Middle name"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "dob")} (Min 21 years) *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "gender")}</label>
                  <select 
                    value={formData.gender} 
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary</option>
                    <option>Prefer Not To Say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "nationality")}</label>
                  <select 
                    value={formData.nationality} 
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>Indian</option>
                    <option>OCI</option>
                    <option>NRI</option>
                    <option>Foreign National</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "pan")} (Income compliance) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.pan}
                    onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                {formData.nationality === "Foreign National" ? (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">{getTranslation(currentLang, "passport")} *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.passport}
                      onChange={(e) => handleInputChange("passport", e.target.value)}
                      placeholder="Passport Number"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">
                      {getTranslation(currentLang, "aadhar")} (12 digits) *
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required 
                        maxLength={12}
                        value={formData.aadhar}
                        onChange={(e) => handleInputChange("aadhar", e.target.value.replace(/\D/g, ""))}
                        placeholder="Aadhar Number"
                        className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                      />
                      <button 
                        type="button" 
                        onClick={triggerAadharEkyc}
                        disabled={aadharVerified}
                        className={`px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${aadharVerified ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {aadharVerified ? "✓ Linked" : "eKYC via OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* simulated UIDAI OTP popup inside the stage flow */}
              {aadharEkycSent && (
                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl animate-pulse space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">UIDAI DigiLocker Gateway Verification</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Please enter the simulated eKYC OTP sent to your Aadhaar-linked mobile. (Use code: <span className="font-bold">123456</span>)</p>
                    </div>
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <input 
                      type="text" 
                      value={aadharOtpInput} 
                      onChange={(e) => setAadharOtpInput(e.target.value)} 
                      placeholder="Enter 6-digit OTP" 
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-center font-bold tracking-widest text-slate-900 dark:text-white outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={verifyAadharOtp}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Photo Face Scan Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200/50 rounded-3xl p-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Webcam Facial Recognition Scan</h4>
                  <p className="text-xs text-slate-500 mb-4">DPDP Act 2023 mandates secure identity audits. Upload a professional headshot to simulate active live face detection.</p>
                  <div className="flex flex-col gap-3">
                    <label className="w-full flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Select Image File (Max 2MB)</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <div className="text-[10px] text-slate-400 leading-normal">Supported formats: JPEG, PNG. Face validation criteria applies.</div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-44 h-44 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile photo preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-300" />
                    )}

                    {/* Scanner active visual indicators */}
                    {faceScanning && (
                      <div className="absolute inset-x-0 h-1 bg-green-500 shadow-[0_0_10px_#22c55e] animate-bounce" />
                    )}

                    {faceScanSuccess && (
                      <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-green-500 text-white rounded-full p-2 text-xs font-black shadow-lg">✓ Face Detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & LOCATION */}
          {activeStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  2. Contact & Clinical Location Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">DPDP & NMC regulations require exact clinical address locations. WhatsApp integrations can also be enabled here.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Mobile Number *</label>
                  <div className="flex gap-2">
                    <input 
                      type="tel" 
                      required 
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, ""))}
                      placeholder="+91 XXXXX XXXXX"
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                    />
                    <button 
                      type="button"
                      onClick={() => { setMobileOtpSent(true); alert("Simulated OTP sent to " + formData.mobile + " (Use simulated code: 1234)"); }}
                      className="px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors whitespace-nowrap"
                    >
                      {mobileVerified ? "✓ Verified" : "Verify SMS"}
                    </button>
                  </div>

                  {mobileOtpSent && !mobileVerified && (
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Enter 4-digit code (1234)" 
                        className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-center text-xs font-bold tracking-widest max-w-[200px]"
                        onChange={(e) => {
                          if (e.target.value === "1234") {
                            setMobileVerified(true);
                            setMobileOtpSent(false);
                            alert("Mobile verified!");
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">WhatsApp Communication *</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Same as Mobile Number?</span>
                      <input 
                        type="checkbox" 
                        checked={formData.sameAsMobile} 
                        onChange={(e) => {
                          handleInputChange("sameAsMobile", e.target.checked);
                          if (e.target.checked) {
                            handleInputChange("whatsapp", formData.mobile);
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                      />
                    </div>
                    {!formData.sameAsMobile && (
                      <input 
                        type="tel" 
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange("whatsapp", e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter WhatsApp number"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Professional Email (Verify via OTP) *</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      required 
                      value={formData.profEmail}
                      onChange={(e) => handleInputChange("profEmail", e.target.value)}
                      placeholder="e.g. doctor@hospital.in"
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                    />
                    <button 
                      type="button" 
                      onClick={() => { setEmailOtpSent(true); alert("Simulated verification OTP sent to " + formData.profEmail + " (Use code: 1234)"); }}
                      className="px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors whitespace-nowrap"
                    >
                      {emailVerified ? "✓ Verified" : "Verify Email"}
                    </button>
                  </div>
                  {emailOtpSent && !emailVerified && (
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Enter 4-digit code (1234)" 
                        className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-center text-xs font-bold tracking-widest max-w-[200px]"
                        onChange={(e) => {
                          if (e.target.value === "1234") {
                            setEmailVerified(true);
                            setEmailOtpSent(false);
                            alert("Email verified!");
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Personal Recovery Email</label>
                  <input 
                    type="email" 
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                    placeholder="personal@email.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>
              </div>

              {/* Address Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Clinic/Hospital Address Block *</label>
                    <textarea 
                      required 
                      rows={4}
                      value={formData.clinicAddress}
                      onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                      placeholder="Complete clinical address..."
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/20 text-sm h-28 resize-none font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Home Address (Optional, for tele-licensing)</label>
                    <textarea 
                      rows={2}
                      value={formData.homeAddress}
                      onChange={(e) => handleInputChange("homeAddress", e.target.value)}
                      placeholder="Home residential address..."
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/20 text-sm h-20 resize-none font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">City of Practice *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Mumbai, Delhi, etc."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Pincode (Strictly 6 Digits) *</label>
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, ""))}
                        placeholder="110001"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">State of Practice *</label>
                    <select 
                      value={formData.state} 
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    >
                      <option>Delhi</option>
                      <option>Maharashtra</option>
                      <option>Karnataka</option>
                      <option>Tamil Nadu</option>
                      <option>Telangana</option>
                      <option>West Bengal</option>
                      <option>Uttar Pradesh</option>
                      <option>Gujarat</option>
                    </select>
                  </div>

                  {/* Simulated Google Maps/GPS Location Pin */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden h-[130px] justify-between">
                    <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center opacity-60">
                      <Map className="text-blue-500/10 w-44 h-44 animate-[spin_40s_linear_infinite]" />
                    </div>
                    <div className="z-10 flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-black text-slate-900 flex items-center gap-1"><MapPin size={12}/> GPS Mapping</h5>
                        <p className="text-[10px] text-slate-400">Lock high-precision coordinates for telemedicine mapping compliance.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleInputChange("gpsPin", "19.0760° N, 72.8777° E")}
                        className="text-[10px] bg-blue-600 text-white px-2.5 py-1 rounded-md font-bold hover:bg-blue-700 transition-colors"
                      >
                        {formData.gpsPin ? "✓ Locked" : "Fetch Location"}
                      </button>
                    </div>
                    <div className="z-10 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/20 flex justify-between">
                      <span>Coordinates:</span>
                      <span>{formData.gpsPin || "Not Captured"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDICAL CREDENTIALS & NMC CORE */}
          {activeStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-500" />
                  3. Medical Credentials & State Registrations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified via the National Medical Commission (NMC) ORS APIs. Choose PG specialization to build dynamic extension fields.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">NMC Registration Number *</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      value={formData.regNo}
                      onChange={(e) => handleInputChange("regNo", e.target.value)}
                      placeholder="MCI-12345"
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                    />
                    <button 
                      type="button" 
                      onClick={triggerNmcApiVerify}
                      className="px-4 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      {nmcChecking ? "Querying..." : "Verify NMC"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">State Medical Council *</label>
                  <select 
                    value={formData.smcName} 
                    onChange={(e) => handleInputChange("smcName", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>Delhi Medical Council</option>
                    <option>Maharashtra Medical Council</option>
                    <option>Karnataka Medical Council</option>
                    <option>Tamil Nadu Medical Council</option>
                    <option>Andhra Pradesh Medical Council</option>
                    <option>West Bengal Medical Council</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Registration Type</label>
                  <select 
                    value={formData.regType} 
                    onChange={(e) => handleInputChange("regType", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>Permanent</option>
                    <option>Provisional</option>
                  </select>
                </div>
              </div>

              {/* Simulated NMC State Display Box */}
              {nmcApiStatus !== "unverified" && (
                <div className={`p-5 rounded-2xl border ${
                  nmcApiStatus === "cleared" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" :
                  nmcApiStatus === "matching" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" :
                  "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 animate-shake"
                }`}>
                  <div className="flex items-center gap-3">
                    {nmcApiStatus === "cleared" && <CheckCircle2 className="text-green-500" size={24} />}
                    {nmcApiStatus === "matching" && <Info className="text-amber-500" size={24} />}
                    {nmcApiStatus === "disqualified" && <AlertCircle className="text-red-500" size={24} />}
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        NMC ORS Registry Status: <span className="uppercase">{nmcApiStatus}</span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {nmcApiStatus === "cleared" && `Cleared! Matching Score: ${nmcMatchScore}%. Provisional level 3 practice verified.`}
                        {nmcApiStatus === "matching" && `Manual Queue Required! Name Match: ${nmcMatchScore}% (Threshold 80%). Pending document review.`}
                        {nmcApiStatus === "disqualified" && `LOCKOUT: This account is restricted and flagged under active NMC disciplinary lists. Application closed.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Registration Year *</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.regYear}
                    onChange={(e) => handleInputChange("regYear", e.target.value)}
                    placeholder="e.g. 2018"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Registration Expiry Date</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Lifetime Validity?</span>
                      <input 
                        type="checkbox" 
                        checked={formData.lifetimeExpiry} 
                        onChange={(e) => handleInputChange("lifetimeExpiry", e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                      />
                    </div>
                    {!formData.lifetimeExpiry && (
                      <input 
                        type="date" 
                        value={formData.regExpiry}
                        onChange={(e) => handleInputChange("regExpiry", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">MBBS Graduation Year *</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.mbbsYear}
                    onChange={(e) => handleInputChange("mbbsYear", e.target.value)}
                    placeholder="e.g. 2012"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">MBBS University / Institution *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.mbbsUni}
                    onChange={(e) => handleInputChange("mbbsUni", e.target.value)}
                    placeholder="AIIMS, JIPMER, etc."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Internship Completion Certificate (PDF, max 5MB)</label>
                  <input type="file" className="text-xs" accept=".pdf" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Postgraduate Degree</label>
                  <select 
                    value={formData.pgDegree} 
                    onChange={(e) => handleInputChange("pgDegree", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option value="">None</option>
                    <option>MD</option>
                    <option>MS</option>
                    <option>DNB</option>
                    <option>DM</option>
                    <option>MCh</option>
                    <option>MRCP</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">PG Specialization *</label>
                  <select 
                    value={formData.pgSpecialization} 
                    onChange={(e) => handleInputChange("pgSpecialization", e.target.value)}
                    disabled={!formData.pgDegree}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="None">{formData.pgDegree ? "Select Specialty" : "Select PG Degree first"}</option>
                    {PG_SPECIALIZATIONS.map((specialty) => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Super-Specialisation (DM/MCh)</label>
                  <input 
                    type="text" 
                    value={formData.superSpecialization}
                    onChange={(e) => handleInputChange("superSpecialization", e.target.value)}
                    placeholder="e.g. DM Nephrology"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>
              </div>

              {/* Dynamic PG Specialty Fields (Stage 3) */}
              {formData.pgDegree && formData.pgSpecialization !== "None" && (
                <div className="p-8 bg-blue-500/5 border border-blue-500/10 dark:border-blue-400/10 rounded-3xl space-y-6">
                  <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin" />
                    Department-Wise Extended Signup Fields: {formData.pgSpecialization}
                  </h4>

                  {renderSpecialtyPanel()}
                </div>
              )}
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" />
                    4. Professional Experience & Scheduling Info
                  </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure appointment options, telemedicine routes, availability hours, and publications.</p>
              </div>

              {/* Slider for Experience Years */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">
                  Years of Experience: <span className="text-blue-600 dark:text-blue-400 font-black text-sm">{formData.expYears} Years</span>
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={60} 
                  value={formData.expYears}
                  onChange={(e) => handleInputChange("expYears", parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Current Employment Type (Multi-Select)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Govt", "Private", "Self-Practice", "Academic", "NGO"].map((type) => {
                      const selected = formData.employmentTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            const current = [...formData.employmentTypes];
                            if (selected) {
                              handleInputChange("employmentTypes", current.filter(c => c !== type));
                            } else {
                              handleInputChange("employmentTypes", [...current, type]);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                            selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
                    <div>
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-bold block">Telemedicine Consultations Only?</span>
                      <span className="text-[9px] text-slate-400 block">Drives digital prescription routing systems.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.telemedicineOnly} 
                      onChange={(e) => handleInputChange("telemedicineOnly", e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Fees & Slots */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">In-Clinic Consultation Fee (₹)</label>
                  <input 
                    type="number" 
                    value={formData.clinicFee}
                    onChange={(e) => handleInputChange("clinicFee", e.target.value)}
                    placeholder="₹500"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Online Consult Fee (₹)</label>
                  <input 
                    type="number" 
                    value={formData.onlineFee}
                    onChange={(e) => handleInputChange("onlineFee", e.target.value)}
                    placeholder="₹300"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Average Consult Duration</label>
                  <select 
                    value={formData.consultDuration} 
                    onChange={(e) => handleInputChange("consultDuration", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  >
                    <option>10 min</option>
                    <option>15 min</option>
                    <option>20 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Availability Start & End</label>
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={formData.availTimeStart}
                      onChange={(e) => handleInputChange("availTimeStart", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold" 
                    />
                    <input 
                      type="time" 
                      value={formData.availTimeEnd}
                      onChange={(e) => handleInputChange("availTimeEnd", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold" 
                    />
                  </div>
                </div>
              </div>

              {/* Clinic Names and secondary repeatable blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Primary Clinic/Hospital Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.primaryHospital}
                    onChange={(e) => handleInputChange("primaryHospital", e.target.value)}
                    placeholder="e.g. Fortis Hospital"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Secondary Clinics (Repeatable, Max 5)</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={newSecondaryClinic}
                      onChange={(e) => setNewSecondaryClinic(e.target.value)}
                      placeholder="Add another branch..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold" 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        if (newSecondaryClinic.trim() && formData.secondaryClinics.length < 5) {
                          handleInputChange("secondaryClinics", [...formData.secondaryClinics, newSecondaryClinic.trim()]);
                          setNewSecondaryClinic("");
                        }
                      }}
                      className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.secondaryClinics.map((clinic, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                        {clinic}
                        <button type="button" onClick={() => handleInputChange("secondaryClinics", formData.secondaryClinics.filter((_, i) => i !== idx))}><X size={10} className="text-slate-400 hover:text-red-500" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Bio with AI Assist Generate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500">Short Professional Bio (Max 500 characters)</label>
                  <button 
                    type="button" 
                    onClick={triggerAiBioGen}
                    className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-full font-black hover:opacity-90 shadow-md transition-all active:scale-95"
                  >
                    <Sparkles size={10}/> AI-Assist Draft
                  </button>
                </div>
                <textarea 
                  rows={4}
                  maxLength={500}
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about your specialization, career highlights, and clinical focus..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm h-32" 
                />
              </div>

              {/* Research Interests, Publications with PubMed Link Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Research Interests & Tag Elements</label>
                  <input 
                    type="text" 
                    value={formData.researchInterests}
                    onChange={(e) => handleInputChange("researchInterests", e.target.value)}
                    placeholder="e.g. Hypertension, Cardiology, AI in Diagnostics"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Publications Count & PubMed Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={formData.publicationsCount}
                      onChange={(e) => handleInputChange("publicationsCount", e.target.value)}
                      placeholder="Publications count"
                      className="w-[80px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                    />
                    <input 
                      type="text" 
                      value={formData.pubmedId}
                      onChange={(e) => handleInputChange("pubmedId", e.target.value)}
                      placeholder="PubMed ID Link"
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLIANCE, CONSENT & SECURITY */}
          {activeStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={20} className="text-blue-500" />
                  5. DPDP Act Compliance & Security Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">DPDP Act 2023 requires explicit, unbundled consents. Setup 2FA credentials here.</p>
              </div>

              {/* Password credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Secure Platform Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter min 12 char password"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold" 
                  />
                  {/* Password requirement checkers */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { cond: formData.password.length >= 12, text: "Min 12 Chars" },
                      { cond: /[A-Z]/.test(formData.password), text: "Capital Letter" },
                      { cond: /\D/.test(formData.password), text: "Number/Special" }
                    ].map((cond, i) => (
                      <span key={i} className={`text-[10px] font-bold flex items-center gap-1 ${cond.cond ? 'text-green-600' : 'text-slate-400'}`}>
                        <Check size={10} /> {cond.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2FA SETUP WIZARD */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1"><Lock size={12}/> Two-Factor Authentication Setup</h4>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white p-1 border border-slate-200 rounded flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-[8px] text-center">
                      MOCK QR
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] text-slate-500">Scan QR or enter key in Authenticator apps (Google/Microsoft):</p>
                      <div className="flex gap-2">
                        <code className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 truncate select-all">{formData.totpKey}</code>
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, totpVerified: true }));
                            alert("2FA Configured successfully!");
                          }}
                          className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Verify 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular Non-Bundled Consent Checkboxes */}
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{getTranslation(currentLang, "granularConsent")} *</h4>
                
                <div className="space-y-3">
                  {[
                    { f: "consentDpdp", t: "DPDP Act 2023 Explicit Consent: I agree to ClinicCortex processing my demographic, identity credentials, and clinical practice telemetry solely for service audits under Indian Data Protection norms. (Mandatory)" },
                    { f: "consentTelemedicine", t: "Telemedicine Practice Guidelines 2020: I certify I will adhere strictly to registered prescription categories, patient consultation limits, and MoHFW telemedicine rules. (Mandatory)" },
                    { f: "consentTnc", t: "Platform Terms of Service: I acknowledge and agree to versioned T&C guidelines and clinical service agreements. (Mandatory)" },
                    { f: "consentCriminal", t: "Criminal Self-Declaration Check: I certify I do not have any ongoing litigation, disciplinary hold, or blacklisting constraints in India." }
                  ].map((consent) => (
                    <label key={consent.f} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl cursor-pointer hover:border-blue-500/20 transition-colors">
                      <input 
                        type="checkbox" 
                        required={consent.f !== "consentCriminal"}
                        checked={(formData as any)[consent.f]}
                        onChange={(e) => handleInputChange(consent.f, e.target.checked)}
                        className="mt-1" 
                      />
                      <span className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-350">{consent.t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bank Account Form & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
                <div className="md:col-span-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Professional Tax & Remittance Compliance</h4>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Bank Account Holder Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Dr. Name"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none text-xs font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Account Number (Encrypted) *</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.bankAccountNo}
                    onChange={(e) => handleInputChange("bankAccountNo", e.target.value.replace(/\D/g, ""))}
                    placeholder="Account Number"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none text-xs font-bold" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 block">Bank IFSC Code *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.bankIfsc}
                    onChange={(e) => handleInputChange("bankIfsc", e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white outline-none text-xs font-bold" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-200 transition-colors duration-300">
            {activeStep > 1 ? (
              <button 
                type="button" 
                onClick={() => setActiveStep(prev => prev - 1)}
                className="glass-button px-6 py-3 rounded-xl border border-white/70 text-slate-700 hover:bg-white/90 font-bold transition-all duration-300 text-sm"
              >
                {getTranslation(currentLang, "prev")}
              </button>
            ) : (
              <div />
            )}

            {activeStep < 5 ? (
              <button 
                type="button" 
                onClick={() => setActiveStep(prev => prev + 1)}
                className="glass-button px-8 py-3 rounded-xl bg-white/80 text-slate-900 hover:bg-white transition-all duration-300 text-sm shadow-lg shadow-slate-300/20"
              >
                {getTranslation(currentLang, "next")}
              </button>
            ) : (
              <button 
                type="submit" 
                className="glass-button px-10 py-4.5 rounded-xl bg-white/90 text-slate-900 hover:text-slate-950 font-black transition-all duration-300 text-sm shadow-xl shadow-slate-300/25"
              >
                {getTranslation(currentLang, "finish")}
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="text-blue-600 underline font-bold">Sign in here</Link>
        </p>
      </main>

      {/* Floating Auto-save/Resume notification toast */}
      {showDraftToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/95 text-slate-900 px-6 py-3 rounded-full text-xs font-bold shadow-2xl shadow-slate-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-6 z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          {toastText}
        </div>
      )}
    </div>
  );
}