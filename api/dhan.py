"""
Dhan API Proxy — Vercel Serverless Function
All Dhan calls are made server-side here, bypassing browser CORS restrictions.
Endpoint: /api/dhan
Method: POST
Body: { "endpoint": "/holdings", "method": "GET", "body": null, "cid": "...", "tok": "..." }
"""

import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler


DHAN_BASE = "https://api.dhan.co/v2"

ALLOWED_ENDPOINTS = {
    "/profile", "/holdings", "/positions", "/fundlimit", "/orders",
    "/charts/historical", "/charts/intraday", "/marketfeed/ltp",
    "/marketfeed/ohlc", "/marketfeed/quote", "/tradehistory",
    "/ledger", "/orders", "/margincalculator",
}


def proxy_dhan(endpoint, method, cid, tok, body=None):
    # Validate endpoint to prevent SSRF
    base_ep = "/" + endpoint.lstrip("/").split("?")[0]
    # Allow order endpoints like /orders/ORDER_ID
    if not any(base_ep == ep or base_ep.startswith(ep + "/") for ep in ALLOWED_ENDPOINTS):
        return 400, {"error": f"Endpoint not allowed: {endpoint}"}

    url = f"{DHAN_BASE}/{endpoint.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
        "access-token": tok,
        "dhanClientId": cid,
    }

    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(url, data=data, headers=headers, method=method.upper())

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_body = resp.read().decode()
            try:
                return resp.status, json.loads(resp_body)
            except json.JSONDecodeError:
                return resp.status, {"raw": resp_body}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            return e.code, json.loads(err_body)
        except json.JSONDecodeError:
            return e.code, {"error": err_body[:500]}
    except Exception as e:
        return 500, {"error": str(e)}


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default logging

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw    = self.rfile.read(length)
            req    = json.loads(raw)

            cid      = req.get("cid", "").strip()
            tok      = req.get("tok", "").strip()
            endpoint = req.get("endpoint", "").strip()
            method   = req.get("method", "GET").strip().upper()
            body     = req.get("body", None)

            if not cid or not tok or not endpoint:
                status, result = 400, {"error": "cid, tok, and endpoint are required"}
            else:
                status, result = proxy_dhan(endpoint, method, cid, tok, body)

        except Exception as e:
            status, result = 500, {"error": str(e)}

        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
