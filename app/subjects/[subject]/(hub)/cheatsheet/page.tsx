import type { Metadata } from "next";
import { ArLine } from "@/components/mdx/Arabic";
import { getSubject } from "@/lib/content";
import { getCheatsheet } from "@/lib/cheatsheet";
import { renderFragment } from "@/lib/mdx";
import styles from "@/components/review/Review.module.css";
import cs from "./cheatsheet.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Cheat sheet · ${getSubject(subject)?.title ?? ""}` };
}

export default async function CheatsheetPage({ params }: Props) {
  const { subject } = await params;
  const parts = getCheatsheet(subject);
  const rendered = await Promise.all(
    parts.map((part) => renderFragment(part.body, { subject, collection: "lectures", slug: `cheatsheet-${part.slug}` })),
  );

  return (
    <div className={cs.page}>
      <h2 className={styles.pageTitle}>
        Cheat sheet
        <ArLine>ورقة المراجعة السريعة</ArLine>
      </h2>
      <p className={styles.pageIntro}>
        Every number, formula and calculation rule from the lectures, with the fastest way to work each one out, a
        10-second example and the traps to avoid. Use the calculators to check your answers.
        <ArLine>
          كل رقم ومعادلة وقاعدة حسابية من المحاضرات، مع أسرع طريقة لحساب كل منها، ومثال في 10 ثوانٍ، والأخطاء التي يجب
          تجنّبها. استخدم الحاسبات للتحقق من إجاباتك.
        </ArLine>
      </p>

      {parts.length > 0 ? (
        <>
          <nav className={cs.jump} aria-label="Lectures · المحاضرات">
            {parts.map((part) => (
              <a key={part.id} href={`#${part.id}`} className={cs.chip}>
                <span className={cs.chipNum}>{part.lecture}</span>
                <span>
                  {part.title}
                  <ArLine>{part.titleAr}</ArLine>
                </span>
              </a>
            ))}
          </nav>

          {parts.map((part, i) => (
            <section key={part.id} id={part.id} className={cs.part} data-kind="lectures" aria-labelledby={`${part.id}-title`}>
              <p className={cs.kicker}>
                Lecture {part.lecture} <ArLine inline>المحاضرة {part.lecture}</ArLine>
              </p>
              <h2 id={`${part.id}-title`} className={cs.partTitle}>
                {part.title}
                <ArLine>{part.titleAr}</ArLine>
              </h2>
              <div className="prose">{rendered[i]}</div>
            </section>
          ))}
        </>
      ) : (
        <p className={styles.empty}>
          No cheat sheet for this subject yet.
          <ArLine>لا توجد ورقة مراجعة سريعة لهذه المادة بعد.</ArLine>
        </p>
      )}
    </div>
  );
}
