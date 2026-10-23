import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's find entries with aloyoga.com.br homepage HTML or main page HTML
home_html = ""
for e in entries:
    url = e.get("request", {}).get("url", "")
    mime = e.get("response", {}).get("content", {}).get("mimeType", "")
    if ("https://www.aloyoga.com.br/" == url or "https://www.aloyoga.com.br" == url or "aloyoga.com.br" in url) and "text/html" in mime:
        txt = e.get("response", {}).get("content", {}).get("text", "")
        print(f"Found HTML entry: {url} ({len(txt)} bytes)")
        if len(txt) > len(home_html):
            home_html = txt

print(f"Homepage HTML length: {len(home_html)}")

# Extract image URLs from vtexassets
img_set = set()
for e in entries:
    url = e.get("request", {}).get("url", "")
    if "aloyogabr.vtexassets.com" in url or "aloyoga.com.br" in url:
        if any(ext in url.lower() for ext in [".jpg", ".png", ".webp", ".jpeg", "ids/", "images/"]):
            img_set.add(url)

print(f"Total unique Alo images in HAR: {len(img_set)}")

# Filter images that look like banners (file-manager-graphql/images)
banner_candidates = [u for u in img_set if "vtex.file-manager-graphql/images" in u]
print(f"File manager images (banners / promotional / icons): {len(banner_candidates)}")
for b in sorted(banner_candidates)[:35]:
    print("  Banner:", b)
