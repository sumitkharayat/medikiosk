import uuid
import time
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.repositories.patient_repository import PatientRepository
from app.ai.opd_classifier import classify_opd_department
from app.ai.predictor import process_consultation_turn, evaluate_red_flags
from app.ai.model import synthesize_clinical_history


def serialize_patient(patient: Patient) -> dict:
    return {
        "id": patient.id,
        "queueToken": patient.queue_token,
        "fullName": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "email": patient.email,
        "emergencyContactName": patient.emergency_contact_name,
        "emergencyContactPhone": patient.emergency_contact_phone,
        "primaryLanguage": patient.primary_language,
        "chiefComplaint": patient.chief_complaint,
        "vitals": patient.vitals or {},
        "consent": patient.consent or {},
        "reports": patient.reports or [],
        "conversationHistory": patient.conversation_history or [],
        "redFlags": patient.red_flags or [],
        "structuredHistory": patient.structured_history or {},
        "doctorNote": patient.doctor_note,
        "doctorModifiedHistory": patient.doctor_modified_history,
        "assignedDepartment": patient.assigned_department,
        "assignedChamber": patient.assigned_chamber,
        "routingReason": patient.routing_reason,
        "triagePriority": patient.triage_priority,
        "status": patient.status,
        "isDoctorConfirmed": patient.is_doctor_confirmed,
        "createdAt": patient.created_at.isoformat() if patient.created_at else None,
        "updatedAt": patient.updated_at.isoformat() if patient.updated_at else None,
    }


class PatientService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PatientRepository(db)

    def _generate_queue_token(self) -> str:
        return f"Q{int(time.time() * 1000) % 100000:05d}"

    def _determine_triage(self, red_flags: List[str], conversation: list, age: int) -> str:
        if red_flags:
            return "emergency"
        for msg in conversation:
            if msg.get("role") == "user":
                for token in msg.get("text", "").split():
                    if token.isdigit() and 1 <= int(token) <= 10:
                        return "urgent" if int(token) >= 8 else "routine"
        if age and (age < 5 or age > 75):
            return "urgent"
        return "routine"

    def create_or_upsert_patient(self, body: dict) -> dict:
        patient_id = body.get("id")
        if patient_id:
            existing = self.repo.get_by_id(patient_id)
            if existing:
                return {"success": True, "patient": serialize_patient(existing)}

        patient = Patient(
            id=patient_id or str(uuid.uuid4()),
            queue_token=self._generate_queue_token(),
            full_name=body.get("fullName", ""),
            age=body.get("age", 30),
            gender=body.get("gender", "male"),
            phone=body.get("phone", ""),
            email=body.get("email", ""),
            emergency_contact_name=body.get("emergencyContactName", ""),
            emergency_contact_phone=body.get("emergencyContactPhone", ""),
            primary_language=body.get("primaryLanguage", "en"),
            chief_complaint=body.get("chiefComplaint", ""),
            vitals=body.get("vitals") or {},
            consent={},
            reports=[],
            conversation_history=[],
            red_flags=[],
            structured_history={},
            status="waiting_intake",
            triage_priority="routine",
            assigned_department="General Medicine",
            assigned_chamber="OPD Chamber 101",
            routing_reason="Pending clinical intake.",
        )
        self.repo.create(patient)
        return {"success": True, "patient": serialize_patient(patient)}

    def update_patient(self, patient_id: str, body: dict) -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}
        field_map = {
            "fullName": "full_name", "age": "age", "gender": "gender",
            "phone": "phone", "email": "email", "chiefComplaint": "chief_complaint",
            "primaryLanguage": "primary_language", "vitals": "vitals",
            "emergencyContactName": "emergency_contact_name",
            "emergencyContactPhone": "emergency_contact_phone",
        }
        for camel, snake in field_map.items():
            if camel in body:
                setattr(patient, snake, body[camel])
        self.repo.update(patient)
        return {"success": True, "patient": serialize_patient(patient)}

    def update_personal_info(self, patient_id: str, body: dict) -> dict:
        return self.update_patient(patient_id, body)

    def update_consent(self, patient_id: str, body: dict) -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}
        patient.consent = body
        self.repo.update(patient)
        return {"success": True, "patient": serialize_patient(patient)}

    def add_report(self, patient_id: str, report_data: dict) -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}
        reports = list(patient.reports or [])
        reports.append(report_data)
        patient.reports = reports
        self.repo.update(patient)
        return {"success": True, "patient": serialize_patient(patient)}

    def delete_report(self, patient_id: str, report_id: str) -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}
        patient.reports = [r for r in (patient.reports or []) if r.get("id") != report_id]
        self.repo.update(patient)
        return {"success": True, "patient": serialize_patient(patient)}

    def handle_chat_message(self, patient_id: str, message: str, language: str = "en") -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}

        history = list(patient.conversation_history or [])
        timestamp = datetime.utcnow().isoformat() + "Z"

        history.append({"role": "user", "text": message, "timestamp": timestamp, "language": language})

        patient_data = {
            "conversationHistory": history,
            "personalInfo": {
                "age": patient.age,
                "chiefComplaint": patient.chief_complaint,
                "vitals": patient.vitals or {},
            },
            "reports": patient.reports or [],
        }

        result = process_consultation_turn(patient_data, message, language)
        history.append({"role": "assistant", "text": result["reply"], "timestamp": timestamp, "language": language})
        patient.conversation_history = history

        if result.get("redFlagsDetected"):
            existing_flags = list(patient.red_flags or [])
            for flag in result["redFlagsDetected"]:
                if flag not in existing_flags:
                    existing_flags.append(flag)
            patient.red_flags = existing_flags
            patient.triage_priority = "emergency"

        self.repo.update(patient)
        return {
            "success": True,
            "reply": result["reply"],
            "isComplete": result["isComplete"],
            "patient": serialize_patient(patient),
        }

    def synthesize(self, patient_id: str, patient_payload: Optional[dict] = None) -> dict:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}

        patient_data = {
            "personalInfo": {
                "age": patient.age,
                "chiefComplaint": patient.chief_complaint,
                "vitals": patient.vitals or {},
            },
            "conversationHistory": patient.conversation_history or [],
            "reports": patient.reports or [],
        }

        structured = synthesize_clinical_history(patient_data)
        routing = classify_opd_department(patient_data)

        all_user_text = patient.chief_complaint + " " + " ".join(
            m.get("text", "") for m in (patient.conversation_history or []) if m.get("role") == "user"
        )
        red_flags = evaluate_red_flags(all_user_text, language=patient.primary_language or "en")
        triage = self._determine_triage(red_flags, patient.conversation_history or [], patient.age or 30)

        patient.structured_history = structured
        patient.assigned_department = routing["department"]
        patient.assigned_chamber = routing["chamber"]
        patient.routing_reason = routing["reason"]
        patient.red_flags = red_flags
        patient.triage_priority = triage
        patient.status = "ai_completed"
        self.repo.update(patient)

        return {
            "success": True,
            "patient": serialize_patient(patient),
            "routing": routing,
            "triagePriority": triage,
            "redFlags": red_flags,
        }
