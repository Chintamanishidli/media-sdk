import { useCallback, useEffect, useRef, type KeyboardEvent, type RefCallback } from "react";

export interface UseGridOptions<T> {
  items: readonly T[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onSelect?: (item: T, index: number) => void;
  getLabel?: (item: T, index: number) => string;
  /** IntersectionObserver rootMargin: start loading before the sentinel is visible. Default "400px". */
  rootMargin?: string;
}

/**
 * Headless grid: behaviour only. You render the markup and CSS.
 *  - getContainerProps()   -> the wrapper element
 *  - getItemProps(item, i) -> each cell (button semantics, arrow-key navigation)
 *  - getSentinelProps()    -> an empty element AFTER the cells; infinite scroll triggers when it nears the viewport
 *  - getLoadMoreButtonProps() -> optional "Load more" fallback button
 */
export function useGrid<T>(options: UseGridOptions<T>) {
  const latest = useRef(options);
  latest.current = options;

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinel = useRef<HTMLElement | null>(null);

  const sentinelRef: RefCallback<HTMLElement> = useCallback((el) => {
    observer.current?.disconnect();
    observer.current = null;
    sentinel.current = el;
    if (!el || typeof IntersectionObserver === "undefined") return;
    observer.current = new IntersectionObserver(
      (entries) => {
        const o = latest.current;
        if (entries.some((e) => e.isIntersecting) && o.hasMore && !o.isLoadingMore) o.onLoadMore?.();
      },
      { rootMargin: latest.current.rootMargin ?? "400px" },
    );
    observer.current.observe(el);
  }, []);

  // If the sentinel is still in view after a page arrives, the observer will not fire again by itself: re-arm it.
  const { items, hasMore, isLoadingMore } = options;
  useEffect(() => {
    const el = sentinel.current, io = observer.current;
    if (el && io && hasMore && !isLoadingMore) { io.unobserve(el); io.observe(el); }
  }, [items.length, hasMore, isLoadingMore]);

  const getContainerProps = () => ({ role: "group" as const, "aria-busy": Boolean(options.isLoadingMore) });

  const getItemProps = (item: T, index: number) => ({
    role: "button" as const,
    tabIndex: 0,
    "data-grid-item": "",
    "data-index": index,
    "aria-label": options.getLabel?.(item, index),
    onClick: () => latest.current.onSelect?.(item, index),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); latest.current.onSelect?.(item, index); return; }
      const cells = Array.from(e.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[data-grid-item]") ?? []);
      const at = cells.indexOf(e.currentTarget);
      const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key as string];
      if (move !== undefined) { e.preventDefault(); cells[at + move]?.focus(); }
      else if (e.key === "Home") { e.preventDefault(); cells[0]?.focus(); }
      else if (e.key === "End") { e.preventDefault(); cells[cells.length - 1]?.focus(); }
    },
  });

  const getSentinelProps = () => ({ ref: sentinelRef, "aria-hidden": true as const, "data-grid-sentinel": "" });

  const getLoadMoreButtonProps = () => ({
    type: "button" as const,
    hidden: !options.hasMore,
    disabled: !options.hasMore || Boolean(options.isLoadingMore),
    onClick: () => latest.current.onLoadMore?.(),
  });

  return { getContainerProps, getItemProps, getSentinelProps, getLoadMoreButtonProps };
}
