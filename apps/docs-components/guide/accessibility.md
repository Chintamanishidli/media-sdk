# Accessibility

The hooks provide roles, keyboard handling and focus management. You provide names, alt text and visible focus.

| Concern | Provided by the hooks | You provide |
|---|---|---|
| Grid cells | `role="button"`, `tabIndex=0`, Enter/Space select, arrows/Home/End move focus | `getLabel` (accessible name), `alt=""` on the image, focus style |
| Lightbox | `role="dialog"`, `aria-modal`, focus moved in, Tab trapped, Esc and arrows, body scroll lock, focus restored | `label`, image `alt`, visible buttons, focus style |
| Reel | `role="region"` carousel, slides labelled "n of N", arrow/Page/Home/End keys | A visible Close button and Escape handler (it is not a dialog), `muted` + `playsInline` on videos |
| Native | `accessibilityRole`, `accessibilityLabel`, modal semantics, Android back button | Labels for your own content |

## Checklist

1. Tab to a grid cell, press Enter: the lightbox opens and focus is inside it.
2. Tab and Shift+Tab stay inside the lightbox.
3. Esc closes it and focus returns to the same cell.
4. Every focusable element has a visible focus style.
5. Grid cells contain no other buttons or links.
6. Videos never autoplay with sound.

Arrow-key navigation in the grid follows DOM order, not visual columns.
