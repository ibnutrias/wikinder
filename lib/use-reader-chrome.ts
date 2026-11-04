"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  /** Called once when the reader passes 90% of its scrollable height. */
  onNearEnd?: () => void;
};

/**
 * Scroll chrome for the reader: progress bar via `transform: scaleX` and a
 * header that hides on downward scroll. Both are driven by one rAF-throttled
 * listener; React state changes only when the direction flips.
 */
export function useReaderChrome(
  progressRef: RefObject<HTMLDivElement | null>,
  options: Options = {},
): { headerHidden: boolean } {
  const [headerHidden, setHeaderHidden] = useState(false);
  const nearEndRef = useRef(false);
  const nearEnd = options.onNearEnd;
  const nearEndCallback = useRef(nearEnd);

  useEffect(() => {
    nearEndCallback.current = nearEnd;
  }, [nearEnd]);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let hidden = false;

    const update = (): void => {
      frame = 0;
      const y = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }

      if (Math.abs(y - lastY) > 8) {
        const nextHidden = y > lastY && y > 120;
        if (nextHidden !== hidden) {
          hidden = nextHidden;
          setHeaderHidden(nextHidden);
        }
        lastY = y;
      }

      if (progress >= 0.9 && !nearEndRef.current) {
        nearEndRef.current = true;
        nearEndCallback.current?.();
      }
      if (progress < 0.85) nearEndRef.current = false;
    };

    const onScroll = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [progressRef]);

  return { headerHidden };
}
