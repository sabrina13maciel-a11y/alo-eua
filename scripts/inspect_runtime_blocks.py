import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

target_script = None
for e in entries:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if len(txt) > 3000000:
        matches = re.findall(r'<script[^>]*>([\s\S]*?)</script>', txt)
        for m in matches:
            if "__RUNTIME__" in m and len(m) > 500000:
                target_script = m.strip()
                break
    if target_script:
        break

print(f"Target script found! Length: {len(target_script)}")

start_idx = target_script.find('{')
decoder = json.JSONDecoder()
data, end = decoder.raw_decode(target_script[start_idx:])

print(f"Decoded JSON length: {end} characters!")
print("Runtime keys:", list(data.keys()))

# Check extensions
extensions = data.get("extensions", {})
print(f"Total extensions: {len(extensions)}")

# Look for banners, carousels, sliders, menus, topics
banner_exts = {}
menu_exts = {}

for k, v in extensions.items():
    comp = v.get("component", "")
    props = v.get("props", {})
    
    if any(term in comp.lower() or term in k.lower() for term in ["banner", "carousel", "slider", "list-context.image-list", "image", "info-card", "rich-text"]):
        banner_exts[k] = {"component": comp, "props": props}
    if any(term in comp.lower() or term in k.lower() for term in ["menu", "header", "nav", "category", "tab"]):
        menu_exts[k] = {"component": comp, "props": props}

print(f"\nBanner / Image / Slider extensions: {len(banner_exts)}")
for k, info in list(banner_exts.items())[:35]:
    props = info["props"]
    print(f"  {k} ({info['component']}):")
    if "images" in props:
        for img in props["images"][:3]:
            print(f"    - img: {img.get('image')} | mobile: {img.get('mobileImage')} | link: {img.get('link', {}).get('url') if isinstance(img.get('link'), dict) else img.get('link')} | desc: {img.get('description')}")
    if "imageUrl" in props:
        print(f"    - imageUrl: {props.get('imageUrl')} | headline: {props.get('headline')} | subhead: {props.get('subhead')}")
    if "text" in props:
        print(f"    - text: {props.get('text')[:80]}")

print(f"\nMenu / Category extensions: {len(menu_exts)}")
for k, info in list(menu_exts.items())[:25]:
    props = info["props"]
    print(f"  {k}: {props.get('text') or props.get('item', {}).get('text') or props.get('name') or list(props.keys())}")
