import json
import re

har_path = "/Users/joshuacustodio/Downloads/www.aloyoga.com.br.har"

with open(har_path, 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get("log", {}).get("entries", [])

for e in entries:
    url = e.get("request", {}).get("url", "")
    mime = e.get("response", {}).get("content", {}).get("mimeType", "")
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if len(txt) > 3000000 and "text/html" in mime:
        print(f"Analyzing {url} ({len(txt)} bytes)...")
        
        # Look for __RUNTIME__
        m_run = re.search(r'__RUNTIME__\s*=\s*({.+?});?</script>', txt)
        if m_run:
            print("Found __RUNTIME__!")
            try:
                runtime = json.loads(m_run.group(1))
                print("Runtime keys:", list(runtime.keys()))
                pages = runtime.get("pages", {})
                print("Pages in runtime:", list(pages.keys())[:10])
                extensions = runtime.get("extensions", {})
                print(f"Total extensions: {len(extensions)}")
                for k, v in list(extensions.items())[:15]:
                    comp = v.get("component")
                    props = v.get("props", {})
                    print(f"  Ext: {k} -> comp: {comp}, props: {list(props.keys())}")
            except Exception as ex:
                print("Error parsing __RUNTIME__:", ex)
        
        # Look for __STATE__
        m_state = re.search(r'__STATE__\s*=\s*({.+?});?</script>', txt)
        if m_state:
            print("Found __STATE__!")
            try:
                state = json.loads(m_state.group(1))
                print(f"Total items in __STATE__: {len(state)}")
                products = [k for k in state if "Product:" in k]
                print(f"Products in state: {len(products)}")
                for p in products[:5]:
                    print(f"  {p}: {state[p].get('productName')}")
            except Exception as ex:
                print("Error parsing __STATE__:", ex)
