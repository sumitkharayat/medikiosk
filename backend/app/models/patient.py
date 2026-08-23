from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(100), primary_key=True, index=True)
    queue_token = Column(String(50), index=True, default="")
    full_name = Column(String(200), default="", index=True)
    age = Column(Integer, default=30)
    gender = Column(String(20), default="male")
    phone = Column(String(50), default="")
    email = Column(String(150), default="")
    emergency_contact_name = Column(String(200), default="")
    emergency_contact_phone = Column(String(50), default="")
    primary_language = Column(String(10), default="en")
    chief_complaint = Column(Text, default="")
    
    # Complex Nested Fields stored as JSON
    vitals = Column(JSON, default=dict)
    consent = Column(JSON, default=dict)
    reports = Column(JSON, default=list)
    conversation_history = Column(JSON, default=list)
    red_flags = Column(JSON, default=list)
    structured_history = Column(JSON, default=dict)
    doctor_note = Column(JSON, nullable=True)
    doctor_modified_history = Column(JSON, nullable=True)

    # OPD Department Triage & Chamber Allocation
    assigned_department = Column(String(100), default="General Medicine", index=True)
    assigned_chamber = Column(String(100), default="OPD Chamber 101")
    routing_reason = Column(Text, default="")

    # Status & Triage Priority
    triage_priority = Column(String(50), default="routine", index=True)  # routine, urgent, emergency
    status = Column(String(50), default="waiting_intake", index=True)   # waiting_intake, ai_completed, doctor_reviewing, doctor_confirmed
    is_doctor_confirmed = Column(Boolean, default=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
