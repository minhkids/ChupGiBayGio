import json
import re

with open("crawler_pipeline/data/script_39.json", encoding="utf-8") as f:
    data = json.load(f)

# Let's search recursively for stories or posts
posts = []

def search(obj):
    if isinstance(obj, dict):
        # Look for story objects
        if "__typename" in obj and obj["__typename"] in ["Story", "CometFeedStory", "CometStoryPost"]:
            posts.append(obj)
        # Also check message or message text
        for k, v in obj.items():
            search(v)
    elif isinstance(obj, list):
        for item in obj:
            search(item)

search(data)
print(f"Found story candidates: {len(posts)}")

# Also let's extract all photo objects or attachments
attachments = []
def search_attachments(obj):
    if isinstance(obj, dict):
        if "comet_sections" in obj or "attached_story" in obj or "all_subattachments" in obj:
            pass
        if "image" in obj and isinstance(obj["image"], dict) and "uri" in obj["image"]:
            attachments.append(obj)
        for k, v in obj.items():
            search_attachments(v)
    elif isinstance(obj, list):
        for item in obj:
            search_attachments(item)

search_attachments(data)
print(f"Found image attachments: {len(attachments)}")

for idx, a in enumerate(attachments[:20]):
    uri = a.get("image", {}).get("uri")
    width = a.get("image", {}).get("width")
    height = a.get("image", {}).get("height")
    print(f"Attachment {idx}: {width}x{height} -> {uri}")
