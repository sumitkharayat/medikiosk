import re
import unicodedata
from typing import List, Set

def normalize_text(text: str) -> str:
    """Normalize input string: trim, lower, remove excess spaces."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()

def extract_symptoms_keywords(text: str) -> List[str]:
    """Extract individual alphanumeric tokens and clean punctuation."""
    norm = normalize_text(text)
    tokens = re.findall(r"\b[\w'-]+\b", norm)
    return [t for t in tokens if len(t) > 1]
