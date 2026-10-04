import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/mockSpots.ts', encoding='utf-8') as f:
    content = f.read()

# Find all spot IDs, names, coverImageUrl, and inspirationPosts
spot_blocks = re.findall(r'id:\s*[\'\"](spot-[^\'\"]+)[\'\"].*?name:\s*[\'\"]([^\'\"]+)[\'\"]', content, re.DOTALL)
print(f"Total spots found: {len(spot_blocks)}")
for s_id, s_name in spot_blocks:
    print(f"- {s_id}: {s_name}")
