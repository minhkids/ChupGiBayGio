# TÀI LIỆU DỰ ÁN TOÀN DIỆN: CHUPGIBAYGIO.COM
> Nền tảng tra cứu, bản đồ hóa địa điểm check-in & chụp ảnh theo mùa, thời gian thực và xu hướng (hot trend).

---

## MỤC LỤC
1. [Tầm nhìn & Định vị Sản phẩm](#1-tầm-nhìn--định-vị-sản-phẩm)
2. [Lộ trình Triển khai (Roadmap)](#2-lộ-trình-triển-khai-roadmap)
3. [Kiến trúc Tính năng Chi tiết](#3-kiến-trúc-tính-năng-chi-tiết)
4. [Nguyên tắc Thiết kế Anti-AI (Editorial Aesthetic)](#4-nguyên-tắc-thiết-kế-anti-ai-editorial-aesthetic)
5. [Cơ sở Dữ liệu & Script SQL PostGIS](#5-cơ-sở-dữ-liệu--script-sql-postgis)
6. [Tập Skill nạp cho Agent (Antigravity System Skills)](#6-tập-skill-nạp-cho-agent-antigravity-system-skills)

---

## 1. TẦM NHÌN & ĐỊNH VỊ SẢN PHẨM

### 1.1. Vấn đề của người dùng (Pain Points)
- **Thiếu tính thời vụ:** Nhiều địa điểm chỉ đẹp trong 1–3 tuần ngắn ngủi (mùa cúc họa mi, mùa hoa dã quỳ, mùa lá bàng thay màu, trang trí Giáng Sinh/Tết). Người chụp thường đến khi hoa đã tàn hoặc decor đã tháo dỡ.
- **Phân mảnh cảm hứng:** Tìm ý tưởng chụp ảnh thường phải lướt rời rạc qua Threads, TikTok, Instagram và Google Maps mà không có sự liên kết trực tiếp giữa *Góc chụp*, *Dáng chụp (Pose)*, *Tone màu (Preset)* và *Tọa độ chính xác*.
- **Thiếu thông tin thực tế cho nhiếp ảnh:** Giờ nắng đẹp nhất (Golden hour), hướng sáng, phí mang máy cơ, phí gửi xe thường không được ghi rõ.

### 1.2. Giải pháp từ Chụp Gì Bây Giờ
Một bản đồ thông minh (Geo-Seasonal Visual Directory) giúp trả lời 3 câu hỏi ngay lập tức:
1. **Bây giờ đang chụp cái gì đẹp nhất?** (Theo tháng, tuần, mùa).
2. **Chụp ở đâu gần tôi nhất?** (Bản đồ tương tác PostGIS).
3. **Mặc gì, tạo dáng thế nào, dùng tone màu gì?** (Moodboard & lookbook gắn liền tọa độ).

---

## 2. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

### Giai đoạn 1: MVP Core (4 tuần)
- Thiết lập hạ tầng: Next.js 14+ (App Router), PostgreSQL + PostGIS, Mapbox GL JS / MapLibre.
- Dữ liệu ban đầu (Seed Data): 100 điểm chụp tiêu biểu tại Hà Nội & TP.HCM được phân loại theo 12 tháng.
- Tính năng: Bản đồ lọc theo Tháng, Concept, Tọa độ GPS người dùng; Trang chi tiết địa điểm tích hợp Embed TikTok/Instagram.

### Giai đoạn 2: Social & Crowdsourcing (4 tuần)
- Hệ thống User & Creator Profile (dành cho Photographer, Model, Content Creator).
- Đóng góp cộng đồng: Báo cáo trạng thái trực tiếp ("Hôm nay hoa nở bao nhiêu %?", "Có đông không?").
- Form đề xuất địa điểm mới kèm cơ chế duyệt (Admin Review Dashboard).

### Giai đoạn 3: Hệ sinh thái & Doanh thu (3 tuần)
- Dịch vụ tài trợ: Sticky listing / Featured pin cho Studio, Phim trường, Café chụp ảnh.
- Nút đặt lịch chụp ("Book thợ ảnh chụp tại đây"): Kết nối người dùng với Photographer chuyên chụp tại địa điểm đó.
- Affiliate marketing: Thuê trang phục (Áo dài, Hanbok, Vintage), Preset màu Lightroom.

---

## 3. KIẾN TRÚC TÍNH NĂNG CHI TIẾT

### 3.1. Bản đồ tương tác & Bộ lọc thời vụ (Interactive Map)
- **Ghim đa trạng thái (Marker State):**
  - `PEAK`: Đang trong tuần nở rộ hoặc trang trí đẹp nhất.
  - `ACTIVE`: Điểm chụp quanh năm (Bảo tàng, Cầu, Công viên, Phố cổ).
  - `ENDING_SOON`: Sắp hết mùa (dưới 5 ngày còn lại).
- **Bộ lọc đa tầng:**
  - *Thời gian:* Chọn tháng (1–12), chọn mùa (Xuân, Hạ, Thu, Đông, Lễ hội).
  - *Khung giờ:* Bình minh (5:30 - 7:00), Hoàng hôn (16:30 - 18:00), Đêm (Flash / Ánh sáng nhân tạo).
  - *Concept:* Tự nhiên / Hoa cỏ, Cổ điển / Retro / Film, Tối giản / Modern Minimal, Cyberpunk / Đường phố.
  - *Chi phí:* Hoàn toàn miễn phí, Có vé vào cổng, Tính phí thêm cho máy ảnh cơ.

### 3.2. Hồ sơ địa điểm (Spot Detail Profile)
- **Header thông số nhiếp ảnh:** Tọa độ GPS, hướng mặt trời mọc/lặn, độ đông đúc theo khung giờ.
- **Thước đo thời vụ (Seasonality Gauge):** Biểu đồ thể hiện tuần nào trong năm địa điểm đạt vẻ đẹp tối đa.
- **Lookbook gợi ý:**
  - Palette màu trang phục nên mặc để nổi bật trên nền bối cảnh.
  - Gợi ý ống kính (Lens) phù hợp: 35mm (toàn cảnh môi trường), 85mm (chân dung xóa phông).
  - Khung nhúng bài đăng từ Instagram/TikTok minh họa góc chụp chuẩn.

---

## 4. NGUYÊN TẮC THIẾT KẾ ANTI-AI (EDITORIAL AESTHETIC)

Website nhiếp ảnh cần toát lên vẻ đẹp thủ công, tinh tế của một tạp chí ảnh in độc lập (Photo Zine), kiên quyết tránh các khuôn mẫu giao diện do AI tự động tạo ra.

### 4.1. Phân biệt Thiết kế AI vs. Thiết kế Editorial Tự Nhiên

| Yếu tố | AI Cliché Thường Gặp (CẦN TRÁNH) | Phong cách Editorial Tự Nhiên (ÁP DỤNG) |
| :--- | :--- | :--- |
| **Typography** | Inter, Roboto, Helvetica không cảm xúc. | Kết hợp font Serif cổ điển (`Playfair Display`, `Newsreader`) với Sans cá tính (`Be Vietnam Pro`). |
| **Hình khối** | Bo góc tròn xoe dạng viên thuốc (`rounded-full`, `rounded-3xl`). | Bo góc tối giản hoặc vuông góc dứt khoát (`rounded-none` hoặc `rounded-sm`). |
| **Độ bóng / Viền** | Đổ bóng mờ mịt (`shadow-2xl`, blur lớn) phủ khắp card. | Viền mảnh sắc nét (`border border-stone-200 dark:border-stone-800`), bóng đổ cứng (`box-shadow: 2px 2px 0px black`). |
| **Bảng màu** | Gradient tím-hồng-xanh neon kiểu Web3/SaaS công nghệ. | Màu giấy in ngà ấm (`#F9F8F6`), màu film hoài cổ: Đất nung (`#C85A32`), Vàng hổ phách (`#E09F3E`), Xanh rêu đá. |
| **Bố cục lưới** | Các thẻ card đều tăm tắp, cứng nhắc. | Lưới Masonry so le theo đúng tỷ lệ ảnh máy ảnh: 3:2, 4:3, 4:5. |
| **Chi tiết vi mô** | Icon rực rỡ, icon 3D bóng bẩy. | Dấu chữ thập ngắm máy ảnh (`+`), tem đánh dấu (stamp), tọa độ kinh độ/vĩ độ dạng chữ nhỏ. |

### 4.2. Cấu hình Tailwind CSS mẫu
```javascript
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FBF9F5',
          warm: '#F4EFE6',
          dark: '#141413',
        },
        terracotta: '#C85A32',
        amberFilm: '#E09F3E',
        slateInk: '#1C1D1F'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace']
      }
    }
  }
}
```

---

## 5. CƠ SỞ DỮ LIỆU & SCRIPT SQL POSTGIS

File script chuẩn hóa hệ thống bảng dữ liệu, chỉ mục không gian và hàm truy vấn tìm kiếm địa điểm theo bán kính và tháng chụp.

```sql
-- Kích hoạt extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. BẢNG DANH MỤC THÀNH PHỐ / VÙNG
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    center_geom GEOGRAPHY(Point, 4326) NOT NULL
);

-- 2. BẢNG ĐỊA ĐIỂM CHỤP ẢNH (LOCATIONS)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id INT REFERENCES regions(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    geom GEOGRAPHY(Point, 4326) NOT NULL, -- Tọa độ không gian (kinh độ, vĩ độ)
    
    -- Thông tin chụp ảnh thực tế
    best_time_of_day VARCHAR(50), -- 'GOLDEN_HOUR_MORNING', 'SUNSET', 'NIGHT'
    lighting_notes TEXT,          -- Hướng nắng, bối cảnh sáng
    cost_type VARCHAR(50) DEFAULT 'FREE', -- 'FREE', 'TICKET', 'COMMERCIAL_FEE'
    ticket_price_range VARCHAR(100),
    camera_fee_policy TEXT,       -- Có phụ thu máy cơ hay không
    recommended_lenses TEXT[],    -- Ví dụ: ARRAY['35mm', '50mm', '85mm']
    recommended_outfits TEXT[],   -- Tone màu trang phục nên mặc
    
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ mục không gian GiST để tăng tốc truy vấn vị trí
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);

-- 3. BẢNG MÙA VÀ XU HƯỚNG THEO THÁNG (SEASONAL_TRENDS)
CREATE TABLE IF NOT EXISTS seasonal_trends (
    id SERIAL PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    trend_title VARCHAR(255) NOT NULL, -- Ví dụ: "Mùa Cúc Họa Mi", "Giáng Sinh Phố Hàng Mã"
    start_month SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    end_month SMALLINT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
    peak_start_week SMALLINT CHECK (peak_start_week BETWEEN 1 AND 52),
    peak_end_week SMALLINT CHECK (peak_end_week BETWEEN 1 AND 52),
    
    concept_tags TEXT[], -- ARRAY['VINTAGE', 'NANG_THO', 'AO_DAI', 'FILM']
    is_trending BOOLEAN DEFAULT FALSE,
    trend_score INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_seasonal_months ON seasonal_trends(start_month, end_month);

-- 4. BẢNG BÀI POST TRUYỀN CẢM HỨNG (INSPIRATION_POSTS)
CREATE TABLE IF NOT EXISTS inspiration_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL, -- 'TIKTOK', 'INSTAGRAM', 'USER_UPLOAD'
    embed_url TEXT NOT NULL,
    thumbnail_url TEXT,
    author_name VARCHAR(100),
    author_url TEXT,
    caption TEXT,
    palette_hex VARCHAR(7)[], -- Bảng mã màu ảnh mẫu: ARRAY['#C85A32', '#F4EFE6']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspo_location ON inspiration_posts(location_id);

-- 5. FUNCTION: TÌM KIẾM ĐỊA ĐIỂM CHỤP THEO BÁN KÍNH VÀ THÁNG TRONG NĂM
CREATE OR REPLACE FUNCTION get_seasonal_spots_nearby(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION,
    filter_month INT
)
RETURNS TABLE (
    location_id UUID,
    location_name VARCHAR,
    slug VARCHAR,
    distance_meters DOUBLE PRECISION,
    trend_title VARCHAR,
    concept_tags TEXT[],
    is_trending BOOLEAN,
    best_time_of_day VARCHAR,
    cover_image_url TEXT
) 
LANGUAGE sql STABLE
AS $$
    SELECT 
        l.id AS location_id,
        l.name AS location_name,
        l.slug,
        ST_Distance(l.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) AS distance_meters,
        st.trend_title,
        st.concept_tags,
        st.is_trending,
        l.best_time_of_day,
        l.cover_image_url
    FROM locations l
    JOIN seasonal_trends st ON l.id = st.location_id
    WHERE l.is_active = TRUE
      -- Xử lý điều kiện tháng (bao gồm cả trường hợp mùa vắt qua năm mới như tháng 12 - tháng 2)
      AND (
          (st.start_month <= st.end_month AND filter_month BETWEEN st.start_month AND st.end_month)
          OR
          (st.start_month > st.end_month AND (filter_month >= st.start_month OR filter_month <= st.end_month))
      )
      -- Điều kiện cự ly không gian bằng PostGIS
      AND ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    ORDER BY 
        st.is_trending DESC,
        distance_meters ASC;
$$;
```

---

## 6. TẬP SKILL NẠP CHO AGENT (ANTIGRAVITY SYSTEM SKILLS)

Tạo các file sau trong thư mục `.antigravity/skills/` hoặc thư mục cấu hình prompt của bạn:

### Skill 1: `anti-ai-design-system.md`
```markdown
---
name: anti-ai-design-system
description: Rules and tokens to enforce human-crafted, editorial, and photography-focused styling.
---

# Design System Directives: Anti-AI Styling

## Typography Constraints
1. Primary Headings (H1, H2, H3): Strictly use `Playfair Display`, `Newsreader`, or high-contrast editorial Serifs.
2. Body & UI Controls: Use `Be Vietnam Pro` (optimally kerned for Vietnamese) or clean grotesques.
3. Metadata & Specs (Focal length, coordinates, aperture, dates): Use `Space Grotesk` or monospace fonts.
4. FORBIDDEN: Default Inter, Roboto, Arial, or uncustomized system fonts.

## Palette & Texture
- Background: Warm newsprint/linen off-white `#FBF9F5` (Light), Mineral charcoal `#141413` (Dark).
- Accents: Terracotta `#C85A32`, Film Amber `#E09F3E`, Olive `#4A5844`.
- FORBIDDEN: Generic purple/blue SaaS gradients, neon glows, over-saturated primary buttons.

## Layout & Border Geometry
- Replace blurred shadows (`shadow-lg`, `shadow-xl`) with crisp, high-density 1px borders: `border border-stone-200 dark:border-stone-800`.
- Use camera UI accents: crosshair reticles (`+`), thin rules, letterboxed photo cards (aspect ratios: 3:2, 4:5, 1:1).
```

### Skill 2: `photography-geo-backend.md`
```markdown
---
name: photography-geo-backend
description: Standards for spatial PostGIS queries, media embed handlers, and seasonal ranking algorithms.
---

# Backend & Spatial Engineering Standards

## 1. PostGIS Query Rules
- Always use `geography(Point, 4326)` for global latitude/longitude calculations to ensure accurate meter-based distances.
- Always leverage the GiST index with `ST_DWithin` before computing exact distance with `ST_Distance`.

## 2. Seasonality Edge Cases
- When filtering by month, always handle boundary wrapping where a season starts in winter of year N and ends in spring of year N+1 (e.g., December through February: `start_month = 12`, `end_month = 2`).

## 3. Social Embed Efficiency
- Never render raw client-heavy tracking iframes on listing pages.
- Render lazy-loaded, sandboxed placeholders showing user avatar, platform badge (TikTok/IG), and lookbook palette until clicked.
```

---
*Tài liệu được thiết kế hoàn chỉnh để làm kim chỉ nam phát triển cho hệ thống chupgibaygio.com.*