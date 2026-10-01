import { MediaError } from "./errors";
import { createHttp, type FetchLike } from "./http";
import { mapPhoto, mapVideo, toPage, type PexelsPhoto, type PexelsPhotoList, type PexelsVideo, type PexelsVideoList } from "./pexels";
import type { Provider } from "./provider";

export interface PexelsProviderConfig { apiKey: string; baseUrl?: string; fetch?: FetchLike }

export function createPexelsProvider(config: PexelsProviderConfig): Provider {
  if (!config.apiKey?.trim()) throw new MediaError("AUTH", "Pexels apiKey is required");
  const fetchImpl = config.fetch ?? (globalThis as { fetch?: FetchLike }).fetch;
  if (!fetchImpl) throw new MediaError("UNKNOWN", "No fetch implementation available; pass config.fetch");
  const http = createHttp({ apiKey: config.apiKey, baseUrl: config.baseUrl ?? "https://api.pexels.com", fetch: fetchImpl });

  const photos = async (path: string, params: Record<string, string | number>) => {
    const r = await http<PexelsPhotoList>(path, params);
    return toPage(r.photos.map(mapPhoto), r);
  };
  const videos = async (path: string, params: Record<string, string | number>) => {
    const r = await http<PexelsVideoList>(path, params);
    return toPage(r.videos.map(mapVideo), r);
  };

  return {
    name: "pexels",
    search: ({ query, type, page, perPage }) =>
      type === "photo"
        ? photos("/v1/search", { query, page, per_page: perPage })
        : videos("/videos/search", { query, page, per_page: perPage }),
    trending: ({ type, page, perPage }) =>
      type === "photo"
        ? photos("/v1/curated", { page, per_page: perPage })
        : videos("/videos/popular", { page, per_page: perPage }),
    getById: async (type, id) =>
      type === "photo"
        ? mapPhoto(await http<PexelsPhoto>(`/v1/photos/${id}`))
        : mapVideo(await http<PexelsVideo>(`/videos/videos/${id}`)),
  };
}
