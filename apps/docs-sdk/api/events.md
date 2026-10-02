# Events

| Event | Payload | Emitted when |
|---|---|---|
| `view` | `{ item, at }` | You call `trackView(item)` |
| `download` | `{ item, at }` | You call `trackDownload(item)` |
| `error` | `{ error, at }` | A provider request fails |

`at` is `Date.now()`. The SDK does the emitting; the app decides when an item counts as viewed or downloaded.

```ts
const off = client.on("view", ({ item }) => console.log(item.id));
client.trackView(item);
off(); // unsubscribe; client.off("view", handler) also works
```

## Default listener

Unless you set `logEvents: false`, a listener logs every event to the console (or to `logger`). It is independent of your own subscriptions.

## Behaviour to know

- A listener that throws does not affect other listeners or the caller.
- Handlers may unsubscribe while an event is being delivered.
- `error` fires for failed provider requests. Argument validation errors (for example an empty search query) are thrown to the caller without an event.

## In React

```tsx
useMediaEvents({ view: (e) => log(e.item.id), error: (e) => toast(e.error.code) });
```

Handlers can change on every render; the subscription lives for the component's lifetime.
