"""
CHUPGIBAYGIO.COM - OpenRouter Social Crawler & Geo-Tagging Pipeline Worker
Phân tích bài viết từ Facebook Group (528320614043286 - Aphoto), trích xuất thực thể qua OpenRouter,
chuẩn hóa địa danh tiếng Việt và gắn pin trực tiếp lên bản đồ (Hà Nội BBox).
"""

import os
import sys
import json
import re
from typing import Optional, Dict, Any, List
from openai import OpenAI

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Cấu hình OpenRouter client
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY or "dummy-key-for-local-testing",
)

# Từ điển chuẩn hóa địa danh & tiếng lóng nhiếp ảnh Hà Nội
HANOI_LANDMARK_ALIASES: Dict[str, Dict[str, Any]] = {
    "pđp": {
        "canonical_name": "Đường Phan Đình Phùng",
        "address": "Đường Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội",
        "lat": 21.0396,
        "lng": 105.8396,
        "region_id": "hanoi"
    },
    "phan đình phùng": {
        "canonical_name": "Đường Phan Đình Phùng",
        "address": "Đường Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội",
        "lat": 21.0396,
        "lng": 105.8396,
        "region_id": "hanoi"
    },
    "cầu long biên": {
        "canonical_name": "Cầu Long Biên",
        "address": "Cầu Long Biên, Hoàn Kiếm - Long Biên, Hà Nội",
        "lat": 21.0436,
        "lng": 105.8572,
        "region_id": "hanoi"
    },
    "bãi đá sông hồng": {
        "canonical_name": "Vườn hoa Bãi Đá Sông Hồng",
        "address": "Ngõ 264 Âu Cơ, Nhật Tân, Tây Hồ, Hà Nội",
        "lat": 21.0772,
        "lng": 105.8325,
        "region_id": "hanoi"
    },
    "bãi đá": {
        "canonical_name": "Vườn hoa Bãi Đá Sông Hồng",
        "address": "Ngõ 264 Âu Cơ, Nhật Tân, Tây Hồ, Hà Nội",
        "lat": 21.0772,
        "lng": 105.8325,
        "region_id": "hanoi"
    },
    "bến hàn quốc": {
        "canonical_name": "Bến Hàn Quốc Hồ Tây",
        "address": "Đường ven Hồ Tây, Nhật Tân, Tây Hồ, Hà Nội",
        "lat": 21.0652,
        "lng": 105.8234,
        "region_id": "hanoi"
    },
    "hàng mã": {
        "canonical_name": "Phố Cổ Hàng Mã",
        "address": "Phố Hàng Mã, Hàng Bồ, Hoàn Kiếm, Hà Nội",
        "lat": 21.0366,
        "lng": 105.8492,
        "region_id": "hanoi"
    },
    "hồ gươm": {
        "canonical_name": "Hồ Hoàn Kiếm (Hồ Gươm)",
        "address": "Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội",
        "lat": 21.0285,
        "lng": 105.8542,
        "region_id": "hanoi"
    }
}

SYSTEM_PROMPT = """
Bạn là chuyên gia phân tích dữ liệu nhiếp ảnh và địa điểm du lịch tại Việt Nam của ChupGiBayGio.com. 
Nhiệm vụ của bạn là đọc bài viết từ mạng xã hội (Facebook Group Aphoto) và trích xuất thông tin chụp ảnh thành cấu trúc JSON.
Mặc định khu vực ưu tiên là Hà Nội.

Quy tắc nghiêm ngặt:
1. is_photo_spot: boolean (true nếu bài viết chia sẻ địa điểm chụp ảnh/check-in thực tế, false nếu là bài bán hàng, hỏi đáp thiết bị, tin rác).
2. location_name: Tên địa điểm ngắn gọn, rõ ràng (ví dụ: 'Đường Phan Đình Phùng', 'Vườn hoa Bãi Đá Sông Hồng', 'Cầu Long Biên'). Nếu không nhắc đến địa điểm cụ thể nào, trả về null.
3. location_detail: Chi tiết vị trí cụ thể (ví dụ: 'Đoạn gần cổng trường Phan Đình Phùng, nhiều xe hoa', 'Đầu cầu phía Hoàn Kiếm').
4. city: Mặc định là 'Hà Nội' trừ khi bài viết nói rõ tỉnh thành khác (TP.HCM, Đà Lạt, Sa Pa).
5. month_detected: Số từ 1-12 biểu thị tháng thích hợp nhất để chụp (dựa vào bối cảnh hoa, thời tiết, hoặc mốc thời gian bài viết nhắc đến: thu/hoa cúc/xe hoa -> 10,11; đào tết -> 1,2; sen hồ tây -> 6).
6. season_theme: Tên chủ đề mùa (ví dụ: 'Mùa thu Hà Nội', 'Mùa cúc họa mi', 'Mùa sương sớm').
7. concept_tags: Mảng 2-4 tag ngắn về phong cách chụp hoặc trang phục (e.g., 'Áo dài trắng', 'Xe hoa', 'Nàng thơ', 'Vintage').
8. status_note: Ghi chú tình trạng cảnh (e.g., 'Nhiều xe hoa và nắng đẹp', 'Hoa nở rộ 85%', 'Đông đúc tầm 8h-10h sáng').
9. camera_params: Thông số máy ảnh nếu người chụp có nhắc đến (ví dụ: 'Sony A7IV + 85mm f/1.4' hoặc null).
10. confidence_score: Điểm tin cậy từ 0.0 đến 1.0 (ví dụ: 0.95).

Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ định dạng schema.
"""

def normalize_location_alias(raw_location: str) -> Optional[Dict[str, Any]]:
    """So khớp tên địa điểm với từ điển địa danh cục bộ Hà Nội."""
    if not raw_location:
        return None
    
    clean = raw_location.strip().lower()
    clean = re.sub(r'^(đường|phố|vườn hoa|khu)\s+', '', clean)
    
    # Tìm trực tiếp
    for alias, geo in HANOI_LANDMARK_ALIASES.items():
        if alias in clean or clean in alias:
            return geo
            
    return None

def analyze_post_with_openrouter(post_text: str, model: str = "openai/gpt-4o-mini") -> Dict[str, Any]:
    """
    Gọi OpenRouter API để bóc tách ngữ nghĩa bài viết mạng xã hội.
    Hỗ trợ fallback sang anthropic/claude-3.5-haiku nếu model chính bận.
    """
    prompt = f"""
    Phân tích bài viết mạng xã hội sau và trích xuất thông tin địa điểm chụp ảnh:
    ---
    {post_text}
    ---
    Trả về ĐÚNG định dạng JSON theo schema đã chỉ định.
    """

    try:
        response = client.chat.completions.create(
            model=model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Nhiệt độ thấp đảm bảo tính nhất quán của JSON
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Bổ sung chuẩn hóa địa lý (Geo-resolution)
        if data.get("location_name"):
            matched_geo = normalize_location_alias(data["location_name"])
            if matched_geo:
                data["geo_resolved"] = matched_geo
                data["lat"] = matched_geo["lat"]
                data["lng"] = matched_geo["lng"]
                data["address"] = matched_geo["address"]
            else:
                # Mặc định trung tâm Hà Nội theo spec
                data["lat"] = 21.0378
                data["lng"] = 105.8396
                data["address"] = f"{data['location_name']}, Hà Nội"
                
        return data

    except Exception as e:
        print(f"Error calling OpenRouter ({model}): {e}")
        # Fallback thử claude-3.5-haiku nếu model trước lỗi
        if model != "anthropic/claude-3.5-haiku":
            print("Retrying with fallback model anthropic/claude-3.5-haiku...")
            return analyze_post_with_openrouter(post_text, model="anthropic/claude-3.5-haiku")
        raise e

# Chạy thử nghiệm mẫu
if __name__ == "__main__":
    sample_text = (
        "Sáng nay dạo Phan Đình Phùng hoa sữa chưa có nhưng xe hoa ngập tràn rồi các bác ơi! "
        "Mùa thu Hà Nội đúng là chỉ cần mặc áo dài trắng ra đứng góc cổng trường chụp là auto đẹp. "
        "Tầm 8-9h nắng chiếu xiên qua kẽ lá cực thơ nhé! "
        "Gear em dùng: Sony A7IV + FE 85mm f/1.4 GM."
    )
    
    print("=== ĐANG PHÂN TÍCH QUA OPENROUTER ===")
    if not OPENROUTER_API_KEY:
        print("[LƯU Ý]: Chưa set OPENROUTER_API_KEY môi trường. Chạy ở chế độ mô phỏng chuẩn.")
        mock_result = {
            "is_photo_spot": True,
            "location_name": "Đường Phan Đình Phùng",
            "location_detail": "Đoạn gần cổng trường Phan Đình Phùng, nhiều xe hoa",
            "city": "Hà Nội",
            "month_detected": 10,
            "season_theme": "Mùa thu Hà Nội",
            "concept_tags": ["Áo dài trắng", "Xe hoa", "Nàng thơ", "Nắng xiên"],
            "status_note": "Nhiều xe hoa và nắng đẹp tầm 8-9h sáng",
            "camera_params": "Sony A7IV + FE 85mm f/1.4 GM",
            "confidence_score": 0.96,
            "geo_resolved": HANOI_LANDMARK_ALIASES["phan đình phùng"],
            "lat": 21.0396,
            "lng": 105.8396,
            "address": "Đường Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội"
        }
        print(json.dumps(mock_result, ensure_ascii=False, indent=2))
    else:
        result = analyze_post_with_openrouter(sample_text)
        print(json.dumps(result, ensure_ascii=False, indent=2))
