import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceLayout } from "@/components/ResourceLayout";
import { getLecture, getLectures, getNeighbors, getSubject } from "@/lib/content";
import { renderResource } from "@/lib/mdx";

type Props = { params: Promise<{ subject: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { subject: string } }) {
  return getLectures(params.subject).map((lecture) => ({ slug: lecture.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, slug } = await params;
  const lecture = getLecture(subject, slug);
  if (!lecture) return {};
  return {
    title: `Lecture ${lecture.data.number}: ${lecture.data.title}`,
    description: lecture.data.summary,
  };
}

export default async function LecturePage({ params }: Props) {
  const { subject: subjectSlug, slug } = await params;
  const subject = getSubject(subjectSlug);
  const lecture = getLecture(subjectSlug, slug);
  if (!subject || !lecture) notFound();

  const { previous, next } = getNeighbors(subjectSlug, "lectures", slug);
  const content = await renderResource(lecture);

  return (
    <ResourceLayout subject={subject} item={lecture} previous={previous} next={next}>
      {content}
    </ResourceLayout>
  );
}
