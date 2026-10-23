import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

print("Loading HAR...")
with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

# 1. Colors map from MasterData CR
colors_map = {}
for e in entries:
    url = e.get("request", {}).get("url", "")
    if "api/dataentities/CR/search" in url:
        txt = e.get("response", {}).get("content", {}).get("text", "")
        if txt:
            try:
                for item in json.loads(txt):
                    name = item.get("nome", "").strip()
                    hex_val = item.get("hexadecimal")
                    if name:
                        colors_map[name.lower()] = hex_val if hex_val and hex_val.startswith("#") else "#000000"
            except Exception:
                pass

print(f"Colors mapped: {len(colors_map)}")

# Common Alo color fallback mapping
fallback_colors = {
    "black": "#000000",
    "white": "#FFFFFF",
    "bone": "#F9F6EE",
    "espresso": "#3B2F2F",
    "athletic heather grey": "#B0B0B0",
    "grey": "#808080",
    "navy": "#000080",
    "rich bordeaux": "#5B1E31",
    "cherry cola": "#58111A",
    "charcoal green": "#2F4F4F",
    "aloe": "#8FBC8F",
    "gravel": "#4A4A4A",
    "macadamia": "#D8C7B5",
    "toasted almond": "#C2A385",
    "ivory": "#FFFFF0",
    "dark plum": "#4D1F3D",
    "romance red": "#B22222",
    "azure blue": "#007FFF"
}

def get_color_hex(color_name):
    c_low = color_name.lower().strip()
    if c_low in colors_map and colors_map[c_low]:
        return colors_map[c_low]
    for k, v in fallback_colors.items():
        if k in c_low or c_low in k:
            return v
    return "#333333"

# 2. Extract products from GraphQL and Similars
all_raw_products = {}

for e in entries:
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "graphql" in url and "productSearch" in txt:
        try:
            prods = json.loads(txt).get("data", {}).get("productSearch", {}).get("products", [])
            for p in prods:
                pid = str(p.get("productId"))
                if pid:
                    all_raw_products[pid] = p
        except Exception:
            pass

    if "api/catalog_system/pub/products/crossselling/similars" in url:
        try:
            sims = json.loads(txt)
            if isinstance(sims, list):
                for p in sims:
                    pid = str(p.get("productId"))
                    if pid:
                        all_raw_products[pid] = p
        except Exception:
            pass

print(f"Total raw products: {len(all_raw_products)}")

# Let's inspect base product names to group color variants
# e.g. "Moletom accolade crew neck", "Calça high-waist dreamscape (regular)"
base_groups = {}

for pid, p in all_raw_products.items():
    name = p.get("productName", "").strip()
    if not name:
        continue
    
    # Extract color from properties or skuSpecifications
    color_val = "Black"
    for prop in p.get("properties", []):
        if prop.get("name") == "Cor Fabricante" and prop.get("values"):
            color_val = prop.get("values")[0]
            break
    if color_val == "Black":
        for spec in p.get("skuSpecifications", []):
            if spec.get("field", {}).get("name") == "Cor Fabricante" and spec.get("values"):
                color_val = spec.get("values")[0].get("name", "Black")
                break
    
    # Extract images for this product/color
    p_images = []
    items = p.get("items", [])
    for it in items:
        for img in it.get("images", []):
            iurl = img.get("imageUrl")
            if iurl and iurl not in p_images:
                p_images.append(iurl)
    
    # Extract category
    categories = p.get("categories", [])
    cat_clean = "Women"
    if categories:
        cat_clean = categories[0].strip("/").split("/")[-1].title()
    
    # Prices
    price_range = p.get("priceRange", {})
    selling_price = price_range.get("sellingPrice", {}).get("lowPrice") or 118
    list_price = price_range.get("listPrice", {}).get("highPrice") or selling_price
    
    # Convert BRL to USD equivalent if needed, or check currency
    # Since prices in the HAR are in BRL (e.g. 1065, 890, 450), let's map them to standard Alo US MSRP:
    # E.g. Alo Leggings are $128, Hoodies $148, Tops $68, Dresses $138, etc.
    # We can either scale BRL to USD (e.g. BRL / 7.5 or direct US MSRP), and apply the 70% DISCOUNT!
    
    base_name = name
    if base_name not in base_groups:
        base_groups[base_name] = {
            "id": pid,
            "baseName": base_name,
            "linkText": p.get("linkText", ""),
            "description": p.get("description", ""),
            "category": cat_clean,
            "categories": categories,
            "brand": p.get("brand", "Alo Yoga"),
            "rawListPrice": list_price,
            "rawSellingPrice": selling_price,
            "colors": {}
        }
    
    hex_code = get_color_hex(color_val)
    if color_val not in base_groups[base_name]["colors"]:
        base_groups[base_name]["colors"][color_val] = {
            "name": color_val,
            "hex": hex_code,
            "images": p_images,
            "productId": pid
        }
    else:
        # Merge images if new
        existing_imgs = base_groups[base_name]["colors"][color_val]["images"]
        for img in p_images:
            if img not in existing_imgs:
                existing_imgs.append(img)

print(f"\nTotal distinct base product styles: {len(base_groups)}")
multi_color_count = sum(1 for g in base_groups.values() if len(g["colors"]) > 1)
print(f"Styles with multiple color variants: {multi_color_count}")

# Sample multi-color products
print("\nSamples of multi-color styles:")
for g in list(base_groups.values())[:8]:
    print(f"  {g['baseName']} -> {len(g['colors'])} colors: {list(g['colors'].keys())}")
    for cname, cinfo in list(g['colors'].items())[:2]:
        print(f"     Color '{cname}' ({cinfo['hex']}): {len(cinfo['images'])} images, first={cinfo['images'][0] if cinfo['images'] else 'None'}")
