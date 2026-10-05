"""
CHUPGIBAYGIO.COM - Visual Outfit Tap-to-Shop Extractor
Sử dụng LLM OpenRouter (Multimodal Vision) để bóc tách trang phục từ ảnh check-in:
1. Nhận diện loại đồ, phong cách, màu sắc.
2. Xác định tọa độ Hotspot (%) trên ảnh.
3. Sinh search query tối ưu hóa cho Shopee / TikTok Shop.
4. Tạo sẵn link affiliate Shopee và search link TikTok Shop.
5. Tạo danh sách 2-3 sản phẩm form dáng tương tự (fallback).
"""

import os
import sys
import json
import urllib.parse
from typing import Dict, Any, List, Optional
from openai import OpenAI

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Cấu hình OpenRouter
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
SHOPEE_AFFILIATE_ID = os.getenv("SHOPEE_AFFILIATE_ID", "chupgibaygio_vn")

client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY or "dummy-key-for-local-dev",
)

# Model OpenRouter ưu tiên (Multimodal Vision, cực nhanh & rẻ)
VISION_MODEL = "google/gemini-2.0-flash-001"


def build_shopee_affiliate_url(search_query: str, affiliate_id: str = SHOPEE_AFFILIATE_ID) -> str:
    """Tạo link tìm kiếm sản phẩm kèm mã affiliate Shopee."""
    encoded_query = urllib.parse.quote(search_query.strip())
    # Chuẩn link tìm kiếm Shopee kèm tracking affiliate
    return f"https://shopee.vn/search?keyword={encoded_query}&af_siteid={affiliate_id}&utm_source=affiliate&utm_campaign=visual_tap_to_shop"


def build_tiktok_shop_url(search_query: str) -> str:
    """Tạo link tìm kiếm trên TikTok Shop."""
    encoded_query = urllib.parse.quote(search_query.strip())
    return f"https://www.tiktok.com/search?q={encoded_query}&t=product"


VISION_SYSTEM_PROMPT = """Bạn là chuyên gia stylist & thời trang nhiếp ảnh AI cho nền tảng "Chụp Gì Bây Giờ".
Nhiệm vụ của bạn là xem một bức ảnh check-in / chụp ảnh ngoại cảnh tại Việt Nam, sau đó:
1. Xác định trang phục hoặc set đồ nổi bật nhất mà người trong ảnh đang mặc (ví dụ: Áo dài, Váy hoa nhí, Váy vintage, Áo khoác măng tô, Set đồ nàng thơ...).
2. Xác định tọa độ Hotspot (%) trên thân áo/váy để hiển thị nút tap-to-shop trên ảnh (x_percent từ 0 đến 100, y_percent từ 0 đến 100). Thường là vùng ngực hoặc eo của trang phục chính.
3. Sinh "search_query" tối ưu hóa cho công cụ tìm kiếm của sàn TMĐT Việt Nam (Shopee, TikTok Shop). Cụm từ khóa này phải chuẩn xác, bỏ các từ nối thừa, mô tả rõ: [loại áo/váy] + [chất liệu/họa tiết] + [phong cách/dáng áo].
4. Đưa ra 2-3 gợi ý sản phẩm tương tự (fallback) có form dáng gần giống, để người dùng dễ chọn mua nếu mẫu gốc hết hàng.

Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON sau (không thêm văn bản ngoài JSON):
{
  "item_name": "Tên chi tiết của trang phục (VD: Áo dài cách tân hoa nhí đỏ dáng suông)",
  "category": "AO_DAI" | "DRESS" | "JACKET" | "PROP" | "SET" | "ACCESSORY",
  "color": "Màu sắc chính (VD: Đỏ đô, Trắng kem, Xanh cốm)",
  "style": "Phong cách (VD: Nàng thơ, Vintage Retro, Cổ phục, Tối giản)",
  "x_percent": 50.0,
  "y_percent": 55.0,
  "search_query": "áo dài cách tân hoa nhí đỏ suông",
  "price_estimate": "350.000đ - 550.000đ",
  "ai_notes": "Điểm nhấn cổ yếm và họa tiết hoa cúc rất hợp chụp ảnh mùa thu Đông tại Hà Nội.",
  "similar_items": [
    {
      "id": "sim-1",
      "name": "Áo dài cách tân nhung đỏ phối lụa organza",
      "price_estimate": "390.000đ - 480.000đ",
      "search_query": "áo dài cách tân nhung đỏ tết"
    },
    {
      "id": "sim-2",
      "name": "Set áo dài suông gấm hoa chìm vintage",
      "price_estimate": "420.000đ - 650.000đ",
      "search_query": "áo dài gấm hoa chìm suông"
    }
  ]
}"""


def extract_outfit_from_image(image_url: str, post_id: str, spot_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Gọi OpenRouter Vision API để bóc tách trang phục từ ảnh check-in.
    Nếu không có API key hoặc lỗi mạng, trả về fallback mock outfit thông minh.
    """
    if not OPENROUTER_API_KEY:
        print("[OutfitExtractor] Không tìm thấy OPENROUTER_API_KEY, dùng fallback mockup phân tích.")
        return generate_fallback_outfit(image_url, post_id, spot_id)

    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Hãy bóc tách chi tiết trang phục chính trong bức ảnh check-in này cho tính năng Visual Tap-to-Shop:"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1000,
        )

        content = response.choices[0].message.content or "{}"
        data = json.loads(content)

        # Tạo link Shopee & TikTok Shop cho sản phẩm chính
        search_query = data.get("search_query", "váy chụp ảnh xinh")
        shopee_url = build_shopee_affiliate_url(search_query)
        tiktok_url = build_tiktok_shop_url(search_query)

        # Tạo link cho các sản phẩm fallback tương tự
        similar_items = []
        for idx, item in enumerate(data.get("similar_items", [])):
            sim_query = item.get("search_query", item.get("name", search_query))
            similar_items.append({
                "id": f"sim-{post_id}-{idx+1}",
                "name": item.get("name", "Váy phong cách tương tự"),
                "priceEstimate": item.get("price_estimate", "250.000đ - 450.000đ"),
                "shopeeUrl": build_shopee_affiliate_url(sim_query),
                "tiktokUrl": build_tiktok_shop_url(sim_query),
            })

        result = {
            "id": f"outfit-{post_id}",
            "postId": post_id,
            "spotId": spot_id,
            "imageUrl": image_url,
            "itemName": data.get("item_name", "Trang phục check-in"),
            "category": data.get("category", "DRESS"),
            "color": data.get("color", "Màu sắc tự nhiên"),
            "style": data.get("style", "Vintage / Nàng thơ"),
            "xPercent": float(data.get("x_percent", 50.0)),
            "yPercent": float(data.get("y_percent", 55.0)),
            "searchQuery": search_query,
            "priceEstimate": data.get("price_estimate", "350.000đ - 550.000đ"),
            "shopeeUrl": shopee_url,
            "tiktokUrl": tiktok_url,
            "similarItems": similar_items,
            "aiNotes": data.get("ai_notes", "Form dáng tôn dáng khi lên hình chụp ngoại cảnh."),
        }
        return result

    except Exception as e:
        print(f"[OutfitExtractor] Lỗi phân tích OpenRouter: {e}. Sử dụng mock fallback.")
        return generate_fallback_outfit(image_url, post_id, spot_id)


def generate_fallback_outfit(image_url: str, post_id: str, spot_id: Optional[str] = None) -> Dict[str, Any]:
    """Sinh dữ liệu mẫu trang phục cho môi trường local dev."""
    # Mẫu áo dài truyền thống / cách tân phổ biến nhất tại Việt Nam
    search_query = "áo dài cách tân tơ tằm hoa nhí vintage"
    return {
        "id": f"outfit-{post_id}",
        "postId": post_id,
        "spotId": spot_id or "spot-phan-dinh-phung",
        "imageUrl": image_url,
        "itemName": "Áo dài cách tân hoa nhí lụa tơ tằm dáng suông",
        "category": "AO_DAI",
        "color": "Trắng kem / Đỏ gạch",
        "style": "Vintage nàng thơ",
        "xPercent": 50.0,
        "yPercent": 52.0,
        "searchQuery": search_query,
        "priceEstimate": "320.000đ - 480.000đ",
        "shopeeUrl": build_shopee_affiliate_url(search_query),
        "tiktokUrl": build_tiktok_shop_url(search_query),
        "similarItems": [
            {
                "id": f"sim-{post_id}-1",
                "name": "Áo dài cách tân nhung the thêu hoa nổi cổ điển",
                "priceEstimate": "390.000đ - 520.000đ",
                "shopeeUrl": build_shopee_affiliate_url("áo dài cách tân nhung the thêu hoa"),
                "tiktokUrl": build_tiktok_shop_url("áo dài cách tân nhung the thêu hoa"),
            },
            {
                "id": f"sim-{post_id}-2",
                "name": "Váy maxi lụa cổ yếm chụp ảnh ngoại cảnh",
                "priceEstimate": "280.000đ - 420.000đ",
                "shopeeUrl": build_shopee_affiliate_url("váy maxi lụa cổ yếm đi chụp ảnh"),
                "tiktokUrl": build_tiktok_shop_url("váy maxi lụa cổ yếm đi chụp ảnh"),
            },
            {
                "id": f"sim-{post_id}-3",
                "name": "Nón lá thêu sen kèm quai lụa hồng pastel (Phụ kiện)",
                "priceEstimate": "65.000đ - 110.000đ",
                "shopeeUrl": build_shopee_affiliate_url("nón lá thêu sen quai lụa"),
                "tiktokUrl": build_tiktok_shop_url("nón lá thêu sen quai lụa"),
            }
        ],
        "aiNotes": "Tone màu trắng kem phản xạ ánh sáng vàng cực tốt khi chụp lúc hoàng hôn 16h-17h.",
    }


if __name__ == "__main__":
    test_image = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80"
    outfit = extract_outfit_from_image(test_image, post_id="post-demo-01")
    print(json.dumps(outfit, ensure_ascii=False, indent=2))
