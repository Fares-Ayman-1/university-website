"use client";

import { useEffect, useState } from "react";
import { applyArabicShown, readArabicShown } from "@/lib/arabic";
import { keepReadingPosition, withViewTransition } from "@/lib/view-transition";
import styles from "./ArabicToggle.module.css";

/** Shows or hides every Arabic translation on the site; the choice is remembered. */
export function ArabicToggle() {
  // The init script in app/layout.tsx sets data-arabic before paint; sync with it after hydration.
  const [shown, setShown] = useState(true);
  useEffect(() => setShown(readArabicShown()), []);

  function toggle() {
    const next = !readArabicShown();
    setShown(next);
    // Showing or hiding every translation reflows the whole page: cross-fade it, and keep
    // the paragraph the reader is on in the same place on screen.
    withViewTransition(() => keepReadingPosition(() => applyArabicShown(next)), "arabic");
  }

  const label = shown ? "Hide Arabic translation · إخفاء الترجمة العربية" : "Show Arabic translation · إظهار الترجمة العربية";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-pressed={shown}
      aria-label={label}
      title={label}
    >
      <span lang="ar" aria-hidden="true">
        ع
      </span>
    </button>
  );
}
