import { useEffect, useState } from "react";
import type { MediaError, MediaItem, MediaType } from "media-core";
import { useMediaClient } from "./provider";

export function useMediaItem(type: MediaType, id: number | undefined) {
  const client = useMediaClient();
  const [state, set] = useState<{ item: MediaItem | null; error: MediaError | null; loading: boolean }>({ item: null, error: null, loading: id !== undefined });
  useEffect(() => {
    if (id === undefined) return;
    let live = true;
    set({ item: null, error: null, loading: true });
    client.getById(type, id).then(
      (item) => live && set({ item, error: null, loading: false }),
      (error) => live && set({ item: null, error, loading: false }),
    );
    return () => { live = false; };
  }, [client, type, id]);
  return state;
}
