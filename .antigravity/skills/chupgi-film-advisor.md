---
name: chupgi-film-advisor
description: Rule-based recommendation engine matching film stocks (35mm/120) with locations, lighting conditions, and seasons.
---

# Film Photography Advisor Engine Rules

## 1. Recommendation Matching Logic
When matching a film stock to a location and season:
- **Sunny Autumn (Months 9-11):** Recommend Kodak Gold 200, ColorPlus 200, or Portra 160/400 (Warm golden hues, rich skin tones).
- **Overcast Winter / White Flowers (Months 11-1):** Recommend Fujifilm 200/400 (Cool shadows, clean greens, vivid white preservation) or Ilford HP5 / Kodak Tri-X 400 (High-contrast B&W).
- **Night Street / Neon / Lanterns (Lantern season & Dec):** Recommend CineStill 800T or Lomography 800 (Halation effect, high sensitivity).
- **Harsh Summer Sun / Lotus (Months 5-8):** Recommend Kodak Ektar 100 or CineStill 50D (Ultra-fine grain, saturated vivid colors).

## 2. Component Output Specs
- Every spot detail panel MUST render a `FilmSpecsCard`:
  - Film Name and Brand.
  - ISO Badge (e.g., `ISO 200`).
  - Recommended aperture/shutter speed tip.
  - One-line rationale on why this film matches the location's current lighting.
- Filter Bar Extension: Allow filtering spots by `film_id` to answer the user intent: "Where should I shoot with my current roll of film?".
