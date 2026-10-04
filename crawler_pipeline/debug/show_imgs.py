import json
import urllib.request

with open('crawler_pipeline/data/extracted_fb_posts.json', encoding='utf-8') as f:
    posts = json.load(f)

for i, p in enumerate(posts[:10]):
    print(f"Post {i}: {p['post_url']}")
    print(f"  Avatar: {p['author_avatar']}")
    for j, img in enumerate(p['images'][:3]):
        print(f"  Img {j}: {img}")
