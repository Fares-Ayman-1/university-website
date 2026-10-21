import { AlertTriangle, BookMarked, CheckCircle2, Info, Lightbulb, Target } from "lucide-react";
import styles from "./mdx.module.css";

const CALLOUTS = {
  note: { icon: Info, label: "Note" },
  tip: { icon: Lightbulb, label: "Tip" },
  warning: { icon: AlertTriangle, label: "Watch out" },
  example: { icon: BookMarked, label: "Example" },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof CALLOUTS;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, label } = CALLOUTS[type];
  return (
    <aside className={styles.callout} data-type={type}>
      <Icon className={styles.calloutIcon} aria-hidden="true" />
      <div className={styles.calloutBody}>
        <p className={styles.calloutTitle}>{title ?? label}</p>
        {children}
      </div>
    </aside>
  );
}

/** Navy definition band, as used on the course slides. */
export function Definition({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className={styles.definition}>
      <span className={styles.definitionBadge} aria-hidden="true">
        <BookMarked />
      </span>
      <div>
        <p className={styles.definitionTerm}>{term}</p>
        <div className={styles.definitionText}>{children}</div>
      </div>
    </div>
  );
}

export function Objectives({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.objectives} aria-label="Learning objectives">
      <p className={styles.panelTitle}>
        <Target aria-hidden="true" /> By the end of this page you can
      </p>
      {children}
    </section>
  );
}

export function Takeaways({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.takeaways} aria-label="Key takeaways">
      <p className={styles.panelTitle}>
        <CheckCircle2 aria-hidden="true" /> Key takeaways
      </p>
      {children}
    </section>
  );
}
