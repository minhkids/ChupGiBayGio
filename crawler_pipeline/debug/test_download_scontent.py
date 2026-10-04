import re
import urllib.request
import os
import json

with open("crawler_pipeline/data/fb_ua_0.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

json_scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
all_uris = set()
for idx, s in enumerate(json_scripts):
    try:
        data = json.loads(s)
        dump = json.dumps(data)
        uris = re.findall(r'https://[^\s"\'<>\\]+fbcdn\.net[^\s"\'<>\\]+', dump)
        for u in uris:
            clean = u.replace('\\/', '/').replace('&amp;', '&')
            if 'static.xx' not in clean and 'rsrc.php' not in clean and not clean.endswith('.wasm'):
                all_uris.add(clean)
    except Exception:
        pass

print(f"Total non-static fbcdn URLs from JSON: {len(all_uris)}")
os.makedirs("crawler_pipeline/data/downloaded_scontent", exist_ok=True)

for idx, url in enumerate(list(all_uris)):
    filename = f"crawler_pipeline/data/downloaded_scontent/img_{idx}.jpg"
    print(f"Downloading {idx}: {url[:100]}...")
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        })
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            with open(filename, "wb") as out:
                out.write(data)
            print(f"  -> SUCCESS! Saved {len(data)} bytes ({data[:4]})")
    except Exception as e:
        print(f"  -> FAILED: {e}")
