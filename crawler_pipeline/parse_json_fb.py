import re
import json

with open("crawler_pipeline/fb_ua_0.html", encoding="utf-8", errors="ignore") as f:
    html = f.read()

json_scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html)
print(f"Total json scripts: {len(json_scripts)}")

all_uris = set()
for idx, s in enumerate(json_scripts):
    try:
        data = json.loads(s)
        dump = json.dumps(data)
        uris = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', dump)
        for u in uris:
            clean = u.replace('\\/', '/').replace('&amp;', '&')
            if 'static.xx' not in clean and 'rsrc.php' not in clean:
                all_uris.add(clean)
    except Exception as e:
        # regex search directly on s
        uris = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', s)
        for u in uris:
            clean = u.replace('\\/', '/').replace('&amp;', '&')
            if 'static.xx' not in clean and 'rsrc.php' not in clean:
                all_uris.add(clean)

print(f"Non-static fbcdn URLs: {len(all_uris)}")
for u in list(all_uris)[:15]:
    print(u)
