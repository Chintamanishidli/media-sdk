# Architecture

## Layers and the one rule

```
core        pure TypeScript. Imports: nothing.
wrappers    media-react, media-native. Import: media-core only. No business logic.
components  media-ui-react, media-ui-native. Import: nothing from this repo.
app         the only place that imports a wrapper AND a component library.
```

Wrappers and components never import each other. Components never import `media-core`. Core never imports either.

`scripts/check-boundaries.mjs` enforces this and runs in `pnpm verify`. It also bans platform leaks: core may not import `react`, `react-dom` or `react-native`; web packages may not import `react-native`; native packages may not import `react-dom`; and the app may not import `media-core` directly (it uses what `media-react` re-exports).

## Data flow

```
Provider (Pexels | mock)  ──►  MediaClient (cache, de-dupe, events, errors)  ──►  hooks  ──►  app  ──►  UI hooks
```

- **Provider** fetches and maps provider-specific payloads to the neutral `MediaItem`.
- **MediaClient** adds a TTL cache with in-flight de-duplication, emits events, and normalises errors into `MediaError`.
- **Wrappers** adapt the client to React idioms (context provider and hooks).
- **UI hooks** receive plain data and callbacks as props and know nothing about the SDK.

## Auth

The Pexels key is captured once inside a closure in the HTTP layer. It is sent as the `Authorization` header only: never in a URL, never on the client object, never in an event payload.

## Trade-offs

- `media-react` and `media-native` hold near-identical hook code. Wrappers may not import each other and there is no shared package in the design, so the duplication is deliberate.
- With no backend, a browser build exposes the key. Proxy requests through a server in production.
