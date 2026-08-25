import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def _hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def _verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    def _create_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return jwt.encode({"sub": user_id, "exp": expire}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def _user_to_dict(self, user: User) -> dict:
        return {
            "id": user.id,
            "identifier": user.identifier,
            "fullName": user.full_name,
            "phone": user.phone or "",
            "email": user.email or "",
            "role": user.role,
            "department": user.department or "",
            "specialization": user.specialization or "",
            "chamberNumber": user.chamber_number or "",
            "qualification": user.qualification or "",
            "experienceYears": user.experience_years or 0,
            "consultationHours": user.consultation_hours or "",
            "licenseNumber": user.license_number or "",
            "age": user.age or 30,
            "gender": user.gender or "male",
            "primaryLanguage": user.primary_language or "en",
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        }

    def register(self, req: RegisterRequest) -> dict:
        identifier = req.identifier or req.phone or req.email
        if not identifier:
            return {"success": False, "error": "Identifier (phone or email) is required"}

        existing = self.db.query(User).filter(User.identifier == identifier).first()
        if existing:
            return {"success": False, "error": f"User with identifier '{identifier}' already exists"}

        user = User(
            id=str(uuid.uuid4()),
            identifier=identifier,
            full_name=req.fullName,
            phone=req.phone or "",
            email=req.email or "",
            role=req.role or "patient",
            password_hash=self._hash_password(req.password),
            department=req.department or "",
            specialization=req.specialization or "",
            chamber_number=req.chamberNumber or "",
            qualification=req.qualification or "",
            experience_years=req.experienceYears or 0,
            consultation_hours=req.consultationHours or "09:00 AM - 02:00 PM",
            license_number=req.licenseNumber or "",
            age=req.age or 30,
            gender=req.gender or "male",
            primary_language=req.primaryLanguage or "en",
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        token = self._create_token(user.id)
        return {"success": True, "message": "User registered successfully", "token": token, "user": self._user_to_dict(user)}

    def login(self, req: LoginRequest) -> dict:
        user = self.db.query(User).filter(User.identifier == req.identifier).first()
        if not user:
            return {"success": False, "error": f"User '{req.identifier}' not found"}

        if not self._verify_password(req.password, user.password_hash):
            return {"success": False, "error": "Invalid password"}

        if req.role and req.role != "patient" and user.role != req.role:
            return {"success": False, "error": f"User does not have '{req.role}' role"}

        token = self._create_token(user.id)
        return {"success": True, "message": "Login successful", "token": token, "user": self._user_to_dict(user)}

    def get_me(self, user_id: str) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "error": "User not found"}
        return {"success": True, "user": self._user_to_dict(user)}
