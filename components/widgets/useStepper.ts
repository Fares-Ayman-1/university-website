"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export type Stepper = {
  index: number;
  count: number;
  go: (index: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  playing: boolean;
  toggle: () => void;
  atStart: boolean;
  atEnd: boolean;
  /** Visitor prefers reduced motion: jump between states instead of tweening */
  reduced: boolean;
};

/**
 * Step-through state for a widget. Never autoplays; while playing it pauses by itself when
 * the widget scrolls out of view or the tab is hidden, and stops at the last step.
 */
export function useStepper(
  count: number,
  { interval = 1100, frameRef }: { interval?: number; frameRef?: React.RefObject<HTMLElement | null> } = {},
): Stepper {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const last = Math.max(count - 1, 0);

  const go = useCallback((i: number) => setIndex(Math.min(Math.max(i, 0), last)), [last]);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const toggle = useCallback(() => {
    setPlaying((value) => {
      if (!value) setIndex((i) => (i >= last ? 0 : i)); // replay from the start when at the end
      return !value;
    });
  }, [last]);

  // Keep the index valid when the number of steps changes (e.g. a different input).
  useEffect(() => setIndex((i) => Math.min(i, last)), [last]);

  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [playing, interval, last]);

  // Pause when the widget leaves the viewport or the tab is hidden.
  useEffect(() => {
    const frame = frameRef?.current;
    const onVisibility = () => document.hidden && setPlaying(false);
    document.addEventListener("visibilitychange", onVisibility);
    let observer: IntersectionObserver | undefined;
    if (frame && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting && playingRef.current) setPlaying(false);
      });
      observer.observe(frame);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [frameRef]);

  return {
    index: Math.min(index, last),
    count,
    go,
    next,
    prev,
    reset,
    playing,
    toggle,
    atStart: index <= 0,
    atEnd: index >= last,
    reduced,
  };
}

/**
 * Keyboard for a focusable widget body: ← / → step, Home resets, Space plays or pauses.
 * Space only when the body itself has focus, so a focused button's own Space still works.
 */
export function stepperKeyDown(stepper: Stepper) {
  return (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
    if (event.key === "ArrowRight") stepper.next();
    else if (event.key === "ArrowLeft") stepper.prev();
    else if (event.key === "Home") stepper.reset();
    else if (event.key === " " && target === event.currentTarget) stepper.toggle();
    else return;
    event.preventDefault();
  };
}
