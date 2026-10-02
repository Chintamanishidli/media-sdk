import { useCallback, useRef, useState } from "react";

export interface UseReelSwiperOptions<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  initialIndex?: number;
  onActiveChange?: (index: number) => void;
  /** Percent of a slide that must be visible to count as active. Default 60. */
  viewabilityThreshold?: number;
  label?: string;
}

interface ScrollTarget { scrollToOffset(p: { offset: number; animated?: boolean }): void }
interface ViewableChange { viewableItems: ReadonlyArray<{ index: number | null; isViewable: boolean }> }

/**
 * Headless vertical pager for React Native, built on FlatList paging.
 *   <FlatList {...reel.getListProps()} renderItem={({ item, index }) =>
 *     <View {...reel.getItemProps(index)}> <Video paused={index !== reel.activeIndex} /> </View>} />
 * The list must be given a definite height (e.g. flex: 1 in a full-screen parent); each slide takes that height
 * via getItemProps().style (functional layout, not visual styling).
 */
export function useReelSwiper<T>(options: UseReelSwiperOptions<T>) {
  const initial = options.initialIndex ?? 0;
  const [activeIndex, setActiveIndex] = useState(initial);
  const [height, setHeight] = useState(0);
  const latest = useRef(options);
  latest.current = options;
  const heightRef = useRef(0);
  const active = useRef(initial);
  const list = useRef<ScrollTarget | null>(null);
  const laidOut = useRef(false);

  // FlatList requires these two to be referentially stable.
  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableChange) => {
    const first = viewableItems.find((v) => v.isViewable && v.index !== null);
    if (!first || first.index === null || first.index === active.current) return;
    active.current = first.index;
    setActiveIndex(first.index);
    latest.current.onActiveChange?.(first.index);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: options.viewabilityThreshold ?? 60 }).current;

  const scrollTo = useCallback((index: number) => {
    const i = Math.min(latest.current.items.length - 1, Math.max(0, index));
    list.current?.scrollToOffset({ offset: heightRef.current * i, animated: true });
  }, []);

  return {
    activeIndex, scrollTo,
    getListProps: () => ({
      data: options.items,
      keyExtractor: (item: T) => latest.current.getKey(item),
      ref: (r: ScrollTarget | null) => { list.current = r; },
      pagingEnabled: true,
      decelerationRate: "fast" as const,
      snapToAlignment: "start" as const,
      snapToInterval: height || undefined,
      showsVerticalScrollIndicator: false,
      viewabilityConfig,
      onViewableItemsChanged,
      getItemLayout: (_: ArrayLike<T> | null | undefined, index: number) => ({ length: height, offset: height * index, index }),
      accessibilityLabel: options.label ?? "Reels",
      onLayout: (e: { nativeEvent: { layout: { height: number } } }) => {
        const h = e.nativeEvent.layout.height;
        heightRef.current = h;
        setHeight(h);
        if (!laidOut.current && h > 0) {
          laidOut.current = true;
          if (initial > 0) list.current?.scrollToOffset({ offset: h * initial, animated: false });
          latest.current.onActiveChange?.(initial);
        }
      },
    }),
    getItemProps: (index: number) => ({
      accessibilityLabel: `${index + 1} of ${options.items.length}`,
      style: { height }, // functional: one slide per page
    }),
  };
}
