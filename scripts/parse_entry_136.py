import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

e136 = har.get("log", {}).get("entries", [])[136]
txt = e136["response"]["content"]["text"]
data = json.loads(txt)

print("Runtime keys in entry 136:", list(data.keys()))

# Check extensions in entry 136
exts = data.get("extensions", {})
print(f"Total extensions in 136: {len(exts)}")

banners = []
topics = []
sliders = []

for k, v in exts.items():
    comp = v.get("component", "")
    props = v.get("props", {})
    
    # Check for image lists, slider layouts, info cards
    if "image-list" in k or "slider-layout" in k or "carousel" in k or "banner" in k or "info-card" in k:
        banners.append({
            "key": k,
            "component": comp,
            "props": props
        })
    if "menu" in k or "tab" in k:
        topics.append({
            "key": k,
            "props": props
        })

print(f"\nFound {len(banners)} banner/slider extensions:")
for b in banners:
    k = b["key"]
    comp = b["component"]
    props = b["props"]
    print(f"\n[{k}] ({comp}):")
    if "images" in props:
        for idx, img in enumerate(props["images"]):
            print(f"  Image {idx}: {img.get('image')} | mobile: {img.get('mobileImage')} | link: {img.get('link')} | desc: {img.get('description')}")
    if "imageUrl" in props:
        print(f"  InfoCard: img={props.get('imageUrl')}, mobile={props.get('mobileImageUrl')}, cta={props.get('callToActionText')}, link={props.get('callToActionUrl')}, title={props.get('headline')}")
    if "headline" in props:
        print(f"  Headline: {props.get('headline')} | subhead: {props.get('subhead')}")
    if "text" in props:
        print(f"  Text: {props.get('text')}")
