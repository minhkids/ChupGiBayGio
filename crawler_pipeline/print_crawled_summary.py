import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("crawler_pipeline/crawled_real_fb_results.json", encoding="utf-8") as f:
    posts = json.load(f)

print(f"Total crawled items: {len(posts)}")
for i, p in enumerate(posts):
    print(f"\n--- Item {i} ---")
    print(f"Author: {p['author_name']}")
    print(f"Post URL: {p['post_url']}")
    print(f"Avatar: {p['local_avatar']}")
    print(f"Photos count: {len(p['local_photos'])}")
    for photo in p['local_photos']:
        print(f"  {photo}")
    print(f"Message: {p['message'][:120] if p['message'] else 'None'}")
