import json
import urllib.request
import urllib.parse
import time
import re
import html

NAME_MAP = {
    "Tênis alo recovery": "Alo Recovery Sneaker",
    "Tênis alo sunset": "Alo Sunset Sneaker",
    "Calça de moletom accolade straight leg": "Accolade Straight Leg Sweatpant",
    "Blusa goddess ribbed go-to": "Goddess Ribbed Go-To Long Sleeve",
    "Calça de moletom accolade": "Accolade Sweatpant",
    "Moletom accolade 1/4 zip pullover": "Accolade 1/4 Zip Pullover",
    "Casaco alosoft 1/2 zip rapid": "Alosoft 1/2 Zip Rapid Pullover",
    "Saia tennis double or nothing": "Double Or Nothing Tennis Skirt",
    "Blusa ribbed prosper": "Ribbed Prosper Long Sleeve",
    "Suéter crossover knit unwind manga longa": "Knit Unwind Crossover Long Sleeve Sweater",
    "Moletom hazy mock neck": "Hazy Mock Neck Sweatshirt",
    "Saia match point tennis": "Match Point Tennis Skirt",
    "Moletom muse": "Muse Hoodie",
    "Regata muscle alo vapor": "Alo Vapor Muscle Tank",
    "Calça Suited": "Suited Trouser Pant",
    "Casaco muse crew neck": "Muse Crew Neck Pullover",
    "Calça co-op pant": "Co-Op Pant",
    "Moletom make waves": "Make Waves Hoodie",
    "Meia unisex retrô cano alto": "Unisex Retro Crew Sock",
    "Calça co-op": "Co-Op Track Pant",
    "Moletom chill crew": "Chill Crewneck Sweatshirt",
    "Calça midrise alosoft wide leg finesse": "Mid-Rise Alosoft Finesse Wide Leg Pant",
    "Calça jogger repetition": "Repetition Jogger",
    "Casaco cropped mountain peak full-zip com capuz": "Cropped Mountain Peak Full-Zip Hoodie",
    "Calça de moletom muse": "Muse Sweatpant",
    "Blusa conquer 1/4 zip reform": "Conquer 1/4 Zip Reform Top",
    "Calça cargo double take": "Double Take Cargo Pant",
    "Blusa core hooded runner": "Core Hooded Runner Long Sleeve",
    "Blusa conquer reform com capuz": "Conquer Reform Hooded Long Sleeve",
    "Moletom chill": "Chill Pullover Hoodie",
    "Regata triumph muscle": "Triumph Muscle Tank",
    "Boné performance off-duty": "Off-Duty Performance Cap",
    "Moletom accolade com zíper": "Accolade Full Zip Hoodie",
    "Moletom accolade crew neck": "Accolade Crew Neck Pullover",
    "Blusa aspire": "Aspire Tank",
    "Moletom com capuz double take": "Double Take Pullover Hoodie",
    "Saia grand slam tennis": "Grand Slam Tennis Skirt",
    "Regata idol muscle": "Idol Muscle Tank",
    "Cardigan mini cable suéter": "Mini Cable Sweater Cardigan",
    "Calça jogger conquer max performance": "Conquer Max Performance Jogger",
    "Calça repetition": "Repetition Pant",
    "Macacão airbrush one and done": "Airbrush One And Done Onesie",
    "Blusa ribbed modal manga longa": "Ribbed Modal Long Sleeve Top",
    "Calça high-waist dreamscape": "High-Waist Dreamscape Pant",
    "Calça suit up": "Suit Up Trouser Legging",
    "Casaco cropped 1/4 zip alumni": "Cropped 1/4 Zip Alumni Pullover",
    "Casaco cropped serenity coverup": "Cropped Serenity Coverup Jacket",
    "Garrafa de água alo": "Alo Glass Water Bottle",
    "Boné off-duty": "Off-Duty Cap",
    "Moletom accolade": "Accolade Hoodie",
    "Casaco conquer max mock neck full zip": "Conquer Max Mock Neck Full Zip Jacket",
    "Calça conquer react performance": "Conquer React Performance Pant",
    "Top mini cable suéter": "Mini Cable Sweater Tank",
    "Moletom cropped  sway crew neck": "Cropped Sway Crew Neck Sweatshirt",
    "Moletom cropped accolade crewneck": "Cropped Accolade Crew Neck Sweatshirt",
    "Calça de moletom wide leg serenity": "Serenity Wide Leg Sweatpant",
    "Regata seamless ribbed favorite full length": "Seamless Ribbed Favorite Full Length Tank",
    "Suéter unwind de manga longa": "Unwind Long Sleeve Sweater",
    "Saia softsculpt topsin tennis": "Softsculpt Topspin Tennis Skirt",
    "Blusa Ribbed Adore": "Ribbed Adore Long Sleeve",
    "Blusa Alosoft Cami Finesse": "Alosoft Finesse Cami Top",
    "Saia Cargo Knit Scholar": "Cargo Knit Scholar Skirt",
    "Calça hight waist pursuit": "High-Waist Pursuit Pant",
    "Blusa polo double take manga curta": "Double Take Short Sleeve Polo",
    "Saia tenis rally": "Rally Tennis Skirt",
    "Calça de moletom sway boot cut": "Sway Boot Cut Sweatpant",
    "Calça muse wide leg": "Muse Wide Leg Pant",
    "Blusa ribbed adore": "Ribbed Adore Long Sleeve Top",
    "Saia Softsculpt Topsin Tennis": "Softsculpt Topspin Tennis Skirt",
    "Blusa softsculpt precision": "Softsculpt Precision Top",
    "Moletom Cropped  Sway Crew Neck": "Cropped Sway Crew Neck",
    "Top suéter knit unwind": "Knit Unwind Sweater Tank",
    "Calça suited": "Suited Pant",
    "Casaco Muse Crew Neck": "Muse Crew Neck Jacket",
    "Blusa alosoft cami finesse": "Alosoft Finesse Cami",
    "Blusa riibed adore": "Ribbed Adore Top"
}

def translate_text(text):
    if not text:
        return text
    # Clean HTML breaks temporarily
    clean = text.replace('<br>', ' __BR__ ').replace('<br/>', ' __BR__ ').replace('<br />', ' __BR__ ')
    clean = re.sub(r'<[^>]+>', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()

    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=' + urllib.parse.quote(clean)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
    
    try:
        res = urllib.request.urlopen(req, timeout=10)
        data = json.loads(res.read().decode('utf-8'))
        trans = ''.join([x[0] for x in data[0] if x and x[0]])
        trans = trans.replace('__BR__', '<br/><br/>').replace('__ br __', '<br/><br/>').replace('__br__', '<br/><br/>')
        # Capitalize sentences nicely
        trans = re.sub(r'(\. |\.\n|^)([a-z])', lambda m: m.group(1) + m.group(2).upper(), trans)
        # Brand terms capitalization
        trans = re.sub(r'\balo\b', 'Alo', trans, flags=re.IGNORECASE)
        trans = re.sub(r'\bairlift\b', 'Airlift', trans, flags=re.IGNORECASE)
        trans = re.sub(r'\bairbrush\b', 'Airbrush', trans, flags=re.IGNORECASE)
        trans = re.sub(r'\balosoft\b', 'Alosoft', trans, flags=re.IGNORECASE)
        trans = re.sub(r'\bsoftsculpt\b', 'Softsculpt', trans, flags=re.IGNORECASE)
        trans = re.sub(r'\baccolade\b', 'Accolade', trans, flags=re.IGNORECASE)
        return trans
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def is_portuguese(text):
    if not text:
        return False
    pt_regex = re.compile(r'[ãõçáéíóúêôàÃÕÇÁÉÍÓÚÊÔÀ]')
    pt_words = re.compile(r'\b(calça|calca|sutiã|sutia|regata|moletom|tênis|tenis|macacão|macacao|jaqueta|casaco|saia|vestido|confeccionad|combina|tecido|perfeito|look|nós|voce|você|para|com|não|nao|uma|um|dos|das|mais|este|esta|esse|essa|pelo|pela|nosso|nossa|seus|suas|sua|seu|fazer|quem|feita|feito|sobreposição|sobreposicao|guardar|treino|modelo|bolsos|mangas|detalhe|cós|cos|gola|cavas)\b', re.IGNORECASE)
    return bool(pt_regex.search(text) or pt_words.search(text))

def main():
    with open('src/data/products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    updated_names = 0
    updated_descs = 0

    for idx, p in enumerate(products):
        old_name = p.get('name', '')
        # Check name map first
        if old_name in NAME_MAP:
            p['name'] = NAME_MAP[old_name]
            updated_names += 1
            print(f"[{idx+1}/{len(products)}] NAME MAP: {old_name} -> {p['name']}")
        elif is_portuguese(old_name):
            trans_name = translate_text(old_name)
            p['name'] = trans_name.title()
            updated_names += 1
            print(f"[{idx+1}/{len(products)}] NAME TRANS: {old_name} -> {p['name']}")
            time.sleep(0.1)

        # Check description
        desc = p.get('description', '')
        if is_portuguese(desc):
            trans_desc = translate_text(desc)
            p['description'] = trans_desc
            updated_descs += 1
            print(f"[{idx+1}/{len(products)}] DESC TRANS for {p['name']}")
            time.sleep(0.15)

        # Update image alt tags with English product name
        eng_name = p['name']
        if p.get('images'):
            for img in p['images']:
                if img.get('alt') and is_portuguese(img['alt']):
                    img['alt'] = eng_name
        if p.get('colors'):
            for col in p['colors']:
                col_name = col.get('name', '')
                if col.get('images'):
                    for img in col['images']:
                        if img.get('alt') and is_portuguese(img['alt']):
                            img['alt'] = f"{eng_name} - {col_name}"

    with open('src/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Updated {updated_names} product names and {updated_descs} descriptions.")

if __name__ == '__main__':
    main()
