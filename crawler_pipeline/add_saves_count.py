import re

with open("crawler_pipeline/data/generate_mock_spots.py", encoding="utf-8") as f:
    code = f.read()

# Replace each spot's recentReports ending with recentReports + savesCount + isFeatured
saves_data = {
    'spot-hn-01': (3840, True),
    'spot-hn-02': (2950, True),
    'spot-hn-03': (4210, True),
    'spot-hn-04': (2680, True),
    'spot-hn-05': (1890, False),
    'spot-hcm-01': (3120, True),
    'spot-hcm-02': (1740, False),
    'spot-dl-01': (3560, True),
    'spot-dl-02': (2280, False),
    'spot-sp-01': (3980, True)
}

for s_id, (saves, feat) in saves_data.items():
    pattern = rf"(id:\s*'{s_id}'.*?recentReports:\s*\[.*?\]\n\s*)"
    replacement = rf"\1    savesCount: {saves},\n    isFeatured: {'true' if feat else 'false'},\n"
    code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open("crawler_pipeline/data/generate_mock_spots.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated generate_mock_spots.py with savesCount and isFeatured!")
