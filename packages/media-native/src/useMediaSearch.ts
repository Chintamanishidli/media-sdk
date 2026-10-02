import { useCallback, useEffect, useReducer, useRef } from "react";
import type { MediaError, MediaItem, MediaType } from "media-core";
import { useMediaClient } from "./provider";

export interface UseMediaSearchOptions {
  /** Empty/undefined query => trending feed. */
  query?: string;
  type?: MediaType;
  perPage?: number;
}

type State = {
  items: MediaItem[]; page: number; hasMore: boolean;
  status: "loading" | "success" | "error"; loadingMore: boolean; error: MediaError | null;
};
type Action =
  | { t: "reset" }
  | { t: "loaded"; items: MediaItem[]; page: number; hasMore: boolean; append: boolean }
  | { t: "more" }
  | { t: "failed"; error: MediaError };

const initial: State = { items: [], page: 0, hasMore: false, status: "loading", loadingMore: false, error: null };

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "reset": return initial;
    case "more": return { ...s, loadingMore: true, error: null };
    case "loaded": {
      const merged = a.append ? [...s.items, ...a.items.filter((n) => !s.items.some((o) => o.id === n.id))] : a.items;
      return { items: merged, page: a.page, hasMore: a.hasMore, status: "success", loadingMore: false, error: null };
    }
    case "failed": return { ...s, status: s.items.length ? "success" : "error", loadingMore: false, error: a.error };
  }
}

export function useMediaSearch({ query = "", type = "photo", perPage = 24 }: UseMediaSearchOptions = {}) {
  const client = useMediaClient();
  const [state, dispatch] = useReducer(reducer, initial);
  const requestId = useRef(0); // ignore responses from superseded queries

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    const id = ++requestId.current;
    try {
      const q = query.trim();
      const res = q ? await client.search({ query: q, type, page, perPage }) : await client.trending({ type, page, perPage });
      if (id === requestId.current) dispatch({ t: "loaded", items: res.items, page: res.page, hasMore: res.hasMore, append });
    } catch (e) {
      if (id === requestId.current) dispatch({ t: "failed", error: e as MediaError });
    }
  }, [client, query, type, perPage]);

  useEffect(() => { dispatch({ t: "reset" }); void fetchPage(1, false); }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.loadingMore || !state.hasMore || state.status === "loading") return;
    dispatch({ t: "more" });
    void fetchPage(state.page + 1, true);
  }, [fetchPage, state.loadingMore, state.hasMore, state.status, state.page]);

  const retry = useCallback(() => {
    dispatch({ t: "reset" });
    void fetchPage(1, false);
  }, [fetchPage]);

  return {
    items: state.items, status: state.status, error: state.error,
    isLoading: state.status === "loading", isLoadingMore: state.loadingMore,
    hasMore: state.hasMore, loadMore, retry,
  };
}
