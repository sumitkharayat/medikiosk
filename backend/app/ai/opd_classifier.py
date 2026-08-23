from typing import Dict, Any, List
from app.ai.preprocessing import normalize_text

OPD_DEPARTMENTS_CATALOG = [
    {
        "id": "cardiology",
        "name": "Cardiology",
        "chamber": "OPD Chamber 102",
        "keywords": [
            "chest", "heart", "cardio", "bp", "blood pressure", "palpitation", "angina", 
            "ecg", "troponin", "hypertension", "pulse", "दिल", "छाती", "धड़कन", "रक्तचाप", "বিপি", "বুক"
        ]
    },
    {
        "id": "orthopedics",
        "name": "Orthopedics",
        "chamber": "OPD Chamber 103",
        "keywords": [
            "bone", "joint", "fracture", "knee", "back", "spine", "arthritis", "shoulder", 
            "sprain", "x-ray", "swelling", "हड्डी", "जोड़", "घुटना", "कमर", "हड्डी टूट", "হাড়", "ব্যথা"
        ]
    },
    {
        "id": "pulmonology",
        "name": "Pulmonology",
        "chamber": "OPD Chamber 104",
        "keywords": [
            "cough", "asthma", "breath", "wheez", "lung", "sputum", "inhaler", "chest tightness", 
            "respiratory", "खांसी", "दमा", "सांस", "फेफड़े", "কাশি", "শ্বাসকষ্ট", "হাঁপানি"
        ]
    },
    {
        "id": "pediatrics",
        "name": "Pediatrics",
        "chamber": "OPD Chamber 105",
        "keywords": [
            "child", "infant", "baby", "pediatric", "vaccine", "teething", "growth", "बच्चा", 
            "शिशु", "टीकाकरण", "শিশু", "বাচ্চা"
        ]
    },
    {
        "id": "dermatology",
        "name": "Dermatology",
        "chamber": "OPD Chamber 106",
        "keywords": [
            "skin", "rash", "itch", "eczema", "acne", "allergy", "fungal", "spots", "blemish", 
            "त्वचा", "खुजली", "दाने", "एलर्जी", "চামড়া", "চুলকানি"
        ]
    },
    {
        "id": "gastroenterology",
        "name": "Gastroenterology",
        "chamber": "OPD Chamber 107",
        "keywords": [
            "stomach", "abdomen", "acid", "gas", "vomit", "diarrhea", "nausea", "liver", 
            "digestion", "constipation", "पेट", "गैस", "उल्टी", "दस्त", "पेट दर्द", "পেট ব্যথা", "বমি"
        ]
    },
    {
        "id": "neurology",
        "name": "Neurology",
        "chamber": "OPD Chamber 108",
        "keywords": [
            "headache", "migraine", "dizziness", "vertigo", "seizure", "numbness", "tingling", 
            "paralysis", "सिरदर्द", "माइग्रेन", "चक्कर", "दौरा", "माथा ব্যথা", "মাথা ঘোরা"
        ]
    },
    {
        "id": "ent",
        "name": "ENT",
        "chamber": "OPD Chamber 109",
        "keywords": [
            "throat", "ear", "nose", "sinus", "tonsil", "hearing", "sore throat", "runny nose", 
            "गला", "कान", "नाक", "टॉन्सिल", "গলা ব্যথা", "কান"
        ]
    },
    {
        "id": "ophthalmology",
        "name": "Ophthalmology",
        "chamber": "OPD Chamber 110",
        "keywords": [
            "eye", "vision", "blur", "cataract", "red eye", "irritation", "glasses", 
            "आंख", "धुंधला", "दृष्टि", "চোখ", "ঝাপসা"
        ]
    },
    {
        "id": "general_medicine",
        "name": "General Medicine",
        "chamber": "OPD Chamber 101",
        "keywords": [
            "fever", "weakness", "fatigue", "body ache", "chills", "infection", "malaise", 
            "बुखार", "कमजोरी", "थकान", "शरीर दर्द", "জ্বর", "দুর্বলতা"
        ]
    }
]

def classify_opd_department(patient_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Classify patient to the correct hospital OPD department & chamber room based on
    reported complaint, vitals, age, and conversational text.
    """
    personal_info = patient_data.get("personalInfo") or {}
    age = personal_info.get("age", 30)
    complaint = personal_info.get("chiefComplaint", "")
    vitals = personal_info.get("vitals") or {}

    conv_text = " ".join([m.get("text", "") for m in patient_data.get("conversationHistory", [])])
    reports_text = " ".join([r.get("extractedText", "") for r in patient_data.get("reports", [])])

    combined_corpus = f"{complaint} {conv_text} {reports_text}"
    normalized_corpus = normalize_text(combined_corpus)

    # 1. Pediatric rule (Age <= 14 or mentions child/infant)
    if (isinstance(age, int) and age <= 14) or any(k in normalized_corpus for k in ["infant", "toddler", "बच्चा", "শিশু"]):
        return {
            "department": "Pediatrics",
            "chamber": "OPD Chamber 105",
            "reason": f"Patient age ({age} yrs) / pediatric indicators detected -> Routed to Pediatrics OPD."
        }

    # 2. Score match against all OPD departments
    scores = {}
    for dept in OPD_DEPARTMENTS_CATALOG:
        score = 0
        for kw in dept["keywords"]:
            if kw in normalized_corpus:
                score += 3 if len(kw) > 4 else 2
        scores[dept["id"]] = score

    # Check high blood pressure trigger for Cardiology
    sys_bp = vitals.get("bloodPressureSystolic", 0)
    if isinstance(sys_bp, (int, float)) and sys_bp >= 160:
        scores["cardiology"] = scores.get("cardiology", 0) + 5

    # Check high temperature for General Medicine
    temp = vitals.get("temperature", 0)
    if isinstance(temp, (int, float)) and temp >= 101:
        scores["general_medicine"] = scores.get("general_medicine", 0) + 3

    # Find highest scoring department
    sorted_depts = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_dept_id, top_score = sorted_depts[0]

    if top_score > 0:
        found = next((d for d in OPD_DEPARTMENTS_CATALOG if d["id"] == top_dept_id), None)
        if found:
            return {
                "department": found["name"],
                "chamber": found["chamber"],
                "reason": f"Symptoms and clinical indicators match {found['name']} profile -> Routed to {found['name']} OPD."
            }

    # Default fallback
    return {
        "department": "General Medicine",
        "chamber": "OPD Chamber 101",
        "reason": "General outpatient intake & consultation."
    }
