import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { ExamMode, type ExamQuestion } from "@/components/review/ExamMode";
import { getSubject } from "@/lib/content";
import { getStudyData } from "@/lib/study-index";
import styles from "@/components/review/Review.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Exam mode · ${getSubject(subject)?.title ?? ""}` };
}

export default async function ExamPage({ params }: Props) {
  const { subject } = await params;
  const questions: ExamQuestion[] = getStudyData(subject).questions.map((question, i) => {
    const { source, ...rest } = question;
    return {
      ...rest,
      id: `${source.collection}/${source.slug}/${i}`,
      collection: source.collection,
      sourceLabel: `${source.label}: ${source.title}`,
    };
  });

  return (
    <div>
      <Link href={`/subjects/${subject}/review/`} className={styles.back}>
        <ArrowLeft aria-hidden="true" /> Review
      </Link>
      <h2 className={styles.pageTitle}>
        Exam mode
        <ArLine>وضع الامتحان</ArLine>
      </h2>
      <p className={styles.pageIntro}>
        Answer a random set of questions from the whole subject without feedback, then see your score and the explanations.
        <ArLine>أجب عن مجموعة عشوائية من أسئلة المادة كلها دون تصحيح فوري، ثم اطّلع على درجتك والشروح.</ArLine>
      </p>
      <ExamMode questions={questions} />
    </div>
  );
}
