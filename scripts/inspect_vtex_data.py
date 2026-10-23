import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# Let's inspect entry 1372 (GraphQL)
e1372 = entries[1372]
print("\nURL 1372:", e1372["request"]["url"][:120])
data1372 = json.loads(e1372["response"]["content"]["text"])
print("Data keys in 1372:", list(data1372.get("data", {}).keys()))
for dk in data1372.get("data", {}):
    val = data1372["data"][dk]
    print(f"  {dk}: {type(val)}")
    if isinstance(val, dict):
        print(f"    Subkeys: {list(val.keys())}")
        if "products" in val:
            products = val['products']
            print(f"    Products count: {len(products)}")
            if len(products) > 0:
                p0 = products[0]
                print(f"    Sample product: {p0.get('productName')} | id: {p0.get('productId')}")
                print(f"    Fields: {list(p0.keys())}")
                print(f"    Items (SKUs/colors): {len(p0.get('items', []))}")
                for it in p0.get('items', [])[:3]:
                    print(f"      Item name: {it.get('name')} | color: {it.get('Cor') or it.get('name')} | images: {len(it.get('images', []))}")

# Let's inspect entry 1504 (similars / catalog)
e1504 = entries[1504]
print("\nURL 1504:", e1504["request"]["url"][:120])
data1504 = json.loads(e1504["response"]["content"]["text"])
print(f"1504 is type: {type(data1504)}, length: {len(data1504) if isinstance(data1504, list) else 'N/A'}")
if isinstance(data1504, list) and len(data1504) > 0:
    for idx, p in enumerate(data1504[:5]):
        print(f"  [{idx}] {p.get('productName')} (id: {p.get('productId')}) - {len(p.get('items', []))} items")
        for it in p.get('items', [])[:2]:
            print(f"      SKU {it.get('name')}: {len(it.get('images', []))} images")

# Let's check entry 122 (CR colors table)
e122 = entries[122]
print("\nURL 122:", e122["request"]["url"])
data122 = json.loads(e122["response"]["content"]["text"])
print(f"Colors count in MasterData CR: {len(data122)}")
for c in data122[:10]:
    print(f"  Color: {c.get('nome')} -> hex: {c.get('hexadecimal')}")
