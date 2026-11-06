"use client";

import { ArLine } from "@/components/mdx/Arabic";
import styles from "@/components/mdx/Quiz.module.css";

export type QuizQuestion = {
  q: string;
  options: string[];
  /** Index of the correct option */
  answer: number;
  explain?: string;
  /** Arabic translations, shown under the English (optionsAr matches options by index) */
  qAr?: string;
  optionsAr?: string[];
  explainAr?: string;
};

/**
 * - `instant`: the first pick locks the question and shows the feedback (lesson quizzes).
 * - `deferred`: picks can change and nothing is revealed yet (exam in progress).
 * - `review`: read-only, shows the pick, the right answer and the explanation (exam summary).
 */
export type QuestionMode = "instant" | "deferred" | "review";

function Mark({ correct }: { correct: boolean }) {
  return (
    <>
      <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true">
        <path pathLength={1} d={correct ? "M5 12.5l4.5 4.5L19 7.5" : "M7 7l10 10M17 7L7 17"} />
      </svg>
      <span className="visually-hidden">{correct ? "Correct answer" : "Your answer, incorrect"}</span>
    </>
  );
}

export function QuestionCard({
  question,
  index,
  choice,
  onChoose,
  mode,
  label,
}: {
  question: QuizQuestion;
  index: number;
  choice: number | null;
  onChoose?: (option: number) => void;
  mode: QuestionMode;
  /** Optional line above the prompt, e.g. the page the question comes from */
  label?: React.ReactNode;
}) {
  const revealed = mode === "review" || (mode === "instant" && choice !== null);
  const disabled = mode === "review" || (mode === "instant" && choice !== null);

  return (
    <div className={styles.questionCard}>
      {label ? <p className={styles.source}>{label}</p> : null}
      <p className={styles.prompt}>
        <span className={styles.qnum}>{index + 1}</span>
        <span className={styles.promptText}>
          {question.q}
          <ArLine>{question.qAr}</ArLine>
        </span>
      </p>
      <div className={styles.options} role="group" aria-label={`Question ${index + 1} options`}>
        {question.options.map((option, oi) => {
          const isAnswer = oi === question.answer;
          const state = !revealed
            ? choice === oi
              ? "picked"
              : "idle"
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
              disabled={disabled}
              aria-pressed={choice === oi}
              onClick={() => onChoose?.(oi)}
            >
              <span className={styles.letter}>{String.fromCharCode(65 + oi)}</span>
              <span className={styles.optionText}>
                {option}
                {question.optionsAr?.[oi] !== option ? <ArLine>{question.optionsAr?.[oi]}</ArLine> : null}
              </span>
              {state === "correct" ? <Mark correct /> : null}
              {state === "wrong" ? <Mark correct={false} /> : null}
            </button>
          );
        })}
      </div>
      {revealed && (choice !== null || question.explain) ? (
        <p className={styles.feedback} data-correct={choice === question.answer}>
          <strong>{choice === null ? "Not answered." : choice === question.answer ? "Correct." : "Not quite."}</strong>{" "}
          {question.explain}
          <ArLine>{question.explainAr}</ArLine>
        </p>
      ) : null}
    </div>
  );
}
