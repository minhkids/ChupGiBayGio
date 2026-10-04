import re

with open("crawler_pipeline/data/plugin_post.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print("Plugin size:", len(html))
imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
print(f"Img tags in plugin ({len(imgs)}):")
for i in imgs[:10]:
    print("  ->", i)

scontents = re.findall(r'https://[^\s"\'<>\\]+fbcdn\.net[^\s"\'<>\\]+', html)
clean = set(s.replace('\\/', '/').replace('&amp;', '&') for s in scontents if 'static.xx' not in s and 'rsrc' not in s)
print(f"fbcdn in plugin ({len(clean)}):")
for c in list(clean)[:10]:
    print("  FB:", c)
