import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's inspect 5 sample products in detail
products = []
for e in entries:
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "graphql" in url and "productSearch" in txt:
        gdata = json.loads(txt)
        prods = gdata.get("data", {}).get("productSearch", {}).get("products", [])
        if prods:
            products.extend(prods[:5])
            break

for idx, p in enumerate(products[:4]):
    print(f"\n==================== PRODUCT {idx}: {p.get('productName')} (id: {p.get('productId')}) ====================")
    print("skuSpecifications:", p.get("skuSpecifications"))
    print("properties:", [(prop.get('name'), prop.get('values')) for prop in p.get('properties', []) if 'cor' in prop.get('name', '').lower() or 'color' in prop.get('name', '').lower()])
    print("priceRange:", p.get("priceRange"))
    
    items = p.get("items", [])
    print(f"Total SKUs/items: {len(items)}")
    for it in items[:4]:
        print(f"  SKU id: {it.get('itemId')} | name: {it.get('name')}")
        print(f"    variations: {it.get('variations')}")
        print(f"    images count: {len(it.get('images', []))}")
        if it.get('images'):
            print(f"    first image: {it['images'][0].get('imageUrl')}")
            print(f"    second image: {it['images'][1].get('imageUrl') if len(it['images']) > 1 else 'None'}")
