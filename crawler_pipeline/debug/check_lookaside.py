import re

with open("crawler_pipeline/data/from_lookaside.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print("Size:", len(html))
og_imgs = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print("og:image:", og_imgs)
scontents = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', html)
cleaned = set(c.replace('\\/', '/').replace('&amp;', '&') for c in scontents if 'static.xx' not in c and 'rsrc' not in c and not c.endswith('.wasm'))
print("Clean fbcdn:", len(cleaned))
for c in list(cleaned)[:10]:
    print("  ->", c)
