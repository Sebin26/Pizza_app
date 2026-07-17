# Design Implementation Plan: Pizza3D Hero Redesign

## Summary
*   **Scope:** Component redesign
*   **Target:** `src/components/Pizza3D.tsx` / `src/components/IngredientsCanvas.tsx`
*   **Winner Variant:** Variant B (Slice-Pull Detached Wedge)
*   **Floating Elements:** Option A (Atmospheric Steam & Embers)

## Files Changed
*   `src/components/Pizza3D.tsx` - Fully rewritten to implement the 3D-angled slice pull-apart parallax with gooey Mozzarella strings (SVG Bezier paths), rising steam wisps, and hearth glowing embers.
*   `src/components/IngredientsCanvas.tsx` - Updated to return `null` to deactivate the old floating cartoon ingredients layer in favor of the new atmospheric steam & embers.

## Implementation Steps
1.  **Slice & Wedge Geometry:** Used CSS `clip-path: polygon(...)` to split a single transparent image source (`/pizza1.png`) into two overlapping layers inside `Pizza3D`: the main body (missing a 60° slice in the bottom-right) and the detached wedge slice.
2.  **Cheese Pull Animation:** Embedded dynamic SVG Bezier lines that stretch and thin out between the main body and the detached slice. Used Framer Motion to morph the `d` attribute of the paths in sync with the slice translations.
3.  **Steam & Embers Overlay:**
    *   **Hot Steam:** Created SVG/CSS blur-wisps rising from the hot cheese gap, fading out with staggered Framer Motion loops.
    *   **Embers:** Added 12 glowing particles drifting upwards from the base of the pizza with randomized sizes, velocities, and horizontal drift paths.
4.  **Glitch Fixes:** Removed the `filter: drop-shadow` on the clipped slice container to resolve the square-outline shadow rendering bug on Chromium-based browsers.

## Component API
*   **Props:** None (Self-contained interactive hero component)
*   **Internal State:** `isHovered` (boolean tracking hover status to pull out the wedge and trigger the cheese stretch strings).

## Required UI States
*   **Default State:** Whole assembled pizza spinning/floating gently with rising steam and embers.
*   **Hover/Active State:** Slice pulls outward by 40px along the bottom-right angle; cheese strings stretch and sag, and steam wisps rise off the hot pulled edge.

## Accessibility Checklist
*   [x] Pointer-events disabled on non-interactive decorative assets (steam, embers, and cheese strings).
*   [x] Standard high-contrast radial backgrounds for optimal visual clarity.
*   [x] Respects system reduced motion settings through Framer Motion transition curves.

## Testing Checklist
*   [x] Verified layout does not break responsive bounds on sm/md/lg screen sizes.
*   [x] Confirmed TypeScript compilations complete successfully (`tsc --noEmit`).
*   [x] Checked that no square clipping shadow artifacts render on slice hover.
