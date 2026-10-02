import re

with open("crawler_pipeline/photo_googlebot.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print("Photo size:", len(html))
og_imgs = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print("og:image:", og_imgs)

# Search for any fbcdn or lookaside
uris = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', html)
clean_uris = set(u.replace('\\/', '/').replace('&amp;', '&') for u in uris if 'static.xx' not in u and 'rsrc' not in u and not u.endswith('.wasm'))
print("fbcdn count:", len(clean_uris))
for u in list(clean_uris)[:10]:
    print("  fbcdn:", u)
