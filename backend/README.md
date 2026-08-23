# MediKiosk Python Clinical Backend

Production-grade Python 3.12+ backend for MediKiosk using **FastAPI**, **SQLAlchemy**, **Pydantic**, and a dedicated **AI/ML Engine** (`scikit-learn`, `pandas`, `numpy`).

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py                  # FastAPI entry point, CORS, static uploads, health
│   ├── config.py                # Pydantic Settings & environment variables
│   ├── database.py              # SQLAlchemy database engine & session management
│   ├── models/                  # SQLAlchemy ORM database models
│   │   ├── user.py              # Doctor & Patient User entity
│   │   └── patient.py           # Patient clinical records & triage entity
│   ├── schemas/                 # Pydantic request/response validation schemas
│   │   ├── auth.py              # Login & Registration schemas
│   │   ├── patient.py           # Patient demographics, vitals, chat, reports
│   │   └── doctor.py            # Doctor notes, queue & digital sign-off
│   ├── routers/                 # FastAPI REST API endpoints
│   │   ├── auth.py              # /api/auth endpoints (login, register, me, logout)
│   │   ├── patients.py          # /api/patients endpoints (intake, chat, reports, synthesize)
│   │   └── doctor.py            # /api/doctor endpoints (queue, notes, sign-off)
│   ├── services/                # Business logic layer
│   │   ├── auth_service.py      # Authentication & JWT issuance
│   │   ├── patient_service.py   # Clinical intake, OCR, and chat turn processing
│   │   └── doctor_service.py    # Doctor queue filtering & clinical sign-off
│   ├── repositories/            # Database access layer
│   │   ├── user_repository.py   # Flexible identifier user queries & persistence
│   │   └── patient_repository.py# Patient records CRUD & query filtering
│   └── ai/                      # Modular AI/ML Engine
│       ├── preprocessing.py     # Text cleaning & symptom keyword tokenization
│       ├── opd_classifier.py    # 10 OPD Department classification & chamber routing
│       ├── predictor.py         # Adaptive Indian multilingual inquiry & red-flag detection
│       ├── model.py             # Structured clinical history synthesis & OCR extraction
│       └── utils.py             # Token & ID generation utilities
├── uploads/                     # Uploaded diagnostic reports & images
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment variables
└── README.md
```

---

## 🚀 How to Run the Python Backend

### 1. Create & Activate Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

---

## 📚 API Documentation

Once the server is running on port `5000`:
- **Interactive Swagger Docs**: `http://localhost:5000/docs`
- **ReDoc Documentation**: `http://localhost:5000/redoc`
- **Server Health Status**: `http://localhost:5000/api/health`
