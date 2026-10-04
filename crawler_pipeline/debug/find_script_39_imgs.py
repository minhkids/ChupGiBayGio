import json
import re

with open("crawler_pipeline/data/script_39.json", encoding="utf-8") as f:
    text = f.read()

print(f"Total characters in script_39.json: {len(text)}")

# Find all occurrences of image URLs
jpgs = re.findall(r'https:[^"\'\s<>\\]+\.jpg[^"\'\s<>\\]*', text)
print(f"Total .jpg occurrences: {len(jpgs)}")
clean_jpgs = set(j.replace('\\/', '/').replace('&amp;', '&') for j in jpgs)
for j in list(clean_jpgs)[:15]:
    print("JPG:", j)

# Find all occurrences of scontent
scontents = re.findall(r'https:[^"\'\s<>\\]+scontent[^"\'\s<>\\]*', text)
print(f"Total scontent occurrences: {len(scontents)}")
clean_sc = set(s.replace('\\/', '/').replace('&amp;', '&') for s in scontents)
for s in list(clean_sc)[:15]:
    print("SC:", s)
