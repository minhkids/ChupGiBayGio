import re
import json

with open("crawler_pipeline/fb_ua_0.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print(f"Loaded html: {len(html)} bytes")

# Find scontent images (these are actual photos uploaded by users, not static icons)
scontent_imgs = re.findall(r'https://scontent[^\s"\'<>\\]+', html)
cleaned_scontent = set()
for img in scontent_imgs:
    c = img.replace('\\/', '/').replace('&amp;', '&')
    cleaned_scontent.add(c)

print(f"Total scontent user images found: {len(cleaned_scontent)}")
for idx, u in enumerate(list(cleaned_scontent)[:20]):
    print(f"[{idx}] {u}")

# Let's search for post content or captions
# Facebook often embeds JSON in <script type="application/json"> or similar
json_scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
print(f"Total application/json scripts: {len(json_scripts)}")

# Search for mentions of locations or captions in Vietnamese
matches = re.findall(r'(Bãi đá|sông Hồng|Phan Đình Phùng|Hà Nội|Long Biên|Hồ Tây|nhiếp ảnh|chụp ảnh)[^"<>]{10,200}', html, re.IGNORECASE)
print(f"Found mentions in html: {len(matches)}")
for m in matches[:10]:
    print("MATCH:", m)
