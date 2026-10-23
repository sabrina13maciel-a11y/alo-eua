import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

print("Loading HAR file...")
with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])
print(f"Total entries: {len(entries)}")

vtex_graphql_entries = []
search_api_entries = []
banner_entries = []
json_responses = []

for idx, e in enumerate(entries):
    req = e.get("request", {})
    res = e.get("response", {})
    url = req.get("url", "")
    content = res.get("content", {})
    mime = content.get("mimeType", "")
    text = content.get("text", "")
    
    if "graphql" in url.lower():
        vtex_graphql_entries.append((idx, url, len(text)))
    if "search" in url.lower() or "beon" in url.lower():
        search_api_entries.append((idx, url, len(text)))
    if any(k in url.lower() for k in ["banner", "carousel", "home", "layout", "menu"]):
        banner_entries.append((idx, url, len(text)))

print(f"\nGraphQL entries: {len(vtex_graphql_entries)}")
for idx, u, sz in vtex_graphql_entries[:20]:
    print(f"  [{idx}] ({sz} bytes) {u[:120]}")

print(f"\nSearch API entries: {len(search_api_entries)}")
for idx, u, sz in search_api_entries[:20]:
    print(f"  [{idx}] ({sz} bytes) {u[:120]}")

print(f"\nBanner/Menu/Home entries: {len(banner_entries)}")
for idx, u, sz in banner_entries[:20]:
    print(f"  [{idx}] ({sz} bytes) {u[:120]}")
