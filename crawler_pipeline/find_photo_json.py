import json

with open("crawler_pipeline/script_39.json", encoding="utf-8") as f:
    data = json.load(f)

def find_key(obj, target):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if str(target) in str(v) or str(target) in str(k):
                if isinstance(v, dict):
                    print("Found dict:", json.dumps(v, ensure_ascii=False, indent=2)[:500])
                    print("="*40)
                elif isinstance(v, list):
                    print("Found list:", json.dumps(v[:2], ensure_ascii=False, indent=2)[:500])
                    print("="*40)
            find_key(v, target)
    elif isinstance(obj, list):
        for item in obj:
            find_key(item, target)

print("Searching for 2316105869185843:")
find_key(data, "2316105869185843")
