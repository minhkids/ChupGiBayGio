import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("crawler_pipeline/script_39.json", encoding="utf-8") as f:
    data = json.load(f)

def find_target(obj):
    if isinstance(obj, dict):
        if obj.get("id") == "2316105869185843" or "2316105869185843" in str(obj.get("uri", "")):
            print("MATCHING NODE:")
            print(json.dumps(obj, ensure_ascii=False, indent=2))
            print("="*60)
        for v in obj.values():
            find_target(v)
    elif isinstance(obj, list):
        for item in obj:
            find_target(item)

find_target(data)
