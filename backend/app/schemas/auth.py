from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    identifier: str
    password: str
    role: Optional[str] = "patient"

class RegisterRequest(BaseModel):
    fullName: str
    password: str
    identifier: Optional[str] = None
    phone: Optional[str] = ""
    email: Optional[str] = ""
    role: Optional[str] = "patient"
    department: Optional[str] = ""
    specialization: Optional[str] = ""
    chamberNumber: Optional[str] = ""
    qualification: Optional[str] = ""
    experienceYears: Optional[int] = 5
    consultationHours: Optional[str] = "09:00 AM - 02:00 PM"
    licenseNumber: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "male"
    primaryLanguage: Optional[str] = "en"

class UserResponse(BaseModel):
    id: str
    identifier: str
    fullName: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    role: str
    department: Optional[str] = ""
    specialization: Optional[str] = ""
    chamberNumber: Optional[str] = ""
    qualification: Optional[str] = ""
    experienceYears: Optional[int] = 0
    consultationHours: Optional[str] = ""
    licenseNumber: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "male"
    primaryLanguage: Optional[str] = "en"
    createdAt: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = ""
    token: Optional[str] = None
    user: Optional[UserResponse] = None
    error: Optional[str] = None
