# media-react

## `MediaProvider`

```tsx
<MediaProvider config={config}>…</MediaProvider>
<MediaProvider client={myClient}>…</MediaProvider>
```

Pass either `config` (a `MediaClientConfig`; the provider creates and memoises the client) or a ready `client`. Define `config` at module scope. The client is re-created when `client`, `apiKey`, `baseUrl` or `provider` change. `useMediaClient()` returns the client and throws outside a provider.

## Hooks

### `useMediaSearch({ query?, type?, perPage? })`

Empty or missing `query` means the trending feed.

| Returns | |
|---|---|
| `items` | Loaded items, de-duplicated by `id` |
| `status` | `"loading" \| "success" \| "error"` |
| `error` | `MediaError \| null` |
| `isLoading` / `isLoadingMore` | First load / next page |
| `hasMore` | Another page exists |
| `loadMore()` | No-op while loading or when `hasMore` is false |
| `retry()` | Reset and refetch the first page |

Changing `query`, `type` or `perPage` resets the list. Responses from superseded requests are ignored.

### `useMediaItem(type, id)`

Returns `{ item, error, loading }`. Pass `undefined` as `id` to skip.

### `useMediaEvents({ view?, download?, error? })`

Subscribes for the component's lifetime. See [events](/api/events).

### `useMediaActions()`

Returns `{ trackView, trackDownload }`.

## Re-exports

`createMockProvider`, `createPexelsProvider`, and the types `MediaItem`, `MediaType`, `MediaError`, `MediaClientConfig` and `Provider`, so an app never has to import `media-core`.
