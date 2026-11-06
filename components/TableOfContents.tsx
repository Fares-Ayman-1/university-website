"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/content";
import styles from "./ResourceLayout.module.css";

// useLayoutEffect warns during server rendering; the indicator only matters in the browser.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function TableOfContents({ headings, variant }: { headings: Heading[]; variant: "side" | "inline" }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // One indicator bar slides to the active heading (CSS transition on transform/height).
  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator || !active) return;
    const link = nav.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`);
    if (!link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    indicator.style.setProperty("--toc-y", `${linkRect.top - navRect.top + nav.scrollTop + 4}px`);
    indicator.style.setProperty("--toc-h", `${Math.max(linkRect.height - 8, 8)}px`);
    indicator.dataset.ready = "";
  }, [active]);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const list = (
    <ol className={styles.tocList}>
      {headings.map((heading) => (
        <li key={heading.id} data-depth={heading.depth}>
          <a href={`#${heading.id}`} aria-current={active === heading.id ? "location" : undefined}>
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className={styles.tocInline}>
        <summary>On this page</summary>
        {list}
      </details>
    );
  }

  return (
    <nav ref={navRef} className={styles.tocSide} aria-label="On this page">
      <span ref={indicatorRef} className={styles.tocIndicator} aria-hidden="true" />
      <p className={styles.sideTitle}>On this page</p>
      {list}
    </nav>
  );
}
