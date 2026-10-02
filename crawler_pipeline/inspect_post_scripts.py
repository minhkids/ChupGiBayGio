import re
import json

with open("crawler_pipeline/single_post_googlebot.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

# Let's inspect all <script type="application/json">
scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
print(f"Total scripts in single post: {len(scripts)}")

for idx, s in enumerate(scripts):
    try:
        data = json.loads(s)
        text = json.dumps(data)
        if "uri" in text or "image" in text or "photo" in text:
            uris = re.findall(r'"uri":\s*"(https:[^"]+)"', text)
            fbcdn_uris = [u for u in uris if "fbcdn.net" in u and "static" not in u and "rsrc" not in u]
            lookaside_uris = [u for u in uris if "lookaside" in u]
            if fbcdn_uris or lookaside_uris:
                print(f"Script {idx}: fbcdn={len(fbcdn_uris)}, lookaside={len(lookaside_uris)}")
                for u in fbcdn_uris[:3]:
                    print("  fbcdn:", u)
                for u in lookaside_uris[:3]:
                    print("  lookaside:", u)
    except Exception as e:
        pass
