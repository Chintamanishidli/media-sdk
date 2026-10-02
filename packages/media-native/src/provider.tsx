import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createMediaClient, type MediaClient, type MediaClientConfig } from "media-core";

const Ctx = createContext<MediaClient | null>(null);

export type MediaProviderProps =
  | { client: MediaClient; config?: never; children: ReactNode }
  | { config: MediaClientConfig; client?: never; children: ReactNode };

/** Pass `config` (the provider creates + memoises the client) or your own `client`. */
export function MediaProvider({ client, config, children }: MediaProviderProps) {
  const value = useMemo(
    () => client ?? createMediaClient(config!),
    // Re-create only if the key or base URL changes, not on every render of an inline config object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, config?.apiKey, config?.baseUrl, config?.provider],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMediaClient(): MediaClient {
  const c = useContext(Ctx);
  if (!c) throw new Error("useMediaClient must be used inside <MediaProvider>");
  return c;
}
