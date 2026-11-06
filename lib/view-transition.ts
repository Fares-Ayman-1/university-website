import { prefersReducedMotion } from "@/lib/motion";

/**
 * Runs `update` inside a View Transition tagged with `html[data-vt=<type>]`, so CSS can give
 * this kind of transition its own animation (globals.css turns the default one off, because
 * the theme toggle drives its own circular reveal). Falls back to a plain update.
 */
export function withViewTransition(update: () => void, type: string) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  const root = document.documentElement;
  root.dataset.vt = type;
  const transition = document.startViewTransition(update);
  transition.finished.finally(() => {
    if (root.dataset.vt === type) delete root.dataset.vt;
  });
}

const ANCHOR_SELECTOR = "main h1, main h2, main h3, main h4, main p, main li, main figure, main pre, main table, main section, main article";

/** The first non-Arabic block that reaches the reading line (30% down the viewport). */
function findAnchor(): HTMLElement | null {
  const line = window.innerHeight * 0.3;
  for (const el of document.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR)) {
    if (el.closest(".ar")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0) continue;
    if (rect.bottom > line) return el;
  }
  return null;
}

/**
 * Applies a layout-changing update (e.g. hiding every Arabic block) without moving the
 * reader's place: the block at the reading line stays where it was on screen.
 */
export function keepReadingPosition(update: () => void) {
  const anchor = window.scrollY > 0 ? findAnchor() : null;
  const before = anchor?.getBoundingClientRect().top;
  update();
  if (!anchor || before === undefined || !anchor.isConnected) return;
  const delta = anchor.getBoundingClientRect().top - before;
  if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
}
