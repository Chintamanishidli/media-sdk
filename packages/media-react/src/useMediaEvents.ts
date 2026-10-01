import { useEffect, useRef } from "react";
import type { MediaEvents } from "media-core";
import { useMediaClient } from "./provider";

type Handlers = { [K in keyof MediaEvents]?: (payload: MediaEvents[K]) => void };

/** Subscribe to SDK events for the lifetime of the component. Handlers may change without resubscribing. */
export function useMediaEvents(handlers: Handlers) {
  const client = useMediaClient();
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    const offs = [
      client.on("view", (p) => ref.current.view?.(p)),
      client.on("download", (p) => ref.current.download?.(p)),
      client.on("error", (p) => ref.current.error?.(p)),
    ];
    return () => offs.forEach((off) => off());
  }, [client]);
}

/** Stable actions for reporting activity (the SDK emits the events). */
export function useMediaActions() {
  const client = useMediaClient();
  return { trackView: client.trackView, trackDownload: client.trackDownload };
}
