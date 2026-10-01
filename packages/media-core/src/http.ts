import { MediaError, errorFromStatus } from "./errors";

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean; status: number; json(): Promise<unknown>;
}>;

/** The API key lives only in this closure — it is never stored on the client object or in events. */
export function createHttp(opts: { apiKey: string; baseUrl: string; fetch: FetchLike }) {
  const { apiKey, baseUrl, fetch } = opts;
  return async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    const url = `${baseUrl}${path}${qs ? `?${qs}` : ""}`;
    let res;
    try {
      res = await fetch(url, { headers: { Authorization: apiKey } });
    } catch {
      throw new MediaError("NETWORK", "Network request failed");
    }
    if (!res.ok) throw errorFromStatus(res.status);
    return (await res.json()) as T;
  };
}
