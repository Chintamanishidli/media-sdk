# Providers

A provider is the data source. The client wraps it with caching, de-duplication, events and error reporting, so a provider only fetches and maps.

```ts
interface Provider {
  readonly name: string; // part of the cache key
  search(p: { query: string; type: MediaType; page: number; perPage: number }): Promise<Page<MediaItem>>;
  trending(p: { type: MediaType; page: number; perPage: number }): Promise<Page<MediaItem>>;
  getById(type: MediaType, id: number): Promise<MediaItem>;
}
```

Parameters arrive already normalised (defaults applied, `perPage` clamped, query trimmed).

## `createPexelsProvider({ apiKey, baseUrl?, fetch? })`

Maps Pexels photos and videos to `MediaItem`. For videos it picks the largest MP4 that is at most 1280 px wide as `videoUrl`, and the widest file as `downloadUrl`. HTTP failures become typed [`MediaError`s](/api/errors). `createMediaClient({ apiKey })` uses this for you.

## `createMockProvider({ delayMs?, failWith? })`

Offline fixtures: 80 photos and 24 videos with searchable titles (`nature`, `city`, `ocean`, `mountain`, `forest`, `people`, `food`, `animals`, `architecture`, `night`). Photos come from picsum.photos and videos from public sample files, so a network connection is still needed for the media itself.

| Option | Default | Notes |
|---|---|---|
| `delayMs` | `250` | Simulated latency. |
| `failWith` | none | Pass a `MediaError` to make every request fail, for demoing error states. |

## Writing your own

```ts
import type { Provider } from "media-core";
import { createMediaClient } from "media-core";

const myProvider: Provider = {
  name: "my-source",
  async search({ query, type, page, perPage }) { /* fetch, then map to MediaItem and return a Page */ },
  async trending(p) { /* … */ },
  async getById(type, id) { /* … */ },
};

const client = createMediaClient({ provider: myProvider });
```

Throw `MediaError` for failures you can classify; any other thrown error is reported as `UNKNOWN`.
