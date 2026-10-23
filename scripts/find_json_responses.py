import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

interesting = []

for idx, e in enumerate(entries):
    req = e.get("request", {})
    res = e.get("response", {})
    url = req.get("url", "")
    content = res.get("content", {})
    mime = content.get("mimeType", "")
    text = content.get("text", "")
    
    # Filter for aloyoga or graphql or data
    if "aloyoga.com.br" in url or "vtex" in url or "usebeon" in url:
        if "application/json" in mime or "text/json" in mime or text.strip().startswith("{") or text.strip().startswith("["):
            interesting.append((idx, url, mime, len(text), req.get("method", "GET")))

print(f"Total interesting JSON responses: {len(interesting)}")
for idx, url, mime, sz, method in interesting[:40]:
    print(f"[{idx}] {method} ({sz}b) {url[:100]}")
