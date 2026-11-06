"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/motion";

const STAGGER_MS = 60;
const MAX_STAGGER_STEPS = 4;

/**
 * One-shot scroll reveal for server-rendered blocks marked with the `reveal` class.
 *
 * After mount (and after every client navigation) it hides only the `.reveal` elements that
 * are below the fold at that moment, then fades each one in once when it scrolls into view.
 * Elements already on screen are left alone, nothing ever re-animates on scroll-back, and
 * without JavaScript (or with reduced motion) every element simply stays visible.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.setProperty("--reveal-delay", `${Math.min(step, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
          el.dataset.reveal = "in";
          observer.unobserve(el);
          step += 1;
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const fold = window.innerHeight;
    document.querySelectorAll<HTMLElement>(".reveal:not([data-reveal])").forEach((el) => {
      if (el.getBoundingClientRect().top < fold) return;
      el.dataset.reveal = "pending";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
