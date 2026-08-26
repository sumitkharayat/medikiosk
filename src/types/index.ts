export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: 'F' | 'C';
  oxygenSaturation?: number;
  bloodGlucose?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface PatientPersonalInfo {
  id: string;
  queueToken: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryLanguage: string;
  chiefComplaint: string;
  vitals: Vitals;
  assignedDepartment?: string;
  assignedChamber?: string;
  assignedDoctorName?: string;
  assignedDoctorId?: string;
  routingReason?: string;
  createdAt: string;
}

export interface ConsentRecord {
  granted: boolean;
  timestamp: string;
  signatureDataUrl?: string;
  agreedToAIProcessing: boolean;
  agreedToDataSharingWithDoctor: boolean;
  termsAccepted: boolean;
}

export interface ExtractedMarker {
  name: string;
  value: string;
  referenceRange?: string;
  unit?: string;
  status: 'normal' | 'high' | 'low' | 'abnormal' | 'critical';
  clinicalContext?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  type: 'lab' | 'imaging' | 'prescription' | 'discharge_summary' | 'ecg' | 'other';
  date: string;
  facility?: string;
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  extractedText?: string;
  extractedMarkers: ExtractedMarker[];
  extractedMedications?: string[];
  extractedDiagnoses?: string[];
  isSample?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  translatedText?: string;
  language: string;
  timestamp: string;
  category?: 'complaint' | 'onset' | 'severity' | 'aggravating' | 'medication' | 'allergy' | 'family' | 'redflag';
  audioPlaying?: boolean;
}

export interface RedFlagAlert {
  id: string;
  category: 'cardiovascular' | 'respiratory' | 'neurological' | 'metabolic' | 'allergy' | 'vital_sign';
  severity: 'critical' | 'high' | 'moderate';
  title: string;
  description: string;
  source: 'ai_interview' | 'report_ocr' | 'vitals' | 'combined';
  suggestedAction: string;
}

export interface StructuredClinicalHistory {
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  hpi: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  currentMedications: { name: string; dose?: string; frequency?: string; compliance?: string }[];
  allergies: { allergen: string; reaction: string; severity: 'mild' | 'moderate' | 'severe' }[];
  familyHistory: string[];
  socialHistory: {
    smoking?: string;
    alcohol?: string;
    occupation?: string;
    dietLifestyle?: string;
  };
  reviewOfSystems: {
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    neurological?: string;
    musculoskeletal?: string;
    general?: string;
  };
  aiSynthesizedSummary: string;
  clinicalConfidenceScore: number; // 0 - 100
}

export interface DoctorNote {
  id: string;
  doctorName: string;
  doctorRole: string;
  timestamp: string;
  clinicalImpression: string;
  differentialDiagnosis: string[];
  planOfCare: string[];
  prescriptionsPrescribed?: string[];
  isSignedOff: boolean;
  signedAt?: string;
}

export type PatientStatus = 'waiting_intake' | 'ai_completed' | 'doctor_reviewing' | 'confirmed' | 'escalated';

export interface PatientRecord {
  id: string;
  personalInfo: PatientPersonalInfo;
  consent: ConsentRecord;
  reports: MedicalReport[];
  conversationHistory: ChatMessage[];
  redFlags: RedFlagAlert[];
  structuredHistory: StructuredClinicalHistory;
  doctorNote?: DoctorNote;
  status: PatientStatus;
  triagePriority: 'routine' | 'urgent' | 'emergency';
  assignedDepartment?: string;
  assignedChamber?: string;
  assignedDoctorName?: string;
  assignedDoctorId?: string;
  routingReason?: string;
  updatedAt: string;
  doctorModifiedHistory?: Partial<StructuredClinicalHistory>;
  isDoctorConfirmed: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceLangCode: string;
}

export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  identifier: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  chamberNumber?: string;
  qualification?: string;
  experienceYears?: number;
  consultationHours?: string;
  licenseNumber?: string;
  age?: number;
  gender?: Gender;
  primaryLanguage?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  role: UserRole;
}

export interface RegisterData {
  identifier?: string;
  fullName: string;
  phone?: string;
  email?: string;
  password: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  chamberNumber?: string;
  qualification?: string;
  experienceYears?: number;
  consultationHours?: string;
  licenseNumber?: string;
  age?: number;
  gender?: Gender;
  primaryLanguage?: string;
}
