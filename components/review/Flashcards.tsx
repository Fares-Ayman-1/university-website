"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Shuffle } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import styles from "./Review.module.css";

export type Flashcard = {
  id: string;
  term: string;
  termAr?: string;
  href: string;
  /** "lectures/spatial-filtering": used by the filter */
  group: string;
  /** "Lecture 3: Neighbourhood Processing" */
  sourceLabel: string;
  /** The definition, rendered on the server with the page's components (math, Arabic…) */
  body: React.ReactNode;
};

export type FlashcardGroup = { key: string; label: string };

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

export function Flashcards({ cards, groups }: { cards: Flashcard[]; groups: FlashcardGroup[] }) {
  const [group, setGroup] = useState("all");
  const [order, setOrder] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(() => {
    const inGroup = cards.filter((card) => group === "all" || card.group === group);
    if (!order) return inGroup;
    const rank = new Map(order.map((id, i) => [id, i]));
    return [...inGroup].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  }, [cards, group, order]);

  const card = deck[Math.min(index, deck.length - 1)];

  function go(next: number) {
    if (deck.length === 0) return;
    setIndex((next + deck.length) % deck.length);
    setFlipped(false);
  }

  function shuffle() {
    const ids = cards.map((c) => c.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder(ids);
    setIndex(0);
    setFlipped(false);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      const onControl = (event.target as HTMLElement | null)?.closest?.("button, a, summary");
      if (event.key === "ArrowRight") go(index + 1);
      else if (event.key === "ArrowLeft") go(index - 1);
      // Space flips the card, unless a button or link has focus (Space activates it instead).
      else if (event.key === " " && !onControl) setFlipped((value) => !value);
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) {
    return <p className={styles.empty}>No definitions in this selection yet.</p>;
  }

  return (
    <div className={styles.deck}>
      <div className={styles.toolbar}>
        <label className={styles.select}>
          <span className="visually-hidden">Show cards from</span>
          <select
            value={group}
            onChange={(event) => {
              setGroup(event.target.value);
              setIndex(0);
              setFlipped(false);
            }}
          >
            <option value="all">All lectures and sections ({cards.length})</option>
            {groups.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label} ({cards.filter((c) => c.group === g.key).length})
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.pill} onClick={shuffle}>
          <Shuffle aria-hidden="true" /> Shuffle
        </button>
        <p className={styles.counter} aria-live="polite">
          Card {index + 1} of {deck.length}
        </p>
      </div>

      {/* Clicking anywhere on the card flips it; keyboard users use the Flip button or Space. */}
      <div key={card.id} className={styles.card} data-flipped={flipped} onClick={() => setFlipped((value) => !value)}>
        <div className={styles.face} data-face="front" inert={flipped || undefined}>
          <p className="kicker">
            Term <ArLine inline>المصطلح</ArLine>
          </p>
          <p className={styles.term}>{card.term}</p>
          <ArLine>{card.termAr}</ArLine>
          <p className={styles.hint}>
            Click the card or press Space to see the definition
            <ArLine>انقر البطاقة أو اضغط Space لعرض التعريف</ArLine>
          </p>
        </div>
        <div className={styles.face} data-face="back" inert={!flipped || undefined}>
          <p className="kicker">
            {card.term} <ArLine inline>{card.termAr}</ArLine>
          </p>
          <div className={styles.definition}>{card.body}</div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button type="button" className={styles.navButton} onClick={() => go(index - 1)} aria-label="Previous card">
          <ArrowLeft aria-hidden="true" />
        </button>
        <button type="button" className={styles.flip} aria-pressed={flipped} onClick={() => setFlipped((value) => !value)}>
          {flipped ? "Show term" : "Show definition"}
        </button>
        <button type="button" className={styles.navButton} onClick={() => go(index + 1)} aria-label="Next card">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
      <p className={styles.sourceRow}>
        <Link href={card.href} className={styles.sourceLink}>
          {card.sourceLabel} <ExternalLink aria-hidden="true" />
        </Link>
      </p>
      <p className={styles.keys} aria-hidden="true">
        <kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> previous / next
      </p>
      <p className="visually-hidden" aria-live="polite">
        {flipped ? `Definition of ${card.term}` : `Term: ${card.term}`}
      </p>
    </div>
  );
}
