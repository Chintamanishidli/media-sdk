# Media SDK

A small, headless SDK for searching and showing photos and videos. The data layer is plain TypeScript with no UI. Platform wrappers adapt it to React and React Native, and a separate component library handles display.

| Package | Role | Imports |
|---|---|---|
| `media-core` | Client, providers, cache, events, errors | nothing (no React, no DOM) |
| `media-react` | `MediaProvider` + hooks for web | `media-core` only |
| `media-native` | Same contract for React Native | `media-core` only |
| `media-ui-react` / `media-ui-native` | Headless UI hooks (see the components docs) | nothing from this repo |
| `apps/app` | Wires data to display | `media-react` + `media-ui-react` |

```
app ──► media-react ──► media-core
 └────► media-ui-react          (components never import core or the wrappers)
```

## Why it is built this way

- **Portable core.** `media-core` could power a CLI or a different UI without changes.
- **Swappable data source.** The core talks to a [`Provider`](/api/providers). Pexels and an offline mock ship in the box.
- **Observable.** Every `view`, `download` and `error` is an [event](/api/events) you can subscribe to; a default listener logs to the console.
- **Enforced boundaries.** `pnpm check:boundaries` fails if a package imports a layer it must not.

Start with the [quick start](/guide/quick-start).
