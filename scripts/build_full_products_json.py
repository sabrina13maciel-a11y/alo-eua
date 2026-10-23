import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

print("Loading HAR file...")
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
    "gravel": "#D2B48C",
    "macadamia": "#D8C7B5",
    "toasted almond": "#C2A385",
    "ivory": "#FFFFF0",
    "dark plum": "#4D1F3D",
    "romance red": "#B22222",
    "azure blue": "#71C5EA",
    "pink marshmallow": "#FCCDDE",
    "dune grass": "#97AE95",
    "light misty grey heather": "#ACACAE",
    "light provence blue": "#B9CCF5",
    "satsuma breeze": "#FFA07A"
}

def get_color_hex(color_name):
    c_low = color_name.lower().strip()
    if c_low in colors_map and colors_map[c_low]:
        return colors_map[c_low]
    for k, v in fallback_colors.items():
        if k in c_low or c_low in k:
            return v
    return "#222222"

# 2. Extract products from GraphQL and Similars
all_raw = {}
for e in entries:
    url = e.get("request", {}).get("url", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "graphql" in url and "productSearch" in txt:
        try:
            prods = json.loads(txt).get("data", {}).get("productSearch", {}).get("products", [])
            for p in prods:
                pid = str(p.get("productId"))
                if pid:
                    all_raw[pid] = p
        except Exception:
            pass

    if "api/catalog_system/pub/products/crossselling/similars" in url:
        try:
            sims = json.loads(txt)
            if isinstance(sims, list):
                for p in sims:
                    pid = str(p.get("productId"))
                    if pid:
                        all_raw[pid] = p
        except Exception:
            pass

print(f"Total raw products collected: {len(all_raw)}")

# Normalize product base name
def normalize_base_name(name):
    clean = re.sub(r'\s*\([^)]*\)', '', name)
    clean = clean.strip()
    return clean

# Categories grouping
def map_category(cat_str, name):
    name_lower = name.lower()
    if any(k in name_lower for k in ["vestido", "dress", "romper", "macaquinho"]):
        return "Dresses & Rompers"
    if any(k in name_lower for k in ["sutiã", "bra", "top", "cropped", "regata"]):
        return "Bras & Tops"
    if any(k in name_lower for k in ["legging", "short", "calça", "pant", "saia"]):
        return "Leggings & Bottoms"
    if any(k in name_lower for k in ["moletom", "jaqueta", "casaco", "hoodie", "pullover", "jacket"]):
        return "Hoodies & Jackets"
    if any(k in name_lower for k in ["meia", "boné", "bolsa", "mochila", "tapete", "faixa", "viseira", "hair"]):
        return "Accessories"
    if any(k in name_lower for k in ["tênis", "chinelo", "shoe", "slide"]):
        return "Footwear"
    return "Best Sellers"

styles = {}

for pid, p in all_raw.items():
    raw_name = p.get("productName", "").strip()
    if not raw_name:
        continue
    
    base_name = normalize_base_name(raw_name)
    
    # Extract color
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
    
    # Images
    p_images = []
    items = p.get("items", [])
    for it in items:
        for img in it.get("images", []):
            iurl = img.get("imageUrl")
            if iurl and iurl not in p_images:
                # Ensure https
                if iurl.startswith("//"):
                    iurl = "https:" + iurl
                p_images.append(iurl)
    
    if not p_images:
        continue

    # Categories
    categories = p.get("categories", [])
    cat = map_category(str(categories), base_name)
    
    # Standard Alo US pricing:
    # Most Alo leggings/pants: $128 (Sale $38)
    # Hoodies/Jackets: $148-$178 (Sale $44-$53)
    # Bras/Tops: $68-$78 (Sale $20-$23)
    # Dresses: $138 (Sale $41)
    # Accessories: $38-$68 (Sale $11-$20)
    # Footwear: $198 (Sale $59)
    if cat == "Hoodies & Jackets":
        orig_price = 168.0
    elif cat == "Dresses & Rompers":
        orig_price = 138.0
    elif cat == "Leggings & Bottoms":
        orig_price = 128.0
    elif cat == "Bras & Tops":
        orig_price = 78.0
    elif cat == "Footwear":
        orig_price = 198.0
    else:
        orig_price = 58.0
    
    sale_price = round(orig_price * 0.30, 2) # Exactly 70% OFF
    
    if base_name not in styles:
        slug = re.sub(r'[^a-z0-9]+', '-', base_name.lower()).strip('-')
        styles[base_name] = {
            "id": pid,
            "handle": slug,
            "name": base_name,
            "category": cat,
            "description": p.get("description") or f"Engineered for high performance and everyday luxury styling. Made from signature Alo Softsculpt fabric with 4-way stretch and moisture-wicking technology.",
            "originalPrice": orig_price,
            "price": sale_price,
            "discountPercent": "70% OFF",
            "rating": 4.9,
            "reviewCount": 180 + (int(pid) % 250),
            "isBestSeller": int(pid) % 2 == 0,
            "colors": {}
        }
    
    hex_code = get_color_hex(color_val)
    if color_val not in styles[base_name]["colors"]:
        styles[base_name]["colors"][color_val] = {
            "name": color_val,
            "hex": hex_code,
            "images": p_images
        }
    else:
        existing = styles[base_name]["colors"][color_val]["images"]
        for im in p_images:
            if im not in existing:
                existing.append(im)

print(f"Distinct styles with valid images: {len(styles)}")

# Format final products list
final_products = []
for base_name, s in styles.items():
    color_list = list(s["colors"].values())
    if not color_list:
        continue
    
    default_color = color_list[0]
    
    # Ensure thumbnail and default images
    default_images = default_color["images"]
    if not default_images:
        continue

    formatted_prod = {
        "id": s["id"],
        "handle": s["handle"],
        "name": s["name"],
        "category": s["category"],
        "description": s["description"],
        "originalPrice": s["originalPrice"],
        "price": s["price"],
        "discountPercent": s["discountPercent"],
        "rating": s["rating"],
        "reviewCount": s["reviewCount"],
        "isBestSeller": s["isBestSeller"],
        "selectedColor": default_color["name"],
        "thumbnailImage": default_images[0],
        "images": [{"url": im, "alt": s["name"]} for im in default_images],
        "colors": [
            {
                "name": c["name"],
                "value": c["hex"],
                "thumbnail": c["images"][0] if c["images"] else default_images[0],
                "images": [{"url": im, "alt": f"{s['name']} - {c['name']}"} for im in c["images"]]
            }
            for c in color_list
        ],
        "sizes": [
            {"name": "XXS", "label": "XXS (00-0)", "available": True},
            {"name": "XS", "label": "XS (2-4)", "available": True},
            {"name": "S", "label": "S (4-6)", "available": True},
            {"name": "M", "label": "M (8-10)", "available": True},
            {"name": "L", "label": "L (12-14)", "available": True},
            {"name": "XL", "label": "XL (16-18)", "available": True}
        ],
        "fit": [
            "True to size - engineered for studio-to-street performance",
            "Soft compression with zero-pinch waistband",
            "Model is 5'10\" and wearing size Small"
        ],
        "fabrication": "Signature Alo Softsculpt / Airlift compression fabric. Moisture-wicking, antimicrobial, 4-way stretch."
    }
    final_products.append(formatted_prod)

# Sort with multi-color and bestsellers first
final_products.sort(key=lambda x: (len(x["colors"]) > 1, x["isBestSeller"], len(x["images"])), reverse=True)

print(f"Generated {len(final_products)} enriched Alo products with real colors and swatches!")

# Save to src/data/products.json
out_path = "/Users/joshuacustodio/.gemini/antigravity-ide/scratch/alo-store/src/data/products.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2, ensure_ascii=False)

print(f"Successfully saved to {out_path}!")
