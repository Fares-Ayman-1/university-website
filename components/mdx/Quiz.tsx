"use client";

import { useState } from "react";
import { Check, RotateCcw, Trophy, X } from "lucide-react";
import styles from "./Quiz.module.css";

export type QuizQuestion = {
  q: string;
  options: string[];
  /** Index of the correct option */
  answer: number;
  explain?: string;
};

export function Quiz({ title = "Check your understanding", questions }: { title?: string; questions: QuizQuestion[] }) {
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
    <section className={styles.quiz} aria-label={title}>
      <header className={styles.head}>
        <div>
          <p className="kicker">Quiz</p>
          <p className={styles.title}>{title}</p>
        </div>
        <p className={styles.progress} aria-live="polite">
          {answered}/{questions.length} answered
        </p>
      </header>

      <ol className={styles.questions}>
        {questions.map((question, qi) => {
          const choice = picked[qi];
          const locked = choice !== null;
          return (
            <li key={qi} className={styles.question}>
              <p className={styles.prompt}>
                <span className={styles.qnum}>{qi + 1}</span>
                {question.q}
              </p>
              <div className={styles.options} role="group" aria-label={`Question ${qi + 1} options`}>
                {question.options.map((option, oi) => {
                  const isAnswer = oi === question.answer;
                  const state = !locked
                    ? "idle"
                    : isAnswer
                      ? "correct"
                      : oi === choice
                        ? "wrong"
                        : "dim";
                  return (
                    <button
                      key={oi}
                      type="button"
                      className={styles.option}
                      data-state={state}
                      disabled={locked}
                      aria-pressed={choice === oi}
                      onClick={() => choose(qi, oi)}
                    >
                      <span className={styles.letter}>{String.fromCharCode(65 + oi)}</span>
                      <span className={styles.optionText}>{option}</span>
                      {state === "correct" ? <Check className={styles.mark} aria-label="Correct answer" /> : null}
                      {state === "wrong" ? <X className={styles.mark} aria-label="Your answer, incorrect" /> : null}
                    </button>
                  );
                })}
              </div>
              {locked ? (
                <p className={styles.feedback} data-correct={choice === question.answer}>
                  <strong>{choice === question.answer ? "Correct." : "Not quite."}</strong>{" "}
                  {question.explain}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {done ? (
        <footer className={styles.result}>
          <Trophy aria-hidden="true" />
          <p>
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
