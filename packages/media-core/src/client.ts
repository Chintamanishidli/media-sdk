import { RequestCache } from "./cache";
import { createEmitter, attachConsoleLogger, type MediaEvents, type Logger, type Unsubscribe } from "./emitter";
import { MediaError } from "./errors";
import type { FetchLike } from "./http";
import { createPexelsProvider } from "./pexels-provider";
import type { Provider } from "./provider";
import type { ListParams, MediaItem, MediaType, Page, SearchParams } from "./types";

export interface MediaClientConfig {
  /** Bring your own data source (e.g. createMockProvider()). Takes precedence over apiKey. */
  provider?: Provider;
  /** Pexels API key (used when no provider is given). */
  apiKey?: string;
  baseUrl?: string;
  fetch?: FetchLike;
  /** Cache TTL in ms. 0 disables caching and in-flight de-dupe. Default 60s. */
  cacheTtlMs?: number;
  /** Log every event to the console (default true). */
  logEvents?: boolean;
  logger?: Logger;
}

export interface MediaClient {
  search(params: SearchParams): Promise<Page<MediaItem>>;
  /** Trending: curated photos, or popular videos. */
  trending(params?: ListParams): Promise<Page<MediaItem>>;
  getById(type: MediaType, id: number): Promise<MediaItem>;
  trackView(item: MediaItem): void;
  trackDownload(item: MediaItem): void;
  on<K extends keyof MediaEvents>(type: K, handler: (p: MediaEvents[K]) => void): Unsubscribe;
  off<K extends keyof MediaEvents>(type: K, handler: (p: MediaEvents[K]) => void): void;
  clearCache(): void;
}

const MAX_PER_PAGE = 80;

export function createMediaClient(config: MediaClientConfig): MediaClient {
  const provider: Provider =
    config.provider ?? createPexelsProvider({ apiKey: config.apiKey ?? "", baseUrl: config.baseUrl, fetch: config.fetch });

  const cache = new RequestCache(config.cacheTtlMs ?? 60_000);
  const events = createEmitter<MediaEvents>();
  if (config.logEvents !== false) {
    attachConsoleLogger(events, config.logger ?? ((globalThis as { console?: Logger }).console as Logger));
  }

  const norm = (p: ListParams) => ({
    type: p.type ?? ("photo" as MediaType),
    page: Math.max(1, p.page ?? 1),
    perPage: Math.min(MAX_PER_PAGE, Math.max(1, p.perPage ?? 24)),
  });

  async function run<T>(key: string, load: () => Promise<T>): Promise<T> {
    try {
      return await cache.get(`${provider.name}:${key}`, load);
    } catch (e) {
      const error = e instanceof MediaError ? e : new MediaError("UNKNOWN", "Unexpected error");
      events.emit("error", { error, at: Date.now() });
      throw error;
    }
  }

  return {
    async search(params) {
      const query = params.query.trim();
      if (!query) throw new MediaError("BAD_REQUEST", "search: query must not be empty");
      const p = { ...norm(params), query };
      return run(`search:${JSON.stringify(p)}`, () => provider.search(p));
    },
    async trending(params = {}) {
      const p = norm(params);
      return run(`trending:${JSON.stringify(p)}`, () => provider.trending(p));
    },
    getById: (type, id) => run(`${type}:${id}`, () => provider.getById(type, id)),
    trackView: (item) => events.emit("view", { item, at: Date.now() }),
    trackDownload: (item) => events.emit("download", { item, at: Date.now() }),
    on: events.on,
    off: events.off,
    clearCache: () => cache.clear(),
  };
}
