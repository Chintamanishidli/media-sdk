# media-core

## `createMediaClient(config)`

```ts
import { createMediaClient } from "media-core";
const client = createMediaClient({ apiKey: "…" });
```

| Option | Type | Default | Notes |
|---|---|---|---|
| `provider` | `Provider` | none | Your own data source. Takes precedence over `apiKey`. |
| `apiKey` | `string` | none | Pexels key, used when no `provider` is given. Missing or blank throws `MediaError("AUTH")`. |
| `baseUrl` | `string` | `https://api.pexels.com` | Pexels only. |
| `fetch` | `FetchLike` | `globalThis.fetch` | Inject for tests or non-browser runtimes. |
| `cacheTtlMs` | `number` | `60000` | `0` disables both the cache and in-flight de-duplication. |
| `logEvents` | `boolean` | `true` | Attach the default console logger. |
| `logger` | `{ log(...args) }` | `console` | Where the default logger writes. |

## Methods

| Method | Returns | Notes |
|---|---|---|
| `search({ query, type?, page?, perPage? })` | `Promise<Page<MediaItem>>` | `type` is `"photo"` (default) or `"video"`. An empty query throws `BAD_REQUEST`. |
| `trending({ type?, page?, perPage? }?)` | `Promise<Page<MediaItem>>` | Curated photos, or popular videos. |
| `getById(type, id)` | `Promise<MediaItem>` | `id` is the numeric provider id. |
| `trackView(item)` / `trackDownload(item)` | `void` | Emit the matching [event](/api/events). |
| `on(type, handler)` | `Unsubscribe` | See [events](/api/events). |
| `off(type, handler)` | `void` | |
| `clearCache()` | `void` | |

`page` defaults to 1 and `perPage` to 24 (clamped to 1–80).

## Caching and de-duplication

Results are cached by provider name plus request parameters for `cacheTtlMs`. Identical concurrent requests share one in-flight promise, so the network is hit once. The cache holds up to 200 entries and drops the oldest first.

## Types

```ts
interface MediaItem {
  id: string;            // "photo-123" / "video-456": unique across both types
  type: "photo" | "video";
  width: number; height: number;
  title: string;
  author: { name: string; url: string };
  pageUrl: string;
  thumbnailUrl: string;  // grid cell
  previewUrl: string;    // lightbox / poster
  downloadUrl: string;
  videoUrl?: string;     // playable file for videos
  durationSec?: number;  // videos
  color?: string;        // average colour, when known
}

interface Page<T> { items: T[]; page: number; perPage: number; totalResults: number; hasMore: boolean }
```
