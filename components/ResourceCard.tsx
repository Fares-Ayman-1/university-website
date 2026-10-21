import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FlaskConical } from "lucide-react";
import { COLLECTION_META, formatNumber, itemHref, type ResourceItem } from "@/lib/content";
import styles from "./ResourceCard.module.css";

export function ResourceCard({ item, index = 0 }: { item: ResourceItem; index?: number }) {
  const meta = COLLECTION_META[item.collection];
  const Icon = item.collection === "lectures" ? BookOpen : FlaskConical;
  const kindLabel = item.collection === "sections" ? item.data.kind : null;

  return (
    <article className={`${styles.card} rise`} data-kind={item.collection} style={{ "--i": index } as React.CSSProperties}>
      <div className={styles.number} aria-hidden="true">
        <span className={styles.badge}>{meta.badge}</span>
        <span className={styles.digits}>{formatNumber(item.data.number)}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={itemHref(item)} className={styles.link}>
            <span className="visually-hidden">
              {meta.singular} {item.data.number}:{" "}
            </span>
            {item.data.title}
          </Link>
        </h3>
        <p className={styles.summary}>{item.data.summary}</p>
        <div className={styles.meta}>
          <span>
            <Icon aria-hidden="true" /> {meta.singular}
            {kindLabel ? ` · ${kindLabel}` : ""}
          </span>
          <span>
            <Clock aria-hidden="true" /> {item.data.duration ?? `${item.readingMinutes} min read`}
          </span>
        </div>
        {item.data.topics.length > 0 ? (
          <ul className={styles.topics} aria-label="Topics">
            {item.data.topics.slice(0, 5).map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <ArrowRight className={styles.arrow} aria-hidden="true" />
    </article>
  );
}
