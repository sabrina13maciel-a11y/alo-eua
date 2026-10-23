import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

for e in entries:
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if len(txt) > 3000000 and "text/html" in e.get("response", {}).get("content", {}).get("mimeType", ""):
        # Search for occurrences of __ or vtex
        matches = re.findall(r'<script[^>]*>([\s\S]*?)</script>', txt)
        print(f"Total script tags in HTML: {len(matches)}")
        for idx, m in enumerate(matches):
            m_strip = m.strip()
            if any(k in m_strip for k in ["__STATE__", "__RUNTIME__", "vtex", "products", "banner"]):
                print(f"Script #{idx} (length {len(m_strip)}): {m_strip[:150]}...")
