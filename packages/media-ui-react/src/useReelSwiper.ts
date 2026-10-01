import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export interface UseReelSwiperOptions {
  count: number;
  initialIndex?: number;
  onActiveChange?: (index: number) => void;
  /** Fraction of a slide that must be visible to count as active. Default 0.6. */
  threshold?: number;
  label?: string;
}

/**
 * Functional CSS the snap behaviour needs. Not visual styling, and NOT applied for you:
 * spread it onto your own elements (style={{ ...reelContainerStyle, height: "100dvh" }}).
 * Each slide must also be as tall as the container (e.g. height: 100%).
 */
export const reelContainerStyle: CSSProperties = { overflowY: "auto", scrollSnapType: "y mandatory", overscrollBehavior: "contain" };
export const reelItemStyle: CSSProperties = { scrollSnapAlign: "start", scrollSnapStop: "always" };

/** Headless vertical snap pager with active-slide detection (IntersectionObserver). */
export function useReelSwiper(options: UseReelSwiperOptions) {
  const { count, initialIndex = 0, threshold = 0.6 } = options;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const latest = useRef(options);
  latest.current = options;

  const slides = useRef(new Map<number, HTMLElement>());
  const refs = useRef(new Map<number, (el: HTMLElement | null) => void>());
  const observer = useRef<IntersectionObserver | null>(null);
  const active = useRef(initialIndex);

  const containerRef = useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < threshold) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          if (Number.isNaN(i) || i === active.current) continue;
          active.current = i;
          setActiveIndex(i);
          latest.current.onActiveChange?.(i);
        }
      },
      { root: el, threshold: [threshold] },
    );
    observer.current = io;
    slides.current.forEach((node) => io.observe(node));
    if (initialIndex > 0) slides.current.get(initialIndex)?.scrollIntoView({ block: "start" });
    else latest.current.onActiveChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slideRef = (index: number) => {
    let fn = refs.current.get(index);
    if (!fn) {
      fn = (el) => {
        const prev = slides.current.get(index);
        if (prev) { observer.current?.unobserve(prev); slides.current.delete(index); }
        if (el) { slides.current.set(index, el); observer.current?.observe(el); }
      };
      refs.current.set(index, fn);
    }
    return fn;
  };

  const scrollTo = useCallback((index: number) => {
    const i = Math.min(latest.current.count - 1, Math.max(0, index));
    slides.current.get(i)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const step = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key as string];
    if (step !== undefined) { e.preventDefault(); scrollTo(active.current + step); }
    else if (e.key === "Home") { e.preventDefault(); scrollTo(0); }
    else if (e.key === "End") { e.preventDefault(); scrollTo(latest.current.count - 1); }
  };

  return {
    activeIndex, scrollTo,
    getContainerProps: () => ({
      ref: containerRef, tabIndex: 0, role: "region" as const, "aria-roledescription": "carousel",
      "aria-label": options.label ?? "Reels", onKeyDown,
    }),
    getItemProps: (index: number) => ({
      ref: slideRef(index), "data-index": index, "data-active": index === activeIndex ? "true" : "false",
      role: "group" as const, "aria-roledescription": "slide", "aria-label": `${index + 1} of ${count}`,
    }),
  };
}
