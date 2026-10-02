---
name: chupgi-icon-motion-spec
description: Animated icon patterns, camera aperture loading spinners, and micro-interaction behaviors for ChupGiBayGio.
---

# Photography-Themed Icon & Loading Motion Rules

## 1. Loading States Philosophy
- NEVER use generic spinners (`border-t-transparent animate-spin`) or plain circular bars.
- Use `ApertureSpinner`: SVG rotating camera blades with breathing stroke dash for global map/data fetch.
- Use `AutofocusLoader`: Viewfinder brackets (`[+]`) with center AF-point blinking for card image skeletons.
- All loaders must display clean monospace status metadata (`font-mono text-[10px] tracking-wider text-neutral-400`).

## 2. Interactive Micro-Motions
- **Bookmark / Save:** Must use spring bounce (`stiffness: 500, damping: 15`) with a 1.3x scale pop when active.
- **Map Pins:** For locations with `is_peak: true`, render an animated ripple ring (`scale: [1, 2.2], opacity: [0.8, 0]`) pulsating at 2-second intervals.
- **Navbar Icons:** Left Rail navigation icons must have subtle translateY (`y: -2px`) on hover, never harsh color flashes.
