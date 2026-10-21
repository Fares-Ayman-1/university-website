import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceLayout } from "@/components/ResourceLayout";
import { getNeighbors, getSection, getSections, getSubject } from "@/lib/content";
import { renderResource } from "@/lib/mdx";

type Props = { params: Promise<{ subject: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { subject: string } }) {
  return getSections(params.subject).map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, slug } = await params;
  const section = getSection(subject, slug);
  if (!section) return {};
  return {
    title: `Section ${section.data.number}: ${section.data.title}`,
    description: section.data.summary,
  };
}

export default async function SectionPage({ params }: Props) {
  const { subject: subjectSlug, slug } = await params;
  const subject = getSubject(subjectSlug);
  const section = getSection(subjectSlug, slug);
  if (!subject || !section) notFound();

  const { previous, next } = getNeighbors(subjectSlug, "sections", slug);
  const content = await renderResource(section);

  return (
    <ResourceLayout subject={subject} item={section} previous={previous} next={next}>
      {content}
    </ResourceLayout>
  );
}
