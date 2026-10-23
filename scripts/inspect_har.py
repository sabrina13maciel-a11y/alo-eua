import json
import sys

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

print(f"Reading {har_path}...")
try:
    with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
        data = json.load(f)
    
    entries = data.get("log", {}).get("entries", [])
    print(f"Total entries: {len(entries)}")
    
    urls = [e.get("request", {}).get("url", "") for e in entries]
    
    # Check domains and APIs
    api_urls = [u for u in urls if any(k in u.lower() for k in ["api", "products", "graphql", "collection", "catalog", "json"])]
    print(f"API/JSON like URLs count: {len(api_urls)}")
    for u in api_urls[:30]:
        print("  API URL:", u[:120])

    # Check images / banners
    img_urls = [u for u in urls if any(ext in u.lower() for u in [u] for ext in [".webp", ".jpg", ".png", ".svg", "cdn.shopify.com", "aloyoga"])]
    print(f"Total image/asset URLs: {len(img_urls)}")
    for u in img_urls[:20]:
        print("  IMG URL:", u[:120])

except Exception as ex:
    print("Error:", ex)
