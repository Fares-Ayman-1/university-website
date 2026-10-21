"use client";

import { useEffect, useRef } from "react";
import { applyTheme, hasStoredTheme, readTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const REVEAL_MS = 700;
const REVEAL_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Follow OS theme changes until the visitor picks a theme themselves.
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (!hasStoredTheme()) applyTheme(event.matches ? "dark" : "light", false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = readTheme() === "dark" ? "light" : "dark";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion || !buttonRef.current) {
      applyTheme(next);
      return;
    }

    // The new theme grows as a circle from the centre of the toggle button
    // until it covers the farthest corner of the viewport.
    const rect = buttonRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          { duration: REVEAL_MS, easing: REVEAL_EASING, pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {
        // Transition was skipped (e.g. tab hidden); the theme is already applied.
      });
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <mask id="theme-toggle-mask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle className={styles.maskCircle} cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle className={styles.core} cx="12" cy="12" r="5" mask="url(#theme-toggle-mask)" />
        <g className={styles.rays}>
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </g>
      </svg>
    </button>
  );
}
