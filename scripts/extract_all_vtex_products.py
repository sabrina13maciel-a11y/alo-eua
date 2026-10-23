import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

print("Loading HAR file...")
with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# 1. First extract all colors from MasterData CR (entry 122 or similar)
colors_map = {}
for e in entries:
    url = e.get("request", {}).get("url", "")
    if "api/dataentities/CR/search" in url:
        txt = e.get("response", {}).get("content", {}).get("text", "")
        if txt:
            try:
                cr_list = json.loads(txt)
                for item in cr_list:
                    name = item.get("nome", "").strip()
                    hex_val = item.get("hexadecimal")
                    if name:
                        colors_map[name.lower()] = {
                            "name": name,
                            "hex": hex_val if hex_val and hex_val.startswith("#") else "#000000"
                        }
            except Exception as ex:
                pass

print(f"Total MasterData colors loaded: {len(colors_map)}")

# 2. Extract products from GraphQL productSearch and catalog similars
all_products_dict = {}

# From GraphQL productSearch
for idx, e in enumerate(entries):
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "graphql" in url and "productSearch" in txt:
        try:
            gdata = json.loads(txt)
            prods = gdata.get("data", {}).get("productSearch", {}).get("products", [])
            for p in prods:
                pid = str(p.get("productId"))
                if pid and pid not in all_products_dict:
                    all_products_dict[pid] = p
        except Exception as ex:
            pass

print(f"Products collected from GraphQL: {len(all_products_dict)}")

# From catalog crossselling / similars
similar_count = 0
for idx, e in enumerate(entries):
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "api/catalog_system/pub/products/crossselling/similars" in url:
        try:
            sdata = json.loads(txt)
            if isinstance(sdata, list):
                for p in sdata:
                    pid = str(p.get("productId"))
                    if pid and pid not in all_products_dict:
                        all_products_dict[pid] = p
                        similar_count += 1
        except Exception:
            pass

print(f"Additional products from similars: {similar_count}")
print(f"Total unique products gathered: {len(all_products_dict)}")

# Let's inspect sample product structure
sample_p = list(all_products_dict.values())[0]
print("\nSample Product Keys:", list(sample_p.keys()))
print("Sample Name:", sample_p.get("productName"))
print("Sample Items (SKUs):", len(sample_p.get("items", [])))
for it in sample_p.get("items", [])[:3]:
    print("  Item:", it.get("name"), "| images count:", len(it.get("images", [])))
