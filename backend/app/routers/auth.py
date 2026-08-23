from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    res = service.register(req)
    if not res.get("success"):
        status_code = 409 if "already exists" in res.get("error", "") else 400
        return JSONResponse(status_code=status_code, content={"success": False, "error": res.get("error"), "detail": res.get("error")})
    return res

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    res = service.login(req)
    if not res.get("success"):
        status_code = 404 if "not found" in res.get("error", "") else 401
        return JSONResponse(status_code=status_code, content={"success": False, "error": res.get("error"), "detail": res.get("error")})
    return res

@router.get("/me")
def get_current_user(x_user_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        return JSONResponse(status_code=401, content={"success": False, "error": "Not authenticated", "detail": "Not authenticated"})
    service = AuthService(db)
    res = service.get_me(x_user_id)
    if not res.get("success"):
        return JSONResponse(status_code=404, content={"success": False, "error": "User not found", "detail": "User not found"})
    return res

@router.post("/logout")
def logout_user():
    return {"success": True, "message": "Logged out successfully"}
