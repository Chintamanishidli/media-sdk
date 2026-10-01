---
name: media-data-wiring
description: Use when writing or changing app code that fetches, searches, paginates, tracks or reports errors for photos/videos in this repo. Covers MediaProvider setup, the media-react hooks, events, and error handling. Do NOT use for markup, styling or UI behaviour (see media-ui-components).
---

# Wiring media data with `media-react`

All data access in `apps/app` goes through `media-react`. Never bypass it.

## Hard rules (the build fails or review rejects otherwise)

1. Import data code **only from `"media-react"`**. Never import `media-core`, `fetch`/`axios` to Pexels, or `process.env`/`import.meta.env` keys outside the single config object in `App.tsx`. `pnpm check:boundaries` enforces the `media-core` rule.
2. The API key appears **once**: in the `MediaClientConfig` object. Never pass it to components, put it in a URL, log it, or store it in state.
3. Do not write your own pagination state, de-duplication, caching, or request-cancellation. The hooks already do all four (stale responses are ignored; items are de-duplicated by `id`).
4. Do not `console.log` activity. The SDK's default logger already logs every event. To react to events, use `useMediaEvents`.

## Provider setup

Create the config **at module scope** (a stable object), then render `<MediaProvider config={config}>` once at the root.

```tsx
import { MediaProvider, createMockProvider, type MediaClientConfig } from "media-react";

const KEY = import.meta.env.VITE_PEXELS_KEY as string | undefined;
const config: MediaClientConfig = KEY ? { apiKey: KEY } : { provider: createMockProvider() };

<MediaProvider config={config}>{children}</MediaProvider>
```

- Creating the config or `createMockProvider()` inside a component re-creates the client (and wipes the cache) on every render.
- Hooks throw if used outside `<MediaProvider>`.

## Hooks (the complete list)

| Hook | Use for | Returns |
|---|---|---|
| `useMediaSearch({ query?, type?, perPage? })` | Any list. **Empty/undefined `query` = trending feed.** `type` is `"photo"` (default) or `"video"`. | `{ items, status, error, isLoading, isLoadingMore, hasMore, loadMore, retry }` |
| `useMediaItem(type, id)` | One item by **numeric** Pexels id (pass `undefined` to skip). | `{ item, error, loading }` |
| `useMediaEvents({ view?, download?, error? })` | Subscribe to SDK events for the component's lifetime. Handlers may change every render; no `useCallback` needed. | `void` |
| `useMediaActions()` | Report activity. | `{ trackView(item), trackDownload(item) }` |

Rules for `useMediaSearch`:
- Call `loadMore()` only from an infinite-scroll trigger or a "Load more" button; it is already a no-op while loading or when `hasMore` is false.
- Changing `query` or `type` resets the list automatically. Do not clear `items` yourself.
- Render all four states: `isLoading` (first load), `status === "error"` with `retry`, `status === "success" && items.length === 0` (empty), and `isLoadingMore`. If `error` is set while `items.length > 0`, a *load-more* failed: keep showing the items.

## Events: when to fire what

- `trackView(item)` when an item is actually **shown to the user**: lightbox opens or changes item, or a reel becomes the active slide. Never on grid render (that would fire dozens at once). Drive it from an effect keyed on `item.id`, not on every render.
- `trackDownload(item)` in the `onClick` of the download link/button.
- The SDK emits; the app only listens. Do not add a second tracking channel.

## Data shape: pick the right field

`MediaItem` is provider-neutral. Never read provider-specific fields.

| Need | Field |
|---|---|
| Grid cell image | `thumbnailUrl` |
| Lightbox image | `previewUrl` |
| Playable video (`type === "video"`) | `videoUrl` (optional, check it) |
| Download link | `downloadUrl` |
| Poster for a video | `thumbnailUrl` |
| Layout without jumping | `width` / `height` (use as `aspect-ratio`) |
| React `key` | `id` (string, unique across photos **and** videos) |

Credit the author in captions: `author.name`, `author.url`.

## Errors

`MediaError.code` is one of `AUTH | RATE_LIMIT | NOT_FOUND | NETWORK | BAD_REQUEST | UNKNOWN`. Show a human message per code (e.g. `AUTH` → "check the API key", `RATE_LIMIT` → "try again in a minute") and always offer `retry`. Never display raw error messages from the network.

## Before you finish

Run `pnpm verify` (boundaries + typecheck + tests). If you changed data flow, also check: no `media-core` import in `apps/app`, no key outside the config, every list has loading/error/empty states.
