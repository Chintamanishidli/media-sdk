// Same contract as media-react. Kept as a separate copy on purpose: wrappers must not import each other,
// and the brief has no shared package between them. Only the platform adaptation lives here (no DOM types).
export { MediaProvider, useMediaClient } from "./provider";
export type { MediaProviderProps } from "./provider";
export { useMediaSearch } from "./useMediaSearch";
export type { UseMediaSearchOptions } from "./useMediaSearch";
export { useMediaItem } from "./useMediaItem";
export { useMediaEvents, useMediaActions } from "./useMediaEvents";
// Re-exported so the app never has to import media-core directly.
export { createMockProvider, createPexelsProvider } from "media-core";
export type { MediaItem, MediaType, MediaError, MediaClientConfig, Provider } from "media-core";
