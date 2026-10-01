import { MediaError } from "./errors";
import type { Provider, ProviderListParams } from "./provider";
import type { MediaItem, MediaType, Page } from "./types";

// core is lib-ES2022 only (no DOM/Node types), so declare the one timer global we need.
declare const setTimeout: (fn: () => void, ms: number) => unknown;

const TAGS = ["nature", "city", "ocean", "mountain", "forest", "people", "food", "animals", "architecture", "night"];
const VIDEO_BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
const VIDEO_FILES = [
  "BigBuckBunny.mp4", "ElephantsDream.mp4", "ForBiggerBlazes.mp4", "ForBiggerEscapes.mp4",
  "ForBiggerFun.mp4", "ForBiggerJoyrides.mp4", "ForBiggerMeltdowns.mp4", "Sintel.mp4",
  "TearsOfSteel.mp4", "SubaruOutbackOnStreetAndDirt.mp4", "VolkswagenGTIReview.mp4", "WeAreGoingOnBullrun.mp4",
];
const HEIGHTS = [800, 1200, 900, 1000];

function makePhotos(count: number): MediaItem[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1, tag = TAGS[n % TAGS.length]!, h = HEIGHTS[n % HEIGHTS.length]!;
    const seed = `${tag}${n}`;
    return {
      id: `photo-${n}`, type: "photo", width: 1200, height: h, title: `${tag} photo ${n}`,
      author: { name: `Mock Author ${(n % 5) + 1}`, url: "https://example.com" },
      pageUrl: `https://picsum.photos/seed/${seed}`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/400/${Math.round(h / 3)}`,
      previewUrl: `https://picsum.photos/seed/${seed}/1200/${h}`,
      downloadUrl: `https://picsum.photos/seed/${seed}/1200/${h}`,
    } satisfies MediaItem;
  });
}

function makeVideos(count: number): MediaItem[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1, tag = TAGS[n % TAGS.length]!, file = VIDEO_FILES[i % VIDEO_FILES.length]!;
    const poster = `https://picsum.photos/seed/vid-${tag}${n}/640/360`;
    return {
      id: `video-${n}`, type: "video", width: 1280, height: 720, title: `${tag} video ${n}`,
      author: { name: `Mock Author ${(n % 5) + 1}`, url: "https://example.com" },
      pageUrl: VIDEO_BASE + file, thumbnailUrl: poster, previewUrl: poster,
      downloadUrl: VIDEO_BASE + file, videoUrl: VIDEO_BASE + file, durationSec: 15 + n,
    } satisfies MediaItem;
  });
}

export interface MockProviderOptions {
  /** Simulated network latency in ms (default 250). */
  delayMs?: number;
  /** Make every request fail with this error (handy for demoing error states). */
  failWith?: MediaError;
}

/** Offline provider with fixture data (picsum placeholder photos + public sample videos). */
export function createMockProvider(options: MockProviderOptions = {}): Provider {
  const { delayMs = 250, failWith } = options;
  const data: Record<MediaType, MediaItem[]> = { photo: makePhotos(80), video: makeVideos(24) };
  const wait = () => new Promise<void>((r) => setTimeout(r, delayMs));

  async function list(p: ProviderListParams, query = ""): Promise<Page<MediaItem>> {
    await wait();
    if (failWith) throw failWith;
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = data[p.type].filter((it) => tokens.every((t) => it.title.toLowerCase().includes(t)));
    const start = (p.page - 1) * p.perPage;
    return {
      items: pool.slice(start, start + p.perPage), page: p.page, perPage: p.perPage,
      totalResults: pool.length, hasMore: start + p.perPage < pool.length,
    };
  }

  return {
    name: "mock",
    search: (p) => list(p, p.query),
    trending: (p) => list(p),
    async getById(type, id) {
      await wait();
      if (failWith) throw failWith;
      const found = data[type].find((it) => it.id === `${type}-${id}`);
      if (!found) throw new MediaError("NOT_FOUND", "Resource not found", 404);
      return found;
    },
  };
}
