import subprocess
import json
import re

user_agents = [
    # Googlebot
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    # Chrome Desktop
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    # Facebook external hit
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
]

for idx, ua in enumerate(user_agents):
    out_file = f"crawler_pipeline/data/fb_ua_{idx}.html"
    cmd = [
        "curl.exe", "-s", "-L",
        "-A", ua,
        "-H", "Accept-Language: vi-VN,vi;q=0.9",
        "https://www.facebook.com/groups/528320614043286",
        "-o", out_file
    ]
    subprocess.run(cmd)
    with open(out_file, encoding='utf-8', errors='ignore') as f:
        content = f.read()
    print(f"UA {idx} length: {len(content)}")
    imgs = re.findall(r'https://[^"\'\s<>\\]+fbcdn\.net[^"\'\s<>\\]+', content)
    print(f"UA {idx} fbcdn count: {len(imgs)}")
    if imgs:
        print(f"Sample: {imgs[0][:100]}")
