# Headless Media SDK + Component Library

Take-home for FotoOwl. Pexels is the data source.

## Layout & dependency rules

```
packages/
  media-core/      pure TS: Pexels client, cache + de-dupe, event emitter (no React/DOM)
  media-react/     provider + hooks, imports ONLY media-core
  media-native/    same contract as media-react for React Native, imports ONLY media-core
  media-ui-react/  headless useGrid / useLightbox / useReelSwiper, imports NOTHING from this repo
  media-ui-native/ headless useGrid / useLightbox / useReelSwiper for React Native (FlatList, Modal), imports NOTHING from this repo
apps/
  app/             Vite + React; the only package that imports media-react AND media-ui-react
```

`pnpm check:boundaries` fails if a package imports a layer it must not (e.g. core -> react, ui -> core).

## Run

```bash
pnpm install
pnpm verify          # boundaries + typecheck + tests
pnpm dev             # http://localhost:5173
```

With no key the app runs on an offline **mock provider** (picsum placeholder photos + public sample videos).
To use Pexels, copy `apps/app/.env.example` to `apps/app/.env.local` and set `VITE_PEXELS_KEY`.

(No backend, so a Pexels key would ship to the browser; fine for a take-home, not for production — see "Cuts".)

## Design notes

- **Auth:** the key is captured once in a closure in `http.ts`; it is never stored on the client object, put in a URL, or emitted in events.
- **Events:** `client.on("view" | "download" | "error", fn)` returns an unsubscribe. A default console logger is attached (disable with `logEvents: false`). Listener errors are isolated.
- **Cache:** TTL cache plus in-flight de-dupe (concurrent identical requests share one promise).
- **Errors:** every failure is a typed `MediaError` with a `code` (`AUTH`, `RATE_LIMIT`, `NOT_FOUND`, `NETWORK`, ...).
- **Providers:** `media-core` talks to a `Provider` interface (`createPexelsProvider`, `createMockProvider`); the client adds cache, de-dupe, events and error reporting on top, so swapping the data source touches nothing else.
- **Hooks (`media-react`):** `useMediaSearch` (empty query = trending; pagination; stale-response guard), `useMediaItem`, `useMediaEvents`, `useMediaActions`.

## AI-assisted vs hand-written

| Part | Who | Notes |
|---|---|---|
| core / react wrapper scaffold | AI-assisted (Claude), reviewed by me | _fill in what you changed_ |
| UI components | _TBD_ | |
| App wiring | _TBD_ | |
| Skill docs | _TBD_ | _how they were tested_ |

## Cuts and why

- **Native packages are type-checked but not run on a device or simulator.** There is no native app in the brief, so I did not build one. The hooks follow RN idioms (FlatList `onEndReached`, `Modal` + `onRequestClose`, `PanResponder` swipe, FlatList paging + viewability for reels) but are untested at runtime.
- **Hook logic is duplicated between `media-react` and `media-native`.** Wrappers may not import each other and the brief has no shared package, so I accepted a small copy rather than add a layer. A shared `media-hooks-shared` package would remove it.
- **Lightbox video** is not implemented (images only). Videos open in the Reels view instead.
- **No component/e2e tests.** Unit tests cover core only (cache de-dupe, events, errors, mock provider); UI behaviour was checked by hand.
- **No API-key proxy.** There is no backend, so a Pexels key would ship to the browser. Fine for a take-home, not for production.
- **Mock provider by default** because Pexels key issuance was paused when I started; swapping in a real provider is one adapter file.
- **Grid arrow keys** follow DOM order, not visual columns (CSS-columns layout makes column-aware navigation unreliable).
