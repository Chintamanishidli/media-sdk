---
name: media-ui-components
description: Use when building or changing UI that displays media in this repo - the grid, lightbox, or reel (vertical video pager) - with media-ui-react. Covers the prop-getter contract, the no-styles rule, keyboard and focus behaviour, and accessibility. Do NOT use for fetching or tracking data (see media-data-wiring).
---

# Using `media-ui-react`

`media-ui-react` is **headless**: it ships behaviour, never markup or styles. You supply the elements and CSS; the hooks supply props.

## Hard rules

1. Import only from `"media-ui-react"` (and React). The library knows nothing about Pexels, the SDK or `MediaItem`: it takes plain data and callbacks. Do not add `media-react`/`media-core` imports **inside** `packages/media-ui-react` (`pnpm check:boundaries` fails).
2. **No styles in the library, ever.** No `className`, `style` or CSS files inside `packages/media-ui-react`. All styling lives in the app (`apps/app/src/styles.css`).
3. Never reimplement what a hook already does: infinite-scroll observers, Esc/arrow handling, focus trapping, body-scroll locking, focus restoration, snap-active detection, arrow-key navigation between cells.
4. Only the app wires data into these hooks. Components receive `items` and callbacks as arguments.

## The prop-getter contract

Each hook returns `getXProps()` functions. **Spread them onto your element**; they contain the `ref`, ARIA roles and event handlers.

```tsx
<div {...grid.getContainerProps()} className="grid">
```

- Put `key` on the element yourself (getters never return it).
- Spread the getter **first**, then add your own props. If you need your own `onClick`/`onKeyDown` on the same element, call the getter's handler inside yours; do not overwrite it.
- Don't replace a getter's `ref` with your own. If you need the element, wrap it in an inner element.

## `useGrid<T>`

```tsx
const grid = useGrid<MediaItem>({
  items, hasMore, isLoadingMore, onLoadMore: loadMore,
  onSelect: (_item, i) => setOpen(i), getLabel: (it) => it.title,
});
```
- Container: `{...grid.getContainerProps()}`. Cells: `{...grid.getItemProps(item, i)}` (they become `role="button"`, focusable, Enter/Space select, arrows/Home/End move focus).
- Render `<div {...grid.getSentinelProps()} />` **after** the cells, always while `hasMore`. That is the infinite-scroll trigger.
- Offer `<button {...grid.getLoadMoreButtonProps()}>Load more</button>` as the fallback (it hides itself when `!hasMore`).
- Cells must not contain other interactive elements (no nested buttons/links). Use `alt=""` on the `<img>` because the cell's `aria-label` (from `getLabel`) names it.
- Layout is yours (CSS columns, grid, flex). Arrow keys follow DOM order, not columns.

## `useLightbox`

```tsx
const lb = useLightbox({ index, count: items.length, onIndexChange: setIndex, onClose: () => setIndex(null), label: "Photo viewer" });
if (!lb.isOpen) return null;
```
- **You own the state**: `index: number | null` (`null` = closed). Don't add a separate `isOpen` boolean.
- Structure: backdrop element with `getBackdropProps()` (click-outside closes) containing the dialog element with `getDialogProps()` (role, `aria-modal`, ref, `tabIndex=-1`).
- Put **all** controls inside the dialog (`getCloseButtonProps`, `getPrevButtonProps`, `getNextButtonProps`) or the focus trap will skip them.
- Do not add your own Escape/Arrow listeners, `document.body.style.overflow` handling, or focus restore. The hook does all of it; focus returns to the element that was focused when it opened, so the trigger must be focusable (grid cells already are).
- Give the image meaningful `alt` (`item.title`). Optional `loop: true` wraps around.

## `useReelSwiper`

```tsx
const reel = useReelSwiper({ count: items.length, initialIndex: start, onActiveChange: (i) => { /* track, prefetch */ } });
<div {...reel.getContainerProps()} style={reelContainerStyle}>
  {items.map((it, i) => <section key={it.id} {...reel.getItemProps(i)} style={reelItemStyle}>…</section>)}
</div>
```
- `reelContainerStyle` / `reelItemStyle` are **functional CSS** (scroll-snap) the library exports but does not apply. You must spread them, give the container a definite height (`height: 100%` inside a fixed full-screen parent, or `100dvh`) and each slide `height: 100%`. Without that nothing snaps.
- Play only the slide where `i === reel.activeIndex`; pause the rest. Videos must be `muted` + `playsInline` or autoplay is blocked. Never autoplay with sound.
- Use `onActiveChange` for side effects (tracking, loading the next page near the end), not a scroll listener.
- Keyboard (ArrowUp/Down, PageUp/Down, Home/End) is built in; add a visible Close button and an Escape handler **yourself**, since the reel is not a dialog.

## Accessibility checklist (the library gives you roles; you give the rest)

- Add a visible `:focus-visible` style for grid cells, close/prev/next buttons and the reel container. The library ships no CSS, so there is no focus ring unless you write one.
- Every `<img>` has correct `alt` (decorative = `alt=""`); icon-only buttons keep the `aria-label` from their getter.
- Don't put `role`, `tabIndex` or `aria-*` on a spread element that contradicts the getter.
- Don't wrap any of this in a `<form>`.

## Before you finish

Run `pnpm verify`, then try by keyboard only: Tab to a cell → Enter opens the lightbox → Tab stays inside → Esc closes and focus returns to the same cell.
