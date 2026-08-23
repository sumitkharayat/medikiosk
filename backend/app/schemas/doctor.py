from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.schemas.patient import PatientRecordSchema

class DoctorNoteSchema(BaseModel):
    id: Optional[str] = None
    doctorName: Optional[str] = "Dr. Attending Physician"
    doctorRole: Optional[str] = "Attending Physician"
    timestamp: Optional[str] = None
    clinicalImpression: Optional[str] = ""
    differentialDiagnosis: Optional[List[str]] = []
    planOfCare: Optional[List[str]] = []
    isSignedOff: Optional[bool] = False

class DoctorSignOffRequest(BaseModel):
    doctorName: Optional[str] = "Dr. Attending Physician"
    doctorRole: Optional[str] = "Attending Physician"
    note: Optional[Dict[str, Any]] = None

class DoctorHistoryUpdateRequest(BaseModel):
    chiefComplaint: Optional[str] = None
    hpi: Optional[str] = None
    pastMedicalHistory: Optional[List[str]] = None
    pastSurgicalHistory: Optional[List[str]] = None
    currentMedications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    familyHistory: Optional[List[str]] = None
    socialHistory: Optional[Dict[str, Any]] = None
    reviewOfSystems: Optional[Dict[str, Any]] = None
    aiSynthesizedSummary: Optional[str] = None

class QueueMetrics(BaseModel):
    total: int
    critical: int
    inReview: int
    signedOff: int

class DoctorQueueResponse(BaseModel):
    success: bool
    patients: List[Dict[str, Any]]
    metrics: QueueMetrics
