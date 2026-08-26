import React, { useState, useEffect, useRef } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../../data/languages';
import { OPD_DEPARTMENTS, findMatchingDepartment, OpdDepartment } from '../../data/opdDepartments';
import { 
  User, 
  ArrowRight,
  Calendar,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  Stethoscope,
  Building2,
  Clock,
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const Step1PersonalInfo: React.FC = () => {
  const { activeKioskPatient, updateActiveKioskPatient, setKioskStep, currentLanguage } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const info = activeKioskPatient.personalInfo;
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showDoctorPicker, setShowDoctorPicker] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Derive matching department & doctor based on current chief complaint and age
  const matchedDept = findMatchingDepartment(info.chiefComplaint, info.age);
  const currentDeptName = activeKioskPatient.assignedDepartment || info.assignedDepartment || matchedDept.name;
  const currentDept = OPD_DEPARTMENTS.find(d => d.name.toLowerCase() === currentDeptName.toLowerCase()) || matchedDept;

  // Sync assigned department & doctor if not yet explicitly set
  useEffect(() => {
    if (info.chiefComplaint.trim()) {
      const autoMatched = findMatchingDepartment(info.chiefComplaint, info.age);
      updateActiveKioskPatient(prev => ({
        ...prev,
        assignedDepartment: prev.assignedDepartment || autoMatched.name,
        assignedChamber: prev.assignedChamber || autoMatched.chamber,
        assignedDoctorName: prev.assignedDoctorName || autoMatched.defaultDoctor.name,
        personalInfo: {
          ...prev.personalInfo,
          assignedDepartment: prev.personalInfo.assignedDepartment || autoMatched.name,
          assignedChamber: prev.personalInfo.assignedChamber || autoMatched.chamber,
          assignedDoctorName: prev.personalInfo.assignedDoctorName || autoMatched.defaultDoctor.name,
        }
      }));
    }
  }, [info.chiefComplaint, info.age]);

  // Set up Speech Recognition for Voice Assistant in Step 1
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
      recognition.lang = langConfig?.voiceLangCode || 'hi-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleFieldChange('chiefComplaint', transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const toggleListening = () => {
    setErrorMsg('');
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
          recognitionRef.current.lang = langConfig?.voiceLangCode || 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          setIsListening(false);
        }
      } else {
        // Fallback simulation for unsupported browsers
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sampleComplaints: Record<string, string> = {
            hi: "मुझे पिछले 2 दिनों से सीने में दर्द और सांस लेने में तकलीफ हो रही है।",
            bn: "আমার বুকে ব্যথা এবং খুব শ্বাসকষ্ট হচ্ছে।",
            te: "నాకు ఛాతీలో తీవ్రమైన నొప్పి మరియు ఆయాసంగా ఉంది.",
            ta: "எனக்கு நெஞ்சு வலியும் மூச்சு விடுவதில் சிரமமும் உள்ளது.",
            mr: "मला छातीत खूप दुखत असून श्वास घेण्यास त्रास होत आहे.",
            gu: "મને છાતીમાં દુખાવો અને શ્વાસ લેવામાં તકલીફ થાય છે.",
            kn: "ನನಗೆ ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ.",
            ml: "എനിക്ക് നെഞ്ചുവേദനയും ശ്വാസതടസ്സവും അനുഭവപ്പെടുന്നു.",
            pa: "ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼ ਹੋ ਰਹੀ ਹੈ।",
            en: "I have heavy chest pain radiating to left arm and shortness of breath."
          };
          const speechResult = sampleComplaints[currentLanguage] || sampleComplaints.en;
          handleFieldChange('chiefComplaint', speechResult);
        }, 1800);
      }
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    updateActiveKioskPatient(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
    setErrorMsg('');
  };

  const handleSelectDepartment = (dept: OpdDepartment) => {
    updateActiveKioskPatient(prev => ({
      ...prev,
      assignedDepartment: dept.name,
      assignedChamber: dept.chamber,
      assignedDoctorName: dept.defaultDoctor.name,
      personalInfo: {
        ...prev.personalInfo,
        assignedDepartment: dept.name,
        assignedChamber: dept.chamber,
        assignedDoctorName: dept.defaultDoctor.name
      }
    }));
    setShowDoctorPicker(false);
  };

  const handleNext = () => {
    if (!info.fullName.trim()) {
      setErrorMsg(t.nameRequired);
      return;
    }
    if (!info.chiefComplaint.trim()) {
      setErrorMsg(t.problemRequired);
      return;
    }

    // Ensure final assigned doctor & department are saved
    const finalDept = currentDept || matchedDept;
    updateActiveKioskPatient(prev => ({
      ...prev,
      assignedDepartment: prev.assignedDepartment || finalDept.name,
      assignedChamber: prev.assignedChamber || finalDept.chamber,
      assignedDoctorName: prev.assignedDoctorName || finalDept.defaultDoctor.name,
      personalInfo: {
        ...prev.personalInfo,
        assignedDepartment: prev.personalInfo.assignedDepartment || finalDept.name,
        assignedChamber: prev.personalInfo.assignedChamber || finalDept.chamber,
        assignedDoctorName: prev.personalInfo.assignedDoctorName || finalDept.defaultDoctor.name,
      }
    }));

    setKioskStep(2);
  };

  const chips = [t.chipChest, t.chipFever, t.chipStomach, t.chipHeadache, t.chipCough];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.step1Title}
        </h2>
        <p className="text-sm text-slate-500">
          {t.step1Subtitle}
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Fields Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* 1. Full Name */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            1. {t.fullNameLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={info.fullName}
              onChange={e => handleFieldChange('fullName', e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* 2. Age and Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              2. {t.ageLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="number"
                min="1"
                max="120"
                value={info.age || 35}
                onChange={e => handleFieldChange('age', Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              {t.genderLabel}
            </label>
            <select
              value={info.gender || 'male'}
              onChange={e => handleFieldChange('gender', e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
        </div>

        {/* 3. Chief Complaint with Voice Assistant Microphone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800">
              3. {t.problemLabel} (What Happened?) <span className="text-rose-500">*</span>
            </label>
          </div>

          {/* Voice Assistant Bar */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isListening ? 'bg-rose-600 text-white animate-ping' : 'bg-emerald-600 text-white'
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-900">
                {isListening ? `🎙️ ${t.listeningNow}` : `🎙️ ${t.tapToSpeak}`}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? t.listeningNow : t.tapToSpeak}</span>
            </button>
          </div>

          {/* Text Area for Problem */}
          <div className="relative">
            <textarea
              rows={3}
              required
              value={info.chiefComplaint}
              onChange={e => handleFieldChange('chiefComplaint', e.target.value)}
              placeholder={t.problemPlaceholder}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Quick Problem Tap Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">{t.quickTaps}</span>
            {chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFieldChange('chiefComplaint', chip)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Assigned Doctor & Specialization Card */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-blue-50/90 border-2 border-emerald-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>4. Assigned Doctor & OPD Specialist</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDoctorPicker(!showDoctorPicker)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm"
            >
              <span>{showDoctorPicker ? 'Close' : 'Change Specialist'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDoctorPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Assigned Doctor Details */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900">
                    {activeKioskPatient.assignedDoctorName || currentDept.defaultDoctor.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {currentDept.defaultDoctor.rating}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-emerald-700 font-bold">{currentDept.name} OPD</span>
                  <span>•</span>
                  <span>{currentDept.defaultDoctor.qualification}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-end gap-1 w-full sm:w-auto justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black tracking-wide">
                🚪 {activeKioskPatient.assignedChamber || currentDept.chamber}
              </span>
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> {currentDept.defaultDoctor.consultationHours}
              </span>
            </div>
          </div>

          {/* Dropdown to Pick Other Specialists */}
          {showDoctorPicker && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
              {OPD_DEPARTMENTS.map(dept => {
                const isSelected = dept.name.toLowerCase() === currentDept.name.toLowerCase();
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDepartment(dept)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="text-lg">{dept.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate flex items-center justify-between">
                        <span>{dept.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {dept.defaultDoctor.name} • {dept.chamber}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Big Action Button */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full py-4 rounded-2xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all"
      >
        <span>{t.continueNext}</span>
        <ArrowRight className="w-5 h-5" />
      </button>

    </div>
  );
};
