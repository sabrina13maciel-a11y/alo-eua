import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's search all response text for the banner UUIDs
uuids = [
    "1064ec27", "364c2c93", "2b1993e0", "bddc0469", "29289476",
    "316b981e", "29e3c46e", "ebeef3b4", "1ca10c1f", "c22439f0",
    "af32929a", "e9ab107e", "d332762b", "efc1d58c", "a78c01f7",
    "21932ae2", "4e4c743c", "6a421625"
]

print("Searching for banner contexts...")
found_contexts = {}

for e in entries:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    url = e.get("request", {}).get("url", "")
    for u in uuids:
        if u in txt and not url.endswith((".jpg", ".png", ".webp", ".svg")):
            # extract surrounding 300 chars
            idx = txt.find(u)
            snippet = txt[max(0, idx - 150): min(len(txt), idx + 250)]
            if u not in found_contexts:
                found_contexts[u] = []
            found_contexts[u].append((url[:80], snippet))

for u, hits in found_contexts.items():
    print(f"\n=== UUID {u} ===")
    for req_url, snip in hits[:2]:
        print(f"[{req_url}]:\n  {snip}\n")
