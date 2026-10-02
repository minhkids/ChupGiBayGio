import re
import json

with open("crawler_pipeline/fb_ua_0.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
script_39 = scripts[39]

data = json.loads(script_39)

with open("crawler_pipeline/script_39.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved script_39.json!")
