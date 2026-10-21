import { PencilLine } from "lucide-react";
import styles from "./mdx.module.css";

export function Exercise({
  title,
  level,
  children,
}: {
  title: string;
  level?: "easy" | "medium" | "hard";
  children: React.ReactNode;
}) {
  return (
    <section className={styles.exercise}>
      <div className={styles.exerciseHead}>
        <span className={styles.exerciseIcon} aria-hidden="true">
          <PencilLine />
        </span>
        <p className={styles.exerciseTitle}>
          <span className={styles.exerciseKicker}>Exercise</span>
          {title}
        </p>
        {level ? (
          <span className={styles.level} data-level={level}>
            {level}
          </span>
        ) : null}
      </div>
      <div className={styles.exerciseBody}>{children}</div>
    </section>
  );
}

/** Collapsible worked solution; native <details>, so it works without JavaScript. */
export function Solution({ children }: { children: React.ReactNode }) {
  return (
    <details className={styles.solution}>
      <summary>Show solution</summary>
      <div className={styles.solutionBody}>{children}</div>
    </details>
  );
}
