# Grid

## Web: `useGrid`

```tsx
const grid = useGrid<MediaItem>({
  items, hasMore, isLoadingMore, onLoadMore: loadMore,
  onSelect: (_item, i) => setOpen(i),
  getLabel: (item) => item.title,
});

<div {...grid.getContainerProps()}>
  {items.map((item, i) => <div key={item.id} {...grid.getItemProps(item, i)}><img src={item.thumbnailUrl} alt="" /></div>)}
</div>
<div {...grid.getSentinelProps()} />
<button {...grid.getLoadMoreButtonProps()}>Load more</button>
```

| Option | Type | Default |
|---|---|---|
| `items` | `readonly T[]` | required |
| `hasMore` / `isLoadingMore` | `boolean` | |
| `onLoadMore` | `() => void` | |
| `onSelect` | `(item, index) => void` | |
| `getLabel` | `(item, index) => string` | |
| `rootMargin` | `string` | `"400px"` |

| Getter | Use on |
|---|---|
| `getContainerProps()` | The wrapper (`role="group"`, `aria-busy`) |
| `getItemProps(item, index)` | Each cell |
| `getSentinelProps()` | An empty element **after** the cells; loading triggers when it nears the viewport |
| `getLoadMoreButtonProps()` | Optional fallback button (hides itself when `hasMore` is false) |

If the sentinel is still visible after a page loads, the hook re-arms its observer and keeps loading until the viewport is filled or there are no more pages.

## Native: `useGrid`

```tsx
const grid = useGrid({ items, getKey: (i) => i.id, hasMore, isLoadingMore, onLoadMore, onSelect, numColumns: 2 });

<FlatList {...grid.getListProps()} renderItem={({ item, index }) =>
  <Pressable {...grid.getItemProps(item, index)}><Image source={{ uri: item.thumbnailUrl }} /></Pressable>} />
```

`getListProps()` supplies `data`, `keyExtractor`, `numColumns` (default 2) and `onEndReached` with a threshold of 0.6. `FlatList` cannot change `numColumns` after mount.
