import type { Metadata } from "next";
import { CollectionList } from "@/components/CollectionList";
import { getSubject } from "@/lib/content";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  return { title: `Lectures · ${getSubject(subject)?.title ?? ""}` };
}

export default async function LecturesPage({ params }: Props) {
  const { subject } = await params;
  return <CollectionList subject={subject} collection="lectures" />;
}
