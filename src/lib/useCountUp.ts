"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a displayed number from its current value to `target` over
 * `durationMs`. Whenever `target` changes it re-animates from wherever it
 * currently is — so dropping from the nominal wage to the real wage animates
 * smoothly. Respects prefers-reduced-motion by snapping instantly.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const cancel = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };

    // No animation needed (first mount, no change, or reduced motion): snap on
    // the next frame so we never call setState synchronously inside the effect.
    if (from === target || prefersReducedMotion() || durationMs <= 0) {
      fromRef.current = target;
      frameRef.current = requestAnimationFrame(() => setValue(target));
      return cancel;
    }

    const delta = target - from;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      setValue(from + delta * easeOutCubic(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return cancel;
  }, [target, durationMs]);

  return value;
}
