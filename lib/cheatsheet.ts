import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { extractHeadings, type Heading } from "./content";

/*
 * The Cheat sheet tab: content/subjects/<subject>/cheatsheet/NN-<slug>.mdx, one file per
 * lecture, shown in `lecture` order on /subjects/<subject>/cheatsheet/. Each part is ordinary
 * bilingual MDX (KaTeX, tables, Callouts, calculator widgets) and uses ### headings, since
 * the page puts the lecture's own title in an <h2>.
 */

const SUBJECTS_DIR = path.join(process.cwd(), "content", "subjects");

const frontmatterSchema = z
  .object({
    lecture: z.number().int().positive(),
    title: z.string().min(1),
    titleAr: z.string().min(1),
  })
  .strict();

export type CheatsheetPart = z.infer<typeof frontmatterSchema> & {
  subject: string;
  slug: string;
  /** Anchor of the part on the page: "lecture-3" */
  id: string;
  body: string;
  headings: Heading[];
};

export const getCheatsheet = cache((subject: string): CheatsheetPart[] => {
  const dir = path.join(SUBJECTS_DIR, subject, "cheatsheet");
  if (!fs.existsSync(dir)) return [];
  const parts = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = frontmatterSchema.safeParse(data);
      if (!parsed.success) throw new Error(`Invalid cheat sheet ${subject}/cheatsheet/${file}:\n${z.prettifyError(parsed.error)}`);
      return {
        ...parsed.data,
        subject,
        slug: file.replace(/\.mdx$/, "").replace(/^\d+[-_]/, ""),
        id: `lecture-${parsed.data.lecture}`,
        body: content,
        headings: extractHeadings(content),
      };
    })
    .sort((a, b) => a.lecture - b.lecture);
  const numbers = parts.map((p) => p.lecture);
  const dupe = numbers.find((n, i) => numbers.indexOf(n) !== i);
  if (dupe !== undefined) throw new Error(`Cheat sheet ${subject}: two parts for lecture ${dupe}`);
  return parts;
});
