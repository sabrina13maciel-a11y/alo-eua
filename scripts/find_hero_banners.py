import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's search all entries in HAR for list-context.image-list or slider or banner
hero_banners = []

for e in entries:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "list-context.image-list" in txt or "banner" in txt:
        # Check if json or html
        if "aloyogabr.vtexassets.com" in txt:
            # find all image urls in txt that match file-manager or banner
            import re
            matches = re.findall(r'https://aloyogabr\.vtexassets\.com/assets/vtex\.file-manager-graphql/images/[a-zA-Z0-9_-]+\.(?:jpg|png|webp|svg)', txt)
            for m in matches:
                # find context around m
                pos = txt.find(m)
                ctx = txt[max(0, pos-100):min(len(txt), pos+200)]
                hero_banners.append((m, ctx))

print(f"Total banner matches found: {len(hero_banners)}")
seen = set()
for url, ctx in hero_banners:
    if url not in seen:
        seen.add(url)
        print(f"\nURL: {url}")
        print(f"Context: {ctx[:200]}")
