# Quick start

## React

Create the config once, at module scope, and wrap your app.

```tsx
import { MediaProvider, createMockProvider, useMediaSearch, type MediaClientConfig } from "media-react";

const KEY = import.meta.env.VITE_PEXELS_KEY as string | undefined;
const config: MediaClientConfig = KEY ? { apiKey: KEY } : { provider: createMockProvider() };

export function App() {
  return (
    <MediaProvider config={config}>
      <Gallery />
    </MediaProvider>
  );
}

function Gallery() {
  const { items, isLoading, status, error, hasMore, loadMore, retry } = useMediaSearch({ query: "ocean" });
  if (isLoading) return <p>Loading…</p>;
  if (status === "error") return <button onClick={retry}>Retry ({error?.code})</button>;
  return (
    <>
      {items.map((it) => <img key={it.id} src={it.thumbnailUrl} alt={it.title} />)}
      {hasMore && <button onClick={loadMore}>Load more</button>}
    </>
  );
}
```

An empty `query` returns the trending feed. Without a key, use `createMockProvider()` to work offline.

## Plain TypeScript (no UI at all)

```ts
import { createMediaClient } from "media-core";

const client = createMediaClient({ apiKey: process.env.PEXELS_KEY! });
client.on("view", ({ item }) => console.log("viewed", item.title));

const page = await client.search({ query: "forest", type: "video", perPage: 10 });
client.trackView(page.items[0]!);
```

## Listen to activity

```tsx
import { useMediaEvents, useMediaActions } from "media-react";

useMediaEvents({ download: (e) => analytics.track("download", e.item.id) });
const { trackView, trackDownload } = useMediaActions();
```
