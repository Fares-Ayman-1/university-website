import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QaDrill } from "@/components/qa/QaDrill";
import { getSubject } from "@/lib/content";
import { getDrill, getDrills } from "@/lib/qa";
import styles from "@/components/review/Review.module.css";

type Props = { params: Promise<{ subject: string; drill: string }> };

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { subject: string } }) {
  return getDrills(params.subject).map((drill) => ({ drill: drill.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, drill } = await params;
  const data = getDrill(subject, drill);
  return { title: `${data?.title ?? "Q&A"} · ${getSubject(subject)?.title ?? ""}`, description: data?.lede };
}

export default async function QaDrillPage({ params }: Props) {
  const { subject, drill: slug } = await params;
  const drill = getDrill(subject, slug);
  if (!drill) notFound();
  const { kicker, heading, lede, foot, banksLabel, unit, banks } = drill;

  return (
    <div>
      <Link href={`/subjects/${subject}/qa/`} className={styles.back}>
        <ArrowLeft aria-hidden="true" /> Q&amp;A
      </Link>
      <QaDrill
        drill={{ kicker, heading, lede, foot, banksLabel, unit, banks }}
        storageKey={`qa:${subject}/${slug}:v1`}
      />
    </div>
  );
}
