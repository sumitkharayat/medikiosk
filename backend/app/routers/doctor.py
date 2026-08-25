import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.patient_repository import PatientRepository
from app.services.patient_service import serialize_patient

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])


@router.get("/queue")
def get_doctor_queue(db: Session = Depends(get_db)):
    repo = PatientRepository(db)
    patients = repo.get_all()

    return {
        "success": True,
        "patients": [serialize_patient(p) for p in patients],
        "metrics": {
            "total": len(patients),
            "critical": sum(1 for p in patients if p.triage_priority == "emergency"),
            "inReview": sum(1 for p in patients if p.status == "doctor_reviewing"),
            "signedOff": sum(1 for p in patients if p.is_doctor_confirmed),
        },
    }


@router.post("/patients/{patient_id}/sign-off")
async def sign_off_patient(patient_id: str, request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}

    repo = PatientRepository(db)
    patient = repo.get_by_id(patient_id)
    if not patient:
        return {"success": False, "error": "Patient not found"}

    note_payload = body.get("note") or {}
    doctor_note = {
        "id": str(uuid.uuid4()),
        "doctorName": body.get("doctorName", "Dr. Attending Physician"),
        "doctorRole": body.get("doctorRole", "Attending Physician"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "clinicalImpression": note_payload.get("clinicalImpression", ""),
        "differentialDiagnosis": note_payload.get("differentialDiagnosis", []),
        "planOfCare": note_payload.get("planOfCare", []),
        "isSignedOff": True,
    }

    patient.doctor_note = doctor_note
    patient.is_doctor_confirmed = True
    patient.status = "doctor_confirmed"
    repo.update(patient)

    return {"success": True, "patient": serialize_patient(patient)}


@router.put("/patients/{patient_id}/history")
async def update_patient_history(patient_id: str, request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}

    repo = PatientRepository(db)
    patient = repo.get_by_id(patient_id)
    if not patient:
        return {"success": False, "error": "Patient not found"}

    current = dict(patient.structured_history or {})
    editable_fields = [
        "chiefComplaint", "hpi", "pastMedicalHistory", "pastSurgicalHistory",
        "currentMedications", "allergies", "familyHistory", "socialHistory",
        "reviewOfSystems", "aiSynthesizedSummary",
    ]
    for field in editable_fields:
        if field in body:
            current[field] = body[field]

    patient.doctor_modified_history = current
    patient.status = "doctor_reviewing"
    repo.update(patient)

    return {"success": True, "patient": serialize_patient(patient)}
