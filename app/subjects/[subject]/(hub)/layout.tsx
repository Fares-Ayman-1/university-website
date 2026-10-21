import { notFound } from "next/navigation";
import { getLectures, getSections, getSubject } from "@/lib/content";
import { SubjectTabs } from "@/components/SubjectTabs";
import styles from "./hub.module.css";

export default async function SubjectHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) notFound();

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className={`${styles.meta} rise`}>
            <span className={styles.code}>{subject.code}</span>
            {subject.level ? <span>{subject.level}</span> : null}
          </div>
          <h1 className={`${styles.title} rise`} style={{ "--i": 1 } as React.CSSProperties}>
            {subject.title}
          </h1>
          <p className={`${styles.tagline} rise`} style={{ "--i": 2 } as React.CSSProperties}>
            {subject.tagline}
          </p>
        </div>
      </section>
      <SubjectTabs
        subject={subject.slug}
        lectureCount={getLectures(subject.slug).length}
        sectionCount={getSections(subject.slug).length}
      />
      <div className={`container ${styles.body}`}>{children}</div>
    </>
  );
}
