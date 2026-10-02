---
name: chupgi-google-maps-ui
description: Design principles and layout guidelines for ChupGiBayGio following Google Maps UI paradigms.
---

# Google Maps-Style Layout Rules

## 1. Viewport & Canvas Layout
- The Map container MUST be full viewport (`w-screen h-screen absolute inset-0`).
- The center coordinate must default to Hanoi (`lat: 21.0378, lng: 105.8396`).
- Never split the page into rigid 50/50 static columns. All panels (Search, Feed, Detail) are FLOATING OVERLAYS with high z-index.

## 2. Floating Panels Hierarchy
- Search Bar: Floating pill on the top-left (`w-[392px] h-12 rounded-full shadow-md`).
- Primary Feed Sidebar: Floating card on the left (`w-[392px] top-20 bottom-4 rounded-2xl shadow-lg`). Must include a collapse toggle button `[‹ / ›]`.
- Detail Card: Slides out beside the sidebar (`left-[416px] w-[380px]`) with cover photo, Quick Action buttons (Chỉ đường, Lưu, Chia sẻ), and photography tips.

## 3. Responsive Adaptations
- On Desktop: Map is always visible behind floating cards.
- On Mobile: Map remains full screen; the Feed transforms into a Bottom Sheet (Drawer) that can swipe between 3 snaps (collapsed search bar, half-height peek, full-screen list).
