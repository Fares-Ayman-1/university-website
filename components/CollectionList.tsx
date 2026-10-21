import { BookOpen, FlaskConical } from "lucide-react";
import { COLLECTION_META, getCollection, type Collection } from "@/lib/content";
import { ResourceCard } from "./ResourceCard";
import styles from "./CollectionList.module.css";

export function CollectionList({ subject, collection }: { subject: string; collection: Collection }) {
  const items = getCollection(subject, collection);
  const meta = COLLECTION_META[collection];
  const Icon = collection === "lectures" ? BookOpen : FlaskConical;

  return (
    <div data-kind={collection}>
      <header className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          <Icon />
        </span>
        <div>
          <h2 className={styles.title}>{meta.label}</h2>
          <p className={styles.description}>{meta.description}</p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No {meta.label.toLowerCase()} yet.</p>
          <p className={styles.emptyHint}>
            Add a file like <code>content/subjects/{subject}/{collection}/01-topic.mdx</code> and it appears here.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item, index) => (
            <ResourceCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
