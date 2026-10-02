import subprocess
import re
import json
import os
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
os.makedirs("public/facebook_media", exist_ok=True)

with open("crawler_pipeline/extracted_fb_posts.json", encoding="utf-8") as f:
    posts = json.load(f)

print(f"Loaded {len(posts)} posts from extracted_fb_posts.json")

# Select diverse posts
target_posts = [
    posts[0],  # Đức Tic
    posts[1],  # An Duy Hoàng - Hoa Mộng
    posts[2],  # Ngô Thành Tài
    posts[3],  # Sinh Lê - Dạ Nguyệt (Sony FX)
    posts[4],  # Lâm Trường - Hoa hoạ sắc nàng
    posts[6],  # Tony Trần - Khoảnh khắc cuối hè
    posts[8],  # Trương Ngọc Phượng Minh - Đình Bình Thuỷ
    posts[9],  # Trần Hải Nam - Phong trần tuổi 30
    posts[10], # Dang The Vinh - Nàng thơ vườn hoa
    posts[12], # Thanh Thủy - Nắng Hồ Gươm
    posts[15], # Phan Anh - Trung thu phố cổ
    posts[18], # Tuan Anh Nguyen - Trung thu Hàng Mã
    posts[22], # Nguyễn Phú An - Hà Nội (Fujifilm X-T2)
]

results = []

for idx, p in enumerate(target_posts):
    url = p["post_url"]
    print(f"\n[{idx+1}/{len(target_posts)}] Processing: {p['author_name']} -> {url}")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--dump-dom",
        "--virtual-time-budget=6000",
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=20)
        stdout = res.stdout
        
        # Extract scontent photos
        # We look for /t39.30808-6/ or /v/t39.30808-6/ which are post images
        matches = re.findall(r'https://scontent[^\s"\'<>\\]+', stdout)
        post_photos = []
        author_avatar = None
        
        for m in matches:
            c = m.replace('\\/', '/').replace('&amp;', '&')
            if 'static.xx' in c or 'rsrc' in c or c.endswith('.wasm') or '.kf' in c:
                continue
            if 't39.30808-6' in c:
                if c not in post_photos:
                    post_photos.append(c)
            elif 't39.30808-1' in c or 't1.30497-1' in c:
                if not author_avatar:
                    author_avatar = c
        
        print(f"  Found {len(post_photos)} post photos, avatar: {'Yes' if author_avatar else 'No'}")
        
        # Download photos locally to public/facebook_media/
        local_photos = []
        for p_idx, photo_url in enumerate(post_photos[:5]):
            ext = "jpg"
            local_filename = f"post_{idx}_{p_idx}.{ext}"
            local_path = os.path.join("public/facebook_media", local_filename)
            try:
                req = urllib.request.Request(photo_url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                })
                with urllib.request.urlopen(req, timeout=8) as r:
                    content = r.read()
                    if len(content) > 500:
                        with open(local_path, "wb") as f_out:
                            f_out.write(content)
                        local_photos.append(f"/facebook_media/{local_filename}")
                        print(f"    Saved photo {p_idx}: {len(content)} bytes -> {local_filename}")
            except Exception as err:
                print(f"    Download error photo {p_idx}: {err}")
        
        # Download avatar
        local_avatar = None
        if author_avatar:
            avatar_filename = f"avatar_{idx}.jpg"
            avatar_path = os.path.join("public/facebook_media", avatar_filename)
            try:
                req = urllib.request.Request(author_avatar, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                })
                with urllib.request.urlopen(req, timeout=8) as r:
                    content = r.read()
                    if len(content) > 200:
                        with open(avatar_path, "wb") as f_out:
                            f_out.write(content)
                        local_avatar = f"/facebook_media/{avatar_filename}"
                        print(f"    Saved avatar: {len(content)} bytes -> {avatar_filename}")
            except Exception as err:
                print(f"    Download error avatar: {err}")
        
        results.append({
            "author_name": p["author_name"],
            "post_url": url,
            "message": p["message"],
            "raw_fb_avatar": author_avatar,
            "raw_fb_photos": post_photos,
            "local_avatar": local_avatar,
            "local_photos": local_photos
        })
    except Exception as e:
        print(f"  Error processing post: {e}")

with open("crawler_pipeline/crawled_real_fb_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nFinished crawling all target posts! Saved crawled_real_fb_results.json")
