import { useCallback, useRef } from "react";

export interface UseGridOptions<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onSelect?: (item: T, index: number) => void;
  getLabel?: (item: T, index: number) => string;
  numColumns?: number;
}

/**
 * Headless grid for React Native. You render <FlatList> and <Pressable>; the hook supplies the props.
 *   <FlatList {...grid.getListProps()} renderItem={({ item, index }) =>
 *     <Pressable {...grid.getItemProps(item, index)}>…</Pressable>} />
 * Infinite scroll = FlatList's onEndReached. Note: FlatList cannot change numColumns after mount.
 */
export function useGrid<T>(options: UseGridOptions<T>) {
  const latest = useRef(options);
  latest.current = options;

  const onEndReached = useCallback(() => {
    const o = latest.current;
    if (o.hasMore && !o.isLoadingMore) o.onLoadMore?.();
  }, []);

  return {
    getListProps: () => ({
      data: options.items,
      keyExtractor: (item: T) => latest.current.getKey(item),
      numColumns: options.numColumns ?? 2,
      onEndReached,
      onEndReachedThreshold: 0.6,
    }),
    getItemProps: (item: T, index: number) => ({
      accessible: true,
      accessibilityRole: "button" as const,
      accessibilityLabel: options.getLabel?.(item, index),
      onPress: () => latest.current.onSelect?.(item, index),
    }),
    getLoadMoreButtonProps: () => ({
      accessibilityRole: "button" as const,
      accessibilityLabel: "Load more",
      disabled: !options.hasMore || Boolean(options.isLoadingMore),
      onPress: () => latest.current.onLoadMore?.(),
    }),
  };
}
