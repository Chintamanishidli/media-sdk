# Reel Swiper

A vertical, one-item-per-screen pager that reports which item is active.

## Web: `useReelSwiper`

```tsx
import { useReelSwiper, reelContainerStyle, reelItemStyle } from "media-ui-react";

const reel = useReelSwiper({
  count: items.length,
  initialIndex: start,
  onActiveChange: (i) => { track(items[i]); if (i >= items.length - 3) loadMore(); },
});

<div {...reel.getContainerProps()} style={{ ...reelContainerStyle, height: "100dvh" }}>
  {items.map((item, i) => (
    <section key={item.id} {...reel.getItemProps(i)} style={{ ...reelItemStyle, height: "100%" }}>
      <video src={item.videoUrl} muted loop playsInline ref={/* play only when i === reel.activeIndex */ undefined} />
    </section>
  ))}
</div>
```

| Option | Type | Default |
|---|---|---|
| `count` | `number` | required |
| `initialIndex` | `number` | `0` |
| `onActiveChange` | `(i: number) => void` | |
| `threshold` | `number` (fraction visible) | `0.6` |
| `label` | `string` | `"Reels"` |

Returns `activeIndex`, `scrollTo(index)`, `getContainerProps()` and `getItemProps(index)`. Keyboard: ArrowUp/Down, PageUp/Down, Home, End. Active detection uses an `IntersectionObserver` rooted at the container.

Slides get `data-active="true"` or `"false"`. Play only the active video and pause the others; keep videos `muted` and `playsInline` so autoplay is allowed. The reel is not a dialog, so add your own visible Close button and Escape handling when you present it full screen.

## Native: `useReelSwiper`

```tsx
const reel = useReelSwiper({ items, getKey: (i) => i.id, initialIndex: start, onActiveChange });

<FlatList {...reel.getListProps()} style={{ flex: 1 }} renderItem={({ item, index }) => (
  <View {...reel.getItemProps(index)}><Video paused={index !== reel.activeIndex} source={{ uri: item.videoUrl }} /></View>
)} />
```

Built on `FlatList` paging. The list measures itself with `onLayout`, so give it a definite height (for example `flex: 1` in a full-screen parent). Active detection uses viewability with a default threshold of 60 percent (`viewabilityThreshold`). `getItemProps(index).style` is `{ height }`: one slide per page.
