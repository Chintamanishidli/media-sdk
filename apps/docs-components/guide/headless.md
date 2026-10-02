# The headless pattern

Each hook returns **prop-getters**: functions that return the props an element needs (refs, ARIA roles, event handlers). You spread them onto your own markup.

```tsx
const grid = useGrid({ items, onSelect: (item, i) => open(i) });

<div {...grid.getContainerProps()} className="my-grid">
  {items.map((item, i) => (
    <div key={item.id} {...grid.getItemProps(item, i)} className="my-cell">
      <img src={item.thumbnailUrl} alt="" />
    </div>
  ))}
</div>
```

## Rules for using getters

- Put `key` on the element yourself; getters never return it.
- Spread the getter first, then add your own props. To add your own `onClick`, call the getter's handler inside yours rather than overwriting it.
- Do not replace a getter's `ref`. If you need the element, wrap it.
- Who owns state: the hooks own behaviour (observers, focus, key handling); **you own application state** such as which item is open.

## Why not styled components?

A styled component fixes your markup and design. Prop-getters let you keep your own design system and still get correct keyboard, focus and scroll behaviour for free.
