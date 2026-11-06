/**
 * Motion tokens for JavaScript-driven animation. app/globals.css is the source of truth
 * (--dur-*, --ease-*); keep these in step with it.
 *
 * The site's motion is calm: opacity and small translations, expo easing, no springs.
 */

/** Durations in seconds (framer-motion) */
export const DUR = {
  micro: 0.15,
  standard: 0.3,
  dramatic: 0.7,
} as const;

/** Durations in milliseconds (Web Animations API, timers) */
export const DUR_MS = {
  micro: 150,
  standard: 300,
  dramatic: 700,
} as const;

/** Cubic-bezier control points (framer-motion) */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutSmooth: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** The same curves as CSS strings (Web Animations API) */
export const EASE_CSS = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOutSmooth: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
