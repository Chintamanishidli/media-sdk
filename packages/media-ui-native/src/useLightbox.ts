import { useCallback, useMemo, useRef } from "react";
import { PanResponder } from "react-native";

export interface UseLightboxOptions {
  /** Index of the open item, or null when closed. You own this state. */
  index: number | null;
  count: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  loop?: boolean;
  label?: string;
  /** Horizontal swipe distance (px) that changes item. Default 50. */
  swipeThreshold?: number;
}

/**
 * Headless lightbox for React Native, built around <Modal>.
 *   <Modal {...lb.getModalProps()}>
 *     <Pressable style={StyleSheet.absoluteFill} {...lb.getBackdropProps()} />
 *     <View {...lb.getContentProps()}> image, <Pressable {...lb.getPrevButtonProps()} />, … </View>
 *   </Modal>
 * Handles Android back button (onRequestClose), swipe left/right, and screen-reader modal semantics.
 */
export function useLightbox(options: UseLightboxOptions) {
  const { index, count, loop = false } = options;
  const isOpen = index !== null;
  const latest = useRef(options);
  latest.current = options;

  const go = useCallback((delta: number) => {
    const { index: i, count: n, loop: lp, onIndexChange } = latest.current;
    if (i === null || n === 0) return;
    const raw = i + delta;
    const next = lp ? (raw + n) % n : Math.min(n - 1, Math.max(0, raw));
    if (next !== i) onIndexChange(next);
  }, []);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_e, g) => {
          const t = latest.current.swipeThreshold ?? 50;
          if (g.dx <= -t) go(1);
          else if (g.dx >= t) go(-1);
        },
      }),
    [go],
  );

  const hasPrev = isOpen && (loop ? count > 1 : index > 0);
  const hasNext = isOpen && (loop ? count > 1 : index < count - 1);

  return {
    isOpen, index, hasPrev, hasNext, next: () => go(1), prev: () => go(-1),
    getModalProps: () => ({
      visible: isOpen,
      transparent: true,
      animationType: "fade" as const,
      statusBarTranslucent: true,
      onRequestClose: () => latest.current.onClose(),
    }),
    getBackdropProps: () => ({
      accessibilityRole: "button" as const,
      accessibilityLabel: "Close",
      onPress: () => latest.current.onClose(),
    }),
    getContentProps: () => ({
      accessibilityViewIsModal: true,
      accessibilityLabel: options.label ?? "Media viewer",
      ...pan.panHandlers,
    }),
    getCloseButtonProps: () => ({ accessibilityRole: "button" as const, accessibilityLabel: "Close", onPress: () => latest.current.onClose() }),
    getPrevButtonProps: () => ({ accessibilityRole: "button" as const, accessibilityLabel: "Previous", disabled: !hasPrev, onPress: () => go(-1) }),
    getNextButtonProps: () => ({ accessibilityRole: "button" as const, accessibilityLabel: "Next", disabled: !hasNext, onPress: () => go(1) }),
  };
}
