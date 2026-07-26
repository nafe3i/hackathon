import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import GEMINI_API_KEY, GEMMA_MODEL


def generate_with_gemma(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("Clé Gemini absente")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMMA_MODEL}:generateContent"
    payload = json.dumps({"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2, "maxOutputTokens": 350}}).encode("utf-8")
    request = Request(url, data=payload, method="POST", headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY})
    try:
        with urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as error:
        raise RuntimeError("Service IA indisponible") from error
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as error:
        raise RuntimeError("Réponse IA invalide") from error
