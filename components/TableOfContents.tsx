"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";
import styles from "./ResourceLayout.module.css";

export function TableOfContents({ headings, variant }: { headings: Heading[]; variant: "side" | "inline" }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

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
    <nav className={styles.tocSide} aria-label="On this page">
      <p className={styles.sideTitle}>On this page</p>
      {list}
    </nav>
  );
}
