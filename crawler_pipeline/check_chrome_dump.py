import re

with open("crawler_pipeline/chrome_dump.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

print(f"Dump size: {len(html)}")

scontent = re.findall(r'https://[^\s"\'<>\\]+fbcdn\.net[^\s"\'<>\\]+', html)
clean = set(s.replace('\\/', '/').replace('&amp;', '&') for s in scontent if 'static.xx' not in s and 'rsrc' not in s and not s.endswith('.wasm'))

print(f"Non-static fbcdn in Chrome dump: {len(clean)}")
for c in list(clean)[:15]:
    print("  ->", c)

imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
print(f"img tags in Chrome dump: {len(imgs)}")
for i in imgs[:10]:
    if 'fbcdn.net' in i:
        print("  IMG:", i)
