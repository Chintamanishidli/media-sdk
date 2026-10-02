# Media UI

Headless UI hooks for browsing media. They ship **behaviour, never markup or styles**: you render the elements and write the CSS, the hooks hand you the props.

| Component | Web (`media-ui-react`) | Native (`media-ui-native`) |
|---|---|---|
| [Grid](/components/grid) | `useGrid`: infinite scroll, keyboard navigation | `useGrid` for `FlatList` |
| [Lightbox](/components/lightbox) | `useLightbox`: focus trap, Esc/arrows, scroll lock | `useLightbox` for `Modal` |
| [Reel Swiper](/components/reel-swiper) | `useReelSwiper`: vertical snap, active detection | `useReelSwiper` for `FlatList` paging |

## Independent by design

These packages import **nothing** from the rest of the repo: no `media-core`, no wrappers. They take data and callbacks as props, so they work with any source of items, and they do not know the SDK or Pexels exist. The app is what connects the two.

```tsx
const feed = useMediaSearch({ query });              // from media-react
const grid = useGrid({ items: feed.items, hasMore: feed.hasMore, onLoadMore: feed.loadMore });  // from media-ui-react
```

Read [the headless pattern](/guide/headless) next.
