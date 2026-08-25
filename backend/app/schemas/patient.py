from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class PatientPersonalInfo(BaseModel):
    fullName: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "male"
    phone: Optional[str] = ""
    email: Optional[str] = ""
    emergencyContactName: Optional[str] = ""
    emergencyContactPhone: Optional[str] = ""
    primaryLanguage: Optional[str] = "en"
    chiefComplaint: Optional[str] = ""
    vitals: Optional[Dict[str, Any]] = {}


class ConsentRecord(BaseModel):
    consentGiven: Optional[bool] = False
    timestamp: Optional[str] = None
    language: Optional[str] = "en"
    signatureData: Optional[str] = None


class MedicalReport(BaseModel):
    id: Optional[str] = None
    fileName: Optional[str] = ""
    fileType: Optional[str] = ""
    fileSize: Optional[int] = 0
    uploadTimestamp: Optional[str] = None
    extractedText: Optional[str] = ""
    keyFindings: Optional[List[str]] = []
    category: Optional[str] = ""
    confidenceScore: Optional[float] = 0.0
    fileUrl: Optional[str] = ""


class ChatMessage(BaseModel):
    role: Optional[str] = "user"
    text: Optional[str] = ""
    timestamp: Optional[str] = None
    language: Optional[str] = "en"


class StructuredClinicalHistory(BaseModel):
    chiefComplaint: Optional[str] = ""
    hpi: Optional[str] = ""
    painSeverity: Optional[str] = ""
    pastMedicalHistory: Optional[List[str]] = []
    pastSurgicalHistory: Optional[List[str]] = []
    currentMedications: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    familyHistory: Optional[List[str]] = []
    socialHistory: Optional[Dict[str, Any]] = {}
    reviewOfSystems: Optional[Dict[str, Any]] = {}
    aiSynthesizedSummary: Optional[str] = ""


class PatientRecordSchema(BaseModel):
    id: Optional[str] = None
    queueToken: Optional[str] = ""
    fullName: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "male"
    phone: Optional[str] = ""
    email: Optional[str] = ""
    emergencyContactName: Optional[str] = ""
    emergencyContactPhone: Optional[str] = ""
    primaryLanguage: Optional[str] = "en"
    chiefComplaint: Optional[str] = ""
    vitals: Optional[Dict[str, Any]] = {}
    consent: Optional[Dict[str, Any]] = {}
    reports: Optional[List[Dict[str, Any]]] = []
    conversationHistory: Optional[List[Dict[str, Any]]] = []
    redFlags: Optional[List[str]] = []
    structuredHistory: Optional[Dict[str, Any]] = {}
    doctorNote: Optional[Dict[str, Any]] = None
    doctorModifiedHistory: Optional[Dict[str, Any]] = None
    assignedDepartment: Optional[str] = "General Medicine"
    assignedChamber: Optional[str] = "OPD Chamber 101"
    routingReason: Optional[str] = ""
    triagePriority: Optional[str] = "routine"
    status: Optional[str] = "waiting_intake"
    isDoctorConfirmed: Optional[bool] = False
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class CreatePatientRequest(BaseModel):
    id: Optional[str] = None
    fullName: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "male"
    phone: Optional[str] = ""
    email: Optional[str] = ""
    primaryLanguage: Optional[str] = "en"
    chiefComplaint: Optional[str] = ""
    vitals: Optional[Dict[str, Any]] = {}


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"


class SynthesizeRequest(BaseModel):
    patient: Optional[Dict[str, Any]] = None