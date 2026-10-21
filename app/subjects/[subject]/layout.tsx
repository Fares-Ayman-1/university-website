import { getSubjects } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSubjects().map((subject) => ({ subject: subject.slug }));
}

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
