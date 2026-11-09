import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { z } from "zod";
import { qaDrillSchema, type QaDrill } from "./qa-schema";

const SUBJECTS_DIR = path.join(process.cwd(), "content", "subjects");

/** The subject's Q&A drills (content/subjects/<subject>/qa/*.json), in `order`. */
export const getDrills = cache((subject: string): QaDrill[] => {
  const dir = path.join(SUBJECTS_DIR, subject, "qa");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const slug = file.replace(/\.json$/, "");
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = qaDrillSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`Invalid Q&A drill ${subject}/qa/${file}:\n${z.prettifyError(parsed.error)}`);
      }
      const data = parsed.data;
      data.banks.forEach((bank) =>
        bank.questions.forEach((q, i) => {
          const bad =
            q.kind === "mcq"
              ? q.answer >= q.options.length
              : q.items.some((item) => item.category >= q.categories.length);
          if (bad) throw new Error(`Bad answer key in ${subject}/qa/${file}: ${bank.id} question ${i + 1}`);
        }),
      );
      const questionCount = data.banks.reduce((n, bank) => n + bank.questions.length, 0);
      return { ...data, slug, subject, questionCount };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
});

export function getDrill(subject: string, slug: string): QaDrill | undefined {
  return getDrills(subject).find((drill) => drill.slug === slug);
}
