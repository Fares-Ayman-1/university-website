import "server-only";
import { COLLECTION_META, getCollection, getSubjects, itemHref } from "@/lib/content";
import { getStudyData } from "@/lib/study-index";
import type { SearchDoc } from "@/lib/search";

/** Every searchable thing on the site, built at build time into /search-index.json. */
export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const subject of getSubjects()) {
    const subjectHref = `/subjects/${subject.slug}/`;
    docs.push({
      kind: "subject",
      title: subject.title,
      titleAr: subject.titleAr,
      context: `${subject.code} · Subject`,
      href: subjectHref,
      text: subject.tagline,
      topics: subject.topics,
    });

    for (const collection of ["lectures", "sections"] as const) {
      for (const item of getCollection(subject.slug, collection)) {
        const meta = COLLECTION_META[collection];
        const href = itemHref(item);
        const context = `${subject.title} · ${meta.singular} ${item.data.number}`;
        docs.push({
          kind: collection === "lectures" ? "lecture" : "section",
          title: item.data.title,
          titleAr: item.data.titleAr,
          context,
          href,
          text: item.data.summary,
          topics: item.data.topics,
        });
        for (const heading of item.headings) {
          docs.push({
            kind: "heading",
            title: heading.text,
            titleAr: heading.textAr,
            context: `${context}: ${item.data.title}`,
            href: `${href}#${heading.id}`,
          });
        }
      }
    }

    const { definitions, questions } = getStudyData(subject.slug);
    for (const definition of definitions) {
      docs.push({
        kind: "definition",
        title: definition.term,
        titleAr: definition.termAr,
        context: `${subject.title} · ${definition.source.label}`,
        href: definition.href,
        text: definition.text,
      });
    }
    docs.push(
      {
        kind: "review",
        title: `Flashcards: ${subject.title}`,
        titleAr: `البطاقات التعليمية: ${subject.titleAr ?? subject.title}`,
        context: `${subject.title} · ${definitions.length} terms`,
        href: `${subjectHref}review/flashcards/`,
        topics: ["flashcards", "review", "definitions"],
      },
      {
        kind: "review",
        title: `Exam mode: ${subject.title}`,
        titleAr: `وضع الامتحان: ${subject.titleAr ?? subject.title}`,
        context: `${subject.title} · ${questions.length} questions`,
        href: `${subjectHref}review/exam/`,
        topics: ["exam", "quiz", "test", "review"],
      },
    );
  }

  return docs;
}
