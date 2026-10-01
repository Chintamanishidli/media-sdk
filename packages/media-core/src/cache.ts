/** Tiny TTL cache + in-flight de-duplication (concurrent identical requests share one promise). */
export class RequestCache {
  private store = new Map<string, { value: unknown; expires: number }>();
  private inflight = new Map<string, Promise<unknown>>();
  constructor(private ttlMs: number, private maxEntries = 200) {}

  async get<T>(key: string, load: () => Promise<T>): Promise<T> {
    if (this.ttlMs <= 0) return load();
    const hit = this.store.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as T;

    const pending = this.inflight.get(key);
    if (pending) return pending as Promise<T>;

    const p = load()
      .then((value) => { this.set(key, value); return value; })
      .finally(() => { this.inflight.delete(key); });
    this.inflight.set(key, p);
    return p;
  }

  private set(key: string, value: unknown) {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  clear() { this.store.clear(); }
}
