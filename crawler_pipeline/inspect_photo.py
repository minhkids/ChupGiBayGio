import re

with open("crawler_pipeline/photo_detail.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print("Size:", len(html))
og_imgs = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print("og:image:", og_imgs)

scontents = re.findall(r'https://scontent[^\s"\'<>\\]+', html)
cleaned = set()
for sc in scontents:
    c = sc.replace('\\/', '/').replace('&amp;', '&')
    if 'static.xx' not in c and 'rsrc.php' not in c:
        cleaned.add(c)

print(f"scontent count: {len(cleaned)}")
for c in list(cleaned)[:10]:
    print("  ->", c)
