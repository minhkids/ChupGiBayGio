---
name: chupgibaygio-openrouter-geotag
description: Pipeline specifications for crawling social photography posts, analyzing them via OpenRouter API, and plotting onto Mapbox centered at Hanoi.
---

# Social Crawling & Geo-Tagging via OpenRouter

## 1. Map Coordinates & Viewport Rules
- The map canvas MUST remain mounted and permanently visible (split-screen on desktop, background canvas on mobile).
- Default center: Hanoi (`latitude: 21.0378, longitude: 105.8396`, default zoom: `13.5`).
- Fly-to interaction: When clicking a post card, smoothly trigger `map.flyTo()` to the resolved coordinate.

## 2. OpenRouter Integration Standards
- API Endpoint: `https://openrouter.ai/api/v1`.
- Primary Model: `openai/gpt-4o-mini` with fallback to `anthropic/claude-3.5-haiku`.
- Strict Output: Always use `response_format={"type": "json_object"}`.
- Quality Filter: Drop posts with `is_photo_spot: false` or `confidence_score < 0.8`.

## 3. Vietnamese Geocoding & Slang Normalization
- Map frequent photography aliases:
  - 'PĐP' / 'phan đình phùng' -> 'Đường Phan Đình Phùng, Ba Đình, Hà Nội'
  - 'cầu Long Biên' -> 'Cầu Long Biên, Hoàn Kiếm, Hà Nội'
  - 'bến Hàn Quốc' / 'hồ Tây' -> 'Bến Hàn Quốc, Tây Hồ, Hà Nội'
- Season extraction defaults:
  - Mention of "mùa thu", "cúc họa mi", "xe hoa" -> Assign month 9, 10, or 11.
  - Mention of "mùa hoa đào", "Tết" -> Assign month 1 or 2.
