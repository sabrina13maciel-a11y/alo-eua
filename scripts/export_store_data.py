import json

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

e136 = har.get("log", {}).get("entries", [])[136]
txt = e136["response"]["content"]["text"]
data = json.loads(txt)
exts = data.get("extensions", {})

# Official Banners from home
hero_banners = [
    {
        "id": "hero-1",
        "title": "THE ICONIC COLLECTION",
        "subtitle": "70% OFF SITEWIDE TODAY ONLY",
        "desktopImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/1064ec27-114b-4d6d-ab9b-035de8826eea___ceb97968ab903e75d4884099f915f262.jpg",
        "mobileImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/1ca10c1f-7546-4dce-baa2-8222a4198c6a___4cc4b3b8ea7bdb79e5506b2727405980.jpg",
        "ctaText": "SHOP 70% OFF",
        "category": "bestsellers"
    },
    {
        "id": "hero-2",
        "title": "FROM WORK TO WEEKEND",
        "subtitle": "Studio-to-Street luxury activewear engineered for perfection",
        "desktopImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/364c2c93-ad80-4cee-83ae-0cf14dbf5501___7ee1ef129d4010648804230ec512c6bb.jpg",
        "mobileImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/ebeef3b4-2553-44c3-9f6b-5d4e3df1d3f8___991c953a7cac8fcc02b58d7931b1d662.jpg",
        "ctaText": "EXPLORE COLLECTION",
        "category": "Hoodies & Jackets"
    },
    {
        "id": "hero-3",
        "title": "AS SEEN ON JIN",
        "subtitle": "Discover the viral fits worn by global ambassadors",
        "desktopImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/2b1993e0-7d76-4e55-a3bc-81af59d58c02___fa4c63c5d08d6b265b002d68879a3db5.jpg",
        "mobileImage": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/21932ae2-d1e1-4136-ac3e-8da9b5613ca3___b1adda424486133e5923143aa9b5c1e1.jpg",
        "ctaText": "SHOP JIN'S FAVORITES",
        "category": "bestsellers"
    }
]

# Official Story/Topic Bubbles (circular topics on mobile that users drag to scroll horizontally!)
# Look at user prompt: "Os mesmos tópicos, as mesmas formas de clicar e acessar os tópicos, de arrastar para o lado. Quero tudo idêntico, beleza?"
official_topics = [
    {
        "id": "novidades",
        "label": "Novidades",
        "category": "all",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/d332762b-e781-4c60-ba13-47788f1dc35e___0517b2343d2c0e80019a2897469a0edc.jpg",
        "badge": "NEW"
    },
    {
        "id": "bestsellers",
        "label": "Best Sellers",
        "category": "bestsellers",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/b79fe3ed-b753-42a7-8df7-19ffc18ef90b___087470f6fd7f501eb6beca78c5dc1de4.jpg",
        "badge": "-70%"
    },
    {
        "id": "jaquetas",
        "label": "Jaquetas & Casacos",
        "category": "Hoodies & Jackets",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/6a421625-637a-4264-936d-1e8e1c2dbec0___5520f9546f42e44e21015a07a8b09687.jpg"
    },
    {
        "id": "vestidos",
        "label": "Vestidos & Rompers",
        "category": "Dresses & Rompers",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/4e4c743c-aca9-4b3f-9c79-45132595deee___d04acb2524ede30b54f6d8bcbc31e90e.jpg",
        "badge": "HOT"
    },
    {
        "id": "leggings",
        "label": "Leggings & Shorts",
        "category": "Leggings & Bottoms",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/efc1d58c-e2ce-4b16-b11c-b4ffd0387552___40ffb69be9951c01e02f9b478cd444de.jpg"
    },
    {
        "id": "sutias",
        "label": "Bras & Croppeds",
        "category": "Bras & Tops",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/af32929a-be82-4653-88c5-5cf3e86e8e82___e1eabe58b0bb49999a7851a909bc8d2e.png"
    },
    {
        "id": "yoga",
        "label": "Yoga & Pilates",
        "category": "all",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/9b64a2ce-99ff-44e7-9dbb-b8564d8e109b___4ba8cf1011b78f1845dbbe255ed49788.jpg"
    },
    {
        "id": "acessorios",
        "label": "Acessórios",
        "category": "Accessories",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/6f0a2dea-f77a-4cdd-8ac7-6734de9f8ad3___e62bf00c1d86cb1bf7ba2392fdd41a6f.jpg"
    },
    {
        "id": "calcados",
        "label": "Calçados & Tênis",
        "category": "Footwear",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/4d0a5725-df32-4537-a38f-3e068ca0e174___e09aa3853d25c2c14c0bea3d1fc7810e.jpg"
    }
]

# Editorial Feature Spotlights
feature_spotlights = [
    {
        "id": "spotlight-1",
        "title": "From Work to Weekend",
        "subtitle": "Tailored compression activewear that transitions effortlessly.",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/fe473353-3791-44c7-8b67-a80bac05f33d___82a418266302cc0be5912ac5eead8b47.png",
        "cta": "DISCOVER LOOKS",
        "category": "Hoodies & Jackets"
    },
    {
        "id": "spotlight-2",
        "title": "As Seen on Jin",
        "subtitle": "Global sensation style picks. Pure luxury minimalist streetwear.",
        "image": "https://aloyogabr.vtexassets.com/assets/vtex.file-manager-graphql/images/1dc68ec2-68f0-4a57-b87c-ad147a38db79___38dd3f57c53a4df2fad416190e29da8a.png",
        "cta": "SHOP THE EDIT",
        "category": "bestsellers"
    }
]

code_content = f"""// Extracted directly from www.aloyoga.com.br HAR capture
export const HERO_BANNERS = {json.dumps(hero_banners, indent=2)};

export const STORE_TOPICS = {json.dumps(official_topics, indent=2)};

export const FEATURE_SPOTLIGHTS = {json.dumps(feature_spotlights, indent=2)};
"""

target_path = "/Users/joshuacustodio/.gemini/antigravity-ide/scratch/alo-store/src/data/storeData.js"
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(code_content)

print(f"Successfully created {target_path}!")
