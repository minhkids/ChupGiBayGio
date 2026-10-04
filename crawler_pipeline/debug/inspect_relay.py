import re
import json

with open("crawler_pipeline/data/fb_ua_0.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

# Let's inspect scripts containing require or relay data
scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
for idx, s in enumerate(scripts):
    try:
        data = json.loads(s)
        text = json.dumps(data, ensure_ascii=False)
        if "photo" in text or "image" in text or "comet_sections" in text or "story" in text or "feed" in text:
            print(f"Script {idx}: length {len(text)}")
            # Let's check for uri keys in json
            uris = re.findall(r'"uri":\s*"(https:[^"]+)"', text)
            if uris:
                print(f"  Found {len(uris)} 'uri' fields!")
                for u in uris[:5]:
                    print("   ->", u)
            # Check for post text
            texts = re.findall(r'"text":\s*"([^"]{20,200})"', text)
            if texts:
                print(f"  Found {len(texts)} 'text' fields!")
                for t in texts[:5]:
                    print("   TX:", t)
    except Exception as e:
        pass
