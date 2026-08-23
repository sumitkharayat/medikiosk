import os
import time
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.database import get_db
from app.services.patient_service import PatientService
from app.ai.model import extract_report_entities
from app.config import settings

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("", status_code=201)
async def create_patient(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}
    service = PatientService(db)
    return service.create_or_upsert_patient(body)

@router.put("/{patient_id}")
async def update_patient(patient_id: str, request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}
    service = PatientService(db)
    return service.update_patient(patient_id, body)

@router.put("/{patient_id}/personal-info")
async def update_personal_info(patient_id: str, request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    service = PatientService(db)
    return service.update_personal_info(patient_id, body)

@router.put("/{patient_id}/consent")
async def update_consent(patient_id: str, request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    service = PatientService(db)
    return service.update_consent(patient_id, body)

@router.post("/{patient_id}/reports")
async def upload_report(
    patient_id: str,
    request: Request,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    service = PatientService(db)

    # 1. Handle File Upload (Multipart Form Data)
    if file:
        upload_dir = os.path.join(os.getcwd(), "backend", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        unique_name = f"{int(time.time()*1000)}-{file.filename}"
        file_path = os.path.join(upload_dir, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)
        extracted = extract_report_entities(file.filename, file.content_type or "application/octet-stream")

        report_data = {
            "id": f"rep-{int(time.time()*1000)}",
            "fileName": file.filename,
            "fileType": file.content_type or "image/jpeg",
            "fileSize": file_size,
            "uploadTimestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "extractedText": extracted["extractedText"],
            "keyFindings": extracted["keyFindings"],
            "category": extracted["category"],
            "confidenceScore": extracted["confidenceScore"],
            "fileUrl": f"/uploads/{unique_name}"
        }
        return service.add_report(patient_id, report_data)

    # 2. Handle JSON Sample Report
    try:
        body = await request.json()
        if "sampleReport" in body:
            return service.add_report(patient_id, body["sampleReport"])
    except Exception:
        pass

    raise HTTPException(status_code=400, detail="No report file or payload provided")

@router.delete("/{patient_id}/reports/{report_id}")
def delete_report(patient_id: str, report_id: str, db: Session = Depends(get_db)):
    service = PatientService(db)
    return service.delete_report(patient_id, report_id)

@router.post("/{patient_id}/chat")
async def handle_chat(patient_id: str, request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    message = body.get("message", "")
    language = body.get("language", "en")
    service = PatientService(db)
    return service.handle_chat_message(patient_id, message, language)

@router.post("/{patient_id}/synthesize")
async def synthesize_patient(patient_id: str, request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        patient_payload = body.get("patient")
    except Exception:
        patient_payload = None
    service = PatientService(db)
    return service.synthesize(patient_id, patient_payload)
