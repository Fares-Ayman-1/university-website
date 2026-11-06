"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CornerDownLeft, FlaskConical, Hash, Layers, LayoutGrid, Quote, Search } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { loadSearchIndex } from "@/lib/search-client";
import { search, type PreparedDoc, type SearchKind } from "@/lib/search";
import styles from "./Search.module.css";

const KIND_ICON: Record<SearchKind, React.ComponentType<{ "aria-hidden"?: boolean }>> = {
  subject: LayoutGrid,
  lecture: BookOpen,
  section: FlaskConical,
  heading: Hash,
  definition: Quote,
  review: Layers,
};

const KIND_LABEL: Record<SearchKind, string> = {
  subject: "Subject",
  lecture: "Lecture",
  section: "Section",
  heading: "Heading",
  definition: "Definition",
  review: "Review",
};

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [docs, setDocs] = useState<PreparedDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    let cancelled = false;
    loadSearchIndex()
      .then((index) => !cancelled && setDocs(index))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!docs) return [];
    if (!query.trim()) return docs.filter((doc) => doc.kind === "subject");
    return search(docs, query);
  }, [docs, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(doc: PreparedDoc | undefined) {
    if (!doc) return;
    onClose();
    router.push(doc.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  }

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Search lessons"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.inputRow}>
          <Search aria-hidden="true" />
          <input
            autoFocus
            className={styles.input}
            type="search"
            placeholder="Search lectures, sections, headings, terms…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
            aria-autocomplete="list"
            spellCheck={false}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        <ArLine>ابحث في المحاضرات والسكاشن والعناوين والمصطلحات (بالعربية أو الإنجليزية)</ArLine>

        <div className={styles.results}>
          {!query.trim() && docs ? <p className={styles.groupLabel}>Subjects</p> : null}
          {failed ? (
            <p className={styles.empty}>Search is unavailable right now. Check your connection and try again.</p>
          ) : !docs ? (
            <p className={styles.empty}>Loading…</p>
          ) : results.length === 0 ? (
            <p className={styles.empty} role="status">
              No results for “{query}”.
              <ArLine>لا توجد نتائج.</ArLine>
            </p>
          ) : (
            <ul ref={listRef} id={listId} role="listbox" className={styles.list} aria-label="Results">
              {results.map((doc, index) => {
                const Icon = KIND_ICON[doc.kind];
                return (
                  <li
                    key={`${doc.href}-${doc.title}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    data-kind={doc.kind}
                    className={styles.option}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(doc)}
                  >
                    <span className={styles.optionIcon}>
                      <Icon aria-hidden />
                    </span>
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>{doc.title}</span>
                      {doc.titleAr ? <ArLine>{doc.titleAr}</ArLine> : null}
                      <span className={styles.optionContext}>
                        {KIND_LABEL[doc.kind]} · {doc.context}
                      </span>
                    </span>
                    {index === active ? <CornerDownLeft className={styles.enter} aria-hidden="true" /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className={styles.footer} aria-hidden="true">
          <span>
            <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd> move
          </span>
          <span>
            <kbd className={styles.kbd}>Enter</kbd> open
          </span>
          <span>
            <kbd className={styles.kbd}>Esc</kbd> close
          </span>
        </p>
      </div>
    </dialog>
  );
}
