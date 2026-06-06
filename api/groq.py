"""
Groq AI Proxy — Vercel Serverless Function
100% free tier: 14,400 requests/day, no credit card required.
Get free API key at console.groq.com
Models tried in order: llama-3.3-70b → llama-3.1-8b → mixtral-8x7b
"""

import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

GROQ_KEY  = os.environ.get("GROQ_API_KEY", "")
GROQ_URL  = "https://api.groq.com/openai/v1/chat/completions"

MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]

RETRY_CODES = {429, 503}


def call_groq(api_key: str, prompt: str, max_tokens: int, model_idx: int = 0, last_error: str = ""):
    if model_idx >= len(MODELS):
        msg = f"All Groq models failed. Last error: {last_error}" if last_error else "All Groq models unavailable."
        return 429, {"error": msg}

    model = MODELS[model_idx]

    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }).encode()

    req = urllib.request.Request(
        GROQ_URL, data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode())
            text = body["choices"][0]["message"]["content"].strip()
            clean = text.replace("```json\n","").replace("```\n","").replace("```","").strip()
            try:
                return 200, {"result": json.loads(clean), "model": model}
            except json.JSONDecodeError:
                return 200, {"result": {"raw": clean}, "model": model}

    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            err_msg = json.loads(err_body).get("error", {}).get("message", err_body[:400])
        except Exception:
            err_msg = err_body[:400]

        if e.code in RETRY_CODES:
            return call_groq(api_key, prompt, max_tokens, model_idx + 1, err_msg)

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
            api_key    = req.get("apiKey", GROQ_KEY).strip()

            if not prompt:
                status, result = 400, {"error": "prompt is required"}
            elif not api_key:
                status, result = 400, {"error": "Groq API key not configured"}
            else:
                status, result = call_groq(api_key, prompt, max_tokens)
        except Exception as e:
            status, result = 500, {"error": str(e)}

        self.send_response(status); self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
