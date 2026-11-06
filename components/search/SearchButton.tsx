"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { loadSearchIndex } from "@/lib/search-client";
import styles from "./Search.module.css";

const loadPalette = () => import("./CommandPalette");
const CommandPalette = dynamic(() => loadPalette().then((module) => module.CommandPalette), { ssr: false });

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/** Header search button; Ctrl/⌘+K or "/" opens the palette from anywhere. */
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const prefetch = useCallback(() => {
    loadPalette();
    loadSearchIndex().catch(() => {});
  }, []);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        onClick={() => setOpen(true)}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        aria-label="Search lessons (Ctrl+K)"
        aria-haspopup="dialog"
        title="Search · بحث"
      >
        <Search aria-hidden="true" />
        <span className={styles.buttonLabel}>Search</span>
        <kbd className={styles.kbd}>{mac ? "⌘" : "Ctrl"} K</kbd>
      </button>
      {open ? <CommandPalette onClose={close} /> : null}
    </>
  );
}
