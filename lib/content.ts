import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { z } from "zod";
import {
  lectureSchema,
  sectionSchema,
  subjectSchema,
  type LectureFrontmatter,
  type SectionFrontmatter,
  type SubjectData,
} from "./schema";

/*
 * Content layout (one folder per subject):
 *
 *   content/subjects/<subject>/subject.json
 *   content/subjects/<subject>/lectures/NN-<slug>.mdx
 *   content/subjects/<subject>/sections/NN-<slug>.mdx
 *
 * Subject → Lectures and Subject → Sections are the only relationships. Each collection is
 * read from its own folder, so adding a lecture never touches sections and vice versa.
 */

const SUBJECTS_DIR = path.join(process.cwd(), "content", "subjects");

export const COLLECTIONS = ["lectures", "sections"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const COLLECTION_META: Record<
  Collection,
  { label: string; singular: string; badge: string; description: string }
> = {
  lectures: {
    label: "Lectures",
    singular: "Lecture",
    badge: "LEC",
    description: "Complete lessons, organized by lecture number.",
  },
  sections: {
    label: "Sections",
    singular: "Section",
    badge: "SEC",
    description: "Independent labs and practical material on specific topics.",
  },
};

export type Subject = SubjectData & { slug: string };

export type Heading = { depth: 2 | 3; text: string; id: string };

type ItemBase = {
  subject: string;
  slug: string;
  body: string;
  headings: Heading[];
  readingMinutes: number;
};

export type Lecture = ItemBase & { collection: "lectures"; data: LectureFrontmatter };
export type Section = ItemBase & { collection: "sections"; data: SectionFrontmatter };
export type ResourceItem = Lecture | Section;

const SCHEMAS = { lectures: lectureSchema, sections: sectionSchema } as const;

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fail(file: string, error: z.ZodError): never {
  throw new Error(`Invalid content in ${path.relative(process.cwd(), file)}:\n${z.prettifyError(error)}`);
}

/** "03-uninformed-search.mdx" → "uninformed-search" */
function slugFromFile(file: string): string {
  return path.basename(file, ".mdx").replace(/^\d+[-_]/, "");
}

/** Extracts h2/h3 headings with the same ids rehype-slug will generate. */
function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim();
    headings.push({ depth: match[1].length as 2 | 3, text, id: slugger.slug(text) });
  }

  return headings;
}

function readingMinutes(body: string): number {
  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const includeDrafts = process.env.NODE_ENV !== "production";

export const getSubjects = cache((): Subject[] => {
  if (!fs.existsSync(SUBJECTS_DIR)) return [];
  return fs
    .readdirSync(SUBJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const file = path.join(SUBJECTS_DIR, entry.name, "subject.json");
      const parsed = subjectSchema.safeParse(readJson(file));
      if (!parsed.success) fail(file, parsed.error);
      return { ...parsed.data, slug: entry.name };
    })
    .sort((a, b) => a.order - b.order);
});

export function getSubject(slug: string): Subject | undefined {
  return getSubjects().find((subject) => subject.slug === slug);
}

const readCollection = cache((subjectSlug: string, collection: Collection): ResourceItem[] => {
  const subject = getSubject(subjectSlug);
  const dir = path.join(SUBJECTS_DIR, subjectSlug, collection);
  if (!subject || !fs.existsSync(dir)) return [];

  const bookIds = new Set(subject.books.map((book) => book.id));
  const items = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const file = path.join(dir, name);
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      const parsed = SCHEMAS[collection].safeParse(data);
      if (!parsed.success) fail(file, parsed.error);

      for (const source of parsed.data.sources) {
        const published = path.join(process.cwd(), "public", "materials", subjectSlug, ...source.file.split("/"));
        if (!fs.existsSync(published)) {
          throw new Error(
            `${path.relative(process.cwd(), file)}: source "${source.file}" is not in public/materials/${subjectSlug} (run npm run sync)`,
          );
        }
      }

      for (const ref of parsed.data.bookRefs) {
        if (!bookIds.has(ref.book)) {
          throw new Error(
            `${path.relative(process.cwd(), file)}: bookRefs uses unknown book "${ref.book}" (known: ${[...bookIds].join(", ")})`,
          );
        }
      }

      return {
        subject: subjectSlug,
        collection,
        slug: slugFromFile(name),
        data: parsed.data,
        body: content,
        headings: extractHeadings(content),
        readingMinutes: readingMinutes(content),
      } as ResourceItem;
    })
    .filter((item) => includeDrafts || !item.data.draft)
    .sort((a, b) => a.data.number - b.data.number);

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`Duplicate ${collection} slug "${item.slug}" in subject "${subjectSlug}"`);
    }
    seen.add(item.slug);
  }

  return items;
});

export function getLectures(subject: string): Lecture[] {
  return readCollection(subject, "lectures") as Lecture[];
}

export function getSections(subject: string): Section[] {
  return readCollection(subject, "sections") as Section[];
}

export function getLecture(subject: string, slug: string): Lecture | undefined {
  return getLectures(subject).find((item) => item.slug === slug);
}

export function getSection(subject: string, slug: string): Section | undefined {
  return getSections(subject).find((item) => item.slug === slug);
}

export function getCollection(subject: string, collection: Collection): ResourceItem[] {
  return readCollection(subject, collection);
}

/** Previous/next item within the same collection only. */
export function getNeighbors(subject: string, collection: Collection, slug: string) {
  const items = readCollection(subject, collection);
  const index = items.findIndex((item) => item.slug === slug);
  return {
    previous: index > 0 ? items[index - 1] : undefined,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : undefined,
  };
}

export function itemHref(item: Pick<ResourceItem, "subject" | "collection" | "slug">): string {
  return `/subjects/${item.subject}/${item.collection}/${item.slug}/`;
}

/** Public URL of a file from ../materials (copied into public/materials by scripts/sync-materials.mjs). */
export function materialHref(subject: Subject, file: string, pages?: string): string {
  const encoded = [subject.slug, ...file.split("/")].map(encodeURIComponent).join("/");
  const firstPage = pages ? /\d+/.exec(pages)?.[0] : undefined;
  return `/materials/${encoded}${firstPage ? `#page=${firstPage}` : ""}`;
}

export function formatNumber(n: number): string {
  return String(n).padStart(2, "0");
}
