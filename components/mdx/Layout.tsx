import styles from "./mdx.module.css";

/** Wraps a markdown ordered list and renders it as numbered step cards. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <div className={styles.steps}>{children}</div>;
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  return (
    <div className={styles.grid} data-cols={cols}>
      {children}
    </div>
  );
}

export function Card({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.cardTitle}>{title}</p>
        {tag ? <span className={styles.cardTag}>{tag}</span> : null}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}
