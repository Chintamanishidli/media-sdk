# media-native

Same contract as [`media-react`](/api/react): `MediaProvider`, `useMediaClient`, `useMediaSearch`, `useMediaItem`, `useMediaEvents`, `useMediaActions`, plus the same re-exports. It contains no business logic and depends only on `media-core`, with `react` and `react-native` as peer dependencies.

The hook code is a deliberate copy of `media-react`'s, because wrappers may not import each other.

::: warning
The native packages are type-checked but have not been run on a device or simulator.
:::
