import { notFound } from "next/navigation";
import { getLectures, getSections, getSubject } from "@/lib/content";
import { getDrills } from "@/lib/qa";
import { getCheatsheet } from "@/lib/cheatsheet";
import { SubjectTabs } from "@/components/SubjectTabs";
import { ArText } from "@/components/mdx/Arabic";
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
          {subject.titleAr ? (
            <p className={`${styles.titleAr} ar rise`} lang="ar" dir="rtl" style={{ "--i": 1 } as React.CSSProperties}>
              <ArText>{subject.titleAr}</ArText>
            </p>
          ) : null}
          <p className={`${styles.tagline} rise`} style={{ "--i": 2 } as React.CSSProperties}>
            {subject.tagline}
          </p>
          {subject.taglineAr ? (
            <p
              className={`${styles.tagline} ${styles.taglineAr} ar rise`}
              lang="ar"
              dir="rtl"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              <ArText>{subject.taglineAr}</ArText>
            </p>
          ) : null}
        </div>
      </section>
      <SubjectTabs
        subject={subject.slug}
        lectureCount={getLectures(subject.slug).length}
        sectionCount={getSections(subject.slug).length}
        qaCount={getDrills(subject.slug).length}
        cheatCount={getCheatsheet(subject.slug).length}
      />
      <div className={`container ${styles.body}`}>{children}</div>
    </>
  );
}
