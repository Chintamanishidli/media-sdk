import type { MediaItem } from "./types";
import type { MediaError } from "./errors";

export interface MediaEvents {
  view: { item: MediaItem; at: number };
  download: { item: MediaItem; at: number };
  error: { error: MediaError; at: number };
}

export type Unsubscribe = () => void;
type Handler<T> = (payload: T) => void;

export interface Emitter<E extends object> {
  on<K extends keyof E>(type: K, handler: Handler<E[K]>): Unsubscribe;
  off<K extends keyof E>(type: K, handler: Handler<E[K]>): void;
  emit<K extends keyof E>(type: K, payload: E[K]): void;
}

export function createEmitter<E extends object>(): Emitter<E> {
  const handlers = new Map<keyof E, Set<Handler<any>>>();
  const api: Emitter<E> = {
    on(type, handler) {
      let set = handlers.get(type);
      if (!set) handlers.set(type, (set = new Set()));
      set.add(handler);
      return () => api.off(type, handler);
    },
    off(type, handler) {
      handlers.get(type)?.delete(handler);
    },
    emit(type, payload) {
      // Copy so handlers may unsubscribe while we iterate; one bad listener must not break others.
      for (const h of [...(handlers.get(type) ?? [])]) {
        try { h(payload); } catch { /* listeners are untrusted */ }
      }
    },
  };
  return api;
}

export interface Logger { log: (...args: unknown[]) => void }

/** Default listener: logs every event. Returns an unsubscribe function. */
export function attachConsoleLogger(emitter: Emitter<MediaEvents>, logger: Logger): Unsubscribe {
  const offs = (["view", "download", "error"] as const).map((type) =>
    emitter.on(type, (payload) => logger.log(`[media-core] ${type}`, payload)),
  );
  return () => offs.forEach((off) => off());
}
