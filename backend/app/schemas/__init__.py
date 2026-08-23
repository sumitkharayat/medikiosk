from app.schemas.auth import (
    LoginRequest, 
    RegisterRequest, 
    UserResponse, 
    AuthResponse
)
from app.schemas.patient import (
    PatientPersonalInfo, 
    ConsentRecord, 
    MedicalReport, 
    ChatMessage, 
    StructuredClinicalHistory, 
    PatientRecordSchema, 
    CreatePatientRequest, 
    ChatRequest, 
    SynthesizeRequest
)
from app.schemas.doctor import (
    DoctorNoteSchema, 
    DoctorSignOffRequest, 
    DoctorHistoryUpdateRequest, 
    DoctorQueueResponse
)
