# Design Memory: Pizza App Hero Visual Redesign

## Brand Tone
*   **Adjectives:** Warm, appetizing, artisanal, wood-fired, premium.
*   **Aesthetic Style:** Cozy fireside colors (Brand Red, Brand Orange, Warm Cream), soft ambient glow, natural details like wood boards and soot-charred textures.
*   **Avoid:** Corporate flat designs, cartoonish/clipart-style icons, cold colors, or basic geometries.

## Layout & Spacing
*   **Perspective & Depth:** Prefer tilted 3D angles or layers over flat top-down views.
*   **Topping Placement:** Interactive elements should feel integrated rather than scattered loosely.

## Motion & Animations
*   **Springs:** Use spring transitions for physical movements (e.g. cheese pull stretch, slice glide) with high damping and moderate stiffness (e.g., stiffness 70-90, damping 12-14) to feel organic and rubbery.
*   **Particles:** Embers and sparks should float upwards with randomized delays, sizes, and ease-out curves.

## Design Tokens & Styling
*   **Color Tokens:** Use colors defined in `@theme` block in [globals.css](file:///mnt/HDD/Repositories/Pizza_app/src/app/globals.css):
    *   `--color-brand-red: #C62828`
    *   `--color-brand-orange: #F57C00`
    *   `--color-brand-dark: #1C1C1E`
    *   `--color-brand-cream: #FAF9F6`
*   **Accessibility:** Decorative SVG overlays must have `pointer-events-none` so they don't block hover triggers on structural components.

## Known Gotchas & Bugs
*   **Shadow Clipping Bug:** Applying CSS `filter: drop-shadow(...)` on a container that also has `clip-path` causes a rendering bug in Chromium browsers, resulting in a hard square shadow. Apply shadows only on unclipped images or elements, or remove the filter from the clipped wrapper.
