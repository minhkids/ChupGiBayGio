# CHUPGIBAYGIO.COM - BẢN ĐẶC TẢ THIẾT KẾ HIỆN ĐẠI (SLEEK VISUAL-FIRST SPEC)

## 1. Triết lý Thiết kế: Modern Curated Aesthetic

Loại bỏ hoàn toàn phong cách báo in retro, viền đen dày đóng hộp và thước đo cơ học rối mắt. Website chuyển dịch sang trải nghiệm thị giác cao cấp (lai giữa sự tinh giản của Airbnb và chất nghệ thuật của VSCO/Apple).

### Ma trận Thay đổi Cốt lõi
* **Bỏ Boxy Borders:** Không dùng `border-2 border-black` đóng khung mọi phần tử. Dùng viền siêu mảnh `border border-neutral-200/80 dark:border-neutral-800` hoặc dựa vào phân tầng độ tương phản nền.
* **Bỏ Thước xoay Mili:** Thay thước đo vạch chia cơ học bằng **Floating Month Dock** (thanh trượt viên thuốc lơ lửng, chuyển động lò xo mượt).
* **Bản đồ Tinh giản:** Mapbox Light/Carto Positron khử bão hòa (desaturated), biến bản đồ thành phông nền sạch sẽ để các Pin địa điểm nổi bật.
* **Typography Hiện đại:** 
  * Font chính (UI & Headings): **Plus Jakarta Sans** hoặc **Geist**.
  * Font phụ (Thông số, Metadata): **Geist Mono** hoặc **Space Grotesk** cỡ chữ nhỏ tinh tế.

---

## 2. Hệ Thống Token Màu Sắc & Hiệu Ứng (Tailwind Tokens)

```css
/* Light Mode */
--bg-canvas: #FAFAFA;
--bg-surface: #FFFFFF;
--accent-amber: #F59E0B;
--accent-terracotta: #E05A47;
--text-primary: #171717;
--text-secondary: #737373;

/* Glassmorphism */
--glass-card: rgba(255, 255, 255, 0.75);
--glass-border: rgba(0, 0, 0, 0.06);
--glass-blur: blur(16px);
```

---

## 3. Kiến Trúc Bố Cục Màn Hình (Split-Screen 40 / 60)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] CHỤP GÌ BÂY GIỜ    [ 🔍 Tìm địa điểm, concept... ]    [Hà Nội ▾] [Tài khoản]│
├─────────────────────────────────────────────────────────────────────────────┤
│   (Tất cả)  [ T.01 ]  [ T.02 ] ... [✦ T.10 (Mùa Cúc Họa Mi)] ... [ T.12 ]   │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ FEED BÀI VIẾT & SPOT (40% width)  │ BẢN ĐỒ MAPBOX CỐ ĐỊNH (60% width)       │
│ - Cuộn mượt độc lập               │ - Vị trí: Ba Đình / Phan Đình Phùng     │
│ - Card ảnh tỷ lệ 4:5 tràn viền    │ - Style: Light Minimalist Canvas        │
│ - Tag kính mờ (Frosted glass)     │ - Marker phát sáng khi hover vào Card   │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 4. Mã Nguồn Component Chính

### 4.1. Thanh Chọn Tháng Dạng Capsule Lơ Lửng (`ModernMonthDock.tsx`)

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONTH_DATA = [
  { id: 1, name: 'Tháng 1', theme: 'Đào mai & Tết' },
  { id: 2, name: 'Tháng 2', theme: 'Hoa ban' },
  { id: 9, name: 'Tháng 9', theme: 'Đầu thu' },
  { id: 10, name: 'Tháng 10', theme: 'Mùa thu & Cúc họa mi', isCurrent: true, count: 28 },
  { id: 11, name: 'Tháng 11', theme: 'Mùa lau bãi sông' },
  { id: 12, name: 'Tháng 12', theme: 'Giáng sinh phố đi bộ' },
];

export const ModernMonthDock = () => {
  const [activeMonth, setActiveMonth] = useState(10);

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/75 dark:bg-neutral-900/75 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {MONTH_DATA.map((m) => {
            const isSelected = activeMonth === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMonth(m.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isSelected ? 'text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeMonthCapsule"
                    className="absolute inset-0 bg-neutral-950 dark:bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                
                <span className={`relative z-10 ${isSelected ? 'dark:text-neutral-950 font-semibold' : ''}`}>
                  {m.name}
                </span>

                {m.isCurrent && (
                  <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-rose-500'}`} />
                )}

                {m.count && (
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white dark:bg-black/10 dark:text-neutral-900' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {m.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 transition-colors">
          <span>Lọc concept</span>
        </button>
      </div>
    </nav>
  );
};
```

---

### 4.2. Card Địa Điểm Thị Giác Cao (`ModernSpotCard.tsx`)

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SpotCardProps {
  name: string;
  location: string;
  theme: string;
  imageUrl: string;
  bestTime: string;
  palette: string[];
  statusTag: string;
}

export const ModernSpotCard: React.FC<SpotCardProps> = ({
  name,
  location,
  theme,
  imageUrl,
  bestTime,
  palette,
  statusTag,
}) => {
  return (
    <motion.article 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer"
    >
      {/* Khung ảnh tỷ lệ 4:5 tràn viền */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Badge trạng thái kính mờ */}
        <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {statusTag}
        </div>

        {/* Bảng màu trang phục gợi ý */}
        <div className="absolute bottom-3.5 right-3.5 backdrop-blur-md bg-black/40 px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/10">
          <span className="text-[10px] text-white/70 mr-1 font-mono">Palette</span>
          {palette.map((color, idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-white/40"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Nội dung thông tin tối giản */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>{location}</span>
          <span>{bestTime}</span>
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-neutral-500 line-clamp-1">{theme}</p>
      </div>
    </motion.article>
  );
};
```

---

## 5. Skill Nạp Trực Tiếp Vào Antigravity (`chupgi-modern-visual-ui.md`)

Lưu đoạn bên dưới vào thư mục skill/agent của bạn:

```markdown
---
name: chupgi-modern-visual-ui
description: UI/UX design rules for ChupGiBayGio enforcing a modern, sleek, visual-first aesthetic and avoiding boxy vintage layouts.
---

# Modern Visual-First UI Rules

## 1. Visual Hierarchy & Borders
- NEVER use heavy black borders (`border-2 border-black`) around cards, inputs, or headers.
- Always use subtle dividers: `border border-neutral-200/80 dark:border-neutral-800`.
- Cards must use large corner radiuses: `rounded-2xl` or `rounded-3xl`.
- Photo containers must default to camera portrait aspect ratios (`aspect-[4/5]` or `aspect-[3/4]`).

## 2. Typography Rules
- Font Family: Use modern Geometric Sans-Serif (`Plus Jakarta Sans` or `Geist`).
- Typography Scale:
  - Spot Titles: `font-semibold text-neutral-900 tracking-tight`.
  - Metadata / Exposure / Golden Hour: `font-mono text-xs text-neutral-400`.
  - Strictly avoid generic serif titles or harsh italic headlines.

## 3. Map Viewport & Component Interactions
- Mapbox Canvas must be desaturated (Mapbox Light/Positron style).
- Month Filter must be a floating capsule pill dock (`ModernMonthDock`) with animated spring transitions (`layoutId="activeMonthCapsule"`).
- Status badges must use backdrop-blur glass styling (`backdrop-blur-md bg-black/40 text-white`).
```
