import { z } from "zod";

/*
 * Lectures and sections have separate schemas. Both belong to a subject (derived from the
 * folder they live in), and neither can reference the other: the schemas are strict, so a
 * stray `lecture:` or `section:` field in frontmatter fails the build.
 */

const sourceRef = z
  .object({
    /** Path relative to the subject's folder in ../materials, e.g. "Lectures/AI Lec 1.pdf" */
    file: z.string(),
    label: z.string().optional(),
    pages: z.string().optional(),
  })
  .strict();

const bookRef = z
  .object({
    /** Must match a book `id` in the subject's subject.json */
    book: z.string(),
    chapter: z.string(),
    pages: z.string().optional(),
  })
  .strict();

const resourceFields = {
  number: z.number().int().nonnegative(),
  title: z.string().min(1),
  summary: z.string().min(1),
  topics: z.array(z.string()).default([]),
  duration: z.string().optional(),
  sources: z.array(sourceRef).default([]),
  bookRefs: z.array(bookRef).default([]),
  draft: z.boolean().default(false),
};

export const lectureSchema = z.object(resourceFields).strict();

export const sectionSchema = z
  .object({
    ...resourceFields,
    kind: z.enum(["lab", "practical", "concept"]).default("lab"),
  })
  .strict();

export const subjectSchema = z
  .object({
    title: z.string(),
    shortTitle: z.string(),
    code: z.string(),
    order: z.number().int(),
    /** Folder name of this subject inside ../materials */
    materialsDir: z.string(),
    tagline: z.string(),
    description: z.string(),
    level: z.string().optional(),
    instructors: z.array(z.string()).default([]),
    objectives: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    grading: z
      .array(z.object({ label: z.string(), weight: z.number() }).strict())
      .default([]),
    books: z
      .array(
        z
          .object({
            id: z.string(),
            title: z.string(),
            author: z.string().optional(),
            /** Book PDFs are cited, never published (copyright); this is for local reference only */
            file: z.string().optional(),
            chapters: z
              .array(z.object({ title: z.string(), pages: z.string().optional() }).strict())
              .default([]),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

export type LectureFrontmatter = z.infer<typeof lectureSchema>;
export type SectionFrontmatter = z.infer<typeof sectionSchema>;
export type SubjectData = z.infer<typeof subjectSchema>;
export type SourceRef = z.infer<typeof sourceRef>;
export type BookRef = z.infer<typeof bookRef>;
