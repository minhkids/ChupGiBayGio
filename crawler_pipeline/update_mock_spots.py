import json
import re

with open("crawler_pipeline/data/crawled_real_fb_results.json", encoding="utf-8") as f:
    fb_posts = json.load(f)

# Let's inspect mockSpots.ts
with open("src/data/mockSpots.ts", encoding="utf-8") as f:
    code = f.read()

# Spot 01: Bãi Đá Sông Hồng
# Cover: post_0_0.jpg
# Gallery: post_0_0.jpg, post_0_2.jpg, post_0_3.jpg, post_8_0.jpg
# Author 1: Đức Tic (avatar_0.jpg), post: post_0_0, post_0_1, post_0_2, URL: fb_posts[0]['post_url']
# Author 2: Dang The Vinh (avatar_8.jpg), post: post_8_0, post_8_1, post_8_2, URL: fb_posts[8]['post_url']

print("Replacing spot-hn-01 images...")
code = re.sub(
    r'(id:\s*[\'"]spot-hn-01[\'"].*?coverImageUrl:\s*)[\'"][^\'"]+[\'"]',
    r"\1'/facebook_media/post_0_0.jpg'",
    code,
    flags=re.DOTALL
)

print("Preparing full mockSpots.ts generator script...")
