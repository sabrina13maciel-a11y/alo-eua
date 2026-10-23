import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

items = []
for idx, e in enumerate(entries):
    req = e.get("request", {})
    res = e.get("response", {})
    url = req.get("url", "")
    content = res.get("content", {})
    mime = content.get("mimeType", "")
    text = content.get("text", "")
    items.append((len(text), idx, req.get("method"), url, mime))

items.sort(key=lambda x: x[0], reverse=True)

print("Top 30 Largest Responses in HAR:")
for sz, idx, method, url, mime in items[:30]:
    print(f"[{idx}] {method} ({sz} bytes) [{mime}] {url[:100]}")
