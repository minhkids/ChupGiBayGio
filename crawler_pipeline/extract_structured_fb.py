import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("crawler_pipeline/script_39.json", encoding="utf-8") as f:
    data = json.load(f)

extracted_stories = []

def parse_story(story_node):
    msg = None
    if "comet_sections" in story_node:
        cs = story_node["comet_sections"]
        try:
            msg_node = cs.get("content", {}).get("story", {}).get("message", {})
            if msg_node and "text" in msg_node:
                msg = msg_node["text"]
        except Exception:
            pass
        
        author_name = "Thành viên Aphoto"
        author_avatar = None
        try:
            actor = cs.get("context_layout", {}).get("story", {}).get("comet_sections", {}).get("actor_photo", {}).get("story", {}).get("actors", [])[0]
            author_name = actor.get("name", author_name)
            author_avatar = actor.get("profile_picture", {}).get("uri")
        except Exception:
            pass
        
        post_url = "https://www.facebook.com/groups/528320614043286"
        try:
            metadata_list = cs.get("context_layout", {}).get("story", {}).get("comet_sections", {}).get("metadata", [])
            for m in metadata_list:
                u = m.get("story", {}).get("url")
                if u:
                    post_url = u
                    break
        except Exception:
            pass

        images = []
        try:
            attachments = cs.get("content", {}).get("story", {}).get("attachments", [])
            for att in attachments:
                sub = att.get("styles", {}).get("attachment", {}).get("all_subattachments", {}).get("nodes", [])
                if sub:
                    for s in sub:
                        img_node = s.get("media", {}).get("image", {})
                        if img_node and "uri" in img_node:
                            images.append(img_node["uri"])
                else:
                    media = att.get("styles", {}).get("attachment", {}).get("media", {})
                    img_node = media.get("image", {})
                    if img_node and "uri" in img_node:
                        images.append(img_node["uri"])
        except Exception:
            pass
        
        if images:
            return {
                "author_name": author_name,
                "author_avatar": author_avatar,
                "post_url": post_url,
                "message": msg,
                "images": images
            }
    return None

def find_all_stories(obj):
    if isinstance(obj, dict):
        if "__typename" in obj and obj["__typename"] == "Story":
            s = parse_story(obj)
            if s:
                extracted_stories.append(s)
        for v in obj.values():
            find_all_stories(v)
    elif isinstance(obj, list):
        for item in obj:
            find_all_stories(item)

find_all_stories(data)
print(f"Extracted valid stories with images: {len(extracted_stories)}")

# Deduplicate stories by images
unique_stories = []
seen_imgs = set()
for s in extracted_stories:
    first_img = s["images"][0] if s["images"] else None
    if first_img and first_img not in seen_imgs:
        seen_imgs.add(first_img)
        unique_stories.append(s)

print(f"Unique stories: {len(unique_stories)}")

for idx, s in enumerate(unique_stories):
    print(f"\n--- Story {idx} ---")
    print(f"Author: {s['author_name']}")
    print(f"Avatar: {s['author_avatar']}")
    print(f"URL: {s['post_url']}")
    print(f"Message: {s['message'][:100] if s['message'] else 'None'}")
    print(f"Images count: {len(s['images'])}")

with open("crawler_pipeline/extracted_fb_posts.json", "w", encoding="utf-8") as f:
    json.dump(unique_stories, f, ensure_ascii=False, indent=2)

print("\nSaved extracted_fb_posts.json successfully!")
