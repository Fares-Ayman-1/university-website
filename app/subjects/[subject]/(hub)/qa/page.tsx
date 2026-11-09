import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleQuestionMark } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { getSubject } from "@/lib/content";
import { getDrills } from "@/lib/qa";
import styles from "@/components/review/Review.module.css";
import qa from "./qa.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Q&A · ${getSubject(subject)?.title ?? ""}` };
}

export default async function QaPage({ params }: Props) {
  const { subject } = await params;
  const drills = getDrills(subject);

  return (
    <div>
      <h2 className={styles.pageTitle}>
        Q&amp;A
        <ArLine>أسئلة وأجوبة (Q&A)</ArLine>
      </h2>
      <p className={styles.pageIntro}>
        Question drills with instant answers: pick an option to see at once whether it is right, with a short explanation.
        Progress is saved in this browser only.
        <ArLine>
          تدريبات أسئلة بإجابات فورية: اختر إجابة لتعرف في الحال إن كانت صحيحة، مع شرح قصير. يُحفظ تقدّمك في هذا المتصفح
          فقط.
        </ArLine>
      </p>

      {drills.length > 0 ? (
        <div className={styles.modes}>
          {drills.map((drill, i) => (
            <article key={drill.slug} className={`${styles.mode} rise`} style={{ "--i": i } as React.CSSProperties}>
              <span className={styles.modeIcon} aria-hidden="true">
                <MessageCircleQuestionMark />
              </span>
              <p className="kicker">{drill.kicker}</p>
              <h3 className={styles.modeTitle}>
                <Link href={`/subjects/${subject}/qa/${drill.slug}/`} className={styles.modeLink}>
                  {drill.heading}
                </Link>
              </h3>
              <p className={styles.modeText}>{drill.lede}</p>
              <ul className={qa.banks} aria-label={drill.banksLabel}>
                {drill.banks.map((bank) => (
                  <li key={bank.id}>
                    {bank.tag} · {bank.name}
                  </li>
                ))}
              </ul>
              <p className={styles.modeCount}>
                {drill.questionCount} questions · {drill.banks.length} {drill.unit}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No Q&amp;A drills for this subject yet.
          <ArLine>لا توجد تدريبات أسئلة لهذه المادة بعد.</ArLine>
        </p>
      )}
    </div>
  );
}
