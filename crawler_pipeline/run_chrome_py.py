import subprocess
import re

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
url = "https://www.facebook.com/groups/528320614043286/posts/3375409202667732/"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--dump-dom",
    "--virtual-time-budget=8000",
    url
]

print("Running Chrome headless...")
res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
print(f"Stdout length: {len(res.stdout)}")
print(f"Stderr length: {len(res.stderr)}")

with open("crawler_pipeline/chrome_dump_python.html", "w", encoding="utf-8") as f:
    f.write(res.stdout)

scontent = re.findall(r'https://[^\s"\'<>\\]+fbcdn\.net[^\s"\'<>\\]+', res.stdout)
clean = set(s.replace('\\/', '/').replace('&amp;', '&') for s in scontent if 'static.xx' not in s and 'rsrc' not in s and not s.endswith('.wasm'))

print(f"Non-static fbcdn found: {len(clean)}")
for c in list(clean)[:15]:
    print("  ->", c)
