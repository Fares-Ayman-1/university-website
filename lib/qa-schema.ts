import { z } from "zod";

/*
 * Q&A drills: content/subjects/<subject>/qa/<drill>.json, written by `npm run import:qa`
 * from a standalone drill HTML file. Client-safe (types only; the loader is lib/qa.ts).
 */

const mcqSchema = z.object({
  kind: z.literal("mcq"),
  /** Shown on the card, e.g. "Chapter 2a" or "Dr. Shadia · Nov 2025" */
  group: z.string(),
  text: z.string(),
  image: z.string().optional(),
  alt: z.string().optional(),
  options: z.array(z.string()).min(2).max(5),
  /** Index into options */
  answer: z.number().int().nonnegative(),
  why: z.string().optional(),
  ref: z.string().optional(),
  /** The answer is worth double-checking */
  check: z.boolean().optional(),
});

const sortSchema = z.object({
  kind: z.literal("sort"),
  group: z.string(),
  text: z.string(),
  categories: z.array(z.string()).min(2),
  items: z.array(z.object({ text: z.string(), category: z.number().int().nonnegative() })).min(1),
  why: z.string().optional(),
  ref: z.string().optional(),
});

export const qaQuestionSchema = z.discriminatedUnion("kind", [mcqSchema, sortSchema]);

export const qaDrillSchema = z.object({
  /** The drill's own <title>, e.g. "OS Midterm Drill" */
  title: z.string(),
  kicker: z.string(),
  heading: z.string(),
  lede: z.string(),
  foot: z.string(),
  /** Accessible name of the bank tabs, e.g. "Exams" */
  banksLabel: z.string(),
  /** Plural word for a bank in the totals line: "exams", "chapters", "papers", "banks" */
  unit: z.string(),
  order: z.number().default(0),
  /** The HTML file it was imported from */
  source: z.string(),
  banks: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        tag: z.string(),
        name: z.string(),
        scope: z.string(),
        questions: z.array(qaQuestionSchema).min(1),
      }),
    )
    .min(1),
});

export type QaQuestion = z.infer<typeof qaQuestionSchema>;
export type QaMcq = z.infer<typeof mcqSchema>;
export type QaSort = z.infer<typeof sortSchema>;
export type QaDrillData = z.infer<typeof qaDrillSchema>;
export type QaBank = QaDrillData["banks"][number];
export type QaDrill = QaDrillData & { slug: string; subject: string; questionCount: number };
