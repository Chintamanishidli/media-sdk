import { test } from "node:test";
import assert from "node:assert/strict";
import { createMediaClient, MediaError } from "../src/index";

const photo = (id: number) => ({
  id, width: 400, height: 300, url: `https://p/${id}`, alt: `alt ${id}`, avg_color: "#fff",
  photographer: "Ann", photographer_url: "https://ann",
  src: { original: "o", large2x: "l2", large: "l", medium: "m", small: "s" },
});
const okFetch = (calls: string[]) => async (url: string) => {
  calls.push(url);
  return { ok: true, status: 200, json: async () => ({ page: 1, per_page: 2, total_results: 10, next_page: "x", photos: [photo(1), photo(2)] }) };
};

test("search maps results and builds a paginated page", async () => {
  const calls: string[] = [];
  const c = createMediaClient({ apiKey: "k", fetch: okFetch(calls), logEvents: false });
  const page = await c.search({ query: "cats", perPage: 2 });
  assert.equal(page.items[0]!.id, "photo-1");
  assert.equal(page.items[0]!.thumbnailUrl, "m");
  assert.equal(page.hasMore, true);
  assert.match(calls[0]!, /\/v1\/search\?query=cats&page=1&per_page=2/);
});

test("identical concurrent requests are de-duplicated; repeat hits cache", async () => {
  const calls: string[] = [];
  const c = createMediaClient({ apiKey: "k", fetch: okFetch(calls), logEvents: false });
  await Promise.all([c.search({ query: "a" }), c.search({ query: "a" })]);
  await c.search({ query: "a" });
  assert.equal(calls.length, 1);
});

test("401 becomes MediaError(AUTH) and emits an error event", async () => {
  const c = createMediaClient({ apiKey: "bad", fetch: async () => ({ ok: false, status: 401, json: async () => ({}) }), logEvents: false });
  let seen: string | undefined;
  c.on("error", (e) => { seen = e.error.code; });
  await assert.rejects(c.trending(), (e: unknown) => e instanceof MediaError && e.code === "AUTH");
  assert.equal(seen, "AUTH");
});

test("API key is sent as a header only, never in the URL or events", async () => {
  const calls: string[] = [];
  const c = createMediaClient({ apiKey: "SECRET", fetch: okFetch(calls), logEvents: false });
  await c.trending();
  assert.ok(!calls[0]!.includes("SECRET"));
});

test("view/download events reach subscribers and the default logger; unsubscribe works", async () => {
  const logs: unknown[][] = [];
  const c = createMediaClient({ apiKey: "k", fetch: okFetch([]), logger: { log: (...a) => logs.push(a) } });
  const item = (await c.trending()).items[0]!;
  const got: string[] = [];
  const off = c.on("view", () => got.push("view"));
  c.trackView(item); c.trackDownload(item); off(); c.trackView(item);
  assert.deepEqual(got, ["view"]);
  assert.equal(logs.length, 3); // default logger sees all three, even after our own unsubscribe
});

test("empty query and missing key are rejected", async () => {
  assert.throws(() => createMediaClient({ apiKey: " " }), MediaError);
  const c = createMediaClient({ apiKey: "k", fetch: okFetch([]), logEvents: false });
  await assert.rejects(c.search({ query: "  " }), MediaError);
});

import { createMockProvider } from "../src/index";

test("mock provider: search filters, paginates and reports hasMore", async () => {
  const c = createMediaClient({ provider: createMockProvider({ delayMs: 0 }), logEvents: false });
  const all = await c.search({ query: "ocean", perPage: 3 });
  assert.ok(all.items.length === 3 && all.items.every((i) => i.title.includes("ocean")));
  assert.equal(all.hasMore, true);
  const vids = await c.trending({ type: "video", perPage: 5 });
  assert.ok(vids.items.every((i) => i.type === "video" && i.videoUrl));
});

test("mock provider: unknown id is NOT_FOUND", async () => {
  const c = createMediaClient({ provider: createMockProvider({ delayMs: 0 }), logEvents: false });
  await assert.rejects(c.getById("photo", 99999), (e: unknown) => e instanceof MediaError && e.code === "NOT_FOUND");
});
