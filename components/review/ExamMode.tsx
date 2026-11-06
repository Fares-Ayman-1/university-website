"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Flag, Play, RotateCcw, Trophy } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { QuestionCard, type QuizQuestion } from "@/components/quiz/QuestionCard";
import styles from "./Review.module.css";

export type ExamQuestion = QuizQuestion & {
  id: string;
  collection: "lectures" | "sections";
  /** "Lecture 3: Neighbourhood Processing" */
  sourceLabel: string;
  href: string;
};

type Phase = { name: "setup" } | { name: "run"; questions: ExamQuestion[] } | { name: "done"; questions: ExamQuestion[] };

const SIZES = [10, 20, 0] as const; // 0 = all

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ExamMode({ questions }: { questions: ExamQuestion[] }) {
  const [phase, setPhase] = useState<Phase>({ name: "setup" });
  const [size, setSize] = useState<(typeof SIZES)[number]>(10);
  const [include, setInclude] = useState({ lectures: true, sections: true });
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);

  const pool = questions.filter((q) => include[q.collection]);

  // Shuffling happens only here, on click: never during render (server and client must agree).
  function start(fixed?: ExamQuestion[]) {
    const picked = fixed ?? shuffled(pool).slice(0, size === 0 ? pool.length : size);
    if (picked.length === 0) return;
    setAnswers(picked.map(() => null));
    setCurrent(0);
    setPhase({ name: "run", questions: picked });
  }

  if (phase.name === "setup") {
    return (
      <div className={styles.examSetup}>
        <fieldset className={styles.fieldset}>
          <legend>
            Questions <ArLine inline>عدد الأسئلة</ArLine>
          </legend>
          <div className={styles.choices}>
            {SIZES.map((value) => (
              <label key={value} className={styles.choice} data-checked={size === value}>
                <input type="radio" name="size" checked={size === value} onChange={() => setSize(value)} />
                {value === 0 ? `All (${pool.length})` : value}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend>
            Include <ArLine inline>تشمل</ArLine>
          </legend>
          <div className={styles.choices}>
            {(["lectures", "sections"] as const).map((kind) => (
              <label key={kind} className={styles.choice} data-checked={include[kind]} data-kind={kind}>
                <input
                  type="checkbox"
                  checked={include[kind]}
                  onChange={() => setInclude((value) => ({ ...value, [kind]: !value[kind] }))}
                />
                {kind === "lectures" ? "Lectures" : "Sections"} ({questions.filter((q) => q.collection === kind).length})
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" className={styles.primary} onClick={() => start()} disabled={pool.length === 0}>
          <Play aria-hidden="true" /> Start exam
        </button>
        <p className={styles.note}>
          Questions come from every quiz in this subject, in random order. Answers are revealed at the end.
          <ArLine>الأسئلة مأخوذة من كل اختبارات هذه المادة بترتيب عشوائي، وتظهر الإجابات في النهاية.</ArLine>
        </p>
      </div>
    );
  }

  const list = phase.questions;
  const score = answers.reduce<number>((sum, a, i) => sum + (a === list[i].answer ? 1 : 0), 0);

  if (phase.name === "done") {
    const percent = Math.round((score / list.length) * 100);
    return (
      <div className={styles.examDone}>
        <div className={styles.scoreCard} role="status">
          <Trophy aria-hidden="true" />
          <p className={styles.score}>
            {score} / {list.length}
            <span>{percent}%</span>
          </p>
          <p>
            {percent === 100 ? "Perfect score." : percent >= 70 ? "Well done." : "Review the pages linked below and try again."}
            <ArLine>{percent === 100 ? "علامة كاملة." : percent >= 70 ? "أحسنت." : "راجع الصفحات المرتبطة أدناه وحاول مرة أخرى."}</ArLine>
          </p>
          <div className={styles.actionsRow}>
            <button type="button" className={styles.primary} onClick={() => start(list)}>
              <RotateCcw aria-hidden="true" /> Retry these questions
            </button>
            <button type="button" className={styles.pill} onClick={() => setPhase({ name: "setup" })}>
              New exam
            </button>
          </div>
        </div>
        <ol className={styles.reviewList}>
          {list.map((question, i) => (
            <li key={question.id} className={styles.reviewItem}>
              <QuestionCard
                question={question}
                index={i}
                choice={answers[i]}
                mode="review"
                label={<Link href={question.href}>{question.sourceLabel}</Link>}
              />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const question = list[current];
  const answered = answers.filter((a) => a !== null).length;
  const last = current === list.length - 1;

  return (
    <div className={styles.examRun}>
      <div className={styles.progressRow}>
        <p aria-live="polite">
          Question {current + 1} of {list.length} · {answered} answered
        </p>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ transform: `scaleX(${answered / list.length})` }} />
        </div>
      </div>

      <div key={question.id} className={styles.examQuestion}>
        <QuestionCard
          question={question}
          index={current}
          choice={answers[current]}
          onChoose={(option) => setAnswers((value) => value.map((a, i) => (i === current ? option : a)))}
          mode="deferred"
          label={question.sourceLabel}
        />
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.pill} onClick={() => setCurrent((i) => i - 1)} disabled={current === 0}>
          <ArrowLeft aria-hidden="true" /> Previous
        </button>
        {last ? (
          <button type="button" className={styles.primary} onClick={() => setPhase({ name: "done", questions: list })}>
            <Flag aria-hidden="true" /> Finish{answered < list.length ? ` (${list.length - answered} unanswered)` : ""}
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={() => setCurrent((i) => i + 1)}>
            Next <ArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
