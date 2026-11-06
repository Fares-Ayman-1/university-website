"use client";

import { useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { QuestionCard, type QuizQuestion } from "@/components/quiz/QuestionCard";
import { ArLine } from "./Arabic";
import styles from "./Quiz.module.css";

export type { QuizQuestion };

export function Quiz({
  title = "Check your understanding",
  titleAr = "اختبر فهمك",
  id = "quiz",
  questions,
}: {
  title?: string;
  titleAr?: string;
  /** Anchor for links from the subject's exam review (one quiz per page) */
  id?: string;
  questions: QuizQuestion[];
}) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.reduce<number>((sum, p, i) => sum + (p === questions[i].answer ? 1 : 0), 0);
  const done = answered === questions.length;

  function choose(questionIndex: number, optionIndex: number) {
    setPicked((current) =>
      current[questionIndex] !== null
        ? current
        : current.map((value, i) => (i === questionIndex ? optionIndex : value)),
    );
  }

  return (
    <section id={id} className={`${styles.quiz} reveal`} aria-label={title}>
      <header className={styles.head}>
        <div>
          <p className="kicker">Quiz</p>
          <p className={styles.title}>
            {title}
            <ArLine>{titleAr}</ArLine>
          </p>
        </div>
        <p className={styles.progress} aria-live="polite">
          {answered}/{questions.length} answered
        </p>
      </header>

      <ol className={styles.questions}>
        {questions.map((question, qi) => (
          <li key={qi} className={styles.question}>
            <QuestionCard
              question={question}
              index={qi}
              choice={picked[qi]}
              onChoose={(option) => choose(qi, option)}
              mode="instant"
            />
          </li>
        ))}
      </ol>

      {done ? (
        <footer className={styles.result}>
          <Trophy aria-hidden="true" />
          <p role="status">
            You scored <strong>{score}</strong> out of {questions.length}
            {score === questions.length ? ". Perfect!" : score >= questions.length * 0.7 ? ". Well done." : ". Review the sections above and try again."}
          </p>
          <button type="button" className={styles.reset} onClick={() => setPicked(questions.map(() => null))}>
            <RotateCcw aria-hidden="true" /> Retry
          </button>
        </footer>
      ) : null}
    </section>
  );
}
