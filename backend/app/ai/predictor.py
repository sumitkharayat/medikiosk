import json
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from typing import Dict, Any, List
from app.ai.preprocessing import normalize_text
from app.config import settings

logger = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=2)

INTAKE_QUESTIONS = [
    {
        "id": "duration",
        "en": "How long have you been experiencing your main complaint? (e.g., since today, 2 days, 1 week)",
        "hi": "आप कितने समय से अपनी मुख्य समस्या का अनुभव कर रहे हैं?",
        "bn": "আপনি কতদিন ধরে আপনার প্রধান সমস্যা অনুভব করছেন?",
    },
    {
        "id": "severity",
        "en": "On a scale of 1 to 10, how severe is your discomfort right now? (1 = mild, 10 = worst possible)",
        "hi": "1 से 10 के पैमाने पर, अभी आपकी तकलीफ कितनी गंभीर है?",
        "bn": "১ থেকে ১০ এর মধ্যে, এখন আপনার অস্বস্তি কতটা তীব্র?",
    },
    {
        "id": "history",
        "en": "Is this the first time you are experiencing this problem, or has it happened before?",
        "hi": "क्या यह पहली बार है जब आप इस समस्या का अनुभव कर रहे हैं, या यह पहले भी हुआ है?",
        "bn": "এটি কি প্রথমবার যে আপনি এই সমস্যাটি অনুভব করছেন, নাকি এটি আগেও হয়েছে?",
    },
    {
        "id": "medications",
        "en": "Are you currently taking any medications? If yes, please list them.",
        "hi": "क्या आप वर्तमान में कोई दवाई ले रहे हैं? यदि हां, तो कृपया उन्हें बताएं।",
        "bn": "আপনি কি বর্তমানে কোনো ওষুধ খাচ্ছেন? যদি হ্যাঁ, তাহলে সেগুলি উল্লেখ করুন।",
    },
    {
        "id": "allergies",
        "en": "Do you have any known allergies (medications, food, or environmental)?",
        "hi": "क्या आपको कोई ज्ञात एलर्जी है (दवाई, भोजन, या पर्यावरणीय)?",
        "bn": "আপনার কি কোনো পরিচিত অ্যালার্জি আছে (ওষুধ, খাবার, বা পরিবেশগত)?",
    },
    {
        "id": "chronic",
        "en": "Do you have any chronic conditions such as diabetes, hypertension, heart disease, or asthma?",
        "hi": "क्या आपको कोई दीर्घकालिक बीमारी है जैसे मधुमेह, उच्च रक्तचाप, हृदय रोग, या दमा?",
        "bn": "আপনার কি ডায়াবেটিস, উচ্চ রক্তচাপ, হৃদরোগ বা হাঁপানির মতো দীর্ঘস্থায়ী রোগ আছে?",
    },
    {
        "id": "surgery",
        "en": "Have you had any surgeries or hospitalizations in the past two years?",
        "hi": "क्या आपकी पिछले दो वर्षों में कोई सर्जरी या अस्पताल में भर्ती हुई है?",
        "bn": "গত দুই বছরে আপনার কোনো অস্ত্রোপচার বা হাসপাতালে ভর্তি হয়েছিল কি?",
    },
    {
        "id": "family",
        "en": "Does anyone in your immediate family have a similar or related medical condition?",
        "hi": "क्या आपके परिवार में किसी को भी ऐसी कोई या संबंधित बीमारी है?",
        "bn": "আপনার পরিবারের কেউ কি একই বা সম্পর্কিত রোগে আক্রান্ত?",
    },
    {
        "id": "additional",
        "en": "Is there anything else you'd like the doctor to know — recent fever, weight changes, or other symptoms?",
        "hi": "क्या आप डॉक्टर को कुछ और बताना चाहते हैं — जैसे हाल ही में बुखार, वजन में बदलाव, या अन्य लक्षण?",
        "bn": "ডাক্তারকে কি আর কিছু জানাতে চান — যেমন সাম্প্রতিক জ্বর, ওজনের পরিবর্তন, বা অন্যান্য উপসর্গ?",
    },
]

RED_FLAG_TERMS = [
    ("chest pain", "Chest pain — possible cardiac event"),
    ("difficulty breathing", "Breathing difficulty — respiratory emergency"),
    ("shortness of breath", "Shortness of breath — urgent respiratory concern"),
    ("can't breathe", "Severe breathing difficulty — emergency"),
    ("unconscious", "Reported loss of consciousness — emergency"),
    ("unresponsive", "Patient or contact reports unresponsiveness — emergency"),
    ("stroke", "Stroke symptoms reported — neurological emergency"),
    ("paralysis", "Paralysis reported — neurological emergency"),
    ("severe bleeding", "Severe bleeding — emergency"),
    ("seizure", "Seizure reported — neurological emergency"),
    ("heart attack", "Possible heart attack symptoms — emergency"),
    ("crushing chest", "Crushing chest pain — possible myocardial infarction"),
    ("sudden numbness", "Sudden numbness — possible stroke"),
    ("vision loss", "Sudden vision loss — ophthalmological or neurological emergency"),
    ("severe headache", "Severe sudden headache — possible neurological event"),
    ("loss of consciousness", "Loss of consciousness — emergency"),
    ("anaphylaxis", "Anaphylaxis — severe allergic reaction emergency"),
    ("choking", "Choking — airway emergency"),
]


_NEGATION_WORDS = frozenset({
    "no", "not", "don't", "dont", "doesn't", "doesnt",
    "didn't", "didnt", "never", "denies", "deny",
    "without", "absent", "negative", "none", "ruled",
})


def _is_negated(text: str, term: str, window: int = 5) -> bool:
    idx = text.find(term)
    if idx == -1:
        return False
    preceding_words = text[:idx].split()
    return any(w in _NEGATION_WORDS for w in preceding_words[-window:])


_RED_FLAG_LABELS = sorted({label for _, label in RED_FLAG_TERMS})


def _build_red_flag_prompt(text: str, language: str) -> str:
    labels = ", ".join(_RED_FLAG_LABELS)
    return (
        "You are a clinical safety classifier for a patient intake kiosk. "
        f"The patient's primary language is '{language}'; the text may be in English, Hindi, Bengali, or a mix. "
        "Decide which of these emergency categories the patient is CURRENTLY and ACTUALLY experiencing "
        "(ignore anything negated, hypothetical, phrased as a question, or about someone else): "
        f"[{labels}]. "
        f"Patient text: \"{text}\"\n\n"
        "Respond with ONLY a JSON array of the matching category labels, exactly as spelled above. "
        "Respond with [] if none apply. No other text."
    )


def _call_groq_red_flags(text: str, language: str) -> List[str]:
    from groq import Groq  # local import — app still runs if groq isn't installed
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": _build_red_flag_prompt(text, language)}],
        temperature=0,
        max_tokens=200,
    )
    raw = response.choices[0].message.content.strip()
    parsed = json.loads(raw)
    return [label for label in parsed if label in _RED_FLAG_LABELS]


def _llm_red_flag_check(text: str, language: str) -> List[str]:
    if not settings.GROQ_API_KEY:
        return []
    try:
        future = _executor.submit(_call_groq_red_flags, text, language)
        return future.result(timeout=3.0)
    except FutureTimeoutError:
        logger.warning("Groq red-flag check timed out — falling back to rule-based only.")
        return []
    except Exception as exc:
        logger.warning("Groq red-flag check failed (%s) — falling back to rule-based only.", exc)
        return []


def evaluate_red_flags(text: str, language: str = "en") -> List[str]:
    normalized = normalize_text(text)
    rule_based = [
        label for term, label in RED_FLAG_TERMS
        if term in normalized and not _is_negated(normalized, term)
    ]
    llm_based = _llm_red_flag_check(text, language)
    return sorted(set(rule_based) | set(llm_based))


def calculate_confidence_score(patient_data: Dict[str, Any]) -> float:
    history = patient_data.get("conversationHistory", [])
    reports = patient_data.get("reports", [])

    user_messages = [m for m in history if m.get("role") == "user"]
    score = min(len(user_messages) / len(INTAKE_QUESTIONS), 1.0) * 0.6
    score += min(len(reports) * 0.1, 0.3)
    if patient_data.get("personalInfo", {}).get("vitals"):
        score += 0.1

    return round(min(score, 1.0), 2)


def process_consultation_turn(patient_data: Dict[str, Any], message: str, language: str = "en") -> Dict[str, Any]:
    history = patient_data.get("conversationHistory", [])
    # Count questions already asked (assistant messages before the new user message)
    assistant_count = sum(1 for m in history if m.get("role") == "assistant")

    red_flags = evaluate_red_flags(message, language=language)
    is_complete = False

    if assistant_count < len(INTAKE_QUESTIONS):
        q = INTAKE_QUESTIONS[assistant_count]
        reply = q.get(language, q["en"])
    else:
        reply = (
            "Thank you for sharing your health information. "
            "Our clinical team is reviewing your case. "
            "Please wait — a doctor will call your token shortly."
        )
        is_complete = True

    if red_flags:
        alert = f"⚠️ URGENT: {red_flags[0]}. Please notify the front desk immediately or proceed to Emergency. "
        reply = alert + reply

    return {
        "reply": reply,
        "isComplete": is_complete,
        "redFlagsDetected": red_flags,
        "confidenceScore": calculate_confidence_score(patient_data),
    }
