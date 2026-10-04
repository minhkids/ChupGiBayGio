import re

with open("crawler_pipeline/data/single_post_googlebot.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print(f"Size: {len(html)}")

og_image = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print("og:image:", og_image)

# Search for all image tags or scontent
scontent = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', html)
clean_scontent = set()
for s in scontent:
    c = s.replace('\\/', '/').replace('&amp;', '&')
    if 'static.xx' not in c and 'rsrc.php' not in c:
        clean_scontent.add(c)

print(f"Clean scontent: {len(clean_scontent)}")
for s in list(clean_scontent)[:10]:
    print("  ->", s)
