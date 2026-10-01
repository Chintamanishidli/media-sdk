export type MediaType = "photo" | "video";

/** Provider-neutral shape. UI libs never see Pexels' raw payloads. */
export interface MediaItem {
  id: string; // `${type}-${providerId}` — unique across photos + videos
  type: MediaType;
  width: number;
  height: number;
  title: string;
  author: { name: string; url: string };
  pageUrl: string;
  thumbnailUrl: string;
  previewUrl: string;
  downloadUrl: string;
  videoUrl?: string;
  durationSec?: number;
  color?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  perPage: number;
  totalResults: number;
  hasMore: boolean;
}

export interface ListParams { type?: MediaType; page?: number; perPage?: number }
export interface SearchParams extends ListParams { query: string }
