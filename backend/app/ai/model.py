from typing import Dict, Any, List
from app.ai.preprocessing import normalize_text

REPORT_CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Blood Test": ["blood", "cbc", "hemoglobin", "hematocrit", "platelet", "wbc", "rbc", "haemoglobin"],
    "Imaging Report": ["xray", "x-ray", "mri", "ct scan", "ultrasound", "echo", "echocardiogram", "radiology", "scan"],
    "Urine Report": ["urine", "urinalysis", "urea", "creatinine", "kidney function"],
    "Lipid Profile": ["lipid", "cholesterol", "triglyceride", "hdl", "ldl"],
    "Diabetes Panel": ["glucose", "hba1c", "sugar", "insulin", "diabetes", "fasting"],
    "Thyroid Function": ["thyroid", "tsh", "t3", "t4", "thyroxine"],
    "Liver Function": ["liver", "sgot", "sgpt", "bilirubin", "alt", "ast", "hepatic"],
    "Cardiac Panel": ["troponin", "bnp", "ecg", "ekg", "cardiac", "creatine kinase"],
    "Pulmonary Function": ["spirometry", "peak flow", "lung function", "fev", "fvc"],
}


def extract_report_entities(filename: str, content_type: str) -> Dict[str, Any]:
    lower_name = normalize_text(filename.replace("_", " ").replace("-", " "))

    category = "General Report"
    confidence = 0.60

    for cat, keywords in REPORT_CATEGORY_KEYWORDS.items():
        if any(kw in lower_name for kw in keywords):
            category = cat
            confidence = 0.82
            break

    if "image" in content_type or content_type in ("image/jpeg", "image/png", "image/jpg", "image/gif"):
        extracted_text = f"[Image report uploaded: {filename}] Awaiting radiologist review."
        key_findings = ["Image file received", "Manual radiologist review required"]
    elif "pdf" in content_type:
        extracted_text = f"[PDF report uploaded: {filename}] Document received for clinical review."
        key_findings = ["PDF document received", "Pending text extraction and review"]
    else:
        extracted_text = f"[Report uploaded: {filename}] File received for clinical assessment."
        key_findings = ["Report file received", "Awaiting clinical review"]

    return {
        "extractedText": extracted_text,
        "keyFindings": key_findings,
        "category": category,
        "confidenceScore": confidence,
    }


def synthesize_clinical_history(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    history = patient_data.get("conversationHistory", [])
    personal_info = patient_data.get("personalInfo", {})
    reports = patient_data.get("reports", [])

    # Build Q&A pairs: each assistant question paired with the following user answer
    pairs: List[tuple] = []
    for i, msg in enumerate(history):
        if msg.get("role") == "assistant" and i + 1 < len(history):
            next_msg = history[i + 1]
            if next_msg.get("role") == "user":
                pairs.append((msg.get("text", "").lower(), next_msg.get("text", "")))

    def find_answer(keywords: List[str]) -> str:
        for q, a in pairs:
            if any(kw in q for kw in keywords):
                return a
        return ""

    def find_list_answer(keywords: List[str]) -> List[str]:
        ans = find_answer(keywords)
        if not ans or normalize_text(ans) in ("no", "none", "n/a", "nil", "नहीं", "না", "not applicable"):
            return []
        return [ans]

    chief_complaint = personal_info.get("chiefComplaint", "")
    hpi = find_answer(["long", "duration", "how long", "since"])
    severity = find_answer(["severe", "scale", "1 to 10", "pain level", "discomfort"])

    summary_parts = [f"Patient presents with: {chief_complaint}."]
    if hpi:
        summary_parts.append(f"Duration: {hpi}.")
    if severity:
        summary_parts.append(f"Severity: {severity}/10.")
    if reports:
        summary_parts.append(f"{len(reports)} report(s) uploaded.")

    return {
        "chiefComplaint": chief_complaint,
        "hpi": hpi,
        "painSeverity": severity,
        "currentMedications": find_list_answer(["medication", "medicine", "drug", "taking any"]),
        "allergies": find_list_answer(["allerg"]),
        "pastMedicalHistory": find_list_answer(["chronic", "diabetes", "hypertension", "heart disease", "asthma", "condition"]),
        "pastSurgicalHistory": find_list_answer(["surger", "hospitalization", "operation", "hospitaliz"]),
        "familyHistory": find_list_answer(["family", "relative", "parents", "immediate"]),
        "reviewOfSystems": {},
        "socialHistory": {},
        "aiSynthesizedSummary": " ".join(summary_parts),
    }
