import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Clock, FileText, FlaskConical, Library } from "lucide-react";
import {
  COLLECTION_META,
  formatNumber,
  itemHref,
  materialHref,
  type ResourceItem,
  type Subject,
} from "@/lib/content";
import { TableOfContents } from "./TableOfContents";
import styles from "./ResourceLayout.module.css";

export function ResourceLayout({
  subject,
  item,
  previous,
  next,
  children,
}: {
  subject: Subject;
  item: ResourceItem;
  previous?: ResourceItem;
  next?: ResourceItem;
  children: React.ReactNode;
}) {
  const meta = COLLECTION_META[item.collection];
  const Icon = item.collection === "lectures" ? BookOpen : FlaskConical;
  const listHref = `/subjects/${subject.slug}/${item.collection}/`;
  const books = new Map(subject.books.map((book) => [book.id, book]));

  return (
    <article className={styles.article} data-kind={item.collection}>
      <div className={styles.progress} aria-hidden="true" />

      <header className={styles.hero}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href={`/subjects/${subject.slug}/`}>{subject.shortTitle}</Link>
            <ChevronRight aria-hidden="true" />
            <Link href={listHref}>{meta.label}</Link>
            <ChevronRight aria-hidden="true" />
            <span aria-current="page">
              {meta.singular} {item.data.number}
            </span>
          </nav>

          <div className={`${styles.badges} rise`}>
            <span className={styles.badge}>
              <Icon aria-hidden="true" />
              {meta.badge} {formatNumber(item.data.number)}
            </span>
            {item.collection === "sections" ? <span className={styles.chip}>{item.data.kind}</span> : null}
            <span className={styles.chipMuted}>
              <Clock aria-hidden="true" /> {item.data.duration ?? `${item.readingMinutes} min read`}
            </span>
          </div>
          <h1 className={`${styles.title} rise`} style={{ "--i": 1 } as React.CSSProperties}>
            {item.data.title}
          </h1>
          <p className={`${styles.summary} rise`} style={{ "--i": 2 } as React.CSSProperties}>
            {item.data.summary}
          </p>
          {item.data.topics.length > 0 ? (
            <ul className={`${styles.topics} rise`} style={{ "--i": 3 } as React.CSSProperties} aria-label="Topics">
              {item.data.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <div className={styles.mainCol}>
          <TableOfContents headings={item.headings} variant="inline" />
          <div className="prose">{children}</div>

          {item.data.sources.length > 0 || item.data.bookRefs.length > 0 ? (
            <section className={styles.sources} aria-labelledby="source-material">
              <h2 id="source-material" className={styles.sourcesTitle}>
                Source material
              </h2>
              <ul className={styles.sourceList}>
                {item.data.sources.map((source) => (
                  <li key={source.file}>
                    <FileText aria-hidden="true" />
                    <div>
                      <a href={materialHref(subject, source.file, source.pages)} target="_blank" rel="noopener">
                        {source.label ?? source.file.split("/").pop()}
                      </a>
                      {source.pages ? <span>Slides {source.pages}</span> : null}
                    </div>
                  </li>
                ))}
                {item.data.bookRefs.map((ref) => (
                  <li key={`${ref.book}-${ref.chapter}`}>
                    <Library aria-hidden="true" />
                    <div>
                      <strong>{books.get(ref.book)?.title}</strong>
                      <span>
                        {ref.chapter}
                        {ref.pages ? ` · pp. ${ref.pages}` : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <nav className={styles.pager} aria-label={`${meta.label} navigation`}>
            {previous ? (
              <Link href={itemHref(previous)} className={styles.pagerLink} rel="prev">
                <span className={styles.pagerLabel}>
                  <ArrowLeft aria-hidden="true" /> Previous {meta.singular.toLowerCase()}
                </span>
                <span className={styles.pagerTitle}>{previous.data.title}</span>
              </Link>
            ) : (
              <Link href={listHref} className={styles.pagerLink}>
                <span className={styles.pagerLabel}>
                  <ArrowLeft aria-hidden="true" /> Back to
                </span>
                <span className={styles.pagerTitle}>All {meta.label.toLowerCase()}</span>
              </Link>
            )}
            {next ? (
              <Link href={itemHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
                <span className={styles.pagerLabel}>
                  Next {meta.singular.toLowerCase()} <ArrowRight aria-hidden="true" />
                </span>
                <span className={styles.pagerTitle}>{next.data.title}</span>
              </Link>
            ) : (
              <Link href={listHref} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span className={styles.pagerLabel}>
                  Finished <ArrowRight aria-hidden="true" />
                </span>
                <span className={styles.pagerTitle}>All {meta.label.toLowerCase()}</span>
              </Link>
            )}
          </nav>
        </div>

        <aside className={styles.sideCol}>
          <TableOfContents headings={item.headings} variant="side" />
        </aside>
      </div>
    </article>
  );
}
