import type { MediaItem, MediaType, Page } from "./types";

export interface ProviderListParams { type: MediaType; page: number; perPage: number }

/** A data source. Core's client adds caching, de-dupe, events and error reporting on top. */
export interface Provider {
  readonly name: string;
  search(params: ProviderListParams & { query: string }): Promise<Page<MediaItem>>;
  trending(params: ProviderListParams): Promise<Page<MediaItem>>;
  getById(type: MediaType, id: number): Promise<MediaItem>;
}
