import type { MediaItem, Page } from "./types";

export interface PexelsPhoto {
  id: number; width: number; height: number; url: string; alt?: string; avg_color?: string;
  photographer: string; photographer_url: string;
  src: { original: string; large2x: string; large: string; medium: string; small: string };
}
export interface PexelsVideoFile { quality: string | null; file_type: string; width: number | null; height: number | null; link: string }
export interface PexelsVideo {
  id: number; width: number; height: number; url: string; image: string; duration: number;
  user: { name: string; url: string }; video_files: PexelsVideoFile[];
}
interface PexelsListMeta { page: number; per_page: number; total_results: number; next_page?: string }
export interface PexelsPhotoList extends PexelsListMeta { photos: PexelsPhoto[] }
export interface PexelsVideoList extends PexelsListMeta { videos: PexelsVideo[] }

export function mapPhoto(p: PexelsPhoto): MediaItem {
  return {
    id: `photo-${p.id}`, type: "photo", width: p.width, height: p.height,
    title: p.alt || `Photo by ${p.photographer}`,
    author: { name: p.photographer, url: p.photographer_url },
    pageUrl: p.url, thumbnailUrl: p.src.medium, previewUrl: p.src.large2x, downloadUrl: p.src.original,
    color: p.avg_color,
  };
}

function pickPlayable(files: PexelsVideoFile[]): PexelsVideoFile | undefined {
  const mp4 = files.filter((f) => f.file_type === "video/mp4" && f.width);
  // Prefer the largest file that is still <= 1280 wide (fast to start, fine on mobile).
  const ok = mp4.filter((f) => (f.width ?? 0) <= 1280).sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return ok[0] ?? [...mp4].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))[0] ?? files[0];
}

export function mapVideo(v: PexelsVideo): MediaItem {
  const playable = pickPlayable(v.video_files);
  const largest = [...v.video_files].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  return {
    id: `video-${v.id}`, type: "video", width: v.width, height: v.height,
    title: `Video by ${v.user.name}`, author: { name: v.user.name, url: v.user.url },
    pageUrl: v.url, thumbnailUrl: v.image, previewUrl: v.image,
    downloadUrl: largest?.link ?? playable?.link ?? v.url,
    videoUrl: playable?.link, durationSec: v.duration,
  };
}

export function toPage(items: MediaItem[], meta: PexelsListMeta): Page<MediaItem> {
  return {
    items, page: meta.page, perPage: meta.per_page, totalResults: meta.total_results,
    hasMore: Boolean(meta.next_page) || meta.page * meta.per_page < meta.total_results,
  };
}
