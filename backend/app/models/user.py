from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, index=True)
    identifier = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(50), default="", index=True)
    email = Column(String(150), default="", index=True)
    role = Column(String(50), default="patient", index=True)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100), default="")
    specialization = Column(String(100), default="")
    chamber_number = Column(String(100), default="")
    qualification = Column(String(150), default="")
    experience_years = Column(Integer, default=0)
    consultation_hours = Column(String(100), default="09:00 AM - 02:00 PM")
    license_number = Column(String(100), default="", index=True)
    age = Column(Integer, default=30)
    gender = Column(String(20), default="male")
    primary_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
