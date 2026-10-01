import { useCallback, useEffect, useRef, type MouseEvent } from "react";

export interface UseLightboxOptions {
  /** Index of the open item, or null when closed. You own this state. */
  index: number | null;
  count: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  loop?: boolean;
  /** Accessible name for the dialog. */
  label?: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Headless lightbox. While open it: locks body scroll, moves focus into the dialog, traps Tab,
 * handles Esc / ArrowLeft / ArrowRight, and restores focus to the trigger on close.
 */
export function useLightbox(options: UseLightboxOptions) {
  const { index, count, loop = false } = options;
  const isOpen = index !== null;
  const latest = useRef(options);
  latest.current = options;
  const dialog = useRef<HTMLElement | null>(null);

  const go = useCallback((delta: number) => {
    const { index: i, count: n, loop: lp, onIndexChange } = latest.current;
    if (i === null || n === 0) return;
    const raw = i + delta;
    const next = lp ? (raw + n) % n : Math.min(n - 1, Math.max(0, raw));
    if (next !== i) onIndexChange(next);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); latest.current.onClose(); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const root = dialog.current;
        if (!root) return;
        const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) { e.preventDefault(); root.focus(); return; }
        const first = items[0]!, last = items[items.length - 1]!, active = document.activeElement;
        if (!root.contains(active) || (e.shiftKey && (active === first || active === root))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, [isOpen, go]);

  const hasPrev = isOpen && (loop ? count > 1 : index > 0);
  const hasNext = isOpen && (loop ? count > 1 : index < count - 1);

  return {
    isOpen, index, hasPrev, hasNext, next: () => go(1), prev: () => go(-1),
    getBackdropProps: () => ({
      onClick: (e: MouseEvent) => { if (e.target === e.currentTarget) latest.current.onClose(); },
    }),
    getDialogProps: () => ({
      ref: (el: HTMLElement | null) => { dialog.current = el; },
      role: "dialog" as const, "aria-modal": true as const, "aria-label": options.label ?? "Media viewer", tabIndex: -1,
    }),
    getCloseButtonProps: () => ({ type: "button" as const, "aria-label": "Close", onClick: () => latest.current.onClose() }),
    getPrevButtonProps: () => ({ type: "button" as const, "aria-label": "Previous", disabled: !hasPrev, onClick: () => go(-1) }),
    getNextButtonProps: () => ({ type: "button" as const, "aria-label": "Next", disabled: !hasNext, onClick: () => go(1) }),
  };
}
