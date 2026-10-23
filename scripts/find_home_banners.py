import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

e136 = har.get("log", {}).get("entries", [])[136]
txt = e136["response"]["content"]["text"]
data = json.loads(txt)

exts = data.get("extensions", {})
for k in sorted(exts.keys()):
    if "home" in k and any(term in k for term in ["banner", "hero", "slider", "image", "carousel", "prebanner"]):
        v = exts[k]
        print(f"\nKey: {k}")
        print(f"Component: {v.get('component')}")
        print(f"Props: {json.dumps(v.get('props', {}), indent=2)[:400]}")
