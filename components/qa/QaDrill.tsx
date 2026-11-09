"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { QaBank, QaDrillData, QaMcq, QaQuestion, QaSort } from "@/lib/qa-schema";
import styles from "./QaDrill.module.css";

/*
 * The MCQ / classification drill from the standalone drill HTML files, rebuilt on the site's
 * theme. Behaviour matches the original: answers lock on the first pick, explanations show at
 * once, one-at-a-time or list view, retry wrong, reset with a second click, keyboard letters
 * and arrows, and progress saved in this browser (localStorage) only.
 */

const LETTERS = "abcde";

type SortAnswer = (number | null)[];
type Answer = number | SortAnswer;
type Status = "new" | "part" | "ok" | "bad";
type View = "focus" | "list";
type Filter = "all" | "new" | "ok" | "bad";
type State = {
  bank: string;
  view: View;
  filter: Filter;
  cur: Record<string, number>;
  answers: Record<string, Record<number, Answer>>;
  confirm: boolean;
};

type Props = {
  drill: Pick<QaDrillData, "kicker" | "heading" | "lede" | "foot" | "banksLabel" | "unit" | "banks">;
  /** localStorage key for this drill's progress */
  storageKey: string;
};

function emptyState(banks: QaBank[]): State {
  const cur: State["cur"] = {};
  const answers: State["answers"] = {};
  for (const bank of banks) {
    cur[bank.id] = 0;
    answers[bank.id] = {};
  }
  return { bank: banks[0].id, view: "focus", filter: "all", cur, answers, confirm: false };
}

function validAnswer(q: QaQuestion, v: unknown): v is Answer {
  if (q.kind === "sort") {
    return (
      Array.isArray(v) &&
      v.length === q.items.length &&
      v.every((x) => x === null || (Number.isInteger(x) && x >= 0 && x < q.categories.length))
    );
  }
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < q.options.length;
}

function sortedCount(v: Answer | undefined): number {
  return Array.isArray(v) ? v.filter((x) => x !== null).length : 0;
}

function statusOf(q: QaQuestion, v: Answer | undefined): Status {
  if (q.kind === "sort") {
    const n = sortedCount(v);
    if (n === 0) return "new";
    if (n < q.items.length) return "part";
    return q.items.every((item, j) => (v as SortAnswer)[j] === item.category) ? "ok" : "bad";
  }
  return v === undefined ? "new" : v === q.answer ? "ok" : "bad";
}

function bankStats(bank: QaBank, answers: Record<number, Answer>) {
  let ok = 0;
  let bad = 0;
  bank.questions.forEach((q, i) => {
    const st = statusOf(q, answers[i]);
    if (st === "ok") ok++;
    else if (st === "bad") bad++;
  });
  const total = bank.questions.length;
  return { ok, bad, total, left: total - ok - bad };
}

/** Plain text with `code` spans, and (in question text) ____ or .... runs drawn as blanks. */
function Rich({ text, blanks = false }: { text: string; blanks?: boolean }) {
  return text.split(/`([^`]+)`/).map((part, i) => {
    if (i % 2 === 1) return <code key={i}>{part}</code>;
    if (!blanks) return part;
    return part.split(/_{3,}|\.{4,}/).map((piece, j) =>
      j === 0 ? (
        <span key={`${i}-${j}`}>{piece}</span>
      ) : (
        <span key={`${i}-${j}`}>
          <span className={styles.blank} role="img" aria-label="blank" />
          {piece}
        </span>
      ),
    );
  });
}

function Mark({ kind }: { kind: "ok" | "bad" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path pathLength={1} d={kind === "ok" ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} />
    </svg>
  );
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Bottom edge of the sticky site header + subject tabs, so scrolling never hides a card under them. */
function stickyTop(): number {
  const nav = document.querySelector('nav[aria-label="Subject navigation"]');
  return nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
}

function bringIntoView(el: Element | null | undefined) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const top = stickyTop();
  if (r.top < top) window.scrollBy({ top: r.top - top - 12, behavior: scrollBehavior() });
  else if (r.bottom > window.innerHeight) window.scrollBy({ top: r.bottom - window.innerHeight + 20, behavior: scrollBehavior() });
}

export function QaDrill({ drill, storageKey }: Props) {
  const { banks } = drill;
  const uid = useId();
  const quizId = `${uid}-quiz`;
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDetailsElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const afterRender = useRef<(() => void) | null>(null);
  const [s, setS] = useState<State>(() => emptyState(banks));
  const [ready, setReady] = useState(false);

  const bank = banks.find((b) => b.id === s.bank) ?? banks[0];
  const answers = s.answers[bank.id] ?? {};
  const stats = bankStats(bank, answers);
  const unitOne = drill.unit.replace(/s$/, "");

  const statusAt = (i: number) => statusOf(bank.questions[i], answers[i]);
  const matches = (i: number) => {
    const st = statusAt(i);
    return s.filter === "all" || st === s.filter || (s.filter === "new" && st === "part");
  };
  const q$ = (selector: string) => rootRef.current?.querySelector<HTMLElement>(selector) ?? null;

  // Saved progress and #bank in the URL (after mount, so the server render stays the default).
  useEffect(() => {
    const next = emptyState(banks);
    try {
      const d = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (d) {
        for (const b of banks) {
          const A = d.answers?.[b.id];
          if (A && typeof A === "object") {
            for (const k of Object.keys(A)) {
              const i = Number(k);
              if (Number.isInteger(i) && i >= 0 && i < b.questions.length && validAnswer(b.questions[i], A[k])) {
                next.answers[b.id][i] = A[k];
              }
            }
          }
          const c = d.cur?.[b.id];
          if (Number.isInteger(c) && c >= 0 && c < b.questions.length) next.cur[b.id] = c;
        }
        if (banks.some((b) => b.id === d.bank)) next.bank = d.bank;
        if (d.view === "list" || d.view === "focus") next.view = d.view;
      }
    } catch {
      // Storage blocked or corrupt: start fresh.
    }
    const fromHash = banks.find((b) => `#${b.id}` === window.location.hash);
    if (fromHash) next.bank = fromHash.id;
    setS(next);
    setReady(true);
    if (window.matchMedia?.("(max-width: 899px)").matches && mapRef.current) mapRef.current.open = false;
  }, [banks, storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers: s.answers, cur: s.cur, bank: s.bank, view: s.view }));
    } catch {
      // Private window or storage full: progress just isn't kept.
    }
  }, [ready, storageKey, s.answers, s.cur, s.bank, s.view]);

  // Focus and scrolling that need the new DOM.
  useEffect(() => {
    const run = afterRender.current;
    afterRender.current = null;
    run?.();
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  // ---------- Actions ----------
  function setAnswer(i: number, value: Answer | undefined) {
    setS((prev) => {
      const forBank = { ...prev.answers[bank.id] };
      if (value === undefined) delete forBank[i];
      else forBank[i] = value;
      return { ...prev, answers: { ...prev.answers, [bank.id]: forBank } };
    });
  }

  function answer(i: number, k: number) {
    const q = bank.questions[i];
    if (q.kind !== "mcq" || answers[i] !== undefined || k >= q.options.length) return;
    setAnswer(i, k);
    const view = s.view;
    afterRender.current = () => {
      q$(`[data-q="${i}"] [data-k="${k}"]`)?.focus({ preventScroll: true });
      bringIntoView(view === "focus" ? q$("[data-pager]") : q$(`[data-q="${i}"] [data-fb]`));
    };
  }

  function assign(i: number, n: number, k: number) {
    const q = bank.questions[i];
    if (q.kind !== "sort") return;
    const cur = answers[i];
    const arr: SortAnswer = Array.isArray(cur) ? cur.slice() : q.items.map(() => null);
    if (arr[n] !== null) return;
    arr[n] = k;
    setAnswer(i, arr);
    const view = s.view;
    const finished = sortedCount(arr) === q.items.length;
    afterRender.current = () => {
      q$(`[data-q="${i}"] [data-it="${n}"] [data-c="${k}"]`)?.focus({ preventScroll: true });
      if (finished) bringIntoView(view === "focus" ? q$("[data-pager]") : q$(`[data-q="${i}"] [data-fb]`));
    };
  }

  function setCur(i: number) {
    const next = Math.max(0, Math.min(bank.questions.length - 1, i));
    setS((prev) => ({ ...prev, cur: { ...prev.cur, [bank.id]: next } }));
    afterRender.current = () => bringIntoView(q$("[data-card]"));
  }

  function goTo(i: number) {
    if (s.view === "focus") {
      setCur(i);
      return;
    }
    if (!matches(i)) setS((prev) => ({ ...prev, filter: "all" }));
    afterRender.current = () => q$(`[data-q="${i}"]`)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function selectBank(id: string) {
    if (id === s.bank) return;
    clearTimeout(timer.current);
    setS((prev) => ({ ...prev, bank: id, filter: "all", confirm: false }));
    try {
      window.history.replaceState(window.history.state, "", `#${id}`);
    } catch {
      // Ignore: the tab still switches.
    }
  }

  function toTop() {
    afterRender.current = () => rootRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function clearQuestion(i: number) {
    setAnswer(i, undefined);
    afterRender.current = () => q$(`[data-q="${i}"] button`)?.focus({ preventScroll: true });
  }

  function retryWrong() {
    let first = -1;
    const forBank = { ...answers };
    bank.questions.forEach((q, j) => {
      if (statusOf(q, answers[j]) === "bad") {
        delete forBank[j];
        if (first < 0) first = j;
      }
    });
    setS((prev) => ({
      ...prev,
      filter: "all",
      answers: { ...prev.answers, [bank.id]: forBank },
      cur: first >= 0 ? { ...prev.cur, [bank.id]: first } : prev.cur,
    }));
    toTop();
  }

  function reviewWrong() {
    setS((prev) => ({ ...prev, view: "list", filter: "bad" }));
    afterRender.current = () =>
      document.getElementById(quizId)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  function reset() {
    clearTimeout(timer.current);
    if (!s.confirm) {
      setS((prev) => ({ ...prev, confirm: true }));
      timer.current = setTimeout(() => setS((prev) => ({ ...prev, confirm: false })), 4000);
      return;
    }
    setS((prev) => ({
      ...prev,
      confirm: false,
      filter: "all",
      answers: { ...prev.answers, [bank.id]: {} },
      cur: { ...prev.cur, [bank.id]: 0 },
    }));
    toTop();
  }

  // Keyboard (one-at-a-time view): a–e or 1–5 answer, ← → move. Latest handlers via a ref.
  const keys = useRef({ answer, setCur, s, bank });
  useEffect(() => {
    keys.current = { answer, setCur, s, bank };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const { answer, setCur, s, bank } = keys.current;
      if (e.ctrlKey || e.metaKey || e.altKey || s.view !== "focus") return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (document.querySelector("dialog[open]")) return;
      const i = s.cur[bank.id] ?? 0;
      const q = bank.questions[i];
      let k = -1;
      if (e.key.length === 1) {
        const lk = e.key.toLowerCase();
        if (LETTERS.includes(lk)) k = LETTERS.indexOf(lk);
        else if ("12345".includes(lk)) k = Number(lk) - 1;
      }
      if (k > -1) {
        if (q.kind === "mcq" && k < q.options.length) {
          e.preventDefault();
          answer(i, k);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCur(i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCur(i - 1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onHash() {
      const b = banks.find((x) => `#${x.id}` === window.location.hash);
      if (b) setS((prev) => (prev.bank === b.id ? prev : { ...prev, bank: b.id, filter: "all", confirm: false }));
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [banks]);

  // ---------- Render ----------
  let totalOk = 0;
  let totalBad = 0;
  let totalQs = 0;
  for (const b of banks) {
    const st = bankStats(b, s.answers[b.id] ?? {});
    totalOk += st.ok;
    totalBad += st.bad;
    totalQs += st.total;
  }
  const totalDone = totalOk + totalBad;

  function renderMcq(q: QaMcq, i: number, v: Answer | undefined) {
    const done = v !== undefined;
    return (
      <div className={styles.opts} role="group" aria-label="Answer choices">
        {q.options.map((option, k) => {
          const state = !done ? undefined : k === q.answer ? "right" : k === v ? "wrong" : "dim";
          return (
            <button
              key={k}
              type="button"
              className={styles.opt}
              data-k={k}
              data-state={state}
              aria-disabled={done || undefined}
              onClick={() => answer(i, k)}
            >
              <span className={styles.ltr}>{LETTERS[k]}</span>
              <span className={styles.otxt}>
                <Rich text={option} />
              </span>
              <span className={styles.mark}>
                {state === "right" ? <Mark kind="ok" /> : state === "wrong" ? <Mark kind="bad" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  function renderSort(q: QaSort, i: number, v: Answer | undefined) {
    return (
      <>
        <p className={styles.sortHint}>Choose a category for every item.</p>
        <div className={styles.items}>
          {q.items.map((item, n) => {
            const c = Array.isArray(v) ? v[n] : null;
            const set = c !== null && c !== undefined;
            const right = set && c === item.category;
            return (
              <div key={n} className={styles.item} data-it={n} data-status={set ? (right ? "ok" : "bad") : undefined}>
                <div className={styles.itemHead}>
                  <span className={styles.itxt}>
                    <Rich text={item.text} />
                  </span>
                  <span className={styles.mark}>{set ? <Mark kind={right ? "ok" : "bad"} /> : null}</span>
                </div>
                <div className={styles.cats} role="group" aria-label="Category">
                  {q.categories.map((name, k) => {
                    const state = !set ? undefined : k === item.category ? "right" : k === c ? "wrong" : "dim";
                    return (
                      <button
                        key={k}
                        type="button"
                        className={styles.cat}
                        data-c={k}
                        data-state={state}
                        aria-disabled={set || undefined}
                        onClick={() => assign(i, n, k)}
                      >
                        <Rich text={name} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  function renderCard(i: number, focus: boolean) {
    const q = bank.questions[i];
    const v = answers[i];
    const st = statusOf(q, v);
    const done = st === "ok" || st === "bad";
    const pill =
      st === "ok"
        ? "Correct"
        : st === "bad"
          ? "Wrong"
          : st === "part" && q.kind === "sort"
            ? `${sortedCount(v)} of ${q.items.length} sorted`
            : "Not answered";
    return (
      <article
        key={`${bank.id}-${i}`}
        className={`${styles.card}${focus ? ` ${styles.enter}` : ""}`}
        data-card
        data-q={i}
        data-status={done ? st : undefined}
        data-locked={done || undefined}
      >
        <div className={styles.cardHead}>
          <span className={styles.eyebrow}>
            {q.group} · Question {i + 1} of {bank.questions.length}
            {q.kind === "sort" ? " · Classification" : ""}
          </span>
          <span className={styles.pill} data-status={done ? st : undefined}>
            {pill}
          </span>
        </div>
        <h3 className={styles.q}>
          <Rich text={q.text} blanks />
        </h3>
        {q.kind === "mcq" && q.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- small static figures, no optimisation needed
          <img className={styles.qimg} src={q.image} alt={q.alt ?? "Figure for the question"} loading="lazy" />
        ) : null}
        {q.kind === "sort" ? renderSort(q, i, v) : renderMcq(q, i, v)}
        {done ? (
          <div className={styles.fb} data-status={st} data-fb role="status">
            <p className={styles.fbTitle}>{st === "ok" ? "Correct" : "Not quite"}</p>
            {st === "bad" && q.kind === "sort" ? (
              <p>
                {q.items.filter((item, j) => (v as SortAnswer)[j] === item.category).length} of {q.items.length} items
                are in the right category. The correct category is highlighted green on each item.
              </p>
            ) : null}
            {st === "bad" && q.kind === "mcq" ? (
              <p>
                Correct answer:{" "}
                <strong>
                  {LETTERS[q.answer].toUpperCase()}) <Rich text={q.options[q.answer]} />
                </strong>
              </p>
            ) : null}
            {q.why ? (
              <p>
                <Rich text={q.why} />
              </p>
            ) : null}
            {q.ref || (q.kind === "mcq" && q.check) ? (
              <div className={styles.refs}>
                {q.ref ? <span className={styles.ref}>{q.ref}</span> : null}
                {q.kind === "mcq" && q.check ? (
                  <span className={`${styles.ref} ${styles.warn}`}>Double-check this answer</span>
                ) : null}
              </div>
            ) : null}
            <button type="button" className={styles.linkbtn} onClick={() => clearQuestion(i)}>
              Try this question again
            </button>
          </div>
        ) : null}
      </article>
    );
  }

  const cur = Math.min(s.cur[bank.id] ?? 0, bank.questions.length - 1);
  const listed = s.view === "list" ? bank.questions.map((_, i) => i).filter(matches) : [];
  const curStatus = statusAt(cur);
  const hasSort = banks.some((b) => b.questions.some((q) => q.kind === "sort"));
  const done = stats.ok + stats.bad;
  const accuracy = done ? `${Math.round((stats.ok / done) * 100)}%` : "–";
  const scoreMsg = !done
    ? "Answer a question to start scoring."
    : stats.left
      ? `${done} of ${stats.total} answered.`
      : !stats.bad
        ? "Perfect score."
        : `All answered. ${stats.bad} to review.`;
  const resetLabel = s.confirm ? "Click again to reset" : `Reset this ${unitOne}`;

  return (
    <div className={styles.drill} ref={rootRef}>
      <header className={styles.masthead}>
        <div>
          <p className="kicker">{drill.kicker}</p>
          <h2 className={styles.title}>{drill.heading}</h2>
          <p className={styles.lede}>{drill.lede}</p>
        </div>
        <p className={styles.totals}>
          <b>{totalQs}</b> questions in {banks.length} {drill.unit}
          <br />
          <b>{totalDone}</b> answered · <b>{totalDone ? `${Math.round((totalOk / totalDone) * 100)}%` : "–"}</b> correct
        </p>
      </header>

      <nav className={styles.banks} role="tablist" aria-label={drill.banksLabel}>
        {banks.map((b) => {
          const st = bankStats(b, s.answers[b.id] ?? {});
          const sel = b.id === bank.id;
          return (
            <button
              key={b.id}
              type="button"
              className={styles.bank}
              role="tab"
              aria-selected={sel}
              aria-controls={quizId}
              onClick={() => selectBank(b.id)}
            >
              <span className={styles.tag}>{b.tag}</span>
              <span className={styles.bname}>{b.name}</span>
              <span className={styles.bscope}>{b.scope}</span>
              <span className={styles.bar}>
                <i className={styles.segOk} style={{ width: `${(st.ok / st.total) * 100}%` }} />
                <i className={styles.segBad} style={{ width: `${(st.bad / st.total) * 100}%` }} />
              </span>
              <span className={styles.bmeta}>
                {st.ok + st.bad} / {st.total} answered · {st.ok} correct
              </span>
            </button>
          );
        })}
      </nav>

      <div className={styles.toolbar}>
        <div className={styles.seg} role="group" aria-label="View">
          <button type="button" aria-pressed={s.view === "focus"} onClick={() => setS((p) => ({ ...p, view: "focus" }))}>
            One at a time
          </button>
          <button type="button" aria-pressed={s.view === "list"} onClick={() => setS((p) => ({ ...p, view: "list" }))}>
            All questions
          </button>
        </div>
        {s.view === "list" ? (
          <div className={styles.chips} role="group" aria-label="Filter questions">
            {(
              [
                ["all", "All", stats.total],
                ["new", "Not answered", stats.left],
                ["ok", "Correct", stats.ok],
                ["bad", "Wrong", stats.bad],
              ] as const
            ).map(([f, label, n]) => (
              <button
                key={f}
                type="button"
                className={styles.chip}
                aria-pressed={s.filter === f}
                onClick={() => setS((p) => ({ ...p, filter: f }))}
              >
                {label}
                <span className={styles.n}>{n}</span>
              </button>
            ))}
          </div>
        ) : null}
        <span className={styles.spacer} />
        <button type="button" className={styles.btn} disabled={!stats.bad} onClick={retryWrong}>
          Retry wrong{stats.bad ? ` (${stats.bad})` : ""}
        </button>
        <button
          type="button"
          className={styles.btn}
          data-danger={s.confirm || undefined}
          disabled={Object.keys(answers).length === 0}
          onClick={reset}
        >
          {resetLabel}
        </button>
      </div>

      <section className={styles.quiz} id={quizId} aria-label="Quiz">
        <div className={styles.stage}>
          <div className={styles.cards}>
            {s.view === "focus" ? (
              <>
                {renderCard(cur, true)}
                <nav className={styles.pager} aria-label="Question navigation" data-pager>
                  <button type="button" className={styles.btn} disabled={cur === 0} onClick={() => setCur(cur - 1)}>
                    ← Previous
                  </button>
                  <span className={styles.hint}>Press a letter to answer · ← → to move</span>
                  <button
                    type="button"
                    className={styles.btn}
                    data-primary={curStatus === "ok" || curStatus === "bad" || undefined}
                    disabled={cur === bank.questions.length - 1}
                    onClick={() => setCur(cur + 1)}
                  >
                    Next →
                  </button>
                </nav>
              </>
            ) : listed.length ? (
              listed.map((i) => renderCard(i, false))
            ) : (
              <div className={styles.empty}>
                <p>No questions match this filter yet.</p>
                <button type="button" className={styles.btn} onClick={() => setS((p) => ({ ...p, filter: "all" }))}>
                  Show all questions
                </button>
              </div>
            )}
          </div>
          {stats.left === 0 ? (
            <section className={styles.summary}>
              <h3>{stats.bad ? `${unitOne.charAt(0).toUpperCase()}${unitOne.slice(1)} finished` : "Perfect score"}</h3>
              <p>
                {stats.ok} of {stats.total} correct ({Math.round((stats.ok / stats.total) * 100)}%).
                {stats.bad
                  ? ` The ${stats.bad} wrong ${stats.bad === 1 ? "answer is" : "answers are"} marked red in the question map.`
                  : ""}
              </p>
              <div className={styles.row}>
                {stats.bad ? (
                  <>
                    <button type="button" className={styles.btn} data-primary onClick={reviewWrong}>
                      Review wrong answers
                    </button>
                    <button type="button" className={styles.btn} onClick={retryWrong}>
                      Retry wrong
                    </button>
                  </>
                ) : null}
                <button type="button" className={styles.btn} data-danger={s.confirm || undefined} onClick={reset}>
                  {s.confirm ? "Click again to reset" : "Start over"}
                </button>
              </div>
            </section>
          ) : null}
        </div>

        <div className={styles.side}>
          <div className={styles.score}>
            <p className={styles.scoreHead}>Score · {bank.name}</p>
            <div className={styles.stats}>
              <div className={styles.stat} data-status="ok">
                <b>{stats.ok}</b>
                <span>Correct</span>
              </div>
              <div className={styles.stat} data-status="bad">
                <b>{stats.bad}</b>
                <span>Wrong</span>
              </div>
              <div className={styles.stat}>
                <b>{stats.left}</b>
                <span>Left</span>
              </div>
              <div className={styles.stat}>
                <b>{accuracy}</b>
                <span>Accuracy</span>
              </div>
            </div>
            <div className={styles.bar}>
              <i className={styles.segOk} style={{ width: `${(stats.ok / stats.total) * 100}%` }} />
              <i className={styles.segBad} style={{ width: `${(stats.bad / stats.total) * 100}%` }} />
            </div>
            <p className={styles.smsg}>{scoreMsg}</p>
          </div>
          <details className={styles.map} ref={mapRef} open>
            <summary>Question map</summary>
            <div className={styles.grid}>
              {bank.questions.map((q, i) => {
                const st = statusAt(i);
                const isCur = s.view === "focus" && cur === i;
                const label =
                  st === "ok" ? "correct" : st === "bad" ? "wrong" : st === "part" ? "partly sorted" : "not answered";
                return (
                  <button
                    key={i}
                    type="button"
                    className={styles.cell}
                    data-status={st}
                    data-cls={q.kind === "sort" || undefined}
                    data-cur={isCur || undefined}
                    aria-label={`Question ${i + 1}${q.kind === "sort" ? " (classification)" : ""}, ${label}`}
                    aria-current={isCur || undefined}
                    onClick={() => goTo(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <ul className={styles.legend}>
              <li>
                <i data-l="ok" />
                Correct
              </li>
              <li>
                <i data-l="bad" />
                Wrong
              </li>
              <li>
                <i data-l="new" />
                Not answered
              </li>
              {hasSort ? (
                <li>
                  <i data-l="cls" />
                  Classification
                </li>
              ) : null}
            </ul>
          </details>
        </div>
      </section>

      <p className={styles.foot}>{drill.foot}</p>
    </div>
  );
}
