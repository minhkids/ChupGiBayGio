---
name: chupgi-fluid-interactions
description: Engineering constraints for camera-inspired fluid animations, spring mechanics, and responsive UX micro-interactions.
---

# Front-end Animation & Micro-UX Skill

## 1. Performance & Rendering Guardrails
- **Strict Transform Rules:** ONLY animate `transform` (scale, translate) and `opacity`. NEVER animate CSS properties triggering layout shifts (`height`, `width`, `top`, `left`, `margin`, `padding`).
- **Hardware Acceleration:** Apply `will-change: transform` or `translateZ(0)` on scrolling lists, bottom sheets, and interactive map markers.
- **Accessibility:** Ensure all animations honor `prefers-reduced-motion`. Provide instantaneous fallbacks (`duration: 0`) when enabled.

## 2. Motion Language Constraints
- **Avoid Linear Easing:** Never use `ease-in-out` or linear timing for physical components. Use Spring physics (`damping: 28-32`, `stiffness: 350-420`).
- **No Over-bouncing:** Keep mass low (`mass: 0.8`) to avoid cartoonish, wobbly elastic effects. ChupGiBayGio is an editorial photography platform.

## 3. Signature UI Components Implementation
- **Focus Ring Picker:** Implement horizontal drag gesture with momentum decay and haptic feedback via `navigator.vibrate(8)` on threshold hit.
- **Viewfinder Hover:** Render 4 corner SVG accents on photo cards that interpolate inward by 2px on pointer hover (`transition: { duration: 0.2, ease: "easeOut" }`).
- **Shared Transitions:** Utilize Framer Motion's `layoutId` across thumbnail-to-modal expansions to maintain visual context without page jumps.
- **Bottom Drawer:** Use `@vaul/vaul` on mobile viewport breakpoints (<768px) with snap points `[0.15, 0.5, 0.9]`.
