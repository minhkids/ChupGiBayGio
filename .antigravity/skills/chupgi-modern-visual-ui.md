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
