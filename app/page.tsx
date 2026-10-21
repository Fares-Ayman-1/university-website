import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { getLectures, getSections, getSubjects } from "@/lib/content";
import styles from "./page.module.css";

export default function HomePage() {
  const subjects = getSubjects().map((subject) => ({
    subject,
    lectures: getLectures(subject.slug),
    sections: getSections(subject.slug),
  }));

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className="kicker rise">Quantro AI · University</p>
          <h1 className={`${styles.title} rise`} style={{ "--i": 1 } as React.CSSProperties}>
            Every subject, in two clear tracks: <em className={styles.lec}>lectures</em> and{" "}
            <em className={styles.sec}>sections</em>.
          </h1>
          <p className={`${styles.lead} rise`} style={{ "--i": 2 } as React.CSSProperties}>
            Lectures are complete lessons, in the order they were given. Sections are separate
            labs and practical topics. Each one has its own page with explanations, examples,
            code, exercises and a quiz.
          </p>
          <div className={`${styles.tracks} rise`} style={{ "--i": 3 } as React.CSSProperties}>
            <div className={styles.track} data-kind="lectures">
              <BookOpen aria-hidden="true" />
              <div>
                <p className={styles.trackTitle}>Lectures</p>
                <p className={styles.trackText}>Complete lessons by lecture number</p>
              </div>
            </div>
            <div className={styles.track} data-kind="sections">
              <FlaskConical aria-hidden="true" />
              <div>
                <p className={styles.trackTitle}>Sections</p>
                <p className={styles.trackText}>Independent labs and practical topics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" aria-labelledby="subjects-heading">
        <div className={styles.sectionHead}>
          <h2 id="subjects-heading">Subjects</h2>
          <p>{subjects.length} subjects this term</p>
        </div>
        <div className={styles.grid}>
          {subjects.map(({ subject, lectures, sections }, index) => (
            <article
              key={subject.slug}
              className={`${styles.card} rise`}
              style={{ "--i": index + 4 } as React.CSSProperties}
            >
              <div className={styles.cardTop}>
                <span className={styles.code}>{subject.code}</span>
                {subject.level ? <span className={styles.level}>{subject.level}</span> : null}
              </div>
              <h3 className={styles.cardTitle}>
                <Link href={`/subjects/${subject.slug}/`} className={styles.cardLink}>
                  {subject.title}
                </Link>
              </h3>
              <p className={styles.tagline}>{subject.tagline}</p>

              <div className={styles.counts}>
                <Link href={`/subjects/${subject.slug}/lectures/`} className={styles.count} data-kind="lectures">
                  <BookOpen aria-hidden="true" />
                  <span>
                    <strong>{lectures.length}</strong> {lectures.length === 1 ? "Lecture" : "Lectures"}
                  </span>
                </Link>
                <Link href={`/subjects/${subject.slug}/sections/`} className={styles.count} data-kind="sections">
                  <FlaskConical aria-hidden="true" />
                  <span>
                    <strong>{sections.length}</strong> {sections.length === 1 ? "Section" : "Sections"}
                  </span>
                </Link>
              </div>

              <span className={styles.open} aria-hidden="true">
                Open subject <ArrowRight />
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
