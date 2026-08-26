import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  PatientRecord, 
  MedicalReport, 
  ChatMessage, 
  DoctorNote, 
  StructuredClinicalHistory,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse
} from '../types';
import { INITIAL_PATIENTS, SAMPLE_REPORTS_LIBRARY } from '../data/mockPatients';
import { synthesizeClinicalHistory, evaluateRedFlagsFromConversation } from '../data/aiQuestionsTree';
import { api } from '../api/client';

export interface HospitalSession {
  hospitalId: string;
  hospitalName: string;
  branch: string;
  loginTime: string;
}

interface KioskContextType {
  currentView: 'kiosk' | 'doctor';
  setCurrentView: (view: 'kiosk' | 'doctor') => void;
  kioskStep: number;
  setKioskStep: (step: number) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  hospitalSession: HospitalSession | null;
  isHospitalAuthenticated: boolean;
  loginHospital: (id: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logoutHospital: () => void;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  patients: PatientRecord[];
  activeKioskPatient: PatientRecord;
  selectedDoctorPatient: PatientRecord | null;
  selectedDoctorPatientId: string | null;
  setSelectedDoctorPatientId: (id: string | null) => void;
  updateActiveKioskPatient: (updater: (prev: PatientRecord) => PatientRecord) => void;
  addMedicalReportToKiosk: (report: MedicalReport, file?: File) => Promise<void>;
  removeMedicalReportFromKiosk: (reportId: string) => Promise<void>;
  addChatMessageToKiosk: (message: ChatMessage) => void;
  submitKioskIntake: () => Promise<string>;
  resetKiosk: () => void;
  updateDoctorNotes: (patientId: string, notes: Partial<DoctorNote>) => Promise<void>;
  updateDoctorModifiedHistory: (patientId: string, history: Partial<StructuredClinicalHistory>) => Promise<void>;
  confirmDoctorSignOff: (patientId: string, note: DoctorNote) => Promise<void>;
  resetAllData: () => Promise<void>;
  loadSampleIntoKiosk: (type: 'cardiac' | 'migraine' | 'asthma') => void;
  refreshPatientsList: () => Promise<void>;
  isBackendConnected: boolean;
}

const STORAGE_KEY = 'medikiosk_patients_v1';
const AUTH_USER_KEY = 'medikiosk_auth_user_v1';
const AUTH_TOKEN_KEY = 'medikiosk_auth_token_v1';
const HOSPITAL_SESSION_KEY = 'medikiosk_hospital_session_v1';

const createDefaultKioskPatient = (lang = 'en', user?: User | null): PatientRecord => {
  const tokenNum = Math.floor(1000 + Math.random() * 9000);
  const id = `pat-${Date.now()}`;
  return {
    id,
    personalInfo: {
      id,
      queueToken: `MED-${tokenNum}`,
      fullName: user?.fullName || '',
      age: user?.age || 35,
      gender: user?.gender || 'male',
      phone: user?.phone || user?.identifier || '',
      email: user?.email || '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      primaryLanguage: user?.primaryLanguage || lang,
      chiefComplaint: '',
      vitals: {
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 75,
        temperature: 98.6,
        temperatureUnit: 'F',
        oxygenSaturation: 98,
        bloodGlucose: 95
      },
      createdAt: new Date().toISOString()
    },
    consent: {
      granted: false,
      timestamp: '',
      agreedToAIProcessing: false,
      agreedToDataSharingWithDoctor: false,
      termsAccepted: false
    },
    reports: [],
    conversationHistory: [],
    redFlags: [],
    structuredHistory: {
      chiefComplaint: '',
      hpi: '',
      pastMedicalHistory: [],
      pastSurgicalHistory: [],
      currentMedications: [],
      allergies: [],
      familyHistory: [],
      socialHistory: {},
      reviewOfSystems: {},
      aiSynthesizedSummary: '',
      clinicalConfidenceScore: 0
    },
    status: 'waiting_intake',
    triagePriority: 'routine',
    updatedAt: new Date().toISOString(),
    isDoctorConfirmed: false
  };
};

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitalSession, setHospitalSession] = useState<HospitalSession | null>(() => {
    try {
      const stored = localStorage.getItem(HOSPITAL_SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (stored && token) {
        const u = JSON.parse(stored);
        api.setAuth(token, u.id);
        return u;
      }
    } catch (e) {}
    return null;
  });

  const [currentView, setCurrentView] = useState<'kiosk' | 'doctor'>('kiosk');

  const [kioskStep, setKioskStep] = useState<number>(1);
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => currentUser?.primaryLanguage || 'en');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const loginHospital = async (id: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    if (!id.trim() || !password) {
      return { success: false, error: 'Please enter Hospital ID and Password' };
    }
    // Accept valid hospital credentials (e.g. HOSP-01 / hosp123 or any non-empty password)
    const session: HospitalSession = {
      hospitalId: id.trim().toUpperCase(),
      hospitalName: name?.trim() || (id.toUpperCase().includes('CITY') ? 'City Multi-Specialty Hospital' : 'MediKiosk Medical & Research Centre'),
      branch: 'Main Outpatient (OPD) Wing',
      loginTime: new Date().toISOString()
    };
    setHospitalSession(session);
    try {
      localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
    return { success: true };
  };

  const logoutHospital = () => {
    setHospitalSession(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem(HOSPITAL_SESSION_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {}
    setCurrentView('kiosk');
    setKioskStep(1);
  };
  
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored patients", e);
    }
    return [];
  });

  const [activeKioskPatient, setActiveKioskPatient] = useState<PatientRecord>(() => createDefaultKioskPatient(currentLanguage, currentUser));
  const [selectedDoctorPatientId, setSelectedDoctorPatientId] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const res = await api.login(credentials);
      if (res.success && res.user && res.token) {
        setCurrentUser(res.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        
        if (res.user.role === 'doctor') {
          setCurrentView('doctor');
          refreshPatientsList();
        } else {
          setCurrentView('kiosk');
          setKioskStep(1);
          if (res.user.primaryLanguage) {
            setCurrentLanguage(res.user.primaryLanguage);
          }
          setActiveKioskPatient(createDefaultKioskPatient(res.user.primaryLanguage || currentLanguage, res.user));
        }
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const res = await api.register(data);
      if (res.success && res.user && res.token) {
        setCurrentUser(res.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);

        if (res.user.role === 'doctor') {
          setCurrentView('doctor');
          refreshPatientsList();
        } else {
          setCurrentView('kiosk');
          setKioskStep(1);
          if (res.user.primaryLanguage) {
            setCurrentLanguage(res.user.primaryLanguage);
          }
          setActiveKioskPatient(createDefaultKioskPatient(res.user.primaryLanguage || currentLanguage, res.user));
        }
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentView('kiosk');
    setKioskStep(1);
  };

  // Sync with backend on startup
  const refreshPatientsList = useCallback(async () => {
    try {
      const data = await api.getDoctorQueue();
      if (data.success && data.patients) {
        setPatients(data.patients);
        setIsBackendConnected(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.patients));
      }
    } catch (error) {
      console.warn("Backend sync unavailable, using local cache:", error);
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshPatientsList();
  }, [refreshPatientsList]);

  // Sync state to local storage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error("Failed to save patients to localStorage", e);
    }
  }, [patients]);

  const updateActiveKioskPatient = (updater: (prev: PatientRecord) => PatientRecord) => {
    setActiveKioskPatient(prev => {
      const updated = updater(prev);
      // Asynchronously sync demographics/consent changes to backend
      if (isBackendConnected) {
        api.updatePersonalInfo(updated.id, updated.personalInfo).catch(() => {});
      }
      return updated;
    });
  };

  const addMedicalReportToKiosk = async (report: MedicalReport, file?: File) => {
    // Optimistic local update
    setActiveKioskPatient(prev => ({
      ...prev,
      reports: [...prev.reports.filter(r => r.id !== report.id), report]
    }));

    if (isBackendConnected) {
      try {
        if (file) {
          await api.uploadReportFile(activeKioskPatient.id, file);
        } else {
          await api.uploadSampleReport(activeKioskPatient.id, report);
        }
      } catch (e) {
        console.warn("Backend report upload sync failed, stored locally", e);
      }
    }
  };

  const removeMedicalReportFromKiosk = async (reportId: string) => {
    setActiveKioskPatient(prev => ({
      ...prev,
      reports: prev.reports.filter(r => r.id !== reportId)
    }));

    if (isBackendConnected) {
      try {
        await api.deleteReport(activeKioskPatient.id, reportId);
      } catch (e) {
        console.warn("Backend report delete sync failed", e);
      }
    }
  };

  const addChatMessageToKiosk = (message: ChatMessage) => {
    setActiveKioskPatient(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message]
    }));
  };

  const submitKioskIntake = async (): Promise<string> => {
    const finalRedFlags = evaluateRedFlagsFromConversation(
      activeKioskPatient.conversationHistory,
      activeKioskPatient.reports,
      activeKioskPatient.personalInfo.vitals
    );

    const hasCriticalFlags = finalRedFlags.some(f => f.severity === 'critical');
    const hasHighFlags = finalRedFlags.some(f => f.severity === 'high');
    const triage: 'routine' | 'urgent' | 'emergency' = hasCriticalFlags ? 'emergency' : (hasHighFlags ? 'urgent' : 'routine');

    const synthesized = synthesizeClinicalHistory(
      activeKioskPatient.personalInfo.fullName || 'Patient',
      activeKioskPatient.personalInfo.age,
      activeKioskPatient.personalInfo.gender,
      activeKioskPatient.personalInfo.chiefComplaint,
      activeKioskPatient.conversationHistory,
      activeKioskPatient.reports,
      activeKioskPatient.personalInfo.vitals
    );

    const finalizedPatient: PatientRecord = {
      ...activeKioskPatient,
      status: 'ai_completed',
      triagePriority: triage,
      redFlags: finalRedFlags,
      structuredHistory: synthesized,
      updatedAt: new Date().toISOString()
    };

    // Persist to backend
    try {
      const res = await api.synthesize(finalizedPatient.id, finalizedPatient);
      if (res.success && res.patient) {
        setPatients(prev => [res.patient, ...prev.filter(p => p.id !== res.patient.id)]);
        setActiveKioskPatient(res.patient);
        return res.queueToken || res.patient.personalInfo.queueToken;
      }
    } catch (e) {
      console.warn("Backend synthesize failed, saved locally:", e);
    }

    return finalizedPatient.personalInfo.queueToken;
  };

  const handleSetCurrentView = (view: 'kiosk' | 'doctor') => {
    setCurrentView(view);
    if (view === 'doctor') {
      refreshPatientsList();
    }
  };

  const resetKiosk = () => {
    setActiveKioskPatient(createDefaultKioskPatient(currentLanguage));
    setKioskStep(1);
  };

  const updateDoctorNotes = async (patientId: string, notes: Partial<DoctorNote>) => {
    const existingPatient = patients.find(p => p.id === patientId);
    const existing = existingPatient?.doctorNote || {
      id: `note-${Date.now()}`,
      doctorName: 'Dr. Sarah Chen, MD',
      doctorRole: 'Attending Physician',
      timestamp: new Date().toISOString(),
      clinicalImpression: '',
      differentialDiagnosis: [],
      planOfCare: [],
      isSignedOff: false
    };

    const updatedNote = { ...existing, ...notes, timestamp: new Date().toISOString() };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          doctorNote: updatedNote,
          status: p.status === 'ai_completed' ? 'doctor_reviewing' : p.status,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    if (isBackendConnected) {
      try {
        await api.updateDoctorNotes(patientId, notes);
      } catch (e) {
        console.warn("Backend doctor notes update failed", e);
      }
    }
  };

  const updateDoctorModifiedHistory = async (patientId: string, history: Partial<StructuredClinicalHistory>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          doctorModifiedHistory: { ...p.doctorModifiedHistory, ...history },
          status: 'doctor_reviewing',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    if (isBackendConnected) {
      try {
        await api.updateDoctorHistory(patientId, history);
      } catch (e) {
        console.warn("Backend doctor history update failed", e);
      }
    }
  };

  const confirmDoctorSignOff = async (patientId: string, note: DoctorNote) => {
    const signedNote = {
      ...note,
      isSignedOff: true,
      signedAt: new Date().toISOString()
    };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          doctorNote: signedNote,
          status: 'confirmed',
          isDoctorConfirmed: true,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    if (isBackendConnected) {
      try {
        await api.signOff(patientId, note.doctorName, note.doctorRole, note);
      } catch (e) {
        console.warn("Backend sign off failed", e);
      }
    }
  };

  const resetAllData = async () => {
    if (isBackendConnected) {
      try {
        const res = await api.resetSeed();
        if (res.success && res.patients) {
          setPatients(res.patients);
          resetKiosk();
          setSelectedDoctorPatientId(null);
          return;
        }
      } catch (e) {
        console.warn("Backend reset seed failed, falling back to local", e);
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    setPatients(INITIAL_PATIENTS);
    resetKiosk();
    setSelectedDoctorPatientId(null);
  };

  const loadSampleIntoKiosk = (type: 'cardiac' | 'migraine' | 'asthma') => {
    if (type === 'cardiac') {
      setCurrentLanguage('hi');
      setActiveKioskPatient({
        ...createDefaultKioskPatient('hi'),
        personalInfo: {
          id: `pat-cardiac-${Date.now()}`,
          queueToken: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: 'Vikram Sethi',
          age: 52,
          gender: 'male',
          phone: '+91 98110 54321',
          email: 'vikram.sethi@example.in',
          emergencyContactName: 'Anjali Sethi (Wife)',
          emergencyContactPhone: '+91 98110 54322',
          primaryLanguage: 'hi',
          chiefComplaint: 'सीढ़ियां चढ़ने पर सीने में तेज भारीपन, बाएं हाथ में दर्द और पसीना आना। (Severe exertional chest pressure radiating to left arm with diaphoresis).',
          vitals: {
            bloodPressureSystolic: 154,
            bloodPressureDiastolic: 94,
            heartRate: 88,
            temperature: 98.6,
            temperatureUnit: 'F',
            oxygenSaturation: 97,
            bloodGlucose: 165
          },
          createdAt: new Date().toISOString()
        },
        consent: {
          granted: true,
          timestamp: new Date().toISOString(),
          agreedToAIProcessing: true,
          agreedToDataSharingWithDoctor: true,
          termsAccepted: true
        },
        reports: [SAMPLE_REPORTS_LIBRARY[0], SAMPLE_REPORTS_LIBRARY[1]]
      });
    } else if (type === 'migraine') {
      setCurrentLanguage('te');
      setActiveKioskPatient({
        ...createDefaultKioskPatient('te'),
        personalInfo: {
          id: `pat-migraine-${Date.now()}`,
          queueToken: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: 'Lakshmi Rao',
          age: 38,
          gender: 'female',
          phone: '+91 98480 12345',
          email: 'lakshmi.rao@example.in',
          emergencyContactName: 'Venkat Rao (Brother)',
          emergencyContactPhone: '+91 98480 12346',
          primaryLanguage: 'te',
          chiefComplaint: 'తీవ్రమైన కుడివైపు తలనొప్పి, వాంతులు మరియు కాంతిని చూడలేకపోవడం (Intense right-sided throbbing headache with nausea).',
          vitals: {
            bloodPressureSystolic: 124,
            bloodPressureDiastolic: 78,
            heartRate: 72,
            temperature: 98.4,
            temperatureUnit: 'F',
            oxygenSaturation: 99,
            bloodGlucose: 92
          },
          createdAt: new Date().toISOString()
        },
        consent: {
          granted: true,
          timestamp: new Date().toISOString(),
          agreedToAIProcessing: true,
          agreedToDataSharingWithDoctor: true,
          termsAccepted: true
        },
        reports: [SAMPLE_REPORTS_LIBRARY[2]]
      });
    } else {
      setCurrentLanguage('en');
      setActiveKioskPatient({
        ...createDefaultKioskPatient('en'),
        personalInfo: {
          id: `pat-asthma-${Date.now()}`,
          queueToken: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: 'Aarav Sharma',
          age: 31,
          gender: 'male',
          phone: '+91 98765 43210',
          email: 'aarav.sharma@example.in',
          emergencyContactName: 'Meera Sharma (Spouse)',
          emergencyContactPhone: '+91 98765 43211',
          primaryLanguage: 'en',
          chiefComplaint: 'Waking up at night coughing, tight chest and wheezing after light jogging.',
          vitals: {
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 76,
            heartRate: 82,
            temperature: 98.6,
            temperatureUnit: 'F',
            oxygenSaturation: 96,
            bloodGlucose: 88
          },
          createdAt: new Date().toISOString()
        },
        consent: {
          granted: true,
          timestamp: new Date().toISOString(),
          agreedToAIProcessing: true,
          agreedToDataSharingWithDoctor: true,
          termsAccepted: true
        },
        reports: [SAMPLE_REPORTS_LIBRARY[3]]
      });
    }
  };

  const selectedDoctorPatient = patients.find(p => p.id === selectedDoctorPatientId) || null;

  return (
    <KioskContext.Provider
      value={{
        currentView,
        setCurrentView: handleSetCurrentView,
        kioskStep,
        setKioskStep,
        currentLanguage,
        setCurrentLanguage,
        currentUser,
        isAuthenticated: !!currentUser,
        hospitalSession,
        isHospitalAuthenticated: !!hospitalSession,
        loginHospital,
        logoutHospital,
        login,
        register,
        logout,
        patients,
        activeKioskPatient,
        selectedDoctorPatient,
        selectedDoctorPatientId,
        setSelectedDoctorPatientId,
        updateActiveKioskPatient,
        addMedicalReportToKiosk,
        removeMedicalReportFromKiosk,
        addChatMessageToKiosk,
        submitKioskIntake,
        resetKiosk,
        updateDoctorNotes,
        updateDoctorModifiedHistory,
        confirmDoctorSignOff,
        resetAllData,
        loadSampleIntoKiosk,
        refreshPatientsList,
        isBackendConnected
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};
