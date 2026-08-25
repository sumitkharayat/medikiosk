from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.patient import Patient


class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Patient]:
        return self.db.query(Patient).order_by(Patient.created_at.desc()).all()

    def get_by_id(self, patient_id: str) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def create(self, patient: Patient) -> Patient:
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update(self, patient: Patient) -> Patient:
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def delete(self, patient: Patient) -> None:
        self.db.delete(patient)
        self.db.commit()
