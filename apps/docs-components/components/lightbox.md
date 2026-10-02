# Lightbox

## Web: `useLightbox`

You own the state: `index` is the open item, or `null` when closed.

```tsx
const [index, setIndex] = useState<number | null>(null);
const lb = useLightbox({ index, count: items.length, onIndexChange: setIndex, onClose: () => setIndex(null), label: "Photo viewer" });

if (!lb.isOpen) return null;
return (
  <div {...lb.getBackdropProps()} className="backdrop">
    <div {...lb.getDialogProps()} className="dialog">
      <img src={items[index!].previewUrl} alt={items[index!].title} />
      <button {...lb.getPrevButtonProps()}>‹</button>
      <button {...lb.getNextButtonProps()}>›</button>
      <button {...lb.getCloseButtonProps()}>×</button>
    </div>
  </div>
);
```

| Option | Type | Default |
|---|---|---|
| `index` | `number \| null` | required |
| `count` | `number` | required |
| `onClose` | `() => void` | required |
| `onIndexChange` | `(i: number) => void` | required |
| `loop` | `boolean` | `false` |
| `label` | `string` | `"Media viewer"` |

Returns `isOpen`, `index`, `hasPrev`, `hasNext`, `next()`, `prev()` and the getters `getBackdropProps`, `getDialogProps`, `getCloseButtonProps`, `getPrevButtonProps`, `getNextButtonProps`.

While open the hook:

- moves focus into the dialog and **traps Tab** inside it (so put every control inside the dialog);
- handles **Esc** (close) and **ArrowLeft / ArrowRight**;
- **locks body scroll**;
- **restores focus** to the element that opened it when it closes;
- closes on a click on the backdrop itself (not on the dialog).

## Native: `useLightbox`

```tsx
const lb = useLightbox({ index, count, onIndexChange, onClose, label: "Photo viewer" });

<Modal {...lb.getModalProps()}>
  <Pressable style={StyleSheet.absoluteFill} {...lb.getBackdropProps()} />
  <View {...lb.getContentProps()}>
    <Image source={{ uri: items[index!].previewUrl }} />
    <Pressable {...lb.getPrevButtonProps()} /> <Pressable {...lb.getNextButtonProps()} /> <Pressable {...lb.getCloseButtonProps()} />
  </View>
</Modal>
```

Adds `swipeThreshold` (default 50 px). `getModalProps()` wires the Android back button to `onClose`; `getContentProps()` adds swipe left/right and modal semantics for screen readers.
