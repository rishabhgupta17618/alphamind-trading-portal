"""
Gemini AI Proxy — Vercel Serverless Function
Uses v1beta endpoint (stable, supports all current models).
Falls back through model list on 429/503/404.
"""

import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

GEMINI_KEY  = os.environ.get("GEMINI_API_KEY", "")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# Models available on free tier (Flash family) + paid fallbacks
MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-lite",
]

RETRY_CODES = {404, 429, 503}


def call_gemini(api_key: str, prompt: str, max_tokens: int, model_idx: int = 0, last_error: str = ""):
    if model_idx >= len(MODELS):
        msg = f"All Gemini models failed. Last error: {last_error}" if last_error else "All Gemini models unavailable."
        return 429, {"error": msg}

    model = MODELS[model_idx]
    url   = f"{GEMINI_BASE}/{model}:generateContent?key={api_key}"

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature":     0.3,
        }
    }).encode()

    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body  = json.loads(resp.read().decode())
            text  = (body.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", ""))
            clean = text.replace("```json\n","").replace("```\n","").replace("```","").strip()
            try:
                return 200, {"result": json.loads(clean), "model": model}
            except json.JSONDecodeError:
                return 200, {"result": {"raw": clean}, "model": model}

    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            err_msg = json.loads(err_body).get("error", {}).get("message", err_body[:200])
        except Exception:
            err_msg = err_body[:200]

        if e.code in RETRY_CODES:
            return call_gemini(api_key, prompt, max_tokens, model_idx + 1, err_msg)

        # Non-retryable error (e.g. 400 bad key, 403 permission denied) — surface immediately
        return e.code, {"error": err_msg}

    except Exception as e:
        return 500, {"error": str(e)}


class handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_POST(self):
        try:
            length     = int(self.headers.get("Content-Length", 0))
            req        = json.loads(self.rfile.read(length))
            prompt     = req.get("prompt", "").strip()
            max_tokens = int(req.get("maxTokens", 2000))
            api_key    = req.get("apiKey", GEMINI_KEY).strip()

            if not prompt:
                status, result = 400, {"error": "prompt is required"}
            elif not api_key:
                status, result = 400, {"error": "Gemini API key not configured"}
            else:
                status, result = call_gemini(api_key, prompt, max_tokens)
        except Exception as e:
            status, result = 500, {"error": str(e)}

        self.send_response(status); self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
