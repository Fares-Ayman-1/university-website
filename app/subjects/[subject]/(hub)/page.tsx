import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, FlaskConical, Library, UserRound } from "lucide-react";
import {
  COLLECTION_META,
  formatNumber,
  getLectures,
  getSections,
  getSubject,
  itemHref,
  type ResourceItem,
} from "@/lib/content";
import styles from "./overview.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  const data = getSubject(subject);
  return { title: data?.title, description: data?.tagline };
}

function TrackCard({ subject, items, collection }: { subject: string; items: ResourceItem[]; collection: "lectures" | "sections" }) {
  const meta = COLLECTION_META[collection];
  const Icon = collection === "lectures" ? BookOpen : FlaskConical;
  return (
    <section className={styles.track} data-kind={collection} aria-labelledby={`${collection}-track`}>
      <header className={styles.trackHead}>
        <span className={styles.trackIcon} aria-hidden="true">
          <Icon />
        </span>
        <div>
          <h2 id={`${collection}-track`} className={styles.trackTitle}>
            {meta.label}
          </h2>
          <p className={styles.trackMeta}>{meta.description}</p>
        </div>
      </header>
      {items.length > 0 ? (
        <ol className={styles.trackList}>
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={itemHref(item)} className={styles.trackItem}>
                <span className={styles.trackNum}>
                  {meta.badge} {formatNumber(item.data.number)}
                </span>
                <span className={styles.trackItemTitle}>{item.data.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.trackEmpty}>No {meta.label.toLowerCase()} yet.</p>
      )}
      <Link href={`/subjects/${subject}/${collection}/`} className={styles.trackAll}>
        All {meta.label.toLowerCase()} <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

export default async function SubjectOverviewPage({ params }: Props) {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) notFound();

  const lectures = getLectures(slug);
  const sections = getSections(slug);
  const allItems: ResourceItem[] = [...lectures, ...sections];

  return (
    <div className={styles.page}>
      <div className={styles.tracks}>
        <TrackCard subject={slug} items={lectures} collection="lectures" />
        <TrackCard subject={slug} items={sections} collection="sections" />
      </div>

      <div className={styles.columns}>
        <div className={styles.main}>
          <section aria-labelledby="about">
            <h2 id="about" className={styles.h2}>
              About this subject
            </h2>
            <p className={styles.description}>{subject.description}</p>
          </section>

          {subject.objectives.length > 0 ? (
            <section aria-labelledby="objectives">
              <h2 id="objectives" className={styles.h2}>
                Course objectives
              </h2>
              <ol className={styles.objectives}>
                {subject.objectives.map((objective, i) => (
                  <li key={objective}>
                    <span className={styles.ghost} aria-hidden="true">
                      {i + 1}
                    </span>
                    {objective}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {subject.topics.length > 0 ? (
            <section aria-labelledby="topics">
              <h2 id="topics" className={styles.h2}>
                Course topics
              </h2>
              <ul className={styles.topics}>
                {subject.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className={styles.side}>
          {subject.grading.length > 0 ? (
            <section className={styles.panel} aria-labelledby="grading">
              <h2 id="grading" className={styles.panelTitle}>
                Grading
              </h2>
              <ul className={styles.grading}>
                {subject.grading.map((part) => (
                  <li key={part.label}>
                    <div className={styles.gradeRow}>
                      <span>{part.label}</span>
                      <strong>{part.weight}%</strong>
                    </div>
                    <span className={styles.bar}>
                      <span style={{ width: `${part.weight}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {subject.instructors.length > 0 ? (
            <section className={styles.panel} aria-labelledby="instructors">
              <h2 id="instructors" className={styles.panelTitle}>
                Teaching staff
              </h2>
              <ul className={styles.people}>
                {subject.instructors.map((person) => (
                  <li key={person}>
                    <UserRound aria-hidden="true" /> {person}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {subject.books.length > 0 ? (
            <section className={styles.panel} aria-labelledby="books">
              <h2 id="books" className={styles.panelTitle}>
                Reference books
              </h2>
              <ul className={styles.books}>
                {subject.books.map((book) => {
                  const usedBy = allItems.flatMap((item) =>
                    item.data.bookRefs
                      .filter((ref) => ref.book === book.id)
                      .map((ref) => ({ item, chapter: ref.chapter })),
                  );
                  return (
                    <li key={book.id}>
                      <p className={styles.bookTitle}>
                        <Library aria-hidden="true" /> {book.title}
                      </p>
                      {book.author ? <p className={styles.bookAuthor}>{book.author}</p> : null}
                      {usedBy.length > 0 ? (
                        <ul className={styles.usedBy}>
                          {usedBy.map(({ item, chapter }) => (
                            <li key={`${item.collection}-${item.slug}-${chapter}`} data-kind={item.collection}>
                              <Link href={itemHref(item)}>
                                {COLLECTION_META[item.collection].badge} {formatNumber(item.data.number)}
                              </Link>
                              <span>{chapter}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
