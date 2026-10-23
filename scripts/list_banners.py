import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's inspect all unique banner URLs from file-manager
banner_info = []
for e in entries:
    url = e.get("request", {}).get("url", "")
    if "vtex.file-manager-graphql/images" in url:
        res = e.get("response", {})
        headers = {h["name"].lower(): h["value"] for h in res.get("headers", [])}
        content_len = res.get("content", {}).get("size", 0)
        mime = res.get("content", {}).get("mimeType", "")
        banner_info.append({"url": url, "size": content_len, "mime": mime})

# Deduplicate
unique_banners = {}
for b in banner_info:
    if b["url"] not in unique_banners:
        unique_banners[b["url"]] = b

print(f"Total unique file-manager banner images: {len(unique_banners)}")
for url, b in sorted(unique_banners.items(), key=lambda x: x[1]['size'], reverse=True)[:35]:
    print(f"Size: {b['size']} | {url}")
