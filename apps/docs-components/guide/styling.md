# Styling contract

The libraries add **no CSS, no class names and no inline visual styles**. Everything visual is yours.

## Functional CSS you must apply yourself

Two things need CSS to function, so they are exported as constants you spread yourself (web):

```tsx
import { reelContainerStyle, reelItemStyle } from "media-ui-react";

<div {...reel.getContainerProps()} style={{ ...reelContainerStyle, height: "100%" }}>
  <section {...reel.getItemProps(i)} style={{ ...reelItemStyle, height: "100%" }} />
</div>
```

`reelContainerStyle` sets `overflow-y: auto`, `scroll-snap-type: y mandatory` and `overscroll-behavior: contain`; `reelItemStyle` sets `scroll-snap-align: start` and `scroll-snap-stop: always`. The container needs a definite height and each slide must be as tall as the container.

On native, `useReelSwiper().getItemProps(index)` returns `style: { height }` (one slide per page); this is layout, not visual styling.

## Focus styles are your job

Because nothing is styled, nothing shows keyboard focus until you add it:

```css
[data-grid-item]:focus-visible,
button:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
```

## Hooks into your CSS

Getters add data attributes you can target: `data-grid-item`, `data-index`, `data-grid-sentinel` (grid) and `data-active="true" | "false"` (reel slides).
