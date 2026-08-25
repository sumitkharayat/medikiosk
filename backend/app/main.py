import os
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, get_db
from app.routers.auth import router as auth_router
from app.routers.patients import router as patient_router
from app.routers.doctor import router as doctor_router
from app.repositories.patient_repository import PatientRepository

logging.basicConfig(level=logging.INFO)
_log = logging.getLogger(__name__)

# Create database tables automatically
Base.metadata.create_all(bind=engine)

if settings.GROQ_API_KEY:
    _log.info("Red-flag detection: rule-based + Groq/Llama-3 enhancement (ACTIVE)")
else:
    _log.info("Red-flag detection: rule-based only (GROQ_API_KEY not set)")

# Create uploads directory if it does not exist
uploads_dir = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(uploads_dir, exist_ok=True)

app = FastAPI(
    title="MediKiosk Python Clinical Backend Engine",
    description="FastAPI + SQLAlchemy + AI/ML engine for MediKiosk Clinical Intake & OPD Triage System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)

# Health Check Endpoint
@app.get("/api/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    repo = PatientRepository(db)
    patients = repo.get_all()
    return {
        "status": "healthy",
        "engine": "Python FastAPI + SQLAlchemy + AI/ML",
        "totalPatients": len(patients),
        "aiModelReady": True,
        "databaseConnected": True
    }

# Root Dashboard HTML
@app.get("/", response_class=HTMLResponse, tags=["System"])
def root_dashboard(db: Session = Depends(get_db)):
    repo = PatientRepository(db)
    patients = repo.get_all()
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MediKiosk Python Backend Engine</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; background: #090d16; color: #f1f5f9; padding: 40px 20px; margin: 0; }}
        .container {{ max-width: 820px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
        .badge {{ display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.15); color: #34d399; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; border: 1px solid rgba(16,185,129,0.3); }}
        .pulse {{ width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px #10b981; }}
        h1 {{ margin: 16px 0 8px; font-size: 28px; font-weight: 800; color: #fff; }}
        p {{ color: #94a3b8; font-size: 14px; line-height: 1.6; }}
        .btn-ui {{ display: inline-block; background: linear-gradient(135deg, #059669, #0284c7); color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 16px; margin-right: 12px; box-shadow: 0 8px 20px rgba(5,150,105,0.3); }}
        .btn-docs {{ display: inline-block; background: #1e293b; color: #38bdf8; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 16px; border: 1px solid #334155; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }}
        .card {{ background: #1e293b; padding: 18px; border-radius: 14px; border: 1px solid #334155; }}
        .card-num {{ font-size: 24px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #38bdf8; }}
        .card-label {{ font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-top: 4px; }}
        .endpoints {{ background: #050811; border-radius: 14px; padding: 16px; border: 1px solid #1e293b; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #cbd5e1; }}
        .ep-row {{ padding: 6px 0; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; }}
        .ep-row:last-child {{ border-bottom: none; }}
        .method {{ font-weight: 700; color: #34d399; }}
        .method.get {{ color: #38bdf8; }}
        .method.put {{ color: #fbbf24; }}
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge"><span class="pulse"></span> Python FastAPI Backend Active (Port 5000)</span>
        <h1>MediKiosk Python Clinical Backend</h1>
        <p>Production-grade Python 3.12+ FastAPI backend engine with SQLAlchemy ORM, modular AI/ML pipeline (scikit-learn / pandas / numpy), and 100% REST API compatibility.</p>
        
        <div>
          <a href="http://localhost:3000" class="btn-ui">👉 Open React Kiosk (Port 3000)</a>
          <a href="/docs" class="btn-docs">📚 Interactive Swagger API Docs (/docs)</a>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-num">{len(patients)}</div>
            <div class="card-label">Patients in Database</div>
          </div>
          <div class="card">
            <div class="card-num">Ready</div>
            <div class="card-label">Python AI/ML Engine</div>
          </div>
          <div class="card">
            <div class="card-num">FastAPI</div>
            <div class="card-label">Async REST Gateway</div>
          </div>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; margin-top: 24px;">Active REST API Endpoints</h3>
        <div class="endpoints">
          <div class="ep-row"><span class="method get">GET</span> <a href="/api/health" style="color: #38bdf8;">/api/health</a> <span>Server Status</span></div>
          <div class="ep-row"><span class="method get">GET</span> <a href="/docs" style="color: #38bdf8;">/docs</a> <span>Swagger API Documentation</span></div>
          <div class="ep-row"><span class="method get">GET</span> <a href="/api/doctor/queue" style="color: #38bdf8;">/api/doctor/queue</a> <span>Doctor Triage Queue</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/auth/login</span> <span>Doctor & Patient Login</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/patients</span> <span>Create Intake Record</span></div>
          <div class="ep-row"><span class="method put">PUT</span> <span>/api/patients/{{id}}/personal-info</span> <span>Update Demographics</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/patients/{{id}}/reports</span> <span>Upload Report (OCR)</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/patients/{{id}}/chat</span> <span>Doc Assistant Intake</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/patients/{{id}}/synthesize</span> <span>Clinical Synthesis & OPD Routing</span></div>
          <div class="ep-row"><span class="method">POST</span> <span>/api/doctor/patients/{{id}}/sign-off</span> <span>Doctor Sign-Off</span></div>
        </div>
      </div>
    </body>
    </html>
    """
