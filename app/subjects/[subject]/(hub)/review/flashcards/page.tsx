import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArLine } from "@/components/mdx/Arabic";
import { Flashcards, type Flashcard, type FlashcardGroup } from "@/components/review/Flashcards";
import { getSubject } from "@/lib/content";
import { renderFragment } from "@/lib/mdx";
import { getStudyData } from "@/lib/study-index";
import styles from "@/components/review/Review.module.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Flashcards · ${getSubject(subject)?.title ?? ""}` };
}

// On a card, the definition's text is shown without the page's navy definition band.
function DefinitionBody({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default async function FlashcardsPage({ params }: Props) {
  const { subject } = await params;
  const { definitions } = getStudyData(subject);

  const cards: Flashcard[] = await Promise.all(
    definitions.map(async (definition) => ({
      id: definition.id,
      term: definition.term,
      termAr: definition.termAr,
      href: definition.href,
      group: `${definition.source.collection}/${definition.source.slug}`,
      sourceLabel: `${definition.source.label}: ${definition.source.title}`,
      body: await renderFragment(
        definition.mdx,
        { subject, collection: definition.source.collection, slug: definition.source.slug },
        { Definition: DefinitionBody },
      ),
    })),
  );

  const groups: FlashcardGroup[] = [];
  for (const card of cards) {
    if (!groups.some((group) => group.key === card.group)) groups.push({ key: card.group, label: card.sourceLabel });
  }

  return (
    <div>
      <Link href={`/subjects/${subject}/review/`} className={styles.back}>
        <ArrowLeft aria-hidden="true" /> Review
      </Link>
      <h2 className={styles.pageTitle}>
        Flashcards
        <ArLine>البطاقات التعليمية</ArLine>
      </h2>
      <p className={styles.pageIntro}>
        Say the definition to yourself first, then flip the card to check. Each card links back to the page that defines it.
        <ArLine>قل التعريف لنفسك أولًا، ثم اقلب البطاقة للتحقق. كل بطاقة مرتبطة بالصفحة التي تعرّف المصطلح.</ArLine>
      </p>
      <Flashcards cards={cards} groups={groups} />
    </div>
  );
}
