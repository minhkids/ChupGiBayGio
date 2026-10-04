import re

with open("src/data/mockSpots.ts", encoding="utf-8") as f:
    text = f.read()

unsplash_urls = re.findall(r'https://images\.unsplash\.com[^\s"\'`\)]+', text)
print(f"Total unsplash URLs in mockSpots.ts: {len(unsplash_urls)}")
unique_unsplash = set(unsplash_urls)
print(f"Unique unsplash URLs: {len(unique_unsplash)}")
for u in list(unique_unsplash)[:10]:
    print("  ->", u)
