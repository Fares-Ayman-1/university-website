import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ListChecks } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { getSubject } from "@/lib/content";
import { getStudyData, type StudyDefinition } from "@/lib/study-index";
import styles from "@/components/review/Review.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Review · ${getSubject(subject)?.title ?? ""}` };
}

export default async function ReviewPage({ params }: Props) {
  const { subject } = await params;
  const { definitions, questions } = getStudyData(subject);

  // Terms grouped by the page that defines them (works without JavaScript).
  const groups = new Map<string, { title: string; href: string; items: StudyDefinition[] }>();
  for (const definition of definitions) {
    const key = definition.source.href;
    if (!groups.has(key)) {
      groups.set(key, { title: `${definition.source.label}: ${definition.source.title}`, href: key, items: [] });
    }
    groups.get(key)!.items.push(definition);
  }

  return (
    <div>
      <div className={styles.modes}>
        <article className={`${styles.mode} rise`}>
          <span className={styles.modeIcon} aria-hidden="true">
            <Layers />
          </span>
          <h2 className={styles.modeTitle}>
            <Link href={`/subjects/${subject}/review/flashcards/`} className={styles.modeLink}>
              Flashcards
            </Link>
            <ArLine>البطاقات التعليمية</ArLine>
          </h2>
          <p className={styles.modeText}>
            Every definition in this subject as a card: recall the meaning, then flip to check.
            <ArLine>كل تعريف في هذه المادة على هيئة بطاقة: تذكّر المعنى ثم اقلب البطاقة للتحقق.</ArLine>
          </p>
          <p className={styles.modeCount}>{definitions.length} terms</p>
        </article>
        <article className={`${styles.mode} rise`} style={{ "--i": 1 } as React.CSSProperties}>
          <span className={styles.modeIcon} aria-hidden="true">
            <ListChecks />
          </span>
          <h2 className={styles.modeTitle}>
            <Link href={`/subjects/${subject}/review/exam/`} className={styles.modeLink}>
              Exam mode
            </Link>
            <ArLine>وضع الامتحان</ArLine>
          </h2>
          <p className={styles.modeText}>
            A mixed quiz drawn from every lecture and section, with answers revealed at the end.
            <ArLine>اختبار مختلط من كل المحاضرات والسكاشن، وتظهر الإجابات في النهاية.</ArLine>
          </p>
          <p className={styles.modeCount}>{questions.length} questions</p>
        </article>
      </div>

      {groups.size > 0 ? (
        <section className={styles.terms} aria-labelledby="terms-heading">
          <h2 id="terms-heading" className={styles.termsHead}>
            Key terms
            <ArLine>المصطلحات الأساسية</ArLine>
          </h2>
          {[...groups.values()].map((group) => (
            <div key={group.href} className={`${styles.termGroup} reveal`}>
              <p className={styles.termGroupTitle}>
                <Link href={group.href}>{group.title}</Link>
              </p>
              <ul className={styles.termList}>
                {group.items.map((definition) => (
                  <li key={definition.id}>
                    <Link href={definition.href}>
                      {definition.term}
                      <ArLine>{definition.termAr}</ArLine>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
